// Membership status → what a human sees.
//
// `profiles.membership_status` is written only by the Stripe webhook
// (see 20260711120300_membership_subscriptions.sql — a trigger rejects any
// attempt by a member to set it themselves). This module turns that raw
// status, plus the subscription's period end, into the badge / helper text /
// call-to-action shown on the bracelet dashboard.
//
// Kept pure and free of React so the door-check wording can be unit tested:
// a member being wrongly turned away at the door is a real-world failure, not
// just a cosmetic one.

/** Colour family for the status band. Traffic-light semantics. */
export type MembershipTone = "active" | "warning" | "blocked" | "paused";

/** Which button (if any) sits under the band, and where it goes. */
export type MembershipAction = "none" | "renew" | "update_card" | "resume";

export interface MembershipPresentation {
  /** Big word in the band. Read at arm's length across the welcome desk. */
  label: string;
  tone: MembershipTone;
  /** One line under the label — the "why" and the date. */
  helper: string;
  action: MembershipAction;
  actionLabel: string;
  /**
   * Staff verdict: does this person walk in, or get stopped at the door?
   * `past_due` still admits — the card failed, the membership hasn't lapsed —
   * but shows amber so the desk can mention it.
   */
  admit: boolean;
}

export interface SubscriptionFacts {
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;
}

// Fixed month names rather than toLocaleDateString: the same renewal date has
// to read identically on every phone held up at the desk, and ICU disagrees
// with itself across versions (en-GB short September is "Sep" on some, "Sept"
// on others).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14 Sep 2026". Returns null for missing/unparseable input. */
export const formatRenewalDate = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const describeMembership = (
  status: string | null | undefined,
  sub: SubscriptionFacts = {},
): MembershipPresentation => {
  const s = (status || "none").trim().toLowerCase();
  const renews = formatRenewalDate(sub.currentPeriodEnd);
  const ending = sub.cancelAtPeriodEnd === true;

  switch (s) {
    case "active":
      if (ending) {
        return {
          label: "ACTIVE",
          tone: "active",
          helper: renews ? `Active until ${renews} — set to cancel, won't renew.` : "Active — set to cancel at the end of the period.",
          action: "resume",
          actionLabel: "Keep my membership",
          admit: true,
        };
      }
      return {
        label: "ACTIVE",
        tone: "active",
        helper: renews ? `Membership active — renews ${renews}.` : "Membership active.",
        action: "none",
        actionLabel: "",
        admit: true,
      };

    case "trialing":
      return {
        label: "TRIAL",
        tone: "active",
        helper: renews ? `Free trial — ends ${renews}.` : "Free trial in progress.",
        action: "none",
        actionLabel: "",
        admit: true,
      };

    case "past_due":
      return {
        label: "PAYMENT FAILED",
        tone: "warning",
        helper: "Your last payment didn't go through. Update your card to stay active.",
        action: "update_card",
        actionLabel: "Update payment method",
        admit: true,
      };

    case "paused":
      return {
        label: "PAUSED",
        tone: "paused",
        helper: "Your membership is paused. Resume it to join today's session.",
        action: "resume",
        actionLabel: "Resume membership",
        admit: false,
      };

    case "lapsed":
      return {
        label: "LAPSED",
        tone: "blocked",
        helper: "Membership requires renewal. Tap below to renew and you're back in.",
        action: "renew",
        actionLabel: "Renew membership",
        admit: false,
      };

    // 'none' and anything unrecognised fail closed: no membership on file.
    default:
      return {
        label: "NO MEMBERSHIP",
        tone: "blocked",
        helper: "There's no membership on this account yet.",
        action: "renew",
        actionLabel: "Purchase membership",
        admit: false,
      };
  }
};
