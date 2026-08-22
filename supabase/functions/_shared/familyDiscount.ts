// Family discount contract shared by the browser, checkout function and
// webhook. Keep the eligibility rule here so marketing copy cannot drift from
// what Stripe is actually asked to charge.

export const FAMILY_DISCOUNT_PERCENT = 10;
export const FAMILY_DISCOUNT_MIN_ADULTS = 2;
export const FAMILY_DISCOUNT_MIN_YOUNG_PEOPLE = 2;

export type HouseholdCounts = {
  adults: number;
  teens: number;
  children: number;
};

const count = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

/**
 * A household qualifies with at least two adults and two young people in any
 * mix: 2 teens, 2 children, or 1 teen + 1 child.
 */
export const isFamilyDiscountEligible = ({ adults, teens, children }: HouseholdCounts) =>
  count(adults) >= FAMILY_DISCOUNT_MIN_ADULTS &&
  count(teens) + count(children) >= FAMILY_DISCOUNT_MIN_YOUNG_PEOPLE;

export const applyFamilyDiscount = (amountCents: number, eligible: boolean) => {
  const safeAmount = Number.isFinite(amountCents) ? Math.max(0, Math.round(amountCents)) : 0;
  return eligible
    ? Math.round(safeAmount * (100 - FAMILY_DISCOUNT_PERCENT) / 100)
    : safeAmount;
};
