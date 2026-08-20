// seed-commerce-samples.mjs — development sample orders so the commerce admin
// is testable immediately. Run once: node scripts/seed-commerce-samples.mjs
// Sample orders use sample@mindcast.co.nz and carry no Stripe ids.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/).filter((l) => /^[A-Z]/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")]; }),
);

// Uses the management query endpoint via service role is not available here;
// instead run through the project's Supabase URL with the service key passed
// as SUPABASE_SERVICE_ROLE_KEY env.
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY to run this seed.");
  process.exit(1);
}
const supa = createClient(env.VITE_SUPABASE_URL, SERVICE_KEY);

const SAMPLE_EMAIL = "sample@mindcast.co.nz";

async function product(slug) {
  const { data } = await supa.from("shop_products").select("id, name, price_cents").eq("slug", slug).maybeSingle();
  if (!data) throw new Error(`product ${slug} not found`);
  return data;
}
async function variantId(productId) {
  const { data } = await supa.from("shop_product_variants").select("id").eq("product_id", productId).order("sort_order").limit(1).maybeSingle();
  return data?.id ?? null;
}

async function seedOrder({ status, payment, fulfilment, items, shipping = 800, tracking = null, note }) {
  const subtotal = items.reduce((s, it) => s + it.product.price_cents * it.quantity, 0);
  const total = subtotal + shipping;
  const { data: order, error } = await supa.from("shop_orders").insert({
    profile_id: null,
    customer_email: SAMPLE_EMAIL,
    customer_first_name: "Sample",
    customer_last_name: "Customer",
    product_id: items[0].product.id,
    product_name: items.length > 1 ? `${items[0].product.name} + ${items.length - 1} more` : items[0].product.name,
    unit_price_cents: items[0].product.price_cents,
    quantity: items.reduce((s, it) => s + it.quantity, 0),
    amount_total_cents: total,
    shipping_cents: shipping,
    gst_cents: Math.round(total * 15 / 115),
    currency: "nzd",
    fulfilment: "ship",
    status,
    payment_status: payment,
    fulfilment_status: fulfilment,
    ship_name: "Sample Customer",
    ship_line1: "1 Sample Street",
    ship_city: "Taupō",
    ship_postcode: "3330",
    ship_country: "NZ",
    tracking_number: tracking?.number ?? null,
    tracking_url: tracking?.url ?? null,
    shipped_at: tracking ? new Date().toISOString() : null,
    note: note ?? "SAMPLE ORDER — safe to delete",
  }).select("*").maybeSingle();
  if (error) throw error;

  await supa.from("shop_order_items").insert(items.map((it) => ({
    order_id: order.id,
    product_id: it.product.id,
    variant_id: it.variantId,
    slug: it.slug,
    sku: it.sku ?? null,
    product_name: it.product.name,
    unit_price_cents: it.product.price_cents,
    quantity: it.quantity,
    line_total_cents: it.product.price_cents * it.quantity,
    gst_cents: Math.round(it.product.price_cents * it.quantity * 15 / 115),
  })));

  await supa.from("shop_order_events").insert([
    { order_id: order.id, type: "order_placed", note: "Order placed (sample)" },
    ...(payment === "paid" || payment === "refunded" ? [{ order_id: order.id, type: "payment_confirmed", note: "Stripe payment confirmed (sample)" }] : []),
    ...(tracking ? [{ order_id: order.id, type: "fulfilment_shipped", note: `Shipped (sample) — tracking ${tracking.number}` }] : []),
  ]);

  if (payment === "refunded" || status === "refunded") {
    await supa.from("shop_refunds").insert({
      order_id: order.id, amount_cents: total, reason: "Sample refund", status: "succeeded",
    });
    await supa.from("shop_orders").update({ refunded_cents: total }).eq("id", order.id);
  }
  console.log(`  ${order.order_number} — ${payment}/${fulfilment}`);
}

const planner = await product("13-week-phase-planner");
const journal = await product("companion-journal");
const pens = await product("pen-set");
const board = await product("weekly-practice-fridge-board");
const tiles = await product("prompt-action-tiles");

const withVariant = async (p, slug, quantity, sku) => ({
  product: p, slug, quantity, sku, variantId: await variantId(p.id),
});

console.log("Seeding sample commerce orders…");
await seedOrder({
  status: "pending", payment: "pending", fulfilment: "unfulfilled",
  items: [await withVariant(journal, "companion-journal", 1, "MC-JOURNAL")],
  note: "SAMPLE — pending payment",
});
await seedOrder({
  status: "paid", payment: "paid", fulfilment: "unfulfilled",
  items: [
    await withVariant(planner, "13-week-phase-planner", 1, "MC-PLANNER-CRM"),
    await withVariant(pens, "pen-set", 2, "MC-PENS"),
  ],
  note: "SAMPLE — paid, unfulfilled",
});
await seedOrder({
  status: "paid", payment: "paid", fulfilment: "packed",
  items: [await withVariant(board, "weekly-practice-fridge-board", 1, "MC-FRIDGEBOARD")],
  note: "SAMPLE — packed, ready to ship",
});
await seedOrder({
  status: "shipped", payment: "paid", fulfilment: "shipped",
  items: [await withVariant(tiles, "prompt-action-tiles", 1, "MC-TILES")],
  tracking: { number: "ABC123456789", url: "https://example.com/track/ABC123456789" },
  note: "SAMPLE — shipped with tracking",
});
await seedOrder({
  status: "refunded", payment: "refunded", fulfilment: "unfulfilled",
  items: [await withVariant(journal, "companion-journal", 1, "MC-JOURNAL")],
  shipping: 0,
  note: "SAMPLE — refunded",
});
console.log("Done. Low-stock demo already exists (MC-HIGHLIGHTERS: 8 ≤ threshold 10).");
