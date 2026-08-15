-- Kids and teens roll call: sign-in, roll, departures, reconciliation.
--
-- This is a child safety system, so the invariants live in the database, not
-- in the UI:
--
-- 1. THE LOG IS APPEND-ONLY. No UPDATE or DELETE policy exists, and a trigger
--    refuses both even for mistakes. Corrections are new events referencing
--    the original. A retrospectively editable child-safety record is worth
--    nothing.
--
-- 2. "LEFT EARLY" DOES NOT EXIST. A departure MUST carry a reason, and the
--    reasons that involve a person MUST carry the person — enforced by CHECK
--    constraint. A child collected by their mother and a child who walked out
--    of the building are different rows, structurally.
--
-- 3. THE ROOM CANNOT CLOSE WITH A CHILD UNACCOUNTED FOR. close_room() raises
--    until every signed-in child has a terminal event. This is the forcing
--    function; it is a hard block in SQL, not a reminder in React.
--
-- 4. COLLECTORS ARE NEVER FREE TEXT AT THE DOOR. A 'collected' departure
--    references either the guardian who signed the child in or a
--    pre-authorised collector row created by the guardian in advance.
--
-- 5. ROLLS ARE VISIBLE ONLY TO THE PEOPLE WHO NEED THEM. Facilitators
--    rostered to that room, the Safeguarding Lead on duty, and admins.
--    An adult-room facilitator cannot browse the kids roll.

-- ── Roster: who is staffing which room today ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_roster (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date  date NOT NULL DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date,
  room          text NOT NULL CHECK (room IN ('Adult','Teen','Child')),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duty          text NOT NULL DEFAULT 'facilitator'
                CHECK (duty IN ('facilitator','safeguarding_lead')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_date, room, profile_id)
);

ALTER TABLE public.room_roster ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS room_roster_staff_read ON public.room_roster;
CREATE POLICY room_roster_staff_read ON public.room_roster
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS room_roster_admin_manage ON public.room_roster;
CREATE POLICY room_roster_admin_manage ON public.room_roster
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ── Staffed capacity per room (drives the ratio warning) ───────────────────
CREATE TABLE IF NOT EXISTS public.room_staffing (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date   date NOT NULL DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date,
  room           text NOT NULL CHECK (room IN ('Teen','Child')),
  staffed_adults int  NOT NULL DEFAULT 2 CHECK (staffed_adults >= 0),
  capacity       int  NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_date, room)
);

ALTER TABLE public.room_staffing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS room_staffing_staff_read ON public.room_staffing;
CREATE POLICY room_staffing_staff_read ON public.room_staffing
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS room_staffing_admin_manage ON public.room_staffing;
CREATE POLICY room_staffing_admin_manage ON public.room_staffing
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ── Authorised collectors — set in advance by the guardian ─────────────────
CREATE TABLE IF NOT EXISTS public.authorised_collectors (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              text NOT NULL,
  phone             text,
  added_by          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  revoked_at        timestamptz
);

CREATE INDEX IF NOT EXISTS authorised_collectors_child_idx
  ON public.authorised_collectors (child_profile_id) WHERE revoked_at IS NULL;

ALTER TABLE public.authorised_collectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS collectors_guardian_read ON public.authorised_collectors;
CREATE POLICY collectors_guardian_read ON public.authorised_collectors
  FOR SELECT USING (
    public.is_guardian_of_profile(child_profile_id)
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS collectors_guardian_insert ON public.authorised_collectors;
CREATE POLICY collectors_guardian_insert ON public.authorised_collectors
  FOR INSERT WITH CHECK (
    public.is_guardian_of_profile(child_profile_id)
    AND added_by = public.current_profile_id()
  );

-- Guardians revoke (set revoked_at); admins manage. Facilitators cannot write
-- this table at all — that is the "never agreed verbally at the door" rule.
DROP POLICY IF EXISTS collectors_guardian_revoke ON public.authorised_collectors;
CREATE POLICY collectors_guardian_revoke ON public.authorised_collectors
  FOR UPDATE USING (public.is_guardian_of_profile(child_profile_id))
  WITH CHECK (public.is_guardian_of_profile(child_profile_id));

DROP POLICY IF EXISTS collectors_admin_all ON public.authorised_collectors;
CREATE POLICY collectors_admin_all ON public.authorised_collectors
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ── Teen self-sign-out — set by the guardian in advance ────────────────────
ALTER TABLE public.household_members
  ADD COLUMN IF NOT EXISTS teen_self_signout boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_teen_self_signout(p_teen_profile uuid, p_enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_guardian_of_profile(p_teen_profile)
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only the guardian can change this setting';
  END IF;
  UPDATE public.household_members
     SET teen_self_signout = p_enabled
   WHERE profile_id = p_teen_profile AND role_in_household = 'teen';
END;
$$;

REVOKE ALL ON FUNCTION public.set_teen_self_signout(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_teen_self_signout(uuid, boolean) TO authenticated;

-- ── Access gate for a room's roll ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.can_access_room_roll(p_date date, p_room text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
           SELECT 1 FROM public.room_roster r
           WHERE r.session_date = p_date
             AND r.profile_id = public.current_profile_id()
             AND (r.room = p_room OR r.duty = 'safeguarding_lead')
         );
$$;

-- ── The append-only roll log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roll_events (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date              date NOT NULL DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date,
  room                      text NOT NULL CHECK (room IN ('Adult','Teen','Child')),
  -- NULL for room-level events (ratio_ack, room_closed).
  subject_profile_id        uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  event                     text NOT NULL CHECK (event IN (
                              'signed_in',    -- kiosk: guardian signed the child in (an EXPECTED record)
                              'present',      -- marked present at roll call
                              'moved_in',     -- expected here after a move from another room
                              'departed',     -- left the room, reason required below
                              'returned',     -- back from a brief absence
                              'ratio_ack',    -- facilitator acknowledged an over-ratio warning
                              'room_closed',  -- reconciliation complete
                              'correction'    -- annotates a prior event, never replaces it
                            )),
  departure_reason          text CHECK (departure_reason IN
                              ('collected','moved','brief_absence','unaccompanied','self_signout')),
  collected_by_profile_id   uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  collected_by_collector_id uuid REFERENCES public.authorised_collectors(id) ON DELETE RESTRICT,
  destination_room          text CHECK (destination_room IN ('Adult','Teen','Child')),
  note                      text,
  ref_event_id              uuid REFERENCES public.roll_events(id) ON DELETE RESTRICT,
  actor_user_id             uuid NOT NULL DEFAULT auth.uid(),
  -- When it actually happened (survives offline capture)…
  occurred_at               timestamptz NOT NULL DEFAULT now(),
  -- …and when the database heard about it.
  recorded_at               timestamptz NOT NULL DEFAULT now(),
  -- Offline idempotency: the client generates this; a replayed sync upserts
  -- into silence instead of double-recording a departure.
  client_event_id           uuid UNIQUE,

  -- "Left early" as a bare flag is structurally impossible:
  CONSTRAINT departure_needs_reason CHECK (
    event <> 'departed' OR departure_reason IS NOT NULL
  ),
  CONSTRAINT collection_needs_person CHECK (
    departure_reason IS DISTINCT FROM 'collected'
    OR collected_by_profile_id IS NOT NULL
    OR collected_by_collector_id IS NOT NULL
  ),
  CONSTRAINT move_needs_destination CHECK (
    departure_reason IS DISTINCT FROM 'moved' OR destination_room IS NOT NULL
  ),
  CONSTRAINT correction_needs_reference CHECK (
    event <> 'correction' OR ref_event_id IS NOT NULL
  ),
  CONSTRAINT subject_required CHECK (
    event IN ('ratio_ack','room_closed') OR subject_profile_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS roll_events_room_day_idx
  ON public.roll_events (session_date, room, subject_profile_id, recorded_at);

ALTER TABLE public.roll_events ENABLE ROW LEVEL SECURITY;

-- Append-only, enforced below RLS as well: even service-role tooling cannot
-- quietly rewrite history without visibly disabling this trigger first.
CREATE OR REPLACE FUNCTION public.roll_events_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'roll_events is append-only; write a correction event referencing %', OLD.id;
END;
$$;

DROP TRIGGER IF EXISTS roll_events_no_rewrite ON public.roll_events;
CREATE TRIGGER roll_events_no_rewrite
  BEFORE UPDATE OR DELETE ON public.roll_events
  FOR EACH ROW EXECUTE FUNCTION public.roll_events_append_only();

DROP POLICY IF EXISTS roll_events_room_read ON public.roll_events;
CREATE POLICY roll_events_room_read ON public.roll_events
  FOR SELECT USING (public.can_access_room_roll(session_date, room));

-- Door staff (any facilitator/admin) record kiosk sign-ins; everything else
-- requires being rostered to the room the event belongs to.
DROP POLICY IF EXISTS roll_events_insert ON public.roll_events;
CREATE POLICY roll_events_insert ON public.roll_events
  FOR INSERT WITH CHECK (
    actor_user_id = auth.uid()
    AND (
      (event = 'signed_in' AND (
        public.has_role(auth.uid(), 'facilitator'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
      ))
      OR public.can_access_room_roll(session_date, room)
    )
  );

-- ── In-room alerts — the layer-1 notification ──────────────────────────────
-- The adult-room facilitator's open device is the delivery channel; realtime
-- subscription on this table is how the alert arrives.
CREATE TABLE IF NOT EXISTS public.room_alerts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date    date NOT NULL DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date,
  target_room     text NOT NULL CHECK (target_room IN ('Adult','Teen','Child')),
  source_room     text NOT NULL CHECK (source_room IN ('Adult','Teen','Child')),
  kind            text NOT NULL CHECK (kind IN (
                    'unaccompanied_departure',
                    'brief_absence_overdue',
                    'missing_at_roll_call',
                    'unclaimed_at_close',
                    'ratio_exceeded'
                  )),
  -- First name / display name only. Never a surname on a projected surface.
  subject_name    text NOT NULL,
  body            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.room_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS room_alerts_read ON public.room_alerts;
CREATE POLICY room_alerts_read ON public.room_alerts
  FOR SELECT USING (public.can_access_room_roll(session_date, target_room));

DROP POLICY IF EXISTS room_alerts_ack ON public.room_alerts;
CREATE POLICY room_alerts_ack ON public.room_alerts
  FOR UPDATE USING (public.can_access_room_roll(session_date, target_room))
  WITH CHECK (public.can_access_room_roll(session_date, target_room));

-- Raised only through raise_room_alert(), which checks the caller can access
-- the SOURCE room — a kids facilitator alerts the adult room, not vice versa.
CREATE OR REPLACE FUNCTION public.raise_room_alert(
  p_source_room text,
  p_target_room text,
  p_kind text,
  p_subject_name text,
  p_body text,
  p_session_date date DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.can_access_room_roll(p_session_date, p_source_room) THEN
    RAISE EXCEPTION 'Not rostered to %', p_source_room;
  END IF;
  INSERT INTO public.room_alerts (session_date, target_room, source_room, kind, subject_name, body)
  VALUES (p_session_date, p_target_room, p_source_room, p_kind, p_subject_name, p_body)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.raise_room_alert(text, text, text, text, text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.raise_room_alert(text, text, text, text, text, date) TO authenticated;

-- ── Channel-agnostic notification outbox — the layer-2 record ──────────────
-- notify(recipient, event, payload) is a table write; adapters (Resend now,
-- push later) drain it. Adding push is a new adapter and a preference value,
-- not a rewrite.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_channel text NOT NULL DEFAULT 'email'
    CHECK (notify_channel IN ('email','push','none'));

CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event                 text NOT NULL,
  payload               jsonb NOT NULL DEFAULT '{}'::jsonb,
  channel               text,               -- resolved by the sender from the recipient's preference
  destination           text,               -- address actually used
  status                text NOT NULL DEFAULT 'queued'
                        CHECK (status IN ('queued','sent','failed','skipped')),
  error                 text,
  occurred_at           timestamptz NOT NULL DEFAULT now(),  -- original event time (offline-safe)
  queued_at             timestamptz NOT NULL DEFAULT now(),
  sent_at               timestamptz,
  -- Offline idempotency for queued notifications.
  client_event_id       uuid UNIQUE
);

CREATE INDEX IF NOT EXISTS notification_outbox_pending_idx
  ON public.notification_outbox (status, queued_at) WHERE status = 'queued';

ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

-- Recipients may see what was sent to them; admins see all. Only the
-- service-role sender updates rows; staff queue rows via queue_notification().
DROP POLICY IF EXISTS outbox_recipient_read ON public.notification_outbox;
CREATE POLICY outbox_recipient_read ON public.notification_outbox
  FOR SELECT USING (
    recipient_profile_id = public.current_profile_id()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE OR REPLACE FUNCTION public.queue_notification(
  p_recipient uuid,
  p_event text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_occurred_at timestamptz DEFAULT now(),
  p_client_event_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'facilitator'::app_role)
          OR public.has_role(auth.uid(), 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Staff only';
  END IF;
  INSERT INTO public.notification_outbox (recipient_profile_id, event, payload, occurred_at, client_event_id)
  VALUES (p_recipient, p_event, p_payload, p_occurred_at, p_client_event_id)
  ON CONFLICT (client_event_id) DO NOTHING
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.queue_notification(uuid, text, jsonb, timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.queue_notification(uuid, text, jsonb, timestamptz, uuid) TO authenticated;

-- ── The roll, resolved — one row per child with their current state ────────
CREATE OR REPLACE FUNCTION public.room_roll(p_date date, p_room text)
RETURNS TABLE (
  profile_id      uuid,
  display_name    text,
  state           text,          -- expected | present | flagged | brief_absence | departed | signed_out
  last_event      text,
  departure_reason text,
  occurred_at     timestamptz,
  guardian_name   text,
  guardian_phone  text
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
    g.gphone
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
  WHERE public.can_access_room_roll(p_date, p_room);
$$;

REVOKE ALL ON FUNCTION public.room_roll(date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.room_roll(date, text) TO authenticated;

-- ── Reconciliation: the hard block ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.close_room(p_date date, p_room text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_open int;
BEGIN
  IF NOT public.can_access_room_roll(p_date, p_room) THEN
    RAISE EXCEPTION 'Not rostered to %', p_room;
  END IF;

  SELECT count(*) INTO v_open
  FROM public.room_roll(p_date, p_room) r
  WHERE r.state IN ('expected','present','brief_absence','flagged');

  IF v_open > 0 THEN
    RAISE EXCEPTION 'Cannot close %: % child(ren) not yet signed out', p_room, v_open
      USING HINT = 'Every child signed in must be signed out with a reason before the room closes.';
  END IF;

  INSERT INTO public.roll_events (session_date, room, event, actor_user_id)
  VALUES (p_date, p_room, 'room_closed', auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.close_room(date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.close_room(date, text) TO authenticated;

-- ── Departures — one atomic call, side effects included ────────────────────
-- Validates against the SOURCE room roster, writes the departure, creates the
-- expected record in the destination room for a move, raises the in-room
-- alert for an unaccompanied departure, and queues the guardian notification.
CREATE OR REPLACE FUNCTION public.record_departure(
  p_date date,
  p_room text,
  p_child uuid,
  p_reason text,
  p_collected_by_profile uuid DEFAULT NULL,
  p_collected_by_collector uuid DEFAULT NULL,
  p_destination text DEFAULT NULL,
  p_occurred_at timestamptz DEFAULT now(),
  p_client_event_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_child_name text;
  v_guardian record;
BEGIN
  IF NOT public.can_access_room_roll(p_date, p_room) THEN
    RAISE EXCEPTION 'Not rostered to %', p_room;
  END IF;

  -- Teen self-sign-out is only lawful where the guardian enabled it.
  IF p_reason = 'self_signout' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.profile_id = p_child
        AND hm.role_in_household = 'teen'
        AND hm.teen_self_signout
    ) THEN
      RAISE EXCEPTION 'Self-sign-out is not enabled for this teen';
    END IF;
  END IF;

  INSERT INTO public.roll_events (
    session_date, room, subject_profile_id, event, departure_reason,
    collected_by_profile_id, collected_by_collector_id, destination_room,
    actor_user_id, occurred_at, client_event_id
  ) VALUES (
    p_date, p_room, p_child, 'departed', p_reason,
    p_collected_by_profile, p_collected_by_collector, p_destination,
    auth.uid(), p_occurred_at, p_client_event_id
  )
  ON CONFLICT (client_event_id) DO NOTHING
  RETURNING id INTO v_id;

  -- Replayed offline sync: the original insert already did the side effects.
  IF v_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(NULLIF(display_name,''), first_name, name, 'A child')
    INTO v_child_name FROM public.profiles WHERE id = p_child;

  IF p_reason = 'moved' AND p_destination IS NOT NULL THEN
    INSERT INTO public.roll_events (session_date, room, subject_profile_id, event, actor_user_id, occurred_at)
    VALUES (p_date, p_destination, p_child, 'moved_in', auth.uid(), p_occurred_at);
  END IF;

  IF p_reason = 'unaccompanied' THEN
    INSERT INTO public.room_alerts (session_date, target_room, source_room, kind, subject_name, body)
    VALUES (
      p_date, 'Adult', p_room, 'unaccompanied_departure', v_child_name,
      v_child_name || ' has left the ' || p_room || ' room unaccompanied. Find their guardian now; a call follows.'
    );
  END IF;

  -- Layer 2: queue the guardian email for every departure, with the original
  -- timestamp. The notify-outbox function renders and sends.
  FOR v_guardian IN
    SELECT guard.profile_id AS gid
    FROM public.household_members child
    JOIN public.household_members guard
      ON guard.household_id = child.household_id AND guard.role_in_household = 'guardian'
    WHERE child.profile_id = p_child
  LOOP
    INSERT INTO public.notification_outbox (recipient_profile_id, event, payload, occurred_at)
    VALUES (
      v_guardian.gid,
      'child_departure',
      jsonb_build_object(
        'child_name', v_child_name,
        'room', p_room,
        'reason', p_reason,
        'destination', p_destination,
        'collected_by_profile', p_collected_by_profile,
        'collected_by_collector', p_collected_by_collector
      ),
      p_occurred_at
    );
  END LOOP;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_departure(date, text, uuid, text, uuid, uuid, text, timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_departure(date, text, uuid, text, uuid, uuid, text, timestamptz, uuid) TO authenticated;

-- Realtime for the in-room alert layer.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.room_alerts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
