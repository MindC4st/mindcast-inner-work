ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS render_id TEXT,
  ADD COLUMN IF NOT EXISTS render_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS video_mp4_url TEXT;

-- Unique constraint for upsert in generate-session-video edge function
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'worksheets_week_audience_unique'
  ) THEN
    CREATE UNIQUE INDEX worksheets_week_audience_unique
    ON public.worksheets (week_number, audience_type);
  END IF;
END
$$;
