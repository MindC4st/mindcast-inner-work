// foundingBracelets.ts — Founding-100 NFC bracelet rules, pure and testable.
//
// The DATABASE is the authority (migration 20260825120000_nfc_bracelets_founding):
// advisory-locked RPCs plus a partial unique index enforce the cap and the
// one-per-email rule. This module mirrors those semantics exactly so the
// checkout UI can quote per-person prices before hitting Stripe, and so the
// rules are unit-tested. If this file and the migration ever disagree, the
// database wins — the webhook only honours what the RPCs reserved.
//
// Business rules:
//   * The first 100 UNIQUE member email addresses (primary holders, additional
//     adults, teens with logins) each get ONE free bracelet, ever.
//   * Children without logins never count and never receive founding bracelets.
//   * A reservation made at checkout start only becomes final when the
//     membership payment is confirmed; expired/failed checkouts release seats.

export const FOUNDING_CAP = 100;
export const BRACELET_PRICE_CENTS = 500;
export const BRACELET_SLUG = "nfc-bracelet";
export const MEMBERS_ONLY_TAG = "members-only";

/** Emails are compared normalized: trimmed + lowercased. */
export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

export const isValidEmail = (raw: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizeEmail(raw));

const CHILD_AGE_GROUPS = new Set(["child", "children", "kids", "kid", "little_ones"]);

/** Children without their own login/email are not bracelet-eligible members. */
export const isChildAgeGroup = (ageGroup?: string | null): boolean =>
  CHILD_AGE_GROUPS.has((ageGroup || "").trim().toLowerCase());

export type BraceletTier = "adult" | "teen";

export type FoundingPerson = {
  /** Stable key within a household quote (not necessarily the email). */
  key: string;
  name: string;
  email: string;
  tier: BraceletTier;
};

export type EntitlementState =
  | "free" // no live entitlement, cap not reached → next reservation gets a seat
  | "reserved" // mid-checkout elsewhere
  | "allocated" // founding member, bracelet unclaimed
  | "claimed" // founding member, bracelet already claimed
  | "exhausted"; // no entitlement and the cap is gone

export type QuoteLine = {
  person: FoundingPerson;
  /** FREE ($0), PAID ($5) or NONE (children — no bracelet through this promo). */
  price: "free" | "paid" | "none";
  reason: "founding_member" | "founding_available" | "cap_exhausted" | "already_claimed" | "child_no_login";
};

/**
 * Quote bracelets for a household, person by person, in order. Eligibility is
 * per individual — never per household. `states` carries any already-known
 * entitlement state per normalized email (from founding_bracelet_lookup);
 * `liveCount` is how many seats are currently held by OTHER emails.
 */
export function quoteHousehold(
  people: FoundingPerson[],
  states: Record<string, EntitlementState>,
  liveCount: number,
): { lines: QuoteLine[]; seatsTaken: number } {
  let taken = Math.max(0, Math.min(FOUNDING_CAP, liveCount));
  const seen = new Set<string>();
  const lines: QuoteLine[] = [];

  for (const person of people) {
    const email = normalizeEmail(person.email);

    if (!email || !isValidEmail(email)) {
      // No valid email = no individual member record = not counted (e.g. children).
      lines.push({ person, price: "none", reason: "child_no_login" });
      continue;
    }

    if (seen.has(email)) {
      // Duplicate email inside the same household: the person already priced
      // above keeps the seat; the duplicate never consumes a second one.
      const first = lines.find((l) => normalizeEmail(l.person.email) === email);
      lines.push({ person, price: first?.price === "free" ? "free" : "paid", reason: first?.reason === "founding_member" || first?.reason === "founding_available" ? "founding_member" : "cap_exhausted" });
      continue;
    }
    seen.add(email);

    const state = states[email];
    if (state === "claimed") {
      lines.push({ person, price: "paid", reason: "already_claimed" });
      continue;
    }
    if (state === "allocated" || state === "reserved") {
      lines.push({ person, price: "free", reason: "founding_member" });
      continue;
    }
    if (state === "exhausted" || taken >= FOUNDING_CAP) {
      lines.push({ person, price: "paid", reason: "cap_exhausted" });
      continue;
    }
    taken += 1;
    lines.push({ person, price: "free", reason: "founding_available" });
  }

  return { lines, seatsTaken: taken };
}

// ─── In-memory ledger mirroring the migration RPCs ──────────────────────────
// Used by tests to prove the semantics the database enforces: dedupe by
// email, hard cap at 100, finalize/release by session, single claim.

export type LedgerStatus = "reserved" | "allocated" | "claimed" | "released";
export type LedgerRow = {
  email_norm: string;
  seat_number: number | null;
  status: LedgerStatus;
  session_key: string | null;
  bracelet_order_id: string | null;
};

export class FoundingLedger {
  private rows: LedgerRow[] = [];

  get cap(): number {
    return FOUNDING_CAP;
  }

  liveCount(): number {
    return this.rows.filter((r) => r.status === "reserved" || r.status === "allocated" || r.status === "claimed").length;
  }

  remaining(): number {
    return Math.max(0, FOUNDING_CAP - this.liveCount());
  }

  rowFor(email: string): LedgerRow | undefined {
    const norm = normalizeEmail(email);
    return this.rows.find(
      (r) => r.email_norm === norm && (r.status === "reserved" || r.status === "allocated" || r.status === "claimed"),
    );
  }

  /** founding_bracelet_reserve */
  reserve(email: string, sessionKey: string): LedgerRow | null {
    const norm = normalizeEmail(email);
    if (!isValidEmail(norm)) return null;
    const existing = this.rowFor(norm);
    if (existing) return existing; // idempotent per email — never a second seat
    if (this.liveCount() >= FOUNDING_CAP) return null;
    const row: LedgerRow = {
      email_norm: norm,
      seat_number: this.liveCount() + 1,
      status: "reserved",
      session_key: sessionKey,
      bracelet_order_id: null,
    };
    this.rows.push(row);
    return row;
  }

  /** founding_bracelet_finalize */
  finalize(sessionKey: string): number {
    let n = 0;
    for (const r of this.rows) {
      if (r.session_key === sessionKey && r.status === "reserved") {
        r.status = "allocated";
        n += 1;
      }
    }
    return n;
  }

  /** founding_bracelet_release */
  release(sessionKey: string): number {
    let n = 0;
    for (const r of this.rows) {
      if (r.session_key === sessionKey && r.status === "reserved") {
        r.status = "released";
        r.seat_number = null;
        n += 1;
      }
    }
    return n;
  }

  /** founding_bracelet_claim — allocated only, once. */
  claim(email: string, orderId: string): LedgerRow | null {
    const norm = normalizeEmail(email);
    const row = this.rows.find((r) => r.email_norm === norm && r.status === "allocated");
    if (!row) return null;
    row.status = "claimed";
    row.bracelet_order_id = orderId;
    return row;
  }
}

// ─── Standalone purchase gating ─────────────────────────────────────────────

export type MembershipGate = {
  allowed: boolean;
  /** Why the gate is closed; null when allowed. */
  reason: "signed_out" | "membership_required" | null;
};

/** Server re-checks this; the UI gate only decides what to render. */
export function braceletPurchaseGate(session: { signedIn: boolean; membershipStatus?: string | null }): MembershipGate {
  if (!session.signedIn) return { allowed: false, reason: "signed_out" };
  const status = (session.membershipStatus || "none").toLowerCase();
  if (status !== "active" && status !== "trialing") {
    return { allowed: false, reason: "membership_required" };
  }
  return { allowed: true, reason: null };
}

/** Products carrying the members-only tag cannot be bought through guest, concession or casual flows. */
export function isMembersOnlyProduct(tags: string[] | null | undefined): boolean {
  return Array.isArray(tags) && tags.includes(MEMBERS_ONLY_TAG);
}

/**
 * Price for one bracelet line at shop checkout. A person with an unclaimed
 * ALLOCATED entitlement pays $0; everyone else pays $5. Reserved entitlements
 * belong to someone else's in-flight checkout and do not discount this one.
 */
export function braceletLinePrice(state: EntitlementState | undefined): number {
  return state === "allocated" ? 0 : BRACELET_PRICE_CENTS;
}
