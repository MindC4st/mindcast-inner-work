CREATE TABLE public.email_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  recipient_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent'
);

ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facilitators can view reminder logs"
  ON public.email_reminders
  FOR SELECT
  USING (public.has_role(auth.uid(), 'facilitator'));

CREATE POLICY "Facilitators can manage reminder logs"
  ON public.email_reminders
  FOR ALL
  USING (public.has_role(auth.uid(), 'facilitator'));