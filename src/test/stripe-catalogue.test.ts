import { describe, expect, it } from "vitest";
import {
  assertCatalogue,
  CATALOGUE,
  perSession,
  type CatalogueEntry,
} from "../../scripts/stripe-catalogue";
import { ACCESS_PASS_OPTIONS } from "../../supabase/functions/_shared/accessPass";

// The four assertions the brief requires to fail the seed run, tested by
// breaking the catalogue on purpose. An assertion nobody has watched fail is
// an assertion nobody knows works.

/**
 * A copy of the catalogue with one entry mutated. The patch is deliberately
 * loosely typed: the whole point is to build catalogues the type system would
 * reject, because that is what a hand-edit in the Stripe dashboard produces.
 */
type Patch = { amount?: number; metadata?: Record<string, unknown> };

const broken = (lookupKey: string, patch: Patch): CatalogueEntry[] =>
  CATALOGUE.map((e) =>
    e.lookupKey === lookupKey
      ? ({ ...e, ...patch, metadata: { ...e.metadata, ...(patch.metadata ?? {}) } } as CatalogueEntry)
      : e,
  );

const failsWith = (catalogue: CatalogueEntry[], fragment: string) => {
  const problems = assertCatalogue(catalogue);
  expect(problems.length, `expected a failure mentioning "${fragment}", got: ${problems.join(" | ") || "none"}`)
    .toBeGreaterThan(0);
  expect(problems.join(" | ")).toContain(fragment);
};

describe("stripe catalogue — the shipped one", () => {
  it("matches the server-owned access-pass checkout contract", () => {
    for (const option of Object.values(ACCESS_PASS_OPTIONS)) {
      const catalogueEntry = CATALOGUE.find((entry) => entry.lookupKey === option.lookupKey);
      expect(catalogueEntry?.amount).toBe(option.amountCents);
      expect(catalogueEntry?.metadata.kind).toBe(option.kind);
      expect(catalogueEntry?.metadata.track).toBe(option.track);
      expect(Number(catalogueEntry?.metadata.trips)).toBe(option.trips);
    }
  });

  it("passes every assertion", () => {
    expect(assertCatalogue()).toEqual([]);
  });

  it("has the six products the brief specifies", () => {
    expect(CATALOGUE.map((e) => e.lookupKey).sort()).toEqual([
      "adult_membership_weekly",
      "one_off_adult",
      "one_off_youth",
      "visitor_card_adult_10",
      "visitor_card_youth_10",
      "young_person_place_weekly",
    ]);
  });

  it("prices casual above membership on both tracks", () => {
    // The published shape of the model: $24 a session against $19 a week,
    // $12 against $9. Stated here so a reprice has to change a test.
    const at = (k: string) => CATALOGUE.find((e) => e.lookupKey === k)!;
    expect(perSession(at("visitor_card_adult_10"))).toBe(2400);
    expect(at("adult_membership_weekly").amount).toBe(1900);
    expect(perSession(at("visitor_card_youth_10"))).toBe(1200);
    expect(at("young_person_place_weekly").amount).toBe(900);
  });
});

describe("stripe catalogue — assertion 1: a card is never cheaper than membership", () => {
  it("fails when an adult card drops to the membership rate", () => {
    failsWith(broken("visitor_card_adult_10", { amount: 19000 }), "must never be cheaper per session than membership");
  });

  it("fails when a youth card drops below the youth place rate", () => {
    failsWith(broken("visitor_card_youth_10", { amount: 8000 }), "must never be cheaper per session than membership");
  });

  it("fails on an exact tie, not just when cheaper", () => {
    // $19 a session against $19 a week is not a pricing model, it is an
    // accident. `<=`, not `<`.
    failsWith(broken("visitor_card_adult_10", { amount: 19000 }), "visitor_card_adult_10");
  });

  it("catches a reprice hidden in the trip count", () => {
    // Same $240, twenty trips instead of ten — the per-session rate halves
    // without the amount moving. Comparing headline prices would miss this.
    failsWith(broken("visitor_card_adult_10", { metadata: { trips: "20" } }), "per session");
  });
});

describe("stripe catalogue — assertion 2: a one-off is never cheaper than a card trip", () => {
  it("fails when the adult one-off undercuts a card trip", () => {
    failsWith(broken("one_off_adult", { amount: 2400 }), "must always be the cheaper commitment");
  });

  it("fails when the youth one-off undercuts a card trip", () => {
    failsWith(broken("one_off_youth", { amount: 1000 }), "must always be the cheaper commitment");
  });
});

describe("stripe catalogue — assertion 3: the youth place declares its dependency", () => {
  it("fails when requires_adult_membership is missing", () => {
    failsWith(
      broken("young_person_place_weekly", { metadata: { requires_adult_membership: undefined } }),
      "missing requires_adult_membership=true",
    );
  });

  it("fails when requires_adult_membership is set to false", () => {
    failsWith(
      broken("young_person_place_weekly", { metadata: { requires_adult_membership: "false" } }),
      "missing requires_adult_membership=true",
    );
  });
});

describe("stripe catalogue — assertion 4: no under-18 product opens the app", () => {
  it("fails when the youth place grants app access", () => {
    failsWith(
      broken("young_person_place_weekly", { metadata: { app_access: "true" } }),
      "the app and journal are adult membership only",
    );
  });

  it("fails when a youth visitor card grants app access", () => {
    failsWith(broken("visitor_card_youth_10", { metadata: { app_access: "true" } }), "app_access=true on a youth product");
  });

  it("fails when any non-membership product grants app access", () => {
    failsWith(
      broken("visitor_card_adult_10", { metadata: { app_access: "true" } }),
      "app_access=true on non-membership product",
    );
  });
});

describe("stripe catalogue — structural guards", () => {
  it("fails on a missing product rather than passing by omission", () => {
    // Without this, deleting visitor_card_adult_10 would make assertion 1
    // pass — there would be nothing left to compare.
    failsWith(CATALOGUE.filter((e) => e.lookupKey !== "visitor_card_adult_10"), "missing required product");
  });

  it("fails on a duplicate lookup key", () => {
    failsWith([...CATALOGUE, CATALOGUE[0]], "duplicate lookup key");
  });

  it("fails on a fractional amount", () => {
    // Stripe amounts are integer cents. $19.005 rounds somewhere invisible.
    failsWith(broken("adult_membership_weekly", { amount: 1900.5 }), "whole number of cents");
  });

  it("fails when the worksheet is dropped from any access type", () => {
    failsWith(broken("one_off_youth", { metadata: { worksheet: "false" } }), "worksheet must be included");
  });

  it("reports every problem in one run, not just the first", () => {
    const problems = assertCatalogue(
      broken("young_person_place_weekly", { metadata: { app_access: "true", requires_adult_membership: "false" } }),
    );
    expect(problems.length).toBeGreaterThan(1);
  });
});
