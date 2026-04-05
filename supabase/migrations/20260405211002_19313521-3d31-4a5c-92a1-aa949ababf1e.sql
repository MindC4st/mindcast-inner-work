-- Add new columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS age_group text DEFAULT 'adult',
  ADD COLUMN IF NOT EXISTS nfc_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS opt_in_public_goals boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add new columns to sessions
ALTER TABLE public.sessions 
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_title text,
  ADD COLUMN IF NOT EXISTS video_transcript text,
  ADD COLUMN IF NOT EXISTS ai_questions jsonb,
  ADD COLUMN IF NOT EXISTS age_group text DEFAULT 'adult',
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- Make session_number unique (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'sessions' AND indexname = 'sessions_session_number_key'
  ) THEN
    ALTER TABLE public.sessions ADD CONSTRAINT sessions_session_number_key UNIQUE (session_number);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Create workbook_entries table
CREATE TABLE IF NOT EXISTS public.workbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  arriving_word text,
  first_impression text,
  key_idea text,
  question_1_text text,
  question_1_response text,
  question_2_text text,
  question_2_response text,
  question_3_text text,
  question_3_response text,
  personal_application text,
  weekly_goal text,
  action_step text,
  accountability_person text,
  leaving_word text,
  share_leaving_word boolean DEFAULT true,
  goal_update_from_last_week text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, session_id)
);

ALTER TABLE public.workbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workbook_own" ON public.workbook_entries 
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "workbook_facilitator_read" ON public.workbook_entries 
  FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- Create check_ins table
CREATE TABLE IF NOT EXISTS public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  welcome_note text,
  goal_update text,
  share_goal_publicly boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  checked_in_at timestamptz DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkins_insert" ON public.check_ins 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "checkins_read_all" ON public.check_ins 
  FOR SELECT USING (true);

CREATE POLICY "checkins_facilitator_manage" ON public.check_ins 
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));

-- Create kids_sessions table
CREATE TABLE IF NOT EXISTS public.kids_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  age_group text NOT NULL CHECK (age_group IN ('toddler-tween', 'tween-teen')),
  video_url text,
  video_title text,
  lesson_theme text,
  activity_type text,
  activity_description text,
  materials_needed text,
  facilitator_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.kids_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kids_sessions_read" ON public.kids_sessions 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "kids_sessions_facilitator_manage" ON public.kids_sessions 
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));