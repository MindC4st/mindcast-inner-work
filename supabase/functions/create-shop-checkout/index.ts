// create-shop-checkout — buy physical products (Shopify-style checkout).
//
// Stripe Checkout in `payment` mode runs in the buyer's browser: card-not-
// present, Apple Pay / Google Pay automatic, shipping address collected and
// validated by Stripe (NZ only). Members and guests can both buy — a guest
// order is linked by email, never forced into a membership account.
//
// Stock: tracked variants are RESERVED when the checkout session is created
// (shop_reserve_stock locks the row — two final-unit buyers cannot both
// reserve). The webhook converts the reservation into a sale on payment, or
// releases it on expiry/failure.
//
// Discounts: validated server-side, applied as a negative line item (or free
// shipping) so the audit trail stays in our ledger.
//
// The order row is written by stripe-webhook when Stripe confirms payment —
// an abandoned checkout can never produce an order.
//
// POST body:
//   { items: [{ slug, quantity, variant_id? }], discount_code?, scheduled_session_id? }
//   legacy shape { slug, quantity? } still accepted.
// Response: { url } | { error }

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

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_CART_LINES = 12;
const GST_RATE = 0.15;
const gstComponent = (cents: number) => Math.round(cents * GST_RATE / (1 + GST_RATE));

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

type CartLine = { slug: string; quantity: number; variantId?: string };
type Variant = {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_override_cents: number | null;
  stock_available: number;
  is_active: boolean;
};
type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  fulfilment: string;
  partner_name: string | null;
  status: string;
  track_stock: boolean;
  allow_backorder: boolean;
  variants: Variant[];
};
type Discount = {
  id: string;
  code: string;
  kind: "fixed" | "percent" | "free_shipping";
  value_cents: number;
  value_percent: number | null;
  scope: "order" | "product";
  product_ids: string[];
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  times_used: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const body = await req.json();

    // ── normalise the cart ────────────────────────────────────────────────
    let cart: CartLine[] = [];
    if (Array.isArray(body?.items)) {
      cart = body.items
        .filter((l: unknown): l is Record<string, unknown> => Boolean(l) && typeof l === "object")
        .map((l) => ({
          slug: typeof l.slug === "string" ? l.slug.trim() : "",
          quantity: Number.isInteger(l.quantity) ? Number(l.quantity) : 1,
          variantId: typeof l.variant_id === "string" ? l.variant_id : undefined,
        }))
        .filter((l: CartLine) => l.slug.length > 0);
    } else if (typeof body?.slug === "string" && body.slug.trim()) {
      cart = [{ slug: body.slug.trim(), quantity: Number.isInteger(body?.quantity) ? Number(body.quantity) : 1 }];
    }
    if (cart.length === 0) return json({ error: "Your cart is empty" }, 400);
    if (cart.length > MAX_CART_LINES) return json({ error: `Maximum ${MAX_CART_LINES} different products per order` }, 400);
    for (const line of cart) {
      if (line.quantity < 1 || line.quantity > MAX_QUANTITY_PER_ITEM) {
        return json({ error: "Quantity must be between 1 and 20" }, 400);
      }
    }
    // Merge duplicate lines (same slug + variant).
    const merged = new Map<string, CartLine>();
    for (const line of cart) {
      const key = `${line.slug}|${line.variantId ?? ""}`;
      const existing = merged.get(key);
      merged.set(key, existing
        ? { ...existing, quantity: Math.min(MAX_QUANTITY_PER_ITEM, existing.quantity + line.quantity) }
        : line);
    }
    cart = [...merged.values()];

    const discountCode = typeof body?.discount_code === "string" ? body.discount_code.trim().toUpperCase() : "";
    const scheduledSessionId = typeof body?.scheduled_session_id === "string" ? body.scheduled_session_id : null;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // ── who is buying (optional — guests are welcome) ─────────────────────
    let profileId: string | null = null;
    let profileEmail: string | null = null;
    let stripeCustomerId: string | null = null;
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (jwt && jwt !== "null") {
      const { data: userRes } = await supa.auth.getUser(jwt);
      if (userRes?.user) {
        const { data: profile } = await supa
          .from("profiles")
          .select("id, email, stripe_customer_id")
          .eq("user_id", userRes.user.id)
          .maybeSingle();
        if (profile) {
          profileId = profile.id;
          profileEmail = profile.email;
          stripeCustomerId = profile.stripe_customer_id;
        }
      }
    }

    // ── catalogue (prices come from here, never the request) ──────────────
    const slugs = [...new Set(cart.map((l) => l.slug))];
    const { data: productRows, error: pErr } = await supa
      .from("shop_products")
      .select("id, slug, name, description, price_cents, currency, stripe_price_id, fulfilment, partner_name, status, track_stock, allow_backorder")
      .in("slug", slugs);
    if (pErr) throw pErr;
    const products = new Map<string, Product>();
    for (const p of (productRows ?? []) as Omit<Product, "variants">[]) {
      products.set(p.slug, { ...p, variants: [] });
    }
    for (const line of cart) {
      if (!products.has(line.slug)) return json({ error: `That product isn't available` }, 404);
    }
    // Load active variants for the products in the cart.
    const { data: variantRows, error: vErr } = await supa
      .from("shop_product_variants")
      .select("id, product_id, name, sku, price_override_cents, stock_available, is_active")
      .in("product_id", [...products.values()].map((p) => p.id))
      .eq("is_active", true)
      .order("sort_order");
    if (vErr) throw vErr;
    for (const v of (variantRows ?? []) as Variant[]) {
      const p = [...products.values()].find((x) => x.id === v.product_id);
      if (p) p.variants.push(v);
    }

    // Resolve each cart line to a concrete variant.
    type ResolvedLine = { line: CartLine; product: Product; variant: Variant; unitPrice: number };
    const resolved: ResolvedLine[] = [];
    for (const line of cart) {
      const product = products.get(line.slug)!;
      if (product.status !== "active") return json({ error: `${product.name} isn't available right now` }, 404);
      let variant: Variant | undefined;
      if (line.variantId) {
        variant = product.variants.find((v) => v.id === line.variantId);
        if (!variant) return json({ error: `That option isn't available for ${product.name}` }, 400);
      } else if (product.variants.length === 1) {
        variant = product.variants[0];
      } else if (product.variants.length === 0) {
        return json({ error: `${product.name} isn't available right now` }, 404);
      } else {
        return json({ error: `Choose an option for ${product.name}` }, 400);
      }
      const unitPrice = variant.price_override_cents ?? product.price_cents;
      resolved.push({ line, product, variant, unitPrice });
    }

    // One fulfilment world per order.
    const fulfilments = new Set(resolved.map((r) => r.product.fulfilment));
    const isShipped = fulfilments.has("ship");
    if (isShipped && fulfilments.size > 1) {
      return json({ error: "Shipped products and counter pickups can't be bought in the same order" }, 400);
    }

    // ── settings ───────────────────────────────────────────────────────────
    const { data: settingRows } = await supa.from("shop_settings").select("key, value");
    const settings = new Map((settingRows ?? []).map((s: { key: string; value: string }) => [s.key, s.value]));
    const shippingFlat = parseInt(settings.get("shipping_flat_cents") || "800", 10);
    const freeThreshold = parseInt(settings.get("free_shipping_threshold_cents") || "12000", 10);

    // ── discount ───────────────────────────────────────────────────────────
    let discount: Discount | null = null;
    if (discountCode) {
      const { data: dRow } = await supa
        .from("shop_discounts")
        .select("id, code, kind, value_cents, value_percent, scope, product_ids, starts_at, ends_at, usage_limit, times_used")
        .eq("code", discountCode)
        .eq("is_active", true)
        .maybeSingle();
      if (!dRow) return json({ error: "That discount code isn't valid" }, 400);
      const d = dRow as unknown as Discount;
      const now = new Date();
      if (d.starts_at && new Date(d.starts_at) > now) return json({ error: "That discount code isn't active yet" }, 400);
      if (d.ends_at && new Date(d.ends_at) < now) return json({ error: "That discount code has expired" }, 400);
      if (d.usage_limit !== null && d.times_used >= d.usage_limit) {
        return json({ error: "That discount code has reached its usage limit" }, 400);
      }
      discount = d;
    }

    // ── money ──────────────────────────────────────────────────────────────
    const subtotal = resolved.reduce((sum, r) => sum + r.unitPrice * r.line.quantity, 0);
    let discountCents = 0;
    if (discount && discount.kind === "fixed") {
      discountCents = Math.min(subtotal, discount.value_cents);
    } else if (discount && discount.kind === "percent") {
      discountCents = Math.round(subtotal * (discount.value_percent ?? 0) / 100);
    }
    const afterDiscount = Math.max(0, subtotal - discountCents);
    const freeShipping = isShipped && (
      (discount?.kind === "free_shipping") || afterDiscount >= freeThreshold
    );
    const shippingCents = isShipped ? (freeShipping ? 0 : shippingFlat) : 0;

    // ── Stripe session ─────────────────────────────────────────────────────
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const origin = safeOrigin(req.headers.get("origin") || req.headers.get("referer"));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolved.map((r) => ({
      quantity: r.line.quantity,
      price_data: {
        currency: (r.product.currency || "nzd").toLowerCase(),
        unit_amount: r.unitPrice,
        tax_behavior: "inclusive",
        product_data: {
          name: r.product.variants.length > 1 && r.variant.name !== "Default"
            ? `${r.product.name} — ${r.variant.name}`
            : r.product.name,
          ...(r.product.description ? { description: r.product.description } : {}),
          // The webhook maps line items back through this.
          metadata: {
            product_id: r.product.id,
            slug: r.product.slug,
            variant_id: r.variant.id,
            sku: r.variant.sku || "",
          },
        },
      },
    }));
    if (discountCents > 0 && discount) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "nzd",
          unit_amount: -discountCents,
          tax_behavior: "inclusive",
          product_data: { name: `Discount — ${discount.code}` },
        },
      });
    }

    const metadata: Record<string, string> = {
      kind: "shop",
      fulfilment: isShipped ? "ship" : (fulfilments.values().next().value as string),
      profile_id: profileId || "",
      line_count: String(resolved.length),
      item_count: String(resolved.reduce((n, r) => n + r.line.quantity, 0)),
      subtotal_cents: String(subtotal),
      discount_cents: String(discountCents),
      shipping_cents: String(shippingCents),
      gst_cents: String(gstComponent(afterDiscount + shippingCents)),
    };
    if (discount) metadata.discount_code = discount.code;
    if (discount) metadata.discount_id = discount.id;
    if (scheduledSessionId && !isShipped) metadata.scheduled_session_id = scheduledSessionId;
    const partner = resolved.map((r) => r.product.partner_name).find(Boolean);
    if (partner) metadata.partner_name = partner;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      metadata,
      payment_intent_data: { metadata },
      ...(stripeCustomerId
        ? { customer: stripeCustomerId }
        : profileEmail
          ? { customer_email: profileEmail }
          : {}),
      success_url: `${origin}/portal/orders?purchase=success`,
      cancel_url: `${origin}/shop?purchase=cancelled`,
    };
    if (isShipped) {
      sessionParams.shipping_address_collection = {
        allowed_countries: (settings.get("shipping_countries") || "NZ").split(",").map((s) => s.trim()) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      };
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            display_name: freeShipping ? "Shipping — free" : "Standard shipping — New Zealand",
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "nzd" },
            tax_behavior: "inclusive",
          },
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    if (!session.url) return json({ error: "Stripe did not return a checkout URL" }, 502);

    // ── reserve tracked stock against this session ─────────────────────────
    for (const r of resolved) {
      if (!r.product.track_stock) continue;
      const { error: rErr } = await supa.rpc("shop_reserve_stock", {
        p_variant_id: r.variant.id,
        p_quantity: r.line.quantity,
        p_session_key: session.id,
      });
      if (rErr) {
        // Can't hold the stock — kill the session so it can't be paid.
        await stripe.checkout.sessions.expire(session.id).catch(() => {});
        const insufficient = (rErr.message || "").includes("insufficient_stock");
        return json({
          error: insufficient
            ? `Not enough ${r.product.name} in stock right now`
            : "Could not reserve stock — try again",
        }, insufficient ? 409 : 500);
      }
    }

    return json({ url: session.url });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
