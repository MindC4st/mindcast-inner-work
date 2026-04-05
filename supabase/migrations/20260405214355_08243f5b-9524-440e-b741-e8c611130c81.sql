
-- Add free_notes to adult workbook_entries
ALTER TABLE public.workbook_entries ADD COLUMN IF NOT EXISTS free_notes text;

-- Create teen workbook entries
CREATE TABLE public.teen_workbook_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_name text,
  week_theme text,
  big_idea_text text,
  video_title text,
  what_caught_attention text,
  question_1 text,
  question_1_answer text,
  question_2 text,
  question_2_answer text,
  personal_reflection_prompt text,
  personal_reflection text,
  challenge_prompt text,
  challenge_response text,
  weekly_goal text,
  first_step text,
  last_week_goal_review text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, session_id)
);

ALTER TABLE public.teen_workbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teen_workbook_own" ON public.teen_workbook_entries FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "teen_workbook_facilitator_read" ON public.teen_workbook_entries FOR SELECT USING (has_role(auth.uid(), 'facilitator'::app_role));

CREATE TRIGGER update_teen_workbook_entries_updated_at
  BEFORE UPDATE ON public.teen_workbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create kids workbook entries
CREATE TABLE public.kids_workbook_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_emoji text,
  arriving_word text,
  favorite_part_drawing_url text,
  drawing_description text,
  character_felt text,
  if_i_were_character text,
  character_brave_kind text,
  question_1 text,
  question_1_answer text,
  question_1_drawing_url text,
  question_2 text,
  question_2_answer text,
  something_to_remember text,
  weekly_goal text,
  little_minds_question text,
  little_minds_drawing_url text,
  parent_conversation_notes text,
  parent_initials text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id, session_id)
);

ALTER TABLE public.kids_workbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kids_workbook_own" ON public.kids_workbook_entries FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "kids_workbook_facilitator_read" ON public.kids_workbook_entries FOR SELECT USING (has_role(auth.uid(), 'facilitator'::app_role));

CREATE TRIGGER update_kids_workbook_entries_updated_at
  BEFORE UPDATE ON public.kids_workbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
