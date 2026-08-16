-- Concession membership requests + annual-report counters.
--
-- Charter commitments this migration makes real:
--
-- 1. CONCESSION IS ONE STEP AND NOBODY EXPLAINS THEMSELVES.
--    The table deliberately has NO reason/explanation column. "You do not
--    have to explain your circumstances" is a hard limit, so the schema
--    physically cannot store an explanation — a UI that asked for one would
--    have nowhere to put it.
--
-- 2. CONCESSION STATUS IS NEVER VISIBLE TO OTHER MEMBERS.
--    RLS: the member sees only their own row; admins see all. There is no
--    path by which another member, a facilitator or a welcome wall can read
--    concession status.
--
-- 3. THE ANNUAL MEMBER SUMMARY PUBLISHES TRIAL AND CONCESSION NUMBERS.
--    annual_report_counters() returns aggregate counts only — no names, no
--    ids — so the number exists the day it is needed.

CREATE TABLE IF NOT EXISTS public.concession_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'requested'
                CHECK (status IN ('requested', 'active', 'declined', 'ended')),
  requested_at  timestamptz NOT NULL DEFAULT now(),
  decided_at    timestamptz,
  decided_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- One live request/place per person; a new request is allowed after an old
-- one has been declined or has ended.
CREATE UNIQUE INDEX IF NOT EXISTS concession_requests_one_live
  ON public.concession_requests (user_id)
  WHERE status IN ('requested', 'active');

ALTER TABLE public.concession_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS concession_own_read ON public.concession_requests;
CREATE POLICY concession_own_read ON public.concession_requests
  FOR SELECT USING (auth.uid() = user_id);

-- A member can raise a request for themselves and nothing else: status is
-- pinned to 'requested' so self-service cannot self-activate a concession.
DROP POLICY IF EXISTS concession_own_request ON public.concession_requests;
CREATE POLICY concession_own_request ON public.concession_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'requested');

DROP POLICY IF EXISTS concession_admin_all ON public.concession_requests;
CREATE POLICY concession_admin_all ON public.concession_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ── Annual report counters ─────────────────────────────────────────────────
-- Aggregate-only, admin-only. SECURITY DEFINER so it can count across tables
-- the caller cannot read row-by-row; the role gate inside is the guard.
CREATE OR REPLACE FUNCTION public.annual_report_counters(
  p_from timestamptz DEFAULT date_trunc('year', now()),
  p_to   timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  RETURN jsonb_build_object(
    'from', p_from,
    'to', p_to,
    'trial_passes_issued', (
      SELECT count(*) FROM public.trial_tickets
      WHERE created_at >= p_from AND created_at < p_to
    ),
    'trial_passes_redeemed', (
      SELECT count(*) FROM public.trial_tickets
      WHERE redeemed_at >= p_from AND redeemed_at < p_to
    ),
    'concession_places_active', (
      SELECT count(*) FROM public.concession_requests WHERE status = 'active'
    ),
    'concession_requests_waiting', (
      SELECT count(*) FROM public.concession_requests WHERE status = 'requested'
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.annual_report_counters(timestamptz, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.annual_report_counters(timestamptz, timestamptz) TO authenticated;
