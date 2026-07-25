/**
 * Stripe Product & Price Setup for Mindcast
 * 
 * Creates:
 *   - 3 Products: Mindcast Adult, Mindcast Teen, Mindcast Child
 *   - 6 Prices: monthly + annual per product
 *   - 1 Coupon: FAMILY15 (15% forever)
 *
 * Usage: node stripe-setup.mjs
 * 
 * Requires env var: STRIPE_SECRET_KEY (your live or test key)
 * Or pass as arg:   node stripe-setup.mjs sk_test_xxxxxxxx
 */

const SECRET = (process.env.STRIPE_SECRET_KEY || process.argv[2]);
if (!SECRET) {
  console.error("❌ Need STRIPE_SECRET_KEY env var or pass as argument");
  console.error("   Usage: node stripe-setup.mjs <stripe_secret_key>");
  process.exit(1);
}

const MODE = SECRET.startsWith("sk_test_") ? "TEST MODE" : "LIVE MODE";
console.log(`\n🧪 ${MODE}\n`);

const BASE = "https://api.stripe.com/v1";

async function stripePost(path, data) {
  const body = Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(SECRET + ":")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  
  const json = await res.json();
  if (!res.ok) {
    console.error(`  ❌ ${path}: ${json.error?.message || JSON.stringify(json)}`);
    return null;
  }
  return json;
}

async function stripeGet(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Authorization": `Basic ${btoa(SECRET + ":")}` },
  });
  return await res.json();
}

// ─── Products ────────────────────────────────────────────────────────

const products = [
  { name: "Mindcast Adult", tier: "adult" },
  { name: "Mindcast Teen", tier: "teen" },
  { name: "Mindcast Child", tier: "child" },
];

console.log("📦 Creating Products...\n");
const createdProducts = [];

for (const p of products) {
  console.log(`  Creating "${p.name}"...`);
  const prod = await stripePost("/products", {
    name: p.name,
    description: `Mindcast ${p.tier} membership`,
    metadata: { tier: p.tier },
    ...(MODE === "LIVE MODE" ? {} : {}),
  });
  
  if (prod) {
    console.log(`    ✅ ${prod.id}`);
    createdProducts.push({ ...p, id: prod.id });
  }
}

// ─── Prices ──────────────────────────────────────────────────────────

const priceDefs = [
  { tier: "adult", label: "Adult Monthly",  amount: 1999,  interval: "month", metadata_plan: "monthly" },
  { tier: "adult", label: "Adult Annual",   amount: 19900, interval: "year",  metadata_plan: "annual" },
  { tier: "teen",  label: "Teen Monthly",   amount: 999,   interval: "month", metadata_plan: "monthly" },
  { tier: "teen",  label: "Teen Annual",    amount: 9900,  interval: "year",  metadata_plan: "annual" },
  { tier: "child", label: "Child Monthly",  amount: 499,   interval: "month", metadata_plan: "monthly" },
  { tier: "child", label: "Child Annual",   amount: 4900,  interval: "year",  metadata_plan: "annual" },
];

console.log("\n💰 Creating Prices...\n");
const createdPrices = {};

for (const pd of priceDefs) {
  const prod = createdProducts.find(p => p.tier === pd.tier);
  if (!prod) { console.log(`  ❌ No product for tier "${pd.tier}"`); continue; }
  
  console.log(`  ${pd.label}: ${(pd.amount / 100).toFixed(2)}/${pd.interval} on ${prod.id}...`);
  const price = await stripePost("/prices", {
    product: prod.id,
    unit_amount: String(pd.amount),
    currency: "nzd",
    recurring: JSON.stringify({ interval: pd.interval }),
    metadata: {
      tier: pd.tier,
      plan: pd.metadata_plan,
    },
  });
  
  if (price) {
    console.log(`    ✅ ${price.id}`);
    createdPrices[`${pd.tier}_${pd.metadata_plan}`] = price.id;
  }
}

// ─── Coupon ──────────────────────────────────────────────────────────

console.log("\n🎟️ Creating FAMILY15 Coupon...\n");

// Check if it already exists first
const existingCoupons = await stripeGet("/coupons?limit=100");
let coupon = null;
if (existingCoupons?.data) {
  coupon = existingCoupons.data.find(c => c.id === "FAMILY15" || c.name === "FAMILY15");
}
if (coupon) {
  console.log(`  ✅ Already exists: ${coupon.id} (${coupon.percent_off}% off, duration: ${coupon.duration})`);
} else {
  coupon = await stripePost("/coupons", {
    id: "FAMILY15",
    name: "Family Discount (15%)",
    percent_off: "15",
    duration: "forever",
    max_redemptions: "1",
    applies_to: JSON.stringify([]), // applies to all items
  });
  if (coupon) {
    console.log(`    ✅ Created: ${coupon.id} (15% forever)`);
  } else {
    console.log("  ⚠️  Creating with id FAMILY15 failed (maybe Stripe test-mode uses different id rules)");
    console.log("     Trying without explicit id...");
    coupon = await stripePost("/coupons", {
      name: "FAMILY15",
      percent_off: "15",
      duration: "forever",
      max_redemptions: "1",
    });
    if (coupon) console.log(`    ✅ Created: ${coupon.id} (use this id in checkout code)`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────

console.log("\n═══════════════════════════════════");
console.log("  SETUP COMPLETE");
console.log("═══════════════════════════════════\n");
console.log("Products:");
for (const p of createdProducts) {
  console.log(`  ${p.name.padEnd(20)} ${p.id}`);
}
console.log("");
console.log("Prices:");
for (const [key, id] of Object.entries(createdPrices)) {
  console.log(`  ${key.padEnd(20)} ${id}`);
}
console.log("");
if (coupon) console.log(`Coupon: ${coupon.id}`);
console.log("");

// ─── Env Vars to Set ─────────────────────────────────────────────────
console.log("───────────────────────────────────");
console.log("Set these Supabase secrets:");
console.log("───────────────────────────────────\n");

for (const [key, id] of Object.entries(createdPrices)) {
  const [tier, plan] = key.split("_");
  const envName = `STRIPE_PRICE_${tier.toUpperCase()}_${plan === "annual" ? "ANNUAL" : "MONTHLY"}`;
  console.log(`  ${envName}=${id}`);
}

console.log("");
if (coupon) {
  console.log(`  STRIPE_FAMILY_COUPON_ID=${coupon.id}`);
}
console.log("");
console.log("Also keep existing:");
console.log("  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET");
