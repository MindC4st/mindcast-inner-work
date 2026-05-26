-- Track Shotstack render output on the worksheets table so the facilitator
-- view and lesson page can embed the generated MP4 when it's ready.

ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS video_mp4_url text,
  ADD COLUMN IF NOT EXISTS render_id text,
  ADD COLUMN IF NOT EXISTS render_status text DEFAULT 'idle';

-- Make sure we can upsert by (week_number, audience_type) from the edge fn.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'worksheets_week_audience_key'
  ) THEN
    ALTER TABLE public.worksheets
      ADD CONSTRAINT worksheets_week_audience_key UNIQUE (week_number, audience_type);
  END IF;
END $$;

-- Realtime so the facilitator UI flips from "Rendering…" to the playable
-- video the moment the Shotstack webhook updates the row.
ALTER PUBLICATION supabase_realtime ADD TABLE public.worksheets;
