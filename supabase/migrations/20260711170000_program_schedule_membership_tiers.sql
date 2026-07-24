-- Program schedule + membership tiers.
--
-- Replaces per-week manual scheduling with a single program START DATE (the
-- first Sunday = lesson 1). Every week N then unlocks automatically at 09:30 in
-- the program timezone on its Sunday, and STAYS open thereafter so Life Groups
-- can reference back. Also adds membership tiers so access can be gated per
-- track (adult / teen) with an optional kids add-on.

-- ---------------------------------------------------------------------------
-- 1. app_settings — tiny key/value store for program-wide config.
--    Publicly readable (unlock timing isn't secret; non-members need to see
--    when lessons open). Admin-only writes.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_read_all" ON public.app_settings;
CREATE POLICY "app_settings_read_all" ON public.app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "app_settings_admin_write" ON public.app_settings;
CREATE POLICY "app_settings_admin_write" ON public.app_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Seed the config keys (admin sets program_start_date in the admin portal).
--   program_start_date : the FIRST Sunday (ISO date, e.g. 2026-02-01) = lesson 1
--   program_timezone   : IANA tz the 09:30 Sunday unlock is measured in
INSERT INTO public.app_settings (key, value) VALUES
  ('program_start_date', NULL),
  ('program_timezone', 'Pacific/Auckland')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. lesson_unlocked(week) — computed unlock from the program start date.
--    Week N opens at 09:30 (program tz) on start_date + (N-1)*7 days, and
--    remains open. Returns false when no start date is set (program not begun).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lesson_unlocked(week_number int)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_txt text;
  tz text;
  start_date date;
  unlock_at timestamptz;
BEGIN
  IF week_number IS NULL OR week_number < 1 THEN
    RETURN false;
  END IF;

  SELECT value INTO start_txt FROM public.app_settings WHERE key = 'program_start_date';
  IF start_txt IS NULL OR start_txt = '' THEN
    RETURN false;
  END IF;
  SELECT COALESCE(value, 'Pacific/Auckland') INTO tz FROM public.app_settings WHERE key = 'program_timezone';

  start_date := start_txt::date;
  -- Wall-clock 09:30 on that week's Sunday, interpreted in the program timezone.
  unlock_at := ((start_date + ((week_number - 1) * 7))::timestamp + interval '9 hours 30 minutes')
               AT TIME ZONE COALESCE(tz, 'Pacific/Auckland');

  RETURN now() >= unlock_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lesson_unlocked(int) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Membership tiers. The coarse gate (profiles.membership_status) says
--    active/lapsed; the tier says WHICH track(s) the payment covers.
--      adult  : adult sessions
--      teen   : teen sessions only
--    kids_addon (boolean) : an accompanying kids membership a paying adult buys,
--      granting access to kids lessons + downloadable colouring PDFs. Kids do
--      not log in themselves — the adult accesses kids content on their behalf.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'none'
    CHECK (membership_tier IN ('none','adult','teen')),
  ADD COLUMN IF NOT EXISTS kids_addon boolean NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'adult'
    CHECK (tier IN ('adult','teen','kids_addon'));

-- Keep tier + kids_addon service-role-only (Stripe webhook), same as
-- membership_status — a member must not self-grant a tier.
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
     OR NEW.membership_tier     IS DISTINCT FROM OLD.membership_tier
     OR NEW.kids_addon          IS DISTINCT FROM OLD.kids_addon
     OR NEW.stripe_customer_id  IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify privileged profile fields (is_admin, is_active, nfc_id, membership_status, membership_tier, kids_addon, stripe_customer_id).';
  END IF;

  RETURN NEW;
END;
$$;
