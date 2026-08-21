// Commerce transactional email — Resend + notification log.
// This file is duplicated into each commerce function directory because
// `supabase functions deploy` uploads only the function's own folder.
// Keep the copies identical.
//
// Brand system: matches _shared/email/layout.ts + tokens.ts —
// ivory page #F8F5EF, white 600px card, blue #3D8DB7 masthead with the white
// wordmark, Arial/system typography, quiet shared footer. No Georgia, no
// navy/brown/beige legacy palette.

// deno-lint-ignore-file no-explicit-any

const FONT = "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const WORDMARK_URL =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/Wordmark-White-Transparent.png";

export const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

const RESEND = "https://api.resend.com/emails";

/** Escape user/customer-provided values before interpolating into HTML. */
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const frame = (inner: string) => `<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
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
      <td align="left" style="font-family:${FONT};font-size:10px;color:#92979D;">
        mindcast.co.nz</td>
      <td align="right" style="font-family:${FONT};font-size:10px;font-weight:700;
          letter-spacing:.16em;text-transform:uppercase;color:#303947;">
        Notice It. Name It. Do It.</td>
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

export const itemsTable = (
  items: { product_name: string; quantity: number; line_total_cents: number }[],
): string => items.map((it) =>
  `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #E9E5DE;font-family:${FONT};font-size:15px;color:#4D5560;">${escapeHtml(String(it.product_name))}${it.quantity > 1 ? ` &times; ${it.quantity}` : ""}</td>
    <td style="padding:8px 0;border-bottom:1px solid #E9E5DE;text-align:right;font-family:${FONT};font-size:15px;color:#303947;">${money(it.line_total_cents)}</td>
  </tr>`).join("");

export const addressBlock = (o: any): string => o.ship_name
  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="margin:20px 0;background:#F8F5EF;border-radius:10px;overflow:hidden;"><tr>
      <td width="4" style="width:4px;background:#3D8DB7;font-size:1px;line-height:1px;">&nbsp;</td>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#92979D;">Delivering to</p>
        <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:#4D5560;">
          <strong style="color:#303947;">${escapeHtml(String(o.ship_name))}</strong><br>
          ${o.ship_line1 ? escapeHtml(String(o.ship_line1)) : ""}${o.ship_line2 ? "<br>" + escapeHtml(String(o.ship_line2)) : ""}${o.ship_line1 || o.ship_line2 ? "<br>" : ""}
          ${escapeHtml(`${o.ship_city || ""} ${o.ship_postcode || ""}`.trim())}${(o.ship_city || o.ship_postcode) ? "<br>" : ""}
          ${escapeHtml(String(o.ship_country || "New Zealand"))}
        </p>
      </td>
    </tr></table>`
  : "";

export type EmailType =
  | "order_confirmation" | "order_shipped" | "order_partially_shipped"
  | "refund_confirmation" | "order_cancelled" | "payment_failed"
  | "admin_order_notification";

/** Send a commerce email and record it in shop_notification_log. Never throws. */
export async function sendCommerceEmail(
  supa: any,
  opts: { orderId: string | null; type: EmailType; to: string; subject: string; html: string },
): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Mindcast <hello@mindcast.co.nz>";
  let status: "sent" | "failed" = "failed";
  let messageId: string | null = null;
  let error: string | null = null;

  if (!RESEND_API_KEY) {
    error = "RESEND_API_KEY unset";
  } else {
    try {
      const r = await fetch(RESEND, {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM_EMAIL, to: [opts.to], subject: opts.subject, html: opts.html }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { status = "sent"; messageId = j?.id ?? null; }
      else { error = `Resend ${r.status}: ${JSON.stringify(j).slice(0, 200)}`; }
    } catch (e) {
      error = String(e);
    }
  }

  await supa.from("shop_notification_log").insert({
    order_id: opts.orderId,
    type: opts.type,
    recipient: opts.to,
    status,
    provider_message_id: messageId,
    error,
  }).catch(() => {});

  return status === "sent";
}

/** Log an event onto the immutable order timeline. Never throws. */
export async function orderEvent(
  supa: any,
  opts: { orderId: string; type: string; actorId?: string | null; actorName?: string | null; note?: string | null; metadata?: Record<string, unknown> },
): Promise<void> {
  await supa.from("shop_order_events").insert({
    order_id: opts.orderId,
    type: opts.type,
    actor: opts.actorId ?? null,
    actor_name: opts.actorName ?? null,
    note: opts.note ?? null,
    metadata: opts.metadata ?? {},
  }).catch(() => {});
}

/** Write an audit row. Never throws. */
export async function audit(
  supa: any,
  opts: { actorId: string | null; actorName: string | null; action: string; entity: string; entityId?: string | null; before?: unknown; after?: unknown },
): Promise<void> {
  await supa.from("shop_audit_log").insert({
    actor: opts.actorId,
    actor_name: opts.actorName,
    action: opts.action,
    entity: opts.entity,
    entity_id: opts.entityId ?? null,
    before: opts.before === undefined ? null : opts.before,
    after: opts.after === undefined ? null : opts.after,
  }).catch(() => {});
}

export const emailShell = frame;
