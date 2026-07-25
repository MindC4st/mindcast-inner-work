-- Multi-tier family subscription bundles (Jul 2026).
--
-- Replaces the old single-tier (adult/teen) + kids_addon model with a flexible
-- bundle of adult, teen, and child memberships with a conditional family
-- discount (15% off for 2+ adults + ≥1 teen/child).
--
-- Profiles:
--   membership_tier     now also allows 'child'; remains backward-compat gate
--   membership_bundle   JSON { adults, teens, children } — full bundle shape
--   family_discount     boolean — whether FAMILY15 was applied
--
-- Subscriptions:
--   tier, bundle_adults, bundle_teens, bundle_children, family_discount
--   mirror the bundle composition from subscription metadata.

-- ---------------------------------------------------------------------------
-- 1. Expand profiles.membership_tier CHECK to include 'child'
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_membership_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_membership_tier_check
    CHECK (membership_tier IN ('none', 'adult', 'teen', 'child'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_bundle jsonb
    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS family_discount boolean
    NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- 2. Expand subscriptions to hold bundle composition
-- ---------------------------------------------------------------------------
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text
    DEFAULT 'adult'
    CHECK (tier IN ('adult', 'teen', 'child')),
  ADD COLUMN IF NOT EXISTS bundle_adults integer
    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bundle_teens integer
    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bundle_children integer
    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS family_discount boolean
    NOT NULL DEFAULT false;

-- Drop old CHECK if it only allows 'kids_addon' — replaced with cleaner 'child'
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tier_check
    CHECK (tier IN ('adult', 'teen', 'child'));

-- ---------------------------------------------------------------------------
-- 3. Update the privilege-escalation guard to protect new profile columns
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

  IF NEW.is_admin                IS DISTINCT FROM OLD.is_admin
     OR NEW.is_active            IS DISTINCT FROM OLD.is_active
     OR NEW.nfc_id               IS DISTINCT FROM OLD.nfc_id
     OR NEW.membership_status    IS DISTINCT FROM OLD.membership_status
     OR NEW.membership_tier      IS DISTINCT FROM OLD.membership_tier
     OR NEW.membership_bundle    IS DISTINCT FROM OLD.membership_bundle
     OR NEW.family_discount      IS DISTINCT FROM OLD.family_discount
     OR NEW.kids_addon           IS DISTINCT FROM OLD.kids_addon
     OR NEW.stripe_customer_id   IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify privileged profile fields (is_admin, is_active, nfc_id, membership_status, membership_tier, membership_bundle, family_discount, kids_addon, stripe_customer_id).';
  END IF;

  RETURN NEW;
END;
$$;
