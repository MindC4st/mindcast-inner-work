
CREATE TABLE public.curriculum_weeks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number integer NOT NULL UNIQUE,
  block_number integer NOT NULL,
  block_theme text NOT NULL DEFAULT '',
  weekly_theme text NOT NULL DEFAULT '',
  adult_source text DEFAULT '',
  adult_video_title text DEFAULT '',
  adult_search_notes text DEFAULT '',
  teen_source text DEFAULT '',
  teen_video_title text DEFAULT '',
  teen_search_notes text DEFAULT '',
  kids_format text DEFAULT '',
  kids_title text DEFAULT '',
  kids_theme_notes text DEFAULT '',
  kids_activity_type text DEFAULT '',
  pdf_reference text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.curriculum_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "curriculum_read" ON public.curriculum_weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "curriculum_facilitator_manage" ON public.curriculum_weeks FOR ALL USING (has_role(auth.uid(), 'facilitator'::app_role));

CREATE TRIGGER update_curriculum_weeks_updated_at
  BEFORE UPDATE ON public.curriculum_weeks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
