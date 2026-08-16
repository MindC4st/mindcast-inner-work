-- Gate F: facilitator pre-downloaded local video for the 20-minute curated
-- piece (venue wifi will fail; a local file must be usable).
ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS video_local_url text DEFAULT '';
