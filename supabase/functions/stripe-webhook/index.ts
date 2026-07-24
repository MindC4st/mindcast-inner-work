// stripe-webhook — single source of truth for membership status.
//
// Stripe POSTs subscription lifecycle events here. We verify the signature,
// upsert public.subscriptions, and mirror a coarse membership_status onto the
// payer's profile so the app can gate cheaply.
//
// verify_jwt MUST be false for this function (Stripe has no Supabase JWT); we
// authenticate the request with the Stripe webhook signature instead.
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

async function syncSubscription(sub: Stripe.Subscription) {
  const profileId = (sub.metadata?.profile_id as string) || null;
  const householdId = (sub.metadata?.household_id as string) || null;
  const priceId = sub.items?.data?.[0]?.price?.id ?? null;
  const quantity = sub.items?.data?.[0]?.quantity ?? 1;
  const tier = sub.metadata?.tier === "teen" ? "teen" : "adult";
  const kidsAddon = sub.metadata?.kids_addon === "true";

  await admin.from("subscriptions").upsert(
    {
      profile_id: profileId,
      household_id: householdId || null,
      stripe_customer_id: String(sub.customer),
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan: (sub.metadata?.plan as string) || null,
      tier,
      price_id: priceId,
      quantity,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Mirror status onto the payer profile (and every household member's profile
  // so children inherit access from the household subscription).
  const status = toMembershipStatus(sub.status);
  if (householdId) {
    const { data: members } = await admin
      .from("household_members")
      .select("profile_id")
      .eq("household_id", householdId);
    const ids = (members ?? []).map((m) => m.profile_id);
    if (ids.length) {
      await admin.from("profiles").update({ membership_status: status }).in("id", ids);
    }
  } else if (profileId) {
    await admin.from("profiles").update({ membership_status: status }).eq("id", profileId);
  }

  // Tier + kids add-on belong to the payer (the adult who bought them). An
  // inactive subscription clears the tier so access lapses.
  if (profileId) {
    const active = status === "active" || status === "trialing";
    await admin.from("profiles").update({
      membership_tier: active ? tier : "none",
      kids_addon: active ? kidsAddon : false,
    }).eq("id", profileId);
  }
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
          // Carry Checkout metadata onto the subscription if Stripe didn't.
          sub.metadata = { ...(s.metadata as any), ...(sub.metadata as any) };
          await syncSubscription(sub);
        }
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
        // Ignore unrelated events.
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
