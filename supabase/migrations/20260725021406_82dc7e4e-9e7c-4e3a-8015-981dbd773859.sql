DROP VIEW IF EXISTS public.mindcast_live_sessions_public;
CREATE VIEW public.mindcast_live_sessions_public
WITH (security_invoker = true) AS
SELECT id, week_number, phase, phase_name, theme_title, audience, session_title,
       core_concept, signal_metaphor, ancient_wisdom_reframe,
       opening_hook, experiential_exercise, guided_reflection, journaling_prompt,
       weekly_practice_mon, weekly_practice_wed, weekly_practice_sun,
       core_affirmation, video_link, video_description,
       created_at, updated_at
FROM public.mindcast_live_sessions;
GRANT SELECT ON public.mindcast_live_sessions_public TO anon, authenticated;