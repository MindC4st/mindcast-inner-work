// stripe-webhook — single source of truth for membership status.
//
// Handles the NEW multi-tier model (Jul 2026). Instead of a single tier +
// kids_addon, subscriptions now have multiple line items (adult, teen, child)
// with quantities. The webhook extracts the bundle composition from metadata
// or line item prices, upserts public.subscriptions, and asks the database to
// allocate only the purchased number of adult, teen, and child seats.
//
// verify_jwt MUST be false; signature verification via stripe-signature header.
//
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});
const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

/** Determine which tier a price ID corresponds to by looking at its metadata. */
async function resolveTier(priceId: string): Promise<string> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    const meta = price.metadata as Record<string, string>;
    return meta?.tier || "adult"; // default to adult
  } catch {
    return "adult";
  }
}

/** Parse the bundle from metadata, falling back to inspecting line items. */
async function parseBundle(sub: Stripe.Subscription): Promise<{
  adults: number;
  teens: number;
  children: number;
  familyDiscount: boolean;
  plan: string;
}> {
  const meta = sub.metadata as Record<string, string>;

  // Preferred: metadata written at checkout time
  const count = (value: string | undefined) => Math.max(0, parseInt(value || "0", 10) || 0);
  const adults = count(meta?.adults);
  const teens = count(meta?.teens);
  const children = count(meta?.children);
  const plan = meta?.plan || "monthly";

  // If metadata has explicit bundle counts, use them
  if (adults > 0 || teens > 0 || children > 0) {
    return {
      adults, teens, children,
      familyDiscount: meta?.family_discount === "true",
      plan,
    };
  }

  // Fallback: inspect each line item's price metadata
  const items = sub.items?.data || [];
  let ad = 0, te = 0, ch = 0;
  for (const item of items) {
    const pid = item.price?.id;
    const qty = item.quantity ?? 1;
    if (!pid) continue;
    const tier = await resolveTier(pid);
    if (tier === "teen") te += qty;
    else if (tier === "child") ch += qty;
    else ad += qty;
  }

  return {
    adults: ad, teens: te, children: ch,
    familyDiscount: ad >= 2 && (te >= 1 || ch >= 1),
    plan,
  };
}

// Map a raw Stripe subscription status to the profiles.membership_status enum.
const toMembershipStatus = (s: string): string => {
  switch (s) {
    case "active":
    case "trialing":
      return s;
    case "past_due":
    case "unpaid":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
    case "incomplete_expired":
      return "lapsed";
    default:
      return "none";
  }
};

async function refreshEntitlements(householdId: string | null, profileId: string | null) {
  if (!householdId && !profileId) return;
  const { error } = await admin.rpc("refresh_membership_entitlements", {
    p_household: householdId,
    p_profile: householdId ? null : profileId,
  });
  if (error) throw new Error(`Entitlement refresh failed: ${error.message}`);
}

async function syncSubscription(sub: Stripe.Subscription) {
  const meta = sub.metadata as Record<string, string>;

  // Read the existing owner first. Older subscriptions may predate metadata,
  // but the database row still tells us whose entitlement must be refreshed.
  const { data: previous, error: previousError } = await admin
    .from("subscriptions")
    .select("profile_id, household_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (previousError) throw new Error(`Subscription lookup failed: ${previousError.message}`);

  const profileId = meta?.profile_id || previous?.profile_id || null;
  const householdId = meta?.household_id || previous?.household_id || null;
  if (!profileId && !householdId) {
    throw new Error(`Subscription ${sub.id} has no profile or household owner`);
  }

  const bundle = await parseBundle(sub);
  const highestTier = bundle.children > 0 ? "child" : bundle.teens > 0 ? "teen" : "adult";

  const { error: upsertError } = await admin.from("subscriptions").upsert(
    {
      profile_id: profileId,
      household_id: householdId,
      stripe_customer_id: String(sub.customer),
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan: bundle.plan,
      tier: highestTier,
      price_id: sub.items?.data?.[0]?.price?.id ?? null,
      quantity: 1,
      bundle_adults: bundle.adults,
      bundle_teens: bundle.teens,
      bundle_children: bundle.children,
      family_discount: bundle.familyDiscount,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (upsertError) throw new Error(`Subscription upsert failed: ${upsertError.message}`);

  await refreshEntitlements(householdId, profileId);

  const previousHousehold = previous?.household_id ?? null;
  const previousProfile = previous?.profile_id ?? null;
  if (previousHousehold && previousHousehold !== householdId) {
    await refreshEntitlements(previousHousehold, null);
  } else if (!previousHousehold && previousProfile &&
      (householdId !== null || previousProfile !== profileId)) {
    await refreshEntitlements(null, previousProfile);
  }

  // Preserve useful billing state for a payer whose last active entitlement
  // just ended, without overwriting access from another active subscription.
  if (profileId && sub.status !== "active" && sub.status !== "trialing") {
    const { data: payer, error: payerError } = await admin
      .from("profiles")
      .select("membership_status")
      .eq("id", profileId)
      .maybeSingle();
    if (payerError) throw new Error(`Payer lookup failed: ${payerError.message}`);

    if (payer && !["active", "trialing"].includes(payer.membership_status)) {
      const { error: statusError } = await admin
        .from("profiles")
        .update({ membership_status: toMembershipStatus(sub.status) })
        .eq("id", profileId);
      if (statusError) throw new Error(`Payer status update failed: ${statusError.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Shop orders. The order row is created HERE, not at checkout time, so a
// pickup code only ever exists against a payment Stripe has confirmed.
// ---------------------------------------------------------------------------
async function recordShopOrder(s: Stripe.Checkout.Session) {
  const meta = (s.metadata ?? {}) as Record<string, string>;

  const quantity = Math.max(1, parseInt(meta.quantity || "1", 10) || 1);
  const unitPrice = parseInt(meta.unit_price_cents || "0", 10) || 0;
  // Trust Stripe's amount_total for what was actually charged; fall back to our
  // own arithmetic only if Stripe didn't provide one.
  const amountTotal = typeof s.amount_total === "number" ? s.amount_total : unitPrice * quantity;

  // Name the product as it was at purchase time, so a later rename doesn't
  // rewrite an order that's already been placed.
  let productName = meta.product_name || meta.product_slug || "Mindcast product";
  if (meta.product_id) {
    const { data: product, error: productError } = await admin
      .from("shop_products").select("name").eq("id", meta.product_id).maybeSingle();
    if (productError) throw new Error(`Product lookup failed: ${productError.message}`);
    if (product?.name) productName = product.name;
  }

  // stripe_session_id is UNIQUE and Stripe retries deliveries, so ignore a
  // duplicate rather than minting a second pickup code for one payment.
  const { error } = await admin.from("shop_orders").upsert(
    {
      profile_id: meta.profile_id || null,
      product_id: meta.product_id || null,
      product_name: productName,
      unit_price_cents: unitPrice,
      quantity,
      amount_total_cents: amountTotal,
      currency: (s.currency || "nzd").toLowerCase(),
      fulfilment: meta.fulfilment === "partner" ? "partner" : "counter",
      partner_name: meta.partner_name || null,
      scheduled_session_id: meta.scheduled_session_id || null,
      stripe_session_id: s.id,
      stripe_payment_intent: s.payment_intent ? String(s.payment_intent) : null,
      status: "paid",
      note: meta.order_note || null,
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true },
  );
  if (error) throw error;
}

async function markShopOrderRefunded(charge: Stripe.Charge) {
  const pi = charge.payment_intent ? String(charge.payment_intent) : null;
  if (!pi) return;
  // Partial refunds leave the order collectable; only a full refund voids it.
  if (charge.amount_refunded < charge.amount) return;
  const { error } = await admin
    .from("shop_orders")
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent", pi)
    .in("status", ["paid", "collected"]);
  if (error) throw new Error(`Refund update failed: ${error.message}`);
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  if (!sig || !secret) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (e: any) {
    return new Response(`Signature verification failed: ${e?.message ?? e}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(String(s.subscription));
          // Carry checkout metadata onto the subscription if Stripe didn't copy it
          sub.metadata = { ...(s.metadata as any), ...(sub.metadata as any) };
          await syncSubscription(sub);
        } else if (s.mode === "payment" && (s.metadata as any)?.kind === "shop") {
          await recordShopOrder(s);
        }
        break;
      }
      // A refunded payment must stop reading as a valid pickup. Without this a
      // refunded order still shows a live code on the member's phone.
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await markShopOrderRefunded(charge);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(String(inv.subscription));
          await syncSubscription(sub);
        }
        break;
      }
      default:
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(`Handler error: ${e?.message ?? e}`, { status: 500 });
  }
});
