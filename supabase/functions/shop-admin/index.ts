// shop-admin — every staff commerce action, behind JWT role checks.
//
// The shop_orders guard trigger only lets clients move paid -> collected, so
// everything else (fulfilment, refunds, cancellations, inventory, settings)
// runs here under service role. Every sensitive action lands in the audit
// log and on the order timeline.
//
// Roles (hierarchy encoded in the DB helpers):
//   admin / commerce_admin — everything
//   fulfilment             — pick/pack/ship/tracking, receive & adjust stock, notes
//   support                — resend emails, notes, guest lookup
//   (guest_lookup is public: order number + email must both match)
//
// POST body: { action: string, ...payload }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  addressBlock, audit, emailShell, itemsTable, money, orderEvent, sendCommerceEmail,
} from "./commerce-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

type Ctx = {
  // deno-lint-ignore no-explicit-any
  supa: any;
  userId: string;
  profileId: string | null;
  profileName: string;
  roles: Set<string>;
};

const hasRole = (ctx: Ctx, ...roles: string[]) =>
  roles.some((r) => ctx.roles.has(r)) || ctx.roles.has("admin");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const body = await req.json();
    const action = typeof body?.action === "string" ? body.action : "";
    if (!action) return json({ error: "action is required" }, 400);

    // Guest order lookup is public — order number + email must both match.
    if (action === "guest_lookup") return await guestLookup(supa, body);

    // Everything else requires a staff JWT.
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Not authenticated" }, 401);
    const { data: userRes, error: uErr } = await supa.auth.getUser(jwt);
    if (uErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const { data: roleRows } = await supa
      .from("user_roles").select("role").eq("user_id", userRes.user.id);
    const roles = new Set<string>((roleRows ?? []).map((r: { role: string }) => r.role));
    const { data: profile } = await supa
      .from("profiles").select("id, display_name, is_admin")
      .eq("user_id", userRes.user.id).maybeSingle();
    if (profile?.is_admin) roles.add("admin");
    const ctx: Ctx = {
      supa,
      userId: userRes.user.id,
      profileId: profile?.id ?? null,
      profileName: profile?.display_name || "Staff",
      roles,
    };

    switch (action) {
      // ── order lifecycle ──────────────────────────────────────────────────
      case "mark_picking": return await setFulfilmentStatus(ctx, body, "picking");
      case "mark_packed": return await setFulfilmentStatus(ctx, body, "packed");
      case "mark_delivered": return await setFulfilmentStatus(ctx, body, "delivered");
      case "create_fulfilment": return await createFulfilment(ctx, body);
      case "cancel_order": return await cancelOrder(ctx, body);
      case "refund": return await refundOrder(ctx, body);
      case "note": return await saveNote(ctx, body);
      case "resend_email": return await resendEmail(ctx, body);
      // ── inventory ────────────────────────────────────────────────────────
      case "receive_stock": return await receiveStock(ctx, body);
      case "adjust_stock": return await adjustStock(ctx, body);
      // ── settings ─────────────────────────────────────────────────────────
      case "update_settings": return await updateSettings(ctx, body);
      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

// deno-lint-ignore no-explicit-any
async function getOrder(ctx: Ctx, body: any) {
  const orderId = typeof body?.order_id === "string" ? body.order_id : "";
  if (!orderId) throw new Error("order_id is required");
  const { data: order, error } = await ctx.supa.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("Order not found");
  return order;
}

// ── fulfilment status transitions ────────────────────────────────────────────
const FULFILMENT_FLOW: Record<string, string[]> = {
  picking: ["unfulfilled"],
  packed: ["unfulfilled", "picking"],
  delivered: ["shipped"],
};

// deno-lint-ignore no-explicit-any
async function setFulfilmentStatus(ctx: Ctx, body: any, status: string) {
  if (!hasRole(ctx, "fulfilment", "commerce_admin")) return json({ error: "Fulfilment role required" }, 403);
  const order = await getOrder(ctx, body);
  const allowedFrom = FULFILMENT_FLOW[status] ?? [];
  if (!allowedFrom.includes(order.fulfilment_status)) {
    return json({ error: `Can't move from ${order.fulfilment_status} to ${status}` }, 409);
  }
  const { error } = await ctx.supa.from("shop_orders").update({ fulfilment_status: status }).eq("id", order.id);
  if (error) throw new Error(error.message);
  await orderEvent(ctx.supa, {
    orderId: order.id, type: `fulfilment_${status}`,
    actorId: ctx.profileId, actorName: ctx.profileName,
    note: `Marked ${status} by ${ctx.profileName}`,
  });
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: `fulfilment_status:${status}`, entity: "shop_order", entityId: order.id,
    before: { fulfilment_status: order.fulfilment_status }, after: { fulfilment_status: status },
  });
  return json({ ok: true });
}

// deno-lint-ignore no-explicit-any
async function createFulfilment(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "fulfilment", "commerce_admin")) return json({ error: "Fulfilment role required" }, 403);
  const order = await getOrder(ctx, body);
  if (order.fulfilment !== "ship") return json({ error: "Only shipped-goods orders get fulfilments" }, 400);
  if (!["unfulfilled", "picking", "packed", "fulfilled"].includes(order.fulfilment_status)) {
    return json({ error: `Order is ${order.fulfilment_status}` }, 409);
  }

  const { data: orderItems } = await ctx.supa
    .from("shop_order_items").select("*").eq("order_id", order.id);
  if (!orderItems || orderItems.length === 0) return json({ error: "Order has no items" }, 409);

  // Items being fulfilled in this shipment (defaults: everything not yet fulfilled).
  const { data: priorFulfillments } = await ctx.supa
    .from("shop_fulfillments").select("id").eq("order_id", order.id).neq("status", "cancelled");
  const priorIds = (priorFulfillments ?? []).map((f: { id: string }) => f.id);
  const { data: priorItems } = priorIds.length > 0
    ? await ctx.supa.from("shop_fulfillment_items").select("order_item_id, quantity").in("fulfillment_id", priorIds)
    : { data: [] };
  const fulfilledQty = new Map<string, number>();
  for (const pi of priorItems ?? []) {
    fulfilledQty.set(pi.order_item_id, (fulfilledQty.get(pi.order_item_id) ?? 0) + pi.quantity);
  }

  // deno-lint-ignore no-explicit-any
  const requested: { order_item_id: string; quantity: number }[] = Array.isArray(body?.items) && body.items.length > 0
    ? body.items
    : orderItems
      .filter((it: { id: string; quantity: number }) => (fulfilledQty.get(it.id) ?? 0) < it.quantity)
      .map((it: { id: string; quantity: number }) => ({ order_item_id: it.id, quantity: it.quantity - (fulfilledQty.get(it.id) ?? 0) }));
  if (requested.length === 0) return json({ error: "Everything is already fulfilled" }, 409);

  // Validate quantities against what remains.
  for (const r of requested) {
    const item = orderItems.find((it: { id: string }) => it.id === r.order_item_id);
    if (!item) return json({ error: "Item not on this order" }, 400);
    const remaining = item.quantity - (fulfilledQty.get(item.id) ?? 0);
    if (r.quantity < 1 || r.quantity > remaining) {
      return json({ error: `Only ${remaining} of "${item.product_name}" left to fulfil` }, 400);
    }
  }

  const carrier = typeof body?.carrier === "string" ? body.carrier.trim() : "";
  const trackingNumber = typeof body?.tracking_number === "string" ? body.tracking_number.trim() : "";
  const trackingUrl = typeof body?.tracking_url === "string" ? body.tracking_url.trim() : "";
  const isShipment = Boolean(trackingNumber || carrier);

  const { data: fulfilment, error: fErr } = await ctx.supa
    .from("shop_fulfillments")
    .insert({
      order_id: order.id,
      status: isShipment ? "shipped" : "open",
      carrier: carrier || null,
      tracking_number: trackingNumber || null,
      tracking_url: trackingUrl || null,
      shipped_at: isShipment ? new Date().toISOString() : null,
      created_by: ctx.profileId,
    })
    .select("id").maybeSingle();
  if (fErr) throw new Error(fErr.message);

  const { error: fiErr } = await ctx.supa.from("shop_fulfillment_items").insert(
    requested.map((r) => ({ fulfillment_id: fulfilment.id, order_item_id: r.order_item_id, quantity: r.quantity })),
  );
  if (fiErr) throw new Error(fiErr.message);

  // Fully fulfilled?
  const newFulfilled = new Map(fulfilledQty);
  for (const r of requested) {
    newFulfilled.set(r.order_item_id, (newFulfilled.get(r.order_item_id) ?? 0) + r.quantity);
  }
  const fullyFulfilled = orderItems.every((it: { id: string; quantity: number }) =>
    (newFulfilled.get(it.id) ?? 0) >= it.quantity);

  const newStatus = fullyFulfilled ? "shipped" : order.fulfilment_status === "packed" ? "packed" : "fulfilled";
  await ctx.supa.from("shop_orders").update({
    fulfilment_status: fullyFulfilled ? "shipped" : newStatus,
    ...(fullyFulfilled ? { status: "shipped" } : {}),
  }).eq("id", order.id);

  await orderEvent(ctx.supa, {
    orderId: order.id,
    type: fullyFulfilled ? "fulfilment_shipped" : "fulfilment_partial",
    actorId: ctx.profileId, actorName: ctx.profileName,
    note: fullyFulfilled
      ? `Shipped by ${ctx.profileName}${trackingNumber ? ` — tracking ${trackingNumber}` : ""}`
      : `Partial fulfilment by ${ctx.profileName} (${requested.length} line${requested.length === 1 ? "" : "s"})`,
    metadata: { tracking_number: trackingNumber || null, carrier: carrier || null },
  });
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: "fulfilment_created", entity: "shop_order", entityId: order.id,
    after: { items: requested, tracking_number: trackingNumber || null },
  });

  // Shipping email (full or partial).
  if (isShipment && order.customer_email) {
    const { data: itemRows } = await ctx.supa
      .from("shop_order_items").select("product_name, quantity, line_total_cents").eq("order_id", order.id);
    const shippedNames = requested
      .map((r) => orderItems.find((it: { id: string }) => it.id === r.order_item_id))
      .filter(Boolean)
      // deno-lint-ignore no-explicit-any
      .map((it: any) => `${it.product_name}${r_qty(it, requested) > 1 ? ` ×${r_qty(it, requested)}` : ""}`);
    const html = emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">${fullyFulfilled ? "Your order is on its way" : "Part of your order is on its way"}</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
      ${!fullyFulfilled ? `<p style="font-size:15px;">Shipping now: ${shippedNames.join(", ")}. The rest follows separately.</p>` : ""}
      ${trackingNumber ? `<p style="margin:16px 0;padding:12px 16px;background:#f4f1ea;border-left:3px solid #8a6d3b;">
        ${carrier ? `${carrier} · ` : ""}Tracking: <strong>${trackingNumber}</strong>
        ${trackingUrl ? `<br/><a href="${trackingUrl}" style="color:#1a2332;">Track your delivery</a>` : ""}</p>` : ""}
      ${addressBlock(order)}
      <p style="margin:20px 0 4px;color:#555;">Thank you for supporting Mindcast.</p>
    `);
    const sent = await sendCommerceEmail(ctx.supa, {
      orderId: order.id,
      type: fullyFulfilled ? "order_shipped" : "order_partially_shipped",
      to: order.customer_email,
      subject: fullyFulfilled
        ? `Your MINDCAST order is on its way — #${order.order_number || ""}`
        : `Part of your MINDCAST order is on its way — #${order.order_number || ""}`,
      html,
    });
    if (sent) {
      await ctx.supa.from("shop_orders").update({ shipped_email_sent_at: new Date().toISOString() }).eq("id", order.id);
      await orderEvent(ctx.supa, {
        orderId: order.id, type: "email_sent",
        note: fullyFulfilled ? "Shipping email sent" : "Partial-shipping email sent",
        metadata: { email_type: fullyFulfilled ? "order_shipped" : "order_partially_shipped" },
      });
    }
  }

  return json({ ok: true, shipped: fullyFulfilled, email_sent: Boolean(order.customer_email) });
}

// deno-lint-ignore no-explicit-any
function r_qty(item: any, requested: { order_item_id: string; quantity: number }[]): number {
  return requested.find((r) => r.order_item_id === item.id)?.quantity ?? item.quantity;
}

// ── cancellation ─────────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function cancelOrder(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "commerce_admin")) return json({ error: "Commerce admin required" }, 403);
  const order = await getOrder(ctx, body);
  if (["shipped", "delivered"].includes(order.fulfilment_status)) {
    return json({ error: "Order already shipped — refund it instead" }, 409);
  }
  if (["refunded", "cancelled"].includes(order.payment_status)) {
    return json({ error: `Order already ${order.payment_status}` }, 409);
  }

  // Refund the payment if there is one.
  if (order.stripe_payment_intent && ["paid", "partially_refunded"].includes(order.payment_status)) {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const refund = await stripe.refunds.create(
      {
        payment_intent: order.stripe_payment_intent,
        reason: "requested_by_customer",
        metadata: { order_id: order.id, order_number: order.order_number || "", kind: "cancellation" },
      },
      { idempotencyKey: `cancel-${order.id}` },
    );
    await ctx.supa.from("shop_refunds").insert({
      order_id: order.id,
      amount_cents: order.amount_total_cents - (order.refunded_cents ?? 0),
      reason: "Order cancelled",
      restock: true,
      stripe_refund_id: refund.id,
      status: refund.status === "succeeded" ? "succeeded" : "pending",
      actor: ctx.profileId,
    });
  }

  // Return tracked stock.
  const { data: items } = await ctx.supa
    .from("shop_order_items").select("variant_id, quantity").eq("order_id", order.id);
  for (const it of items ?? []) {
    if (!it.variant_id) continue;
    await ctx.supa.rpc("shop_adjust_stock", {
      p_variant_id: it.variant_id,
      p_delta: it.quantity,
      p_type: "cancelled_order_return",
      p_reason: `Order ${order.order_number} cancelled`,
      p_order_id: order.id,
      p_actor: ctx.profileId,
    }).catch(() => {});
  }

  await ctx.supa.from("shop_orders").update({
    status: "cancelled",
    payment_status: "cancelled",
    fulfilment_status: "cancelled",
    refunded_cents: order.amount_total_cents,
  }).eq("id", order.id);

  await orderEvent(ctx.supa, {
    orderId: order.id, type: "order_cancelled",
    actorId: ctx.profileId, actorName: ctx.profileName,
    note: `Cancelled by ${ctx.profileName}`,
  });
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: "order_cancelled", entity: "shop_order", entityId: order.id,
    before: { status: order.status, payment_status: order.payment_status },
    after: { status: "cancelled" },
  });

  if (order.customer_email) {
    const html = emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">Your order has been cancelled</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
      <p style="font-size:15px;">${order.stripe_payment_intent ? "Any payment has been refunded — allow a few business days for it to appear." : "No payment was taken."}</p>
      <p style="margin:20px 0 4px;color:#555;">If this is unexpected, reply to this email and we'll sort it.</p>
    `);
    await sendCommerceEmail(ctx.supa, {
      orderId: order.id, type: "order_cancelled", to: order.customer_email,
      subject: `Your MINDCAST order was cancelled — #${order.order_number || ""}`, html,
    });
    await orderEvent(ctx.supa, { orderId: order.id, type: "email_sent", note: "Cancellation email sent", metadata: { email_type: "order_cancelled" } });
  }
  return json({ ok: true });
}

// ── refunds ──────────────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function refundOrder(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "commerce_admin")) return json({ error: "Commerce admin required — refunds are separately controlled" }, 403);
  const order = await getOrder(ctx, body);
  if (!order.stripe_payment_intent) return json({ error: "No Stripe payment to refund" }, 400);
  if (order.payment_status === "refunded") return json({ error: "Order already fully refunded" }, 409);

  const { data: orderItems } = await ctx.supa
    .from("shop_order_items").select("*").eq("order_id", order.id);

  // Amount: explicit, or summed from selected items/quantities.
  let amountCents = Number.isInteger(body?.amount_cents) ? Number(body.amount_cents) : 0;
  // deno-lint-ignore no-explicit-any
  const itemSelections: { order_item_id: string; quantity: number }[] = Array.isArray(body?.items) ? body.items : [];
  const refundItems: { order_item_id: string; quantity: number; amount_cents: number; variant_id: string | null }[] = [];
  if (amountCents <= 0 && itemSelections.length > 0) {
    for (const sel of itemSelections) {
      const item = (orderItems ?? []).find((it: { id: string }) => it.id === sel.order_item_id);
      if (!item) return json({ error: "Item not on this order" }, 400);
      const qty = Math.max(1, Math.min(sel.quantity || 1, item.quantity));
      const lineAmount = Math.round(item.unit_price_cents * qty);
      amountCents += lineAmount;
      refundItems.push({ order_item_id: item.id, quantity: qty, amount_cents: lineAmount, variant_id: item.variant_id });
    }
  }
  const refundShipping = body?.refund_shipping === true;
  if (refundShipping) amountCents += order.shipping_cents ?? 0;
  if (amountCents <= 0) return json({ error: "Nothing to refund" }, 400);
  const remaining = order.amount_total_cents - (order.refunded_cents ?? 0);
  if (amountCents > remaining) return json({ error: `Only ${money(remaining)} left to refund` }, 400);

  const restock = body?.restock === true;
  const reason = typeof body?.reason === "string" ? body.reason.slice(0, 500) : "";

  // Record the refund as pending BEFORE calling Stripe so a racing webhook
  // can see it and not double-record.
  const { data: refundRow, error: rErr } = await ctx.supa
    .from("shop_refunds")
    .insert({
      order_id: order.id, amount_cents: amountCents,
      shipping_cents: refundShipping ? (order.shipping_cents ?? 0) : 0,
      reason: reason || null, items: refundItems, restock,
      status: "pending", actor: ctx.profileId,
    })
    .select("id").maybeSingle();
  if (rErr) throw new Error(rErr.message);

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
  try {
    const refund = await stripe.refunds.create(
      {
        payment_intent: order.stripe_payment_intent,
        amount: amountCents,
        reason: "requested_by_customer",
        metadata: { order_id: order.id, order_number: order.order_number || "", refund_row: refundRow.id },
      },
      { idempotencyKey: `refund-${refundRow.id}` },
    );
    await ctx.supa.from("shop_refunds").update({
      status: refund.status === "succeeded" ? "succeeded" : "pending",
      stripe_refund_id: refund.id,
    }).eq("id", refundRow.id);
  } catch (e) {
    await ctx.supa.from("shop_refunds").update({ status: "failed" }).eq("id", refundRow.id);
    throw e;
  }

  // Financials.
  const newRefunded = (order.refunded_cents ?? 0) + amountCents;
  const isFull = newRefunded >= order.amount_total_cents;
  await ctx.supa.from("shop_orders").update({
    refunded_cents: newRefunded,
    payment_status: isFull ? "refunded" : "partially_refunded",
    ...(isFull ? { status: "refunded" } : {}),
  }).eq("id", order.id);
  await ctx.supa.from("shop_payments").insert({
    order_id: order.id, kind: "refund", amount_cents: amountCents,
    currency: order.currency, status: "succeeded",
  });

  // Restock only when explicitly asked — a refund is not a return.
  if (restock) {
    for (const ri of refundItems) {
      if (!ri.variant_id) continue;
      await ctx.supa.rpc("shop_adjust_stock", {
        p_variant_id: ri.variant_id,
        p_delta: ri.quantity,
        p_type: "customer_return",
        p_reason: `Refund with restock — ${order.order_number}`,
        p_order_id: order.id,
        p_actor: ctx.profileId,
      }).catch(() => {});
    }
  }

  await orderEvent(ctx.supa, {
    orderId: order.id, type: "refund_issued",
    actorId: ctx.profileId, actorName: ctx.profileName,
    note: `${isFull ? "Full" : "Partial"} refund of ${money(amountCents)} by ${ctx.profileName}${restock ? " (items restocked)" : ""}`,
    metadata: { amount_cents: amountCents, restock, full: isFull },
  });
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: "refund_issued", entity: "shop_order", entityId: order.id,
    before: { refunded_cents: order.refunded_cents ?? 0 },
    after: { refunded_cents: newRefunded, amount_cents: amountCents, restock },
  });

  // Refund email.
  if (order.customer_email) {
    const html = emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">Your refund has been processed</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
      <p style="font-size:15px;">${money(amountCents)} has been refunded to your original payment method. It can take a few business days to appear.</p>
      ${isFull ? `<p style="font-size:15px;color:#555;">This order has been fully refunded.</p>` : ""}
      <p style="margin:20px 0 4px;color:#555;">Questions about this refund? Reply to this email.</p>
    `);
    await sendCommerceEmail(ctx.supa, {
      orderId: order.id, type: "refund_confirmation", to: order.customer_email,
      subject: `Your MINDCAST refund — #${order.order_number || ""}`, html,
    });
    await orderEvent(ctx.supa, { orderId: order.id, type: "email_sent", note: "Refund confirmation email sent", metadata: { email_type: "refund_confirmation" } });
  }
  return json({ ok: true, refunded_cents: amountCents, full: isFull });
}

// ── notes + emails ───────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function saveNote(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "support", "fulfilment", "commerce_admin")) return json({ error: "Commerce role required" }, 403);
  const order = await getOrder(ctx, body);
  const note = typeof body?.note === "string" ? body.note.slice(0, 2000) : "";
  await ctx.supa.from("shop_orders").update({ note }).eq("id", order.id);
  await orderEvent(ctx.supa, {
    orderId: order.id, type: "note_added",
    actorId: ctx.profileId, actorName: ctx.profileName, note: note.slice(0, 200),
  });
  return json({ ok: true });
}

// deno-lint-ignore no-explicit-any
async function resendEmail(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "support", "fulfilment", "commerce_admin")) return json({ error: "Commerce role required" }, 403);
  const order = await getOrder(ctx, body);
  const kind = body?.kind === "shipped" ? "order_shipped" : "order_confirmation";
  if (!order.customer_email) return json({ error: "No customer email on this order" }, 400);

  const { data: itemRows } = await ctx.supa
    .from("shop_order_items").select("product_name, quantity, line_total_cents").eq("order_id", order.id);
  const rows = itemRows && itemRows.length > 0
    ? itemRows
    : [{ product_name: order.product_name, quantity: order.quantity, line_total_cents: order.unit_price_cents * order.quantity }];

  const html = kind === "order_shipped"
    ? emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">Your order is on its way</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
      ${order.tracking_number ? `<p style="margin:16px 0;padding:12px 16px;background:#f4f1ea;border-left:3px solid #8a6d3b;">Tracking: <strong>${order.tracking_number}</strong>${order.tracking_url ? `<br/><a href="${order.tracking_url}" style="color:#1a2332;">Track your delivery</a>` : ""}</p>` : ""}
      ${addressBlock(order)}
    `)
    : emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">Thank you — we've received your order</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        ${itemsTable(rows)}
        <tr>
          <td style="padding:10px 0;border-top:1px solid #ddd;"><strong>Total (incl. GST)</strong></td>
          <td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;"><strong>${money(order.amount_total_cents)}</strong></td>
        </tr>
      </table>
      ${order.fulfilment === "ship" ? addressBlock(order) : `<p style="margin:16px 0 4px;color:#555;">Collect at the Mindcast counter — pickup code <strong>${order.pickup_code}</strong>.</p>`}
    `);

  const sent = await sendCommerceEmail(ctx.supa, {
    orderId: order.id, type: kind, to: order.customer_email,
    subject: kind === "order_shipped"
      ? `Your MINDCAST order is on its way — #${order.order_number || ""}`
      : `We've received your MINDCAST order — #${order.order_number || ""}`,
    html,
  });
  if (sent) {
    await orderEvent(ctx.supa, {
      orderId: order.id, type: "email_sent",
      actorId: ctx.profileId, actorName: ctx.profileName,
      note: `${kind === "order_shipped" ? "Shipping" : "Confirmation"} email resent by ${ctx.profileName}`,
      metadata: { email_type: kind, resent: true },
    });
  }
  return sent ? json({ ok: true }) : json({ error: "Email could not be sent" }, 502);
}

// ── inventory ────────────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function receiveStock(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "fulfilment", "commerce_admin")) return json({ error: "Fulfilment role required" }, 403);
  const variantId = typeof body?.variant_id === "string" ? body.variant_id : "";
  const quantity = Number.isInteger(body?.quantity) ? Number(body.quantity) : 0;
  if (!variantId || quantity < 1) return json({ error: "variant_id and a positive quantity are required" }, 400);
  const supplier = typeof body?.supplier === "string" ? body.supplier.slice(0, 200) : "";
  const reference = typeof body?.reference === "string" ? body.reference.slice(0, 200) : "";
  const note = typeof body?.note === "string" ? body.note.slice(0, 500) : "";

  const { error } = await ctx.supa.rpc("shop_adjust_stock", {
    p_variant_id: variantId,
    p_delta: quantity,
    p_type: "received_stock",
    p_reason: [supplier && `Supplier: ${supplier}`, reference && `Ref: ${reference}`].filter(Boolean).join(" · ") || "Stock received",
    p_note: note || null,
    p_actor: ctx.profileId,
  });
  if (error) throw new Error(error.message);
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: "stock_received", entity: "shop_product_variant", entityId: variantId,
    after: { quantity, supplier: supplier || null, reference: reference || null },
  });
  return json({ ok: true });
}

// deno-lint-ignore no-explicit-any
async function adjustStock(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "commerce_admin")) return json({ error: "Commerce admin required" }, 403);
  const variantId = typeof body?.variant_id === "string" ? body.variant_id : "";
  const delta = Number.isInteger(body?.delta) ? Number(body.delta) : 0;
  const type = typeof body?.type === "string" ? body.type : "manual_adjustment";
  const allowed = ["manual_adjustment", "damaged", "missing", "stocktake_adjustment", "customer_return"];
  if (!variantId || delta === 0 || !allowed.includes(type)) {
    return json({ error: "variant_id, non-zero delta and a valid type are required" }, 400);
  }
  const reason = typeof body?.reason === "string" ? body.reason.slice(0, 500) : "";
  const { data: before } = await ctx.supa
    .from("shop_product_variants").select("stock_available, sku").eq("id", variantId).maybeSingle();

  const { error } = await ctx.supa.rpc("shop_adjust_stock", {
    p_variant_id: variantId, p_delta: delta, p_type: type,
    p_reason: reason || null, p_actor: ctx.profileId,
  });
  if (error) throw new Error(error.message);
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: `stock_adjusted:${type}`, entity: "shop_product_variant", entityId: variantId,
    before: { stock: before?.stock_available }, after: { stock: (before?.stock_available ?? 0) + delta, delta, reason: reason || null },
  });
  return json({ ok: true });
}

// ── settings ─────────────────────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function updateSettings(ctx: Ctx, body: any) {
  if (!hasRole(ctx, "commerce_admin")) return json({ error: "Commerce admin required" }, 403);
  const key = typeof body?.key === "string" ? body.key : "";
  const value = typeof body?.value === "string" ? body.value : "";
  const allowed = ["shipping_flat_cents", "free_shipping_threshold_cents", "pickup_enabled", "shipping_countries", "currency"];
  if (!allowed.includes(key) || !value) return json({ error: "Invalid setting" }, 400);
  const { data: before } = await ctx.supa.from("shop_settings").select("value").eq("key", key).maybeSingle();
  await ctx.supa.from("shop_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  await audit(ctx.supa, {
    actorId: ctx.profileId, actorName: ctx.profileName,
    action: "setting_changed", entity: "shop_settings", entityId: key,
    before: { value: before?.value ?? null }, after: { value },
  });
  return json({ ok: true });
}

// ── guest lookup (public) ───────────────────────────────────────────────────
// deno-lint-ignore no-explicit-any
async function guestLookup(supa: any, body: any) {
  const orderNumber = typeof body?.order_number === "string" ? body.order_number.trim().toUpperCase() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!orderNumber || !email) return json({ error: "Order number and email are both required" }, 400);

  const { data: order } = await supa
    .from("shop_orders")
    .select("id, order_number, product_name, quantity, amount_total_cents, currency, fulfilment, status, payment_status, fulfilment_status, tracking_number, tracking_url, shipped_at, ship_name, ship_city, created_at, customer_email")
    .eq("order_number", orderNumber)
    .maybeSingle();
  // Never reveal whether the order exists without an email match.
  if (!order || (order.customer_email || "").toLowerCase() !== email) {
    return json({ error: "No order matches those details" }, 404);
  }
  const { data: items } = await supa
    .from("shop_order_items")
    .select("product_name, quantity, line_total_cents")
    .eq("order_id", order.id);
  return json({
    order: {
      order_number: order.order_number,
      created_at: order.created_at,
      amount_total_cents: order.amount_total_cents,
      currency: order.currency,
      payment_status: order.payment_status,
      fulfilment_status: order.fulfilment_status,
      tracking_number: order.tracking_number,
      tracking_url: order.tracking_url,
      shipped_at: order.shipped_at,
      items: items ?? [],
    },
  });
}
