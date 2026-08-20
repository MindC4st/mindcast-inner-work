-- Discount usage counter. Called by the Stripe webhook only after a
-- redemption row was newly inserted (the unique (discount_id, order_id)
-- constraint is what makes repeated webhook deliveries safe).
CREATE OR REPLACE FUNCTION public.shop_increment_discount(p_discount_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.shop_discounts
     SET times_used = times_used + 1
   WHERE id = p_discount_id;
END;
$$;
