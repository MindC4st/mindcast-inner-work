-- Phase 1b — recurring membership billing (Stripe subscriptions).
--
-- Today the only paid flow is a ONE-TIME pilot Checkout. This adds the schema
-- for recurring monthly/termly membership: a subscriptions table that the
-- Stripe webhook (service role) keeps in sync, plus a denormalised
-- membership_status mirrored onto profiles for cheap gating in the app.

-- ---------------------------------------------------------------------------
-- profiles: membership mirror + Stripe customer link
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'none'
    CHECK (membership_status IN ('active','trialing','past_due','lapsed','paused','none')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- ---------------------------------------------------------------------------
-- subscriptions — one row per Stripe subscription. Written ONLY by the webhook
-- (service role bypasses RLS); members/admins read.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The payer's profile (the guardian/adult who owns the billing).
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Household covered by this subscription (household billing: one payer,
  -- many linked child profiles). Nullable for a solo adult membership.
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  status text NOT NULL,                       -- raw Stripe status
  plan text,                                  -- 'monthly' | 'termly'
  price_id text,
  quantity integer NOT NULL DEFAULT 1,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_profile_idx   ON public.subscriptions (profile_id);
CREATE INDEX IF NOT EXISTS subscriptions_household_idx  ON public.subscriptions (household_id);
CREATE INDEX IF NOT EXISTS subscriptions_customer_idx   ON public.subscriptions (stripe_customer_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Payer or a household member can read the subscription; admins read all.
-- No INSERT/UPDATE/DELETE policy => only the service-role webhook can write.
DROP POLICY IF EXISTS "subscriptions_read_own" ON public.subscriptions;
CREATE POLICY "subscriptions_read_own" ON public.subscriptions
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR (household_id IS NOT NULL AND public.is_household_member(household_id))
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ---------------------------------------------------------------------------
-- Close the self-escalation gap: a member must not be able to set their own
-- membership_status / stripe_customer_id via the profiles UPDATE policy.
-- Extends the existing guard (is_admin/is_active/nfc_id). Service role bypasses.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_admin           IS DISTINCT FROM OLD.is_admin
     OR NEW.is_active       IS DISTINCT FROM OLD.is_active
     OR NEW.nfc_id          IS DISTINCT FROM OLD.nfc_id
     OR NEW.membership_status   IS DISTINCT FROM OLD.membership_status
     OR NEW.stripe_customer_id  IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify privileged profile fields (is_admin, is_active, nfc_id, membership_status, stripe_customer_id).';
  END IF;

  RETURN NEW;
END;
$$;
