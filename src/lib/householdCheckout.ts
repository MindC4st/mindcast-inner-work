// householdCheckout.ts — pure state + validation for the membership household
// form (PortalBilling). Extracted so the indexing rules are unit-tested: every
// row carries its tier-specific source index, so a teen row can never write
// into the extra-adult collection (or vice versa) regardless of render order.
//
// Person model:
//   * the payer occupies one adult seat (unless the payer is a teen)
//   * additional adults + teens each need a first name AND a valid unique email
//     (they get their own login and are each a founding-bracelet identity)
//   * children need a first name only — no email, no login, never counted for
//     the founding-100 bracelet promotion

import { isValidEmail, normalizeEmail } from "@/lib/foundingBracelets";

export type MemberDraft = { first_name: string; email: string };
export type ChildDraft = { first_name: string };
export type Tier = "adult" | "teen" | "child";

/** A named household member with a stable tier-specific source index. */
export type NamedMember = {
  key: string;
  tier: "adult" | "teen";
  sourceIndex: number;
  first_name: string;
  email: string;
};

export type ChildEntry = {
  key: string;
  sourceIndex: number;
  first_name: string;
};

export const blankMember = (): MemberDraft => ({ first_name: "", email: "" });
export const blankChild = (): ChildDraft => ({ first_name: "" });

/** Grow/shrink a draft list to n rows, preserving entered values. */
export function resizeRows<T>(rows: T[], n: number, blank: () => T): T[] {
  if (n <= rows.length) return rows.slice(0, n);
  return [...rows, ...Array.from({ length: n - rows.length }, blank)];
}

/** Immutable single-row update by tier-specific source index. */
export function updateRow<T>(rows: T[], sourceIndex: number, patch: Partial<T>): T[] {
  return rows.map((r, i) => (i === sourceIndex ? { ...r, ...patch } : r));
}

/**
 * Combined render list for "Who's joining you?" — each row keeps its own
 * sourceIndex so onChange handlers update the correct underlying collection.
 */
export function buildNamedMembers(extraAdults: MemberDraft[], teenDetails: MemberDraft[]): NamedMember[] {
  return [
    ...extraAdults.map((m, i) => ({ key: `adult-${i}`, tier: "adult" as const, sourceIndex: i, first_name: m.first_name, email: m.email })),
    ...teenDetails.map((m, i) => ({ key: `teen-${i}`, tier: "teen" as const, sourceIndex: i, first_name: m.first_name, email: m.email })),
  ];
}

export function buildChildEntries(children: ChildDraft[]): ChildEntry[] {
  return children.map((c, i) => ({ key: `child-${i}`, sourceIndex: i, first_name: c.first_name }));
}

export type HouseholdCounts = { adults: number; teens: number; children: number };

export type FieldErrors = Record<string, string>;

export type ValidationResult = {
  ok: boolean;
  errors: FieldErrors;
  /** Key of the first invalid field, for focus/scroll. */
  firstErrorKey: string | null;
};

/** How many additional-adult seats the payer must name (payer holds one adult seat unless they are a teen). */
export function expectedExtraAdults(counts: HouseholdCounts, payerIsTeen: boolean): number {
  return Math.max(0, counts.adults - (payerIsTeen ? 0 : 1));
}

/**
 * Field-level validation. Server-side create-subscription-checkout re-checks
 * every rule; this exists to keep entered data intact and show the problem
 * next to the field instead of failing after a redirect.
 */
export function validateHousehold(opts: {
  counts: HouseholdCounts;
  payerIsTeen: boolean;
  payerEmail: string;
  extraAdults: MemberDraft[];
  teenDetails: MemberDraft[];
  childDetails: ChildDraft[];
}): ValidationResult {
  const { counts, payerIsTeen, payerEmail, extraAdults, teenDetails, childDetails } = opts;
  const errors: FieldErrors = {};
  const seenEmails = new Map<string, string>(); // normalized email -> field key that claimed it
  const payerNorm = normalizeEmail(payerEmail);
  if (isValidEmail(payerNorm)) seenEmails.set(payerNorm, "payer");

  const needExtra = expectedExtraAdults(counts, payerIsTeen);
  const checkLoginMember = (m: MemberDraft, key: string, label: string) => {
    const name = m.first_name.trim();
    if (!name) {
      errors[`${key}-name`] = `Enter ${label} first name.`;
    }
    const email = normalizeEmail(m.email);
    if (!isValidEmail(email)) {
      errors[`${key}-email`] = name
        ? `Enter a valid email for ${name}.`
        : `Enter ${label} email.`;
    } else {
      const holder = seenEmails.get(email);
      if (holder === "payer") {
        errors[`${key}-email`] = "That's the account holder's email — each member needs their own.";
      } else if (holder) {
        errors[`${key}-email`] = "That email is already used by another member.";
      } else {
        seenEmails.set(email, key);
      }
    }
  };

  extraAdults.forEach((m, i) => checkLoginMember(m, `adult-${i}`, "their"));
  teenDetails.forEach((m, i) => checkLoginMember(m, `teen-${i}`, "their"));

  // Count sanity — the steppers and draft lists must agree.
  if (extraAdults.length !== needExtra) {
    errors["household-adults"] = "Household adult counts are out of sync — adjust the steppers.";
  }
  if (teenDetails.length !== counts.teens) {
    errors["household-teens"] = "Household teen counts are out of sync — adjust the steppers.";
  }
  if (childDetails.length !== counts.children) {
    errors["household-children"] = "Household child counts are out of sync — adjust the steppers.";
  }

  childDetails.forEach((c, i) => {
    if (!c.first_name.trim()) {
      errors[`child-${i}-name`] = `Enter child ${i + 1}'s first name.`;
    }
  });

  const firstErrorKey = Object.keys(errors)[0] ?? null;
  return { ok: firstErrorKey === null, errors, firstErrorKey };
}

/** Checkout contract member list (adults + teens + named children). */
export function buildCheckoutMembers(
  extraAdults: MemberDraft[],
  teenDetails: MemberDraft[],
  childDetails: ChildDraft[],
): { tier: Tier; first_name: string; email?: string }[] {
  return [
    ...extraAdults.map((m) => ({ tier: "adult" as const, first_name: m.first_name.trim(), email: normalizeEmail(m.email) })),
    ...teenDetails.map((m) => ({ tier: "teen" as const, first_name: m.first_name.trim(), email: normalizeEmail(m.email) })),
    ...childDetails.map((c) => ({ tier: "child" as const, first_name: c.first_name.trim() })),
  ];
}

// ── Bracelet chooser ─────────────────────────────────────────────────────────

export type BraceletPerson = {
  key: string;
  name: string;
  email: string;
  isPayer: boolean;
};

/**
 * People eligible for a bracelet: payer + named adults + named teens, each with
 * a valid email. Children never appear — they don't have logins.
 */
export function braceletEligiblePeople(
  payer: { name: string; email: string } | null,
  members: NamedMember[],
): BraceletPerson[] {
  const people: BraceletPerson[] = [];
  if (payer && isValidEmail(payer.email)) {
    people.push({ key: "payer", name: payer.name || "You", email: normalizeEmail(payer.email), isPayer: true });
  }
  for (const m of members) {
    const email = normalizeEmail(m.email);
    if (!isValidEmail(email)) continue; // not a person yet — no valid email
    people.push({ key: m.key, name: m.first_name.trim() || (m.tier === "teen" ? "Teen" : "Adult"), email, isPayer: false });
  }
  return people;
}
