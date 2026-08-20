/**
 * youth-requires-adult — PROPOSAL (MC-MEM-106 v2.1 rule 2).
 *
 * A young person place can never exist without an active adult membership on
 * the same household. Enforced at three layers:
 *
 *   1. UI      — the add-a-young-person flow does not render without an
 *                active adult membership (src/lib/youthPlaceGuard.ts).
 *   2. Server  — checkout session creation rejects young_person_place_weekly
 *                when the household has no active adult subscription.
 *   3. Webhook — customer.subscription.created for a youth place with no
 *                active adult sub is cancelled immediately and flagged.
 *
 * This module is the shared decision used by layers 2 and 3.
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.1";

export const YOUTH_PLACE_LOOKUP_KEY = "young_person_place_weekly";
export const ADULT_MEMBERSHIP_LOOKUP_KEY = "adult_membership_weekly";

/** True when the household has at least one active/trialing adult membership. */
export async function householdHasActiveAdultMembership(
  supabaseAdmin: SupabaseClient,
  householdId: string,
): Promise<boolean> {
  // Seat status is maintained by refresh_membership_entitlements; the webhook
  // mirrors the adult membership item's price id onto subscriptions.
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("adult_membership_price_id, status")
    .eq("household_id", householdId)
    .in("status", ["active", "trialing"])
    .limit(1);
  if (error) throw new Error(`Adult membership lookup failed: ${error.message}`);
  return Boolean(data?.some((s) => s.adult_membership_price_id));
}

/** Does this subscription contain a young person place item? */
export function subscriptionHasYouthPlace(sub: {
  items?: { data: Array<{ price?: { lookup_key?: string; metadata?: Record<string, string> } }> };
  metadata?: Record<string, string>;
}): boolean {
  const items = sub.items?.data ?? [];
  return items.some(
    (i) =>
      i.price?.lookup_key === YOUTH_PLACE_LOOKUP_KEY ||
      i.price?.metadata?.lookup_key === YOUTH_PLACE_LOOKUP_KEY ||
      i.price?.metadata?.requires_adult_membership === "true",
  );
}

export type YouthGuardResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/** Layer 2/3 decision: may this youth place exist on this household? */
export async function assertYouthPlaceAllowed(
  supabaseAdmin: SupabaseClient,
  householdId: string | null,
): Promise<YouthGuardResult> {
  if (!householdId) {
    return {
      allowed: false,
      reason: "young_person_place_weekly requires a household with an active adult membership",
    };
  }
  const ok = await householdHasActiveAdultMembership(supabaseAdmin, householdId);
  return ok
    ? { allowed: true }
    : {
        allowed: false,
        reason:
          "A young person place can only be added to a household with an active adult membership.",
      };
}
