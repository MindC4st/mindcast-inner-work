-- Collection options for the departure sheet.
--
-- Facilitators cannot read household_members directly (and should not be able
-- to), but the departure sheet must offer exactly the lawful set of people a
-- child can leave with: the household's guardians and the guardian-authorised
-- collectors. SECURITY DEFINER with the same roster gate as the roll itself.

CREATE OR REPLACE FUNCTION public.collection_options(p_date date, p_room text, p_child uuid)
RETURNS TABLE (
  kind  text,   -- 'guardian' | 'collector'
  id    uuid,   -- profiles.id or authorised_collectors.id
  name  text
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'guardian'::text,
         gp.id,
         COALESCE(NULLIF(gp.display_name, ''), gp.first_name, gp.name, 'Guardian')
  FROM public.household_members child
  JOIN public.household_members guard
    ON guard.household_id = child.household_id
   AND guard.role_in_household = 'guardian'
  JOIN public.profiles gp ON gp.id = guard.profile_id
  WHERE child.profile_id = p_child
    AND public.can_access_room_roll(p_date, p_room)
  UNION ALL
  SELECT 'collector'::text, ac.id, ac.name
  FROM public.authorised_collectors ac
  WHERE ac.child_profile_id = p_child
    AND ac.revoked_at IS NULL
    AND public.can_access_room_roll(p_date, p_room);
$$;

REVOKE ALL ON FUNCTION public.collection_options(date, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.collection_options(date, text, uuid) TO authenticated;
