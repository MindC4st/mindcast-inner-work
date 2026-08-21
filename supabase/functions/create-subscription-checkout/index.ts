// create-subscription-checkout — starts a RECURRING membership Checkout.
//
// Multi-tier, multi-line-item family subscriptions. Frontend sends:
//   { plan, adults, teens, children,
//     members: [{ tier: "adult"|"teen", first_name, email },
//               { tier: "child", first_name }],
//     bracelets: [email, ...],        // free founding-100 selections
//     paid_bracelets: [email, ...] }  // $15 one-time bracelet add-ons
//
// The function builds one Checkout session with separate recurring line items
// per tier, conditionally applies the FAMILY15 coupon when the cart contains
// 2+ adults + at least 1 teen OR child, and records the bundle composition in
// subscription metadata. Paid bracelets are ONE-TIME line items on the same
// subscription checkout — Stripe charges them once at purchase and they never
// recur on renewal.
//
// Bracelets are physical inventory: the selected quantity (free + paid) is
// reserved against the checkout session and converted/released by the webhook.
//
// Env (set on Supabase project from Stripe Dashboard price IDs):
//   STRIPE_PRICE_ADULT_MONTHLY, STRIPE_PRICE_ADULT_ANNUAL
//   STRIPE_PRICE_TEEN_MONTHLY,  STRIPE_PRICE_TEEN_ANNUAL
//   STRIPE_PRICE_CHILD_MONTHLY, STRIPE_PRICE_CHILD_ANNUAL
//   STRIPE_FAMILY_COUPON_ID     (e.g. "FAMILY15")
//   STRIPE_SECRET_KEY
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
//
// Error contract: responses carry a customer-safe `error` message plus a
// machine `code` for diagnostics. Internal details are logged server-side
// only — never returned to the browser.

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
      u.hostname.endsWith(".vercel.app") ||
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
  if (!id) console.error(`create-subscription-checkout: missing env var ${key}`);
  return id ?? null;
}

/** Clamp a quantity to a sane range. */
const clamp = (n: number) => Math.max(0, Math.min(20, Number(n) || 0));

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const BRACELET_SLUG = "nfc-bracelet";
const BRACELET_PRICE_CENTS = 1500;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Please sign in again and retry.", code: "not_authenticated" }, 401);
    }

    // Resolve caller from JWT
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes, error: userErr } = await anon.auth.getUser();
    if (userErr || !userRes?.user) {
      return json({ error: "Please sign in again and retry.", code: "not_authenticated" }, 401);
    }
    const user = userRes.user;

    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "annual" ? "annual" : "monthly";
    const adults = clamp(body.adults);
    const teens = clamp(body.teens);
    const children = clamp(body.children);

    if (adults + teens + children < 1) {
      return json({ error: "Select at least one membership.", code: "no_seats" }, 400);
    }

    // ── named household members ────────────────────────────────────────────
    // Adults/teens: first name + valid unique email (their own login + their
    // founding-bracelet identity). Children: first name only — never an email.
    const membersRaw = Array.isArray(body.members) ? body.members : [];
    const members: { tier: "adult" | "teen" | "child"; first_name: string; email: string }[] = [];
    for (const m of membersRaw.slice(0, 25)) {
      const tier = m?.tier === "teen" ? "teen" : m?.tier === "child" ? "child" : "adult";
      const first_name = String(m?.first_name ?? "").trim().slice(0, 80);
      if (!first_name) {
        return json({ error: `Every ${tier} needs a first name.`, code: "member_name_required" }, 400);
      }
      if (tier === "child") {
        members.push({ tier, first_name, email: "" });
        continue;
      }
      const memail = String(m?.email ?? "").trim().toLowerCase();
      if (!memail || !EMAIL_RE.test(memail)) {
        return json({ error: "Every additional adult and teen needs their own valid email.", code: "member_email_invalid" }, 400);
      }
      members.push({ tier, first_name, email: memail });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: profile } = await admin
      .from("profiles")
      .select("id, email, stripe_customer_id, age_group")
      .eq("user_id", user.id)
      .maybeSingle();

    const email = (profile?.email || user.email || "").toLowerCase();

    // Named-person counts must match the purchased seats. The payer occupies
    // one adult seat (unless the payer is a teen buying a teen bundle).
    const payerIsTeen = (profile?.age_group || "").toLowerCase() === "teen";
    const maxExtraAdults = Math.max(0, adults - (payerIsTeen ? 0 : 1));
    const adultMembers = members.filter((m) => m.tier === "adult");
    const teenMembers = members.filter((m) => m.tier === "teen");
    const childMembers = members.filter((m) => m.tier === "child");
    if (adultMembers.length !== maxExtraAdults) {
      return json({ error: "Please add a name and email for every additional adult.", code: "adult_count_mismatch" }, 400);
    }
    if (teenMembers.length !== teens) {
      return json({ error: "Please add a name and email for every teen.", code: "teen_count_mismatch" }, 400);
    }
    if (childMembers.length !== children) {
      return json({ error: "Please add a name for every child.", code: "child_count_mismatch" }, 400);
    }
    const memberEmails = members.map((m) => m.email).filter(Boolean);
    if (new Set(memberEmails).size !== memberEmails.length) {
      return json({ error: "Each member needs a unique email.", code: "duplicate_member_email" }, 400);
    }
    if (email && memberEmails.includes(email)) {
      return json({ error: "Additional members can't reuse the account holder's email.", code: "payer_email_reused" }, 400);
    }

    // ── recurring membership line items ────────────────────────────────────
    const tiers: { tier: string; qty: number }[] = [];
    if (adults > 0) tiers.push({ tier: "adult", qty: adults });
    if (teens > 0) tiers.push({ tier: "teen", qty: teens });
    if (children > 0) tiers.push({ tier: "child", qty: children });

    const line_items: any[] = [];
    for (const t of tiers) {
      const pid = priceId(t.tier, plan);
      if (!pid) {
        // Configuration problem — customer-safe message, details already logged.
        return json({
          error: "We couldn't start checkout — membership pricing isn't available right now. Please try again soon or contact hello@mindcast.co.nz.",
          code: `price_not_configured:${t.tier}:${plan}`,
        }, 500);
      }
      line_items.push({ price: pid, quantity: t.qty });
    }

    // Conditional family discount: 2+ adults AND (≥1 teen OR ≥1 child)
    const familyDiscount = adults >= 2 && (teens >= 1 || children >= 1);
    const discountCoupon = familyDiscount
      ? (Deno.env.get("STRIPE_FAMILY_COUPON_ID") || null)
      : null;

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
    if (!customerId) {
      const existing = email ? await stripe.customers.list({ email, limit: 1 }) : { data: [] as any[] };
      customerId = existing.data.length > 0
        ? existing.data[0].id
        : (await stripe.customers.create({ email: email || undefined, metadata: { user_id: user.id } })).id;
      if (profile?.id) {
        await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", profile.id);
      }
    }

    // ── bracelet add-ons ───────────────────────────────────────────────────
    // Free founding selections + paid $15 add-ons, both keyed by member email.
    // Only emails belonging to this checkout (payer + named adults/teens) are
    // accepted; children can never receive a bracelet.
    const eligibleEmails = new Set([...new Set([email, ...memberEmails].filter(Boolean))]);
    const normalizeList = (x: unknown) => [...new Set(
      (Array.isArray(x) ? x : []).map((v: unknown) => String(v ?? "").trim().toLowerCase()),
    )].filter((v: string) => eligibleEmails.has(v));
    const freeBraceletEmails = normalizeList(body.bracelets);
    const paidBraceletEmails = normalizeList(body.paid_bracelets)
      .filter((v: string) => !freeBraceletEmails.includes(v));

    const braceletQty = freeBraceletEmails.length + paidBraceletEmails.length;
    let braceletProduct: any = null;
    let braceletVariant: any = null;
    if (braceletQty > 0) {
      const { data: bp } = await admin
        .from("shop_products").select("*").eq("slug", BRACELET_SLUG).maybeSingle();
      braceletProduct = bp;
      if (bp?.track_stock) {
        const { data: bv } = await admin
          .from("shop_product_variants")
          .select("*")
          .eq("product_id", bp.id)
          .eq("is_active", true)
          .order("sort_order")
          .limit(1)
          .maybeSingle();
        braceletVariant = bv;
      }
    }

    // Paid bracelets: ONE-TIME line items (no recurring field) with the
    // recipient attached as line metadata so the webhook can create the order
    // and fulfilment for the right person. $15.00 incl GST each.
    for (const pe of paidBraceletEmails) {
      const named = members.find((m) => m.email === pe);
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: BRACELET_PRICE_CENTS,
          tax_behavior: "inclusive",
          product_data: {
            name: "MINDCAST NFC Bracelet",
            description: `Check-in bracelet for ${named?.first_name || "member"}`,
            metadata: {
              kind: "bracelet_addon",
              product_id: braceletProduct?.id ?? "",
              slug: BRACELET_SLUG,
              recipient_email: pe,
              recipient_name: named?.first_name ?? "",
            },
          },
        },
      });
    }

    const origin = safeOrigin(req.headers.get("origin"));

    // Bundle metadata — the webhook uses these to derive access for household members
    const bundleMeta: Record<string, string> = {
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

    if (discountCoupon) {
      sessionParams.discounts = [{ coupon: discountCoupon }];
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (e: any) {
      console.error("create-subscription-checkout: Stripe session create failed:", e?.message ?? e);
      return json({
        error: "We couldn't start checkout. Please try again.",
        code: "stripe_session_failed",
      }, 502);
    }

    // ── bracelet stock reservation (physical inventory) ───────────────────
    // Reserved against the session; converted on payment, released on expiry.
    // A reservation failure means we can't promise the bracelets — fail the
    // checkout rather than oversell (membership-only checkouts never reach
    // this branch).
    if (braceletQty > 0 && braceletProduct?.track_stock && braceletVariant) {
      const { error: rErr } = await admin.rpc("shop_reserve_stock", {
        p_variant_id: braceletVariant.id,
        p_quantity: braceletQty,
        p_session_key: session.id,
      });
      if (rErr) {
        await stripe.checkout.sessions.expire(session.id).catch(() => {});
        console.error("create-subscription-checkout: bracelet stock reservation failed:", rErr.message);
        const insufficient = (rErr.message || "").includes("insufficient_stock");
        return json({
          error: insufficient
            ? "Bracelets just sold out — you can complete membership now and add bracelets later."
            : "We couldn't reserve the bracelets. Please try again.",
          code: insufficient ? "bracelet_out_of_stock" : "bracelet_reserve_failed",
        }, insufficient ? 409 : 500);
      }
    }

    // Founding-100: reserve one seat per individual email (payer + named
    // members) against this checkout session. The webhook finalises the
    // reservations on payment and releases them if the checkout expires or
    // fails. A promotion error must never block the membership purchase.
    const reserved: string[] = [];
    const unavailable: string[] = [];
    for (const re of eligibleEmails) {
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

    // Free selections must be a subset of reserved seats (enforced here).
    const selected = freeBraceletEmails.filter((x: string) => reserved.includes(x));

    try {
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          founding_reserved: reserved.join(","),
          founding_selected: selected.join(","),
          paid_bracelets: paidBraceletEmails.join(","),
          bracelet_qty: String(braceletQty),
          member_list: JSON.stringify(members),
        },
      });
    } catch (e: any) {
      // Metadata enrichment only — never block the purchase.
      console.error("create-subscription-checkout: session metadata update failed:", e?.message ?? e);
    }

    return json({
      url: session.url,
      family_discount_applied: familyDiscount,
      founding: { reserved, unavailable, selected, paid: paidBraceletEmails },
    });
  } catch (e: any) {
    console.error("create-subscription-checkout: unexpected error:", e?.message ?? e);
    return json({ error: "We couldn't start checkout. Please try again.", code: "unexpected" }, 500);
  }
});
