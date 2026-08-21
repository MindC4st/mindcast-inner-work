// claim-founding-bracelet — a member claims their free founding bracelet
// (or one for an eligible household member) WITHOUT a Stripe checkout: a $0
// counter-pickup shop order is created directly, mirroring recordShopOrder's
// row shape. Only an ALLOCATED, unclaimed entitlement can be claimed, and the
// claim RPC row-locks the entitlement so a double claim is impossible.
//
// POST body: { recipient_email?: string }   (defaults to the caller)
// Response:  { ok, order_number, pickup_code } | { error }
//
// Gates (all server-side):
//   * caller must be signed in with an active/trialing membership
//   * recipient must be the caller or a profile in the caller's household
//   * recipient email must hold an allocated, unclaimed founding entitlement

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

const ACTIVE = new Set(["active", "trialing"]);
const BRACELET_SLUG = "nfc-bracelet";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await anon.auth.getUser();
    if (!userRes?.user) return json({ error: "Not authenticated" }, 401);

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: caller } = await supa
      .from("profiles")
      .select("id, email, first_name, last_name, name, membership_status")
      .eq("user_id", userRes.user.id)
      .maybeSingle();
    if (!caller) return json({ error: "Profile not found" }, 404);
    if (!ACTIVE.has((caller.membership_status || "").toLowerCase())) {
      return json({ error: "An active MINDCAST membership is required" }, 403);
    }

    const callerEmail = String(caller.email || userRes.user.email || "").trim().toLowerCase();
    const body = await req.json().catch(() => ({}));
    const recipientEmail = String(body?.recipient_email ?? "").trim().toLowerCase() || callerEmail;

    // Recipient must be the caller or a profile inside the caller's household.
    let recipientProfile: { id: string; email: string | null; first_name: string | null } | null = null;
    if (recipientEmail === callerEmail) {
      recipientProfile = { id: caller.id, email: caller.email, first_name: caller.first_name || caller.name || null };
    } else {
      const { data: callerHousehold } = await supa
        .from("household_members").select("household_id")
        .eq("profile_id", caller.id).limit(1).maybeSingle();
      if (!callerHousehold?.household_id) {
        return json({ error: "Recipient is not in your household" }, 403);
      }
      const { data: memberRows } = await supa
        .from("household_members").select("profile_id")
        .eq("household_id", callerHousehold.household_id);
      const memberIds = (memberRows ?? []).map((m) => m.profile_id).filter(Boolean);
      if (memberIds.length === 0) return json({ error: "Recipient is not in your household" }, 403);

      const { data: profiles } = await supa
        .from("profiles").select("id, email, user_id, first_name")
        .in("id", memberIds);
      const match = (profiles ?? []).find((p) => {
        const pEmail = String(p.email || "").trim().toLowerCase();
        return pEmail !== "" && pEmail === recipientEmail;
      });
      if (!match) return json({ error: "Recipient is not in your household" }, 403);
      recipientProfile = { id: match.id, email: match.email, first_name: match.first_name };
    }

    // Entitlement must exist, be allocated, and be unclaimed.
    const { data: lookup, error: lookupErr } = await supa.rpc("founding_bracelet_lookup", { p_email: recipientEmail });
    if (lookupErr) return json({ error: `Eligibility check failed: ${lookupErr.message}` }, 500);
    const state = (lookup as { state?: string })?.state;
    if (state === "claimed") return json({ error: "This founding bracelet has already been claimed" }, 409);
    if (state !== "allocated") {
      return json({ error: "No free founding bracelet is available for this member" }, 409);
    }

    const { data: product } = await supa
      .from("shop_products").select("*")
      .eq("slug", BRACELET_SLUG).maybeSingle();
    if (!product) return json({ error: "Bracelet product not configured" }, 500);

    const recipientName = recipientProfile.first_name || "Member";
    const customerName = `${recipientName} (via ${caller.first_name || caller.name || "member"})`;

    // $0 counter order — same row shape the webhook writes for paid orders.
    const { data: order, error: orderErr } = await supa
      .from("shop_orders")
      .insert({
        profile_id: caller.id,
        product_id: product.id,
        product_name: `${product.name} — Founding Member (free)`,
        unit_price_cents: 0,
        quantity: 1,
        amount_total_cents: 0,
        currency: "nzd",
        fulfilment: "counter",
        status: "paid",
        payment_status: "paid",
        fulfilment_status: "unfulfilled",
        customer_email: recipientEmail,
        customer_first_name: recipientName,
        customer_last_name: "",
        note: `Founding-100 free bracelet claim — ${customerName}`,
      })
      .select("*")
      .single();
    if (orderErr || !order) {
      return json({ error: `Order creation failed: ${orderErr?.message ?? "unknown"}` }, 500);
    }

    const { error: itemErr } = await supa.from("shop_order_items").insert({
      order_id: order.id,
      product_id: product.id,
      slug: product.slug,
      sku: product.sku ?? null,
      product_name: product.name,
      unit_price_cents: 0,
      quantity: 1,
      line_total_cents: 0,
      gst_cents: 0,
      recipient: {
        profile_id: recipientProfile.id,
        email: recipientEmail,
        first_name: recipientName,
        founding_free: true,
      },
    });
    if (itemErr) {
      await supa.from("shop_orders").update({ status: "cancelled", payment_status: "cancelled" }).eq("id", order.id);
      return json({ error: `Order item failed: ${itemErr.message}` }, 500);
    }

    // Atomic claim — NULL means someone claimed it between lookup and here.
    const { data: claimed, error: claimErr } = await supa.rpc("founding_bracelet_claim", {
      p_email: recipientEmail,
      p_order_id: order.id,
    });
    if (claimErr || !claimed) {
      await supa.from("shop_orders").update({ status: "cancelled", payment_status: "cancelled" }).eq("id", order.id);
      return json({ error: "This founding bracelet has already been claimed" }, 409);
    }

    await supa.from("shop_order_events").insert({
      order_id: order.id,
      type: "email_sent",
      actor: caller.id,
      note: "Founding bracelet claimed (free)",
      metadata: { email_type: "nfc_bracelet_free_claimed", recipient_email: recipientEmail },
    }).catch(() => {});

    return json({ ok: true, order_number: order.order_number, pickup_code: order.pickup_code });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
