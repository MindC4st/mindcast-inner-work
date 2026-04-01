
-- Table for bookmark responses (voice notes + text per bookmark)
CREATE TABLE public.bookmark_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id),
  week_number INTEGER NOT NULL,
  bookmark_id TEXT NOT NULL,
  response_text TEXT DEFAULT '',
  voice_url TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint for upserts
ALTER TABLE public.bookmark_responses ADD CONSTRAINT bookmark_responses_unique UNIQUE (user_id, cohort_id, week_number, bookmark_id);

-- Table for implementation check-ins
CREATE TABLE public.implementation_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id),
  week_number INTEGER NOT NULL,
  what_happened TEXT DEFAULT '',
  did_achieve TEXT DEFAULT '',
  what_learned TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.implementation_checkins ADD CONSTRAINT implementation_checkins_unique UNIQUE (user_id, cohort_id, week_number);

-- Enable RLS
ALTER TABLE public.bookmark_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementation_checkins ENABLE ROW LEVEL SECURITY;

-- RLS: Users can manage their own bookmark responses
CREATE POLICY "Users can manage own bookmark responses" ON public.bookmark_responses FOR ALL USING (auth.uid() = user_id);

-- RLS: Cohort members can view shared bookmark responses
CREATE POLICY "Cohort members can view shared bookmark responses" ON public.bookmark_responses FOR SELECT USING (
  is_shared = true AND EXISTS (
    SELECT 1 FROM public.cohort_members cm WHERE cm.cohort_id = bookmark_responses.cohort_id AND cm.user_id = auth.uid()
  )
);

-- RLS: Facilitators can view all bookmark responses
CREATE POLICY "Facilitators can view all bookmark responses" ON public.bookmark_responses FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- RLS: Users can manage own checkins
CREATE POLICY "Users can manage own checkins" ON public.implementation_checkins FOR ALL USING (auth.uid() = user_id);

-- RLS: Facilitators can view all checkins
CREATE POLICY "Facilitators can view all checkins" ON public.implementation_checkins FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- Update triggers
CREATE TRIGGER update_bookmark_responses_updated_at BEFORE UPDATE ON public.bookmark_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_implementation_checkins_updated_at BEFORE UPDATE ON public.implementation_checkins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Voice recordings storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', true);

-- Storage RLS for voice recordings
CREATE POLICY "Users can upload own voice recordings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view voice recordings" ON storage.objects FOR SELECT USING (bucket_id = 'voice-recordings');
CREATE POLICY "Users can delete own voice recordings" ON storage.objects FOR DELETE USING (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
