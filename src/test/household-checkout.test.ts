import { describe, it, expect } from "vitest";
import {
  blankChild, blankMember, buildCheckoutMembers, buildChildEntries, buildNamedMembers,
  braceletEligiblePeople, expectedExtraAdults, resizeRows, updateRow, validateHousehold,
  type MemberDraft,
} from "@/lib/householdCheckout";

const member = (first_name: string, email: string): MemberDraft => ({ first_name, email });

describe("row updates use tier-specific source indexes (teen input regression)", () => {
  it("2 adults + 1 teen: typing in the teen row updates teenDetails, not extraAdults", () => {
    // THE broken case: combined render index 1 = teen-0, but teenDetails has
    // only index 0. Updates must go through sourceIndex, never the combined index.
    const extraAdults = [member("Matt", "matt@example.com")];
    const teenDetails = [member("", "")];
    const rows = buildNamedMembers(extraAdults, teenDetails);

    expect(rows.map((r) => r.key)).toEqual(["adult-0", "teen-0"]);
    const teenRow = rows[1];
    expect(teenRow.tier).toBe("teen");
    expect(teenRow.sourceIndex).toBe(0);

    // Simulate the teen email onChange using the row's own tier + sourceIndex.
    const nextTeens = updateRow(teenDetails, teenRow.sourceIndex, { email: "leo@example.com" });
    const nextAdults = extraAdults; // untouched

    expect(nextTeens[0].email).toBe("leo@example.com");
    expect(nextAdults[0].email).toBe("matt@example.com");

    // And the name field of the same row.
    const namedTeens = updateRow(nextTeens, teenRow.sourceIndex, { first_name: "Leo" });
    expect(namedTeens[0].first_name).toBe("Leo");
    expect(nextAdults[0].first_name).toBe("Matt");
  });

  it("3 adults + 3 teens: every row updates independently with no cross-writes", () => {
    const extraAdults = resizeRows([], 2, blankMember); // payer + 2 extra = 3 adults
    const teenDetails = resizeRows([], 3, blankMember);
    const rows = buildNamedMembers(extraAdults, teenDetails);
    expect(rows).toHaveLength(5);

    // Type into each row using its own sourceIndex; verify isolation.
    let adults = extraAdults;
    let teens = teenDetails;
    for (const r of rows) {
      const target = r.tier === "adult" ? adults : teens;
      const updated = updateRow(target, r.sourceIndex, { first_name: `Name-${r.key}`, email: `${r.key}@example.com` });
      if (r.tier === "adult") adults = updated; else teens = updated;
    }
    expect(adults.map((m) => m.email)).toEqual(["adult-0@example.com", "adult-1@example.com"]);
    expect(teens.map((m) => m.email)).toEqual(["teen-0@example.com", "teen-1@example.com", "teen-2@example.com"]);
    rows.forEach((r, combined) => {
      // Combined position never leaks into the source collection position.
      const source = r.tier === "adult" ? adults[r.sourceIndex] : teens[r.sourceIndex];
      expect(source.email).toBe(`${r.key}@example.com`);
      expect(combined).toBeGreaterThanOrEqual(r.sourceIndex);
    });
  });

  it("1 adult + 1 teen: teen row keeps its values across rebuilds", () => {
    const extraAdults: MemberDraft[] = []; // payer is the only adult
    let teenDetails = [member("", "")];
    const rows = buildNamedMembers(extraAdults, teenDetails);
    expect(rows).toHaveLength(1);
    expect(rows[0].key).toBe("teen-0");
    teenDetails = updateRow(teenDetails, rows[0].sourceIndex, { first_name: "Leo", email: "leo@example.com" });
    // Re-render (rebuild) — values survive because state, not DOM, holds them.
    const rebuilt = buildNamedMembers(extraAdults, teenDetails);
    expect(rebuilt[0].first_name).toBe("Leo");
    expect(rebuilt[0].email).toBe("leo@example.com");
  });

  it("resize preserves entered data when counts change", () => {
    let teens = resizeRows([], 2, blankMember);
    teens = updateRow(teens, 0, { first_name: "Leo", email: "leo@example.com" });
    teens = updateRow(teens, 1, { first_name: "Mia", email: "mia@example.com" });
    // Drop to 1 teen: Leo stays, Mia is removed.
    const shrunk = resizeRows(teens, 1, blankMember);
    expect(shrunk).toHaveLength(1);
    expect(shrunk[0].email).toBe("leo@example.com");
    // Grow back to 2: Leo's values are intact, new blank row appended.
    const grown = resizeRows(shrunk, 2, blankMember);
    expect(grown[0].email).toBe("leo@example.com");
    expect(grown[1]).toEqual({ first_name: "", email: "" });
  });
});

describe("validation", () => {
  const base = {
    payerIsTeen: false,
    payerEmail: "payer@example.com",
  };

  it("1 adult, no extras: valid with no members", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 1, teens: 0, children: 0 },
      extraAdults: [], teenDetails: [], childDetails: [],
    });
    expect(v.ok).toBe(true);
  });

  it("additional adult needs first name and valid email", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 2, teens: 0, children: 0 },
      extraAdults: [member("", "not-an-email")], teenDetails: [], childDetails: [],
    });
    expect(v.ok).toBe(false);
    expect(v.errors["adult-0-name"]).toBeTruthy();
    expect(v.errors["adult-0-email"]).toBeTruthy();
  });

  it("teen needs first name and valid email", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 1, teens: 1, children: 0 },
      extraAdults: [], teenDetails: [member("Leo", "leo@")], childDetails: [],
    });
    expect(v.ok).toBe(false);
    expect(v.errors["teen-0-email"]).toContain("Leo");
  });

  it("child needs only a first name — no email required", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 1, teens: 0, children: 1 },
      extraAdults: [], teenDetails: [], childDetails: [{ first_name: "Ruby" }],
    });
    expect(v.ok).toBe(true);
  });

  it("child without a name is rejected", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 1, teens: 0, children: 1 },
      extraAdults: [], teenDetails: [], childDetails: [{ first_name: "  " }],
    });
    expect(v.ok).toBe(false);
    expect(v.errors["child-0-name"]).toBeTruthy();
  });

  it("duplicate emails between members are rejected", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 2, teens: 1, children: 0 },
      extraAdults: [member("Matt", "matt@example.com")],
      teenDetails: [member("Leo", "matt@example.com")],
      childDetails: [],
    });
    expect(v.ok).toBe(false);
    expect(v.errors["teen-0-email"]).toBeTruthy();
    expect(v.errors["adult-0-email"]).toBeUndefined();
  });

  it("a teen reusing the payer email is rejected", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 1, teens: 1, children: 0 },
      extraAdults: [], teenDetails: [member("Leo", "PAYER@example.com ")], childDetails: [],
    });
    expect(v.ok).toBe(false);
    expect(v.errors["teen-0-email"]).toBeTruthy();
  });

  it("2 adults + 1 teen + 1 child all valid passes cleanly", () => {
    const v = validateHousehold({
      ...base,
      counts: { adults: 2, teens: 1, children: 1 },
      extraAdults: [member("Matt", "matt@example.com")],
      teenDetails: [member("Leo", "leo@example.com")],
      childDetails: [{ first_name: "Ruby" }],
    });
    expect(v.ok).toBe(true);
    expect(v.firstErrorKey).toBeNull();
  });

  it("expectedExtraAdults accounts for the payer's seat and teen payers", () => {
    expect(expectedExtraAdults({ adults: 2, teens: 0, children: 0 }, false)).toBe(1);
    expect(expectedExtraAdults({ adults: 1, teens: 0, children: 0 }, false)).toBe(0);
    expect(expectedExtraAdults({ adults: 3, teens: 1, children: 1 }, false)).toBe(2);
    expect(expectedExtraAdults({ adults: 1, teens: 1, children: 0 }, true)).toBe(1);
  });
});

describe("checkout contract", () => {
  it("builds members with emails for adults/teens and name-only children", () => {
    const members = buildCheckoutMembers(
      [member("Matt", " Matt@Example.com ")],
      [member("Leo", "leo@example.com")],
      [{ first_name: "Ruby" }],
    );
    expect(members).toEqual([
      { tier: "adult", first_name: "Matt", email: "matt@example.com" },
      { tier: "teen", first_name: "Leo", email: "leo@example.com" },
      { tier: "child", first_name: "Ruby" },
    ]);
    // Child entries must never carry an email field.
    expect("email" in members[2]).toBe(false);
  });

  it("child entries keep source indexes", () => {
    const entries = buildChildEntries([{ first_name: "Ruby" }, { first_name: "Koa" }]);
    expect(entries.map((e) => e.key)).toEqual(["child-0", "child-1"]);
    expect(entries[1].sourceIndex).toBe(1);
  });
});

describe("bracelet chooser eligibility", () => {
  it("payer + adult + teen are eligible; children never appear", () => {
    const members = buildNamedMembers(
      [member("Matt", "matt@example.com")],
      [member("Leo", "leo@example.com")],
    );
    const people = braceletEligiblePeople({ name: "Ash", email: "ash@example.com" }, members);
    expect(people.map((p) => p.email)).toEqual(["ash@example.com", "matt@example.com", "leo@example.com"]);
    expect(people[0].isPayer).toBe(true);
  });

  it("a teen with no valid email yet does not appear", () => {
    const members = buildNamedMembers([], [member("Leo", "")]);
    const people = braceletEligiblePeople({ name: "Ash", email: "ash@example.com" }, members);
    expect(people.map((p) => p.email)).toEqual(["ash@example.com"]);
  });

  it("a teen becomes eligible once their email is valid", () => {
    let teens = [member("Leo", "")];
    teens = updateRow(teens, 0, { email: "leo@example.com" });
    const people = braceletEligiblePeople({ name: "Ash", email: "ash@example.com" }, buildNamedMembers([], teens));
    expect(people.map((p) => p.name)).toEqual(["Ash", "Leo"]);
  });
});
