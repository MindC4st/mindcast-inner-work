// stripe-webhook — single source of truth for money events.
//
// Two responsibilities:
//   1. Membership subscriptions (multi-tier model, Jul 2026) — upserts
//      subscriptions and refreshes entitlements.
//   2. Commerce — orders are written HERE when Stripe confirms payment, never
//      at checkout time. Webhooks are authenticated (signature), idempotent
//      (stripe_session_id unique + processed-event guard) and retry-safe.
//
// verify_jwt MUST be false; signature verification via stripe-signature header.
//
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, FROM_EMAIL

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  addressBlock, audit, emailShell, itemsTable, money, orderEvent, sendCommerceEmail,
} from "./commerce-email.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});
const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

/** Determine which tier a price ID corresponds to by looking at its metadata. */
async function resolveTier(priceId: string): Promise<string> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    const meta = price.metadata as Record<string, string>;
    return meta?.tier || "adult"; // default to adult
  } catch {
    return "adult";
  }
}

/** Parse the bundle from metadata, falling back to inspecting line items. */
async function parseBundle(sub: Stripe.Subscription): Promise<{
  adults: number;
  teens: number;
  children: number;
  familyDiscount: boolean;
  plan: string;
}> {
  const meta = sub.metadata as Record<string, string>;

  // Preferred: metadata written at checkout time
  const count = (value: string | undefined) => Math.max(0, parseInt(value || "0", 10) || 0);
  const adults = count(meta?.adults);
  const teens = count(meta?.teens);
  const children = count(meta?.children);
  const plan = meta?.plan || "monthly";

  // If metadata has explicit bundle counts, use them
  if (adults > 0 || teens > 0 || children > 0) {
    return {
      adults, teens, children,
      familyDiscount: meta?.family_discount === "true",
      plan,
    };
  }

  // Fallback: inspect each line item's price metadata
  const items = sub.items?.data || [];
  let ad = 0, te = 0, ch = 0;
  for (const item of items) {
    const pid = item.price?.id;
    const qty = item.quantity ?? 1;
    if (!pid) continue;
    const tier = await resolveTier(pid);
    if (tier === "teen") te += qty;
    else if (tier === "child") ch += qty;
    else ad += qty;
  }

  return {
    adults: ad, teens: te, children: ch,
    familyDiscount: ad >= 2 && (te >= 1 || ch >= 1),
    plan,
  };
}

// Map a raw Stripe subscription status to the profiles.membership_status enum.
const toMembershipStatus = (s: string): string => {
  switch (s) {
    case "active":
    case "trialing":
      return s;
    case "past_due":
    case "unpaid":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
    case "incomplete_expired":
      return "lapsed";
    default:
      return "none";
  }
};

async function refreshEntitlements(householdId: string | null, profileId: string | null) {
  if (!householdId && !profileId) return;
  const { error } = await admin.rpc("refresh_membership_entitlements", {
    p_household: householdId,
    p_profile: householdId ? null : profileId,
  });
  if (error) throw new Error(`Entitlement refresh failed: ${error.message}`);
}

async function syncSubscription(sub: Stripe.Subscription) {
  const meta = sub.metadata as Record<string, string>;

  // Read the existing owner first. Older subscriptions may predate metadata,
  // but the database row still tells us whose entitlement must be refreshed.
  const { data: previous, error: previousError } = await admin
    .from("subscriptions")
    .select("profile_id, household_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (previousError) throw new Error(`Subscription lookup failed: ${previousError.message}`);

  const profileId = meta?.profile_id || previous?.profile_id || null;
  const householdId = meta?.household_id || previous?.household_id || null;
  if (!profileId && !householdId) {
    throw new Error(`Subscription ${sub.id} has no profile or household owner`);
  }

  const bundle = await parseBundle(sub);
  const highestTier = bundle.children > 0 ? "child" : bundle.teens > 0 ? "teen" : "adult";

  const { error: upsertError } = await admin.from("subscriptions").upsert(
    {
      profile_id: profileId,
      household_id: householdId,
      stripe_customer_id: String(sub.customer),
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan: bundle.plan,
      tier: highestTier,
      price_id: sub.items?.data?.[0]?.price?.id ?? null,
      quantity: 1,
      bundle_adults: bundle.adults,
      bundle_teens: bundle.teens,
      bundle_children: bundle.children,
      family_discount: bundle.familyDiscount,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (upsertError) throw new Error(`Subscription upsert failed: ${upsertError.message}`);

  await refreshEntitlements(householdId, profileId);

  const previousHousehold = previous?.household_id ?? null;
  const previousProfile = previous?.profile_id ?? null;
  if (previousHousehold && previousHousehold !== householdId) {
    await refreshEntitlements(previousHousehold, null);
  } else if (!previousHousehold && previousProfile &&
      (householdId !== null || previousProfile !== profileId)) {
    await refreshEntitlements(null, previousProfile);
  }

  // Preserve useful billing state for a payer whose last active entitlement
  // just ended, without overwriting access from another active subscription.
  if (profileId && sub.status !== "active" && sub.status !== "trialing") {
    const { data: payer, error: payerError } = await admin
      .from("profiles")
      .select("membership_status")
      .eq("id", profileId)
      .maybeSingle();
    if (payerError) throw new Error(`Payer lookup failed: ${payerError.message}`);

    if (payer && !["active", "trialing"].includes(payer.membership_status)) {
      const { error: statusError } = await admin
        .from("profiles")
        .update({ membership_status: toMembershipStatus(sub.status) })
        .eq("id", profileId);
      if (statusError) throw new Error(`Payer status update failed: ${statusError.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// COMMERCE — the order row is created HERE, not at checkout time, so an order
// only ever exists against a payment Stripe has confirmed. Idempotency comes
// from the UNIQUE stripe_session_id (duplicate deliveries are no-ops that
// re-attempt only unsent emails) plus processed-event bookkeeping below.
// ---------------------------------------------------------------------------
type ShopItem = {
  productId: string | null;
  variantId: string | null;
  slug: string;
  sku: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

/** Expand the session's line items and map them back to our catalogue. */
async function shopLineItems(sessionId: string): Promise<ShopItem[]> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  const items: ShopItem[] = [];
  for (const li of session.line_items?.data ?? []) {
    const meta = ((li.price?.product as Stripe.Product | undefined)?.metadata ?? {}) as Record<string, string>;
    // Discount lines carry no product metadata — skip them (the discount is
    // recorded from the session metadata amounts).
    if (!meta.product_id && !meta.slug) continue;
    items.push({
      productId: meta.product_id || null,
      variantId: meta.variant_id || null,
      slug: meta.slug || "",
      sku: meta.sku || "",
      name: li.description || "Mindcast product",
      unitPriceCents: li.amount_total && li.quantity
        ? Math.round(li.amount_total / li.quantity)
        : (li.price?.unit_amount ?? 0),
      quantity: li.quantity ?? 1,
    });
  }
  return items;
}

/** Idempotency guard for arbitrary Stripe events (refunds, failures). */
async function eventAlreadyProcessed(eventId: string): Promise<boolean> {
  const { data } = await admin
    .from("shop_order_events")
    .select("id")
    .eq("type", "stripe_event_processed")
    .filter("metadata->>event_id", "eq", eventId)
    .limit(1);
  return Boolean(data && data.length > 0);
}
async function markEventProcessed(orderId: string, eventId: string, kind: string) {
  await orderEvent(admin, {
    orderId,
    type: "stripe_event_processed",
    note: `${kind} (${eventId})`,
    metadata: { event_id: eventId, kind },
  });
}

/** Upsert the commerce customer (member by profile, guest by email). */
async function upsertCustomer(profileId: string | null, email: string | null, name: string | null): Promise<string | null> {
  if (!profileId && !email) return null;
  const first = name?.split(" ").slice(0, -1).join(" ") || null;
  const last = name?.split(" ").slice(-1)[0] || null;
  if (profileId) {
    const { data } = await admin
      .from("shop_customers")
      .upsert({ profile_id: profileId, email, first_name: first, last_name: last }, { onConflict: "profile_id" })
      .select("id").maybeSingle();
    return data?.id ?? null;
  }
  const { data: existing } = await admin
    .from("shop_customers").select("id").eq("email", email).is("profile_id", null).maybeSingle();
  if (existing) return existing.id;
  const { data: created } = await admin
    .from("shop_customers")
    .insert({ email, first_name: first, last_name: last })
    .select("id").maybeSingle();
  return created?.id ?? null;
}

async function recordShopOrder(s: Stripe.Checkout.Session) {
  const meta = (s.metadata ?? {}) as Record<string, string>;
  const isShipped = meta.fulfilment === "ship";
  const email = s.customer_details?.email || s.customer_email || null;
  const name = s.customer_details?.name || s.shipping_details?.name || null;

  const amountTotal = typeof s.amount_total === "number"
    ? s.amount_total
    : (parseInt(meta.subtotal_cents || "0", 10) || 0);
  const discountCents = parseInt(meta.discount_cents || "0", 10) || 0;
  const shippingCents = isShipped ? ((s.shipping_cost?.amount ?? parseInt(meta.shipping_cents || "0", 10)) || 0) : 0;
  const gstCents = parseInt(meta.gst_cents || "0", 10) || 0;

  const items = await shopLineItems(s.id);
  const itemCount = items.reduce((n, it) => n + it.quantity, 0) || 1;
  const firstName = items[0]?.name || "Mindcast product";
  const productName = items.length > 1 ? `${firstName} + ${items.length - 1} more` : firstName;

  const customerId = await upsertCustomer(meta.profile_id || null, email, name);

  // stripe_session_id is UNIQUE and Stripe retries deliveries: a duplicate
  // delivery skips creation and re-attempts only the confirmation email.
  const { data: inserted, error } = await admin.from("shop_orders").upsert(
    {
      profile_id: meta.profile_id || null,
      customer_id: customerId,
      product_id: items[0]?.productId || null,
      product_name: productName,
      unit_price_cents: items[0]?.unitPriceCents ?? 0,
      quantity: itemCount,
      amount_total_cents: amountTotal,
      shipping_cents: shippingCents,
      discount_cents: discountCents,
      discount_code: meta.discount_code || null,
      gst_cents: gstCents,
      currency: (s.currency || "nzd").toLowerCase(),
      fulfilment: isShipped ? "ship" : (meta.fulfilment === "partner" ? "partner" : "counter"),
      partner_name: meta.partner_name || null,
      scheduled_session_id: meta.scheduled_session_id || null,
      stripe_session_id: s.id,
      stripe_payment_intent: s.payment_intent ? String(s.payment_intent) : null,
      status: "paid",
      payment_status: "paid",
      fulfilment_status: "unfulfilled",
      note: meta.order_note || null,
      customer_email: email,
      customer_first_name: name?.split(" ").slice(0, -1).join(" ") || null,
      customer_last_name: name?.split(" ").slice(-1)[0] || null,
      customer_phone: s.customer_details?.phone || null,
      ship_name: s.shipping_details?.name || null,
      ship_line1: s.shipping_details?.address?.line1 || null,
      ship_line2: s.shipping_details?.address?.line2 || null,
      ship_city: s.shipping_details?.address?.city || null,
      ship_postcode: s.shipping_details?.address?.postal_code || null,
      ship_country: s.shipping_details?.address?.country || null,
      // Billing defaults to shipping (Stripe Checkout collects one address).
      bill_name: s.shipping_details?.name || name,
      bill_line1: s.shipping_details?.address?.line1 || null,
      bill_line2: s.shipping_details?.address?.line2 || null,
      bill_city: s.shipping_details?.address?.city || null,
      bill_postcode: s.shipping_details?.address?.postal_code || null,
      bill_country: s.shipping_details?.address?.country || null,
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true },
  ).select("id, order_number").maybeSingle();
  if (error) throw error;

  let orderId: string;
  let orderNumber: string | null;
  let isNew = false;

  if (inserted) {
    isNew = true;
    orderId = inserted.id;
    orderNumber = inserted.order_number;

    // Order items with snapshots (variant, SKU, GST component per line).
    if (items.length > 0) {
      const { error: itemsError } = await admin.from("shop_order_items").insert(
        items.map((it) => ({
          order_id: orderId,
          product_id: it.productId,
          variant_id: it.variantId,
          slug: it.slug,
          sku: it.sku,
          product_name: it.name,
          unit_price_cents: it.unitPriceCents,
          quantity: it.quantity,
          line_total_cents: it.unitPriceCents * it.quantity,
          gst_cents: Math.round(it.unitPriceCents * it.quantity * 15 / 115),
        })),
      );
      if (itemsError) throw new Error(`Order items insert failed: ${itemsError.message}`);
    }

    // Inventory: convert the checkout reservation into committed sales.
    const { error: convError } = await admin.rpc("shop_convert_reservation", {
      p_session_key: s.id,
      p_order_id: orderId,
    });
    if (convError) throw new Error(`Stock conversion failed: ${convError.message}`);

    // Discount redemption — the unique (discount_id, order_id) constraint
    // makes this retry-safe: only the first delivery increments the counter.
    if (meta.discount_id) {
      const { data: redemption, error: redErr } = await admin
        .from("shop_discount_redemptions")
        .upsert({ discount_id: meta.discount_id, order_id: orderId }, { ignoreDuplicates: true })
        .select("id");
      if (!redErr && redemption && redemption.length > 0) {
        await admin.rpc("shop_increment_discount", { p_discount_id: meta.discount_id }).catch(() => {});
      }
    }

    // Payments ledger.
    await admin.from("shop_payments").insert({
      order_id: orderId,
      kind: "payment",
      amount_cents: amountTotal,
      currency: (s.currency || "nzd").toLowerCase(),
      status: "succeeded",
      stripe_id: s.payment_intent ? String(s.payment_intent) : s.id,
    }).catch(() => {});

    // Timeline.
    await orderEvent(admin, {
      orderId, type: "order_placed",
      note: `Order placed — ${itemCount} item${itemCount === 1 ? "" : "s"}`,
      metadata: { item_count: itemCount, amount_total_cents: amountTotal },
    });
    await orderEvent(admin, {
      orderId, type: "payment_confirmed",
      note: "Stripe payment confirmed",
      metadata: { stripe_session_id: s.id },
    });
  } else {
    const { data: existing } = await admin
      .from("shop_orders").select("id, order_number").eq("stripe_session_id", s.id).maybeSingle();
    if (!existing) return;
    orderId = existing.id;
    orderNumber = existing.order_number;
  }

  // Confirmation email — idempotent via confirmation_email_sent_at.
  const { data: orderRow } = await admin.from("shop_orders").select("*").eq("id", orderId).maybeSingle();
  if (orderRow && email && !orderRow.confirmation_email_sent_at) {
    const { data: itemRows } = await admin
      .from("shop_order_items").select("product_name, quantity, line_total_cents")
      .eq("order_id", orderId).order("created_at");
    const rows = itemRows && itemRows.length > 0
      ? itemRows
      : [{ product_name: orderRow.product_name, quantity: orderRow.quantity, line_total_cents: orderRow.unit_price_cents * orderRow.quantity }];
    const html = emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">Thank you — we've received your order</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${orderNumber || ""} · ${new Date(orderRow.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        ${itemsTable(rows)}
        ${orderRow.discount_cents > 0 ? `<tr><td style="padding:6px 0;color:#555;">Discount${orderRow.discount_code ? ` (${orderRow.discount_code})` : ""}</td><td style="padding:6px 0;text-align:right;">−${money(orderRow.discount_cents)}</td></tr>` : ""}
        ${isShipped ? `<tr><td style="padding:6px 0;color:#555;">Shipping</td><td style="padding:6px 0;text-align:right;">${orderRow.shipping_cents > 0 ? money(orderRow.shipping_cents) : "Free"}</td></tr>` : ""}
        <tr>
          <td style="padding:10px 0;border-top:1px solid #ddd;"><strong>Total (incl. GST)</strong></td>
          <td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;"><strong>${money(orderRow.amount_total_cents)}</strong></td>
        </tr>
      </table>
      ${isShipped ? addressBlock(orderRow) : `<p style="margin:16px 0 4px;color:#555;">Collect at the Mindcast counter — show your pickup code <strong>${orderRow.pickup_code}</strong>.</p>`}
      <p style="margin:20px 0 4px;color:#555;">${isShipped ? "We'll email you again when your order ships." : "We'll have it ready for you."} Prices are in NZD and include GST.</p>
    `);
    const sent = await sendCommerceEmail(admin, {
      orderId,
      type: "order_confirmation",
      to: email,
      subject: `We've received your MINDCAST order — #${orderNumber || ""}`,
      html,
    });
    if (sent) {
      await admin.from("shop_orders").update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", orderId);
      await orderEvent(admin, { orderId, type: "email_sent", note: "Order confirmation email sent", metadata: { email_type: "order_confirmation" } });
    } else if (isNew) {
      // A failed email must surface so Stripe redelivers and we retry it.
      throw new Error("Order confirmation email could not be sent");
    }
  }

  // Admin notification — ping orders@mindcast.co.nz once per new order, so the
  // team knows to prepare pickup / ship the moment payment is confirmed.
  // Idempotent via admin_notified_at (Stripe redelivers webhooks).
  if (orderRow && !orderRow.admin_notified_at) {
    const ORDERS_EMAIL = Deno.env.get("ORDERS_EMAIL") || "orders@mindcast.co.nz";
    const { data: adminItems } = await admin
      .from("shop_order_items").select("product_name, quantity, line_total_cents")
      .eq("order_id", orderId).order("created_at");
    const adminRows = adminItems && adminItems.length > 0
      ? adminItems
      : [{ product_name: orderRow.product_name, quantity: orderRow.quantity, line_total_cents: orderRow.unit_price_cents * orderRow.quantity }];
    const customerName = [orderRow.customer_first_name, orderRow.customer_last_name]
      .filter(Boolean).join(" ") || "Unknown customer";
    const adminHtml = emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">New order — #${orderNumber || ""}</h1>
      <p style="color:#555;margin:0 0 16px;">${customerName} · ${orderRow.customer_email || "no email on file"}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        ${itemsTable(adminRows)}
        ${orderRow.discount_cents > 0 ? `<tr><td style="padding:6px 0;color:#555;">Discount${orderRow.discount_code ? ` (${orderRow.discount_code})` : ""}</td><td style="padding:6px 0;text-align:right;">−${money(orderRow.discount_cents)}</td></tr>` : ""}
        ${isShipped ? `<tr><td style="padding:6px 0;color:#555;">Shipping</td><td style="padding:6px 0;text-align:right;">${orderRow.shipping_cents > 0 ? money(orderRow.shipping_cents) : "Free"}</td></tr>` : ""}
        <tr>
          <td style="padding:10px 0;border-top:1px solid #ddd;"><strong>Total (incl. GST)</strong></td>
          <td style="padding:10px 0;border-top:1px solid #ddd;text-align:right;"><strong>${money(orderRow.amount_total_cents)}</strong></td>
        </tr>
      </table>
      ${isShipped ? addressBlock(orderRow) : `<p style="margin:16px 0 4px;color:#555;">Pickup code <strong>${orderRow.pickup_code}</strong>.</p>`}
    `);
    const notified = await sendCommerceEmail(admin, {
      orderId,
      type: "admin_order_notification",
      to: ORDERS_EMAIL,
      subject: `New MINDCAST order — #${orderNumber || ""}`,
      html: adminHtml,
    });
    if (notified) {
      await admin.from("shop_orders").update({ admin_notified_at: new Date().toISOString() }).eq("id", orderId);
      await orderEvent(admin, { orderId, type: "admin_notified", note: "New-order notification sent to admin", metadata: { email_type: "admin_order_notification" } });
    }
  }
}

/** Checkout expired or async payment failed — release the stock hold. */
async function releaseShopReservation(s: Stripe.Checkout.Session, kind: string) {
  if ((s.metadata as Record<string, string>)?.kind !== "shop") return;
  await admin.rpc("shop_release_reservation", { p_session_key: s.id }).catch(() => {});
  const { data: order } = await admin.from("shop_orders").select("id").eq("stripe_session_id", s.id).maybeSingle();
  if (order) {
    await orderEvent(admin, { orderId: order.id, type: kind === "expired" ? "checkout_expired" : "payment_failed", note: kind === "expired" ? "Checkout expired — stock released" : "Payment failed — stock released" });
  }
}

/** Refund reconciliation — covers refunds issued by us AND from Stripe dashboard. */
async function reconcileRefund(charge: Stripe.Charge, eventId: string) {
  const pi = charge.payment_intent ? String(charge.payment_intent) : null;
  if (!pi) return;
  const { data: order } = await admin
    .from("shop_orders").select("*").eq("stripe_payment_intent", pi).maybeSingle();
  if (!order) return;
  if (await eventAlreadyProcessed(eventId)) return;

  const refundedTotal = charge.amount_refunded ?? 0;
  const isFull = refundedTotal >= charge.amount;
  const previouslyRecorded = order.refunded_cents ?? 0;
  const delta = Math.max(0, refundedTotal - previouslyRecorded);

  // Record the refund if we didn't create it ourselves (dashboard refund).
  if (delta > 0) {
    const { data: existingRefund } = await admin
      .from("shop_refunds").select("id").eq("order_id", order.id)
      .filter("stripe_refund_id", "eq", pi).limit(1);
    if (!existingRefund || existingRefund.length === 0) {
      await admin.from("shop_refunds").insert({
        order_id: order.id,
        amount_cents: delta,
        reason: "Refunded via Stripe dashboard",
        stripe_refund_id: pi,
        status: "succeeded",
      }).catch(() => {});
    }
  }

  const paymentStatus = isFull ? "refunded" : (refundedTotal > 0 ? "partially_refunded" : order.payment_status);
  await admin.from("shop_orders").update({
    refunded_cents: refundedTotal,
    payment_status: paymentStatus,
    ...(isFull ? { status: "refunded" } : {}),
  }).eq("id", order.id);

  await admin.from("shop_payments").insert({
    order_id: order.id,
    kind: "refund",
    amount_cents: delta,
    currency: order.currency,
    status: "succeeded",
    stripe_id: pi,
  }).catch(() => {});

  await orderEvent(admin, {
    orderId: order.id,
    type: "refund_confirmed",
    note: `${isFull ? "Full" : "Partial"} refund confirmed — ${money(refundedTotal)} of ${money(charge.amount)}`,
    metadata: { refunded_cents: refundedTotal, full: isFull },
  });
  await markEventProcessed(order.id, eventId, "charge.refunded");

  // Refund confirmation email (once per refund event).
  if (order.customer_email && delta > 0) {
    const html = emailShell(`
      <h1 style="font-size:22px;margin:8px 0 4px;">Your refund has been processed</h1>
      <p style="color:#555;margin:0 0 16px;">Order ${order.order_number || ""}</p>
      <p style="font-size:15px;">${money(delta)} has been refunded to your original payment method. It can take a few business days to appear.</p>
      ${isFull ? `<p style="font-size:15px;color:#555;">This order has been fully refunded.</p>` : ""}
      <p style="margin:20px 0 4px;color:#555;">If you have questions about this refund, reply to this email.</p>
    `);
    const sent = await sendCommerceEmail(admin, {
      orderId: order.id,
      type: "refund_confirmation",
      to: order.customer_email,
      subject: `Your MINDCAST refund — #${order.order_number || ""}`,
      html,
    });
    if (sent) {
      await orderEvent(admin, { orderId: order.id, type: "email_sent", note: "Refund confirmation email sent", metadata: { email_type: "refund_confirmation" } });
    }
  }
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  if (!sig || !secret) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (e: any) {
    return new Response(`Signature verification failed: ${e?.message ?? e}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode === "subscription" && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(String(s.subscription));
          // Carry checkout metadata onto the subscription if Stripe didn't copy it
          sub.metadata = { ...(s.metadata as any), ...(sub.metadata as any) };
          await syncSubscription(sub);
        } else if (s.mode === "payment" && (s.metadata as any)?.kind === "shop") {
          await recordShopOrder(s);
        }
        break;
      }
      // Stock holds released when a checkout dies without paying.
      case "checkout.session.expired": {
        await releaseShopReservation(event.data.object as Stripe.Checkout.Session, "expired");
        break;
      }
      case "checkout.session.async_payment_failed": {
        await releaseShopReservation(event.data.object as Stripe.Checkout.Session, "payment_failed");
        break;
      }
      // A refunded payment must stop reading as a valid pickup and must keep
      // the financial ledger accurate. Idempotent via event bookkeeping.
      case "charge.refunded": {
        await reconcileRefund(event.data.object as Stripe.Charge, event.id);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(String(inv.subscription));
          await syncSubscription(sub);
        }
        break;
      }
      default:
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(`Handler error: ${e?.message ?? e}`, { status: 500 });
  }
});
