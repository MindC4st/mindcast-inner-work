-- Shop shipping extension — turn the counter-pickup shop into a Shopify-style
-- shipped-goods shop: multi-item orders, collected shipping address, tracking,
-- order numbers and an order-email audit trail. Counter pickup stays working.
--
-- Pricing: NZD, GST inclusive. Shipping: flat $8 nationwide, free over $120
-- (constants live in create-shop-checkout, not here).

-- ── Products ───────────────────────────────────────────────────────────────
ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS tagline          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS long_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery_urls     text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bundle_slugs     text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.shop_products
  DROP CONSTRAINT IF EXISTS shop_products_fulfilment_check;
ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_fulfilment_check
  CHECK (fulfilment IN ('counter','partner','ship'));

-- ── Orders ─────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.shop_order_number_seq;

ALTER TABLE public.shop_orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE
    DEFAULT ('MC-' || lpad(nextval('public.shop_order_number_seq'::regclass)::text, 5, '0')),
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS shipping_cents integer NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  ADD COLUMN IF NOT EXISTS ship_name     text,
  ADD COLUMN IF NOT EXISTS ship_line1    text,
  ADD COLUMN IF NOT EXISTS ship_line2    text,
  ADD COLUMN IF NOT EXISTS ship_city     text,
  ADD COLUMN IF NOT EXISTS ship_postcode text,
  ADD COLUMN IF NOT EXISTS ship_country  text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url    text,
  ADD COLUMN IF NOT EXISTS shipped_at      timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS shipped_email_sent_at      timestamptz;

ALTER TABLE public.shop_orders
  DROP CONSTRAINT IF EXISTS shop_orders_fulfilment_check;
ALTER TABLE public.shop_orders
  ADD CONSTRAINT shop_orders_fulfilment_check
  CHECK (fulfilment IN ('counter','partner','ship'));

ALTER TABLE public.shop_orders
  DROP CONSTRAINT IF EXISTS shop_orders_status_check;
ALTER TABLE public.shop_orders
  ADD CONSTRAINT shop_orders_status_check
  CHECK (status IN ('paid','collected','shipped','refunded','cancelled'));

CREATE INDEX IF NOT EXISTS shop_orders_number_idx ON public.shop_orders (order_number);

-- ── Order items (multi-item carts) ─────────────────────────────────────────
-- shop_orders keeps its single-product snapshot columns for counter orders;
-- shipped cart orders carry their detail here. Written only by the webhook
-- (service role) — no client INSERT policy, same posture as shop_orders.
CREATE TABLE IF NOT EXISTS public.shop_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.shop_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.shop_products(id) ON DELETE SET NULL,
  slug text NOT NULL DEFAULT '',
  product_name text NOT NULL,
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total_cents integer NOT NULL CHECK (line_total_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shop_order_items_order_idx
  ON public.shop_order_items (order_id);

ALTER TABLE public.shop_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_order_items_read_own" ON public.shop_order_items;
CREATE POLICY "shop_order_items_read_own" ON public.shop_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shop_orders o
      WHERE o.id = order_id
        AND (
          o.profile_id = public.current_profile_id()
          OR public.has_role(auth.uid(), 'admin'::app_role)
          OR public.has_role(auth.uid(), 'facilitator'::app_role)
        )
    )
  );

-- ── Catalogue: the physical range (NZD, GST inclusive) ────────────────────
-- Copy rules: no must-have / complete-your-journey / member-essential /
-- limited / full-system language. Useful first, optional always.
INSERT INTO public.shop_products
  (slug, name, tagline, description, long_description, image_url, gallery_urls,
   price_cents, currency, category, fulfilment, bundle_slugs, is_active, sort_order)
VALUES
('13-week-phase-planner', 'MINDCAST 13-Week Phase Planner',
 'Turn what you noticed on Sunday into something you can actually practise.',
 'Turn what you noticed on Sunday into something you can actually practise.',
 'The MINDCAST Phase Planner gives you one place to hold your intention, check back in during the week and notice what actually changed. Each planner covers one 13-week MINDCAST phase, with space for your weekly focus, actions, insights and reflection.

It is deliberately not a productivity tracker. There are no streaks, scores or pressure to complete everything. Just a practical place to keep the things that matter visible long enough to do something with them.

Premium lay-flat construction, quality writing paper and restrained MINDCAST detailing make it designed to be used — not kept perfect.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/13-week-phase-planner-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/13-week-phase-planner-2.jpg,https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/13-week-phase-planner-3.jpg}',
 4400, 'nzd', 'planning', 'ship', '{}', true, 1),

('life-binder', 'MINDCAST Life Binder',
 'Keep the tools worth coming back to.',
 'Keep the tools worth coming back to.',
 'The Life Binder is a refillable home for your MINDCAST worksheets, practical tools, reflection pages and the ideas you want to keep.

Rather than finishing the year with a stack of loose paper, you can add, remove and reorganise pages as you go, using phase dividers to gradually build your own reference library.

What stays in it is entirely up to you. It is your binder, not something you hand in.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/life-binder-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/life-binder-2.jpg}',
 3900, 'nzd', 'planning', 'ship', '{}', true, 2),

('companion-journal', 'MINDCAST Companion Journal',
 'For the thoughts that don''t fit inside a box.',
 'For the thoughts that don''t fit inside a box.',
 'A simple, premium notebook for reflections, ideas, questions, notes and anything else you want to explore privately.

The Companion Journal is intentionally less structured than the Phase Planner. There are no prescribed outcomes and no expectation that anything you write will ever be shared.

Use it during MINDCAST, at home, or completely independently of the programme.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/companion-journal-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/companion-journal-2.jpg}',
 2500, 'nzd', 'planning', 'ship', '{}', true, 3),

('weekly-practice-fridge-board', 'MINDCAST Weekly Practice Fridge Board',
 'Keep this week''s intention somewhere life can actually see it.',
 'Keep this week''s intention somewhere life can actually see it.',
 'A reusable magnetic board that turns your weekly MINDCAST practice into something visible without needing to keep opening an app.

Use it to write your intention on Sunday, check back in during the week and reflect before you return.

Everything changes each week, so the prompts are reusable and erasable. Write what matters. Ignore what doesn''t. Wipe it clean and begin again.

The board is designed to support the practice — never to become another list of things you failed to complete.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/weekly-practice-fridge-board-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/weekly-practice-fridge-board-2.jpg}',
 2900, 'nzd', 'home', 'ship', '{}', true, 4),

('family-intention-board', 'MINDCAST Family Intention Board',
 'One place for the family to decide what you want more of this week.',
 'One place for the family to decide what you want more of this week.',
 'The Family Intention Board gives households a simple shared space to talk about what matters, choose one intention and decide on something worth doing together.

Use prompts such as:

THIS WEEK WE WANT MORE OF…
OUR FAMILY INTENTION
ONE THING WE''LL DO TOGETHER
WHAT WAS GOOD?

Modular name labels mean the board can work for different kinds of families and households.

It is an intention board, not a behaviour chart. No stars. No scores. No tracking who did what.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/family-intention-board-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/family-intention-board-2.jpg}',
 4900, 'nzd', 'home', 'ship', '{}', true, 5),

('prompt-action-tiles', 'MINDCAST Prompt + Action Tile Set',
 'Sometimes it''s easier to choose when you can see the options.',
 'Sometimes it''s easier to choose when you can see the options.',
 'A reusable collection of magnetic prompt tiles designed to make intentions more concrete.

Choose from simple actions such as:

MOVE · CONNECT · READ · REST · CREATE · OUTSIDE · FAMILY · RESET

Use them with the Family Intention Board or Weekly Practice Board, or simply place one somewhere visible as a reminder.

Blank write-on tiles are included because your intention does not have to fit one of ours.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/prompt-action-tiles-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/prompt-action-tiles-2.jpg}',
 2400, 'nzd', 'home', 'ship', '{}', true, 6),

('member-folio', 'MINDCAST Member Folio',
 'Take this week''s work with you. Leave the whole binder at home.',
 'Take this week''s work with you. Leave the whole binder at home.',
 'A slim, durable portfolio designed to carry your current worksheet, journal, planner and pen between MINDCAST and home.

Internal sleeves keep loose pages protected while a simple pen loop keeps the essentials together.

Minimal compartments. Minimal branding. Just enough organisation to make the physical system easy to use every week.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/member-folio-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/member-folio-2.jpg}',
 3400, 'nzd', 'carry', 'ship', '{}', true, 7),

('pen-set', 'MINDCAST Pen Set',
 'A good tool should disappear into the work.',
 'A good tool should disappear into the work.',
 'A set of smooth-writing MINDCAST pens designed for planners, journals, worksheets and everyday notes.

Comfortable to hold, satisfying to write with and understated enough to use anywhere. The set uses restrained MINDCAST colours and minimal branding rather than turning an everyday pen into merchandise.

Set of 3 premium pens: navy, blue and warm neutral.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/pen-set-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/pen-set-2.jpg}',
 1800, 'nzd', 'writing', 'ship', '{}', true, 8),

('highlighter-set', 'MINDCAST Highlighter Set',
 'Highlight what matters without turning the page fluorescent.',
 'Highlight what matters without turning the page fluorescent.',
 'A set of soft, muted highlighters designed for MINDCAST planners, journals and worksheets.

Use them to mark something you noticed, something you want to return to, or the one idea worth carrying into the week.

The colours are intentionally restrained and easy on the page — useful stationery rather than school-style neon markers.

Set of 4 muted colours: soft blue, muted sage, warm sand and pale support blue.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/highlighter-set-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/highlighter-set-2.jpg}',
 1600, 'nzd', 'writing', 'ship', '{}', true, 9),

('home-practice-bundle', 'MINDCAST Home Practice Bundle',
 'For people who want the main MINDCAST tools together.',
 'For people who want the main MINDCAST tools together.',
 'A coordinated home-practice set containing:

- 13-Week Phase Planner
- Companion Journal
- Weekly Practice Fridge Board
- Prompt + Action Tile Set
- Pen Set
- Member Folio

Bought individually: $174. Bundle price: $149.',
 'https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/home-practice-bundle-1.jpg',
 '{https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/shop/home-practice-bundle-2.jpg}',
 14900, 'nzd', 'bundle', 'ship',
 '{13-week-phase-planner,companion-journal,weekly-practice-fridge-board,prompt-action-tiles,pen-set,member-folio}',
 true, 10)
ON CONFLICT (slug) DO UPDATE SET
  name             = EXCLUDED.name,
  tagline          = EXCLUDED.tagline,
  description      = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  image_url        = EXCLUDED.image_url,
  gallery_urls     = EXCLUDED.gallery_urls,
  price_cents      = EXCLUDED.price_cents,
  currency         = EXCLUDED.currency,
  category         = EXCLUDED.category,
  fulfilment       = EXCLUDED.fulfilment,
  bundle_slugs     = EXCLUDED.bundle_slugs,
  is_active        = EXCLUDED.is_active,
  sort_order       = EXCLUDED.sort_order,
  updated_at       = now();

-- Verify after db push:
--   SELECT slug, name, price_cents, fulfilment FROM shop_products ORDER BY sort_order;
--   SELECT count(*) FROM shop_products WHERE is_active;  -- expect 10
