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

// deno-lint-ignore-file no-explicit-any
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

    // Named household members beyond the payer (additional adults + teens).
    // Each email is that person's founding identity for the NFC bracelet
    // promotion — children have no emails and are never counted.
    const membersRaw = Array.isArray(body.members) ? body.members : [];
    const members: { tier: "adult" | "teen"; first_name: string; email: string }[] = [];
    for (const m of membersRaw.slice(0, 20)) {
      const tier = m?.tier === "teen" ? "teen" : "adult";
      const first_name = String(m?.first_name ?? "").trim().slice(0, 80);
      const memail = String(m?.email ?? "").trim().toLowerCase();
      if (!memail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(memail)) {
        return json({ error: "Every additional adult and teen needs a valid email" }, 400);
      }
      members.push({ tier, first_name, email: memail });
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
      .select("id, email, stripe_customer_id, age_group")
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

    // Member entries must fit the purchased seats. The payer occupies one
    // adult seat (unless the payer is a teen buying a teen bundle).
    const payerIsTeen = (profile?.age_group || "").toLowerCase() === "teen";
    const maxExtraAdults = Math.max(0, adults - (payerIsTeen ? 0 : 1));
    const adultMembers = members.filter((m) => m.tier === "adult");
    const teenMembers = members.filter((m) => m.tier === "teen");
    if (adultMembers.length > maxExtraAdults) {
      return json({ error: "Too many additional adults for the seats selected" }, 400);
    }
    if (teenMembers.length > teens) {
      return json({ error: "Too many teens for the seats selected" }, 400);
    }
    const memberEmails = members.map((m) => m.email);
    if (new Set(memberEmails).size !== memberEmails.length) {
      return json({ error: "Each member needs a unique email" }, 400);
    }
    if (email && memberEmails.includes(email)) {
      return json({ error: "Additional members can't reuse the account holder's email" }, 400);
    }

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
      success_url: `${origin}/portal/billing?membership=success`,
      cancel_url: `${origin}/portal/billing?canceled=true`,
      subscription_data: { metadata: bundleMeta },
      metadata: bundleMeta,
    };

    // Apply discount coupon if eligible
    if (discountCoupon) {
      sessionParams.discounts = [{ coupon: discountCoupon }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Founding-100: reserve one seat per individual email (payer + named
    // members) against this checkout session. The webhook finalises the
    // reservations on payment and releases them if the checkout expires or
    // fails. A promotion error must never block the membership purchase.
    const reserveEmails = [...new Set([email, ...memberEmails].filter(Boolean))];
    const reserved: string[] = [];
    const unavailable: string[] = [];
    for (const re of reserveEmails) {
      try {
        const { data } = await admin.rpc("founding_bracelet_reserve", {
          p_email: re,
          p_profile_id: re === email ? (profile?.id ?? null) : null,
          p_household_id: household?.household_id ?? null,
          p_session_key: session.id,
        });
        if (data) reserved.push(re);
        else unavailable.push(re);
      } catch {
        unavailable.push(re);
      }
    }

    // Which reserved members the purchaser selected for an immediate free
    // bracelet at activation (subset of reserved; enforced here).
    const selectedRaw = Array.isArray(body.bracelets) ? body.bracelets : [];
    const selected = [...new Set(
      selectedRaw.map((x: unknown) => String(x ?? "").trim().toLowerCase()),
    )].filter((x: string) => reserved.includes(x));

    if (reserved.length > 0 || members.length > 0) {
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          founding_reserved: reserved.join(","),
          founding_selected: selected.join(","),
          member_list: JSON.stringify(members),
        },
      }).catch(() => {});
    }

    return json({
      url: session.url,
      family_discount_applied: familyDiscount,
      founding: { reserved, unavailable, selected },
    });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
