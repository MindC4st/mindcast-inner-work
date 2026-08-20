-- Lesson flow v4 — the deck goes from 11 projected slides to 8.
--
-- Matches the confirmed Notion template (Adult Week 1, "What Are You Actually
-- Receiving?"). Three merges do the work:
--
--   Ancient Wisdom + In Today's World   -> one slide  (the principle and its
--                                          modern form belong together; showing
--                                          them apart made the metaphor read as
--                                          a separate idea rather than the same
--                                          idea made concrete)
--   Go Deeper + Experiential Exercise   -> one slide  (the thought-provoking
--                                          question is the subheading OF the
--                                          activity, not a slide of its own)
--   Weekly Practice + Your Intention    -> one slide  (the 90-second private
--                                          write and the practice table are one
--                                          "before you leave" beat)
--
-- Guided Reflection is dropped from projection. It is not in the template, and
-- v3 had it appearing between Reflect & Share and the practice table.
--
-- Also corrects a v3 ordering drift: v3 put the video AFTER Go Deeper. The
-- template (and the order signed off for coursebook printing) puts the video
-- straight after In Today's World, so it lands as EVIDENCE for the idea just
-- taught rather than as an afterthought to it.
--
-- Facilitator Notes stays a row but is never projected — the client maps it to
-- null and renders it in the drawer.

-- ── Content the template needs and v3 has nowhere to put ──────────────────
ALTER TABLE public.mindcast_live_sessions
  -- Slide 5 subheading. Displayed and printed, never answered directly:
  -- it frames the activity beneath it.
  ADD COLUMN IF NOT EXISTS thought_provoking_question text DEFAULT '';

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS thought_provoking_question text DEFAULT '';

-- ── The intention ladder ──────────────────────────────────────────────────
-- v1 recorded three outcomes (did_it / partly / didnt), which measures
-- compliance. The template asks a better question -- how far along the
-- Notice -> Name -> Do sequence did you get -- so a member who noticed
-- something they would previously have missed records a real result instead
-- of "didn't".
--
-- Old values are migrated rather than dropped, so existing history survives.
ALTER TABLE public.lesson_journal
  DROP CONSTRAINT IF EXISTS lesson_journal_intention_outcome_check;

UPDATE public.lesson_journal SET intention_outcome =
  CASE intention_outcome
    WHEN 'did_it' THEN 'noticed_named_did'
    WHEN 'partly' THEN 'noticed_named'
    WHEN 'didnt'  THEN 'didnt_notice'
    ELSE intention_outcome
  END
WHERE intention_outcome IS NOT NULL;

ALTER TABLE public.lesson_journal
  ADD CONSTRAINT lesson_journal_intention_outcome_check
  CHECK (intention_outcome IS NULL OR intention_outcome IN (
    'didnt_notice',        -- I didn't notice it
    'noticed_unnamed',     -- I noticed something, but couldn't name it
    'noticed_named',       -- I noticed it and named it, but didn't change anything
    'noticed_named_did'    -- I noticed it, named it, and did something about it
  ));

-- ── The 8-slide deck ──────────────────────────────────────────────────────
-- Rewrite in place: keep the stable slide_keys the client already maps, and
-- retire the merged-away ones by deactivating rather than deleting, so any
-- per-week override rows pointing at them stay resolvable.
UPDATE public.lesson_slides SET is_active = false
 WHERE slide_key IN ('todays_world', 'theme', 'exercise');

INSERT INTO public.lesson_slides
  (slide_key, position, beat, title, component_key, default_duration_seconds, applies_to_tracks)
VALUES
  ('welcome',     1, 'notice', 'Welcome + Opening Question',     'WelcomeWall',      180, '{Adult,Teen,Child}'),
  ('voices',      2, 'notice', 'Return to Your Intention',       'Voices',           300, '{Adult,Teen,Child}'),
  ('ancient',     3, 'notice', 'Inner Wisdom + In Today''s World','WisdomWorld',      360, '{Adult,Teen,Child}'),
  ('video',       4, 'name',   'This Week''s Listen',            'Video',           1200, '{Adult,Teen,Child}'),
  ('coloring',    5, 'name',   'Colouring Activity',             'Coloring',         600, '{Child}'),
  ('deeper',      6, 'name',   'Go Deeper + Together',           'Deeper',           900, '{Adult,Teen,Child}'),
  ('reflection',  7, 'name',   'Reflect & Share',                'Reflection',       480, '{Adult,Teen,Child}'),
  ('intention',   8, 'do',     'Before You Leave',               'Intention',        420, '{Adult,Teen,Child}'),
  ('affirmation', 9, 'do',     'Closing Affirmation',            'Affirmation',       60, '{Adult,Teen,Child}'),
  ('notes',      99, 'do',     'Facilitator Notes',              'FacilitatorNotes',  60, '{Adult,Teen,Child}')
ON CONFLICT (slide_key) DO UPDATE SET
  position                  = EXCLUDED.position,
  beat                      = EXCLUDED.beat,
  title                     = EXCLUDED.title,
  component_key             = EXCLUDED.component_key,
  default_duration_seconds  = EXCLUDED.default_duration_seconds,
  applies_to_tracks         = EXCLUDED.applies_to_tracks,
  is_active                 = true;

-- The colouring slide sits at position 5 for Child only; every other track
-- simply has no row applying to it, so Adult/Teen run 8 projected slides and
-- Child runs 9.

-- Verify after db push:
--   SELECT slide_key, position, title, applies_to_tracks FROM public.lesson_slides
--    WHERE is_active ORDER BY position;                       -- expect 9 rows + notes
--   SELECT count(*) FROM public.lesson_slides
--    WHERE is_active AND 'Adult' = ANY(applies_to_tracks) AND slide_key <> 'notes';  -- expect 8
--   SELECT DISTINCT intention_outcome FROM public.lesson_journal;  -- only the 4 new values
