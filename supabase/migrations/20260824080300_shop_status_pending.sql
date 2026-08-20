-- The legacy shop_orders.status column predates the payment/fulfilment split
-- and its CHECK only allowed post-payment states. Sample/dev orders need a
-- pre-payment state, and payment_status is now the source of truth anyway.
ALTER TABLE public.shop_orders
  DROP CONSTRAINT IF EXISTS shop_orders_status_check;
ALTER TABLE public.shop_orders
  ADD CONSTRAINT shop_orders_status_check
  CHECK (status IN ('pending','paid','collected','shipped','refunded','cancelled'));
