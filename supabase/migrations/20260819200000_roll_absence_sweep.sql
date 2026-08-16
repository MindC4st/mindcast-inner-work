-- Server-side brief-absence backstop (audit G10).
--
-- The roll page's 10-minute timer is client-side; a sleeping phone cannot
-- escalate. roll-absence-sweep (cron) needs to see the latest roll state
-- across ALL rooms at once — which no room-scoped policy allows — so this
-- helper is service-role only.

CREATE OR REPLACE FUNCTION public.room_roll_latest_events(p_date date)
RETURNS TABLE (
  room               text,
  subject_profile_id uuid,
  event              text,
  departure_reason   text,
  occurred_at        timestamptz,
  display_name       text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.room, l.subject_profile_id, l.event, l.departure_reason, l.occurred_at,
         COALESCE(NULLIF(p.display_name, ''), p.first_name, p.name, 'A child')
  FROM (
    SELECT DISTINCT ON (e.room, e.subject_profile_id)
      e.room, e.subject_profile_id, e.event, e.departure_reason, e.occurred_at
    FROM public.roll_events e
    WHERE e.session_date = p_date
      AND e.subject_profile_id IS NOT NULL
      AND e.event IN ('signed_in', 'present', 'moved_in', 'departed', 'returned')
    ORDER BY e.room, e.subject_profile_id, e.occurred_at DESC, e.recorded_at DESC
  ) l
  JOIN public.profiles p ON p.id = l.subject_profile_id;
$$;

REVOKE ALL ON FUNCTION public.room_roll_latest_events(date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.room_roll_latest_events(date) TO service_role;

-- Cron schedule for roll-absence-sweep. Repo convention: registered manually.
--
-- SETUP (one-time, in the Supabase SQL editor):
--
--   Requires pg_cron + pg_net enabled and CRON_SECRET set on roll-absence-sweep.
--
-- BEGIN cron schedule block (copy into SQL editor, do not commit):
--
-- SELECT cron.schedule(
--   'mc-roll-absence-sweep',
--   '* * * * *',      -- every minute; the sweep is cheap and idempotent
--   $$
--     SELECT net.http_post(
--       url     := 'https://pjyelgogdsuiugaudecc.supabase.co/functions/v1/roll-absence-sweep',
--       headers := jsonb_build_object(
--                    'Content-Type', 'application/json',
--                    'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
--                    'x-cron-secret', '<CRON_SECRET>'
--                  ),
--       body    := '{}'::jsonb
--     );
--   $$
-- );
--
-- END cron schedule block
--
-- To unschedule later:
--   SELECT cron.unschedule('mc-roll-absence-sweep');

SELECT 1 AS roll_absence_sweep_doc_only;
