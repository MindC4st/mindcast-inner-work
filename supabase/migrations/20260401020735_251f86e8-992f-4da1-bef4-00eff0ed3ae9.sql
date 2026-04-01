
-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cohort text;

-- Add missing columns to sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS podcast_title text DEFAULT '';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS podcast_guest text DEFAULT '';

-- Add missing columns to session_bookmarks
ALTER TABLE public.session_bookmarks ADD COLUMN IF NOT EXISTS timestamp_label text DEFAULT '';
ALTER TABLE public.session_bookmarks ADD COLUMN IF NOT EXISTS is_final_reflection boolean NOT NULL DEFAULT false;

-- Add privacy column to bookmark_responses (replaces is_shared logic)
ALTER TABLE public.bookmark_responses ADD COLUMN IF NOT EXISTS privacy text NOT NULL DEFAULT 'private';

-- Create implementation_goals table
CREATE TABLE public.implementation_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  what_i_will_implement text DEFAULT '',
  why_it_matters text DEFAULT '',
  how_i_will_know text DEFAULT '',
  status text NOT NULL DEFAULT 'committed',
  checkin_notes text DEFAULT '',
  checkin_status text DEFAULT '',
  shared_with_group boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.implementation_goals ENABLE ROW LEVEL SECURITY;

-- Members can manage their own goals
CREATE POLICY "Users can manage own goals" ON public.implementation_goals
  FOR ALL USING (auth.uid() = member_id);

-- Facilitators can view all goals
CREATE POLICY "Facilitators can view all goals" ON public.implementation_goals
  FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- Update bookmark_responses RLS: replace the shared policy with privacy-aware policy
DROP POLICY IF EXISTS "Cohort members can view shared bookmark responses" ON public.bookmark_responses;

CREATE POLICY "Cohort members can view group responses" ON public.bookmark_responses
  FOR SELECT USING (
    privacy = 'group' AND EXISTS (
      SELECT 1 FROM cohort_members cm
      WHERE cm.cohort_id = bookmark_responses.cohort_id AND cm.user_id = auth.uid()
    )
  );

-- Trigger for updated_at on implementation_goals
CREATE TRIGGER update_implementation_goals_updated_at
  BEFORE UPDATE ON public.implementation_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
