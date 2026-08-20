-- The weekly practice cadence becomes SUN (TODAY) → MIDWEEK → FRI → back to SUN.
--
-- WHY THIS IS A REDESIGN AND NOT A RELABEL
--
-- The old cadence set an intention on Sunday and first checked on Monday: one
-- day. Worse, the three slots held three DIFFERENT activities — catch an input,
-- ask what not why, find the quiet channel — so by the following Sunday there
-- was nothing to return to. Slide 2 asked "how did your intention go?" against
-- a week that had never been asked to track it.
--
-- The loop only closes if all three slots concern ONE commitment:
--
--   SUN (TODAY)  write the if-then intention          (in session)
--   MIDWEEK      check in on it — Notice / Name / Do  (Tues or Weds)
--   FRI          check in again                       (alone)
--   SUN          return, rate 1-4, report             (Slide 2)
--
-- MIDWEEK, not "your Life Group": groups run Tuesday AND Wednesday, not every
-- member is in one, and a printed worksheet cannot carry a per-member day
-- without reprinting the year. The member's night lives on their Life Group
-- card, not on 52 weekly sheets.
--
-- COLUMN NAMES ARE PART OF THE FIX
--
-- Leaving content in a column called weekly_practice_mon is how this drifts
-- back. Two separate ordering bugs this session came from a name and a value
-- disagreeing, so the names move with the meaning.

-- ── 1. Rename to slot semantics ───────────────────────────────────────────
-- RENAME is metadata-only: instant, no table rewrite, no data movement.
-- Historical migrations keep their old references but never re-run.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='mindcast_live_sessions'
                AND column_name='weekly_practice_mon') THEN
    ALTER TABLE public.mindcast_live_sessions RENAME COLUMN weekly_practice_mon TO practice_sun_today;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='mindcast_live_sessions'
                AND column_name='weekly_practice_wed') THEN
    ALTER TABLE public.mindcast_live_sessions RENAME COLUMN weekly_practice_wed TO practice_midweek;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='mindcast_live_sessions'
                AND column_name='weekly_practice_fri') THEN
    ALTER TABLE public.mindcast_live_sessions RENAME COLUMN weekly_practice_fri TO practice_fri;
  END IF;
END $$;

ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS practice_sun_today text DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_midweek   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_fri       text DEFAULT '';

-- ── 2. Rescue the third slot for weeks 1-31 ───────────────────────────────
-- Weeks 32-52 were authored on a four-day MON/WED/FRI/SUN run, so they already
-- have a FRI line. Weeks 1-31 have three slots, and their third lives in
-- weekly_practice_sun. Move it across before that column is retired.
UPDATE public.mindcast_live_sessions
SET practice_fri = weekly_practice_sun
WHERE COALESCE(practice_fri, '') = ''
  AND COALESCE(weekly_practice_sun, '') <> '';

-- Deliberately NOT dropped. weekly_practice_sun holds the old "bring it back
-- on Sunday" lines, which Slide 2 now does directly. Keeping the column means
-- this migration is reversible and no authored content is destroyed.
COMMENT ON COLUMN public.mindcast_live_sessions.weekly_practice_sun IS
  'RETIRED by 20260822120000. Superseded by the Slide 2 return. Kept for reference; do not read in application code.';

-- ── 3. Make all three slots serve ONE commitment ──────────────────────────
-- The per-week line that used to be Monday's task becomes the SUGGESTED CUE
-- inside Sunday's intention. That keeps 156 lessons of authored specificity
-- while making the slot do the right job.
UPDATE public.mindcast_live_sessions
SET practice_sun_today =
  'Write your if-then plan for the week: When I notice [a specific cue] capturing my attention, '
  || 'I will [take one small action]. Keep the action small enough to do on a bad day.'
  || CASE WHEN COALESCE(practice_sun_today, '') <> ''
          THEN chr(10) || chr(10) || 'Suggested cue this week: ' || practice_sun_today
          ELSE '' END
WHERE practice_sun_today NOT LIKE 'Write your if-then plan%';

-- MIDWEEK and FRI are the same question twice, deliberately. The point is not
-- variety, it is repetition against one commitment — and it gives the 1-4
-- awareness scale on Slide 2 something real to measure.
UPDATE public.mindcast_live_sessions
SET practice_midweek =
  'Check in on the plan you wrote on Sunday. Did the cue turn up? How far did you get — '
  || 'did you notice it, name it, or do something about it? If it has not happened yet, that is information too.'
WHERE practice_midweek NOT LIKE 'Check in on the plan%';

UPDATE public.mindcast_live_sessions
SET practice_fri =
  'Check in again, same three questions. Notice it, name it, do it — whichever you reached. '
  || 'Bring it back on Sunday.'
WHERE practice_fri NOT LIKE 'Check in again%';

-- ── 4. Same three slots on the week-level table ───────────────────────────
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS practice_sun_today text DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_midweek   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_fri       text DEFAULT '';

-- Verify after db push:
--   SELECT week_number, audience, left(practice_sun_today, 60), left(practice_midweek, 40)
--     FROM public.mindcast_live_sessions WHERE week_number = 1;
--   SELECT count(*) FROM public.mindcast_live_sessions WHERE COALESCE(practice_fri,'') = '';  -- expect 0
--   SELECT count(*) FROM public.mindcast_live_sessions
--    WHERE practice_sun_today NOT LIKE 'Write your if-then plan%';                            -- expect 0
