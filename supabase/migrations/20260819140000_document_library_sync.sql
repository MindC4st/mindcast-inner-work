-- Document library: make staff_documents the single documentation centre,
-- fed one-way from the Notion document hub by scripts/notion-sync-documents.mjs.
--
-- Reconciliation rules the sync enforces (see the script):
--   - Notion NEWER  -> prior version snapshotted to staff_document_versions,
--     then the row is updated. Signatures reference document_version, so
--     "who signed what" stays version-aware for free.
--   - Built doc NEWER or version conflict -> sync_flag = 'manual_review' and
--     the content is NOT touched. A document that has been through legal
--     review is never silently overwritten by a Notion draft.

ALTER TABLE public.staff_documents
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS body_md text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'built'
    CHECK (source IN ('built','notion')),
  ADD COLUMN IF NOT EXISTS notion_page_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS issued_date date,
  ADD COLUMN IF NOT EXISTS synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS sync_flag text
    CHECK (sync_flag IS NULL OR sync_flag IN ('manual_review'));

CREATE TABLE IF NOT EXISTS public.staff_document_versions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   uuid NOT NULL REFERENCES public.staff_documents(id) ON DELETE CASCADE,
  version       text NOT NULL,
  body_md       text,
  captured_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);

ALTER TABLE public.staff_document_versions ENABLE ROW LEVEL SECURITY;

-- Version history is a staff-facing record, admin-managed (the sync writes
-- with the service role, which bypasses RLS).
DROP POLICY IF EXISTS document_versions_staff_read ON public.staff_document_versions;
CREATE POLICY document_versions_staff_read ON public.staff_document_versions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'facilitator'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
