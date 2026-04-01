
-- Sessions table for admin-managed session data
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  podcast_url text DEFAULT '',
  youtube_id text DEFAULT '',
  session_number integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  session_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Session bookmarks table
CREATE TABLE public.session_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  timestamp_seconds integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  question text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add is_active to profiles for member management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_bookmarks ENABLE ROW LEVEL SECURITY;

-- Sessions: authenticated can view, facilitators can manage
CREATE POLICY "Authenticated can view sessions" ON public.sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Facilitators can manage sessions" ON public.sessions
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));

-- Bookmarks: authenticated can view, facilitators can manage
CREATE POLICY "Authenticated can view session bookmarks" ON public.session_bookmarks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Facilitators can manage session bookmarks" ON public.session_bookmarks
  FOR ALL USING (public.has_role(auth.uid(), 'facilitator'));

-- Triggers for updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
