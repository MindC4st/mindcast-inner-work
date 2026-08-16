-- Trial ticketing: delivery + one warm follow-up.
--
-- The charter's promise for the trial path: delivered by email with a
-- scannable QR and a plain-text fallback, then ONE follow-up after the
-- session — warm, no pressure, no urgency — and it must respect unsubscribe.
-- These columns make both enforceable in the database rather than by
-- convention: a follow-up can only send when it hasn't sent and the guest
-- hasn't opted out.

ALTER TABLE public.trial_tickets
  ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS marketing_opt_out boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS trial_tickets_follow_up_idx
  ON public.trial_tickets (redeemed_at)
  WHERE follow_up_sent_at IS NULL AND marketing_opt_out = false;
