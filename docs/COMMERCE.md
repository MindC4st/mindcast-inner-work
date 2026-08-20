# MINDCAST Commerce — build documentation

A lightweight Shopify-style commerce system built natively into the MINDCAST
platform: existing auth, Supabase, Stripe, Resend email, design tokens and
admin roles. NZD, GST-inclusive, New Zealand market at launch.

## What was built

| Area | Where |
|---|---|
| Storefront | `/shop` (grid), `/shop/:slug` (product page), guest checkout |
| Cart | localStorage (`mindcast.shop.cart.v1`), works signed-in or out |
| Guest order lookup | `/orders/lookup` (order number + email, via `shop-admin.guest_lookup`) |
| Member orders | `/portal/orders` (payment + fulfilment status, tracking) |
| Admin | Console → **Commerce** tab: Dashboard, Orders, Products, Inventory, Fulfilment, Customers, Discounts, Reports, Settings |
| Edge functions | `create-shop-checkout`, `stripe-webhook`, `shop-admin`, `shop-products-admin` |

## Database changes

Migrations (applied):

- `20260824080000_commerce_roles.sql` — adds `commerce_admin`, `fulfilment`,
  `support` to `app_role`.
- `20260824080100_commerce_platform.sql` — the schema:
  - `shop_products` extended: `status` (draft/active/archived, kept in
    lockstep with legacy `is_active` via trigger), `sku`, `barcode`,
    `cost_price_cents`, `compare_at_price_cents`, `gst_treatment`,
    `weight_g`, `dimensions_mm`, `materials`, `track_stock`,
    `low_stock_threshold`, `allow_backorder`, `featured`, `tags`, `image_alt`.
  - `shop_product_variants` — every product sells through variants
    (single-variant products get a Default variant). Holds SKU, option
    values, price override, cost, materialised `stock_available`.
  - `shop_inventory_movements` — signed ledger (`received_stock`, `sale`,
    `cancelled_order_return`, `customer_return`, `manual_adjustment`,
    `damaged`, `missing`, `stocktake_adjustment`). Stock is never edited
    directly; `shop_adjust_stock()` locks the variant row and writes the
    movement in one transaction.
  - `shop_inventory_reservations` — checkout holds. `shop_reserve_stock()`
    locks the variant row, subtracts active reservations from available
    stock and fails with `insufficient_stock` — two people buying the final
    unit cannot both reserve it. Reservations expire after 60 minutes
    (expired rows are released lazily on the next reservation attempt).
  - `shop_orders` extended: `customer_id`, `payment_status`
    (pending/paid/partially_refunded/refunded/failed/cancelled),
    `fulfilment_status` (unfulfilled/picking/packed/fulfilled/shipped/
    delivered/cancelled), customer + billing snapshots, `discount_cents`,
    `discount_code`, `gst_cents`, `refunded_cents`. Order numbers are
    `MC-100001+` from `shop_order_number_seq`. Legacy `status` column kept
    for the counter-pickup guard trigger (now also allows `pending`).
  - `shop_order_items` extended: `variant_id`, `sku`, `gst_cents` snapshots.
  - `shop_payments` — charge/refund ledger rows.
  - `shop_refunds` — amount, items, `restock` flag, Stripe refund id, status.
  - `shop_fulfillments` + `shop_fulfillment_items` — partial fulfilment:
    each fulfilment carries the items/quantities it ships.
  - `shop_order_events` — immutable timeline (trigger rejects UPDATE/DELETE).
    `actor` NULL = SYSTEM.
  - `shop_discounts` + `shop_discount_redemptions` — fixed / percent /
    free-shipping, date windows, usage limits. No urgency mechanics.
  - `shop_customers` — commerce customer records (members by `profile_id`,
    guests by email). Deliberately separated from programme data.
  - `shop_notification_log` — every transactional email with provider
    message id / failure reason.
  - `shop_settings` — `shipping_flat_cents` (800), `free_shipping_threshold_cents`
    (12000), `shipping_countries` (NZ), `pickup_enabled`, `currency`.
  - `shop_audit_log` — immutable admin audit trail (before/after values).
- `20260824080200_shop_discount_counter.sql` — retry-safe usage counter.
- `20260824080300_shop_status_pending.sql` — legacy status CHECK extension.

Money is integer cents everywhere. GST is stored as a snapshot
(`gst_cents = round(total × 15/115)`) on orders and lines.

## Environment variables / secrets

Already present on the project (no new secrets required):

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — payments + webhook signing
- `RESEND_API_KEY`, `FROM_EMAIL` — transactional email
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — auto-injected into functions

## Stripe webhook setup

The webhook endpoint must receive these events (signature-verified; the
browser redirect is never trusted):

- `checkout.session.completed` — writes the order, order items, customer,
  converts the stock reservation into `sale` movements, records the discount
  redemption + payment ledger row, writes timeline events, sends the
  confirmation email.
- `checkout.session.expired`, `checkout.session.async_payment_failed` —
  release the stock reservation.
- `charge.refunded` — reconciles refunds issued from the admin OR the Stripe
  dashboard; idempotent via per-event bookkeeping on the timeline; updates
  `refunded_cents`/`payment_status`, writes the refund ledger row, sends the
  refund email.
- Subscription events continue to flow through the same endpoint unchanged.

Idempotency: `shop_orders.stripe_session_id` is UNIQUE (duplicate deliveries
skip creation and only re-attempt an unsent confirmation email); refund
reconciliation records processed event ids; discount redemption is guarded by
a unique (discount, order) constraint.

## Email configuration

Sent via Resend (`FROM_EMAIL`), logged to `shop_notification_log`:

| Email | Trigger |
|---|---|
| Order confirmation | webhook on payment (subject: "We've received your MINDCAST order — #MC-…") |
| Order shipped / partially shipped | admin creates a fulfilment with tracking |
| Refund confirmation | admin refund or webhook reconciliation |
| Order cancelled | admin cancellation |

Resend from the admin: order detail → "Resend confirmation" / "Resend
shipping" (support role or above).

## Admin permissions

Role hierarchy (DB helpers `has_commerce_admin` / `has_fulfilment_role` /
`has_support_role` / `has_any_commerce_role`):

| Role | Can |
|---|---|
| `admin` | everything |
| `commerce_admin` | products, pricing, variants, discounts, inventory adjustments, refunds, cancellations, settings, reports, audit log |
| `fulfilment` | view paid orders, pick/pack/ship, tracking, receive stock |
| `support` | find orders, resend emails, view status, notes |

Enforcement is server-side in the edge functions (`shop-admin`,
`shop-products-admin`) — hiding buttons in the UI is cosmetic only.
Refunds require `commerce_admin` (separately controllable per the spec).

## How fulfilment works

1. Order paid → `payment_status=paid`, `fulfilment_status=unfulfilled`,
   appears in Commerce → Fulfilment queue.
2. **Mark picking** → **Mark packed** (one tap each, mobile-friendly).
3. Enter carrier + tracking → **Ship & notify**: creates a
   `shop_fulfillment` (+ items), sets `fulfilment_status=shipped` when all
   lines are fulfilled, sends the shipping email. Partial shipments are
   supported — fulfil the remaining lines later; the order shows
   "Partially shipped" until complete.
4. **Mark delivered** when confirmed.
5. Every step lands on the immutable order timeline with the actor's name.

## How inventory adjustments work

- **Receive stock** (fulfilment role): creates a `received_stock` movement;
  supplier + purchase reference recorded.
- **Adjust stock** (commerce admin): `manual_adjustment`, `damaged`,
  `missing`, `stocktake_adjustment`, `customer_return` — signed quantity,
  reason required for audit.
- **Sale**: written by the webhook when payment confirms (from reservation).
- **Cancellation**: returns stock via `cancelled_order_return`.
- **Refunds do NOT restock automatically** — the refund dialog asks
  "Return items to inventory?" and only restocks on explicit yes
  (`customer_return` movements).
- Oversell prevention: `shop_reserve_stock` row-locks the variant and checks
  `stock_available − active reservations` at checkout creation; untracked
  products skip reservation; backorder products allow negatives.

## How refunds work

Order detail → Refund… → Full / By item / Manual amount, optional shipping
refund, optional restock, reason. The function records a pending refund row,
calls Stripe (`refunds.create` with an idempotency key), marks it succeeded,
updates `refunded_cents` + `payment_status` (partially_refunded/refunded),
writes the payments ledger + timeline + audit entries, and emails the
customer. Refunds issued directly in the Stripe dashboard are reconciled by
the `charge.refunded` webhook.

## Launch dependencies / follow-ups

- **⚠ STRIPE_SECRET_KEY is currently rejected by Stripe** (`mk_…` key
  returns "Invalid API Key"). Set a valid `sk_test_…` (then `sk_live_…`)
  under Supabase → Edge Functions → Secrets before any checkout can complete.
  This also affects the existing membership checkout, which uses the same key.
- **Stripe webhook events**: add the five commerce events above to the
  existing webhook subscription if they are not already included.
- **Test purchase**: run one end-to-end order with Stripe test cards before
  announcing the shop (session → payment → webhook → email → fulfil).
- **Sample data**: five orders for `sample@mindcast.co.nz` (MC-100003…100007)
  seed every admin state; delete them before go-live.
- **Stock tracking** is ON only for demo SKUs (pens 100/threshold 20,
  highlighters 8/threshold 10 → visible low-stock card). Enable tracking per
  product when manufacturing stock lands; until then untracked products sell
  without stock limits.
- **Product materials/dimensions** fields exist but are unpopulated — fill
  from the manufacturing brief when final.
- Sequence note: first real order will be MC-100008 (test runs consumed
  100001–100007); restart `shop_order_number_seq` if MC-100001 is required.
- Rural surcharge / AU shipping / NZ Post integration: shipping is
  settings-driven (`shop_settings`), so these extend without rework.
