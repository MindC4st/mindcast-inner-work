
-- Restrict mindcast_live_sessions to authenticated users; hide facilitator_notes + film_script_2min from members via a view.

DROP POLICY IF EXISTS sessions_read_all ON public.mindcast_live_sessions;

-- Members/authenticated users: no direct SELECT on base table. Staff can read everything.
CREATE POLICY sessions_staff_read
  ON public.mindcast_live_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facilitator'));

REVOKE SELECT ON public.mindcast_live_sessions FROM anon;

-- Public/member-safe view (no facilitator_notes, no film_script_2min). SECURITY DEFINER by default so RLS on base table doesn't block members.
CREATE OR REPLACE VIEW public.mindcast_live_sessions_public AS
SELECT
  id, week_number, phase, phase_name, theme_title, audience,
  core_concept, signal_metaphor, ancient_wisdom_reframe, session_title,
  opening_hook, teaching_points, experiential_exercise, guided_reflection,
  journaling_prompt, weekly_practice_mon, weekly_practice_wed, weekly_practice_sun,
  core_affirmation, video_link, video_description, video_backup_description,
  created_at, updated_at
FROM public.mindcast_live_sessions;

REVOKE ALL ON public.mindcast_live_sessions_public FROM PUBLIC, anon;
GRANT SELECT ON public.mindcast_live_sessions_public TO authenticated;
GRANT ALL ON public.mindcast_live_sessions_public TO service_role;
