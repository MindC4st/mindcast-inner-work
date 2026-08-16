-- Rate limiting (audit G6) — database-level flood protection.
--
-- Edge functions get their own per-instance IP limiters, but the Q&A path is
-- a direct table insert, so its guard lives here where every client must
-- pass it: a sliding one-minute window per user on session_responses.
--
-- The rate_limits table has RLS enabled and NO policies — it is only
-- reachable through the SECURITY DEFINER helper, which runs as the table
-- owner. Members cannot read or tamper with the counters.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count        int NOT NULL DEFAULT 1
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rate_limit_check(
  p_key text,
  p_max int,
  p_window_seconds int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    window_start = CASE
      WHEN now() - rate_limits.window_start > make_interval(secs => p_window_seconds)
        THEN now()
        ELSE rate_limits.window_start
      END,
    count = CASE
      WHEN now() - rate_limits.window_start > make_interval(secs => p_window_seconds)
        THEN 1
        ELSE rate_limits.count + 1
      END
  RETURNING rate_limits.count INTO v_count;

  IF v_count > p_max THEN
    RAISE EXCEPTION 'Rate limit exceeded — please slow down.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_check(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, int, int) TO authenticated, anon;

-- Q&A submissions: 12 per minute per identity is far above legitimate use
-- (a member submits one response at a time) but never touches real usage.
CREATE OR REPLACE FUNCTION public.session_responses_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.rate_limit_check(
    COALESCE(auth.uid()::text, 'anon-shared') || ':session_responses',
    12,
    60
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS session_responses_rate_limit ON public.session_responses;
CREATE TRIGGER session_responses_rate_limit
  BEFORE INSERT ON public.session_responses
  FOR EACH ROW EXECUTE FUNCTION public.session_responses_rate_limit();

-- Opportunistic housekeeping: drop windows older than a day.
DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';
