-- NFC Bracelet add-on: Founding-100 entitlements, bracelet product, household
-- invitations captured at membership checkout.
--
-- Business rules implemented here:
--   * The promotion covers the first 100 UNIQUE member email addresses
--     (primary account holders, additional adults, teens with logins).
--     Children without logins are never counted.
--   * One lifetime free bracelet per email. Hard cap: 100 free bracelets.
--   * A reservation is created when a membership checkout starts, becomes
--     ALLOCATED when the payment is confirmed by the webhook, and is RELEASED
--     if the checkout expires or the payment fails — so failed checkouts never
--     permanently consume a founding place.
--   * Concurrency: every cap check runs under a transaction-scoped advisory
--     lock, and the partial unique index below makes double entitlement
--     impossible even if two transactions race past the count check.
--
-- Follows the shop_inventory_reservations pattern (reserve on checkout
-- creation, convert/release from stripe-webhook keyed on the session id).

-- ─── 1. Entitlement ledger ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.founding_bracelets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_norm text NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  session_key text,
  seat_number integer CHECK (seat_number IS NULL OR (seat_number >= 1 AND seat_number <= 100)),
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'allocated', 'claimed', 'released')),
  source text NOT NULL DEFAULT 'checkout'
    CHECK (source IN ('checkout', 'backfill', 'standalone')),
  reserved_at timestamptz NOT NULL DEFAULT now(),
  allocated_at timestamptz,
  claimed_at timestamptz,
  bracelet_order_id uuid REFERENCES public.shop_orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One LIVE entitlement per person, enforced at the database level. Released
-- rows stay for audit but no longer block the email (they can never re-consume
-- a seat: reservations are only ever created for emails with no live row).
CREATE UNIQUE INDEX IF NOT EXISTS founding_bracelets_email_live
  ON public.founding_bracelets (email_norm)
  WHERE status IN ('reserved', 'allocated', 'claimed');

CREATE INDEX IF NOT EXISTS founding_bracelets_session_idx
  ON public.founding_bracelets (session_key);
CREATE INDEX IF NOT EXISTS founding_bracelets_status_idx
  ON public.founding_bracelets (status);
CREATE INDEX IF NOT EXISTS founding_bracelets_profile_idx
  ON public.founding_bracelets (profile_id);

CREATE TRIGGER update_founding_bracelets_updated_at
  BEFORE UPDATE ON public.founding_bracelets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 2. Cap-guarded RPCs (service role only) ────────────────────────────────

-- Reserve a founding seat for one email against a checkout session.
-- Returns the entitlement row, or NULL when the email is not entitled
-- (cap exhausted). Idempotent per email: an email that already holds a live
-- entitlement returns its existing row instead of consuming a second seat.
CREATE OR REPLACE FUNCTION public.founding_bracelet_reserve(
  p_email text,
  p_profile_id uuid DEFAULT NULL,
  p_household_id uuid DEFAULT NULL,
  p_session_key text DEFAULT NULL
)
RETURNS public.founding_bracelets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm text;
  v_existing public.founding_bracelets;
  v_live_count integer;
  v_row public.founding_bracelets;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'service role required';
  END IF;

  v_norm := lower(trim(COALESCE(p_email, '')));
  IF v_norm = '' OR position('@' in v_norm) = 0 THEN
    RETURN NULL;
  END IF;

  -- Serialise every cap check + insert. The partial unique index is the
  -- second line of defence if this lock is ever bypassed.
  PERFORM pg_advisory_xact_lock(hashtext('founding_bracelet_cap'));

  SELECT * INTO v_existing
  FROM public.founding_bracelets
  WHERE email_norm = v_norm
    AND status IN ('reserved', 'allocated', 'claimed')
  FOR UPDATE;

  IF FOUND THEN
    -- Already entitled (reserved earlier in this checkout, or allocated from
    -- a previous membership). Never consume a second seat for the same person.
    RETURN v_existing;
  END IF;

  SELECT count(*) INTO v_live_count
  FROM public.founding_bracelets
  WHERE status IN ('reserved', 'allocated', 'claimed');

  IF v_live_count >= 100 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.founding_bracelets
    (email_norm, profile_id, household_id, session_key, seat_number, status, source)
  VALUES
    (v_norm, p_profile_id, p_household_id, p_session_key, v_live_count + 1, 'reserved', 'checkout')
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Confirm every reservation made against a checkout session (payment succeeded).
CREATE OR REPLACE FUNCTION public.founding_bracelet_finalize(p_session_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'service role required';
  END IF;

  UPDATE public.founding_bracelets
  SET status = 'allocated', allocated_at = now()
  WHERE session_key = p_session_key AND status = 'reserved';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Release every reservation made against a checkout session that expired or
-- failed to pay. The seat becomes available again; released rows remain for
-- audit but hold no entitlement.
CREATE OR REPLACE FUNCTION public.founding_bracelet_release(p_session_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'service role required';
  END IF;

  UPDATE public.founding_bracelets
  SET status = 'released'
  WHERE session_key = p_session_key AND status = 'reserved';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Claim the free bracelet for an allocated entitlement. Locks the row, only
-- transitions allocated -> claimed, and records the bracelet order. Returns
-- the row on success, NULL if there is nothing claimable (already claimed,
-- never allocated, or lost a race) — callers must treat NULL as "charge $5".
CREATE OR REPLACE FUNCTION public.founding_bracelet_claim(
  p_email text,
  p_order_id uuid DEFAULT NULL
)
RETURNS public.founding_bracelets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm text;
  v_row public.founding_bracelets;
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'service role required';
  END IF;

  v_norm := lower(trim(COALESCE(p_email, '')));
  IF v_norm = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row
  FROM public.founding_bracelets
  WHERE email_norm = v_norm AND status = 'allocated'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE public.founding_bracelets
  SET status = 'claimed',
      claimed_at = now(),
      bracelet_order_id = COALESCE(p_order_id, bracelet_order_id)
  WHERE id = v_row.id;

  v_row.status := 'claimed';
  v_row.claimed_at := now();
  v_row.bracelet_order_id := COALESCE(p_order_id, v_row.bracelet_order_id);
  RETURN v_row;
END;
$$;

-- Minimal eligibility probe used by checkout UIs. Returns jsonb:
--   { "state": "free" | "reserved" | "allocated" | "claimed" | "exhausted",
--     "seat_number": int|null, "remaining": int }
-- Deliberately reveals nothing beyond the caller-supplied email's own state.
CREATE OR REPLACE FUNCTION public.founding_bracelet_lookup(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm text;
  v_live_count integer;
  v_row public.founding_bracelets;
BEGIN
  v_norm := lower(trim(COALESCE(p_email, '')));
  IF v_norm = '' OR position('@' in v_norm) = 0 THEN
    RETURN jsonb_build_object('state', 'invalid', 'remaining', 0);
  END IF;

  SELECT count(*) INTO v_live_count
  FROM public.founding_bracelets
  WHERE status IN ('reserved', 'allocated', 'claimed');

  SELECT * INTO v_row
  FROM public.founding_bracelets
  WHERE email_norm = v_norm
    AND status IN ('reserved', 'allocated', 'claimed');

  IF FOUND THEN
    RETURN jsonb_build_object(
      'state', v_row.status,
      'seat_number', v_row.seat_number,
      'remaining', GREATEST(0, 100 - v_live_count)
    );
  END IF;

  IF v_live_count >= 100 THEN
    RETURN jsonb_build_object('state', 'exhausted', 'remaining', 0);
  END IF;

  RETURN jsonb_build_object('state', 'free', 'remaining', GREATEST(0, 100 - v_live_count));
END;
$$;

REVOKE ALL ON FUNCTION public.founding_bracelet_reserve(text, uuid, uuid, text) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.founding_bracelet_reserve(text, uuid, uuid, text) TO service_role;
REVOKE ALL ON FUNCTION public.founding_bracelet_finalize(text) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.founding_bracelet_finalize(text) TO service_role;
REVOKE ALL ON FUNCTION public.founding_bracelet_release(text) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.founding_bracelet_release(text) TO service_role;
REVOKE ALL ON FUNCTION public.founding_bracelet_claim(text, uuid) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.founding_bracelet_claim(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.founding_bracelet_lookup(text) TO authenticated, service_role;

-- ─── 3. RLS ─────────────────────────────────────────────────────────────────

ALTER TABLE public.founding_bracelets ENABLE ROW LEVEL SECURITY;

-- Members see only their own entitlement; staff (admin/commerce roles) see all.
CREATE POLICY founding_bracelets_read_own ON public.founding_bracelets
  FOR SELECT TO authenticated
  USING (
    profile_id = public.current_profile_id()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_any_commerce_role(auth.uid())
  );

GRANT SELECT ON public.founding_bracelets TO authenticated;

-- ─── 4. Recipient on order lines ────────────────────────────────────────────
-- Each bracelet line records the intended member (profile/email) so the order
-- is auditable and fulfilment knows who the bracelet belongs to.

ALTER TABLE public.shop_order_items
  ADD COLUMN IF NOT EXISTS recipient jsonb;

-- ─── 5. Household invitations captured at membership checkout ──────────────
-- The payer names additional adults / teens (name + email) during checkout.
-- After activation those emails land here as pending invites; the existing
-- invite flow (invite-teen / PortalFamily) links them to the household and
-- marks the invitation accepted. No competing account system.

CREATE TABLE IF NOT EXISTS public.household_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  email_norm text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'adult' CHECK (tier IN ('adult', 'teen')),
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS household_invitations_live
  ON public.household_invitations (household_id, email_norm)
  WHERE status = 'pending';

ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY household_invitations_read_household ON public.household_invitations
  FOR SELECT TO authenticated
  USING (public.is_household_member(household_id) OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.household_invitations TO authenticated;

-- ─── 6. Bracelet product ────────────────────────────────────────────────────
-- Members-only is enforced server-side in create-shop-checkout via the
-- 'members-only' tag (plus UI gating); counter fulfilment like other
-- collect-at-the-desk products.

INSERT INTO public.shop_products (
  slug, name, tagline, description, long_description,
  price_cents, currency, category, fulfilment, status, sku,
  tags, track_stock, sort_order, featured
) VALUES (
  'nfc-bracelet',
  'MINDCAST NFC Bracelet',
  'Tap to open your MINDCAST experience',
  'Your personal MINDCAST bracelet. Tap it to open your MINDCAST experience — your pass, your portal, quick access at the door.',
  'Every MINDCAST member has their own bracelet token. Wear it, tap it, and your MINDCAST experience opens — at the door, on your phone, anywhere. Bracelets belong to individual members with their own login.',
  500, 'nzd', 'member', 'counter', 'active', 'MC-BRACELET-01',
  ARRAY['members-only', 'nfc'], false, 5, false
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_cents = EXCLUDED.price_cents,
  status = 'active',
  tags = EXCLUDED.tags,
  category = EXCLUDED.category,
  fulfilment = EXCLUDED.fulfilment;

-- ─── 7. Backfill: existing members count chronologically ───────────────────
-- Legitimate members already active when this promotion launches keep their
-- chronological place in the first 100 (ordered by profile created_at).
-- Children without logins are excluded. Only emails that exist are counted.

DO $$
DECLARE
  v_profile record;
  v_live_count integer;
BEGIN
  FOR v_profile IN
    SELECT p.id AS profile_id,
           lower(trim(COALESCE(NULLIF(trim(p.email), ''), u.email))) AS email_norm,
           p.created_at
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.user_id
    WHERE p.membership_status IN ('active', 'trialing')
      AND lower(COALESCE(p.age_group, 'adult')) NOT IN ('child', 'children', 'kids', 'kid', 'little_ones')
      AND COALESCE(NULLIF(trim(p.email), ''), u.email) IS NOT NULL
    ORDER BY p.created_at ASC, p.id ASC
  LOOP
    SELECT count(*) INTO v_live_count
    FROM public.founding_bracelets
    WHERE status IN ('reserved', 'allocated', 'claimed');
    EXIT WHEN v_live_count >= 100;

    INSERT INTO public.founding_bracelets
      (email_norm, profile_id, seat_number, status, source, allocated_at)
    VALUES
      (v_profile.email_norm, v_profile.profile_id, v_live_count + 1, 'allocated', 'backfill', now())
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;
