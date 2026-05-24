-- Audit follow-up phase 1: P0 + P1 schema fixes for Mindcast LIVE
-- See mindcast_live_audit_report.md for context.

-- P0: session_responses.is_public must default to false (was true).
ALTER TABLE public.session_responses
  ALTER COLUMN is_public SET DEFAULT false;

-- P1: unlocked_lessons must be per-user.
ALTER TABLE public.unlocked_lessons
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the global UNIQUE(week_number) so multiple users can share a week.
ALTER TABLE public.unlocked_lessons
  DROP CONSTRAINT IF EXISTS unlocked_lessons_week_number_key;

-- One row per (user, week).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unlocked_lessons_user_week_key'
  ) THEN
    ALTER TABLE public.unlocked_lessons
      ADD CONSTRAINT unlocked_lessons_user_week_key UNIQUE (user_id, week_number);
  END IF;
END $$;

-- Tighten RLS: members can read their own unlock rows, facilitators read all.
DROP POLICY IF EXISTS "unlocked_read_all" ON public.unlocked_lessons;
CREATE POLICY "unlocked_read_own" ON public.unlocked_lessons
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- P2: lesson_completions table sourced from worksheet submissions.
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number int NOT NULL,
  audience_type text NOT NULL DEFAULT 'Adult',
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);

ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "completions_own_read" ON public.lesson_completions
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );
CREATE POLICY "completions_own_write" ON public.lesson_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "completions_own_update" ON public.lesson_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- P2: tighten read policies that were USING (true) to authenticated only.
DROP POLICY IF EXISTS "sessions_read_all" ON public.mindcast_live_sessions;
CREATE POLICY "sessions_read_authenticated" ON public.mindcast_live_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "worksheets_read_all" ON public.worksheets;
CREATE POLICY "worksheets_read_authenticated" ON public.worksheets
  FOR SELECT USING (auth.role() = 'authenticated');

-- P1: store online-worksheet responses in session_responses with a stable
-- (user_id, week, audience, prompt_type) so we can upsert + rehydrate.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'session_responses_user_week_prompt_key'
  ) THEN
    -- Partial index allows multiple anonymous (NULL user_id) live responses
    -- while keeping authenticated worksheet rows unique per prompt slot.
    CREATE UNIQUE INDEX session_responses_user_week_prompt_key
      ON public.session_responses (user_id, week_number, audience_type, prompt_type)
      WHERE user_id IS NOT NULL;
  END IF;
END $$;
