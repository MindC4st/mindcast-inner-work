-- Optional facilitator-written intro text for the "Voices from Last Week"
-- slide. If empty, the slide falls back to a default header. The actual
-- reflections shown come from public.featured_callbacks (populated by the
-- Sun 9am select-weekly-callbacks cron job).

ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS previous_week_callback text DEFAULT '';
