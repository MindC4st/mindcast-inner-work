CREATE TABLE IF NOT EXISTS public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  payer_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_household text NOT NULL DEFAULT 'adult'
    CHECK (role_in_household IN ('guardian', 'adult', 'teen', 'child')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, profile_id)
);

CREATE INDEX IF NOT EXISTS household_members_profile_idx ON public.household_members (profile_id);
CREATE INDEX IF NOT EXISTS household_members_household_idx ON public.household_members (household_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.household_members TO authenticated;
GRANT ALL ON public.household_members TO service_role;

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_households_updated_at ON public.households;
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_guardian_of_profile(target_profile uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members guardian
    JOIN public.household_members child ON child.household_id = guardian.household_id
    JOIN public.profiles gp ON gp.id = guardian.profile_id
    WHERE gp.user_id = auth.uid()
      AND guardian.role_in_household = 'guardian'
      AND child.profile_id = target_profile
      AND child.role_in_household IN ('child', 'teen')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_member(h uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members hm
    JOIN public.profiles p ON p.id = hm.profile_id
    WHERE hm.household_id = h AND p.user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "household_read_own" ON public.households;
CREATE POLICY "household_read_own" ON public.households
  FOR SELECT USING (public.is_household_member(id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "household_admin_manage" ON public.households;
CREATE POLICY "household_admin_manage" ON public.households
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "household_members_read_own" ON public.household_members;
CREATE POLICY "household_members_read_own" ON public.household_members
  FOR SELECT USING (public.is_household_member(household_id) OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "household_members_admin_manage" ON public.household_members;
CREATE POLICY "household_members_admin_manage" ON public.household_members
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));