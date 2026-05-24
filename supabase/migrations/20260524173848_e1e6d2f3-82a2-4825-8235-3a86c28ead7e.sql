
-- Lesson content
CREATE TABLE public.mindcast_live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL,
  phase int NOT NULL,
  phase_name text NOT NULL DEFAULT '',
  theme_title text NOT NULL DEFAULT '',
  audience text NOT NULL CHECK (audience IN ('Adult','Teen','Child')),
  core_concept text DEFAULT '',
  signal_metaphor text DEFAULT '',
  ancient_wisdom_reframe text DEFAULT '',
  session_title text DEFAULT '',
  opening_hook text DEFAULT '',
  teaching_points text DEFAULT '',
  experiential_exercise text DEFAULT '',
  guided_reflection text DEFAULT '',
  journaling_prompt text DEFAULT '',
  weekly_practice_mon text DEFAULT '',
  weekly_practice_wed text DEFAULT '',
  weekly_practice_sun text DEFAULT '',
  core_affirmation text DEFAULT '',
  video_link text DEFAULT '',
  video_description text DEFAULT '',
  video_backup_description text DEFAULT '',
  film_script_2min text DEFAULT '',
  facilitator_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(week_number, audience)
);
ALTER TABLE public.mindcast_live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_read_all" ON public.mindcast_live_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_facilitator_manage" ON public.mindcast_live_sessions FOR ALL
  USING (has_role(auth.uid(),'facilitator'::app_role))
  WITH CHECK (has_role(auth.uid(),'facilitator'::app_role));
CREATE TRIGGER mindcast_live_sessions_updated BEFORE UPDATE ON public.mindcast_live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audience responses
CREATE TABLE public.session_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text NOT NULL,
  week_number int NOT NULL,
  audience_type text NOT NULL DEFAULT 'Adult',
  user_id uuid,
  display_name text NOT NULL DEFAULT 'Anonymous',
  response_text text NOT NULL,
  prompt_type text NOT NULL DEFAULT 'journaling',
  is_public boolean NOT NULL DEFAULT true,
  show_name boolean NOT NULL DEFAULT true,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responses_read_public" ON public.session_responses FOR SELECT
  USING (is_public = true AND hidden = false);
CREATE POLICY "responses_facilitator_read" ON public.session_responses FOR SELECT
  USING (has_role(auth.uid(),'facilitator'::app_role));
CREATE POLICY "responses_insert_any" ON public.session_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "responses_facilitator_manage" ON public.session_responses FOR UPDATE
  USING (has_role(auth.uid(),'facilitator'::app_role));
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_responses;
ALTER TABLE public.session_responses REPLICA IDENTITY FULL;

-- Unlocked lessons (global per week)
CREATE TABLE public.unlocked_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL UNIQUE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  facilitator_id uuid
);
ALTER TABLE public.unlocked_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unlocked_read_all" ON public.unlocked_lessons FOR SELECT USING (true);
CREATE POLICY "unlocked_facilitator_manage" ON public.unlocked_lessons FOR ALL
  USING (has_role(auth.uid(),'facilitator'::app_role))
  WITH CHECK (has_role(auth.uid(),'facilitator'::app_role));

-- Worksheets
CREATE TABLE public.worksheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL,
  audience_type text NOT NULL DEFAULT 'Adult',
  pdf_url text,
  video_url text,
  price_nzd numeric DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "worksheets_read_all" ON public.worksheets FOR SELECT USING (true);
CREATE POLICY "worksheets_facilitator_manage" ON public.worksheets FOR ALL
  USING (has_role(auth.uid(),'facilitator'::app_role))
  WITH CHECK (has_role(auth.uid(),'facilitator'::app_role));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('worksheets','worksheets', true)
  ON CONFLICT (id) DO NOTHING;
CREATE POLICY "worksheets_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'worksheets');
CREATE POLICY "worksheets_facilitator_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'worksheets' AND has_role(auth.uid(),'facilitator'::app_role));
