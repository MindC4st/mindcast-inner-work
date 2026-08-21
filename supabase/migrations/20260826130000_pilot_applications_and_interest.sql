-- 20260826130000_pilot_applications_and_interest.sql
-- Mindcast Pilot Group application tables (replaces legacy pilot_applications, pilot_waitlist)

-- Drop legacy tables if they exist (they have incompatible schemas)
DROP TABLE IF EXISTS public.pilot_applications;
DROP TABLE IF EXISTS public.pilot_waitlist;

-- ─── pilot_applications ──────────────────────────────────────────────────────
CREATE TABLE public.pilot_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date NOT NULL,

  -- Optional. Context for a human decision; never a filter.
  gender text CHECK (gender IN ('female','male','another','undisclosed')),
  gender_self_described text,

  q1_money_no_barrier text NOT NULL,
  q2_ten_years_ago text NOT NULL,
  q3_didnt_think_could text NOT NULL,
  anything_else text,

  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','shortlisted','met','offered','declined','withdrawn')),
  notes text,                       -- internal only
  submitted_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text
);

CREATE INDEX pilot_applications_submitted_idx
  ON public.pilot_applications (submitted_at DESC);

ALTER TABLE public.pilot_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can apply (insert only)
CREATE POLICY "Anyone can apply"
  ON public.pilot_applications FOR INSERT WITH CHECK (true);

-- Admins read all applications
CREATE POLICY "Admins read applications"
  ON public.pilot_applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ─── pilot_interest ──────────────────────────────────────────────────────────
-- People outside the age band, or arriving after close, who want the next group.
CREATE TABLE public.pilot_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  age_band text,                    -- 'under_30' | 'over_45' | 'after_close'
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

ALTER TABLE public.pilot_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register interest"
  ON public.pilot_interest FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins read interest"
  ON public.pilot_interest FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));