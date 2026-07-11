-- Phase 1a — households (parent + children) and the helper functions the
-- journal-privacy migration depends on.
--
-- A household groups a paying guardian with one or more child/teen profiles.
-- One payer, many linked profiles (household billing). Guardians may READ a
-- linked child's journal (product decision 2026-07-11: "agree with parent
-- view"); they cannot write it.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  -- The billing owner (a guardian's profile). Kept nullable so a household can
  -- exist before billing is attached.
  payer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- role WITHIN the family unit (distinct from app_role).
  role_in_household text NOT NULL DEFAULT 'adult'
    CHECK (role_in_household IN ('guardian', 'adult', 'teen', 'child')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, profile_id)
);

CREATE INDEX IF NOT EXISTS household_members_profile_idx
  ON public.household_members (profile_id);
CREATE INDEX IF NOT EXISTS household_members_household_idx
  ON public.household_members (household_id);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so they can see the mapping tables
-- without tripping the very RLS policies that call them).
-- ---------------------------------------------------------------------------

-- The profiles.id (NOT auth.uid()) for the current user. The workbook tables
-- key journal rows on profiles.id, so RLS must translate auth.uid() -> profile.
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- True when the current user is a guardian in the same household as
-- `target_profile`, and that target is a child/teen. Used for guardian read
-- access to a child's journal.
CREATE OR REPLACE FUNCTION public.is_guardian_of_profile(target_profile uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members guardian
    JOIN public.household_members child
      ON child.household_id = guardian.household_id
    JOIN public.profiles gp ON gp.id = guardian.profile_id
    WHERE gp.user_id = auth.uid()
      AND guardian.role_in_household = 'guardian'
      AND child.profile_id = target_profile
      AND child.role_in_household IN ('child', 'teen')
  );
$$;

-- True when the current user belongs to household `h` (any role).
CREATE OR REPLACE FUNCTION public.is_household_member(h uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.profile_id
    WHERE hm.household_id = h AND p.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS: households & household_members
-- ---------------------------------------------------------------------------

-- Members can read their own household; admins manage all.
DROP POLICY IF EXISTS "household_read_own" ON public.households;
CREATE POLICY "household_read_own" ON public.households
  FOR SELECT USING (
    public.is_household_member(id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "household_admin_manage" ON public.households;
CREATE POLICY "household_admin_manage" ON public.households
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "household_members_read_own" ON public.household_members;
CREATE POLICY "household_members_read_own" ON public.household_members
  FOR SELECT USING (
    public.is_household_member(household_id)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "household_members_admin_manage" ON public.household_members;
CREATE POLICY "household_members_admin_manage" ON public.household_members
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
