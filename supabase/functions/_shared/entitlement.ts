// resolveEntitlement — "can this person walk into this session, and what pays
// for it?"  Shared between the door-scan edge function and the vitest suite,
// following the same pattern as checkin-dedupe.ts.
//
// PROPOSAL. Nothing calls this yet. It is written against the access model in
// MC-MEM-106 v2.1 ($19 membership + visitor cards) so the shape can be
// reviewed before any price is created in Stripe.
//
// Deliberately pure: no Supabase client, no fetch, no clock of its own. The
// caller gathers the facts and applies the decision. That is what makes the
// door rules testable — a member wrongly turned away at the door is a
// real-world failure, and it should be catchable in CI rather than at 9am on a
// Sunday.
//
// ── Where each of the three rules is enforced ─────────────────────────────
//   1. Casual always costs more per session than membership. NOT here —
//      prices live in Stripe. See scripts/seed-stripe-products.ts assertions.
//   2. Under-18 places cannot be bought standalone. NOT a door rule. The
//      brief puts this at checkout (§4.1: UI, server, webhook), and it is
//      about buying a `young_person_place_weekly` SUBSCRIPTION. It is not a
//      reason to turn a teen away — a household whose adult membership lapsed
//      mid-phase would have its young people bounced at the door, which is the
//      turned-away family the brief exists to prevent. What this module does
//      is refuse to OFFER the youth subscription when there is no adult
//      membership to attach it to, and flag the situation for follow-up.
//      Casual youth access (visitor card, one-off, trial) is a one-time
//      purchase, not a subscription, and is not covered by rule 2 — the trial
//      pass explicitly says "bring the family".
//   3. App and journal are adult-membership only. Enforced here: `appAccess`
//      is true on exactly one branch.
//   4. A failed payment never blocks the door. `past_due` admits.

/** Which room. `youth` covers both the Teen and Child tracks for billing. */
export type Track = "adult" | "youth";

export type EntitlementKind =
  | "membership"
  | "concession"
  | "free_trial"
  | "visitor_card"
  | "one_off"
  | "comp";

/**
 * Stripe lookup keys, not prices and not labels. This module must never carry
 * member-facing pricing copy — that is MC-MEM-106 / MC-BRD-002 and a founder
 * decision. The UI maps these to whatever wording and figures are signed off.
 */
export type PurchaseOption =
  | "adult_membership_weekly"
  | "young_person_place_weekly"
  | "visitor_card_adult_10"
  | "visitor_card_youth_10"
  | "one_off_adult"
  | "one_off_youth";

/** Why the door found nothing. Machine-readable; the UI supplies the sentence. */
export type BlockReason = "no_entitlement";

export interface MembershipFact {
  /** Raw `subscriptions.status` from Stripe. */
  status: string;
  /**
   * The Stripe price lookup_key on the subscription item covering this
   * person. `adult_membership_weekly` is the only one that opens the app.
   */
  product: string | null;
}

export interface CreditFact {
  id: string;
  kind: "visitor_card" | "one_off" | "free_trial";
  track: Track;
  tripsTotal: number;
  tripsUsed: number;
  /** ISO date. Oldest credit is spent first so nothing quietly expires unused. */
  purchasedAt: string;
}

export interface EntitlementFacts {
  profileId: string;
  householdId: string | null;
  track: Track;
  /** Under 18 on the day of the session. Never granted app access. */
  isMinor: boolean;
  /** The subscription covering THIS person, or null. */
  membership: MembershipFact | null;
  /** From public.household_has_active_adult(). */
  householdHasActiveAdult: boolean;
  /** public.households.concession. A flag, not a discount code. */
  concession: boolean;
  /** A free_trials row if one exists. `usedAt` non-null means it is spent. */
  freeTrial: { usedAt: string | null } | null;
  /** session_credits rows for this person / household. */
  credits: CreditFact[];
  /**
   * An attendance row already exists for this profile on this session_date.
   * Set when a bracelet is scanned twice — a rescan must not spend a second
   * trip off a visitor card.
   */
  alreadyAttended: EntitlementKind | null;
  /** Door staff admitting someone by hand. Recorded, never silent. */
  staffOverride?: boolean;
}

/** What the caller should write once it acts on an `ok: true` decision. */
export type Consumption =
  | { type: "credit"; creditId: string }
  | { type: "free_trial"; profileId: string }
  | null;

export interface Admitted {
  ok: true;
  entitlement: EntitlementKind;
  /** Opens the member app and journal. True on one branch only. */
  appAccess: boolean;
  /** Included with every access type, including the free trial. Always true. */
  worksheet: true;
  consume: Consumption;
  /** Trips left AFTER this session, when a card paid for it. */
  tripsRemaining: number | null;
  /**
   * A young person attending with no active adult membership in the
   * household. Never blocks entry — it is a note for the office, not the
   * door. Set on admitted and blocked decisions alike.
   */
  youthWithoutActiveAdult: boolean;
  /** Stable code for logs and tests. Not shown to a member. */
  code: string;
}

export interface Blocked {
  ok: false;
  reason: BlockReason;
  options: PurchaseOption[];
  youthWithoutActiveAdult: boolean;
  code: string;
}

export type EntitlementDecision = Admitted | Blocked;

/** Statuses that mean "this membership is live". */
const LIVE = ["active", "trialing"];
/**
 * `past_due` is live at the door and nowhere else. The card failed; the
 * membership has not lapsed. Rule 4.
 */
const ADMITS = [...LIVE, "past_due"];

/**
 * What this person could buy. Rule 2 lives here: the youth SUBSCRIPTION is
 * only offered when there is an adult membership for it to hang off. Without
 * one, the route to a weekly place is the adult membership itself — so that
 * is what gets offered, alongside the casual options, which rule 2 does not
 * cover.
 */
const optionsFor = (track: Track, householdHasActiveAdult: boolean): PurchaseOption[] => {
  if (track === "adult") {
    return ["adult_membership_weekly", "visitor_card_adult_10", "one_off_adult"];
  }
  return householdHasActiveAdult
    ? ["young_person_place_weekly", "visitor_card_youth_10", "one_off_youth"]
    : ["adult_membership_weekly", "visitor_card_youth_10", "one_off_youth"];
};

const spendable = (c: CreditFact) => c.tripsUsed < c.tripsTotal;

/** Oldest first — a card bought in March should empty before one bought in June. */
const byAge = (a: CreditFact, b: CreditFact) =>
  Date.parse(a.purchasedAt) - Date.parse(b.purchasedAt);

export function resolveEntitlement(facts: EntitlementFacts): EntitlementDecision {
  const flagged = facts.track === "youth" && !facts.householdHasActiveAdult;

  const admit = (
    entitlement: EntitlementKind,
    code: string,
    extra: Partial<Admitted> = {},
  ): Admitted => ({
    ok: true,
    entitlement,
    appAccess: false,
    worksheet: true,
    consume: null,
    tripsRemaining: null,
    youthWithoutActiveAdult: flagged,
    code,
    ...extra,
  });

  // ── 0. Already through the door today ───────────────────────────────────
  // Before every other branch, because a rescan is the common case and must
  // be free. Without this, walking back in from the car park costs a trip.
  if (facts.alreadyAttended) {
    return admit(facts.alreadyAttended, "already_attended", {
      appAccess: facts.alreadyAttended === "membership" && !facts.isMinor && facts.track === "adult",
    });
  }

  // ── 0b. Staff override ──────────────────────────────────────────────────
  // Recorded as `comp` so it shows up in the count and can be questioned
  // later. Never grants app access — a comp is a seat, not a membership.
  if (facts.staffOverride) return admit("comp", "staff_override");

  // ── 1. Active membership ────────────────────────────────────────────────
  const m = facts.membership;
  if (m && ADMITS.includes(m.status.trim().toLowerCase())) {
    // Rule 3, in one place. Everything has to be true at once: an adult, in
    // the adult track, on the adult membership product, with the subscription
    // genuinely live. `past_due` admits to the room but not to the app —
    // otherwise a card that never gets fixed becomes free access forever.
    const appAccess =
      !facts.isMinor &&
      facts.track === "adult" &&
      m.product === "adult_membership_weekly" &&
      LIVE.includes(m.status.trim().toLowerCase());

    return admit("membership", appAccess ? "membership" : "membership_no_app", { appAccess });
  }

  // ── 2. Concession ───────────────────────────────────────────────────────
  // Resolves ahead of every credit branch so a concession household never
  // spends a trip it did not need to. Granted on request, no means testing.
  //
  // OPEN QUESTION FOR THE FOUNDER: concession as modelled here is a door
  // pathway, not a subscription, so it does NOT open the app. The pricing
  // sheet describes concession as "Same membership. Everything included." —
  // which would mean app access. If that is the intent, concession should be
  // a Stripe price resolved on branch 1 and this flag should disappear. Two
  // different products; I have not guessed which one you meant.
  if (facts.concession) return admit("concession", "concession");

  // ── 3. Unused free trial ────────────────────────────────────────────────
  // Once for life. The UNIQUE constraint on free_trials.profile_id is what
  // actually enforces that; this branch just spends it.
  if (facts.freeTrial && !facts.freeTrial.usedAt) {
    return admit("free_trial", "free_trial", {
      consume: { type: "free_trial", profileId: facts.profileId },
    });
  }

  // ── 4. Visitor card, matching track ─────────────────────────────────────
  // Track has to match. An adult card covering a youth place would let a
  // household buy the cheaper side of the catalogue for the wrong room.
  const card = facts.credits
    .filter((c) => c.kind === "visitor_card" && c.track === facts.track && spendable(c))
    .sort(byAge)[0];
  if (card) {
    return admit("visitor_card", "visitor_card", {
      consume: { type: "credit", creditId: card.id },
      tripsRemaining: card.tripsTotal - card.tripsUsed - 1,
    });
  }

  // ── 5. One-off credit ───────────────────────────────────────────────────
  // Last, so a single paid session is not spent while a multi-trip card the
  // household already owns sits unused.
  const oneOff = facts.credits
    .filter((c) => c.kind === "one_off" && c.track === facts.track && spendable(c))
    .sort(byAge)[0];
  if (oneOff) {
    return admit("one_off", "one_off", {
      consume: { type: "credit", creditId: oneOff.id },
      tripsRemaining: oneOff.tripsTotal - oneOff.tripsUsed - 1,
    });
  }

  // ── 6. Nothing on file ──────────────────────────────────────────────────
  // `ok: false` is a prompt to buy, not an instruction to turn someone away.
  // The facilitator sees the reason and the options so it becomes a
  // two-second conversation; the staff override above is the other half of
  // that. What this must never do is appear on a screen the room can see.
  return {
    ok: false,
    reason: "no_entitlement",
    options: optionsFor(facts.track, facts.householdHasActiveAdult),
    youthWithoutActiveAdult: flagged,
    code: "no_entitlement",
  };
}
