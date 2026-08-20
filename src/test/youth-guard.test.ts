import { describe, expect, it } from "vitest";
import {
  ADULT_MEMBERSHIP,
  YOUTH_PLACE,
  canOfferYouthPlace,
  describeAdultRemoval,
  guardCheckoutCart,
  guardSubscriptionItems,
  type CartItem,
} from "../../supabase/functions/_shared/youthGuard";

const adult = (quantity = 1): CartItem => ({ lookupKey: ADULT_MEMBERSHIP, quantity });
const youth = (quantity = 1): CartItem => ({ lookupKey: YOUTH_PLACE, quantity });
const card: CartItem = { lookupKey: "visitor_card_youth_10", quantity: 1 };

describe("youth guard — the new family case", () => {
  it("allows an adult membership and a youth place bought together", () => {
    // The household has no active adult subscription YET — it is in the cart.
    // Get this wrong and no new family with a teenager can ever sign up.
    expect(guardCheckoutCart([adult(), youth()], false)).toEqual({ allowed: true });
  });

  it("allows two adults and three young people in one cart", () => {
    expect(guardCheckoutCart([adult(2), youth(3)], false)).toEqual({ allowed: true });
  });

  it("allows a youth place added later to an existing membership", () => {
    expect(guardCheckoutCart([youth()], true)).toEqual({ allowed: true });
  });
});

describe("youth guard — the rule", () => {
  it("rejects a youth place alone with no adult membership anywhere", () => {
    expect(guardCheckoutCart([youth()], false)).toMatchObject({
      allowed: false,
      reason: "youth_place_requires_adult_membership",
      remedy: ADULT_MEMBERSHIP,
    });
  });

  it("reports how many places could not be covered", () => {
    expect(guardCheckoutCart([youth(3)], false)).toMatchObject({ youthQuantity: 3 });
  });

  it("names the remedy rather than just refusing", () => {
    // A rejection the buyer cannot act on is a dead end. The remedy is what
    // turns it into "add a membership and you're through".
    expect(guardCheckoutCart([youth()], false)).toMatchObject({ remedy: ADULT_MEMBERSHIP });
  });

  it("is not fooled by a zero-quantity adult line", () => {
    // A quantity stepper left at zero still sends the line item.
    expect(guardCheckoutCart([{ lookupKey: ADULT_MEMBERSHIP, quantity: 0 }, youth()], false))
      .toMatchObject({ allowed: false });
  });

  it("ignores carts with no youth place in them", () => {
    expect(guardCheckoutCart([adult()], false)).toEqual({ allowed: true });
    expect(guardCheckoutCart([], false)).toEqual({ allowed: true });
  });

  it("does not apply to casual youth access", () => {
    // Visitor cards, one-offs and trial passes are one-time purchases. The
    // rule is about the weekly place. "Bring the family" has to keep working.
    expect(guardCheckoutCart([card], false)).toEqual({ allowed: true });
  });
});

describe("youth guard — layer 1, the UI", () => {
  it("hides the flow when there is nothing to attach a place to", () => {
    expect(canOfferYouthPlace(false)).toBe(false);
  });

  it("shows it once an adult membership is active", () => {
    expect(canOfferYouthPlace(true)).toBe(true);
  });

  it("shows it while an adult membership sits in the same cart", () => {
    expect(canOfferYouthPlace(false, true)).toBe(true);
  });
});

describe("youth guard — layer 3, the webhook", () => {
  it("allows a subscription that carries its own adult membership", () => {
    expect(guardSubscriptionItems([adult(), youth()], false)).toEqual({ action: "allow" });
  });

  it("cancels and flags a youth place with no adult membership", () => {
    // Reached Stripe some other way — dashboard, stale client, or the adult
    // membership was cancelled between checkout and provisioning.
    expect(guardSubscriptionItems([youth(2)], false)).toEqual({
      action: "cancel_and_flag",
      reason: "youth_place_requires_adult_membership",
      youthQuantity: 2,
    });
  });

  it("flags as well as cancels", () => {
    // A silent cancellation is how a family finds out at the door.
    const a = guardSubscriptionItems([youth()], false);
    expect(a.action).toBe("cancel_and_flag");
  });

  it("agrees with the checkout layer on every input", () => {
    // Three layers, one decision. If these ever disagree, a subscription gets
    // created by one and destroyed by the other in a loop.
    const carts: CartItem[][] = [[], [adult()], [youth()], [adult(), youth()], [card], [youth(2), card]];
    for (const cart of [true, false].flatMap((h) => carts.map((c) => [c, h] as const))) {
      const [items, active] = cart;
      const checkout = guardCheckoutCart(items, active).allowed;
      const webhook = guardSubscriptionItems(items, active).action === "allow";
      expect(webhook, JSON.stringify({ items, active })).toBe(checkout);
    }
  });
});

describe("youth guard — removing the last adult membership", () => {
  it("warns when young people would be left with no membership to sit under", () => {
    expect(describeAdultRemoval([youth(2)])).toEqual({ orphans: true, youthQuantity: 2 });
  });

  it("stays quiet when another adult membership remains", () => {
    expect(describeAdultRemoval([adult(), youth(2)])).toEqual({ orphans: false, youthQuantity: 2 });
  });

  it("stays quiet when there are no young people on the subscription", () => {
    expect(describeAdultRemoval([])).toEqual({ orphans: false, youthQuantity: 0 });
  });

  it("describes rather than blocks", () => {
    // A household that wants to leave gets to leave. The requirement is that
    // it is not a surprise, not that it is impossible.
    const w = describeAdultRemoval([youth()]);
    expect(w.orphans).toBe(true);
    expect(Object.keys(w)).toEqual(["orphans", "youthQuantity"]);
  });
});
