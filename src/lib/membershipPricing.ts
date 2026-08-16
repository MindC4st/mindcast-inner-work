// Membership pricing — single source for every figure shown in the UI.
//
// Source of truth for the numbers: MC-MEM-106 Membership Access & Pricing
// Model (working launch pricing) and MC-GOV-001 Company Charter §8. Actual
// billing is governed by the Stripe prices configured on the project
// (STRIPE_PRICE_* env on create-subscription-checkout) — if these figures and
// Stripe ever disagree, Stripe is what the member pays and THIS FILE is wrong.
// Verify against the Stripe dashboard before launch.
//
// All amounts are NZD per week, GST inclusive (NZ consumer pricing).

export const PRICING = {
  currency: "NZD",
  gstNote: "All prices in New Zealand dollars, GST inclusive.",
  adult: {
    founding: 29,
    standard: 35,
    foundingNote:
      "The founding rate applies to the first hundred adult memberships and stays locked for twelve months.",
  },
  teen: 22,
  kidsAddOn: 15,
  familyBundle: 79,
  concession: 19,
  worksheet: 5,
} as const;

export const formatWeekly = (amount: number) => `$${amount}`;
