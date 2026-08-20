-- marketing_opt_out on profiles — the general email preference, separate from
-- trial_tickets.marketing_opt_out (trial follow-up suppression).
-- notify-outbox checks this column to suppress the four non-transactional
-- emails (session reminder, practice reminder, absence notice, trial follow-up)
-- while never suppressing transactional sends.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_opt_out boolean NOT NULL DEFAULT false;
