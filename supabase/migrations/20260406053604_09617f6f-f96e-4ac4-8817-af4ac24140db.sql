
CREATE TABLE public.pilot_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  can_attend_tuesdays BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registration"
  ON public.pilot_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can manage all registrations"
  ON public.pilot_registrations FOR ALL
  USING (has_role(auth.uid(), 'facilitator'::app_role));

CREATE POLICY "Anyone can insert registration"
  ON public.pilot_registrations FOR INSERT
  WITH CHECK (true);

CREATE TRIGGER update_pilot_registrations_updated_at
  BEFORE UPDATE ON public.pilot_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
