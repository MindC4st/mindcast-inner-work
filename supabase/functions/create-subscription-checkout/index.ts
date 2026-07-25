// create-subscription-checkout — starts a RECURRING membership Checkout.
//
// NEW MODEL (Jul 2026): Multi-tier, multi-line-item family subscriptions.
// Frontend sends { plan, adults, teens, children } instead of the old
// single-tier model. The function builds one Checkout session with separate
// line items for each member type, conditionally applies the FAMILY15 coupon
// when the cart contains 2+ adults + at least 1 teen OR child, and records the
// bundle composition in subscription metadata.
//
// Env (set on Supabase project from Stripe Dashboard price IDs):
//   STRIPE_PRICE_ADULT_MONTHLY, STRIPE_PRICE_ADULT_ANNUAL
//   STRIPE_PRICE_TEEN_MONTHLY,  STRIPE_PRICE_TEEN_ANNUAL
//   STRIPE_PRICE_CHILD_MONTHLY, STRIPE_PRICE_CHILD_ANNUAL
//   STRIPE_FAMILY_COUPON_ID     (e.g. "FAMILY15")
//   STRIPE_SECRET_KEY
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const safeOrigin = (raw: string | null): string => {
  const fallback = "https://mindcast.co.nz";
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    const ok =
      u.hostname === "mindcast.co.nz" ||
      u.hostname.endsWith(".mindcast.co.nz") ||
      u.hostname.endsWith(".lovable.app") ||
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1";
    return ok ? u.origin : fallback;
  } catch {
    return fallback;
  }
};

/** Get the price ID for a tier + plan from env vars. */
function priceId(tier: string, plan: string): string | null {
  const key = `STRIPE_PRICE_${tier.toUpperCase()}_${plan === "annual" ? "ANNUAL" : "MONTHLY"}`;
  const id = Deno.env.get(key);
  if (!id) console.error(`Missing env var: ${key}`);
  return id ?? null;
}

/** Clamp a quantity to a sane range. */
const clamp = (n: number) => Math.max(0, Math.min(20, Number(n) || 0));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);

    // Resolve caller from JWT
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes, error: userErr } = await anon.auth.getUser();
    if (userErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "annual" ? "annual" : "monthly";
    const adults = clamp(body.adults);
    const teens = clamp(body.teens);
    const children = clamp(body.children);

    // Must have at least one member
    if (adults + teens + children < 1) {
      return json({ error: "Must select at least one membership" }, 400);
    }

    // Build line items — only include tiers that have qty > 0
    const tiers: { tier: string; qty: number }[] = [];
    if (adults > 0) tiers.push({ tier: "adult", qty: adults });
    if (teens > 0) tiers.push({ tier: "teen", qty: teens });
    if (children > 0) tiers.push({ tier: "child", qty: children });

    const line_items: { price: string; quantity: number }[] = [];
    for (const t of tiers) {
      const pid = priceId(t.tier, plan);
      if (!pid) return json({ error: `No price configured for ${t.tier} (${plan})` }, 400);
      line_items.push({ price: pid, quantity: t.qty });
    }

    // Conditional family discount: 2+ adults AND (≥1 teen OR ≥1 child)
    const familyDiscount = adults >= 2 && (teens >= 1 || children >= 1);
    const discountCoupon = familyDiscount
      ? (Deno.env.get("STRIPE_FAMILY_COUPON_ID") || null)
      : null;

    // Build subscription metadata describing the bundle
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: profile } = await admin
      .from("profiles")
      .select("id, email, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: household } = await admin
      .from("household_members")
      .select("household_id")
      .eq("profile_id", profile?.id ?? "")
      .limit(1)
      .maybeSingle();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let customerId = profile?.stripe_customer_id || undefined;
    const email = (profile?.email || user.email || "").toLowerCase();
    if (!customerId) {
      const existing = email ? await stripe.customers.list({ email, limit: 1 }) : { data: [] as any[] };
      customerId = existing.data.length > 0
        ? existing.data[0].id
        : (await stripe.customers.create({ email: email || undefined, metadata: { user_id: user.id } })).id;
      if (profile?.id) {
        await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", profile.id);
      }
    }

    const origin = safeOrigin(req.headers.get("origin"));

    // Bundle metadata — the webhook uses these to derive access for household members
    const bundleMeta = {
      profile_id: profile?.id ?? "",
      household_id: household?.household_id ?? "",
      plan,
      adults: String(adults),
      teens: String(teens),
      children: String(children),
      family_discount: familyDiscount ? "true" : "false",
    };

    const sessionParams: any = {
      customer: customerId,
      line_items,
      mode: "subscription",
      success_url: `${origin}/portal/settings?membership=success`,
      cancel_url: `${origin}/membership?canceled=true`,
      subscription_data: { metadata: bundleMeta },
      metadata: bundleMeta,
    };

    // Apply discount coupon if eligible
    if (discountCoupon) {
      sessionParams.discounts = [{ coupon: discountCoupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return json({
      url: session.url,
      family_discount_applied: familyDiscount,
    });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
