-- Complete the prepaid Concession Pass / one-off checkout path and document
-- the revised family-of-four discount contract.

-- Webhook idempotency: one Stripe payment intent can mint only one household
-- credit row, even when Stripe retries checkout.session.completed.
CREATE UNIQUE INDEX IF NOT EXISTS session_credits_payment_idx
  ON public.session_credits (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

COMMENT ON COLUMN public.subscriptions.family_discount IS
  'True when Stripe applied the 10% family discount: at least 2 adults and at least 2 teen/child places in any mix.';

COMMENT ON COLUMN public.profiles.family_discount IS
  'Denormalised household billing flag. Current eligibility is 2+ adults plus 2+ young people; Stripe applies 10%.';
