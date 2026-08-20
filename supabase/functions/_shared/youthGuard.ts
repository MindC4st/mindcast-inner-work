// youthGuard — rule 2 of MC-MEM-106 v2.1: a young person's weekly place
// cannot exist without an active adult membership in the same household.
//
// PROPOSAL. Nothing calls this yet.
//
// The brief asks for three layers (§4.1). They are three call sites of the
// SAME decision, not three separate rules — which is the point of putting it
// here rather than writing it out three times and letting the copies drift:
//
//   UI       canOfferYouthPlace()      — the flow does not exist
//   Server   guardCheckoutCart()       — checkout session creation rejects it
//   Webhook  guardSubscriptionItems()  — cancel immediately and flag
//
// ── The case that breaks a naive implementation ───────────────────────────
// A new family buys an adult membership AND a young person place in one
// checkout. At the moment that session is created the household has no active
// adult subscription — it is in the cart, not in the database. A guard that
// only asks "does this household have an active adult membership?" rejects
// every single new family, and the failure looks like a Stripe problem rather
// than a logic one. So every layer takes BOTH facts: what is already active,
// and what is being bought in the same breath.
//
// Scope: this rule is about the recurring `young_person_place_weekly`
// SUBSCRIPTION. Visitor cards, one-offs and trial passes are one-time
// purchases and are deliberately not covered — the trial pass says "bring the
// family", and a grandparent buying a one-off for a grandchild is a sale we
// want.

export const ADULT_MEMBERSHIP = "adult_membership_weekly";
export const YOUTH_PLACE = "young_person_place_weekly";

/** A line item or subscription item, reduced to what the guard needs. */
export interface CartItem {
  /** Stripe price lookup_key. Entitlement is never inferred from a nickname. */
  lookupKey: string;
  quantity: number;
}

export type GuardDecision =
  | { allowed: true }
  | {
      allowed: false;
      /** Machine-readable. The UI supplies the sentence; this module writes no copy. */
      reason: "youth_place_requires_adult_membership";
      /** What the buyer would have to add for this to go through. */
      remedy: typeof ADULT_MEMBERSHIP;
      /** Quantity of youth places that could not be covered. For the flag. */
      youthQuantity: number;
    };

const quantityOf = (items: CartItem[], key: string) =>
  items.filter((i) => i.lookupKey === key).reduce((n, i) => n + (Number(i.quantity) || 0), 0);

/**
 * How many youth places this cart cannot account for. 0 means allowed.
 *
 * Both public entry points read this rather than narrowing each other's
 * return type — the repo compiles with `strict: false`, where a discriminated
 * union on a boolean literal does not narrow, and a guard that silently stops
 * type-checking is worse than one that never looked clever.
 */
function uncoveredYouthPlaces(items: CartItem[], householdHasActiveAdult: boolean): number {
  const youth = quantityOf(items, YOUTH_PLACE);
  if (youth <= 0) return 0;

  // An adult membership in the same cart counts. See the note above — this
  // single check is the difference between the rule working and no new family
  // being able to sign up.
  const adultInCart = quantityOf(items, ADULT_MEMBERSHIP) > 0;
  if (adultInCart || householdHasActiveAdult) return 0;

  return youth;
}

/**
 * The one decision. Everything below is a thin wrapper with a name that says
 * where it is called from.
 *
 * @param items                    what is being bought, or what the new
 *                                 subscription contains
 * @param householdHasActiveAdult  from public.household_has_active_adult()
 */
export function guardYouthPlaces(
  items: CartItem[],
  householdHasActiveAdult: boolean,
): GuardDecision {
  const uncovered = uncoveredYouthPlaces(items, householdHasActiveAdult);
  if (uncovered === 0) return { allowed: true };

  return {
    allowed: false,
    reason: "youth_place_requires_adult_membership",
    remedy: ADULT_MEMBERSHIP,
    youthQuantity: uncovered,
  };
}

// ── Layer 1 · UI ──────────────────────────────────────────────────────────
/**
 * Whether the add-a-young-person flow exists at all. The brief's wording is
 * that it "does not exist" without an adult membership — not that it exists
 * and errors. A control that is present and then refuses is a worse
 * experience than one that was never offered.
 *
 * This is presentation only. It is not a security boundary: anyone can call
 * the checkout endpoint directly, which is what layers 2 and 3 are for.
 */
export const canOfferYouthPlace = (householdHasActiveAdult: boolean, adultInCart = false): boolean =>
  householdHasActiveAdult || adultInCart;

// ── Layer 2 · Server, at checkout session creation ────────────────────────
/**
 * Call before `stripe.checkout.sessions.create`. Rejecting here means no
 * Stripe object is ever created, so there is nothing to clean up — which is
 * the whole reason not to rely on the webhook alone.
 */
export const guardCheckoutCart = guardYouthPlaces;

// ── Layer 3 · Webhook, on customer.subscription.created ───────────────────
export type WebhookAction =
  | { action: "allow" }
  | {
      action: "cancel_and_flag";
      reason: "youth_place_requires_adult_membership";
      youthQuantity: number;
    };

/**
 * Last line of defence, for a subscription that reached Stripe anyway — a
 * dashboard-created subscription, an API call with a stale client, a race
 * where the adult membership was cancelled between checkout and provisioning.
 *
 * `householdHasActiveAdult` must be re-read HERE, at webhook time, and not
 * carried over from the checkout metadata. Metadata is a snapshot of what was
 * true when the session was created; this needs what is true now.
 *
 * Cancel AND flag, not one or the other: a silent cancellation is how a
 * family finds out at the door that the place they thought they had bought
 * does not exist.
 */
export function guardSubscriptionItems(
  items: CartItem[],
  householdHasActiveAdult: boolean,
): WebhookAction {
  const uncovered = uncoveredYouthPlaces(items, householdHasActiveAdult);
  if (uncovered === 0) return { action: "allow" };
  return {
    action: "cancel_and_flag",
    reason: "youth_place_requires_adult_membership",
    youthQuantity: uncovered,
  };
}

// ── §4.2 · Removing the last adult membership ─────────────────────────────
export interface OrphanWarning {
  /** True when this change would leave youth places with no adult membership. */
  orphans: boolean;
  /** How many young people lose their place. Drives the confirmation copy. */
  youthQuantity: number;
}

/**
 * "Removing the last adult membership must not silently orphan youth places —
 * surface the consequence and require explicit confirmation."
 *
 * Returns the consequence; it does not block. The founder's call is that this
 * is a conversation, and a household that genuinely wants to leave should be
 * able to. What it must not be is a surprise.
 */
export function describeAdultRemoval(
  itemsAfterChange: CartItem[],
): OrphanWarning {
  const youth = quantityOf(itemsAfterChange, YOUTH_PLACE);
  const adults = quantityOf(itemsAfterChange, ADULT_MEMBERSHIP);
  return { orphans: youth > 0 && adults === 0, youthQuantity: youth };
}
