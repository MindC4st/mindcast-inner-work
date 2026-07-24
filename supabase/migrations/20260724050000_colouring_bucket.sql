-- Private storage bucket for children's colouring PDFs.
--
-- Unlike the existing (public) worksheets bucket, colouring pages are paid kids
-- content — so the bucket is PRIVATE and served via signed URLs. Only a paying
-- adult with the kids add-on (or staff) can read, which means only they can mint
-- a signed URL. Facilitators upload.

INSERT INTO storage.buckets (id, name, public)
VALUES ('colouring', 'colouring', false)
ON CONFLICT (id) DO NOTHING;

-- Read: staff, or an active member who bought the kids add-on.
DROP POLICY IF EXISTS "colouring_read_kids_members" ON storage.objects;
CREATE POLICY "colouring_read_kids_members" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'colouring' AND (
      public.has_role(auth.uid(), 'facilitator'::app_role)
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.kids_addon = true
          AND p.membership_status IN ('active','trialing')
      )
    )
  );

-- Write: facilitators only.
DROP POLICY IF EXISTS "colouring_write_facilitator" ON storage.objects;
CREATE POLICY "colouring_write_facilitator" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'colouring' AND public.has_role(auth.uid(), 'facilitator'::app_role)
  );

DROP POLICY IF EXISTS "colouring_update_facilitator" ON storage.objects;
CREATE POLICY "colouring_update_facilitator" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'colouring' AND public.has_role(auth.uid(), 'facilitator'::app_role)
  );

DROP POLICY IF EXISTS "colouring_delete_facilitator" ON storage.objects;
CREATE POLICY "colouring_delete_facilitator" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'colouring' AND public.has_role(auth.uid(), 'facilitator'::app_role)
  );

-- Convention: store each week's PDF as 'week-01.pdf' … 'week-52.pdf'.
