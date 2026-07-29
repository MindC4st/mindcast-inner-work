-- Poll options for the live "Together" activity.
--
-- activity_type already says WHICH widget a week uses (wordcloud | poll |
-- reflection | none). A poll also needs the choices. One option per line;
-- empty means the poll falls back to open text.
--
-- Fixed, facilitator-authored options are also what makes a poll safe to put on
-- the big screen with no moderation step: members can only pick from choices you
-- wrote, so there is no free text to review. (Word clouds are free text and do
-- still go through moderation — see the moderate-content function.)

ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS activity_options text DEFAULT '';

-- Sensible starting options for the weeks whose activity is a poll/spectrum, so
-- the widget is usable before anyone edits them. Facilitators can change these
-- in the lesson editor at any time.
UPDATE public.curriculum_weeks SET activity_options =
  'Social feeds' || chr(10) || 'People I know' || chr(10) || 'Family' || chr(10) || 'My past self'
  WHERE week_number = 6 AND COALESCE(activity_options,'') = '';

UPDATE public.curriculum_weeks SET activity_options =
  '1 — barely' || chr(10) || '2' || chr(10) || '3 — somewhat' || chr(10) || '4' || chr(10) || '5 — completely'
  WHERE week_number IN (10, 19, 30, 34, 42) AND COALESCE(activity_options,'') = '';

UPDATE public.curriculum_weeks SET activity_options =
  'Sleep' || chr(10) || 'Movement' || chr(10) || 'Food' || chr(10) || 'Calm'
  WHERE week_number = 30 AND COALESCE(activity_options,'') = '';

UPDATE public.curriculum_weeks SET activity_options =
  'Autumn — letting go' || chr(10) || 'Winter — the quiet' || chr(10) || 'Spring — first shoots' || chr(10) || 'Summer — in full leaf'
  WHERE week_number = 23 AND COALESCE(activity_options,'') = '';
