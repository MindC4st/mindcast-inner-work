-- Add a name column so the homepage founding-member form can store first names
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS name text;
