-- Video transcript + two transcript-derived reflective questions.
--
-- The facilitator video slide shows the YouTube embed with captions on, and the
-- two reflective questions underneath. Members answer them while watching —
-- active engagement with the video rather than passive consumption. The same
-- two questions (and space to answer them) appear in the digital journal and
-- the printable worksheet, so all three surfaces follow the same slide order.
--
-- video_transcript     : the raw transcript pulled from YouTube (by the
--                        generate-video-questions edge function, or pasted in
--                        the lesson editor).
-- video_question_1 / 2 : two open-ended questions generated from the
--                        transcript and tied to the week's theme.

ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS video_transcript text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_question_1 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_question_2 text DEFAULT '';

-- Members' answers live in the per-week lesson journal (one row per
-- profile/week/track), alongside the existing reflection + activity answers.
ALTER TABLE public.lesson_journal
  ADD COLUMN IF NOT EXISTS video_question_1_response text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_question_2_response text DEFAULT '';

-- Re-create the member-facing view so the two questions flow to the lesson
-- page (and its worksheet PDF download). The transcript stays out of the view
-- — it is staff-only working content.
DROP VIEW IF EXISTS public.mindcast_live_sessions_public;
CREATE VIEW public.mindcast_live_sessions_public
WITH (security_invoker = true) AS
SELECT id, week_number, phase, phase_name, theme_title, audience, session_title,
       core_concept, signal_metaphor, ancient_wisdom_reframe,
       opening_hook, experiential_exercise, guided_reflection, journaling_prompt,
       weekly_practice_mon, weekly_practice_wed, weekly_practice_sun,
       core_affirmation, video_link, video_description,
       video_question_1, video_question_2,
       created_at, updated_at
FROM public.mindcast_live_sessions;
GRANT SELECT ON public.mindcast_live_sessions_public TO anon, authenticated;
