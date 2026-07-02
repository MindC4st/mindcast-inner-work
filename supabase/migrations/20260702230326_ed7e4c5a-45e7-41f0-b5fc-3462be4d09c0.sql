
DROP POLICY IF EXISTS "Anyone can insert registration" ON public.pilot_registrations;
CREATE POLICY "Anyone can insert registration"
  ON public.pilot_registrations FOR INSERT
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND length(first_name) BETWEEN 1 AND 100
    AND length(last_name)  BETWEEN 1 AND 100
    AND length(email)      BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone IS NULL OR length(phone) <= 40)
  );

DROP POLICY IF EXISTS "Anyone can submit application" ON public.pilot_applications;
CREATE POLICY "Anyone can submit application"
  ON public.pilot_applications FOR INSERT
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone IS NULL OR length(phone) <= 40)
    AND (age_range IS NULL OR length(age_range) <= 40)
    AND (current_work IS NULL OR length(current_work) <= 500)
    AND (what_led_you_here IS NULL OR length(what_led_you_here) <= 10000)
    AND (hoped_outcome IS NULL OR length(hoped_outcome) <= 10000)
    AND (past_achievement IS NULL OR length(past_achievement) <= 10000)
    AND (current_obstacles IS NULL OR length(current_obstacles) <= 10000)
    AND stripe_session_id IS NULL
    AND stripe_customer_id IS NULL
    AND paid_at IS NULL
    AND application_status = 'pending_payment'
  );

DROP POLICY IF EXISTS "checkins_read_recent_or_facilitator" ON public.check_ins;
CREATE POLICY "checkins_read_recent_or_facilitator" ON public.check_ins
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR (
      checked_in_at > now() - interval '24 hours'
      AND (goal_update IS NULL OR share_goal_publicly = true)
    )
  );
