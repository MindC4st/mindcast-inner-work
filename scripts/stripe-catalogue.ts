// The Mindcast Stripe catalogue, and the assertions that guard it.
//
// PROPOSAL — MC-MEM-106 v2.1. Nothing here is live. Split out of
// seed-stripe-products.ts so the assertions can run in CI without a Stripe
// key: the point of an assertion that "must fail the run" is that it fails
// before anybody has network access, not after.
//
// Amounts are in CENTS, NZD. Prices are stored inclusive of GST because that
// is how they are quoted to a New Zealand consumer — but the GST TREATMENT IS
// NOT CONFIRMED. No price may be created in live mode until the founder and
// the accountant have signed that off.
//
// Entitlement is read from `metadata`, never from a nickname or a price ID.
// A nickname is a label someone can edit in the dashboard at 11pm; metadata is
// the contract.

export type Track = "adult" | "youth";
export type ProductKind = "membership" | "visitor_card" | "one_off";

export interface CatalogueEntry {
  /** Stripe price lookup_key. Stable. The app matches on this and nothing else. */
  lookupKey: string;
  productName: string;
  /** Cents, NZD, GST-inclusive pending confirmation. */
  amount: number;
  /** `weekly` creates a recurring price; `one_time` a one-off. */
  billing: "weekly" | "one_time";
  metadata: {
    track: Track;
    kind: ProductKind;
    app_access: "true" | "false";
    worksheet: "true";
    trips?: string;
    held_place?: "true";
    bound_workbook?: "true";
    requires_adult_membership?: "true" | "false";
    max_per_phase?: string;
  };
}

export const CURRENCY = "nzd";

export const CATALOGUE: CatalogueEntry[] = [
  {
    lookupKey: "adult_membership_weekly",
    productName: "Mindcast Adult Membership",
    amount: 1900,
    billing: "weekly",
    metadata: {
      track: "adult",
      kind: "membership",
      app_access: "true",
      worksheet: "true",
      held_place: "true",
      requires_adult_membership: "false",
    },
  },
  {
    lookupKey: "young_person_place_weekly",
    productName: "Mindcast Young Person Place",
    amount: 900,
    billing: "weekly",
    metadata: {
      track: "youth",
      kind: "membership",
      app_access: "false",
      worksheet: "true",
      held_place: "true",
      bound_workbook: "true",
      // Read by the checkout guard. See supabase/functions/_shared/youthGuard.ts.
      requires_adult_membership: "true",
    },
  },
  {
    lookupKey: "visitor_card_adult_10",
    productName: "Adult Concession Pass — 10 sessions",
    amount: 24000,
    billing: "one_time",
    metadata: {
      track: "adult",
      kind: "visitor_card",
      trips: "10",
      app_access: "false",
      worksheet: "true",
      max_per_phase: "1",
    },
  },
  {
    lookupKey: "visitor_card_youth_10",
    productName: "Under-18 Concession Pass — 10 sessions",
    amount: 12000,
    billing: "one_time",
    metadata: {
      track: "youth",
      kind: "visitor_card",
      trips: "10",
      app_access: "false",
      worksheet: "true",
      max_per_phase: "1",
    },
  },
  {
    lookupKey: "one_off_adult",
    productName: "Adult One-Off Session",
    amount: 3000,
    billing: "one_time",
    metadata: { track: "adult", kind: "one_off", trips: "1", app_access: "false", worksheet: "true" },
  },
  {
    lookupKey: "one_off_youth",
    productName: "Under-18 One-Off Session",
    amount: 1500,
    billing: "one_time",
    metadata: { track: "youth", kind: "one_off", trips: "1", app_access: "false", worksheet: "true" },
  },
];

const find = (c: CatalogueEntry[], key: string) => c.find((e) => e.lookupKey === key);

/** Per-session cost of a multi-trip product. Throws rather than divide by zero. */
export const perSession = (entry: CatalogueEntry): number => {
  const trips = Number(entry.metadata.trips ?? "1");
  if (!Number.isFinite(trips) || trips < 1) {
    throw new Error(`${entry.lookupKey}: trips metadata must be a positive integer, got ${entry.metadata.trips}`);
  }
  return entry.amount / trips;
};

/**
 * Every way this catalogue can be wrong. Returns the problems rather than
 * throwing on the first, so a single run tells the operator everything that
 * needs fixing instead of one thing at a time.
 *
 * These are the four assertions the brief requires to fail the run, plus the
 * structural checks needed for them to mean anything (a missing product would
 * otherwise make a comparison silently pass).
 */
export function assertCatalogue(catalogue: CatalogueEntry[] = CATALOGUE): string[] {
  const problems: string[] = [];

  // Structural: duplicate lookup keys would make the idempotent upsert
  // non-deterministic — whichever ran last would win.
  const seen = new Set<string>();
  for (const e of catalogue) {
    if (seen.has(e.lookupKey)) problems.push(`duplicate lookup key: ${e.lookupKey}`);
    seen.add(e.lookupKey);
    if (!Number.isInteger(e.amount) || e.amount < 0) {
      problems.push(`${e.lookupKey}: amount must be a whole number of cents, got ${e.amount}`);
    }
  }

  const REQUIRED = [
    "adult_membership_weekly", "young_person_place_weekly",
    "visitor_card_adult_10", "visitor_card_youth_10",
    "one_off_adult", "one_off_youth",
  ];
  for (const key of REQUIRED) {
    if (!find(catalogue, key)) problems.push(`missing required product: ${key}`);
  }

  // ── Rule 1 · casual always costs more per session than membership ───────
  // If a future price change inverts this, membership becomes the expensive
  // way to attend every week and the whole model stops making sense.
  for (const [cardKey, memberKey] of [
    ["visitor_card_adult_10", "adult_membership_weekly"],
    ["visitor_card_youth_10", "young_person_place_weekly"],
  ]) {
    const card = find(catalogue, cardKey);
    const member = find(catalogue, memberKey);
    if (!card || !member) continue;
    const rate = perSession(card);
    if (rate <= member.amount) {
      problems.push(
        `${cardKey} is ${rate}c per session, which is not more than ${memberKey} at ${member.amount}c per week — ` +
        `a visitor card must never be cheaper per session than membership`,
      );
    }
  }

  // ── Rule 1, second half · a one-off costs more than a card trip ─────────
  for (const [oneOffKey, cardKey] of [
    ["one_off_adult", "visitor_card_adult_10"],
    ["one_off_youth", "visitor_card_youth_10"],
  ]) {
    const oneOff = find(catalogue, oneOffKey);
    const card = find(catalogue, cardKey);
    if (!oneOff || !card) continue;
    const rate = perSession(card);
    if (oneOff.amount <= rate) {
      problems.push(
        `${oneOffKey} at ${oneOff.amount}c is not more than a ${cardKey} trip at ${rate}c — ` +
        `buying a card must always be the cheaper commitment`,
      );
    }
  }

  // ── Rule 2 · the youth place declares its dependency ────────────────────
  // The checkout guard reads this metadata. If it is missing, the guard's
  // server layer has nothing to check and youth places become buyable alone.
  const youthPlace = find(catalogue, "young_person_place_weekly");
  if (youthPlace && youthPlace.metadata.requires_adult_membership !== "true") {
    problems.push(
      "young_person_place_weekly is missing requires_adult_membership=true — " +
      "without it the checkout guard has nothing to read",
    );
  }

  // ── Rule 3 · no under-18 product opens the app ──────────────────────────
  for (const e of catalogue) {
    if (e.metadata.track === "youth" && e.metadata.app_access === "true") {
      problems.push(`${e.lookupKey}: app_access=true on a youth product — the app and journal are adult membership only`);
    }
  }

  // ── Rule 3, the other half · only one product opens the app ─────────────
  const withApp = catalogue.filter((e) => e.metadata.app_access === "true").map((e) => e.lookupKey);
  const unexpected = withApp.filter((k) => k !== "adult_membership_weekly");
  if (unexpected.length) {
    problems.push(`app_access=true on non-membership product(s): ${unexpected.join(", ")}`);
  }

  // ── The worksheet is included with everything, including the free trial ─
  for (const e of catalogue) {
    if (e.metadata.worksheet !== "true") {
      problems.push(`${e.lookupKey}: worksheet must be included with every access type`);
    }
  }

  return problems;
}
