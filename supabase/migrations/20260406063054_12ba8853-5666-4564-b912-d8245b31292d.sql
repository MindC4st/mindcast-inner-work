
CREATE TABLE public.pilot_waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.pilot_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Facilitators can view waitlist"
  ON public.pilot_waitlist FOR SELECT
  USING (has_role(auth.uid(), 'facilitator'::app_role));
