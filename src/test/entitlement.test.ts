import { describe, expect, it } from "vitest";
import {
  resolveEntitlement,
  type Blocked,
  type CreditFact,
  type EntitlementDecision,
  type EntitlementFacts,
} from "../../supabase/functions/_shared/entitlement";

// The door rules, as tests. Each of these describes someone standing in front
// of a facilitator on a Sunday morning — the failure mode is a real person
// being wrongly turned away, or a family quietly being charged twice.

const base: EntitlementFacts = {
  profileId: "p1",
  householdId: "h1",
  track: "adult",
  isMinor: false,
  membership: null,
  householdHasActiveAdult: true,
  concession: false,
  freeTrial: null,
  credits: [],
  alreadyAttended: null,
};

const facts = (over: Partial<EntitlementFacts> = {}): EntitlementFacts => ({ ...base, ...over });

// The repo compiles with `strict: false`, where a union discriminated on a
// boolean literal does not narrow. These assert the branch and hand back the
// right half, so a test that lands on the wrong one fails loudly here rather
// than reading `undefined` three lines later.
const blocked = (d: EntitlementDecision): Blocked => {
  expect(d.ok).toBe(false);
  return d as Blocked;
};

const card = (over: Partial<CreditFact> = {}): CreditFact => ({
  id: "c1",
  kind: "visitor_card",
  track: "adult",
  tripsTotal: 5,
  tripsUsed: 0,
  purchasedAt: "2026-03-01T00:00:00Z",
  ...over,
});

const adultMembership = { status: "active", product: "adult_membership_weekly" };
const youthPlace = { status: "active", product: "young_person_place_weekly" };

describe("resolveEntitlement — membership", () => {
  it("admits an active adult member and opens the app", () => {
    const d = resolveEntitlement(facts({ membership: adultMembership }));
    expect(d.ok).toBe(true);
    expect(d).toMatchObject({ entitlement: "membership", appAccess: true, consume: null });
  });

  it("admits a member whose payment failed", () => {
    // Rule 4. A declined card is a billing problem, not a door problem.
    const d = resolveEntitlement(facts({ membership: { ...adultMembership, status: "past_due" } }));
    expect(d.ok).toBe(true);
    expect(d).toMatchObject({ entitlement: "membership" });
  });

  it("does not open the app on a past_due membership", () => {
    // Admitted to the room, not to the journal — otherwise an unfixed card is
    // permanent free access.
    const d = resolveEntitlement(facts({ membership: { ...adultMembership, status: "past_due" } }));
    expect(d).toMatchObject({ appAccess: false });
  });

  it("falls through to the credit branches when a membership has lapsed", () => {
    const d = resolveEntitlement(facts({
      membership: { ...adultMembership, status: "lapsed" },
      credits: [card()],
    }));
    expect(d).toMatchObject({ entitlement: "visitor_card" });
  });
});

describe("resolveEntitlement — app access is adult membership only", () => {
  // Rule 3. Every one of these admits the person; none of them opens the app.
  const cases: Array<[string, EntitlementFacts]> = [
    ["a minor on the household membership", facts({ isMinor: true, track: "youth", membership: adultMembership })],
    ["an adult on a youth product", facts({ membership: youthPlace })],
    ["a visitor card", facts({ credits: [card()] })],
    ["a one-off", facts({ credits: [card({ kind: "one_off", tripsTotal: 1 })] })],
    ["a free trial", facts({ freeTrial: { usedAt: null } })],
    ["a concession", facts({ concession: true })],
    ["a staff comp", facts({ staffOverride: true })],
  ];

  for (const [name, f] of cases) {
    it(`admits ${name} without app access`, () => {
      const d = resolveEntitlement(f);
      expect(d.ok, name).toBe(true);
      expect(d, name).toMatchObject({ appAccess: false });
    });
  }
});

describe("resolveEntitlement — young people and the adult-membership rule", () => {
  // Rule 2 is a CHECKOUT rule (brief §4.1), about buying the weekly youth
  // subscription. In the resolver it shows up as an option that is not
  // offered — never as a locked door.
  const orphanYouth = { track: "youth" as const, isMinor: true, householdHasActiveAdult: false };

  it("never offers a standalone young person subscription", () => {
    const d = resolveEntitlement(facts(orphanYouth));
    expect(blocked(d).options).not.toContain("young_person_place_weekly");
    expect(blocked(d).options).toContain("adult_membership_weekly");
  });

  it("offers the young person place once there is an adult membership to attach it to", () => {
    const d = resolveEntitlement(facts({ track: "youth", isMinor: true, householdHasActiveAdult: true }));
    expect(blocked(d).options).toContain("young_person_place_weekly");
  });

  it("still offers casual youth access with no adult membership", () => {
    // A visitor card and a one-off are one-time purchases, not subscriptions.
    // Rule 2 does not reach them — the trial pass says "bring the family".
    const d = resolveEntitlement(facts(orphanYouth));
    expect(blocked(d).options).toContain("visitor_card_youth_10");
    expect(blocked(d).options).toContain("one_off_youth");
  });

  it("does not turn away a teen whose household membership lapsed mid-phase", () => {
    // The card was bought while the household was a member. Bouncing this
    // young person at the door is the turned-away family the brief exists to
    // prevent — the lapse is an office conversation, not a door policy.
    const d = resolveEntitlement(facts({ ...orphanYouth, credits: [card({ track: "youth" })] }));
    expect(d).toMatchObject({ ok: true, entitlement: "visitor_card" });
  });

  it("flags a young person attending without an active adult, on admit and on block", () => {
    expect(resolveEntitlement(facts({ ...orphanYouth, credits: [card({ track: "youth" })] })))
      .toMatchObject({ ok: true, youthWithoutActiveAdult: true });
    expect(resolveEntitlement(facts(orphanYouth)))
      .toMatchObject({ ok: false, youthWithoutActiveAdult: true });
  });

  it("admits a young person on the household place without app access", () => {
    const d = resolveEntitlement(facts({
      track: "youth", isMinor: true, householdHasActiveAdult: true, membership: youthPlace,
    }));
    expect(d).toMatchObject({ ok: true, entitlement: "membership", appAccess: false });
  });
});

describe("resolveEntitlement — resolution order", () => {
  it("spends nothing when a concession household attends", () => {
    // Concession resolves ahead of every credit branch precisely so this
    // household does not quietly burn a card it was given for free.
    const d = resolveEntitlement(facts({ concession: true, freeTrial: { usedAt: null }, credits: [card()] }));
    expect(d).toMatchObject({ entitlement: "concession", consume: null });
  });

  it("spends the free trial before any paid credit", () => {
    const d = resolveEntitlement(facts({ freeTrial: { usedAt: null }, credits: [card()] }));
    expect(d).toMatchObject({ entitlement: "free_trial", consume: { type: "free_trial", profileId: "p1" } });
  });

  it("ignores a free trial that has already been used", () => {
    const d = resolveEntitlement(facts({ freeTrial: { usedAt: "2026-01-11T00:00:00Z" }, credits: [card()] }));
    expect(d).toMatchObject({ entitlement: "visitor_card" });
  });

  it("spends a multi-trip card before a one-off", () => {
    const d = resolveEntitlement(facts({
      credits: [card({ id: "one", kind: "one_off", tripsTotal: 1 }), card({ id: "many" })],
    }));
    expect(d).toMatchObject({ entitlement: "visitor_card", consume: { type: "credit", creditId: "many" } });
  });

  it("spends the oldest card first", () => {
    const d = resolveEntitlement(facts({
      credits: [
        card({ id: "june", purchasedAt: "2026-06-01T00:00:00Z" }),
        card({ id: "march", purchasedAt: "2026-03-01T00:00:00Z" }),
      ],
    }));
    expect(d).toMatchObject({ consume: { type: "credit", creditId: "march" } });
  });
});

describe("resolveEntitlement — credits", () => {
  it("reports the trips left after this session", () => {
    const d = resolveEntitlement(facts({ credits: [card({ tripsTotal: 5, tripsUsed: 2 })] }));
    expect(d).toMatchObject({ tripsRemaining: 2 });
  });

  it("will not spend an empty card", () => {
    const d = resolveEntitlement(facts({ credits: [card({ tripsTotal: 5, tripsUsed: 5 })] }));
    expect(d).toMatchObject({ ok: false, reason: "no_entitlement" });
  });

  it("will not spend an adult card on a youth place", () => {
    const d = resolveEntitlement(facts({
      track: "youth", isMinor: true, credits: [card({ track: "adult" })],
    }));
    expect(d).toMatchObject({ ok: false, reason: "no_entitlement" });
  });
});

describe("resolveEntitlement — rescans", () => {
  it("does not charge a second time when someone walks back in", () => {
    // Bracelets get tapped twice. This is the branch that stops a trip from
    // disappearing on the way back from the car park.
    const d = resolveEntitlement(facts({ alreadyAttended: "visitor_card", credits: [card()] }));
    expect(d).toMatchObject({ ok: true, entitlement: "visitor_card", consume: null });
  });

  it("keeps app access on a rescanned membership", () => {
    const d = resolveEntitlement(facts({ alreadyAttended: "membership" }));
    expect(d).toMatchObject({ appAccess: true });
  });
});

describe("resolveEntitlement — nothing on file", () => {
  it("returns purchase options rather than an error", () => {
    const d = resolveEntitlement(facts());
    expect(d).toMatchObject({ ok: false, reason: "no_entitlement" });
    expect(blocked(d).options).toEqual(["adult_membership_weekly", "visitor_card_adult_10", "one_off_adult"]);
  });

  it("includes the worksheet with every access type", () => {
    // "Worksheet is included with every access type, including the free
    // trial." There is no branch where someone is admitted without it.
    for (const f of [
      facts({ membership: adultMembership }),
      facts({ concession: true }),
      facts({ freeTrial: { usedAt: null } }),
      facts({ credits: [card()] }),
      facts({ staffOverride: true }),
    ]) {
      const d = resolveEntitlement(f);
      if (!d.ok) throw new Error("expected an admit");
      expect(d.worksheet).toBe(true);
    }
  });

  it("carries no pricing copy — identifiers only", () => {
    // Member-facing wording and figures are MC-MEM-106 / MC-BRD-002 and a
    // founder decision. If a dollar sign ever appears in here, that decision
    // has been made by accident, in the wrong file.
    const d = resolveEntitlement(facts());
    // Lookup keys only — `visitor_card_adult_10` names the trip count, not a
    // price. A dollar sign here means a pricing decision was made by
    // accident, in the wrong file.
    for (const o of blocked(d).options) expect(o).toMatch(/^[a-z0-9_]+$/);
    expect(JSON.stringify(d)).not.toMatch(/[$£€]/);
  });
});
