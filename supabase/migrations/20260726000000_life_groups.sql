-- Life Group assignment infrastructure (Jul 2026).
--
-- Adds demographic columns to profiles (gender, date_of_birth) and creates
-- the life_groups / life_group_members tables for the Tuesday midweek
-- gathering (5:30–7:30pm). Groups are algorithmically assembled by age
-- (≤5 year spread within a group, ~15 people), even gender split, and
-- households split across groups so adults can tag-team babysitting.
--
-- Profiles:
--   gender          text — 'male' | 'female' | 'other'
--   date_of_birth   date — used to calculate age for group placement
--
-- Life groups:
--   name, meeting_space, capacity (target ~15), age_min / age_max
--   assigned_gender_balance (target male:female ratio)
--   Tuesday 5:30–7:30pm is implied by the concept; schedule columns
--   are here in case we need per-group variations later.

-- ---------------------------------------------------------------------------
-- 1. Add demographic columns to profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text
    CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Users can update their own gender / date_of_birth. The privilege-escalation
-- guard does NOT need updating — these are self-service fields.

-- ---------------------------------------------------------------------------
-- 2. Life groups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.life_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meeting_space text,
  day_of_week text NOT NULL DEFAULT 'Tuesday',
  start_time time NOT NULL DEFAULT '17:30',
  end_time time NOT NULL DEFAULT '19:30',
  capacity int NOT NULL DEFAULT 15
    CHECK (capacity BETWEEN 5 AND 25),
  age_min int,
  age_max int,
  target_male_count int,
  target_female_count int,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.life_groups ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. Life group members (link profiles to groups)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.life_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  life_group_id uuid NOT NULL REFERENCES public.life_groups(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (life_group_id, profile_id)
);
ALTER TABLE public.life_group_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS lgm_life_group_idx ON public.life_group_members (life_group_id);
CREATE INDEX IF NOT EXISTS lgm_profile_idx ON public.life_group_members (profile_id);

-- ---------------------------------------------------------------------------
-- 4. RLS policies
-- ---------------------------------------------------------------------------

-- Life groups: staff can manage; authenticated can view
DROP POLICY IF EXISTS "life_groups_read" ON public.life_groups;
CREATE POLICY "life_groups_read" ON public.life_groups
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "life_groups_staff_manage" ON public.life_groups;
CREATE POLICY "life_groups_staff_manage" ON public.life_groups
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Life group members: staff manage; authenticated view own
DROP POLICY IF EXISTS "lgm_read_own" ON public.life_group_members;
CREATE POLICY "lgm_read_own" ON public.life_group_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = life_group_members.profile_id
        AND p.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "lgm_staff_manage" ON public.life_group_members;
CREATE POLICY "lgm_staff_manage" ON public.life_group_members
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- ---------------------------------------------------------------------------
-- 5. Admin read-access policy for membership dashboard
--    (admins & facilitators need to list profiles with membership_status for
--     the new dashboard — the existing "Facilitators can view all profiles"
--     policy already covers this via has_role() gate)
-- ---------------------------------------------------------------------------
