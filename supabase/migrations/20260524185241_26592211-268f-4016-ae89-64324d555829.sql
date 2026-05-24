CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text DEFAULT 'demo',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_anyone"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "waitlist_facilitator_read"
  ON public.waitlist FOR SELECT
  USING (has_role(auth.uid(), 'facilitator'::app_role));