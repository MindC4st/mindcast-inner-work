-- Per-member, per-week lesson journal for the 52-week curriculum.
--
-- The live in-session input (word clouds, polls, Q&A) is already captured in
-- session_responses (keyed by the live session_code). This table is the durable,
-- private record each member keeps for a week's lesson across the Sunday session
-- and the midweek Life Group:
--   - reflection_answer : their answer to that week's reflective_question
--   - activity_response : what they submitted in the interactive activity
--   - personal_notes    : free journaling (Sunday)
--   - life_group_notes  : deeper notes added at the Tuesday Life Group
--
-- Keyed by (profile_id, week_number, track) so it maps to curriculum_weeks
-- rather than the legacy `sessions` table. Owner-only, with linked-guardian read
-- for a child/teen — matching the journal-privacy model (Phase 0).

CREATE TABLE IF NOT EXISTS public.lesson_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_number int NOT NULL,
  track text NOT NULL DEFAULT 'Adult'
    CHECK (track IN ('Adult','Teen','Child')),
  reflection_answer text DEFAULT '',
  activity_response text DEFAULT '',
  personal_notes text DEFAULT '',
  life_group_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, week_number, track)
);

CREATE INDEX IF NOT EXISTS lesson_journal_profile_idx ON public.lesson_journal (profile_id);
CREATE INDEX IF NOT EXISTS lesson_journal_week_idx    ON public.lesson_journal (week_number, track);

ALTER TABLE public.lesson_journal ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_lesson_journal_updated_at
  BEFORE UPDATE ON public.lesson_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Owner reads/writes their own journal only.
DROP POLICY IF EXISTS "lesson_journal_own" ON public.lesson_journal;
CREATE POLICY "lesson_journal_own" ON public.lesson_journal
  FOR ALL
  USING (profile_id = public.current_profile_id())
  WITH CHECK (profile_id = public.current_profile_id());

-- A linked guardian may READ a child/teen's journal (no write). Uses the same
-- helper as the workbook tables. No blanket facilitator/admin read.
DROP POLICY IF EXISTS "lesson_journal_guardian_read" ON public.lesson_journal;
CREATE POLICY "lesson_journal_guardian_read" ON public.lesson_journal
  FOR SELECT
  USING (public.is_guardian_of_profile(profile_id));
