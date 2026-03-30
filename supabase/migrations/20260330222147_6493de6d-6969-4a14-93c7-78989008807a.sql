
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('member', 'facilitator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cohorts table
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- Cohort memberships
CREATE TABLE public.cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id)
);
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- Entries table
CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 10),
  question_key TEXT NOT NULL,
  answer_text TEXT DEFAULT '',
  photo_url TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id, week_number, question_key)
);
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Domain scores table
CREATE TABLE public.domain_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 10),
  domain_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id, week_number, domain_name)
);
ALTER TABLE public.domain_scores ENABLE ROW LEVEL SECURITY;

-- Commitments table
CREATE TABLE public.commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 10),
  commitment_text TEXT DEFAULT '',
  why_text TEXT DEFAULT '',
  measure_text TEXT DEFAULT '',
  obstacle_text TEXT DEFAULT '',
  checkin_sentence TEXT DEFAULT '',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id, week_number)
);
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON public.entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_domain_scores_updated_at BEFORE UPDATE ON public.domain_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commitments_updated_at BEFORE UPDATE ON public.commitments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Facilitators can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Facilitators can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- cohorts
CREATE POLICY "Authenticated can view cohorts" ON public.cohorts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Facilitators can manage cohorts" ON public.cohorts FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));

-- cohort_members
CREATE POLICY "Users can view own memberships" ON public.cohort_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Facilitators can manage memberships" ON public.cohort_members FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));

-- entries
CREATE POLICY "Users can manage own entries" ON public.entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Cohort members can view shared entries" ON public.entries FOR SELECT USING (
  is_shared = true AND EXISTS (
    SELECT 1 FROM public.cohort_members cm
    WHERE cm.cohort_id = entries.cohort_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Facilitators can view all entries" ON public.entries FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- domain_scores
CREATE POLICY "Users can manage own scores" ON public.domain_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Facilitators can view all scores" ON public.domain_scores FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- commitments
CREATE POLICY "Users can manage own commitments" ON public.commitments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Facilitators can view all commitments" ON public.commitments FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'));

-- Storage bucket for photo uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('worksheet-photos', 'worksheet-photos', true);

CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'worksheet-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Photos are publicly accessible" ON storage.objects FOR SELECT USING (
  bucket_id = 'worksheet-photos'
);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'worksheet-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Seed default cohort
INSERT INTO public.cohorts (id, name, term, theme, description, start_date)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Mindcast Cohort 1',
  'Term 2',
  'Wired',
  'Understanding what drives you, what distracts you, and what you are really chasing',
  '2026-03-01'
);
