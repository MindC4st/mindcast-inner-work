-- Pre-moderation flow for live audience responses.
--
-- Until a moderator approves it, a public response stays in the queue and
-- doesn't appear on the live feed. A denied response is broadcast back to
-- the submitter (so they see the Mindcast-tone "held in private" message)
-- and then deleted from the table.

ALTER TABLE public.session_responses
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS denial_reason text;

-- Existing rows were already showing on the live feed pre-migration; keep
-- that history visible by marking them approved.
UPDATE public.session_responses
SET moderation_status = 'approved'
WHERE moderation_status = 'pending';

-- Facilitator-role can delete denied responses.
DROP POLICY IF EXISTS "responses_facilitator_delete" ON public.session_responses;
CREATE POLICY "responses_facilitator_delete" ON public.session_responses
  FOR DELETE USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- Realtime already publishes session_responses (set up in the original
-- 20260524 migration), so UPDATE + DELETE events flow without further change.
