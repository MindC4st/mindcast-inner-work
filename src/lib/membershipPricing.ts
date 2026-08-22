// Membership pricing — single source for every figure shown in the UI.
//
// Source of truth for the numbers: MC-MEM-106 v2.1 Membership Access & Pricing
// Model and MC-GOV-001 Company Charter §8. Actual
// billing is governed by the Stripe prices configured on the project
// (STRIPE_PRICE_* env on create-subscription-checkout) — if these figures and
// Stripe ever disagree, Stripe is what the member pays and THIS FILE is wrong.
// Verify against the Stripe dashboard before launch.
//
// All amounts are NZD per week, GST inclusive (NZ consumer pricing).

import { ACCESS_PASS_OPTIONS } from "../../supabase/functions/_shared/accessPass";

export type { AccessPassLookupKey } from "../../supabase/functions/_shared/accessPass";

export {
  FAMILY_DISCOUNT_MIN_ADULTS,
  FAMILY_DISCOUNT_MIN_YOUNG_PEOPLE,
  FAMILY_DISCOUNT_PERCENT,
  applyFamilyDiscount,
  isFamilyDiscountEligible,
} from "../../supabase/functions/_shared/familyDiscount";

export const PRICING = {
  currency: "NZD",
  gstNote: "All prices in New Zealand dollars, GST inclusive.",
  adult: 19,
  youngPersonPlace: 9,
  visitorCardAdult10: ACCESS_PASS_OPTIONS.visitor_card_adult_10.amountCents / 100,
  visitorCardYouth10: ACCESS_PASS_OPTIONS.visitor_card_youth_10.amountCents / 100,
  oneOffAdult: ACCESS_PASS_OPTIONS.one_off_adult.amountCents / 100,
  oneOffYouth: ACCESS_PASS_OPTIONS.one_off_youth.amountCents / 100,
  worksheet: 5,
} as const;

export const formatWeekly = (amount: number) => `$${amount}`;
