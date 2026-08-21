-- Persist the facilitator's interactive whiteboard per (week, track) so a
-- member's session history can show what was discussed. The Exercise slide
-- saves a tldraw snapshot here (debounced); members read it back read-only.

CREATE TABLE IF NOT EXISTS public.whiteboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL,
  audience_type text NOT NULL,
  session_code text,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT whiteboard_snapshots_week_audience_key UNIQUE (week_number, audience_type)
);

ALTER TABLE public.whiteboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whiteboard_read" ON public.whiteboard_snapshots;
CREATE POLICY "whiteboard_read" ON public.whiteboard_snapshots FOR SELECT USING (
  public.has_role(auth.uid(), 'facilitator'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.can_access_track(audience_type)
);

DROP POLICY IF EXISTS "whiteboard_staff_write" ON public.whiteboard_snapshots;
CREATE POLICY "whiteboard_staff_write" ON public.whiteboard_snapshots FOR ALL USING (
  public.has_role(auth.uid(), 'facilitator'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
) WITH CHECK (
  public.has_role(auth.uid(), 'facilitator'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);
