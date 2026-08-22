-- Founding waitlist: one entry per email (case-insensitive), so a returning
-- visitor re-submitting the form is a no-op rather than a duplicate row.
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_key ON public.waitlist (lower(email));
