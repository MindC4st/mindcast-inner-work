-- Email schedules: SQL functions that queue non-transactional notifications
-- into notification_outbox, drained by the existing notify-outbox cron.
--
-- These replace the old edge-function-direct-send pattern (send-weekly-reminder,
-- send-practice-reminder) with queue-then-drain. The notify-outbox function
-- renders via the new _shared/email/ template system + Resend.
--
-- Prerequisites (already in place):
--   - queue_notification() RPC (migration 20260819110000)
--   - marketing_opt_out column on profiles (migration 20260819170000)
--   - notify-outbox cron drain (migration 20260819150000)
--   - pg_cron + pg_net extensions enabled

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Session weekly reminder — "this Sunday" email
--    Queued every Thursday evening (NZST Fri 06:00 = UTC Thu 18:00)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.queue_session_reminders()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session record;
  v_member record;
  v_callback text;
  v_intention text;
  v_count int := 0;
BEGIN
  -- Find the next Sunday session
  SELECT s.id, s.session_date, s.week_number, cw.weekly_theme,
         'Great Lake Centre' AS venue_name,
         'Taupō' AS venue_address
  INTO v_session
  FROM public.scheduled_sessions s
  JOIN public.curriculum_weeks cw ON cw.week_number = s.week_number
  WHERE s.session_date >= CURRENT_DATE
    AND s.session_date <= CURRENT_DATE + INTERVAL '4 days'
  ORDER BY s.session_date ASC
  LIMIT 1;

  IF v_session IS NULL THEN
    RETURN 0;
  END IF;

  -- Previous week's callback line
  SELECT previous_week_callback INTO v_callback
  FROM public.mindcast_live_sessions
  WHERE week_number = v_session.week_number AND audience = 'Adult'
  LIMIT 1;

  -- Queue for each active adult + teen member
  FOR v_member IN
    SELECT p.id, p.first_name
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'member'
      AND p.membership_status = 'active'
      AND p.marketing_opt_out = false
  LOOP
    -- Member's own intention from last week
    SELECT weekly_intention INTO v_intention
    FROM public.lesson_journal
    WHERE profile_id = v_member.id
    ORDER BY created_at DESC
    LIMIT 1;

    PERFORM public.queue_notification(
      v_member.id,
      'session.weekly_reminder',
      jsonb_build_object(
        'first_name', v_member.first_name,
        'weekly_theme', v_session.weekly_theme,
        'session_date', to_char(v_session.session_date, 'Day, DD Mon'),
        'venue_name', v_session.venue_name,
        'venue_address', v_session.venue_address,
        'callback_line', COALESCE(v_callback, ''),
        'intention_text', COALESCE(v_intention, '')
      ),
      now(),
      NULL
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Midweek practice reminder
--    Queued every Wednesday (NZST Wed 09:00 = UTC Tue 20:00)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.queue_practice_reminders()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member record;
  v_count int := 0;
BEGIN
  FOR v_member IN
    SELECT p.id, p.first_name, lj.weekly_intention
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    LEFT JOIN public.lesson_journal lj ON lj.profile_id = p.id
      AND lj.created_at >= CURRENT_DATE - INTERVAL '7 days'
    WHERE ur.role = 'member'
      AND p.membership_status = 'active'
      AND p.marketing_opt_out = false
      AND lj.weekly_intention IS NOT NULL
  LOOP
    PERFORM public.queue_notification(
      v_member.id,
      'practice.midweek',
      jsonb_build_object(
        'first_name', v_member.first_name,
        'intention_text', v_member.weekly_intention
      ),
      now(),
      NULL
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Absence notice — 2 consecutive Sundays missed
--    Queued every Monday (NZST Mon 09:00 = UTC Sun 20:00)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.queue_absence_notices()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member record;
  v_count int := 0;
BEGIN
  FOR v_member IN
    SELECT p.id, p.first_name
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'member'
      AND p.membership_status = 'active'
      AND p.marketing_opt_out = false
      AND NOT EXISTS (
        SELECT 1 FROM public.check_ins ci
        WHERE ci.profile_id = p.id
          AND ci.checked_in_at >= CURRENT_DATE - INTERVAL '14 days'
      )
  LOOP
    PERFORM public.queue_notification(
      v_member.id,
      'attendance.absent_two_weeks',
      jsonb_build_object('first_name', v_member.first_name),
      now(),
      NULL
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Cron schedules — paste into the Supabase SQL editor (pg_cron runs in UTC)
-- ────────────────────────────────────────────────────────────────────────────
-- BEGIN cron schedule block (copy into SQL editor, do not commit):
--
-- -- Session reminder: Thu 18:00 UTC = Fri 06:00 NZST
-- SELECT cron.schedule(
--   'session-weekly-reminder',
--   '0 18 * * 4',
--   $$ SELECT public.queue_session_reminders(); $$
-- );
--
-- -- Practice reminder: Tue 20:00 UTC = Wed 09:00 NZST
-- SELECT cron.schedule(
--   'practice-midweek-reminder',
--   '0 20 * * 2',
--   $$ SELECT public.queue_practice_reminders(); $$
-- );
--
-- -- Absence notice: Sun 20:00 UTC = Mon 09:00 NZST
-- SELECT cron.schedule(
--   'absence-two-weeks',
--   '0 20 * * 0',
--   $$ SELECT public.queue_absence_notices(); $$
-- );
--
-- END cron schedule block

SELECT 1 AS cron_schedule_doc_only;
