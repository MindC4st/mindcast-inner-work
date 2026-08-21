-- Foyer Welcome Wall: presentation-safe arrivals for /display (foyer mode).
--
-- The anonymous foyer display must never read household_members or profiles
-- directly (RLS protects them, and it should stay that way). This RPC is the
-- ONLY public surface: it resolves check-ins into ready-to-project labels
-- server-side and returns nothing else.
--
-- Rules implemented here (safeguarding, not styling):
--   * only check_ins with wall_hidden = false and is_anonymous = false count
--     — a hidden minor never contributes to grouping, so its presence can't
--     turn "MATT CARLSON" into "THE CARLSON FAMILY"
--   * 2+ visible members of one household -> one label: THE <SURNAME> FAMILY
--   * surname source order: payer adult's last_name, then an adult household
--     member's last_name — NEVER parsed from a child's name
--   * no reliable adult surname -> fall back to the first visible adult's
--     display name as the household label (still one label, not N names)
--   * a visible person on their own: adults show their display name; minors
--     (teen/child) show first name only
--   * no emails, ages, membership status, tier, history, photos — labels only

CREATE OR REPLACE FUNCTION public.foyer_arrivals_today()
RETURNS TABLE (
  display_key text,
  display_label text,
  latest_checked_in_at timestamptz,
  arrival_type text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_day_start timestamptz;
BEGIN
  -- Midnight of the current New Zealand calendar day (DST-safe).
  v_day_start := date_trunc('day', now() AT TIME ZONE 'Pacific/Auckland')
                 AT TIME ZONE 'Pacific/Auckland';

  RETURN QUERY
  WITH visible AS (
    -- One row per person: their latest visible check-in today.
    SELECT ci.profile_id, max(ci.checked_in_at) AS latest
    FROM public.check_ins ci
    WHERE ci.checked_in_at >= v_day_start
      AND ci.wall_hidden = false
      AND ci.is_anonymous = false
    GROUP BY ci.profile_id
  ),
  people AS (
    SELECT
      v.profile_id,
      v.latest,
      lower(COALESCE(p.age_group, 'adult')) IN ('child', 'kids', 'teen') AS is_minor,
      COALESCE(NULLIF(trim(p.first_name), ''), split_part(COALESCE(p.display_name, ''), ' ', 1), 'Welcome') AS first_name_only,
      COALESCE(
        NULLIF(trim(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''),
        p.display_name, p.name, 'Member'
      ) AS full_name,
      hm.household_id
    FROM visible v
    JOIN public.profiles p ON p.id = v.profile_id
    LEFT JOIN public.household_members hm ON hm.profile_id = p.id
  ),
  hh AS (
    SELECT household_id, count(*) AS n, max(latest) AS latest
    FROM people
    WHERE household_id IS NOT NULL
    GROUP BY household_id
  ),
  hh_label AS (
    -- One label per household with 2+ visible members.
    SELECT
      h.household_id,
      h.latest,
      COALESCE(
        -- 1. payer/primary adult's last_name
        NULLIF(trim(payer.last_name), ''),
        -- 2. first adult household member with a valid last_name
        NULLIF(trim(adult.last_name), ''),
        -- 3. fallback: first visible adult's display name (never a child's)
        NULLIF(trim(fallback.display_name), '')
      ) AS label_base,
      (payer.last_name IS NOT NULL AND trim(payer.last_name) <> '')
        OR (adult.last_name IS NOT NULL AND trim(adult.last_name) <> '')
        AS reliable_surname
    FROM hh h
    LEFT JOIN public.households hs ON hs.id = h.household_id
    LEFT JOIN public.profiles payer ON payer.id = hs.payer_profile_id
    LEFT JOIN LATERAL (
      SELECT pm.last_name
      FROM public.household_members hm2
      JOIN public.profiles pm ON pm.id = hm2.profile_id
      WHERE hm2.household_id = h.household_id
        AND hm2.role_in_household IN ('guardian', 'adult')
        AND lower(COALESCE(pm.age_group, 'adult')) NOT IN ('child', 'kids', 'teen')
        AND trim(COALESCE(pm.last_name, '')) <> ''
      ORDER BY pm.created_at
      LIMIT 1
    ) adult ON true
    LEFT JOIN LATERAL (
      SELECT pl.display_name
      FROM people pl
      WHERE pl.household_id = h.household_id AND NOT pl.is_minor
      ORDER BY pl.latest
      LIMIT 1
    ) fallback ON true
    WHERE h.n >= 2
  )
  -- Family labels.
  SELECT
    'hh:' || hl.household_id::text AS display_key,
    CASE
      WHEN hl.reliable_surname THEN 'THE ' || upper(hl.label_base) || ' FAMILY'
      ELSE upper(hl.label_base)
    END AS display_label,
    hl.latest AS latest_checked_in_at,
    'family'::text AS arrival_type
  FROM hh_label hl
  WHERE hl.label_base IS NOT NULL

  UNION ALL

  -- Individuals: no household, the only visible member of one, or members of
  -- a household with no usable label (e.g. minors attending without an adult
  -- visible — each is shown by first name only, never vanished).
  SELECT
    'p:' || p.profile_id::text AS display_key,
    CASE WHEN p.is_minor THEN upper(p.first_name_only) ELSE upper(p.full_name) END AS display_label,
    p.latest AS latest_checked_in_at,
    'individual'::text AS arrival_type
  FROM people p
  LEFT JOIN hh ON hh.household_id = p.household_id
  LEFT JOIN hh_label hl ON hl.household_id = p.household_id
  WHERE p.household_id IS NULL
     OR hh.n < 2
     OR hl.label_base IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.foyer_arrivals_today() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.foyer_arrivals_today() TO anon, authenticated;
