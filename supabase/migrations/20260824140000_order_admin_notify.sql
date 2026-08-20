-- Admin notification guard for new shop orders. The stripe-webhook sets this
-- after emailing orders@mindcast.co.nz, so a Stripe redelivery never pings the
-- admin twice for the same order.
ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS admin_notified_at timestamptz;
