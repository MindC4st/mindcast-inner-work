// create-subscription-checkout — starts a RECURRING membership Checkout.
//
// Unlike create-pilot-checkout (one-time), this is mode: "subscription".
// The caller must be authenticated (verify_jwt = true); we resolve their
// profile, reuse-or-create their Stripe customer, and open a Checkout session
// for the requested plan. Household billing is supported via `quantity`
// (one payer covering several linked child profiles) and household_id metadata.
//
// Env (never hardcode price ids):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_MONTHLY, STRIPE_PRICE_TERMLY        (base / adult default)
//   Optional per-tier overrides + kids add-on:
//   STRIPE_PRICE_ADULT_MONTHLY/_TERMLY, STRIPE_PRICE_TEEN_MONTHLY/_TERMLY,
//   STRIPE_PRICE_KIDS_ADDON

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

// Resolve the base price for the chosen tier + plan, falling back to the
// generic monthly/termly price when no tier-specific override is set.
const priceForTier = (tier: string, plan: string): string | null => {
  const P = plan.toUpperCase();
  const generic = Deno.env.get(`STRIPE_PRICE_${P}`) || null;
  if (tier === "teen") return Deno.env.get(`STRIPE_PRICE_TEEN_${P}`) || generic;
  return Deno.env.get(`STRIPE_PRICE_ADULT_${P}`) || generic;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);

    // Resolve the caller from their JWT.
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes, error: userErr } = await anon.auth.getUser();
    if (userErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const plan = String(body.plan || "monthly");
    const tier = body.tier === "teen" ? "teen" : "adult";
    const kidsAddon = body.kidsAddon === true || body.kidsAddon === "true";
    const quantity = Math.max(1, Math.min(20, Number(body.quantity) || 1));
    const price = priceForTier(tier, plan);
    if (!price) return json({ error: `No price configured for tier '${tier}' plan '${plan}'` }, 400);
    // Optional kids add-on line item (a paying adult buying a kids membership).
    const kidsPrice = kidsAddon ? (Deno.env.get("STRIPE_PRICE_KIDS_ADDON") || null) : null;
    if (kidsAddon && !kidsPrice) return json({ error: "Kids add-on selected but STRIPE_PRICE_KIDS_ADDON is not configured" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Look up the caller's profile (id + any existing Stripe customer + household).
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

    // Reuse or create the Stripe customer, and remember it on the profile so
    // the webhook and billing portal can find it again.
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
    const meta = {
      profile_id: profile?.id ?? "",
      household_id: household?.household_id ?? "",
      plan,
      tier,
      kids_addon: kidsAddon ? "true" : "false",
    };
    const line_items = [{ price, quantity }, ...(kidsPrice ? [{ price: kidsPrice, quantity: 1 }] : [])];
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items,
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${origin}/portal/settings?membership=success`,
      cancel_url: `${origin}/membership?canceled=true`,
      subscription_data: { metadata: meta },
      metadata: meta,
    });

    return json({ url: session.url });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
