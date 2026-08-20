// Commerce transactional email — Resend + notification log.
// This file is duplicated into each commerce function directory because
// `supabase functions deploy` uploads only the function's own folder.
// Keep the copies identical.

// deno-lint-ignore-file no-explicit-any

export const money = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

const RESEND = "https://api.resend.com/emails";

const frame = (inner: string) => `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a2332;">
  <p style="letter-spacing:0.3em;font-size:12px;color:#8a6d3b;">MINDCAST</p>
  ${inner}
  <p style="margin:28px 0 0;color:#999;font-size:13px;">Mindcast · mindcast.co.nz</p>
</div>`;

export const itemsTable = (
  items: { product_name: string; quantity: number; line_total_cents: number }[],
): string => items.map((it) =>
  `<tr>
    <td style="padding:6px 0;">${it.product_name}${it.quantity > 1 ? ` &times; ${it.quantity}` : ""}</td>
    <td style="padding:6px 0;text-align:right;">${money(it.line_total_cents)}</td>
  </tr>`).join("");

export const addressBlock = (o: any): string => o.ship_name
  ? `<p style="margin:16px 0 4px;color:#555;"><strong>Delivering to</strong><br/>
     ${o.ship_name}<br/>
     ${o.ship_line1 || ""}${o.ship_line2 ? "<br/>" + o.ship_line2 : ""}<br/>
     ${o.ship_city || ""} ${o.ship_postcode || ""}<br/>
     ${o.ship_country || "New Zealand"}</p>`
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
