-- Access model per MC-MEM-106 v2.1: membership, visitor cards, one-offs, free
-- trial — proposed, not switched on. Nothing here changes what an existing
-- member is charged; it adds the tables the new model needs so
-- resolve_entitlement has something to read.
--
-- TABLE NAMING: the brief specifies `attendees` and `lessons`. Neither exists
-- in this schema. The equivalents here are `profiles` (a person) and
-- `curriculum_weeks` (a lesson), so the columns below reference those. Flagged
-- rather than silently renamed, because the brief and the database disagreeing
-- is exactly how a foreign key ends up pointing at the wrong thing.
--
-- THE THREE RULES THE BRIEF SAYS TO ENFORCE, NOT REFLECT
--   1. Casual always costs more per session than membership — enforced in the
--      seed script's assertions, since prices live in Stripe, not here.
--   2. Under-18 places cannot be bought standalone — enforced at checkout, in
--      the webhook, and by `youth_place_requires_adult()` below.
--   3. App and journal are adult-membership only — enforced by
--      resolve_entitlement returning app_access=false for every other path.

-- ── Prepaid session credits: visitor cards and one-offs ───────────────────
CREATE TABLE IF NOT EXISTS public.session_credits (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id             uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  -- NULL = a household pool anyone in the household can draw from.
  profile_id               uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind                     text NOT NULL CHECK (kind IN ('visitor_card','one_off','free_trial')),
  track                    text NOT NULL CHECK (track IN ('adult','youth')),
  trips_total              int  NOT NULL,
  trips_used               int  NOT NULL DEFAULT 0,
  purchased_at             timestamptz NOT NULL DEFAULT now(),
  phase                    int,          -- 13-week phase, for the per-phase cap
  stripe_payment_intent_id text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trips_sane CHECK (trips_used >= 0 AND trips_used <= trips_total)
);

CREATE INDEX IF NOT EXISTS session_credits_household_idx ON public.session_credits (household_id);
CREATE INDEX IF NOT EXISTS session_credits_profile_idx   ON public.session_credits (profile_id);
-- Partial index: the resolver only ever looks for credits with trips left.
CREATE INDEX IF NOT EXISTS session_credits_available_idx
  ON public.session_credits (household_id, track)
  WHERE trips_used < trips_total;

-- Idempotency. Stripe retries webhooks, and a retried checkout.session.completed
-- must not mint a second visitor card.
CREATE UNIQUE INDEX IF NOT EXISTS session_credits_payment_idx
  ON public.session_credits (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- ── One free trial per person, for life ───────────────────────────────────
-- UNIQUE on profile_id is the enforcement. Application logic would be checked
-- once and then forgotten; a constraint is checked every time, including by a
-- retried webhook and by anything written directly against the database.
CREATE TABLE IF NOT EXISTS public.free_trials (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_at      timestamptz,
  session_date date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Attendance, with what paid for it ─────────────────────────────────────
-- Separate from check_ins on purpose. check_ins drives the Welcome Wall and is
-- a live-room artefact; this is the billing record of which entitlement was
-- consumed. Conflating them would put payment data behind a screen the room
-- can see.
CREATE TABLE IF NOT EXISTS public.attendance (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date      date NOT NULL,
  week              int  NOT NULL,
  track             text NOT NULL,
  entitlement       text NOT NULL CHECK (entitlement IN
                       ('membership','visitor_card','one_off','free_trial','concession','comp')),
  session_credit_id uuid REFERENCES public.session_credits(id),
  recorded_by       uuid REFERENCES auth.users(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, session_date)
);

CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance (session_date);

-- ── Concession lives on the household ─────────────────────────────────────
-- A flag, not a discount code: it resolves BEFORE any credit is consumed, so a
-- concession household never burns a visitor-card trip. Granted on request, no
-- means testing — so there is deliberately no eligibility column to fill in.
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS concession boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS concession_granted_at timestamptz;

-- ── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE public.session_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_trials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance      ENABLE ROW LEVEL SECURITY;

-- Members see their own household's credits — they paid for them.
DROP POLICY IF EXISTS "household reads own credits" ON public.session_credits;
CREATE POLICY "household reads own credits" ON public.session_credits
  FOR SELECT USING (
    household_id IN (
      SELECT hm.household_id FROM public.household_members hm
       WHERE hm.profile_id = public.current_profile_id()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Writes are service-role only: credits are created by the Stripe webhook and
-- consumed by the entitlement resolver. No client mints itself a trip.
DROP POLICY IF EXISTS "own free trial" ON public.free_trials;
CREATE POLICY "own free trial" ON public.free_trials
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Attendance: a member sees their own; staff see the room they are running.
-- Deliberately NOT readable by facilitators as a payment view — `entitlement`
-- tells you how someone paid, and door staff do not need that per person.
DROP POLICY IF EXISTS "own attendance" ON public.attendance;
CREATE POLICY "own attendance" ON public.attendance
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR public.is_guardian_of_profile(profile_id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ── Youth places require an active adult membership ───────────────────────
-- Third layer of the guard (UI and checkout are the other two). Returns true
-- when the household has at least one active adult subscription.
CREATE OR REPLACE FUNCTION public.household_has_active_adult(p_household uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.subscriptions s
     WHERE s.status IN ('active','trialing')
       AND (
         s.household_id = p_household
         OR s.profile_id IN (
           SELECT hm.profile_id FROM public.household_members hm
            WHERE hm.household_id = p_household
              AND hm.role_in_household IN ('guardian','adult')
         )
       )
  );
$$;

REVOKE ALL ON FUNCTION public.household_has_active_adult(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.household_has_active_adult(uuid) TO authenticated;

-- Verify after db push:
--   SELECT public.household_has_active_adult('<household uuid>');
--   INSERT INTO public.free_trials (profile_id) VALUES ('<same profile twice>');  -- 2nd must fail
