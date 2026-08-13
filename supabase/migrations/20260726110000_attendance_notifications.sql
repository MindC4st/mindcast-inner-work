-- Attendance notifications to a linked adult.
--
-- Policy: business/07_session_operations.md §3. For under-18s only, the linked
-- guardian is told three things and nothing more:
--   "X marked present today"   "X was not marked present"   "X left early"
-- Never what the young person said, wrote, or reflected on.
--
-- This adds the data backbone: a left-early state, a guardian contact number,
-- an outbound notification log (audit trail + dedupe), and a helper that lists
-- the guardians to notify for a given young person.

-- ---------------------------------------------------------------------------
-- 1. Left-early state on the check-in.
-- ---------------------------------------------------------------------------
ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS left_early_at timestamptz,
  ADD COLUMN IF NOT EXISTS left_early_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2. Guardian contact + per-guardian opt-out.
--    (Suggested in the ops doc: a 16+ teen's guardian may choose to step back
--    from present/absent pings while keeping left-early.)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_sms boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_attendance_present boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_attendance_absent  boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- 3. Outbound log — one row per message we attempt.
--    Written only by the service-role notifier; readable by the guardian it was
--    sent to (so a parent can see the record in the portal) and by admins.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The young person the message is about.
  subject_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- The guardian we notified.
  guardian_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Pacific/Auckland')::date,
  event text NOT NULL CHECK (event IN ('present','absent','left_early')),
  channel text NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms','email','none')),
  destination text,                 -- phone/email actually used
  body text NOT NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','sent','failed','skipped')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- One message per young person, per event, per day — makes the sweep and any
  -- retry safely idempotent.
  UNIQUE (subject_profile_id, guardian_profile_id, session_date, event)
);

CREATE INDEX IF NOT EXISTS attendance_notifications_subject_idx
  ON public.attendance_notifications (subject_profile_id, session_date);
CREATE INDEX IF NOT EXISTS attendance_notifications_guardian_idx
  ON public.attendance_notifications (guardian_profile_id, session_date);

ALTER TABLE public.attendance_notifications ENABLE ROW LEVEL SECURITY;

-- The guardian who was notified can read their own messages; admins read all.
-- No INSERT/UPDATE policy => only the service-role notifier writes.
DROP POLICY IF EXISTS "attendance_notifications_read" ON public.attendance_notifications;
CREATE POLICY "attendance_notifications_read" ON public.attendance_notifications
  FOR SELECT USING (
    guardian_profile_id = public.current_profile_id()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ---------------------------------------------------------------------------
-- 4. Who do we notify for this young person?
--    Returns the guardians linked to them via their household, with contact
--    details and their per-event preferences. SECURITY DEFINER so the
--    service-role notifier can resolve it in one call.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guardians_to_notify(target_profile uuid)
RETURNS TABLE (
  guardian_profile_id uuid,
  phone text,
  email text,
  notify_sms boolean,
  notify_present boolean,
  notify_absent boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT gp.id, gp.phone, gp.email,
         gp.notify_sms, gp.notify_attendance_present, gp.notify_attendance_absent
  FROM public.household_members child
  JOIN public.household_members guardian
    ON guardian.household_id = child.household_id
   AND guardian.role_in_household = 'guardian'
  JOIN public.profiles gp ON gp.id = guardian.profile_id
  WHERE child.profile_id = target_profile
    AND child.role_in_household IN ('child','teen');
$$;

REVOKE ALL ON FUNCTION public.guardians_to_notify(uuid) FROM public, anon, authenticated;
