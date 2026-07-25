-- Add coloring page columns to mindcast_live_sessions
-- coloring_page_url = PNG image shown on the facilitator screen
-- coloring_pdf_url   = downloadable PDF with the coloring page

ALTER TABLE public.mindcast_live_sessions
  ADD COLUMN IF NOT EXISTS coloring_prompt text DEFAULT '',
  ADD COLUMN IF NOT EXISTS coloring_page_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS coloring_pdf_url text DEFAULT '';

-- Storage path policy for the coloring subfolder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'worksheets_coloring_read_all'
  ) THEN
    CREATE POLICY "worksheets_coloring_read_all"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'worksheets' AND (storage.foldername(name))[1] = 'coloring');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND schemaname = 'storage'
    AND policyname = 'worksheets_coloring_facilitator_write'
  ) THEN
    CREATE POLICY "worksheets_coloring_facilitator_write"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'worksheets'
        AND (storage.foldername(name))[1] = 'coloring'
        AND has_role(auth.uid(), 'facilitator'::app_role)
      );
  END IF;
END;
$$;
