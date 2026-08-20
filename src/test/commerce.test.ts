// Commerce logic tests — the pure half of the money path.
// The database half (oversell prevention, webhook idempotency) is enforced by
// shop_reserve_stock's row locking and the UNIQUE stripe_session_id, verified
// against the live schema; these tests pin the client-side arithmetic that
// must agree with it.
import { describe, expect, it } from "vitest";
import {
  computeDiscount, csvEscape, gstComponent, isOrderNumber, stockLabel, toCsv,
} from "@/lib/commerce";

describe("gstComponent", () => {
  it("extracts the 15% GST from a GST-inclusive amount", () => {
    // $44.00 inclusive contains $5.74 of GST (44 / 1.15 = 38.26 net)
    expect(gstComponent(4400)).toBe(574);
  });
  it("handles zero", () => {
    expect(gstComponent(0)).toBe(0);
  });
  it("rounds to whole cents", () => {
    expect(Number.isInteger(gstComponent(12345))).toBe(true);
  });
});

describe("computeDiscount", () => {
  it("applies a fixed discount capped at the subtotal", () => {
    expect(computeDiscount(10000, { kind: "fixed", value_cents: 2000, value_percent: null })).toBe(2000);
    expect(computeDiscount(1000, { kind: "fixed", value_cents: 2000, value_percent: null })).toBe(1000);
  });
  it("applies a percentage discount", () => {
    expect(computeDiscount(10000, { kind: "percent", value_cents: 0, value_percent: 20 })).toBe(2000);
  });
  it("free shipping does not reduce the subtotal", () => {
    expect(computeDiscount(10000, { kind: "free_shipping", value_cents: 0, value_percent: null })).toBe(0);
  });
  it("no discount means nothing off", () => {
    expect(computeDiscount(10000, null)).toBe(0);
  });
});

describe("stockLabel", () => {
  it("untracked products read as in stock", () => {
    expect(stockLabel(false, null, false).text).toBe("In stock");
  });
  it("tracked zero without backorder reads out of stock", () => {
    const s = stockLabel(true, 0, false);
    expect(s.text).toBe("Out of stock");
    expect(s.tone).toBe("void");
  });
  it("tracked zero with backorder stays orderable", () => {
    expect(stockLabel(true, 0, true).text).toBe("Available to order");
  });
  it("low availability shows the count", () => {
    expect(stockLabel(true, 3, false).text).toBe("Only 3 left");
  });
});

describe("isOrderNumber", () => {
  it("accepts MC-100001 style numbers", () => {
    expect(isOrderNumber("MC-100001")).toBe(true);
    expect(isOrderNumber("mc-100042")).toBe(true);
  });
  it("rejects predictable junk", () => {
    expect(isOrderNumber("MC-12")).toBe(false);
    expect(isOrderNumber("100001")).toBe(false);
    expect(isOrderNumber("")).toBe(false);
  });
});

describe("csv", () => {
  it("escapes commas, quotes and newlines", () => {
    expect(csvEscape("plain")).toBe("plain");
    expect(csvEscape("has,comma")).toBe('"has,comma"');
    expect(csvEscape('has "quote"')).toBe('"has ""quote"""');
    expect(csvEscape(null)).toBe("");
  });
  it("joins rows", () => {
    expect(toCsv([["a", 1], ["b", 2]])).toBe("a,1\nb,2");
  });
});
