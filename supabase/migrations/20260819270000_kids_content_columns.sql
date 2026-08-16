-- Kids content columns (child lesson v3 rewrite): picture book + NZ
-- alternatives + read-aloud sourcing + game detail + colouring prompt.
ALTER TABLE public.curriculum_weeks
  ADD COLUMN IF NOT EXISTS kids_picture_book_author text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_picture_book_question text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_nz_alternative text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_nz_alternative_author text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_nz_alternative_note text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_nz_alternative_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kids_read_aloud_source_check text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_game_equipment text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_game_under5 text DEFAULT '',
  ADD COLUMN IF NOT EXISTS kids_source text DEFAULT '';
