-- Lesson flow v3 (15 slides -> 11). NON-DESTRUCTIVE: archives authored content
-- before any change, ADDS columns, and only MARKS removed columns deprecated
-- (NOT dropped here).
--
-- New flow: NOTICE IT (1 welcome+code, 2 voices, 3 ancient-wisdom video,
-- 4 in-today's-world video) / NAME IT (5 today's theme, 6 video+questions,
-- 7 experiential exercise + 90s private write, 8 reflection) /
-- DO IT (9 intention+practices, 10 closing affirmation, 11 facilitator notes).
--
-- Column home: SHARED per-week v3 fields -> curriculum_weeks (one row/week);
-- PER-TRACK v3 fields -> mindcast_live_sessions (one row/week/audience).

-- 1. Archive every pre-migration row so nothing authored is lost.
CREATE TABLE IF NOT EXISTS public.curriculum_weeks_archive_v2 AS
SELECT * FROM public.curriculum_weeks;

-- 2. Shared per-week v3 fields on curriculum_weeks.
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS the_territory   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS opening_question text DEFAULT '',
  ADD COLUMN IF NOT EXISTS spiral_thread   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS spiral_depth    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS revisits_weeks  text DEFAULT '',
  ADD COLUMN IF NOT EXISTS week_type       text DEFAULT 'Standard',
  ADD COLUMN IF NOT EXISTS movement_theme  text DEFAULT '';

-- 3. Per-track v3 fields on mindcast_live_sessions. Existing columns that map
--    are reused (signal_metaphor = In Today's World, ancient_wisdom_reframe =
--    Ancient Wisdom, journaling_prompt, experiential_exercise, weekly_practice_*,
--    core_affirmation, video_link, video_description, video_transcript,
--    video_question_1/2). signal_metaphor is kept as the alias of the new
--    todays_world_metaphor naming; not dropped.
ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS todays_theme             text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ancient_wisdom_vo_script text DEFAULT '',
  ADD COLUMN IF NOT EXISTS todays_world_vo_script   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ancient_wisdom_video_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ancient_wisdom_captions_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS todays_world_video_url   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS todays_world_captions_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS private_write_prompt     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS intention_prompt         text DEFAULT '',
  ADD COLUMN IF NOT EXISTS closing_quote            text DEFAULT '',
  ADD COLUMN IF NOT EXISTS closing_quote_attribution text DEFAULT '',
  ADD COLUMN IF NOT EXISTS facilitator_prep_notes   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS watch_for                text DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_time_note          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS heavy_week_flag          boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS s5_source_opening_hook   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS s5_source_core_concept   text DEFAULT '';

-- 4. Data-driven slide order. The deck renders from this table ordered by
-- position; reordering/hiding becomes a data change, not a code change.
CREATE TABLE IF NOT EXISTS public.lesson_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_key text NOT NULL UNIQUE,
  position int NOT NULL,
  beat text NOT NULL CHECK (beat IN ('notice','name','do')),
  title text NOT NULL,
  component_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  default_duration_seconds int NOT NULL DEFAULT 60,
  applies_to_tracks text[] NOT NULL DEFAULT '{Adult,Teen,Child}'
);

INSERT INTO public.lesson_slides (slide_key, position, beat, title, component_key, default_duration_seconds) VALUES
  ('welcome',      1,  'notice', 'Welcome Wall + Join Code', 'WelcomeWall',    120),
  ('voices',       2,  'notice', 'Voices from Last Week',    'Voices',         300),
  ('ancient',      3,  'notice', 'Ancient Wisdom',           'GeneratedVideo', 180),
  ('todays_world', 4,  'notice', 'In Today''s World',        'GeneratedVideo', 180),
  ('theme',        5,  'name',   'Today''s Theme',           'TodaysTheme',    180),
  ('video',        6,  'name',   'The Video',                'Video',          1200),
  ('exercise',     7,  'name',   'Experiential Exercise',    'Exercise',       900),
  ('reflection',   8,  'name',   'Reflection',               'Reflection',     480),
  ('intention',    9,  'do',     'Intention + Weekly Practices','Intention',   420),
  ('affirmation',  10, 'do',     'Closing Affirmation',      'Affirmation',    60),
  ('notes',        11, 'do',     'Facilitator Notes',        'FacilitatorNotes', 60)
ON CONFLICT (slide_key) DO NOTHING;

-- 5. Post-session evaluation. follow_up_notes + safeguarding_flag are restricted
-- to the Safeguarding Lead and admin (not readable across the facilitator team).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_safeguarding_lead boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.session_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  facilitator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  what_worked text DEFAULT '',
  what_didnt text DEFAULT '',
  room_energy int,
  timing_notes text DEFAULT '',
  content_flags text DEFAULT '',
  follow_up_needed boolean DEFAULT false,
  follow_up_notes text DEFAULT '',
  safeguarding_flag boolean DEFAULT false
);

ALTER TABLE public.session_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS session_eval_own ON public.session_evaluations;
CREATE POLICY session_eval_own ON public.session_evaluations
  FOR ALL USING (facilitator_id = auth.uid()) WITH CHECK (facilitator_id = auth.uid());

-- Safe read for facilitators (no restricted fields).
CREATE OR REPLACE VIEW public.session_evaluations_safe AS
  SELECT id, session_id, facilitator_id, track, submitted_at, what_worked, what_didnt,
         room_energy, timing_notes, content_flags, follow_up_needed
  FROM public.session_evaluations;
GRANT SELECT ON public.session_evaluations_safe TO authenticated;

-- Restricted read (follow_up_notes / safeguarding_flag): admin + safeguarding lead.
DROP POLICY IF EXISTS session_eval_restricted_read ON public.session_evaluations;
CREATE POLICY session_eval_restricted_read ON public.session_evaluations
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.is_safeguarding_lead = true
    )
  );
