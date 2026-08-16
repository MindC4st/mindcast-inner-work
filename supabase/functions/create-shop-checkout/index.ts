// create-shop-checkout — buy a physical product on your own phone.
//
// Stripe Checkout in `payment` mode runs in the member's browser, so there is
// no POS terminal and no card reader: this is an ordinary card-not-present
// payment. Apple Pay and Google Pay appear automatically in Checkout, which
// matters when someone is buying while standing in a queue.
//
// The order row is NOT written here. It is written by stripe-webhook when
// Stripe confirms the payment, so an abandoned or failed checkout can never
// produce a pickup code. Everything the webhook needs travels in metadata.
//
// POST body:  { slug: string, quantity?: number, scheduled_session_id?: string }
// Response:   { url } | { error }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const MAX_QUANTITY = 20;

// Stripe redirects the customer after payment — only ever to an origin we own.
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const body = await req.json();
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    if (!slug) return json({ error: "slug is required" }, 400);

    const quantity = Number.isInteger(body?.quantity) ? Number(body.quantity) : 1;
    if (quantity < 1 || quantity > MAX_QUANTITY) {
      return json({ error: `quantity must be between 1 and ${MAX_QUANTITY}` }, 400);
    }
    const scheduledSessionId =
      typeof body?.scheduled_session_id === "string" ? body.scheduled_session_id : null;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Who is buying? An order needs an owner — the pickup code has to belong to
    // somebody, and "show me my orders" has to mean something.
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Sign in to buy" }, 401);

    const { data: userRes, error: uErr } = await supa.auth.getUser(jwt);
    if (uErr || !userRes?.user) return json({ error: "Sign in to buy" }, 401);

    const { data: profile } = await supa
      .from("profiles")
      .select("id, email, stripe_customer_id")
      .eq("user_id", userRes.user.id)
      .maybeSingle();
    if (!profile) return json({ error: "No profile for this account" }, 409);

    // Price comes from our catalogue, never from the request body — otherwise
    // the buyer chooses what to pay.
    const { data: product, error: pErr } = await supa
      .from("shop_products")
      .select("id, slug, name, description, price_cents, currency, stripe_price_id, fulfilment, partner_name, is_active")
      .eq("slug", slug)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!product || !product.is_active) return json({ error: "That product isn't available" }, 404);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = safeOrigin(req.headers.get("origin") || req.headers.get("referer"));

    const lineItem = product.stripe_price_id
      ? { price: product.stripe_price_id, quantity }
      : {
          quantity,
          price_data: {
            currency: (product.currency || "nzd").toLowerCase(),
            unit_amount: product.price_cents,
            product_data: {
              name: product.name,
              ...(product.description ? { description: product.description } : {}),
            },
          },
        };

    // Metadata is the whole contract with the webhook. Stripe caps each value
    // at 500 characters, so keep it to ids and numbers.
    const metadata: Record<string, string> = {
      kind: "shop",
      product_id: product.id,
      product_slug: product.slug,
      profile_id: profile.id,
      quantity: String(quantity),
      unit_price_cents: String(product.price_cents),
      fulfilment: product.fulfilment,
    };
    if (product.partner_name) metadata.partner_name = product.partner_name;
    if (scheduledSessionId) metadata.scheduled_session_id = scheduledSessionId;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      metadata,
      // Copied onto the PaymentIntent too, so a refund webhook can find its way
      // back to the order even if the Checkout Session isn't to hand.
      payment_intent_data: { metadata },
      ...(profile.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : profile.email
          ? { customer_email: profile.email }
          : {}),
      success_url: `${origin}/portal/orders?purchase=success`,
      cancel_url: `${origin}/shop?purchase=cancelled`,
    });

    if (!session.url) return json({ error: "Stripe did not return a checkout URL" }, 502);
    return json({ url: session.url });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
