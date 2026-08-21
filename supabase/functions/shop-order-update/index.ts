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

const FONT = "Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

const WORDMARK_URL =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/Wordmark-White-Transparent.png";

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const shell = (inner: string) => `<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Mindcast</title>
</head>
<body style="margin:0;padding:0;background:#F8F5EF;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F5EF;">
<tr><td align="center" style="padding:34px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
       style="width:600px;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;">
  <tr><td style="background:#3D8DB7;padding:26px 44px;">
    <img src="${WORDMARK_URL}" width="150" alt="Mindcast"
         style="display:block;width:150px;max-width:150px;height:auto;">
  </td></tr>
  <tr><td style="padding:30px 44px 34px;">
${inner}
  </td></tr>
  <tr><td style="padding:0 44px 34px;">
    <div style="height:1px;background:#E9E5DE;line-height:1px;font-size:1px;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-top:14px;"><tr>
      <td align="left" style="font-family:${FONT};font-size:10px;color:#92979D;">mindcast.co.nz</td>
      <td align="right" style="font-family:${FONT};font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#303947;">Notice It. Name It. Do It.</td>
    </tr></table>
    <div style="font-family:${FONT};font-size:11px;line-height:1.7;color:#92979D;padding-top:16px;">
      Mindcast Limited &nbsp;·&nbsp; Taup&#333;, Aotearoa New Zealand<br>
      Reply to this email and a person will read it.
    </div>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>`;

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
          <td style="padding:8px 0;border-bottom:1px solid #E9E5DE;font-family:${FONT};font-size:15px;color:#4D5560;">${escapeHtml(String(it.product_name))}${it.quantity > 1 ? ` &times; ${it.quantity}` : ""}</td>
          <td style="padding:8px 0;border-bottom:1px solid #E9E5DE;text-align:right;font-family:${FONT};font-size:15px;color:#303947;">${money(it.line_total_cents)}</td>
        </tr>`,
    )
    .join("");

  const trackingBlock = order.tracking_number
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="margin:24px 0 0;background:#F8F5EF;border-radius:14px;overflow:hidden;"><tr>
        <td width="4" style="width:4px;background:#3D8DB7;font-size:1px;line-height:1px;">&nbsp;</td>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;line-height:1.5;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#92979D;">Tracking</p>
          <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.65;color:#4D5560;">
            <strong style="color:#303947;">${escapeHtml(String(order.tracking_number))}</strong>
            ${order.tracking_url ? `<br><a href="${escapeHtml(String(order.tracking_url))}" style="color:#3D8DB7;text-decoration:underline;">Track your delivery</a>` : ""}
          </p>
        </td>
      </tr></table>`
    : "";

  const addressPanel = order.ship_name
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="margin:24px 0 0;background:#F8F5EF;border-radius:14px;overflow:hidden;"><tr>
        <td width="4" style="width:4px;background:#3D8DB7;font-size:1px;line-height:1px;">&nbsp;</td>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 6px;font-family:${FONT};font-size:13px;line-height:1.5;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#92979D;">Delivering to</p>
          <p style="margin:0;font-family:${FONT};font-size:16px;line-height:1.65;color:#4D5560;">
            <strong style="color:#303947;">${escapeHtml(String(order.ship_name))}</strong><br>
            ${order.ship_line1 ? escapeHtml(String(order.ship_line1)) : ""}${order.ship_line2 ? "<br>" + escapeHtml(String(order.ship_line2)) : ""}${order.ship_line1 || order.ship_line2 ? "<br>" : ""}
            ${escapeHtml(`${order.ship_city || ""} ${order.ship_postcode || ""}`.trim())}
          </p>
        </td>
      </tr></table>`
    : "";

  const html = shell(kind === "shipped"
    ? `
      <h1 style="margin:0 0 18px;font-family:${FONT};font-size:28px;line-height:1.25;font-weight:600;color:#303947;">Your order is on its way</h1>
      <p style="margin:0 0 26px;font-family:${FONT};font-size:14px;line-height:1.6;color:#747B84;">Order <strong style="color:#303947;">${order.order_number || ""}</strong></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 8px;font-family:${FONT};font-size:15px;">${rows}</table>
      ${trackingBlock}
      ${addressPanel}
      <p style="margin:26px 0 0;font-family:${FONT};font-size:15px;line-height:1.65;color:#4D5560;">Thank you for supporting Mindcast.</p>
    `
    : `
      <h1 style="margin:0 0 18px;font-family:${FONT};font-size:28px;line-height:1.25;font-weight:600;color:#303947;">Thank you — your order is confirmed</h1>
      <p style="margin:0 0 26px;font-family:${FONT};font-size:14px;line-height:1.6;color:#747B84;">Order <strong style="color:#303947;">${order.order_number || ""}</strong></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 8px;font-family:${FONT};font-size:15px;">
        ${rows}
        <tr>
          <td style="padding:16px 0 0;font-size:16px;font-weight:600;color:#303947;">Total <span style="font-weight:400;color:#92979D;">(incl. GST)</span></td>
          <td align="right" style="padding:16px 0 0 20px;font-size:17px;font-weight:600;color:#303947;">${money(order.amount_total_cents)}</td>
        </tr>
      </table>
      <p style="margin:26px 0 0;font-family:${FONT};font-size:15px;line-height:1.65;color:#4D5560;">We'll email you again when your order ships. Prices are in NZD and include GST.</p>
    `);

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
