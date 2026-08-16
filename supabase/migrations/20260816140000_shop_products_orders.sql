-- Shop — physical products bought on a member's own phone, collected at the
-- counter. No POS terminal and no card reader: Stripe Checkout runs in the
-- member's browser (card-not-present), exactly like create-subscription-checkout
-- and buy-worksheet already do.
--
-- The interesting problem is not payment, it is FULFILMENT. A Stripe receipt
-- is not a collection token: a screenshot can be reused, a refunded payment
-- looks identical to a paid one, and eyeballing the Stripe dashboard leaves no
-- record of who actually collected what. So every paid order gets:
--
--   * a short unambiguous pickup_code the member shows at the counter
--   * a status that moves paid -> collected exactly once
--
-- Once collected, the code is spent. Showing the same screenshot again reads
-- "COLLECTED" with a timestamp.

-- ---------------------------------------------------------------------------
-- shop_products — the catalogue behind the public /shop page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  -- Price is held here (not only in Stripe) so staff can add a product without
  -- touching the Stripe dashboard. The edge function builds price_data from it,
  -- unless stripe_price_id is set, in which case that Price wins.
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'nzd',
  stripe_price_id text,
  category text,
  -- 'counter'  — we hand it over ourselves
  -- 'partner'  — a third party makes it and a runner collects it (e.g. Tank).
  --              Reselling someone else's food carries allergen and refund
  --              responsibilities; this column marks which orders are affected.
  fulfilment text NOT NULL DEFAULT 'counter'
    CHECK (fulfilment IN ('counter','partner')),
  partner_name text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shop_products_active_idx
  ON public.shop_products (is_active, sort_order);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_shop_products_updated_at
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anyone may browse the active catalogue — /shop is a public page.
DROP POLICY IF EXISTS "shop_products_read_active" ON public.shop_products;
CREATE POLICY "shop_products_read_active" ON public.shop_products
  FOR SELECT USING (
    is_active
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );

DROP POLICY IF EXISTS "shop_products_staff_manage" ON public.shop_products;
CREATE POLICY "shop_products_staff_manage" ON public.shop_products
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- ---------------------------------------------------------------------------
-- shop_orders — one row per paid Checkout session. Written ONLY by the Stripe
-- webhook (service role bypasses RLS). There is deliberately no INSERT policy:
-- a member cannot conjure an order without paying for it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.shop_products(id) ON DELETE SET NULL,
  -- Snapshot of what was actually bought, so renaming or repricing a product
  -- later never rewrites the history of an order already placed.
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  amount_total_cents integer NOT NULL CHECK (amount_total_cents >= 0),
  currency text NOT NULL DEFAULT 'nzd',
  fulfilment text NOT NULL DEFAULT 'counter'
    CHECK (fulfilment IN ('counter','partner')),
  partner_name text,
  -- DEFAULT is attached below, once generate_pickup_code() exists (it needs to
  -- read this table to check for collisions, so the two are mutually
  -- referential and must be created in this order).
  pickup_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'paid'
    CHECK (status IN ('paid','collected','refunded','cancelled')),
  collected_at timestamptz,
  collected_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Stripe idempotency: the webhook can be delivered more than once.
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  -- Which session was running when they ordered — lets a runner batch a
  -- partner order and hand it over as that session ends.
  scheduled_session_id uuid REFERENCES public.scheduled_sessions(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Pickup codes. Short enough to read across a counter, long enough not to
-- collide, and drawn from an alphabet with no 0/O or 1/I/L confusion.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_pickup_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  alphabet CONSTANT text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';  -- no 0 O 1 I L
  candidate text;
  i integer;
BEGIN
  -- 31^5 ≈ 28.6M combinations; retry on the rare collision.
  FOR attempt IN 1..40 LOOP
    candidate := '';
    FOR i IN 1..5 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    IF NOT EXISTS (SELECT 1 FROM public.shop_orders WHERE pickup_code = candidate) THEN
      RETURN candidate;
    END IF;
  END LOOP;
  RAISE EXCEPTION 'Could not allocate a unique pickup code';
END;
$$;

ALTER TABLE public.shop_orders
  ALTER COLUMN pickup_code SET DEFAULT public.generate_pickup_code();

CREATE INDEX IF NOT EXISTS shop_orders_profile_idx  ON public.shop_orders (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_orders_status_idx   ON public.shop_orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS shop_orders_pickup_idx   ON public.shop_orders (pickup_code);
CREATE INDEX IF NOT EXISTS shop_orders_session_idx  ON public.shop_orders (scheduled_session_id);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_shop_orders_updated_at
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Read: your own orders; staff read all.
DROP POLICY IF EXISTS "shop_orders_read_own" ON public.shop_orders;
CREATE POLICY "shop_orders_read_own" ON public.shop_orders
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- Update: the owner may mark their own order collected (they tap "Collected"
-- in front of the counter — no staff hardware needed); staff may collect any.
-- The trigger below is what actually constrains *what* they can change.
DROP POLICY IF EXISTS "shop_orders_collect" ON public.shop_orders;
CREATE POLICY "shop_orders_collect" ON public.shop_orders
  FOR UPDATE USING (
    profile_id = public.current_profile_id()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- ---------------------------------------------------------------------------
-- The redemption guard. Without this, the UPDATE policy above would let a
-- member rewrite their own price, un-refund an order, or re-open a collected
-- one and pick it up twice. Service role (the webhook) bypasses.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_shop_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- A spent code is spent. Without this, re-submitting a collected order
  -- succeeds as a no-op (the transition check below only fires when the status
  -- actually changes), so a re-used screenshot would return success and a UI
  -- could show "collected" a second time. Only a 'paid' order is touchable.
  IF OLD.status <> 'paid' THEN
    RAISE EXCEPTION 'Order % is already %', OLD.pickup_code, OLD.status;
  END IF;

  -- Money, identity and provenance are immutable from the client.
  IF NEW.id                    IS DISTINCT FROM OLD.id
     OR NEW.profile_id         IS DISTINCT FROM OLD.profile_id
     OR NEW.product_id         IS DISTINCT FROM OLD.product_id
     OR NEW.product_name       IS DISTINCT FROM OLD.product_name
     OR NEW.unit_price_cents   IS DISTINCT FROM OLD.unit_price_cents
     OR NEW.quantity           IS DISTINCT FROM OLD.quantity
     OR NEW.amount_total_cents IS DISTINCT FROM OLD.amount_total_cents
     OR NEW.currency           IS DISTINCT FROM OLD.currency
     OR NEW.pickup_code        IS DISTINCT FROM OLD.pickup_code
     OR NEW.stripe_session_id  IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.stripe_payment_intent IS DISTINCT FROM OLD.stripe_payment_intent
     OR NEW.created_at         IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only the collection state of an order may be changed';
  END IF;

  -- The only transition a client may make is paid -> collected, once.
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (OLD.status = 'paid' AND NEW.status = 'collected') THEN
      RAISE EXCEPTION 'Order status cannot move from % to %', OLD.status, NEW.status;
    END IF;
    NEW.collected_at := now();
    NEW.collected_by := public.current_profile_id();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_shop_order_update ON public.shop_orders;
CREATE TRIGGER guard_shop_order_update
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_shop_order_update();
