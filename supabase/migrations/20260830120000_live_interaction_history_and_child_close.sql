-- Bring the live deck into parity with the founder's 52-week Notion exports.
--
-- 1. The public title sync already corrected curriculum_weeks, but these three
--    mindcast_live_sessions titles still showed the older app copy.
-- 2. Adult/Teen keep their eight-slide affirmation close. Child keeps nine
--    slides, but its final beat is the active group game requested for the
--    room, not another affirmation screen.
-- 3. Whiteboards and authenticated responses become session-specific so a
--    later presentation of the same week cannot overwrite or block history.
-- 4. Durable live state stores the activity widget configuration as well as
--    the prompt, so a late joiner gets the correct survey after a reconnect.

UPDATE public.mindcast_live_sessions
   SET session_title = 'Making Space for an Ending', updated_at = now()
 WHERE week_number = 23 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions
   SET session_title = 'The Practice That Keeps Practising', updated_at = now()
 WHERE week_number = 51 AND audience = 'Teen';

UPDATE public.mindcast_live_sessions
   SET session_title = 'Ending Well', updated_at = now()
 WHERE week_number = 52 AND audience = 'Adult';

UPDATE public.lesson_slides
   SET applies_to_tracks = '{Adult,Teen}'
 WHERE slide_key = 'affirmation';

INSERT INTO public.lesson_slides
  (slide_key, position, beat, title, component_key, default_duration_seconds, applies_to_tracks)
VALUES
  ('closing_game', 9, 'do', 'The Closing Game / Activity', 'ClosingGame', 600, '{Child}')
ON CONFLICT (slide_key) DO UPDATE SET
  position = EXCLUDED.position,
  beat = EXCLUDED.beat,
  title = EXCLUDED.title,
  component_key = EXCLUDED.component_key,
  default_duration_seconds = EXCLUDED.default_duration_seconds,
  applies_to_tracks = EXCLUDED.applies_to_tracks,
  is_active = true;

-- Existing boards were unique per week/track. Give them an explicit legacy
-- room identity before changing the durable key; they remain readable in
-- history and are never silently discarded.
UPDATE public.whiteboard_snapshots
   SET session_code = 'LEGACY-W' || week_number::text || '-' || upper(audience_type)
 WHERE session_code IS NULL OR btrim(session_code) = '';

ALTER TABLE public.whiteboard_snapshots
  ADD COLUMN IF NOT EXISTS slide_key text NOT NULL DEFAULT 'deeper';

ALTER TABLE public.whiteboard_snapshots
  ALTER COLUMN session_code SET NOT NULL;

ALTER TABLE public.whiteboard_snapshots
  DROP CONSTRAINT IF EXISTS whiteboard_snapshots_week_audience_key;

ALTER TABLE public.whiteboard_snapshots
  DROP CONSTRAINT IF EXISTS whiteboard_snapshots_session_slide_key;

ALTER TABLE public.whiteboard_snapshots
  ADD CONSTRAINT whiteboard_snapshots_session_slide_key
  UNIQUE (session_code, slide_key);

CREATE INDEX IF NOT EXISTS whiteboard_snapshots_history_idx
  ON public.whiteboard_snapshots (week_number, audience_type, updated_at DESC);

ALTER TABLE public.live_session_state
  ADD COLUMN IF NOT EXISTS activity_type text,
  ADD COLUMN IF NOT EXISTS activity_options text[] NOT NULL DEFAULT '{}';

DROP INDEX IF EXISTS public.session_responses_user_week_prompt_key;
CREATE UNIQUE INDEX IF NOT EXISTS session_responses_user_session_prompt_key
  ON public.session_responses (user_id, session_code, audience_type, prompt_type)
  WHERE user_id IS NOT NULL;

-- Verify after db push:
--   SELECT slide_key FROM public.lesson_slides
--    WHERE is_active AND 'Child' = ANY(applies_to_tracks)
--      AND component_key <> 'FacilitatorNotes' ORDER BY position;
--   -- welcome, voices, ancient, video, coloring, deeper, reflection,
--   -- intention, closing_game
--   SELECT session_code, slide_key, count(*) FROM public.whiteboard_snapshots
--    GROUP BY 1,2 HAVING count(*) > 1; -- expect no rows
