-- Gate D: per-week cached metaphor video, with content-hash caching and an
-- approval flag so an unapproved asset never reaches a room.
ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS ancient_wisdom_hash text DEFAULT '',
  ADD COLUMN IF NOT EXISTS todays_world_hash text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ancient_wisdom_approval text DEFAULT 'unapproved',
  ADD COLUMN IF NOT EXISTS todays_world_approval text DEFAULT 'unapproved';
