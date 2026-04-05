
-- Add columns to existing tables
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_attendance_on_screen boolean DEFAULT true;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS active_slide integer DEFAULT 1;

ALTER TABLE public.workbook_entries
  ADD COLUMN IF NOT EXISTS success_story text;

-- Story submissions
CREATE TABLE public.story_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  show_name boolean DEFAULT true,
  last_week_goal text,
  success_story text NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')) DEFAULT 'pending',
  ai_flagged boolean DEFAULT false,
  ai_flag_reason text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.story_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "story_insert" ON public.story_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "story_read_approved" ON public.story_submissions FOR SELECT USING (
  status = 'approved' OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'facilitator')
);
CREATE POLICY "story_update_admin" ON public.story_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'facilitator')
);

-- Word submissions
CREATE TABLE public.word_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  word text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.word_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_insert" ON public.word_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "word_read" ON public.word_submissions FOR SELECT USING (true);

-- Session pause points
CREATE TABLE public.session_pause_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position BETWEEN 1 AND 5),
  timestamp_seconds integer NOT NULL,
  context_start_seconds integer NOT NULL,
  question_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, position)
);

ALTER TABLE public.session_pause_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pause_read" ON public.session_pause_points FOR SELECT USING (true);
CREATE POLICY "pause_admin_insert" ON public.session_pause_points FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'facilitator')
);
CREATE POLICY "pause_admin_update" ON public.session_pause_points FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'facilitator')
);
CREATE POLICY "pause_admin_delete" ON public.session_pause_points FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'facilitator')
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.story_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.word_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
