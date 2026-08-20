// shop-order-update — staff-only order actions.
//
// The shop_orders update guard only lets clients move paid -> collected, so
// shipping actions (tracking, status, emails) run here under service role.
//
// POST body:
//   { order_id: string, action: "mark_shipped", tracking_number?: string, tracking_url?: string }
//   { order_id: string, action: "resend_confirmation" }
//   { order_id: string, action: "note", note: string }
//
// Auth: facilitator or admin JWT.

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

const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Not authenticated" }, 401);
    const { data: userRes, error: uErr } = await supa.auth.getUser(jwt);
    if (uErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const { data: roleRow } = await supa
      .from("user_roles").select("role")
      .eq("user_id", userRes.user.id)
      .in("role", ["facilitator", "admin"])
      .limit(1);
    if (!roleRow || roleRow.length === 0) return json({ error: "Staff only" }, 403);

    const body = await req.json();
    const orderId = typeof body?.order_id === "string" ? body.order_id : "";
    const action = typeof body?.action === "string" ? body.action : "";
    if (!orderId || !action) return json({ error: "order_id and action are required" }, 400);

    const { data: order, error: oErr } = await supa
      .from("shop_orders").select("*").eq("id", orderId).maybeSingle();
    if (oErr) throw oErr;
    if (!order) return json({ error: "Order not found" }, 404);

    if (action === "note") {
      const note = typeof body.note === "string" ? body.note.slice(0, 2000) : "";
      const { error } = await supa.from("shop_orders").update({ note }).eq("id", orderId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "resend_confirmation") {
      const { error } = await supa
        .from("shop_orders")
        .update({ confirmation_email_sent_at: null })
        .eq("id", orderId);
      if (error) throw error;
      const sent = await sendOrderEmail(supa, orderId, "confirmation");
      return sent ? json({ ok: true }) : json({ error: "Email could not be sent" }, 502);
    }

    if (action === "mark_shipped") {
      if (order.fulfilment !== "ship") return json({ error: "Only shipped orders can be marked shipped" }, 400);
      if (!["paid", "collected"].includes(order.status)) {
        return json({ error: `Order is ${order.status} — only paid orders can ship` }, 409);
      }
      const trackingNumber = typeof body.tracking_number === "string" ? body.tracking_number.trim() : "";
      const trackingUrl = typeof body.tracking_url === "string" ? body.tracking_url.trim() : "";
      const { error } = await supa.from("shop_orders").update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        tracking_number: trackingNumber || null,
        tracking_url: trackingUrl || null,
        shipped_email_sent_at: null,
      }).eq("id", orderId);
      if (error) throw error;
      const sent = await sendOrderEmail(supa, orderId, "shipped");
      // The order is shipped regardless of whether the email went out; the
      // admin can resend from the console.
      return json({ ok: true, email_sent: sent });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

// deno-lint-ignore no-explicit-any
async function sendOrderEmail(supa: any, orderId: string, kind: "confirmation" | "shipped"): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Mindcast <hello@mindcast.co.nz>";
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY unset — order email skipped");
    return false;
  }

  const { data: order } = await supa.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order || !order.customer_email) return false;

  const { data: items } = await supa
    .from("shop_order_items")
    .select("product_name, quantity, line_total_cents")
    .eq("order_id", orderId)
    .order("created_at");

  const rows = (items && items.length > 0
    ? items
    : [{ product_name: order.product_name, quantity: order.quantity, line_total_cents: order.unit_price_cents * order.quantity }]
  )
    .map(
      (it: { product_name: string; quantity: number; line_total_cents: number }) =>
        `<tr>
          <td style="padding:6px 0;">${it.product_name}${it.quantity > 1 ? ` &times; ${it.quantity}` : ""}</td>
          <td style="padding:6px 0;text-align:right;">${money(it.line_total_cents)}</td>
        </tr>`,
    )
    .join("");

  const trackingBlock = order.tracking_number
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f4f1ea;border-left:3px solid #8a6d3b;">
         Tracking number: <strong>${order.tracking_number}</strong>
         ${order.tracking_url ? `<br/><a href="${order.tracking_url}" style="color:#1a2332;">Track your delivery</a>` : ""}
       </p>`
    : "";

  const html = kind === "shipped"
    ? `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a2332;">
    <p style="letter-spacing:0.3em;font-size:12px;color:#8a6d3b;">MINDCAST</p>
    <h1 style="font-size:22px;margin:8px 0 4px;">Your order is on its way</h1>
    <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
    ${trackingBlock}
    ${order.ship_name ? `<p style="margin:16px 0 4px;color:#555;"><strong>Delivering to</strong><br/>
       ${order.ship_name}<br/>
       ${order.ship_line1 || ""}${order.ship_line2 ? "<br/>" + order.ship_line2 : ""}<br/>
       ${order.ship_city || ""} ${order.ship_postcode || ""}</p>` : ""}
    <p style="margin:20px 0 4px;color:#555;">Thank you for supporting Mindcast.</p>
    <p style="margin:24px 0 0;color:#999;font-size:13px;">Mindcast · mindcast.co.nz</p>
  </div>`
    : `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a2332;">
    <p style="letter-spacing:0.3em;font-size:12px;color:#8a6d3b;">MINDCAST</p>
    <h1 style="font-size:22px;margin:8px 0 4px;">Thank you — your order is confirmed</h1>
    <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      ${rows}
      <tr>
        <td style="padding:10px 0;border-top:1px solid #ddd;"><strong>Total (incl. GST)</strong></td>
        <td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;"><strong>${money(order.amount_total_cents)}</strong></td>
      </tr>
    </table>
    <p style="margin:20px 0 4px;color:#555;">We'll email you again when your order ships. Prices are in NZD and include GST.</p>
    <p style="margin:24px 0 0;color:#999;font-size:13px;">Mindcast · mindcast.co.nz</p>
  </div>`;

  const subject = kind === "shipped"
    ? `MINDCAST order ${order.order_number || ""} — shipped`
    : `MINDCAST order ${order.order_number || ""} — confirmed`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [order.customer_email], subject, html }),
  });
  if (!r.ok) {
    console.error("Order email failed:", r.status, await r.text());
    return false;
  }
  const col = kind === "shipped" ? "shipped_email_sent_at" : "confirmation_email_sent_at";
  await supa.from("shop_orders").update({ [col]: new Date().toISOString() }).eq("id", orderId);
  return true;
}
