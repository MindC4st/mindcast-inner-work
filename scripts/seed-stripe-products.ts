#!/usr/bin/env tsx
/**
 * seed-stripe-products.ts — Mindcast MC-MEM-106 v2.1 product catalogue.
 *
 * PROPOSAL — test mode only. Nothing here touches live mode without
 * `--live` AND a typed confirmation, and no price goes live until the
 * founder and accountant confirm GST treatment.
 *
 *   node scripts/seed-stripe-products.ts             # dry run: validate + print plan
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/seed-stripe-products.ts --apply
 *   node scripts/seed-stripe-products.ts --live      # requires typed confirmation
 *
 * Idempotent: products and prices are matched on lookup key / product
 * metadata. Entitlements are read from metadata — never from nicknames.
 */

import { readFileSync } from "node:fs";

// ── env ────────────────────────────────────────────────────────────────────
function env() {
  try {
    for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch { /* no .env is fine */ }
}
env();

const ARGS = process.argv.slice(2);
const LIVE = ARGS.includes("--live");
const APPLY = ARGS.includes("--apply");
const KEY = process.env.STRIPE_SECRET_KEY ?? "";

// ── catalogue (MC-MEM-106 v2.1) ────────────────────────────────────────────
type ProductDef = {
  lookup: string;
  name: string;
  description: string;
  recurring?: { interval: "week" };
  unit_amount: number; // NZD cents
  metadata: Record<string, string>;
};

export const CATALOGUE: ProductDef[] = [
  {
    lookup: "adult_membership_weekly",
    name: "Mindcast Adult Membership",
    description: "Weekly adult membership — held place, app and journal access, worksheet included.",
    recurring: { interval: "week" },
    unit_amount: 1900,
    metadata: {
      lookup_key: "adult_membership_weekly",
      track: "adult", kind: "membership", app_access: "true", worksheet: "true",
      held_place: "true", requires_adult_membership: "false",
    },
  },
  {
    lookup: "young_person_place_weekly",
    name: "Mindcast Young Person Place",
    description: "Weekly under-18 place. Add-on to an active adult household membership only.",
    recurring: { interval: "week" },
    unit_amount: 900,
    metadata: {
      lookup_key: "young_person_place_weekly",
      track: "youth", kind: "membership", app_access: "false", worksheet: "true",
      held_place: "true", bound_workbook: "true", requires_adult_membership: "true",
    },
  },
  {
    lookup: "visitor_card_adult_10",
    name: "Adult Concession Pass — 10 sessions",
    description: "Ten adult sessions. $24 a session. Worksheet included. One per person per phase.",
    unit_amount: 24000,
    metadata: {
      lookup_key: "visitor_card_adult_10",
      track: "adult", kind: "visitor_card", trips: "10", app_access: "false",
      worksheet: "true", max_per_phase: "1",
    },
  },
  {
    lookup: "visitor_card_youth_10",
    name: "Under-18 Concession Pass — 10 sessions",
    description: "Ten under-18 sessions. $12 a session. Worksheet included. One per person per phase.",
    unit_amount: 12000,
    metadata: {
      lookup_key: "visitor_card_youth_10",
      track: "youth", kind: "visitor_card", trips: "10", app_access: "false",
      worksheet: "true", max_per_phase: "1",
    },
  },
  {
    lookup: "one_off_adult",
    name: "Adult One-Off Session",
    description: "One adult session. Worksheet included.",
    unit_amount: 3000,
    metadata: {
      lookup_key: "one_off_adult",
      track: "adult", kind: "one_off", trips: "1", app_access: "false", worksheet: "true",
    },
  },
  {
    lookup: "one_off_youth",
    name: "Under-18 One-Off Session",
    description: "One under-18 session. Worksheet included.",
    unit_amount: 1500,
    metadata: {
      lookup_key: "one_off_youth",
      track: "youth", kind: "one_off", trips: "1", app_access: "false", worksheet: "true",
    },
  },
];

// ── assertions: these must fail the run ────────────────────────────────────
const perSession = (p: ProductDef) => p.unit_amount / Number(p.metadata.trips ?? 1);
const by = (k: string) => CATALOGUE.find((p) => p.lookup === k)!;

export function assertCatalogue(): string[] {
  const failures: string[] = [];
  const fail = (msg: string) => failures.push(msg);

  // Rule 1: casual always costs more per session than membership.
  if (perSession(by("visitor_card_adult_10")) <= by("adult_membership_weekly").unit_amount)
    fail("adult visitor-card per-session rate must exceed the adult weekly membership rate");
  if (perSession(by("visitor_card_youth_10")) <= by("young_person_place_weekly").unit_amount)
    fail("youth visitor-card per-session rate must exceed the youth weekly place rate");

  // One-offs above visitor-card rates.
  if (by("one_off_adult").unit_amount <= perSession(by("visitor_card_adult_10")))
    fail("adult one-off rate must exceed the adult visitor-card per-session rate");
  if (by("one_off_youth").unit_amount <= perSession(by("visitor_card_youth_10")))
    fail("youth one-off rate must exceed the youth visitor-card per-session rate");

  // Rule 2: youth place is an add-on, enforced in metadata.
  if (by("young_person_place_weekly").metadata.requires_adult_membership !== "true")
    fail("young_person_place_weekly must carry requires_adult_membership=true");

  // Rule 3: no app access for youth, visitor cards or one-offs.
  for (const p of CATALOGUE) {
    if (p.metadata.track === "youth" && p.metadata.app_access === "true")
      fail(`youth product ${p.lookup} must not grant app_access`);
    if (p.metadata.kind !== "membership" && p.metadata.app_access === "true")
      fail(`non-membership product ${p.lookup} must not grant app_access`);
  }

  // Worksheet everywhere, including free trial (trial carries no product;
  // the entitlement resolver grants worksheet:true unconditionally).
  for (const p of CATALOGUE) {
    if (p.metadata.worksheet !== "true") fail(`product ${p.lookup} must include the worksheet`);
  }
  return failures;
}

// ── Stripe REST via fetch (form-encoded) ───────────────────────────────────
const API = LIVE ? "https://api.stripe.com/v1" : "https://api.stripe.com/v1";
function form(obj: Record<string, string | number | boolean>): string {
  const flat: [string, string][] = [];
  const walk = (o: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null) continue;
      const key = prefix ? `${prefix}[${k}]` : k;
      if (typeof v === "object") walk(v as Record<string, unknown>, key);
      else flat.push([key, String(v)]);
    }
  };
  walk(obj, "");
  return flat.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}
async function stripe(path: string, body?: Record<string, string | number | boolean | Record<string, string>>): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ? form(body as Record<string, string | number | boolean>) : undefined,
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`Stripe ${path}: ${res.status} ${JSON.stringify(j)}`);
  return j;
}

async function findProductByLookup(lookup: string): Promise<unknown | null> {
  const q = await stripe(
    `/products/search?query=${encodeURIComponent(`metadata['lookup_key']:'${lookup}'`)}`,
  );
  return q.data?.[0] ?? null;
}
async function findPrice(product: string, recurring: boolean): Promise<unknown | null> {
  const q = await stripe(`/prices?product=${product}&active=true&limit=100`);
  return (q.data ?? []).find((p: unknown) => Boolean((p as { recurring?: boolean }).recurring) === recurring) ?? null;
}

// ── main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`MC-MEM-106 v2.1 catalogue — ${LIVE ? "LIVE" : "TEST"} mode, ${APPLY ? "APPLY" : "dry run"}`);

  const failures = assertCatalogue();
  if (failures.length) {
    console.error("\nAssertion failures — run aborted:");
    for (const f of failures) console.error("  ✗ " + f);
    process.exit(1);
  }
  console.log("Assertions passed:");
  console.log("  ✓ visitor-card per-session > weekly membership (adult $24 > $19, youth $12 > $9)");
  console.log("  ✓ one-off > visitor-card per-session (adult $30 > $24, youth $15 > $12)");
  console.log("  ✓ young_person_place_weekly carries requires_adult_membership=true");
  console.log("  ✓ no youth / visitor-card / one-off product grants app_access");
  console.log("  ✓ worksheet included on every product");

  console.log("\nCatalogue plan:");
  for (const p of CATALOGUE) {
    const price = `$${(p.unit_amount / 100).toFixed(2)}${p.recurring ? "/week" : p.metadata.trips !== "1" ? ` (${p.metadata.trips} trips @ $${(perSession(p) / 100).toFixed(2)})` : ""}`;
    console.log(`  ${p.lookup.padEnd(28)} ${price.padEnd(24)} ${p.name}`);
  }

  if (!APPLY) {
    console.log("\nDry run complete. Re-run with --apply and a test-mode STRIPE_SECRET_KEY to create.");
    return;
  }

  if (LIVE) {
    console.error("\nLIVE mode requires typing 'GST CONFIRMED' — the founder and accountant");
    console.error("must confirm GST treatment before any live price exists. Refusing.");
    process.exit(1);
  }
  if (!KEY.startsWith("sk_test_")) {
    console.error("Refusing: --apply without --live requires a test-mode key (sk_test_...).");
    process.exit(1);
  }

  const created: string[] = [];
  for (const p of CATALOGUE) {
    let product = await findProductByLookup(p.lookup);
    if (!product) {
      product = await stripe("/products", {
        name: p.name,
        description: p.description,
        "metadata[lookup_key]": p.lookup,
        ...Object.fromEntries(Object.entries(p.metadata).map(([k, v]) => [`metadata[${k}]`, v])),
      });
      created.push(`product ${p.name} (${product.id})`);
    }
    const existing = await findPrice(product.id, Boolean(p.recurring));
    if (!existing) {
      const price = await stripe("/prices", {
        product: product.id,
        currency: "nzd",
        unit_amount: p.unit_amount,
        lookup_key: p.lookup,
        ...(p.recurring ? { "recurring[interval]": p.recurring.interval } : {}),
      });
      created.push(`price ${p.lookup} ${price.id} $${(p.unit_amount / 100).toFixed(2)}${p.recurring ? "/week" : ""}`);
    } else {
      created.push(`price ${p.lookup} already present (${existing.id})`);
    }
  }
  console.log("\nResult:");
  for (const c of created) console.log("  • " + c);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
