-- Gate E: session lifecycle. The join code lives in live_session_state; add
-- opened/closed timestamps so a session can expire (code invalid once closed).
ALTER TABLE public.live_session_state
  ADD COLUMN IF NOT EXISTS opened_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;
