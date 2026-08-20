-- Two things slide 5 and slide 2 need to actually work.
--
-- 1. `whiteboard` becomes a first-class activity type, so slide 5 can hand the
--    activity area to a canvas component instead of a submission tally.
-- 2. The Notice -> Name -> Do ladder gets a write path and a read path for the
--    member's own progress view.

-- ── 1. Whiteboard activity ────────────────────────────────────────────────
ALTER TABLE public.curriculum_weeks
  DROP CONSTRAINT IF EXISTS curriculum_weeks_activity_type_check;

ALTER TABLE public.curriculum_weeks
  ADD CONSTRAINT curriculum_weeks_activity_type_check
  CHECK (activity_type IN (
    'wordcloud','poll','reflection','none','scale','choice','phrase','whiteboard'
  ));

-- Week 1's exercise is the two-column T-chart drawn live on the facilitator's
-- tablet: inputs on the left, likely origin on the right, circle the three that
-- took up the most room. There is nothing for members to submit, so a tally
-- surface would have shown an empty box all session.
UPDATE public.curriculum_weeks
SET activity_type = 'whiteboard'
WHERE week_number = 1;

-- ── 2. Recording a rung ───────────────────────────────────────────────────
-- Members answer for the week they are REPORTING ON (last Sunday's intention),
-- not the week they are sitting in, so the week number is explicit.
--
-- SECURITY DEFINER with current_profile_id() inside: a member can only ever
-- write their own row, and cannot pass someone else's profile id.
CREATE OR REPLACE FUNCTION public.set_intention_outcome(
  p_week int,
  p_track text,
  p_outcome text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile uuid := public.current_profile_id();
BEGIN
  IF v_profile IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF p_outcome IS NOT NULL AND p_outcome NOT IN
     ('didnt_notice','noticed_unnamed','noticed_named','noticed_named_did') THEN
    RAISE EXCEPTION 'Unknown intention outcome: %', p_outcome;
  END IF;

  -- Upsert: a member who missed the session they set the intention in still
  -- has something to report against, so the row may not exist yet.
  INSERT INTO public.lesson_journal (profile_id, week_number, track, intention_outcome)
  VALUES (v_profile, p_week, p_track, p_outcome)
  ON CONFLICT (profile_id, week_number, track)
  DO UPDATE SET intention_outcome = EXCLUDED.intention_outcome;
END;
$$;

REVOKE ALL ON FUNCTION public.set_intention_outcome(int, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_intention_outcome(int, text, text) TO authenticated;

-- ── 3. The member's own progress ──────────────────────────────────────────
-- Feeds the self-assessment chart on the member dashboard. Returns only the
-- caller's own rows: this is private self-assessment, never a leaderboard and
-- never visible to a facilitator.
CREATE OR REPLACE FUNCTION public.my_intention_history(p_track text DEFAULT 'Adult')
RETURNS TABLE (
  week_number int,
  weekly_intention text,
  intention_outcome text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lj.week_number, lj.weekly_intention, lj.intention_outcome
    FROM public.lesson_journal lj
   WHERE lj.profile_id = public.current_profile_id()
     AND lj.track = p_track
     AND (lj.weekly_intention IS NOT NULL OR lj.intention_outcome IS NOT NULL)
   ORDER BY lj.week_number;
$$;

REVOKE ALL ON FUNCTION public.my_intention_history(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_intention_history(text) TO authenticated;

-- Verify after db push:
--   SELECT activity_type FROM public.curriculum_weeks WHERE week_number = 1;  -- whiteboard
--   SELECT public.set_intention_outcome(1, 'Adult', 'noticed_named');         -- as a member
--   SELECT * FROM public.my_intention_history('Adult');
