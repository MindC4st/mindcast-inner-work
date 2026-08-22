// create-access-pass-checkout — prepaid Concession Pass and one-off checkout.
//
// The browser sends only a stable lookup key. This function owns the allowed
// products, validates the matching Stripe price and attaches the purchase to
// the caller's household. The webhook mints session_credits only after Stripe
// confirms payment.

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getAccessPassOption } from "../_shared/accessPass.ts";

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
    const url = new URL(raw);
    const allowed =
      url.hostname === "mindcast.co.nz" ||
      url.hostname.endsWith(".mindcast.co.nz") ||
      url.hostname.endsWith(".lovable.app") ||
      url.hostname.endsWith(".vercel.app") ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";
    return allowed ? url.origin : fallback;
  } catch {
    return fallback;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Please sign in to buy a pass.", code: "not_authenticated" }, 401);
    }

    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userResult, error: userError } = await anon.auth.getUser();
    if (userError || !userResult.user) {
      return json({ error: "Please sign in again and retry.", code: "not_authenticated" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const option = getAccessPassOption(body?.lookup_key);
    if (!option) {
      return json({ error: "That pass is not available.", code: "invalid_pass" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, email, name, first_name, age_group, stripe_customer_id")
      .eq("user_id", userResult.user.id)
      .maybeSingle();
    if (profileError || !profile) {
      return json({ error: "Finish setting up your profile before buying a pass.", code: "profile_required" }, 409);
    }

    // A pass belongs to a household pool. Existing households win; otherwise
    // create a private one-person household for this purchaser.
    const { data: memberships, error: membershipError } = await admin
      .from("household_members")
      .select("household_id")
      .eq("profile_id", profile.id)
      .limit(2);
    if (membershipError) throw membershipError;
    if ((memberships ?? []).length > 1) {
      return json({
        error: "This account belongs to more than one household. Contact MINDCAST so we can attach the pass to the right one.",
        code: "household_ambiguous",
      }, 409);
    }

    let householdId = memberships?.[0]?.household_id ?? null;
    if (!householdId) {
      const householdName = `${profile.first_name || profile.name || "My"} household`;
      const { data: household, error: householdError } = await admin
        .from("households")
        .insert({ name: householdName, payer_profile_id: profile.id })
        .select("id")
        .single();
      if (householdError || !household) throw householdError ?? new Error("Household create failed");
      householdId = household.id;

      const ageGroup = String(profile.age_group || "").toLowerCase();
      const role = ageGroup === "teen" ? "teen" : "adult";
      const { error: memberError } = await admin.from("household_members").insert({
        household_id: householdId,
        profile_id: profile.id,
        role_in_household: role,
      });
      if (memberError) throw memberError;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Resolve by lookup key, then verify the amount and entitlement metadata.
    // A stale or incorrectly edited Stripe price fails closed before checkout.
    const prices = await stripe.prices.list({
      active: true,
      lookup_keys: [option.lookupKey],
      limit: 2,
      expand: ["data.product"],
    });
    if (prices.data.length !== 1) {
      console.error(`create-access-pass-checkout: expected one active price for ${option.lookupKey}, found ${prices.data.length}`);
      return json({ error: "Pass checkout is temporarily unavailable.", code: "price_not_configured" }, 503);
    }

    const price = prices.data[0];
    const product = typeof price.product === "string" ? null : price.product as Stripe.Product;
    const metadata = (product?.metadata ?? {}) as Record<string, string>;
    const validPrice =
      price.lookup_key === option.lookupKey &&
      price.type === "one_time" &&
      price.currency === "nzd" &&
      price.unit_amount === option.amountCents &&
      metadata.lookup_key === option.lookupKey &&
      metadata.kind === option.kind &&
      metadata.track === option.track &&
      Number(metadata.trips) === option.trips;
    if (!validPrice) {
      console.error(`create-access-pass-checkout: Stripe price contract mismatch for ${option.lookupKey}`);
      return json({ error: "Pass checkout is temporarily unavailable.", code: "price_mismatch" }, 503);
    }

    const { data: household } = await admin
      .from("households")
      .select("stripe_customer_id")
      .eq("id", householdId)
      .maybeSingle();
    const email = String(profile.email || userResult.user.email || "").trim().toLowerCase();
    let customerId = household?.stripe_customer_id || profile.stripe_customer_id || null;
    if (!customerId) {
      customerId = (await stripe.customers.create({
        email: email || undefined,
        name: profile.name || profile.first_name || undefined,
        metadata: { user_id: userResult.user.id, household_id: householdId },
      })).id;
      await Promise.all([
        admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", profile.id),
        admin.from("households").update({ stripe_customer_id: customerId }).eq("id", householdId),
      ]);
    }

    const metadataForStripe = {
      kind: "access_pass",
      lookup_key: option.lookupKey,
      credit_kind: option.kind,
      track: option.track,
      trips: String(option.trips),
      household_id: householdId,
      profile_id: profile.id,
    };
    const origin = safeOrigin(req.headers.get("origin"));
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: metadataForStripe,
      payment_intent_data: { metadata: metadataForStripe },
      success_url: `${origin}/membership?access=success#flexible-access`,
      cancel_url: `${origin}/membership#flexible-access`,
    });

    return json({ url: session.url });
  } catch (error: any) {
    console.error("create-access-pass-checkout:", error?.message ?? error);
    return json({ error: "We couldn't open pass checkout. Please try again.", code: "unexpected" }, 500);
  }
});
