-- app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_settings_read_all" ON public.app_settings;
CREATE POLICY "app_settings_read_all" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "app_settings_admin_write" ON public.app_settings;
CREATE POLICY "app_settings_admin_write" ON public.app_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.app_settings (key, value) VALUES
  ('program_start_date', NULL),
  ('program_timezone', 'Pacific/Auckland')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.lesson_unlocked(week_number int)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  start_txt text; tz text; start_date date; unlock_at timestamptz;
BEGIN
  IF week_number IS NULL OR week_number < 1 THEN RETURN false; END IF;
  SELECT value INTO start_txt FROM public.app_settings WHERE key = 'program_start_date';
  IF start_txt IS NULL OR start_txt = '' THEN RETURN false; END IF;
  SELECT COALESCE(value, 'Pacific/Auckland') INTO tz FROM public.app_settings WHERE key = 'program_timezone';
  start_date := start_txt::date;
  unlock_at := ((start_date + ((week_number - 1) * 7))::timestamp + interval '9 hours 30 minutes')
               AT TIME ZONE COALESCE(tz, 'Pacific/Auckland');
  RETURN now() >= unlock_at;
END;
$$;
GRANT EXECUTE ON FUNCTION public.lesson_unlocked(int) TO anon, authenticated;

-- membership tiers
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'none'
    CHECK (membership_tier IN ('none','adult','teen')),
  ADD COLUMN IF NOT EXISTS kids_addon boolean NOT NULL DEFAULT false;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text DEFAULT 'adult'
    CHECK (tier IN ('adult','teen','kids_addon'));

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     OR NEW.is_active IS DISTINCT FROM OLD.is_active
     OR NEW.nfc_id IS DISTINCT FROM OLD.nfc_id
     OR NEW.membership_status IS DISTINCT FROM OLD.membership_status
     OR NEW.membership_tier IS DISTINCT FROM OLD.membership_tier
     OR NEW.kids_addon IS DISTINCT FROM OLD.kids_addon
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Cannot modify privileged profile fields.';
  END IF;
  RETURN NEW;
END;
$$;

-- lesson_journal
CREATE TABLE IF NOT EXISTS public.lesson_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number int NOT NULL,
  track text NOT NULL DEFAULT 'Adult' CHECK (track IN ('Adult','Teen','Child')),
  reflection_answer text DEFAULT '',
  activity_response text DEFAULT '',
  personal_notes text DEFAULT '',
  life_group_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, week_number, track)
);
CREATE INDEX IF NOT EXISTS lesson_journal_profile_idx ON public.lesson_journal (profile_id);
CREATE INDEX IF NOT EXISTS lesson_journal_week_idx ON public.lesson_journal (week_number, track);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_journal TO authenticated;
GRANT ALL ON public.lesson_journal TO service_role;
ALTER TABLE public.lesson_journal ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_lesson_journal_updated_at ON public.lesson_journal;
CREATE TRIGGER update_lesson_journal_updated_at
  BEFORE UPDATE ON public.lesson_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP POLICY IF EXISTS "lesson_journal_own" ON public.lesson_journal;
CREATE POLICY "lesson_journal_own" ON public.lesson_journal FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());
DROP POLICY IF EXISTS "lesson_journal_guardian_read" ON public.lesson_journal;
CREATE POLICY "lesson_journal_guardian_read" ON public.lesson_journal FOR SELECT
  USING (public.is_guardian_of_profile(profile_id));

-- activity_type on curriculum_weeks
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS activity_type text NOT NULL DEFAULT 'reflection'
    CHECK (activity_type IN ('wordcloud','poll','reflection','none'));

UPDATE public.curriculum_weeks AS c SET activity_type = v.t
FROM (VALUES
  (1,'wordcloud'), (8,'wordcloud'), (15,'wordcloud'), (26,'wordcloud'), (39,'wordcloud'), (52,'wordcloud'),
  (3,'poll'), (4,'poll'), (6,'poll'), (10,'poll'), (19,'poll'), (23,'poll'),
  (28,'poll'), (30,'poll'), (34,'poll'), (37,'poll'), (42,'poll'), (43,'poll'),
  (9,'none'), (16,'none')
) AS v(wk, t)
WHERE c.week_number = v.wk;