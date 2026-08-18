-- Security review fixes: seat-based entitlements and track-safe paid content.
--
-- The Stripe webhook calls refresh_membership_entitlements after every
-- subscription change. It allocates no more adult/teen/child profiles than the
-- active subscription quantities, while still allowing the payer to open child
-- resources bought for their household.

CREATE OR REPLACE FUNCTION public.refresh_membership_entitlements(
  p_household uuid DEFAULT NULL,
  p_profile uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'service role required';
  END IF;

  IF p_household IS NULL AND p_profile IS NULL THEN
    RAISE EXCEPTION 'household or profile required';
  END IF;

  -- Start from no access for the affected profiles, then apply every current
  -- active/trialing subscription below. This also removes seats after a
  -- downgrade or cancellation.
  UPDATE public.profiles p
  SET membership_status = 'none',
      membership_tier = 'none',
      kids_addon = false,
      membership_bundle = NULL,
      family_discount = false
  WHERE p.id = p_profile
     OR (
       p_household IS NOT NULL
       AND EXISTS (
         SELECT 1
         FROM public.household_members hm
         WHERE hm.household_id = p_household
           AND hm.profile_id = p.id
       )
     );

  IF p_household IS NOT NULL THEN
    WITH active_bundle AS (
      SELECT
        COUNT(*)::int AS subscription_count,
        COALESCE(SUM(
          CASE
            WHEN s.bundle_adults + s.bundle_teens + s.bundle_children = 0
                 AND s.tier = 'adult'
              THEN GREATEST(s.quantity, 1)
            ELSE s.bundle_adults
          END
        ), 0)::int AS adults,
        COALESCE(SUM(
          CASE
            WHEN s.bundle_adults + s.bundle_teens + s.bundle_children = 0
                 AND s.tier = 'teen'
              THEN GREATEST(s.quantity, 1)
            ELSE s.bundle_teens
          END
        ), 0)::int AS teens,
        COALESCE(SUM(
          CASE
            WHEN s.bundle_adults + s.bundle_teens + s.bundle_children = 0
                 AND s.tier = 'child'
              THEN GREATEST(s.quantity, 1)
            ELSE s.bundle_children
          END
        ), 0)::int AS children,
        COALESCE(BOOL_OR(s.family_discount), false) AS family_discount,
        CASE WHEN COALESCE(BOOL_OR(s.status = 'active'), false)
             THEN 'active' ELSE 'trialing' END AS access_status
      FROM public.subscriptions s
      WHERE s.household_id = p_household
        AND s.status IN ('active', 'trialing')
    ),
    ranked AS (
      SELECT
        hm.profile_id,
        CASE
          WHEN hm.role_in_household IN ('guardian', 'adult') THEN 'adult'
          WHEN hm.role_in_household = 'teen' THEN 'teen'
          ELSE 'child'
        END AS member_type,
        ROW_NUMBER() OVER (
          PARTITION BY
            CASE
              WHEN hm.role_in_household IN ('guardian', 'adult') THEN 'adult'
              WHEN hm.role_in_household = 'teen' THEN 'teen'
              ELSE 'child'
            END
          ORDER BY
            CASE WHEN
              hm.profile_id = (
                SELECT h.payer_profile_id FROM public.households h
                WHERE h.id = p_household
              )
              OR EXISTS (
                SELECT 1
                FROM public.subscriptions s
                WHERE s.household_id = p_household
                  AND s.status IN ('active', 'trialing')
                  AND s.profile_id = hm.profile_id
              )
            THEN 0 ELSE 1 END,
            hm.created_at,
            hm.profile_id
        ) AS seat_number
      FROM public.household_members hm
      WHERE hm.household_id = p_household
    ),
    allocated AS (
      SELECT
        r.*,
        (
          (r.member_type = 'adult' AND r.seat_number <= b.adults)
          OR (r.member_type = 'teen' AND r.seat_number <= b.teens)
          OR (r.member_type = 'child' AND r.seat_number <= b.children)
        ) AS has_seat,
        (
          r.profile_id = (
            SELECT h.payer_profile_id FROM public.households h
            WHERE h.id = p_household
          )
          OR EXISTS (
            SELECT 1
            FROM public.subscriptions s
            WHERE s.household_id = p_household
              AND s.status IN ('active', 'trialing')
              AND s.profile_id = r.profile_id
          )
        ) AS is_payer,
        b.*
      FROM ranked r
      CROSS JOIN active_bundle b
    )
    UPDATE public.profiles p
    SET membership_status = CASE
          WHEN a.has_seat
               OR (a.is_payer AND a.subscription_count > 0 AND a.children > 0)
            THEN a.access_status
          ELSE 'none'
        END,
        membership_tier = CASE WHEN a.has_seat THEN a.member_type ELSE 'none' END,
        kids_addon = (
          a.is_payer AND a.subscription_count > 0 AND a.children > 0
        ),
        membership_bundle = CASE
          WHEN a.is_payer AND a.subscription_count > 0 THEN
            jsonb_build_object(
              'adults', a.adults,
              'teens', a.teens,
              'children', a.children
            )
          ELSE NULL
        END,
        family_discount = (
          a.is_payer AND a.subscription_count > 0 AND a.family_discount
        )
    FROM allocated a
    WHERE p.id = a.profile_id;
  END IF;

  -- A profile can also own a solo subscription. Re-apply it after the
  -- household allocation so an unrelated household change cannot erase it.
  WITH targets AS (
    SELECT p_profile AS profile_id WHERE p_profile IS NOT NULL
    UNION
    SELECT hm.profile_id
    FROM public.household_members hm
    WHERE p_household IS NOT NULL
      AND hm.household_id = p_household
  ),
  solo AS (
    SELECT
      s.profile_id,
      COALESCE(SUM(
        CASE
          WHEN s.bundle_adults + s.bundle_teens + s.bundle_children = 0
               AND s.tier = 'adult'
            THEN GREATEST(s.quantity, 1)
          ELSE s.bundle_adults
        END
      ), 0)::int AS adults,
      COALESCE(SUM(
        CASE
          WHEN s.bundle_adults + s.bundle_teens + s.bundle_children = 0
               AND s.tier = 'teen'
            THEN GREATEST(s.quantity, 1)
          ELSE s.bundle_teens
        END
      ), 0)::int AS teens,
      COALESCE(SUM(
        CASE
          WHEN s.bundle_adults + s.bundle_teens + s.bundle_children = 0
               AND s.tier = 'child'
            THEN GREATEST(s.quantity, 1)
          ELSE s.bundle_children
        END
      ), 0)::int AS children,
      COALESCE(BOOL_OR(s.family_discount), false) AS family_discount,
      CASE WHEN BOOL_OR(s.status = 'active') THEN 'active' ELSE 'trialing' END AS access_status
    FROM public.subscriptions s
    JOIN targets t ON t.profile_id = s.profile_id
    WHERE s.household_id IS NULL
      AND s.status IN ('active', 'trialing')
    GROUP BY s.profile_id
  )
  UPDATE public.profiles p
  SET membership_status = CASE
        WHEN p.membership_status = 'active' OR s.access_status = 'active'
          THEN 'active'
        ELSE 'trialing'
      END,
      membership_tier = CASE
        WHEN p.membership_tier <> 'none' THEN p.membership_tier
        WHEN lower(COALESCE(p.age_group, 'adult')) = 'teen' AND s.teens > 0 THEN 'teen'
        WHEN lower(COALESCE(p.age_group, 'adult')) IN ('child', 'kids', 'kid', 'little_ones')
             AND s.children > 0 THEN 'child'
        WHEN lower(COALESCE(p.age_group, 'adult')) NOT IN
             ('teen', 'child', 'kids', 'kid', 'little_ones')
             AND s.adults > 0 THEN 'adult'
        ELSE 'none'
      END,
      kids_addon = p.kids_addon OR (
        lower(COALESCE(p.age_group, 'adult')) NOT IN
          ('teen', 'child', 'kids', 'kid', 'little_ones')
        AND s.children > 0
      ),
      membership_bundle = COALESCE(
        p.membership_bundle,
        jsonb_build_object(
          'adults', s.adults,
          'teens', s.teens,
          'children', s.children
        )
      ),
      family_discount = p.family_discount OR s.family_discount
  FROM solo s
  WHERE p.id = s.profile_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_membership_entitlements(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_membership_entitlements(uuid, uuid)
  TO service_role;

-- Apply the allocation model immediately to existing subscriptions instead of
-- waiting for the next Stripe webhook delivery.
DO $$
DECLARE
  target record;
BEGIN
  FOR target IN
    SELECT DISTINCT household_id
    FROM public.subscriptions
    WHERE household_id IS NOT NULL
  LOOP
    PERFORM public.refresh_membership_entitlements(target.household_id, NULL);
  END LOOP;

  FOR target IN
    SELECT DISTINCT profile_id
    FROM public.subscriptions
    WHERE household_id IS NULL
      AND profile_id IS NOT NULL
  LOOP
    PERFORM public.refresh_membership_entitlements(NULL, target.profile_id);
  END LOOP;
END;
$$;

-- One authoritative track check for RLS and storage policies.
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
          p.membership_tier = 'teen'
          AND lower(COALESCE(p.age_group, '')) = 'teen'
        WHEN 'child' THEN
          (
            p.membership_tier = 'child'
            AND lower(COALESCE(p.age_group, '')) IN
              ('child', 'kids', 'kid', 'little_ones')
          )
          OR p.kids_addon = true
        WHEN 'kids' THEN
          (
            p.membership_tier = 'child'
            AND lower(COALESCE(p.age_group, '')) IN
              ('child', 'kids', 'kid', 'little_ones')
          )
          OR p.kids_addon = true
        ELSE false
      END
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
    LIMIT 1
  ), false);
$$;

REVOKE ALL ON FUNCTION public.can_access_track(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_track(text) TO authenticated;

-- curriculum_weeks is a wide multi-track row, so members must not select it
-- directly. Staff retain full access; members receive a field whitelist for one
-- entitled track through curriculum_for_track().
DROP POLICY IF EXISTS "curriculum_read" ON public.curriculum_weeks;
DROP POLICY IF EXISTS "curriculum_read_authenticated" ON public.curriculum_weeks;
DROP POLICY IF EXISTS "curriculum_read_gated" ON public.curriculum_weeks;
DROP POLICY IF EXISTS "curriculum_read_staff" ON public.curriculum_weeks;
CREATE POLICY "curriculum_read_staff" ON public.curriculum_weeks
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE OR REPLACE FUNCTION public.curriculum_for_track(
  p_audience text,
  p_week int DEFAULT NULL
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audience text;
  v_staff boolean;
BEGIN
  v_audience := CASE lower(COALESCE(p_audience, ''))
    WHEN 'adult' THEN 'Adult'
    WHEN 'teen' THEN 'Teen'
    WHEN 'child' THEN 'Child'
    WHEN 'kids' THEN 'Child'
    ELSE NULL
  END;

  IF v_audience IS NULL THEN
    RETURN;
  END IF;

  v_staff :=
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role);

  IF NOT v_staff AND NOT public.can_access_track(v_audience) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    jsonb_build_object(
      'week_number', c.week_number,
      'block_number', c.block_number,
      'block_theme', c.block_theme,
      'weekly_theme', c.weekly_theme,
      'core_learning', c.core_learning,
      'youtube_url', c.youtube_url,
      'youtube_title', c.youtube_title,
      'reflective_question', c.reflective_question,
      'interactive_activity', c.interactive_activity,
      'inner_wisdom_alignment', c.inner_wisdom_alignment
    )
    || CASE v_audience
      WHEN 'Adult' THEN jsonb_build_object(
        'signal_metaphor', c.signal_metaphor,
        'adult_source', c.adult_source,
        'adult_video_title', c.adult_video_title
      )
      WHEN 'Teen' THEN jsonb_build_object(
        'teen_signal_metaphor', c.teen_signal_metaphor,
        'teen_source', c.teen_source,
        'teen_video_title', c.teen_video_title
      )
      WHEN 'Child' THEN jsonb_build_object(
        'kids_signal_metaphor', c.kids_signal_metaphor,
        'kids_source', c.kids_source,
        'kids_title', c.kids_title,
        'kids_picture_book', c.kids_picture_book,
        'kids_picture_book_note', c.kids_picture_book_note,
        'kids_picture_book_author', c.kids_picture_book_author,
        'kids_picture_book_question', c.kids_picture_book_question,
        'kids_colouring_prompt', c.kids_colouring_prompt,
        'kids_game', c.kids_game,
        'kids_game_equipment', c.kids_game_equipment,
        'kids_game_under5', c.kids_game_under5,
        'kids_nz_alternative', c.kids_nz_alternative,
        'kids_nz_alternative_author', c.kids_nz_alternative_author,
        'kids_nz_alternative_note', c.kids_nz_alternative_note,
        'kids_nz_alternative_verified', c.kids_nz_alternative_verified,
        'kids_read_aloud_source_check', c.kids_read_aloud_source_check
      )
      ELSE '{}'::jsonb
    END
  FROM public.curriculum_weeks c
  WHERE (p_week IS NULL OR c.week_number = p_week)
    AND (v_staff OR public.lesson_unlocked(c.week_number))
  ORDER BY c.week_number;
END;
$$;

REVOKE ALL ON FUNCTION public.curriculum_for_track(text, int)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.curriculum_for_track(text, int)
  TO authenticated;

-- Session rows already separate content by audience, so RLS can enforce both
-- the purchased track and the weekly unlock directly.
DROP POLICY IF EXISTS "sessions_read_all" ON public.mindcast_live_sessions;
DROP POLICY IF EXISTS "sessions_read_authenticated" ON public.mindcast_live_sessions;
DROP POLICY IF EXISTS "sessions_read_members" ON public.mindcast_live_sessions;
DROP POLICY IF EXISTS "sessions_read_entitled" ON public.mindcast_live_sessions;
CREATE POLICY "sessions_read_entitled" ON public.mindcast_live_sessions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR (
      public.can_access_track(audience)
      AND public.lesson_unlocked(week_number)
    )
  );

-- The private colouring bucket follows the same child-track entitlement.
DROP POLICY IF EXISTS "colouring_read_kids_members" ON storage.objects;
CREATE POLICY "colouring_read_kids_members" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'colouring'
    AND (
      public.has_role(auth.uid(), 'facilitator'::app_role)
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.can_access_track('Child')
    )
  );

