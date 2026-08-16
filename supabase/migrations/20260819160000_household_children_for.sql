-- Guardian view of their own household's children/teens.
--
-- Members can only read their own profile row, but the family-and-safety
-- page needs the names of the children a guardian is responsible for. This
-- SECURITY DEFINER helper is the gate: it returns only the child/teen members
-- of households where the CALLER is a guardian — nobody else's household,
-- and a caller cannot pass someone else's profile id to see theirs.

CREATE OR REPLACE FUNCTION public.household_children_for()
RETURNS TABLE (
  profile_id        uuid,
  display_name      text,
  role_in_household text,
  teen_self_signout boolean
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hm.profile_id,
         COALESCE(NULLIF(p.display_name, ''), p.first_name, p.name, 'Unnamed'),
         hm.role_in_household,
         hm.teen_self_signout
  FROM public.household_members hm
  JOIN public.profiles p ON p.id = hm.profile_id
  WHERE hm.role_in_household IN ('child', 'teen')
    AND hm.household_id IN (
      SELECT g.household_id
      FROM public.household_members g
      WHERE g.profile_id = public.current_profile_id()
        AND g.role_in_household = 'guardian'
    );
$$;

REVOKE ALL ON FUNCTION public.household_children_for() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.household_children_for() TO authenticated;
