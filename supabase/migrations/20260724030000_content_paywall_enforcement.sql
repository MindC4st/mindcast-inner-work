-- Server-side paywall + unlock enforcement.
--
-- Previously curriculum_weeks and mindcast_live_sessions were readable by ANY
-- authenticated account, so the membership/unlock gating lived only in the UI —
-- a free signup could read all 52 weeks of paid content via a direct query.
-- This moves the gate into RLS:
--   * curriculum_weeks full rows are readable only by staff, or by an active
--     member for a week that has unlocked.
--   * mindcast_live_sessions (the live deck) is readable only by staff or an
--     active member.
--   * public browse (titles + description for the padlocked list) is served by a
--     SECURITY DEFINER function that exposes only the safe columns.
--   * check_ins can only be inserted for yourself (staff/kiosk go via the
--     service-role nfc-checkin function and are unaffected).

-- ---------------------------------------------------------------------------
-- 1. Active-member helper.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_member()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND membership_status IN ('active','trialing')
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_active_member() TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. curriculum_weeks — gate full-row reads behind membership + unlock.
--    Staff (facilitator/admin) keep full access for facilitation + editing.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "curriculum_read" ON public.curriculum_weeks;
DROP POLICY IF EXISTS "curriculum_read_authenticated" ON public.curriculum_weeks;
CREATE POLICY "curriculum_read_gated" ON public.curriculum_weeks
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR (public.is_active_member() AND public.lesson_unlocked(week_number))
  );

-- ---------------------------------------------------------------------------
-- 3. Public browse — titles + description only, all weeks, bypasses RLS so the
--    padlocked list and marketing can show what's coming without leaking the
--    paid body (video, questions, activities, alignment, kids assets).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.curriculum_public(p_week int DEFAULT NULL)
RETURNS TABLE (
  week_number int, block_number int, block_theme text, weekly_theme text,
  core_learning text, adult_video_title text, teen_video_title text, kids_title text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT week_number, block_number, block_theme, weekly_theme,
         core_learning, adult_video_title, teen_video_title, kids_title
  FROM public.curriculum_weeks
  WHERE (p_week IS NULL OR week_number = p_week)
  ORDER BY week_number;
$$;
GRANT EXECUTE ON FUNCTION public.curriculum_public(int) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. mindcast_live_sessions — members + staff only (was any authenticated).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "sessions_read_authenticated" ON public.mindcast_live_sessions;
DROP POLICY IF EXISTS "sessions_read_all" ON public.mindcast_live_sessions;
CREATE POLICY "sessions_read_members" ON public.mindcast_live_sessions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.is_active_member()
  );

-- ---------------------------------------------------------------------------
-- 5. check_ins — a member may only check THEMSELVES in (kills welcome-wall
--    name spoofing). Facilitators (kiosk UI) and the service-role nfc-checkin
--    function are unaffected.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "checkins_insert" ON public.check_ins;
CREATE POLICY "checkins_insert_self" ON public.check_ins
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR profile_id = public.current_profile_id()
  );
