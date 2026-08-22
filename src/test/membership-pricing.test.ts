import { describe, expect, it } from "vitest";
import {
  FAMILY_DISCOUNT_PERCENT,
  PRICING,
  applyFamilyDiscount,
  isFamilyDiscountEligible,
} from "@/lib/membershipPricing";

describe("family discount", () => {
  it("is 10% for two adults plus two teens", () => {
    expect(FAMILY_DISCOUNT_PERCENT).toBe(10);
    expect(isFamilyDiscountEligible({ adults: 2, teens: 2, children: 0 })).toBe(true);
  });

  it("accepts two children or one teen plus one child", () => {
    expect(isFamilyDiscountEligible({ adults: 2, teens: 0, children: 2 })).toBe(true);
    expect(isFamilyDiscountEligible({ adults: 2, teens: 1, children: 1 })).toBe(true);
  });

  it("does not discount a three-person household", () => {
    expect(isFamilyDiscountEligible({ adults: 2, teens: 1, children: 0 })).toBe(false);
    expect(isFamilyDiscountEligible({ adults: 1, teens: 1, children: 2 })).toBe(false);
  });

  it("rounds the discounted charge in cents", () => {
    expect(applyFamilyDiscount(5_600, true)).toBe(5_040);
    expect(applyFamilyDiscount(5_600, false)).toBe(5_600);
  });
});

describe("prepaid access pricing", () => {
  it("keeps the published Concession Pass and one-off prices", () => {
    expect(PRICING.visitorCardAdult10).toBe(240);
    expect(PRICING.visitorCardYouth10).toBe(120);
    expect(PRICING.oneOffAdult).toBe(30);
    expect(PRICING.oneOffYouth).toBe(15);
  });
});
