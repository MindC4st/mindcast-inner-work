import { describe, it, expect } from "vitest";
import {
  ageGroupForDob,
  normalizeEmail,
  isValidEmail,
  maskEmail,
  minorNeedsEmail,
  decideFamilyCheckin,
  TEEN_MIN_AGE,
} from "@/lib/familyTrial";

const yearsAgo = (n: number): string => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - n);
  return d.toISOString().slice(0, 10);
};

describe("age-group boundary (Child vs Teen)", () => {
  it("treats an 11-year-old as a child", () => {
    expect(ageGroupForDob(yearsAgo(11))).toBe("child");
  });
  it("treats a 12-year-old as a teen", () => {
    expect(ageGroupForDob(yearsAgo(12))).toBe("teen");
  });
  it("treats a 17-year-old as a teen", () => {
    expect(ageGroupForDob(yearsAgo(17))).toBe("teen");
  });
  it("rejects a malformed date", () => {
    expect(ageGroupForDob("not-a-date")).toBeNull();
  });
  it("rejects a future date", () => {
    expect(ageGroupForDob("2099-01-01")).toBeNull();
  });
});

describe("email handling", () => {
  it("normalises and validates emails", () => {
    expect(normalizeEmail("  Tom@Example.COM ")).toBe("tom@example.com");
    expect(isValidEmail("tom@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });
  it("masks an email for the success screen", () => {
    expect(maskEmail("sarah@example.com")).toBe("s****@example.com");
  });
  it("teen requires an email, child does not", () => {
    expect(minorNeedsEmail({ first_name: "Tom", last_name: "Jones", dob: yearsAgo(14), email: "" })).toBe(true);
    expect(minorNeedsEmail({ first_name: "Lucy", last_name: "Jones", dob: yearsAgo(8), email: "" })).toBe(false);
  });
});

describe("family check-in decision", () => {
  const adult = (name = "Sarah Jones", alreadyUsed = false) => ({ id: "a", name, isAdult: true, alreadyUsed });
  const teen = (name = "Tom Jones", alreadyUsed = false) => ({ id: "t", name, isAdult: false, alreadyUsed });
  const child = (name = "Lucy Jones", alreadyUsed = false) => ({ id: "c", name, isAdult: false, alreadyUsed });

  it("adult alone checks in", () => {
    expect(decideFamilyCheckin({ selected: [adult()], adultAlreadyInSameSession: false }))
      .toMatchObject({ ok: true, admitted: ["Sarah Jones"] });
  });

  it("adult + child + teen check in atomically", () => {
    expect(decideFamilyCheckin({ selected: [adult(), teen(), child()], adultAlreadyInSameSession: false }))
      .toMatchObject({ ok: true, admitted: ["Sarah Jones", "Tom Jones", "Lucy Jones"] });
  });

  it("teen scanning first (no adult) is rejected", () => {
    expect(decideFamilyCheckin({ selected: [teen()], adultAlreadyInSameSession: false }))
      .toMatchObject({ ok: false, reason: "parent_required" });
  });

  it("child without linked adult is rejected", () => {
    expect(decideFamilyCheckin({ selected: [child()], adultAlreadyInSameSession: false }))
      .toMatchObject({ ok: false, reason: "parent_required" });
  });

  it("minor admitted alone when the adult is already in the same session", () => {
    expect(decideFamilyCheckin({ selected: [teen()], adultAlreadyInSameSession: true }))
      .toMatchObject({ ok: true, admitted: ["Tom Jones"] });
  });

  it("already-used tickets are skipped (idempotent rescan)", () => {
    expect(decideFamilyCheckin({ selected: [adult("Sarah Jones", true), teen("Tom Jones", true)], adultAlreadyInSameSession: false }))
      .toMatchObject({ ok: true, admitted: [], alreadyIn: true });
  });

  it("mixed rescan admits only the fresh people", () => {
    expect(decideFamilyCheckin({ selected: [adult("Sarah Jones", true), child()], adultAlreadyInSameSession: false }))
      .toMatchObject({ ok: true, admitted: ["Lucy Jones"] });
  });
});

describe("boundary constant", () => {
  it("documents the teen boundary", () => {
    expect(TEEN_MIN_AGE).toBe(12);
  });
});
