-- Practice schedule columns (portal worksheet support).
--
-- The rebuilt child track runs its weekly practice on SUN (session day,
-- "today"), WED and FRI instead of MON/WED/SUN, and the portal worksheet
-- renders "SUN (TODAY)" via practice_sun_today with a fallback to
-- weekly_practice_sun. practice_midweek / practice_fri give the worksheet
-- explicit midweek slots without repurposing the legacy columns.
--
-- IF NOT EXISTS so a later migration from the portal workstream can restate
-- these without conflict.

ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS practice_sun_today text DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_midweek   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS practice_fri       text DEFAULT '';
