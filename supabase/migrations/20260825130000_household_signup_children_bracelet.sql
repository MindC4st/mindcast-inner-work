-- Household signup: child profiles without logins + $15 membership-checkout
-- bracelet product configuration.
--
-- 1. profiles.user_id becomes nullable so children (no auth account, no email)
--    can hold a real profile + household record. Everything downstream
--    (door_roster_for_token, room roll, Welcome Wall, safeguarding records)
--    joins on profiles.id, not user_id, so a NULL user_id is safe. RLS rows
--    keyed on user_id simply never match a child profile for anonymous or
--    other-member access; staff/admin policies still see them.
--
-- 2. The existing nfc-bracelet product becomes the $15 inventory-tracked
--    bracelet sold as the optional membership-checkout add-on (and standalone
--    for members). Reuses the existing shop architecture: one Default variant
--    carries stock so shop_reserve_stock / shop_convert_reservation work.

-- ─── 1. Child profiles ──────────────────────────────────────────────────────

ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- ─── 2. Bracelet product: $15, SKU, tracked inventory ──────────────────────

UPDATE public.shop_products
SET price_cents = 1500,
    sku = 'MC-BRACELET-NFC-01',
    track_stock = true,
    tagline = 'Your Mindcast check-in bracelet.',
    description = 'Your MINDCAST bracelet connects to your member profile for quick check-in at live sessions. Soft, reusable and made to be worn week after week.',
    updated_at = now()
WHERE slug = 'nfc-bracelet';

-- One Default variant carries the stock (shop_reserve_stock is variant-level).
INSERT INTO public.shop_product_variants (product_id, name, sku, option_values, stock_available, is_active, sort_order)
SELECT p.id, 'Default', 'MC-BRACELET-NFC-01', 'Default', 200, true, 0
FROM public.shop_products p
WHERE p.slug = 'nfc-bracelet'
  AND NOT EXISTS (
    SELECT 1 FROM public.shop_product_variants v WHERE v.product_id = p.id
  );
