-- Annual youth participation consent and the private no-photo register.
--
-- A guardian completes this in /portal/family. It is intentionally separate
-- from Stripe: emergency, safety and child-image information must never be
-- copied into payment metadata. A current record is required by the NFC
-- check-in function before a teen or child can enter a paid programme session.

-- Checkout historically added the payer as an adult even when they were the
-- guardian of child/teen members. Repair those households so all guardian-only
-- policies and the Family & Safety screen work for existing families too.
UPDATE public.household_members payer
SET role_in_household = 'guardian'
FROM public.households h
WHERE h.id = payer.household_id
  AND h.payer_profile_id = payer.profile_id
  AND payer.role_in_household = 'adult'
  AND EXISTS (
    SELECT 1
    FROM public.household_members youth
    WHERE youth.household_id = payer.household_id
      AND youth.role_in_household IN ('teen', 'child')
  );

CREATE TABLE IF NOT EXISTS public.youth_participation_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  programme_year smallint NOT NULL CHECK (programme_year BETWEEN 2026 AND 2200),
  guardian_name text NOT NULL CHECK (char_length(btrim(guardian_name)) BETWEEN 2 AND 120),
  guardian_relationship text NOT NULL CHECK (char_length(btrim(guardian_relationship)) BETWEEN 2 AND 80),
  emergency_contact_name text NOT NULL CHECK (char_length(btrim(emergency_contact_name)) BETWEEN 2 AND 120),
  emergency_contact_relationship text NOT NULL CHECK (char_length(btrim(emergency_contact_relationship)) BETWEEN 2 AND 80),
  emergency_contact_phone text NOT NULL CHECK (char_length(btrim(emergency_contact_phone)) BETWEEN 6 AND 40),
  safe_participation_notes text NOT NULL DEFAULT '' CHECK (char_length(safe_participation_notes) <= 4000),
  attendance_consent boolean NOT NULL DEFAULT false,
  operational_data_consent boolean NOT NULL DEFAULT false,
  nfc_bracelet_consent boolean NOT NULL DEFAULT false,
  promotional_photo_consent boolean NOT NULL DEFAULT false,
  photo_reference_path text,
  privacy_notice_version text NOT NULL DEFAULT '2026-08-30',
  consented_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_profile_id, programme_year),
  CONSTRAINT youth_required_participation_consents
    CHECK (attendance_consent AND operational_data_consent),
  CONSTRAINT youth_no_photo_reference_required
    CHECK (promotional_photo_consent OR NULLIF(btrim(photo_reference_path), '') IS NOT NULL),
  CONSTRAINT youth_consent_expiry_after_consent
    CHECK (expires_at > consented_at)
);

CREATE INDEX IF NOT EXISTS youth_consents_current_idx
  ON public.youth_participation_consents (subject_profile_id, programme_year, expires_at)
  WHERE revoked_at IS NULL;

CREATE TRIGGER update_youth_participation_consents_updated_at
  BEFORE UPDATE ON public.youth_participation_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.youth_participation_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS youth_consents_guardian_read ON public.youth_participation_consents;
CREATE POLICY youth_consents_guardian_read ON public.youth_participation_consents
  FOR SELECT TO authenticated USING (
    public.is_guardian_of_profile(subject_profile_id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_safeguarding_lead = true
    )
  );

DROP POLICY IF EXISTS youth_consents_guardian_insert ON public.youth_participation_consents;
CREATE POLICY youth_consents_guardian_insert ON public.youth_participation_consents
  FOR INSERT TO authenticated WITH CHECK (
    public.is_guardian_of_profile(subject_profile_id)
    AND guardian_profile_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS youth_consents_guardian_update ON public.youth_participation_consents;
CREATE POLICY youth_consents_guardian_update ON public.youth_participation_consents
  FOR UPDATE TO authenticated USING (
    (
      public.is_guardian_of_profile(subject_profile_id)
      AND guardian_profile_id = public.current_profile_id()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  ) WITH CHECK (
    (
      public.is_guardian_of_profile(subject_profile_id)
      AND guardian_profile_id = public.current_profile_id()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

GRANT SELECT, INSERT, UPDATE ON public.youth_participation_consents TO authenticated;
GRANT ALL ON public.youth_participation_consents TO service_role;

COMMENT ON TABLE public.youth_participation_consents IS
  'Annual guardian consent for under-18 programme participation. Safety notes and no-photo references are restricted safeguarding data.';
COMMENT ON COLUMN public.youth_participation_consents.photo_reference_path IS
  'Private staff identification image used only to keep a no-photo child out of promotional images or to mask them during review.';

-- Private reference images for children whose guardian says no to promotional
-- photography. They are never served through a public URL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'youth-photo-references',
  'youth-photo-references',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS youth_photo_guardian_insert ON storage.objects;
CREATE POLICY youth_photo_guardian_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'youth-photo-references'
    AND public.is_guardian_of_profile(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS youth_photo_restricted_read ON storage.objects;
CREATE POLICY youth_photo_restricted_read ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'youth-photo-references'
    AND (
      public.is_guardian_of_profile(((storage.foldername(name))[1])::uuid)
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid() AND p.is_safeguarding_lead = true
      )
    )
  );

DROP POLICY IF EXISTS youth_photo_guardian_update ON storage.objects;
CREATE POLICY youth_photo_guardian_update ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'youth-photo-references'
    AND public.is_guardian_of_profile(((storage.foldername(name))[1])::uuid)
  ) WITH CHECK (
    bucket_id = 'youth-photo-references'
    AND public.is_guardian_of_profile(((storage.foldername(name))[1])::uuid)
  );

DROP POLICY IF EXISTS youth_photo_guardian_delete ON storage.objects;
CREATE POLICY youth_photo_guardian_delete ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'youth-photo-references'
    AND (
      public.is_guardian_of_profile(((storage.foldername(name))[1])::uuid)
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );
