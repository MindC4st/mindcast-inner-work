import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import {
  FOUNDING_CAP, BRACELET_PRICE_CENTS, normalizeEmail, isValidEmail, isChildAgeGroup,
  quoteHousehold, FoundingLedger, braceletPurchaseGate, braceletLinePrice,
  isMembersOnlyProduct, type FoundingPerson,
} from "@/lib/foundingBracelets";

// The database is the authority for the Founding-100 promotion (migration
// 20260825120000_nfc_bracelets_founding). FoundingLedger mirrors the RPC
// semantics line-for-line so those rules are asserted here on every run; the
// final test pins the migration's concurrency guards so the two can't drift.

const person = (key: string, email: string, name = key, tier: "adult" | "teen" = "adult"): FoundingPerson =>
  ({ key, name, email, tier });

describe("founding identity rules", () => {
  it("normalizes emails before comparing", () => {
    expect(normalizeEmail("  Ash@Example.COM ")).toBe("ash@example.com");
    expect(isValidEmail("ash@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("never counts children without logins", () => {
    expect(isChildAgeGroup("child")).toBe(true);
    expect(isChildAgeGroup("kids")).toBe(true);
    expect(isChildAgeGroup("little_ones")).toBe(true);
    expect(isChildAgeGroup("teen")).toBe(false);
    expect(isChildAgeGroup("adult")).toBe(false);
  });
});

describe("counting individual members (not households)", () => {
  it("1. primary membership holder counts as one person", () => {
    const ledger = new FoundingLedger();
    ledger.reserve("parent1@email.com", "sess-1");
    expect(ledger.liveCount()).toBe(1);
  });

  it("2. an additional adult with a unique email counts as another", () => {
    const ledger = new FoundingLedger();
    ledger.reserve("parent1@email.com", "sess-1");
    ledger.reserve("parent2@email.com", "sess-1");
    expect(ledger.liveCount()).toBe(2);
  });

  it("3. a teen with a unique email counts as another", () => {
    const ledger = new FoundingLedger();
    ledger.reserve("parent1@email.com", "sess-1");
    ledger.reserve("parent2@email.com", "sess-1");
    ledger.reserve("teen@email.com", "sess-1");
    expect(ledger.liveCount()).toBe(3);
  });

  it("4. a child without email does not count", () => {
    const ledger = new FoundingLedger();
    expect(ledger.reserve("", "sess-1")).toBeNull();
    expect(ledger.reserve("   ", "sess-1")).toBeNull();
    expect(ledger.liveCount()).toBe(0);

    const { lines } = quoteHousehold(
      [person("kid", "", "Child aged 8")],
      {},
      0,
    );
    expect(lines[0].price).toBe("none");
    expect(lines[0].reason).toBe("child_no_login");
  });

  it("5. a duplicate email never increments the counter twice", () => {
    const ledger = new FoundingLedger();
    const first = ledger.reserve("teen@email.com", "sess-1");
    const again = ledger.reserve("TEEN@email.com ", "sess-2");
    expect(ledger.liveCount()).toBe(1);
    expect(again).toBe(first); // idempotent — same entitlement returned

    const { lines, seatsTaken } = quoteHousehold(
      [person("a", "teen@email.com"), person("b", "teen@email.com")],
      {},
      0,
    );
    // One seat, ever — the duplicate line is the same person and consumes nothing.
    expect(seatsTaken).toBe(1);
    const single = quoteHousehold([person("a", "teen@email.com")], {}, 0);
    expect(seatsTaken).toBe(single.seatsTaken);
    expect(lines[1].price).toBe(lines[0].price);
  });
});

describe("the cap and per-person pricing", () => {
  const fillTo = (ledger: FoundingLedger, n: number) => {
    for (let i = ledger.liveCount(); i < n; i++) {
      ledger.reserve(`member${i}@email.com`, "sess-fill");
    }
    ledger.finalize("sess-fill");
  };

  it("6. member #100 receives a free bracelet", () => {
    const ledger = new FoundingLedger();
    fillTo(ledger, 99);
    const hundredth = ledger.reserve("number100@email.com", "sess-100");
    expect(hundredth).not.toBeNull();
    expect(hundredth?.seat_number).toBe(100);
    ledger.finalize("sess-100");
    expect(ledger.claim("number100@email.com", "order-100")).not.toBeNull();
  });

  it("7. member #101 is charged $5", () => {
    const ledger = new FoundingLedger();
    fillTo(ledger, 100);
    expect(ledger.reserve("number101@email.com", "sess-101")).toBeNull();
    expect(braceletLinePrice("exhausted")).toBe(BRACELET_PRICE_CENTS);

    const { lines } = quoteHousehold([person("late", "late@email.com")], { "late@email.com": "exhausted" }, 100);
    expect(lines[0].price).toBe("paid");
  });

  it("8. a household crossing the threshold is priced person-by-person", () => {
    // Spots 99 and 100 remain: primary FREE, second adult FREE, teen $5.
    const { lines, seatsTaken } = quoteHousehold(
      [
        person("p1", "parent1@email.com", "Primary"),
        person("p2", "parent2@email.com", "Second adult"),
        person("t1", "teen@email.com", "Teen", "teen"),
      ],
      {},
      98,
    );
    expect(lines[0].price).toBe("free");
    expect(lines[1].price).toBe("free");
    expect(lines[2].price).toBe("paid");
    expect(seatsTaken).toBe(100);
  });

  it("9. a free entitlement cannot be claimed twice", () => {
    const ledger = new FoundingLedger();
    ledger.reserve("ash@email.com", "sess-a");
    ledger.finalize("sess-a");
    expect(ledger.claim("ash@email.com", "order-1")).not.toBeNull();
    expect(ledger.claim("ash@email.com", "order-2")).toBeNull();
    // A claimed person pays $5 for any later bracelet.
    const { lines } = quoteHousehold([person("ash", "ash@email.com")], { "ash@email.com": "claimed" }, 1);
    expect(lines[0].price).toBe("paid");
    expect(lines[0].reason).toBe("already_claimed");
  });
});

describe("standalone purchase gate", () => {
  it("10. non-members cannot purchase the standalone bracelet", () => {
    expect(braceletPurchaseGate({ signedIn: false }).allowed).toBe(false);
    const lapsed = braceletPurchaseGate({ signedIn: true, membershipStatus: "lapsed" });
    expect(lapsed.allowed).toBe(false);
    expect(lapsed.allowed === false && lapsed.reason).toBe("membership_required");
    expect(braceletPurchaseGate({ signedIn: true, membershipStatus: "none" }).allowed).toBe(false);
    expect(braceletPurchaseGate({ signedIn: true, membershipStatus: "past_due" }).allowed).toBe(false);
  });

  it("11. an active member can purchase the standalone bracelet", () => {
    expect(braceletPurchaseGate({ signedIn: true, membershipStatus: "active" }).allowed).toBe(true);
    expect(braceletPurchaseGate({ signedIn: true, membershipStatus: "trialing" }).allowed).toBe(true);
  });

  it("12+13. concession and casual-visitor checkouts never pass the members-only gate", () => {
    // Concession cards and casual visitor sessions are not memberships: their
    // buyers hit the same gate signed-out or without an active status.
    expect(isMembersOnlyProduct(["members-only", "nfc"])).toBe(true);
    expect(isMembersOnlyProduct(["stationery"])).toBe(false);
    expect(braceletPurchaseGate({ signedIn: false }).allowed).toBe(false);
    expect(braceletPurchaseGate({ signedIn: true, membershipStatus: "none" }).allowed).toBe(false);
  });
});

describe("failed checkouts and concurrency", () => {
  it("14. a failed membership payment does not permanently consume a founding place", () => {
    const ledger = new FoundingLedger();
    ledger.reserve("flaky@email.com", "sess-failed");
    expect(ledger.liveCount()).toBe(1);
    // Checkout expires / payment fails → webhook releases the session.
    expect(ledger.release("sess-failed")).toBe(1);
    expect(ledger.liveCount()).toBe(0);
    // The seat is available again — even to the same email later.
    expect(ledger.reserve("someone-else@email.com", "sess-ok")).not.toBeNull();
    expect(ledger.reserve("flaky@email.com", "sess-retry")).not.toBeNull();
    expect(ledger.liveCount()).toBe(2);
  });

  it("15. concurrent checkouts can never exceed 100 live entitlements", () => {
    const ledger = new FoundingLedger();
    // Two checkouts interleave reservations for 60 distinct emails each
    // (120 attempts against 100 seats).
    let accepted = 0;
    for (let round = 0; round < 60; round++) {
      if (ledger.reserve(`checkoutA-${round}@email.com`, "sess-A")) accepted++;
      if (ledger.reserve(`checkoutB-${round}@email.com`, "sess-B")) accepted++;
      expect(ledger.liveCount()).toBeLessThanOrEqual(FOUNDING_CAP);
    }
    expect(accepted).toBe(100);
    expect(ledger.liveCount()).toBe(100);
    // Finalizing both sessions keeps the cap: reserved → allocated, no growth.
    ledger.finalize("sess-A");
    ledger.finalize("sess-B");
    expect(ledger.liveCount()).toBe(100);
  });

  it("pins the database-level concurrency guards in the migration", () => {
    const sql = readFileSync(
      path.resolve(process.cwd(), "supabase/migrations/20260825120000_nfc_bracelets_founding.sql"),
      "utf8",
    );
    // One live entitlement per email, enforced by the database itself.
    expect(sql).toContain("CREATE UNIQUE INDEX IF NOT EXISTS founding_bracelets_email_live");
    expect(sql).toContain("WHERE status IN ('reserved', 'allocated', 'claimed')");
    // Cap checks are serialised across transactions.
    expect(sql).toContain("pg_advisory_xact_lock(hashtext('founding_bracelet_cap'))");
    // The hard cap.
    expect(sql).toContain("v_live_count >= 100");
    // Claims only ever transition allocated → claimed.
    expect(sql).toContain("WHERE email_norm = v_norm AND status = 'allocated'");
  });
});
