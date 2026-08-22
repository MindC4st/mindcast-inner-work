// Server-owned catalogue contract for prepaid access. Stripe IDs are never
// accepted from the browser; the edge function resolves one of these stable
// lookup keys and validates the Stripe price before opening Checkout.

export const ACCESS_PASS_OPTIONS = {
  visitor_card_adult_10: {
    lookupKey: "visitor_card_adult_10",
    label: "Adult Concession Pass — 10 sessions",
    amountCents: 24_000,
    kind: "visitor_card",
    track: "adult",
    trips: 10,
  },
  visitor_card_youth_10: {
    lookupKey: "visitor_card_youth_10",
    label: "Under-18 Concession Pass — 10 sessions",
    amountCents: 12_000,
    kind: "visitor_card",
    track: "youth",
    trips: 10,
  },
  one_off_adult: {
    lookupKey: "one_off_adult",
    label: "Adult One-Off Session",
    amountCents: 3_000,
    kind: "one_off",
    track: "adult",
    trips: 1,
  },
  one_off_youth: {
    lookupKey: "one_off_youth",
    label: "Under-18 One-Off Session",
    amountCents: 1_500,
    kind: "one_off",
    track: "youth",
    trips: 1,
  },
} as const;

export type AccessPassLookupKey = keyof typeof ACCESS_PASS_OPTIONS;

export const getAccessPassOption = (value: unknown) => {
  if (typeof value !== "string") return null;
  return ACCESS_PASS_OPTIONS[value as AccessPassLookupKey] ?? null;
};
