-- Commerce platform — extends the existing shop_* tables into a lightweight
-- Shopify-style system: variants, inventory ledger with reservations,
-- separated payment/fulfilment status, order timeline, fulfilments with
-- partial shipping, refunds ledger, discounts, commerce customers,
-- notification log, settings and an audit log.
--
-- Conventions kept from the existing shop:
--   * money is integer cents (4400 = $44.00), NZD, GST inclusive
--   * orders are written ONLY by the Stripe webhook / service-role functions
--   * the pickup-code guard trigger on shop_orders is untouched
--
-- Role hierarchy helpers encode: admin > commerce_admin > fulfilment/support.

-- ── Role helpers ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_commerce_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
      OR public.has_role(_user_id, 'commerce_admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.has_fulfilment_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
      OR public.has_role(_user_id, 'commerce_admin'::app_role)
      OR public.has_role(_user_id, 'fulfilment'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.has_support_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
      OR public.has_role(_user_id, 'commerce_admin'::app_role)
      OR public.has_role(_user_id, 'support'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.has_any_commerce_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_commerce_admin(_user_id)
      OR public.has_fulfilment_role(_user_id)
      OR public.has_support_role(_user_id);
$$;

-- ── Products: status, SKU, costing, inventory config ──────────────────────
ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','archived')),
  ADD COLUMN IF NOT EXISTS sku text UNIQUE,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS cost_price_cents integer CHECK (cost_price_cents IS NULL OR cost_price_cents >= 0),
  ADD COLUMN IF NOT EXISTS compare_at_price_cents integer CHECK (compare_at_price_cents IS NULL OR compare_at_price_cents >= 0),
  ADD COLUMN IF NOT EXISTS gst_treatment text NOT NULL DEFAULT 'inclusive'
    CHECK (gst_treatment IN ('inclusive','exclusive','exempt')),
  ADD COLUMN IF NOT EXISTS weight_g integer CHECK (weight_g IS NULL OR weight_g >= 0),
  ADD COLUMN IF NOT EXISTS dimensions_mm text,
  ADD COLUMN IF NOT EXISTS materials text,
  ADD COLUMN IF NOT EXISTS track_stock boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  ADD COLUMN IF NOT EXISTS allow_backorder boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_alt text;

-- Keep the legacy is_active flag in lockstep with status so existing policies
-- and the public catalogue query keep working unchanged.
CREATE OR REPLACE FUNCTION public.shop_products_status_sync()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.is_active := (NEW.status = 'active');
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS shop_products_status_sync ON public.shop_products;
CREATE TRIGGER shop_products_status_sync
  BEFORE INSERT OR UPDATE OF status ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.shop_products_status_sync();

-- ── Variants ───────────────────────────────────────────────────────────────
-- Every sellable product has at least one variant (a "Default" variant for
-- products with no options). Inventory lives on variants, never products.
CREATE TABLE IF NOT EXISTS public.shop_product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.shop_products(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default',
  sku text UNIQUE,
  option_values text,
  price_override_cents integer CHECK (price_override_cents IS NULL OR price_override_cents >= 0),
  cost_price_cents integer CHECK (cost_price_cents IS NULL OR cost_price_cents >= 0),
  -- Materialised stock. Every change goes through shop_adjust_stock(), which
  -- locks the row and writes the matching ledger movement — the ledger is the
  -- history, this column is the fast current value.
  stock_available integer NOT NULL DEFAULT 0,
  weight_g integer CHECK (weight_g IS NULL OR weight_g >= 0),
  allow_backorder boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_product_variants_product_idx
  ON public.shop_product_variants (product_id, sort_order);
CREATE TRIGGER update_shop_product_variants_updated_at
  BEFORE UPDATE ON public.shop_product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Inventory ledger + reservations ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.shop_product_variants(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.shop_orders(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN (
    'received_stock','sale','cancelled_order_return','customer_return',
    'manual_adjustment','damaged','missing','stocktake_adjustment')),
  quantity_change integer NOT NULL,           -- signed
  reason text,
  note text,
  actor uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_inventory_movements_variant_idx
  ON public.shop_inventory_movements (variant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_inventory_movements_order_idx
  ON public.shop_inventory_movements (order_id);

CREATE TABLE IF NOT EXISTS public.shop_inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.shop_product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  session_key text NOT NULL,                  -- Stripe Checkout session id
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','converted','released')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '60 minutes'
);
CREATE INDEX IF NOT EXISTS shop_inventory_reservations_variant_idx
  ON public.shop_inventory_reservations (variant_id, state);
CREATE INDEX IF NOT EXISTS shop_inventory_reservations_key_idx
  ON public.shop_inventory_reservations (session_key);

-- Adjust stock atomically and write the ledger row. Row lock prevents two
-- concurrent adjustments (two final-unit purchases) from racing past zero.
CREATE OR REPLACE FUNCTION public.shop_adjust_stock(
  p_variant_id uuid,
  p_delta integer,
  p_type text,
  p_reason text DEFAULT NULL,
  p_order_id uuid DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_actor uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_track boolean;
  v_backorder boolean;
  v_new integer;
BEGIN
  SELECT track_stock, allow_backorder INTO v_track, v_backorder
  FROM public.shop_products p
  JOIN public.shop_product_variants v ON v.product_id = p.id
  WHERE v.id = p_variant_id
  FOR UPDATE OF v;                            -- wait, lock the variant row
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant not found';
  END IF;

  UPDATE public.shop_product_variants v
     SET stock_available = stock_available + p_delta
   WHERE v.id = p_variant_id
  RETURNING stock_available INTO v_new;

  IF v_track AND NOT v_backorder AND v_new < 0 THEN
    RAISE EXCEPTION 'insufficient_stock' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.shop_inventory_movements
    (variant_id, order_id, type, quantity_change, reason, note, actor)
  VALUES (p_variant_id, p_order_id, p_type, p_delta, p_reason, p_note, p_actor);
END;
$$;

-- Reserve stock when a checkout starts. Fails with 'insufficient_stock' when
-- the remaining available (stock minus active reservations) can't cover it —
-- two people buying the final unit cannot both reserve it.
CREATE OR REPLACE FUNCTION public.shop_reserve_stock(
  p_variant_id uuid,
  p_quantity integer,
  p_session_key text,
  p_minutes integer DEFAULT 60
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_track boolean;
  v_backorder boolean;
  v_stock integer;
  v_reserved integer;
BEGIN
  -- Drop stale reservations first so expired checkouts free their stock.
  UPDATE public.shop_inventory_reservations
     SET state = 'released'
   WHERE variant_id = p_variant_id AND state = 'active' AND expires_at < now();

  SELECT p.track_stock, COALESCE(p.allow_backorder, false), v.stock_available
    INTO v_track, v_backorder, v_stock
  FROM public.shop_product_variants v
  JOIN public.shop_products p ON p.id = v.product_id
  WHERE v.id = p_variant_id
  FOR UPDATE OF v;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant not found';
  END IF;

  IF v_track AND NOT v_backorder THEN
    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
    FROM public.shop_inventory_reservations
    WHERE variant_id = p_variant_id AND state = 'active';

    IF v_stock - v_reserved < p_quantity THEN
      RAISE EXCEPTION 'insufficient_stock' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  INSERT INTO public.shop_inventory_reservations (variant_id, quantity, session_key, expires_at)
  VALUES (p_variant_id, p_quantity, p_session_key, now() + make_interval(mins => p_minutes));
END;
$$;

-- Payment confirmed: convert the reservation into committed stock reductions.
CREATE OR REPLACE FUNCTION public.shop_convert_reservation(
  p_session_key text,
  p_order_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id, variant_id, quantity
    FROM public.shop_inventory_reservations
    WHERE session_key = p_session_key AND state = 'active'
    FOR UPDATE
  LOOP
    UPDATE public.shop_inventory_reservations SET state = 'converted' WHERE id = r.id;
    UPDATE public.shop_product_variants
       SET stock_available = stock_available - r.quantity
     WHERE id = r.variant_id;
    INSERT INTO public.shop_inventory_movements
      (variant_id, order_id, type, quantity_change, reason)
    VALUES (r.variant_id, p_order_id, 'sale', -r.quantity, 'Order payment confirmed');
  END LOOP;
END;
$$;

-- Checkout expired / payment failed: release the hold.
CREATE OR REPLACE FUNCTION public.shop_release_reservation(p_session_key text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.shop_inventory_reservations
     SET state = 'released'
   WHERE session_key = p_session_key AND state = 'active';
END;
$$;

-- ── Commerce customers (members AND guests) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS shop_customers_profile_uidx
  ON public.shop_customers (profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS shop_customers_email_idx
  ON public.shop_customers (lower(email));
CREATE TRIGGER update_shop_customers_updated_at
  BEFORE UPDATE ON public.shop_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Orders: payment/fulfilment split, billing, GST, discounts ────────────
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.shop_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('pending','paid','partially_refunded','refunded','failed','cancelled')),
  ADD COLUMN IF NOT EXISTS fulfilment_status text NOT NULL DEFAULT 'unfulfilled'
    CHECK (fulfilment_status IN ('unfulfilled','picking','packed','fulfilled','shipped','delivered','cancelled')),
  ADD COLUMN IF NOT EXISTS customer_first_name text,
  ADD COLUMN IF NOT EXISTS customer_last_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS bill_name text,
  ADD COLUMN IF NOT EXISTS bill_line1 text,
  ADD COLUMN IF NOT EXISTS bill_line2 text,
  ADD COLUMN IF NOT EXISTS bill_city text,
  ADD COLUMN IF NOT EXISTS bill_postcode text,
  ADD COLUMN IF NOT EXISTS bill_country text,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  ADD COLUMN IF NOT EXISTS discount_code text,
  ADD COLUMN IF NOT EXISTS gst_cents integer NOT NULL DEFAULT 0 CHECK (gst_cents >= 0),
  ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0 CHECK (refunded_cents >= 0);

CREATE INDEX IF NOT EXISTS shop_orders_customer_idx ON public.shop_orders (customer_id);
CREATE INDEX IF NOT EXISTS shop_orders_payment_status_idx ON public.shop_orders (payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_orders_fulfilment_status_idx ON public.shop_orders (fulfilment_status, created_at DESC);

-- Order numbers start at MC-100001 per the commerce spec. No orders exist yet
-- (the shop launched with zero), so restarting the sequence is safe.
ALTER SEQUENCE public.shop_order_number_seq RESTART WITH 100001;
ALTER TABLE public.shop_orders
  ALTER COLUMN order_number SET DEFAULT ('MC-' || nextval('public.shop_order_number_seq'::regclass)::text);

-- ── Order items: variant + SKU + GST snapshots ────────────────────────────
ALTER TABLE public.shop_order_items
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES public.shop_product_variants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS gst_cents integer NOT NULL DEFAULT 0 CHECK (gst_cents >= 0);

-- ── Payments ledger (charges and refunds) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('payment','refund')),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'nzd',
  status text NOT NULL DEFAULT 'succeeded',
  stripe_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_payments_order_idx ON public.shop_payments (order_id);

-- ── Refunds ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  reason text,
  items jsonb NOT NULL DEFAULT '[]',          -- [{order_item_id, quantity, amount_cents}]
  restock boolean NOT NULL DEFAULT false,
  stripe_refund_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed')),
  actor uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_refunds_order_idx ON public.shop_refunds (order_id);

-- ── Fulfilments (partial shipping supported) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','shipped','delivered','cancelled')),
  carrier text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_fulfillments_order_idx ON public.shop_fulfillments (order_id);

CREATE TABLE IF NOT EXISTS public.shop_fulfillment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id uuid NOT NULL REFERENCES public.shop_fulfillments(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.shop_order_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS shop_fulfillment_items_f_idx ON public.shop_fulfillment_items (fulfillment_id);

-- ── Immutable order timeline ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name text,                            -- snapshot; NULL actor = SYSTEM
  note text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_order_events_order_idx
  ON public.shop_order_events (order_id, created_at);

CREATE OR REPLACE FUNCTION public.shop_order_events_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Order events are immutable';
END;
$$;
DROP TRIGGER IF EXISTS shop_order_events_immutable ON public.shop_order_events;
CREATE TRIGGER shop_order_events_immutable
  BEFORE UPDATE OR DELETE ON public.shop_order_events
  FOR EACH ROW EXECUTE FUNCTION public.shop_order_events_immutable();

-- ── Discounts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('fixed','percent','free_shipping')),
  value_cents integer NOT NULL DEFAULT 0 CHECK (value_cents >= 0),
  value_percent integer CHECK (value_percent IS NULL OR (value_percent >= 0 AND value_percent <= 100)),
  scope text NOT NULL DEFAULT 'order' CHECK (scope IN ('order','product')),
  product_ids uuid[] NOT NULL DEFAULT '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit > 0),
  times_used integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER update_shop_discounts_updated_at
  BEFORE UPDATE ON public.shop_discounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.shop_discount_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id uuid NOT NULL REFERENCES public.shop_discounts(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (discount_id, order_id)
);

-- ── Notification log ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.shop_orders(id) ON DELETE SET NULL,
  type text NOT NULL,
  recipient text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed')),
  provider_message_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_notification_log_order_idx
  ON public.shop_notification_log (order_id, created_at DESC);

-- ── Settings ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.shop_settings (key, value) VALUES
  ('currency', 'nzd'),
  ('shipping_flat_cents', '800'),
  ('free_shipping_threshold_cents', '12000'),
  ('pickup_enabled', 'true'),
  ('shipping_countries', 'NZ')
ON CONFLICT (key) DO NOTHING;

-- ── Audit log ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shop_audit_log_entity_idx
  ON public.shop_audit_log (entity, entity_id, created_at DESC);

-- No client may rewrite history.
CREATE OR REPLACE FUNCTION public.shop_audit_log_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit history is immutable';
END;
$$;
DROP TRIGGER IF EXISTS shop_audit_log_immutable ON public.shop_audit_log;
CREATE TRIGGER shop_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.shop_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.shop_audit_log_immutable();

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.shop_product_variants      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_inventory_movements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_refunds               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_fulfillments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_fulfillment_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_order_events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_discounts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_discount_redemptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_notification_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_audit_log             ENABLE ROW LEVEL SECURITY;

-- Variants: the storefront needs active variants of active products; staff see all.
DROP POLICY IF EXISTS "shop_variants_read_public" ON public.shop_product_variants;
CREATE POLICY "shop_variants_read_public" ON public.shop_product_variants
  FOR SELECT USING (
    (is_active AND EXISTS (
      SELECT 1 FROM public.shop_products p
      WHERE p.id = product_id AND p.status = 'active'
    ))
    OR public.has_any_commerce_role(auth.uid())
  );

DROP POLICY IF EXISTS "shop_orders_read_commerce" ON public.shop_orders;
CREATE POLICY "shop_orders_read_commerce" ON public.shop_orders
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR public.has_any_commerce_role(auth.uid())
  );

DROP POLICY IF EXISTS "shop_order_items_read_commerce" ON public.shop_order_items;
CREATE POLICY "shop_order_items_read_commerce" ON public.shop_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shop_orders o
      WHERE o.id = order_id
        AND (o.profile_id = public.current_profile_id()
             OR public.has_any_commerce_role(auth.uid()))
    )
  );

-- Staff-facing commerce tables: any commerce role reads; writes stay
-- service-role only (edge functions), so no INSERT/UPDATE policies here.
DROP POLICY IF EXISTS "shop_customers_read_commerce" ON public.shop_customers;
CREATE POLICY "shop_customers_read_commerce" ON public.shop_customers
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_payments_read_commerce" ON public.shop_payments;
CREATE POLICY "shop_payments_read_commerce" ON public.shop_payments
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_refunds_read_commerce" ON public.shop_refunds;
CREATE POLICY "shop_refunds_read_commerce" ON public.shop_refunds
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_fulfillments_read_commerce" ON public.shop_fulfillments;
CREATE POLICY "shop_fulfillments_read_commerce" ON public.shop_fulfillments
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_fulfillment_items_read_commerce" ON public.shop_fulfillment_items;
CREATE POLICY "shop_fulfillment_items_read_commerce" ON public.shop_fulfillment_items
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_order_events_read_commerce" ON public.shop_order_events;
CREATE POLICY "shop_order_events_read_commerce" ON public.shop_order_events
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_discounts_read_commerce" ON public.shop_discounts;
CREATE POLICY "shop_discounts_read_commerce" ON public.shop_discounts
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_discount_redemptions_read_commerce" ON public.shop_discount_redemptions;
CREATE POLICY "shop_discount_redemptions_read_commerce" ON public.shop_discount_redemptions
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_notification_log_read_commerce" ON public.shop_notification_log;
CREATE POLICY "shop_notification_log_read_commerce" ON public.shop_notification_log
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_inventory_movements_read_commerce" ON public.shop_inventory_movements;
CREATE POLICY "shop_inventory_movements_read_commerce" ON public.shop_inventory_movements
  FOR SELECT USING (public.has_any_commerce_role(auth.uid()));

DROP POLICY IF EXISTS "shop_settings_read_staff" ON public.shop_settings;
CREATE POLICY "shop_settings_read_staff" ON public.shop_settings
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_any_commerce_role(auth.uid())
  );

-- Audit history: admin + commerce_admin only, and never editable by anyone.
DROP POLICY IF EXISTS "shop_audit_log_read" ON public.shop_audit_log;
CREATE POLICY "shop_audit_log_read" ON public.shop_audit_log
  FOR SELECT USING (public.has_commerce_admin(auth.uid()));

-- Product management stays with commerce admins; the existing staff ALL
-- policy is replaced by a read policy + admin-only manage.
DROP POLICY IF EXISTS "shop_products_staff_manage" ON public.shop_products;
DROP POLICY IF EXISTS "shop_products_read_active" ON public.shop_products;
CREATE POLICY "shop_products_read_active" ON public.shop_products
  FOR SELECT USING (
    status = 'active'
    OR public.has_any_commerce_role(auth.uid())
  );
CREATE POLICY "shop_products_commerce_manage" ON public.shop_products
  FOR ALL USING (public.has_commerce_admin(auth.uid()))
  WITH CHECK (public.has_commerce_admin(auth.uid()));

-- ── Catalogue: SKUs, status and variants for the launch range ─────────────
UPDATE public.shop_products SET sku = 'MC-PLANNER',      status = 'active' WHERE slug = '13-week-phase-planner';
UPDATE public.shop_products SET sku = 'MC-BINDER',       status = 'active' WHERE slug = 'life-binder';
UPDATE public.shop_products SET sku = 'MC-JOURNAL',      status = 'active' WHERE slug = 'companion-journal';
UPDATE public.shop_products SET sku = 'MC-FRIDGEBOARD',  status = 'active' WHERE slug = 'weekly-practice-fridge-board';
UPDATE public.shop_products SET sku = 'MC-FAMILYBOARD',  status = 'active' WHERE slug = 'family-intention-board';
UPDATE public.shop_products SET sku = 'MC-TILES',         status = 'active' WHERE slug = 'prompt-action-tiles';
UPDATE public.shop_products SET sku = 'MC-FOLIO',         status = 'active' WHERE slug = 'member-folio';
UPDATE public.shop_products SET sku = 'MC-PENS',          status = 'active' WHERE slug = 'pen-set';
UPDATE public.shop_products SET sku = 'MC-HIGHLIGHTERS',  status = 'active' WHERE slug = 'highlighter-set';
UPDATE public.shop_products SET sku = 'MC-BUNDLE-HOME',   status = 'active' WHERE slug = 'home-practice-bundle';

-- Variants. Planner / Binder come in Cream, Blue, Navy; Folio in Navy,
-- Charcoal; everything else gets a Default variant. Stock tracking starts OFF
-- except two demo SKUs so low-stock + reservation logic is testable without
-- blocking real sales before manufacturing lands (see docs/COMMERCE.md).
INSERT INTO public.shop_product_variants (product_id, name, sku, option_values, sort_order)
SELECT p.id, v.name, v.sku, v.opt, v.ord
FROM public.shop_products p
JOIN (VALUES
  ('13-week-phase-planner', 'Cream', 'MC-PLANNER-CRM', 'Cream', 1),
  ('13-week-phase-planner', 'Blue',  'MC-PLANNER-BLU', 'Blue',  2),
  ('13-week-phase-planner', 'Navy',  'MC-PLANNER-NVY', 'Navy',  3),
  ('life-binder',           'Cream', 'MC-BINDER-CRM',  'Cream', 1),
  ('life-binder',           'Blue',  'MC-BINDER-BLU',  'Blue',  2),
  ('life-binder',           'Navy',  'MC-BINDER-NVY',  'Navy',  3),
  ('companion-journal',     'Default','MC-JOURNAL',     NULL,    1),
  ('weekly-practice-fridge-board','Default','MC-FRIDGEBOARD', NULL, 1),
  ('family-intention-board','Default','MC-FAMILYBOARD', NULL,    1),
  ('prompt-action-tiles',   'Default','MC-TILES',       NULL,    1),
  ('member-folio',          'Navy',  'MC-FOLIO-NVY',   'Navy',   1),
  ('member-folio',          'Charcoal','MC-FOLIO-CHR', 'Charcoal',2),
  ('pen-set',               'Default','MC-PENS',        NULL,    1),
  ('highlighter-set',       'Default','MC-HIGHLIGHTERS',NULL,    1),
  ('home-practice-bundle',  'Default','MC-BUNDLE-HOME', NULL,    1)
) AS v(slug, name, sku, opt, ord) ON v.slug = p.slug
ON CONFLICT (sku) DO NOTHING;

-- Demo inventory: pens tracked with healthy stock, highlighters tracked low
-- (threshold 10, stock 8 → low-stock card visible in admin).
UPDATE public.shop_products SET track_stock = true, low_stock_threshold = 20 WHERE slug = 'pen-set';
UPDATE public.shop_products SET track_stock = true, low_stock_threshold = 10 WHERE slug = 'highlighter-set';
UPDATE public.shop_product_variants v SET stock_available = 100
 FROM public.shop_products p WHERE p.id = v.product_id AND p.slug = 'pen-set';
UPDATE public.shop_product_variants v SET stock_available = 8
 FROM public.shop_products p WHERE p.id = v.product_id AND p.slug = 'highlighter-set';

INSERT INTO public.shop_inventory_movements (variant_id, type, quantity_change, reason)
SELECT v.id, 'received_stock', 100, 'Launch seed stock'
FROM public.shop_product_variants v JOIN public.shop_products p ON p.id = v.product_id
WHERE p.slug = 'pen-set'
  AND NOT EXISTS (SELECT 1 FROM public.shop_inventory_movements m WHERE m.variant_id = v.id);
INSERT INTO public.shop_inventory_movements (variant_id, type, quantity_change, reason)
SELECT v.id, 'received_stock', 8, 'Launch seed stock'
FROM public.shop_product_variants v JOIN public.shop_products p ON p.id = v.product_id
WHERE p.slug = 'highlighter-set'
  AND NOT EXISTS (SELECT 1 FROM public.shop_inventory_movements m WHERE m.variant_id = v.id);

-- Verify after db push:
--   SELECT count(*) FROM shop_product_variants;                -- expect 15
--   SELECT sku, stock_available FROM shop_product_variants WHERE sku IN ('MC-PENS','MC-HIGHLIGHTERS');
--   SELECT key, value FROM shop_settings;
