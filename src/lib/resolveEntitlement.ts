/**
 * resolveEntitlement — the single decision point for who may attend.
 * PROPOSAL (MC-MEM-106 v2.1). Used by check-in and every gated surface;
 * nothing else decides access.
 *
 * Resolution order — first match wins:
 *   1. Active membership            → appAccess only for adult_membership_weekly
 *   2. Household concession flag    → via 'concession' (before any credit burns)
 *   3. Unused free trial            → consume, mark used_at (once for life)
 *   4. Visitor card, trips left     → decrement (track must match)
 *   5. One-off credit, unredeemed   → consume
 *   6. Otherwise                    → ok:false + purchase options with prices
 *
 * A failed check is never silent: the facilitator sees the reason and the
 * options. Payment status is never displayed on any room-visible screen.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type EntitlementVia =
  | "membership" | "visitor_card" | "one_off" | "free_trial" | "concession" | "comp";

export type PurchaseOption = {
  lookupKey:
    | "adult_membership_weekly" | "young_person_place_weekly"
    | "visitor_card_adult_10" | "visitor_card_youth_10"
    | "one_off_adult" | "one_off_youth";
  label: string;
  priceNzd: number;
  perSessionNzd?: number;
};

export type Entitlement =
  | { ok: true; via: EntitlementVia; appAccess: boolean; worksheet: true; creditId?: string }
  | { ok: false; reason: string; options: PurchaseOption[] };

/** Display prices mirror MC-MEM-106 v2.1 — Stripe is what the member pays. */
export const PURCHASE_OPTIONS: Record<string, PurchaseOption> = {
  adult_membership_weekly: { lookupKey: "adult_membership_weekly", label: "Adult membership — $19/week", priceNzd: 19 },
  young_person_place_weekly: { lookupKey: "young_person_place_weekly", label: "Young person place — $9/week (with an adult membership)", priceNzd: 9 },
  visitor_card_adult_10: { lookupKey: "visitor_card_adult_10", label: "Adult visitor card — 10 trips $240 ($24/session)", priceNzd: 240, perSessionNzd: 24 },
  visitor_card_youth_10: { lookupKey: "visitor_card_youth_10", label: "Under-18 visitor card — 10 trips $120 ($12/session)", priceNzd: 120, perSessionNzd: 12 },
  one_off_adult: { lookupKey: "one_off_adult", label: "Adult one-off session — $30", priceNzd: 30 },
  one_off_youth: { lookupKey: "one_off_youth", label: "Under-18 one-off session — $15", priceNzd: 15 },
};

function optionsFor(track: "adult" | "youth", hasActiveAdultMembership: boolean): PurchaseOption[] {
  const opts: PurchaseOption[] = [];
  if (track === "adult") {
    opts.push(PURCHASE_OPTIONS.adult_membership_weekly);
    opts.push(PURCHASE_OPTIONS.visitor_card_adult_10);
    opts.push(PURCHASE_OPTIONS.one_off_adult);
  } else {
    // Rule 2: a young person place is only offered with an active adult
    // membership on the household; otherwise offer casual access instead.
    if (hasActiveAdultMembership) opts.push(PURCHASE_OPTIONS.young_person_place_weekly);
    opts.push(PURCHASE_OPTIONS.visitor_card_youth_10);
    opts.push(PURCHASE_OPTIONS.one_off_youth);
  }
  return opts;
}

export async function resolveEntitlement(
  supabase: SupabaseClient, // service-role client: entitlement decisions are server-side
  attendeeId: string,
  sessionDate: Date,
  opts?: { week?: number; recordedBy?: string },
): Promise<Entitlement> {
  const date = sessionDate.toISOString().slice(0, 10);

  const { data: attendee, error: attendeeErr } = await supabase
    .from("attendees").select("*").eq("id", attendeeId).maybeSingle();
  if (attendeeErr || !attendee) {
    return { ok: false, reason: "Unknown attendee", options: [] };
  }
  const track = attendee.track as "adult" | "youth";

  // ── 1. Active membership ─────────────────────────────────────────────────
  // Seat status is maintained by refresh_membership_entitlements on every
  // subscription change. App + journal access requires the ADULT membership
  // price specifically — never teen/child seats, visitor cards or one-offs.
  if (attendee.profile_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, membership_status, membership_tier, household_id")
      .eq("id", attendee.profile_id)
      .maybeSingle();
    if (profile && (profile.membership_status === "active" || profile.membership_status === "trialing")) {
      let appAccess = false;
      if (track === "adult" && profile.membership_tier === "adult") {
        // adult_membership_weekly must be among the household's active
        // subscription items. The webhook mirrors the item's price id onto
        // subscriptions.adult_membership_price_id (see proposal §webhooks).
        const householdId = profile.household_id ?? attendee.household_id;
        if (householdId) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("adult_membership_price_id")
            .eq("household_id", householdId)
            .in("status", ["active", "trialing"])
            .maybeSingle();
          appAccess = Boolean(sub?.adult_membership_price_id);
        }
      }
      return { ok: true, via: "membership", appAccess, worksheet: true };
    }
  }

  const householdId: string | null = attendee.household_id;

  // ── 2. Concession pathway (resolves before any credit is consumed) ──────
  if (householdId) {
    const { data: household } = await supabase
      .from("households")
      .select("concession_granted")
      .eq("id", householdId)
      .maybeSingle();
    if (household?.concession_granted) {
      return { ok: true, via: "concession", appAccess: false, worksheet: true };
    }
  }

  // ── 3. Unused free trial — once per person, for life ────────────────────
  const { data: trial } = await supabase
    .from("free_trials")
    .select("id, used_at")
    .eq("attendee_id", attendeeId)
    .maybeSingle();
  if (!trial) {
    // Never used: consume it now. UNIQUE(attendee_id) makes double-consumption
    // impossible even under concurrent check-ins.
    const { error } = await supabase.from("free_trials").insert({
      attendee_id: attendeeId, used_at: new Date().toISOString(), session_date: date,
    });
    if (!error) return { ok: true, via: "free_trial", appAccess: false, worksheet: true };
    // insert lost a race — fall through to credits
  } else if (trial.used_at) {
    // already used — fall through
  }

  // ── 4. Visitor card with trips remaining (track must match) ─────────────
  if (householdId) {
    const { data: cards } = await supabase
      .from("session_credits")
      .select("id, trips_total, trips_used")
      .eq("household_id", householdId)
      .eq("kind", "visitor_card")
      .eq("track", track)
      .filter("attendee_id", "in", `(${attendeeId},null)`)
      .order("purchased_at", { ascending: true });
    const card = (cards ?? []).find((c) => c.trips_used < c.trips_total);
    if (card) {
      // Atomic decrement: only succeeds if no concurrent check-in took the trip.
      const { data: updated, error } = await supabase
        .from("session_credits")
        .update({ trips_used: card.trips_used + 1 })
        .eq("id", card.id)
        .eq("trips_used", card.trips_used)
        .select("id")
        .maybeSingle();
      if (!error && updated) {
        return { ok: true, via: "visitor_card", appAccess: false, worksheet: true, creditId: card.id };
      }
    }
  }

  // ── 5. One-off credit, unredeemed ────────────────────────────────────────
  if (householdId) {
    const { data: oneOffs } = await supabase
      .from("session_credits")
      .select("id, trips_used, trips_total")
      .eq("household_id", householdId)
      .eq("kind", "one_off")
      .eq("track", track)
      .filter("attendee_id", "in", `(${attendeeId},null)`)
      .order("purchased_at", { ascending: true });
    const oneOff = (oneOffs ?? []).find((c) => c.trips_used < c.trips_total);
    if (oneOff) {
      const { data: updated, error } = await supabase
        .from("session_credits")
        .update({ trips_used: oneOff.trips_total })
        .eq("id", oneOff.id)
        .eq("trips_used", oneOff.trips_used)
        .select("id")
        .maybeSingle();
      if (!error && updated) {
        return { ok: true, via: "one_off", appAccess: false, worksheet: true, creditId: oneOff.id };
      }
    }
  }

  // ── 6. Nothing left — never silent ───────────────────────────────────────
  let hasActiveAdultMembership = false;
  if (householdId) {
    const { data: adultSub } = await supabase
      .from("subscriptions")
      .select("adult_membership_price_id")
      .eq("household_id", householdId)
      .in("status", ["active", "trialing"])
      .maybeSingle();
    hasActiveAdultMembership = Boolean(adultSub?.adult_membership_price_id);
  }
  return {
    ok: false,
    reason: track === "youth" && !hasActiveAdultMembership
      ? "No entitlement left. Young people attend with an adult household membership or on casual credits."
      : "No entitlement left for this attendee.",
    options: optionsFor(track, hasActiveAdultMembership),
  };
}
