CREATE TABLE IF NOT EXISTS public.framework_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_order integer NOT NULL,
  name text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 5,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.framework_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "framework_steps_read" ON public.framework_steps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "framework_steps_facilitator_manage" ON public.framework_steps
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));

CREATE TRIGGER update_framework_steps_updated_at
  BEFORE UPDATE ON public.framework_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();