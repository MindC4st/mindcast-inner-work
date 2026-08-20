-- MC-MEM-106 v2.1 — prepaid session credits, free trials, attendance.
-- PROPOSAL: schema only. No pricing goes live until the founder and
-- accountant confirm GST treatment.
--
-- Model:
--   * Visitor cards and one-offs are prepaid credits on the household.
--   * One free trial per person, for life — enforced by a UNIQUE constraint,
--     not application logic.
--   * Attendance records which entitlement paid for each session.
--   * Concession is a household flag (granted on request, no means testing);
--     it resolves before any credit is consumed.
--
-- The spec's attendee is a person who attends — a profile (account holder or
-- household member) or a guest without an account. public.attendees links to
-- profiles where one exists; door-scan / nfc-checkin integration follows in a
-- later change (check_ins keeps working unchanged until then).

-- ── Attendees ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  household_id uuid REFERENCES public.households(id) ON DELETE SET NULL,
  display_name text NOT NULL DEFAULT '',
  track text NOT NULL DEFAULT 'adult' CHECK (track IN ('adult', 'youth')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attendees_household_idx ON public.attendees (household_id);

-- ── Concession: a household flag, not a discount code ─────────────────────
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS concession_granted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS concession_granted_at timestamptz,
  ADD COLUMN IF NOT EXISTS concession_granted_by uuid REFERENCES auth.users(id);

-- ── Prepaid session credits: visitor cards and one-offs ───────────────────
CREATE TABLE IF NOT EXISTS public.session_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  attendee_id uuid REFERENCES public.attendees(id),   -- null = household pool
  kind text NOT NULL CHECK (kind IN ('visitor_card', 'one_off', 'free_trial')),
  track text NOT NULL CHECK (track IN ('adult', 'youth')),
  trips_total int NOT NULL,
  trips_used int NOT NULL DEFAULT 0,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  phase int,                                          -- for the per-phase cap
  stripe_payment_intent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trips_sane CHECK (trips_used >= 0 AND trips_used <= trips_total)
);
CREATE INDEX IF NOT EXISTS session_credits_household_idx
  ON public.session_credits (household_id, track, kind);
CREATE INDEX IF NOT EXISTS session_credits_attendee_idx
  ON public.session_credits (attendee_id);

-- ── One free trial per person, for life ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.free_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid NOT NULL UNIQUE REFERENCES public.attendees(id),
  used_at timestamptz,
  session_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Attendance, with what paid for it ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid NOT NULL REFERENCES public.attendees(id),
  session_date date NOT NULL,
  week int NOT NULL,
  track text NOT NULL,
  entitlement text NOT NULL CHECK (entitlement IN
    ('membership', 'visitor_card', 'one_off', 'free_trial', 'concession', 'comp')),
  session_credit_id uuid REFERENCES public.session_credits(id),
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attendee_id, session_date)
);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance (session_date);

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Members see their own attendee row and their household's data; nothing
-- about payment status is ever exposed to a room-facing surface (display
-- wall, kiosk). Staff roles manage via the existing has_role helper.
DROP POLICY IF EXISTS "attendees_own_or_household" ON public.attendees;
CREATE POLICY "attendees_own_or_household" ON public.attendees
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = attendees.household_id
        AND hm.profile_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS "session_credits_household_read" ON public.session_credits;
CREATE POLICY "session_credits_household_read" ON public.session_credits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = session_credits.household_id
        AND hm.profile_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS "free_trials_own" ON public.free_trials;
CREATE POLICY "free_trials_own" ON public.free_trials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attendees a
      WHERE a.id = free_trials.attendee_id
        AND a.profile_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS "attendance_household_read" ON public.attendance;
CREATE POLICY "attendance_household_read" ON public.attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attendees a
      JOIN public.household_members hm ON hm.household_id = a.household_id
      WHERE a.id = attendance.attendee_id
        AND hm.profile_id = public.current_profile_id()
    )
  );

DROP POLICY IF EXISTS "attendees_staff_manage" ON public.attendees;
CREATE POLICY "attendees_staff_manage" ON public.attendees
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'facilitator'::app_role));

DROP POLICY IF EXISTS "session_credits_staff_manage" ON public.session_credits;
CREATE POLICY "session_credits_staff_manage" ON public.session_credits
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'facilitator'::app_role));

DROP POLICY IF EXISTS "free_trials_staff_manage" ON public.free_trials;
CREATE POLICY "free_trials_staff_manage" ON public.free_trials
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'facilitator'::app_role));

DROP POLICY IF EXISTS "attendance_staff_manage" ON public.attendance;
CREATE POLICY "attendance_staff_manage" ON public.attendance
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'facilitator'::app_role));
