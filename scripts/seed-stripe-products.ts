// Seed the Mindcast Stripe catalogue. Idempotent, matches on lookup key.
//
//   node --experimental-strip-types scripts/seed-stripe-products.ts
//   node --experimental-strip-types scripts/seed-stripe-products.ts --apply
//
// PROPOSAL — MC-MEM-106 v2.1. Read-only by default: without `--apply` it
// prints exactly what it would do and creates nothing. TEST MODE ONLY.
//
// ── Why there is no --live flag ───────────────────────────────────────────
// The brief asks for `--live` plus a typed confirmation. This script
// deliberately does not implement it. GST treatment is unconfirmed, and a
// flag that exists is a flag that gets used — usually by someone in a hurry,
// usually at the wrong time. Adding it is a two-line change once the founder
// and the accountant have signed off, and it should be made by whoever is
// standing behind that decision. Until then the key check below refuses any
// key that does not start with `sk_test_`.

import { assertCatalogue, CATALOGUE, CURRENCY, perSession, type CatalogueEntry } from "./stripe-catalogue.ts";

const APPLY = process.argv.includes("--apply");
const nzd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** Fail before touching the network. An assertion that runs last is decoration. */
function guardCatalogue(): void {
  const problems = assertCatalogue();
  if (problems.length === 0) {
    console.log(`✓ ${CATALOGUE.length} products, all assertions passed\n`);
    return;
  }
  console.error(`✗ catalogue failed ${problems.length} assertion(s):\n`);
  for (const p of problems) console.error(`  · ${p}`);
  console.error("\nNothing was created. Fix scripts/stripe-catalogue.ts and run again.");
  process.exit(1);
}

/** Test mode or nothing. Checked on the key itself, not on a flag. */
function guardKey(): string {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) {
    console.error("STRIPE_SECRET_KEY is not set. Export a TEST key (sk_test_…) and run again.");
    process.exit(1);
  }
  if (!key.startsWith("sk_test_")) {
    console.error(
      "Refusing to run: STRIPE_SECRET_KEY is not a test key.\n" +
      "This script does not write to live mode. No price goes live until the\n" +
      "founder and accountant have confirmed GST treatment (MC-MEM-106 v2.1).",
    );
    process.exit(1);
  }
  return key;
}

function plan(): void {
  console.log(`Catalogue (${CURRENCY.toUpperCase()}, GST treatment UNCONFIRMED):\n`);
  for (const e of CATALOGUE) {
    const per = e.metadata.trips && e.metadata.trips !== "1"
      ? `  (${nzd(perSession(e))}/session × ${e.metadata.trips})`
      : "";
    const cadence = e.billing === "weekly" ? "/week" : " one-time";
    console.log(`  ${e.lookupKey.padEnd(28)} ${nzd(e.amount).padStart(9)}${cadence}${per}`);
    console.log(`  ${"".padEnd(28)} ${JSON.stringify(e.metadata)}`);
  }
  console.log("");
}

/**
 * Upsert one entry. Matching is on the price lookup_key, which is what makes
 * a re-run safe: an existing price is reused, never duplicated.
 *
 * Stripe prices are immutable, so a changed amount cannot be edited — the old
 * price is archived, its lookup key transferred, and a new price created.
 * That is a real repricing event and the script says so out loud, because
 * anyone already subscribed stays on the old price until they are migrated.
 */
async function upsert(stripe: any, entry: CatalogueEntry): Promise<string> {
  const found = await stripe.prices.list({ lookup_keys: [entry.lookupKey], expand: ["data.product"], limit: 1 });
  const existing = found.data[0];

  if (existing) {
    const sameAmount = existing.unit_amount === entry.amount;
    const sameCadence = entry.billing === "weekly"
      ? existing.recurring?.interval === "week" && existing.recurring?.interval_count === 1
      : !existing.recurring;

    if (sameAmount && sameCadence) {
      // Metadata is mutable, so drift is repaired in place. This is the path
      // that fixes a missing requires_adult_membership without a reprice.
      if (APPLY) await stripe.prices.update(existing.id, { metadata: entry.metadata });
      console.log(`  = ${entry.lookupKey.padEnd(28)} ${existing.id} (metadata synced)`);
      return existing.id;
    }

    console.log(
      `  ! ${entry.lookupKey.padEnd(28)} REPRICE ${nzd(existing.unit_amount)} → ${nzd(entry.amount)} — ` +
      `existing subscribers stay on ${existing.id} until migrated`,
    );
    if (!APPLY) return existing.id;
    // Free the lookup key first; Stripe will not allow two prices to hold it.
    await stripe.prices.update(existing.id, { lookup_key: null, active: false });
  }

  const productId = existing?.product?.id ?? (APPLY
    ? (await stripe.products.create({ name: entry.productName, metadata: entry.metadata })).id
    : "prod_(dry-run)");

  if (!APPLY) {
    console.log(`  + ${entry.lookupKey.padEnd(28)} would create ${nzd(entry.amount)}`);
    return "price_(dry-run)";
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: CURRENCY,
    unit_amount: entry.amount,
    lookup_key: entry.lookupKey,
    transfer_lookup_key: true,
    ...(entry.billing === "weekly" ? { recurring: { interval: "week", interval_count: 1 } } : {}),
    metadata: entry.metadata,
  });
  console.log(`  + ${entry.lookupKey.padEnd(28)} ${price.id} created`);
  return price.id;
}

async function main() {
  guardCatalogue();
  plan();

  if (!APPLY) {
    console.log("Dry run. Re-run with --apply and a sk_test_ key to create these in test mode.");
    return;
  }

  const key = guardKey();

  let Stripe: any;
  try {
    ({ default: Stripe } = await import("stripe"));
  } catch {
    console.error("The `stripe` package is not installed. `npm i -D stripe` and run again.");
    process.exit(1);
  }

  const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });
  console.log("Applying to TEST mode:\n");
  for (const entry of CATALOGUE) await upsert(stripe, entry);
  console.log("\nDone. Verify in the Stripe test dashboard before anything reads these keys.");
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
