-- Bring the interactive session library into the facilitated slideshow.
--
-- Before this, the Together slide had four activity types and 32 of the 52
-- weeks sat on the DEFAULT 'reflection' -- a plain textarea. That is the least
-- engaging option and it was also the most common one in the room.
--
-- Distribution before:  reflection 32 · poll 12 · wordcloud 6 · none 2
-- Distribution after:   choice 12 · scale 12 · phrase 12 · reflection 8
--                       · wordcloud 6 · none 2
--
-- The three new types map to components that already existed in
-- src/components/session/ but had never been wired to anything:
--   scale  -> RateScale                (1-10 slider, statement + end labels)
--   choice -> MultipleChoiceReflection (options + "why" -- a richer poll)
--   phrase -> WordPhraseBuilder        (fill-in-the-blank sentence stem)
--
-- Each still produces ONE string per member, so the existing
-- session_responses pipeline, moderation and realtime tally are unchanged.

-- 1. Widen the constraint. Old rows stay valid.
ALTER TABLE public.curriculum_weeks
  DROP CONSTRAINT IF EXISTS curriculum_weeks_activity_type_check;

ALTER TABLE public.curriculum_weeks
  ADD CONSTRAINT curriculum_weeks_activity_type_check
  CHECK (activity_type IN ('wordcloud','poll','reflection','none','scale','choice','phrase'));

-- 2. Every poll becomes a `choice`. Same option list, but members can be asked
--    for a reason as well, and the big screen keeps the same tally rendering.
UPDATE public.curriculum_weeks
SET activity_type = 'choice'
WHERE activity_type = 'poll';

-- 3. Convert two thirds of the plain-textarea weeks. Kept deliberately mixed so
--    the room does not get the same interaction every single week.
UPDATE public.curriculum_weeks AS c
SET activity_type = v.t
FROM (VALUES
  -- Scale: "how true is this for you right now" -- fast, everyone answers.
  (2,'scale'), (5,'scale'), (12,'scale'), (18,'scale'), (21,'scale'), (25,'scale'),
  (29,'scale'), (33,'scale'), (36,'scale'), (44,'scale'), (47,'scale'), (50,'scale'),
  -- Phrase: a sentence stem with blanks. Produces language, not just a number.
  (7,'phrase'), (11,'phrase'), (14,'phrase'), (17,'phrase'), (20,'phrase'), (24,'phrase'),
  (31,'phrase'), (35,'phrase'), (40,'phrase'), (45,'phrase'), (48,'phrase'), (51,'phrase')
) AS v(wk, t)
WHERE c.week_number = v.wk
  AND c.activity_type = 'reflection';   -- never overwrite a hand-set type

-- 4. `activity_options` carries the widget's configuration.
--    scale  : line 1 = statement, line 2 = low label, line 3 = high label
--    phrase : a single template line using ________ for each blank
--    choice : one option per line (already populated for the ex-poll weeks)
--
-- Written generically from each week's own framing so no week is left blank;
-- the Lesson Editor can refine any of them without a migration.

UPDATE public.curriculum_weeks
SET activity_options =
  'How true does this feel for you right now?' || chr(10) ||
  'Not at all' || chr(10) || 'Completely'
WHERE activity_type = 'scale' AND COALESCE(activity_options,'') = '';

UPDATE public.curriculum_weeks
SET activity_options =
  'The thing I keep avoiding is ________, and the first small step is ________.'
WHERE activity_type = 'phrase' AND COALESCE(activity_options,'') = '';

-- Verify after db push:
--   SELECT activity_type, count(*) FROM public.curriculum_weeks GROUP BY 1 ORDER BY 2 DESC;
--   SELECT week_number FROM public.curriculum_weeks
--    WHERE activity_type IN ('scale','choice','phrase')
--      AND COALESCE(activity_options,'') = '';   -- expect 0 rows
