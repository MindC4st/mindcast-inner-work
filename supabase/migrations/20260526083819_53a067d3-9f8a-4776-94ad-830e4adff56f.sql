-- Push notifications + per-user reminder prefs + callbacks snapshot + reminder log

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE (user_id, endpoint)
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_subs_own_read"   ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_subs_own_write"  ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_subs_own_update" ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "push_subs_own_delete" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_practice_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_practice_push  boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.featured_callbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_week_number int NOT NULL,
  next_week_number int NOT NULL,
  audience_type text NOT NULL,
  response_id uuid REFERENCES public.session_responses(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  response_text text NOT NULL,
  prompt_type text,
  selected_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);
CREATE INDEX IF NOT EXISTS featured_callbacks_next_week_idx ON public.featured_callbacks (next_week_number, audience_type);
ALTER TABLE public.featured_callbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "callbacks_read_authenticated" ON public.featured_callbacks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "callbacks_facilitator_manage" ON public.featured_callbacks FOR ALL USING (public.has_role(auth.uid(), 'facilitator'::app_role));

CREATE TABLE IF NOT EXISTS public.practice_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day text NOT NULL CHECK (day IN ('mon', 'wed', 'sun')),
  sent_for_date date NOT NULL,
  email_sent int NOT NULL DEFAULT 0,
  push_sent int NOT NULL DEFAULT 0,
  push_failed int NOT NULL DEFAULT 0,
  ran_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day, sent_for_date)
);
ALTER TABLE public.practice_reminder_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reminder_log_facilitator_read" ON public.practice_reminder_log FOR SELECT USING (public.has_role(auth.uid(), 'facilitator'::app_role));