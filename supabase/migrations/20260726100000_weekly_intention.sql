-- Close the accountability loop.
--
-- The home page promises two halves of one loop:
--   1. "Every session begins the same way — we return to the intention you set
--       seven days ago. Did you do it? What got in the way?"
--   2. "Before you leave, you write down one specific thing you'll do this week.
--       It goes in your workbook, and it comes back with you next Sunday."
--
-- Half 1 exists (the 'Return to Your Intention' slide). Half 2 had nowhere to
-- live: nothing captured the intention the next session asks members to return
-- to. This adds that field, plus a helper to read a member's previous-week
-- intention back to them.
--
-- Privacy: weekly_intention lives on lesson_journal, which is already owner-only
-- (+ linked-guardian read). Facilitators/admins cannot read member intentions.

ALTER TABLE public.lesson_journal
  ADD COLUMN IF NOT EXISTS weekly_intention text DEFAULT '',
  -- Set the following Sunday when the member says whether they did it.
  ADD COLUMN IF NOT EXISTS intention_outcome text
    CHECK (intention_outcome IS NULL OR intention_outcome IN ('did_it','partly','didnt')),
  ADD COLUMN IF NOT EXISTS intention_reflection text DEFAULT '';

-- Read the caller's own intention from a given week (used by the live "Return to
-- Your Intention" slide on the member's phone, and by the portal). SECURITY
-- DEFINER so it can resolve the caller's profile, but it only ever returns rows
-- belonging to the caller — never anyone else's.
CREATE OR REPLACE FUNCTION public.my_intention_for_week(p_week int, p_track text DEFAULT 'Adult')
RETURNS TABLE (week_number int, weekly_intention text, intention_outcome text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT lj.week_number, lj.weekly_intention, lj.intention_outcome
  FROM public.lesson_journal lj
  WHERE lj.profile_id = public.current_profile_id()
    AND lj.week_number = p_week
    AND lj.track = p_track
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.my_intention_for_week(int, text) TO authenticated;
