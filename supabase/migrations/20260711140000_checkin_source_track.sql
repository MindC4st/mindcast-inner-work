-- Phase 3 — unify the check-in event pipeline.
--
-- Both the member's own-phone NFC tap (Capacitor Core NFC / Android NFC) and
-- the staff kiosk scan write to the SAME check_ins table via the nfc-checkin
-- edge function, so Supabase Realtime (the Welcome Wall) is the single source
-- of truth regardless of where the scan happened. These columns let us record
-- which track/room the check-in was for and where the scan originated.

ALTER TABLE public.check_ins
  ADD COLUMN IF NOT EXISTS track text
    CHECK (track IS NULL OR track IN ('Adult','Teen','Child')),
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'kiosk'
    CHECK (source IN ('kiosk','member_app','manual')),
  ADD COLUMN IF NOT EXISTS scheduled_session_id uuid
    REFERENCES public.scheduled_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS check_ins_scheduled_idx
  ON public.check_ins (scheduled_session_id);
