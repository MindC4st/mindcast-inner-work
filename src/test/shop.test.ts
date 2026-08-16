import { describe, it, expect } from "vitest";
import { describeOrder, formatCollectedAt, formatMoney, spacedCode } from "@/lib/shop";

describe("formatMoney", () => {
  it("formats NZD cents", () => {
    expect(formatMoney(4500)).toBe("$45.00");
    expect(formatMoney(4500, "nzd")).toBe("$45.00");
    expect(formatMoney(999)).toBe("$9.99");
    expect(formatMoney(0)).toBe("$0.00");
  });

  it("keeps two decimal places", () => {
    expect(formatMoney(4550)).toBe("$45.50");
    expect(formatMoney(4505)).toBe("$45.05");
    expect(formatMoney(100000)).toBe("$1000.00");
  });

  it("names a currency it has no symbol for", () => {
    expect(formatMoney(4500, "eur")).toBe("45.00 EUR");
  });
});

// Whether a code is redeemable decides whether someone walks away with a
// product, so every state is asserted rather than eyeballed.
describe("describeOrder", () => {
  it("marks a paid order redeemable", () => {
    const v = describeOrder("paid");
    expect(v.redeemable).toBe(true);
    expect(v.tone).toBe("ready");
    expect(v.label).toBe("READY TO COLLECT");
  });

  it("marks a collected order spent, and says when", () => {
    const at = new Date();
    at.setHours(20, 42, 0, 0);
    const v = describeOrder("collected", at.toISOString());
    expect(v.redeemable).toBe(false);
    expect(v.tone).toBe("spent");
    expect(v.helper).toContain("8:42pm");
  });

  it("still reads as spent when no timestamp came back", () => {
    const v = describeOrder("collected", null);
    expect(v.redeemable).toBe(false);
    expect(v.helper).toContain("already been used");
  });

  it("voids a refunded order — a refunded receipt must not read as valid", () => {
    const v = describeOrder("refunded");
    expect(v.redeemable).toBe(false);
    expect(v.tone).toBe("void");
  });

  it("voids a cancelled order", () => {
    expect(describeOrder("cancelled").redeemable).toBe(false);
  });

  it("fails closed on unknown, empty and null statuses", () => {
    for (const s of ["", "   ", "wat", "PAID_ISH", null, undefined]) {
      const v = describeOrder(s as string);
      expect(v.redeemable, `status=${String(s)}`).toBe(false);
      expect(v.tone, `status=${String(s)}`).toBe("void");
    }
  });

  it("is case- and whitespace-insensitive", () => {
    expect(describeOrder("  PAID ").redeemable).toBe(true);
    expect(describeOrder("Collected").redeemable).toBe(false);
  });

  it("only ever marks 'paid' as redeemable", () => {
    const states = ["paid", "collected", "refunded", "cancelled", "unknown"];
    const redeemable = states.filter((s) => describeOrder(s).redeemable);
    expect(redeemable).toEqual(["paid"]);
  });
});

describe("formatCollectedAt", () => {
  const now = new Date(2026, 7, 16, 21, 0, 0); // 16 Aug 2026, 9pm

  it("gives a time for today", () => {
    expect(formatCollectedAt(new Date(2026, 7, 16, 20, 42).toISOString(), now)).toBe("at 8:42pm");
    expect(formatCollectedAt(new Date(2026, 7, 16, 9, 5).toISOString(), now)).toBe("at 9:05am");
  });

  it("renders midnight and noon without a zero hour", () => {
    expect(formatCollectedAt(new Date(2026, 7, 16, 0, 30).toISOString(), now)).toBe("at 12:30am");
    expect(formatCollectedAt(new Date(2026, 7, 16, 12, 5).toISOString(), now)).toBe("at 12:05pm");
  });

  it("gives a date for another day", () => {
    expect(formatCollectedAt(new Date(2026, 8, 14, 20, 42).toISOString(), now)).toBe("on 14 Sep");
  });

  it("returns empty for an unparseable timestamp", () => {
    expect(formatCollectedAt("not-a-date", now)).toBe("");
  });
});

describe("spacedCode", () => {
  it("groups a five-character code", () => {
    expect(spacedCode("K4P9T")).toBe("K4P 9T");
  });

  it("upper-cases and trims", () => {
    expect(spacedCode(" k4p9t ")).toBe("K4P 9T");
  });

  it("leaves other lengths alone", () => {
    expect(spacedCode("ABC")).toBe("ABC");
    expect(spacedCode("")).toBe("");
  });
});
