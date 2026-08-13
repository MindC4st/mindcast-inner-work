-- Moderate the two legacy display walls.
--
-- /display/wordcloud and /display/goals put member free text on a projector with
-- only an opt-in toggle — no approve-before-show step. That is the one thing
-- Apple (§1.2) and Google both require of any app that displays user-generated
-- content, and it is simply the right call for a room with children in it.
--
-- (The arrival Welcome Wall shows names from a member's own profile, not free
-- text, so it needs no moderation. The Mindcast Live wall is already gated.)
--
-- These walls are also superseded by the moderated word cloud now built into the
-- Together slide, so rather than build a whole review workflow for them we make
-- them FAIL CLOSED: nothing appears until a facilitator approves it.

ALTER TABLE public.workbook_entries
  ADD COLUMN IF NOT EXISTS leaving_word_status text NOT NULL DEFAULT 'pending'
    CHECK (leaving_word_status IN ('pending','approved','denied'));

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS goal_status text NOT NULL DEFAULT 'pending'
    CHECK (goal_status IN ('pending','approved','denied'));

CREATE INDEX IF NOT EXISTS workbook_entries_leaving_word_status_idx
  ON public.workbook_entries (leaving_word_status)
  WHERE share_leaving_word IS TRUE;

CREATE INDEX IF NOT EXISTS check_ins_goal_status_idx
  ON public.check_ins (goal_status)
  WHERE share_goal_publicly IS TRUE;

-- Facilitators/admins may set the status (members cannot approve their own).
DROP POLICY IF EXISTS "workbook_entries_wall_moderate" ON public.workbook_entries;
CREATE POLICY "workbook_entries_wall_moderate" ON public.workbook_entries
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
