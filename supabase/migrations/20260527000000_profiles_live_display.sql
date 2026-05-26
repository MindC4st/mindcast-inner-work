-- Profile fields needed for Mindcast LIVE display privacy.
--
-- live_display_mode controls how the member's name appears on the
-- facilitator's live wall when they submit a public reflection:
--   'full'          — "Ash Carmichael"
--   'first_initial' — "Ash C."             (default — friendly + private)
--   'anonymous'     — "Anonymous"          (no name on screen)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS live_display_mode text DEFAULT 'first_initial';

-- Constrain to known values.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_live_display_mode_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_live_display_mode_check
      CHECK (live_display_mode IN ('full', 'first_initial', 'anonymous'));
  END IF;
END $$;

-- Backfill: split existing `name` on the first space so members joining
-- their first LIVE session don't have to set this up cold.
UPDATE public.profiles
SET
  first_name = split_part(NULLIF(name, ''), ' ', 1),
  last_name  = NULLIF(regexp_replace(NULLIF(name, ''), '^\S+\s*', ''), '')
WHERE (first_name IS NULL OR first_name = '')
  AND name IS NOT NULL
  AND name <> '';
