-- Age gating and consent records.
--
-- Audit finding: onboarding let anyone self-select any age group with no date
-- of birth, no under-13 block and no guardian consent for 13–17s. This adds
-- the data layer the policy requires:
--
--   - guardian_consents: a written record of who consented to what, for whom,
--     revocable. Teen membership (13–17), wall display for minors, and trial
--     attendance all hang off this one table.
--   - check_ins.wall_hidden: the welcome wall shows a name only when the row
--     says it may. Consent is resolved at write time by the service-role
--     check-in paths, so a revoked consent is honoured on the very next scan.

CREATE TABLE IF NOT EXISTS public.guardian_consents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  consent_type        text NOT NULL CHECK (consent_type IN
                        ('teen_membership','wall_display','trial_attendance')),
  guardian_name       text NOT NULL,
  guardian_email      text,
  guardian_phone      text,
  consented_at        timestamptz NOT NULL DEFAULT now(),
  revoked_at          timestamptz,
  recorded_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS guardian_consents_subject_idx
  ON public.guardian_consents (subject_profile_id, consent_type) WHERE revoked_at IS NULL;

ALTER TABLE public.guardian_consents ENABLE ROW LEVEL SECURITY;

-- The subject and their household guardians can see the record; admins all.
DROP POLICY IF EXISTS guardian_consents_read ON public.guardian_consents;
CREATE POLICY guardian_consents_read ON public.guardian_consents
  FOR SELECT USING (
    subject_profile_id = public.current_profile_id()
    OR public.is_guardian_of_profile(subject_profile_id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- A teen records their guardian's consent at signup (their own row only);
-- a guardian records consent for a child in their household; admins manage.
DROP POLICY IF EXISTS guardian_consents_insert ON public.guardian_consents;
CREATE POLICY guardian_consents_insert ON public.guardian_consents
  FOR INSERT WITH CHECK (
    recorded_by = auth.uid()
    AND (
      subject_profile_id = public.current_profile_id()
      OR public.is_guardian_of_profile(subject_profile_id)
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Revocation (set revoked_at) by guardian or admin — honoured immediately by
-- the wall because consent is re-resolved on every check-in write.
DROP POLICY IF EXISTS guardian_consents_revoke ON public.guardian_consents;
CREATE POLICY guardian_consents_revoke ON public.guardian_consents
  FOR UPDATE USING (
    public.is_guardian_of_profile(subject_profile_id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.is_guardian_of_profile(subject_profile_id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ── Wall visibility ─────────────────────────────────────────────────────────
-- Any member may opt off the wall; minors additionally need an unrevoked
-- wall_display consent before their name may appear.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wall_opt_out boolean NOT NULL DEFAULT false;

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS wall_hidden boolean NOT NULL DEFAULT false;

-- True when this profile's name may appear on a projected wall right now.
CREATE OR REPLACE FUNCTION public.wall_display_allowed(p_profile uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p.wall_opt_out THEN false
    -- Minors (teen/child rooms) need a live guardian consent.
    WHEN COALESCE(p.age_group, 'adult') IN ('teen', 'child', 'little_ones') THEN EXISTS (
      SELECT 1 FROM public.guardian_consents c
      WHERE c.subject_profile_id = p_profile
        AND c.consent_type = 'wall_display'
        AND c.revoked_at IS NULL
    )
    ELSE true
  END
  FROM public.profiles p
  WHERE p.id = p_profile;
$$;

REVOKE ALL ON FUNCTION public.wall_display_allowed(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.wall_display_allowed(uuid) TO authenticated, service_role;

-- ── Trial tickets: guardian consent for under-18 attendance ────────────────
ALTER TABLE public.trial_tickets
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_consent_at timestamptz;
