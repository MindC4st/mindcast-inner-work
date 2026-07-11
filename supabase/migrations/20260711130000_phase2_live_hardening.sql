-- Phase 2 — live-engine hardening.
--
-- 1. session_responses privacy: facilitators were able to read EVERY response,
--    including members' private (is_public=false) coursebook reflections. Scope
--    staff read to shared rows only, and let members read their own back.
-- 2. live_session_state: a durable "current slide" per session so late joiners
--    and reconnects resolve state without waiting for the presenter to re-emit.
-- 3. Q&A rate limiting: stop a bad actor or bug flooding a live session's feed.
-- 4. scheduled_sessions: parallel adult/teen/child tracks as first-class rows so
--    the member dashboard can show "today's session for my track".

-- ===========================================================================
-- 1. session_responses — private reflections stay private
-- ===========================================================================
DROP POLICY IF EXISTS "responses_facilitator_read" ON public.session_responses;

-- Staff (facilitator or admin) see only rows the member chose to share.
CREATE POLICY "responses_staff_read_public" ON public.session_responses
  FOR SELECT USING (
    is_public = true
    AND (
      public.has_role(auth.uid(), 'facilitator'::app_role)
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Members read their own reflections back — this is their coursebook.
CREATE POLICY "responses_own_read" ON public.session_responses
  FOR SELECT USING (user_id = auth.uid());

-- Let admins moderate/delete alongside facilitators.
DROP POLICY IF EXISTS "responses_facilitator_manage" ON public.session_responses;
CREATE POLICY "responses_staff_manage" ON public.session_responses
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "responses_facilitator_delete" ON public.session_responses;
CREATE POLICY "responses_staff_delete" ON public.session_responses
  FOR DELETE USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ===========================================================================
-- 2. live_session_state — durable current slide/prompt per session code
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.live_session_state (
  session_code text PRIMARY KEY,
  week_number int,
  audience text,
  current_slide int NOT NULL DEFAULT 0,
  prompt_type text NOT NULL DEFAULT 'idle',
  prompt_text text,
  title text,
  is_live boolean NOT NULL DEFAULT true,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.live_session_state ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous spectators in the room) can read live state.
DROP POLICY IF EXISTS "live_state_read" ON public.live_session_state;
CREATE POLICY "live_state_read" ON public.live_session_state
  FOR SELECT USING (true);

-- Only staff write it.
DROP POLICY IF EXISTS "live_state_staff_write" ON public.live_session_state;
CREATE POLICY "live_state_staff_write" ON public.live_session_state
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_session_state;
ALTER TABLE public.live_session_state REPLICA IDENTITY FULL;

-- ===========================================================================
-- 3. Q&A rate limiting (BEFORE INSERT trigger, SECURITY DEFINER so it can
--    count rows regardless of the caller's RLS).
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.session_responses_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor text;
  recent int;
BEGIN
  actor := COALESCE(NEW.user_id::text, NEW.display_name, 'anon');

  -- Per-actor: at most one submission every 4 seconds in a given session.
  SELECT count(*) INTO recent
  FROM public.session_responses
  WHERE session_code = NEW.session_code
    AND COALESCE(user_id::text, display_name, 'anon') = actor
    AND created_at > now() - interval '4 seconds';
  IF recent >= 1 THEN
    RAISE EXCEPTION 'Please wait a moment before submitting again.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Whole-session flood cap: 60 submissions / 10s across everyone.
  SELECT count(*) INTO recent
  FROM public.session_responses
  WHERE session_code = NEW.session_code
    AND created_at > now() - interval '10 seconds';
  IF recent >= 60 THEN
    RAISE EXCEPTION 'The room is busy — please try again shortly.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_session_responses_rate_limit ON public.session_responses;
CREATE TRIGGER trg_session_responses_rate_limit
  BEFORE INSERT ON public.session_responses
  FOR EACH ROW EXECUTE FUNCTION public.session_responses_rate_limit();

-- ===========================================================================
-- 4. scheduled_sessions — parallel tracks per day
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.scheduled_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  track text NOT NULL CHECK (track IN ('Adult','Teen','Child')),
  week_number int NOT NULL,
  room text,
  session_code text,
  starts_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','live','ended','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_date, track)
);
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scheduled_read" ON public.scheduled_sessions;
CREATE POLICY "scheduled_read" ON public.scheduled_sessions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "scheduled_staff_manage" ON public.scheduled_sessions;
CREATE POLICY "scheduled_staff_manage" ON public.scheduled_sessions
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER update_scheduled_sessions_updated_at
  BEFORE UPDATE ON public.scheduled_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
