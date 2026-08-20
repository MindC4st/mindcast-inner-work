-- Fix shop product image: prompt-action-tiles-1.jpg doesn't exist in storage;
-- the correct file is prompt-action-tiles-2.jpg.
UPDATE public.shop_products
SET image_url = 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/prompt-action-tiles-2.jpg'
WHERE slug = 'prompt-action-tiles'
  AND image_url LIKE '%prompt-action-tiles-1.jpg';
