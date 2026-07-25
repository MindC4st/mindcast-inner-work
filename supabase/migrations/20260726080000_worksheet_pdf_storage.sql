-- Add worksheet_pdf_url + facilitator-uploaded coloring page paths to worksheets
-- so the Downloads portal can serve both worksheet PDFs and coloring PDFs.
-- Also add a storage path for worksheet PDFs under the worksheets bucket.

-- 1. New columns on the worksheets table
ALTER TABLE public.worksheets
  ADD COLUMN IF NOT EXISTS worksheet_pdf_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS coloring_pdf_url text DEFAULT '';

-- 2. Storage path policy for worksheet PDFs (subfolder worksheets/worksheet-pdfs/)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'worksheet_pdfs_read_all'
  ) THEN
    CREATE POLICY "worksheet_pdfs_read_all"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'worksheets' AND (storage.foldername(name))[1] = 'worksheet-pdfs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'worksheet_pdfs_facilitator_write'
  ) THEN
    CREATE POLICY "worksheet_pdfs_facilitator_write"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'worksheets'
        AND (storage.foldername(name))[1] = 'worksheet-pdfs'
        AND has_role(auth.uid(), 'facilitator'::app_role)
      );
  END IF;
END;
$$;

-- 3. Also add worksheet_prompt column to mindcast_live_sessions so facilitators
--    can see the week's worksheet content in the DB (mirrors curriculum data)
ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS worksheet_prompt text DEFAULT '';
