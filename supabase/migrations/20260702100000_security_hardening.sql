-- Security hardening (site audit 2026-07-02).
--
-- check_ins holds member display names + attendance timestamps and was
-- readable by anyone (`checkins_read_all USING (true)`). The public Welcome
-- Wall / Goal Wall displays only ever show the current session, so anonymous
-- readers only need rows from the last 24 hours. Facilitators keep full
-- history (AdminHistory / AdminPresenter).
DROP POLICY IF EXISTS "checkins_read_all" ON public.check_ins;
CREATE POLICY "checkins_read_recent_or_facilitator" ON public.check_ins
  FOR SELECT USING (
    checked_in_at > now() - interval '24 hours'
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
  );
