
CREATE TABLE public.pilot_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  age_range text,
  current_work text,
  what_led_you_here text,
  hoped_outcome text,
  past_achievement text,
  current_obstacles text,
  confirmed_attendance boolean DEFAULT false,
  agreed_terms boolean DEFAULT false,
  stripe_session_id text,
  stripe_customer_id text,
  application_status text NOT NULL DEFAULT 'pending_payment',
  paid_at timestamp with time zone,
  cohort text DEFAULT 'taupo-pilot-t1-2026',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit application"
  ON public.pilot_applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Facilitators can manage all applications"
  ON public.pilot_applications
  FOR ALL
  USING (public.has_role(auth.uid(), 'facilitator'));
