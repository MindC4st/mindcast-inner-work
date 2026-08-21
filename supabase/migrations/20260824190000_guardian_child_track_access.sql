-- Make Child-track access household-wide too (not just the payer's kids_addon).
-- An adult in a household with a child can read the Child track, mirroring the
-- teen access added in 20260824160000. This removes the payer-only gap where a
-- second adult guardian could read Teen but not Child lessons.

CREATE OR REPLACE FUNCTION public.can_access_track(p_audience text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT
      p.membership_status IN ('active', 'trialing')
      AND CASE lower(COALESCE(p_audience, ''))
        WHEN 'adult' THEN
          p.membership_tier = 'adult'
          AND lower(COALESCE(p.age_group, 'adult')) NOT IN
            ('teen', 'child', 'kids', 'kid', 'little_ones')
        WHEN 'teen' THEN
          (
            p.membership_tier = 'teen'
            AND lower(COALESCE(p.age_group, '')) = 'teen'
          )
          OR (
            p.membership_tier = 'adult'
            AND EXISTS (
              SELECT 1
              FROM public.household_members self
              JOIN public.household_members teen
                ON teen.household_id = self.household_id
              WHERE self.profile_id = p.id
                AND teen.role_in_household = 'teen'
            )
          )
        WHEN 'child' THEN
          (
            p.membership_tier = 'child'
            AND lower(COALESCE(p.age_group, '')) IN
              ('child', 'kids', 'kid', 'little_ones')
          )
          OR p.kids_addon = true
          OR (
            p.membership_tier = 'adult'
            AND EXISTS (
              SELECT 1
              FROM public.household_members self
              JOIN public.household_members child
                ON child.household_id = self.household_id
              WHERE self.profile_id = p.id
                AND child.role_in_household = 'child'
            )
          )
        WHEN 'kids' THEN
          (
            p.membership_tier = 'child'
            AND lower(COALESCE(p.age_group, '')) IN
              ('child', 'kids', 'kid', 'little_ones')
          )
          OR p.kids_addon = true
          OR (
            p.membership_tier = 'adult'
            AND EXISTS (
              SELECT 1
              FROM public.household_members self
              JOIN public.household_members child
                ON child.household_id = self.household_id
              WHERE self.profile_id = p.id
                AND child.role_in_household = 'child'
            )
          )
        ELSE false
      END
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
    LIMIT 1
  ), false);
$$;

REVOKE ALL ON FUNCTION public.can_access_track(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_track(text) TO authenticated;
