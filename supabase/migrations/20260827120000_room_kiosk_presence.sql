-- Room attendance kiosk: NFC room confirmation + roll extension.
--
-- Builds on the existing room-roll child-safety system (20260819110000). The
-- door (door-scan) answers "who entered the building" and writes
-- roll_events 'signed_in' for selected Teen/Child members, making them
-- EXPECTED in their destination room. This migration adds the room-side half:
-- "who actually arrived in this room", confirmed by bracelet scan (Teen) or
-- manual roll call (Child), without creating a second attendance system.
--
-- Identity model (important):
--   profiles.nfc_id stores the bracelet's NDEF URL token — the /b/<token>
--   value BraceletStudio writes onto the physical tag. It is NOT the tag's
--   hardware serial number. confirm_room_presence therefore resolves the
--   scanned token against profiles.nfc_id. The scanner (src/lib/nfc.ts
--   readBraceletToken) parses the NDEF URL record to obtain this token.

-- ── 1. Extend room_roll with teen_self_signout ─────────────────────────────
-- Additive: same rows/logic as before plus one boolean so the kiosk knows
-- whether a teen may sign themselves out (guardian-enabled in advance). The
-- hard enforcement still lives in record_departure; this only drives the UI.
-- Must DROP first because return type changes (added teen_self_signout).
DROP FUNCTION IF EXISTS public.room_roll(date, text);
CREATE FUNCTION public.room_roll(p_date date, p_room text)
RETURNS TABLE (
  profile_id      uuid,
  display_name    text,
  state           text,          -- expected | present | flagged | brief_absence | departed | signed_out
  last_event      text,
  departure_reason text,
  occurred_at     timestamptz,
  guardian_name   text,
  guardian_phone  text,
  teen_self_signout boolean
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest AS (
    SELECT DISTINCT ON (e.subject_profile_id)
      e.subject_profile_id, e.event, e.departure_reason, e.occurred_at
    FROM public.roll_events e
    WHERE e.session_date = p_date
      AND e.room = p_room
      AND e.subject_profile_id IS NOT NULL
      AND e.event IN ('signed_in','present','moved_in','departed','returned')
    ORDER BY e.subject_profile_id, e.occurred_at DESC, e.recorded_at DESC
  )
  SELECT
    l.subject_profile_id,
    COALESCE(NULLIF(p.display_name, ''), p.first_name, p.name, 'Unnamed') AS display_name,
    CASE
      WHEN l.event IN ('signed_in','moved_in') THEN 'expected'
      WHEN l.event IN ('present','returned') THEN 'present'
      WHEN l.event = 'departed' AND l.departure_reason = 'brief_absence' THEN 'brief_absence'
      WHEN l.event = 'departed' THEN 'signed_out'
      ELSE 'expected'
    END AS state,
    l.event,
    l.departure_reason,
    l.occurred_at,
    g.gname,
    g.gphone,
    COALESCE(ss.teen_self_signout, false) AS teen_self_signout
  FROM latest l
  JOIN public.profiles p ON p.id = l.subject_profile_id
  LEFT JOIN LATERAL (
    SELECT COALESCE(NULLIF(gp.display_name,''), gp.first_name, gp.name) AS gname, gp.phone AS gphone
    FROM public.household_members child
    JOIN public.household_members guard
      ON guard.household_id = child.household_id AND guard.role_in_household = 'guardian'
    JOIN public.profiles gp ON gp.id = guard.profile_id
    WHERE child.profile_id = l.subject_profile_id
    LIMIT 1
  ) g ON true
  LEFT JOIN LATERAL (
    SELECT hm.teen_self_signout
    FROM public.household_members hm
    WHERE hm.profile_id = l.subject_profile_id
    LIMIT 1
  ) ss ON true
  WHERE public.can_access_room_roll(p_date, p_room);
$$;

REVOKE ALL ON FUNCTION public.room_roll(date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.room_roll(date, text) TO authenticated;

-- ── 2. NFC room confirmation ───────────────────────────────────────────────
-- Resolves a scanned bracelet token to a profile, verifies they are currently
-- EXPECTED in this room (i.e. signed in at the main door and selected as
-- attending), and appends the appropriate roll event. Idempotent and
-- concurrency-safe: an advisory lock serialises scans of the same person in
-- the same room on the same day, and a repeat scan returns 'already_present'
-- instead of writing a duplicate 'present'.
--
-- It never creates an expected record: a teen who is not on today's expected
-- roll (not signed in at the door) is rejected with 'not_expected' /
-- 'wrong_room' rather than silently admitted.
--
-- Outcomes:
--   marked_present   — appended 'present' (or 'returned' after a brief absence)
--   already_present  — already confirmed in this room; no duplicate written
--   not_expected     — no expected record in any room (door sign-in missing)
--   wrong_room       — expected in a different room (returned in expected_room)
--   unknown_bracelet — token not linked to any profile
CREATE OR REPLACE FUNCTION public.confirm_room_presence(
  p_nfc_token text,
  p_room text,
  p_date date DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date
)
RETURNS TABLE (
  outcome text,
  subject_profile_id uuid,
  display_name text,
  expected_room text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles;
  v_latest_event text;
  v_latest_reason text;
  v_other_room text;
BEGIN
  IF p_room NOT IN ('Adult','Teen','Child') THEN
    RAISE EXCEPTION 'Invalid room: %', p_room;
  END IF;

  -- Same access gate as the rest of the roll: rostered facilitator for this
  -- room, the safeguarding lead, or an admin.
  IF NOT public.can_access_room_roll(p_date, p_room) THEN
    RAISE EXCEPTION 'Not rostered to %', p_room;
  END IF;

  -- Bracelet token -> profile. profiles.nfc_id holds the NDEF URL token.
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE nfc_id = p_nfc_token
  LIMIT 1;

  IF NOT FOUND THEN
    outcome := 'unknown_bracelet';
    subject_profile_id := NULL;
    display_name := NULL;
    expected_room := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Serialise concurrent scans of the same person/room/day so two readers (or
  -- a double-tap) cannot both write 'present'.
  PERFORM pg_advisory_xact_lock(
    hashtext('room_presence:' || v_profile.id::text || ':' || p_room || ':' || p_date::text)
  );

  SELECT e.event, e.departure_reason INTO v_latest_event, v_latest_reason
  FROM public.roll_events e
  WHERE e.session_date = p_date
    AND e.room = p_room
    AND e.subject_profile_id = v_profile.id
    AND e.event IN ('signed_in','present','moved_in','departed','returned')
  ORDER BY e.occurred_at DESC, e.recorded_at DESC
  LIMIT 1;

  IF v_latest_event IN ('signed_in','moved_in') THEN
    -- Expected here and not yet confirmed -> mark present.
    INSERT INTO public.roll_events (session_date, room, subject_profile_id, event, actor_user_id)
    VALUES (p_date, p_room, v_profile.id, 'present', auth.uid());
    outcome := 'marked_present';
  ELSIF v_latest_event = 'departed' AND v_latest_reason = 'brief_absence' THEN
    -- Stepped out briefly and scanned back in -> mark returned.
    INSERT INTO public.roll_events (session_date, room, subject_profile_id, event, actor_user_id)
    VALUES (p_date, p_room, v_profile.id, 'returned', auth.uid());
    outcome := 'marked_present';
  ELSIF v_latest_event IN ('present','returned') THEN
    -- Already confirmed -> idempotent, no duplicate event.
    outcome := 'already_present';
  ELSE
    -- Not expected in this room. Are they expected somewhere else today?
    SELECT x.room INTO v_other_room
    FROM (
      SELECT DISTINCT ON (e.room) e.room, e.event
      FROM public.roll_events e
      WHERE e.session_date = p_date
        AND e.room <> p_room
        AND e.subject_profile_id = v_profile.id
        AND e.event IN ('signed_in','present','moved_in','departed','returned')
      ORDER BY e.room, e.occurred_at DESC, e.recorded_at DESC
    ) x
    WHERE x.event IN ('signed_in','moved_in')
    LIMIT 1;

    IF v_other_room IS NOT NULL THEN
      outcome := 'wrong_room';
      expected_room := v_other_room;
    ELSE
      outcome := 'not_expected';
      expected_room := NULL;
    END IF;
  END IF;

  subject_profile_id := v_profile.id;
  display_name := COALESCE(NULLIF(v_profile.display_name, ''), v_profile.first_name, v_profile.name, 'Member');
  RETURN NEXT;
  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_room_presence(text, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_room_presence(text, text, date) TO authenticated;
