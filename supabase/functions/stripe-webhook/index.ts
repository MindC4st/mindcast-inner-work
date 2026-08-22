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

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  addressBlock,
  emailShell,
  itemsTable,
  money,
  orderEvent,
  sendCommerceEmail,
} from "./commerce-email.ts";
import { getAccessPassOption } from "../_shared/accessPass.ts";
import { isFamilyDiscountEligible } from "../_shared/familyDiscount.ts";

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
    return meta?.tier || "adult";
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

  const count = (value: string | undefined) =>
    Math.max(0, parseInt(value || "0", 10) || 0);

  const adults = count(meta?.adults);
  const teens = count(meta?.teens);
  const children = count(meta?.children);
  const plan = meta?.plan || "monthly";

  if (adults > 0 || teens > 0 || children > 0) {
    return {
      adults,
      teens,
      children,
      familyDiscount: meta?.family_discount === "true",
      plan,
    };
  }

  const items = sub.items?.data || [];

  let ad = 0;
  let te = 0;
  let ch = 0;

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
    adults: ad,
    teens: te,
    children: ch,
    familyDiscount: isFamilyDiscountEligible({ adults: ad, teens: te, children: ch }),
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

async function refreshEntitlements(
  householdId: string | null,
  profileId: string | null,
) {
  if (!householdId && !profileId) return;

  const { error } = await admin.rpc(
    "refresh_membership_entitlements",
    {
      p_household: householdId,
      p_profile: householdId ? null : profileId,
    },
  );

  if (error) {
    throw new Error(
      `Entitlement refresh failed: ${error.message}`,
    );
  }
}

// New-membership admin notification: email memberships@mindcast.co.nz with the
// member + teen NFC bracelet URLs so the team can write bracelets before the
// first live session. Fire-and-forget (never throws the webhook).
async function notifyMemberships(
  profileId: string | null,
  householdId: string | null,
) {
  const to =
    Deno.env.get("MEMBERSHIPS_EMAIL") ||
    "memberships@mindcast.co.nz";

  const RESEND_API_KEY =
    Deno.env.get("RESEND_API_KEY") || "";

  const FROM_EMAIL =
    Deno.env.get("FROM_EMAIL") ||
    "Mindcast <hello@mindcast.co.nz>";

  const braceletUrl = (
    id: string | null | undefined,
  ) =>
    id
      ? `https://www.mindcast.co.nz/b/${id}`
      : null;

  const lines: string[] = [];

  if (profileId) {
    const { data: p } = await admin
      .from("profiles")
      .select("name, display_name, email, nfc_id")
      .eq("id", profileId)
      .maybeSingle();

    if (p) {
      const url = braceletUrl(p.nfc_id);

      lines.push(`
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            margin:0 0 12px;
            background:#F8F5EF;
            border-radius:14px;
          "
        >
          <tr>
            <td
              style="
                padding:18px 20px;
                font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
              "
            >
              <p
                style="
                  margin:0 0 5px;
                  font-size:16px;
                  line-height:1.5;
                  font-weight:600;
                  color:#303947;
                "
              >
                ${p.display_name || p.name || "Member"}
              </p>

              <p
                style="
                  margin:0 0 8px;
                  font-size:14px;
                  line-height:1.5;
                  color:#747B84;
                "
              >
                ${p.email || "No email on file"}
              </p>

              <p
                style="
                  margin:0;
                  font-size:14px;
                  line-height:1.5;
                  color:#4D5560;
                "
              >
                Bracelet:
                ${
                  url
                    ? `<a
                        href="${url}"
                        style="
                          color:#3D8DB7;
                          text-decoration:underline;
                        "
                      >${url}</a>`
                    : "Not assigned yet"
                }
              </p>
            </td>
          </tr>
        </table>
      `);
    }
  }

  if (householdId) {
    const { data: teens } = await admin
      .from("household_members")
      .select(
        "profile_id, profiles(name, display_name, email, nfc_id)",
      )
      .eq("household_id", householdId)
      .eq("role_in_household", "teen");

    for (
      const t of (teens ?? []) as Array<{
        profiles: {
          name: string | null;
          display_name: string | null;
          email: string | null;
          nfc_id: string | null;
        } | null;
      }>
    ) {
      const tp = t.profiles;
      const url = braceletUrl(tp?.nfc_id);

      lines.push(`
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            margin:0 0 12px;
            background:#F8F5EF;
            border-radius:14px;
          "
        >
          <tr>
            <td
              style="
                padding:18px 20px;
                font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
              "
            >
              <p
                style="
                  margin:0 0 5px;
                  font-size:16px;
                  line-height:1.5;
                  font-weight:600;
                  color:#303947;
                "
              >
                ${tp?.display_name || tp?.name || "Teen"}
              </p>

              <p
                style="
                  margin:0 0 8px;
                  font-size:13px;
                  line-height:1.5;
                  font-weight:600;
                  text-transform:uppercase;
                  letter-spacing:.06em;
                  color:#92979D;
                "
              >
                Teen
              </p>

              <p
                style="
                  margin:0 0 8px;
                  font-size:14px;
                  line-height:1.5;
                  color:#747B84;
                "
              >
                ${tp?.email || "No email on file"}
              </p>

              <p
                style="
                  margin:0;
                  font-size:14px;
                  line-height:1.5;
                  color:#4D5560;
                "
              >
                Bracelet:
                ${
                  url
                    ? `<a
                        href="${url}"
                        style="
                          color:#3D8DB7;
                          text-decoration:underline;
                        "
                      >${url}</a>`
                    : "Not assigned yet"
                }
              </p>
            </td>
          </tr>
        </table>
      `);
    }
  }

  if (!lines.length) return;

  const html = emailShell(`
    <h1
      style="
        margin:0 0 18px;
        font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        font-size:28px;
        line-height:1.25;
        font-weight:600;
        color:#303947;
      "
    >
      New member joined
    </h1>

    <p
      style="
        margin:0 0 26px;
        font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        font-size:17px;
        line-height:1.65;
        color:#4D5560;
      "
    >
      Prepare the following bracelet${
        lines.length === 1 ? "" : "s"
      } before the member's first live session.
    </p>

    ${lines.join("")}
  `);

  try {
    const r = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject:
            "New Mindcast member — bracelets to prepare",
          html,
        }),
      },
    );

    if (!r.ok) {
      console.error(
        "memberships@ notify failed:",
        await r.text(),
      );
    }
  } catch (e) {
    console.error(
      "memberships@ notify error:",
      String(e),
    );
  }
}

async function syncSubscription(
  sub: Stripe.Subscription,
) {
  const meta =
    sub.metadata as Record<string, string>;

  const {
    data: previous,
    error: previousError,
  } = await admin
    .from("subscriptions")
    .select("profile_id, household_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (previousError) {
    throw new Error(
      `Subscription lookup failed: ${previousError.message}`,
    );
  }

  const profileId =
    meta?.profile_id ||
    previous?.profile_id ||
    null;

  const householdId =
    meta?.household_id ||
    previous?.household_id ||
    null;

  if (!profileId && !householdId) {
    throw new Error(
      `Subscription ${sub.id} has no profile or household owner`,
    );
  }

  const bundle = await parseBundle(sub);

  const highestTier =
    bundle.children > 0
      ? "child"
      : bundle.teens > 0
        ? "teen"
        : "adult";

  const { error: upsertError } =
    await admin
      .from("subscriptions")
      .upsert(
        {
          profile_id: profileId,
          household_id: householdId,
          stripe_customer_id: String(
            sub.customer,
          ),
          stripe_subscription_id: sub.id,
          status: sub.status,
          plan: bundle.plan,
          tier: highestTier,
          price_id:
            sub.items?.data?.[0]?.price?.id ??
            null,
          quantity: 1,
          bundle_adults: bundle.adults,
          bundle_teens: bundle.teens,
          bundle_children:
            bundle.children,
          family_discount:
            bundle.familyDiscount,
          current_period_end:
            sub.current_period_end
              ? new Date(
                  sub.current_period_end *
                    1000,
                ).toISOString()
              : null,
          cancel_at_period_end:
            sub.cancel_at_period_end ??
            false,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "stripe_subscription_id",
        },
      );

  if (upsertError) {
    throw new Error(
      `Subscription upsert failed: ${upsertError.message}`,
    );
  }

  await refreshEntitlements(
    householdId,
    profileId,
  );

  if (
    !previous &&
    (
      sub.status === "active" ||
      sub.status === "trialing"
    )
  ) {
    await notifyMemberships(
      profileId,
      householdId,
    );
  }

  const previousHousehold =
    previous?.household_id ?? null;

  const previousProfile =
    previous?.profile_id ?? null;

  if (
    previousHousehold &&
    previousHousehold !== householdId
  ) {
    await refreshEntitlements(
      previousHousehold,
      null,
    );
  } else if (
    !previousHousehold &&
    previousProfile &&
    (
      householdId !== null ||
      previousProfile !== profileId
    )
  ) {
    await refreshEntitlements(
      null,
      previousProfile,
    );
  }

  if (
    profileId &&
    sub.status !== "active" &&
    sub.status !== "trialing"
  ) {
    const {
      data: payer,
      error: payerError,
    } = await admin
      .from("profiles")
      .select("membership_status")
      .eq("id", profileId)
      .maybeSingle();

    if (payerError) {
      throw new Error(
        `Payer lookup failed: ${payerError.message}`,
      );
    }

    if (
      payer &&
      !["active", "trialing"].includes(
        payer.membership_status,
      )
    ) {
      const { error: statusError } =
        await admin
          .from("profiles")
          .update({
            membership_status:
              toMembershipStatus(
                sub.status,
              ),
          })
          .eq("id", profileId);

      if (statusError) {
        throw new Error(
          `Payer status update failed: ${statusError.message}`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// PREPAID ACCESS — session credits are minted only from a paid Stripe event.
// stripe_payment_intent_id is unique, so webhook retries cannot mint a second
// Concession Pass or one-off credit.
// ---------------------------------------------------------------------------

async function processAccessPassCheckout(
  session: Stripe.Checkout.Session,
) {
  const meta = (session.metadata ?? {}) as Record<string, string>;
  const option = getAccessPassOption(meta.lookup_key);
  if (!option || meta.kind !== "access_pass") {
    throw new Error("Invalid access-pass metadata");
  }
  if (
    meta.credit_kind !== option.kind ||
    meta.track !== option.track ||
    Number(meta.trips) !== option.trips
  ) {
    throw new Error(`Access-pass metadata mismatch for ${option.lookupKey}`);
  }

  const householdId = meta.household_id || "";
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  if (!householdId || !paymentIntentId) {
    throw new Error("Access-pass checkout is missing household or payment intent");
  }

  const { error } = await admin
    .from("session_credits")
    .upsert({
      household_id: householdId,
      kind: option.kind,
      track: option.track,
      trips_total: option.trips,
      trips_used: 0,
      stripe_payment_intent_id: paymentIntentId,
    }, {
      onConflict: "stripe_payment_intent_id",
      ignoreDuplicates: true,
    });
  if (error) {
    throw new Error(`Access-pass credit mint failed: ${error.message}`);
  }
}

/** Void remaining trips after a fully refunded pass/one-off payment. */
async function revokeRefundedAccessPass(
  charge: Stripe.Charge,
) {
  if (!charge.refunded) return;
  const paymentIntentId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const { data: credits, error: readError } = await admin
    .from("session_credits")
    .select("id, trips_total")
    .eq("stripe_payment_intent_id", paymentIntentId);
  if (readError) throw new Error(`Access-pass refund lookup failed: ${readError.message}`);

  for (const credit of credits ?? []) {
    const { error: updateError } = await admin
      .from("session_credits")
      .update({ trips_used: credit.trips_total })
      .eq("id", credit.id);
    if (updateError) throw new Error(`Access-pass refund update failed: ${updateError.message}`);
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
    recipient: {
      email?: string;
      profile_id?: string;
      first_name?: string;
      founding_free?: boolean;
    } | null;
  };

/** Expand the session's line items and map them back to our catalogue. */
async function shopLineItems(
  sessionId: string,
): Promise<ShopItem[]> {
  const session =
    await stripe.checkout.sessions.retrieve(
      sessionId,
      {
        expand: ["line_items"],
      },
    );

  const items: ShopItem[] = [];

  for (
    const li of
      session.line_items?.data ?? []
  ) {
    const meta = (
      (
        li.price?.product as
          | Stripe.Product
          | undefined
      )?.metadata ?? {}
    ) as Record<string, string>;

    if (
      !meta.product_id &&
      !meta.slug
    ) {
      continue;
    }

    items.push({
      productId:
        meta.product_id || null,

      variantId:
        meta.variant_id || null,

      slug: meta.slug || "",

      sku: meta.sku || "",

      name:
        li.description ||
        "Mindcast product",

      unitPriceCents:
        li.amount_total &&
        li.quantity
          ? Math.round(
              li.amount_total /
                li.quantity,
            )
          : (
              li.price
                ?.unit_amount ?? 0
            ),

      quantity:
        li.quantity ?? 1,

      recipient: (meta.recipient_email || meta.recipient_profile_id)
        ? {
          email: meta.recipient_email || undefined,
          profile_id: meta.recipient_profile_id || undefined,
          first_name: meta.recipient_name || undefined,
          founding_free: meta.founding_free === "true",
        }
        : null,
    });
  }

  return items;
}

/** Idempotency guard for arbitrary Stripe events (refunds, failures). */
async function eventAlreadyProcessed(
  eventId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("shop_order_events")
    .select("id")
    .eq(
      "type",
      "stripe_event_processed",
    )
    .filter(
      "metadata->>event_id",
      "eq",
      eventId,
    )
    .limit(1);

  return Boolean(
    data &&
      data.length > 0,
  );
}

async function markEventProcessed(
  orderId: string,
  eventId: string,
  kind: string,
) {
  await orderEvent(admin, {
    orderId,
    type: "stripe_event_processed",
    note: `${kind} (${eventId})`,
    metadata: {
      event_id: eventId,
      kind,
    },
  });
}

/** Upsert the commerce customer (member by profile, guest by email). */
async function upsertCustomer(
  profileId: string | null,
  email: string | null,
  name: string | null,
): Promise<string | null> {
  if (!profileId && !email) {
    return null;
  }

  const first =
    name
      ?.split(" ")
      .slice(0, -1)
      .join(" ") || null;

  const last =
    name
      ?.split(" ")
      .slice(-1)[0] || null;

  if (profileId) {
    const { data } = await admin
      .from("shop_customers")
      .upsert(
        {
          profile_id: profileId,
          email,
          first_name: first,
          last_name: last,
        },
        {
          onConflict: "profile_id",
        },
      )
      .select("id")
      .maybeSingle();

    return data?.id ?? null;
  }

  const { data: existing } =
    await admin
      .from("shop_customers")
      .select("id")
      .eq("email", email)
      .is("profile_id", null)
      .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: created } =
    await admin
      .from("shop_customers")
      .insert({
        email,
        first_name: first,
        last_name: last,
      })
      .select("id")
      .maybeSingle();

  return created?.id ?? null;
}

async function recordShopOrder(
  s: Stripe.Checkout.Session,
) {
  const meta =
    (s.metadata ?? {}) as Record<
      string,
      string
    >;

  const isShipped =
    meta.fulfilment === "ship";

  const email =
    s.customer_details?.email ||
    s.customer_email ||
    null;

  const name =
    s.customer_details?.name ||
    s.shipping_details?.name ||
    null;

  const amountTotal =
    typeof s.amount_total === "number"
      ? s.amount_total
      : (
          parseInt(
            meta.subtotal_cents || "0",
            10,
          ) || 0
        );

  const discountCents =
    parseInt(
      meta.discount_cents || "0",
      10,
    ) || 0;

  const shippingCents =
    isShipped
      ? (
          (
            s.shipping_cost?.amount ??
            parseInt(
              meta.shipping_cents || "0",
              10,
            )
          ) || 0
        )
      : 0;

  const gstCents =
    parseInt(
      meta.gst_cents || "0",
      10,
    ) || 0;

  const items =
    await shopLineItems(s.id);

  const itemCount =
    items.reduce(
      (n, it) =>
        n + it.quantity,
      0,
    ) || 1;

  const firstName =
    items[0]?.name ||
    "Mindcast product";

  const productName =
    items.length > 1
      ? `${firstName} + ${items.length - 1} more`
      : firstName;

  const customerId =
    await upsertCustomer(
      meta.profile_id || null,
      email,
      name,
    );

  const {
    data: inserted,
    error,
  } = await admin
    .from("shop_orders")
    .upsert(
      {
        profile_id:
          meta.profile_id || null,

        customer_id:
          customerId,

        product_id:
          items[0]?.productId ||
          null,

        product_name:
          productName,

        unit_price_cents:
          items[0]
            ?.unitPriceCents ?? 0,

        quantity:
          itemCount,

        amount_total_cents:
          amountTotal,

        shipping_cents:
          shippingCents,

        discount_cents:
          discountCents,

        discount_code:
          meta.discount_code ||
          null,

        gst_cents:
          gstCents,

        currency:
          (
            s.currency || "nzd"
          ).toLowerCase(),

        fulfilment:
          isShipped
            ? "ship"
            : meta.fulfilment ===
                "partner"
              ? "partner"
              : "counter",

        partner_name:
          meta.partner_name ||
          null,

        scheduled_session_id:
          meta.scheduled_session_id ||
          null,

        stripe_session_id:
          s.id,

        stripe_payment_intent:
          s.payment_intent
            ? String(
                s.payment_intent,
              )
            : null,

        status:
          "paid",

        payment_status:
          "paid",

        fulfilment_status:
          "unfulfilled",

        note:
          meta.order_note || null,

        customer_email:
          email,

        customer_first_name:
          name
            ?.split(" ")
            .slice(0, -1)
            .join(" ") || null,

        customer_last_name:
          name
            ?.split(" ")
            .slice(-1)[0] || null,

        customer_phone:
          s.customer_details
            ?.phone || null,

        ship_name:
          s.shipping_details
            ?.name || null,

        ship_line1:
          s.shipping_details
            ?.address?.line1 ||
          null,

        ship_line2:
          s.shipping_details
            ?.address?.line2 ||
          null,

        ship_city:
          s.shipping_details
            ?.address?.city ||
          null,

        ship_postcode:
          s.shipping_details
            ?.address
            ?.postal_code ||
          null,

        ship_country:
          s.shipping_details
            ?.address?.country ||
          null,

        bill_name:
          s.shipping_details
            ?.name || name,

        bill_line1:
          s.shipping_details
            ?.address?.line1 ||
          null,

        bill_line2:
          s.shipping_details
            ?.address?.line2 ||
          null,

        bill_city:
          s.shipping_details
            ?.address?.city ||
          null,

        bill_postcode:
          s.shipping_details
            ?.address
            ?.postal_code ||
          null,

        bill_country:
          s.shipping_details
            ?.address?.country ||
          null,
      },
      {
        onConflict:
          "stripe_session_id",

        ignoreDuplicates: true,
      },
    )
    .select(
      "id, order_number",
    )
    .maybeSingle();

  if (error) {
    throw error;
  }

  let orderId: string;
  let orderNumber:
    | string
    | null;

  let isNew = false;

  if (inserted) {
    isNew = true;

    orderId =
      inserted.id;

    orderNumber =
      inserted.order_number;

    if (items.length > 0) {
      const {
        error: itemsError,
      } = await admin
        .from(
          "shop_order_items",
        )
        .insert(
          items.map(
            (it) => ({
              order_id:
                orderId,

              product_id:
                it.productId,

              variant_id:
                it.variantId,

              slug:
                it.slug,

              sku:
                it.sku,

              product_name:
                it.name,

              unit_price_cents:
                it.unitPriceCents,

              quantity:
                it.quantity,

              line_total_cents:
                it.unitPriceCents *
                it.quantity,

              gst_cents:
                Math.round(
                  it.unitPriceCents *
                    it.quantity *
                    15 /
                    115,
                ),

              recipient:
                it.recipient ?? null,
            }),
          ),
        );

      if (itemsError) {
        throw new Error(
          `Order items insert failed: ${itemsError.message}`,
        );
      }

      // Founding-100: free bracelet lines claim their entitlement against this
      // order. The claim RPC row-locks the entitlement — a double claim is
      // impossible even if Stripe redelivers the event.
      for (const it of items) {
        if (
          it.slug === "nfc-bracelet" &&
          it.recipient?.email &&
          it.recipient.founding_free
        ) {
          await admin
            .rpc("founding_bracelet_claim", {
              p_email: it.recipient.email,
              p_order_id: orderId,
            })
            .catch(() => {});
        }
      }
    }

    const {
      error: convError,
    } = await admin.rpc(
      "shop_convert_reservation",
      {
        p_session_key: s.id,
        p_order_id: orderId,
      },
    );

    if (convError) {
      throw new Error(
        `Stock conversion failed: ${convError.message}`,
      );
    }

    if (meta.discount_id) {
      const {
        data: redemption,
        error: redErr,
      } = await admin
        .from(
          "shop_discount_redemptions",
        )
        .upsert(
          {
            discount_id:
              meta.discount_id,

            order_id:
              orderId,
          },
          {
            ignoreDuplicates: true,
          },
        )
        .select("id");

      if (
        !redErr &&
        redemption &&
        redemption.length > 0
      ) {
        await admin
          .rpc(
            "shop_increment_discount",
            {
              p_discount_id:
                meta.discount_id,
            },
          )
          .catch(() => {});
      }
    }

    await admin
      .from("shop_payments")
      .insert({
        order_id:
          orderId,

        kind:
          "payment",

        amount_cents:
          amountTotal,

        currency:
          (
            s.currency || "nzd"
          ).toLowerCase(),

        status:
          "succeeded",

        stripe_id:
          s.payment_intent
            ? String(
                s.payment_intent,
              )
            : s.id,
      })
      .catch(() => {});

    await orderEvent(
      admin,
      {
        orderId,
        type:
          "order_placed",

        note:
          `Order placed — ${itemCount} item${
            itemCount === 1
              ? ""
              : "s"
          }`,

        metadata: {
          item_count:
            itemCount,

          amount_total_cents:
            amountTotal,
        },
      },
    );

    await orderEvent(
      admin,
      {
        orderId,
        type:
          "payment_confirmed",

        note:
          "Stripe payment confirmed",

        metadata: {
          stripe_session_id:
            s.id,
        },
      },
    );
  } else {
    const {
      data: existing,
    } = await admin
      .from("shop_orders")
      .select(
        "id, order_number",
      )
      .eq(
        "stripe_session_id",
        s.id,
      )
      .maybeSingle();

    if (!existing) {
      return;
    }

    orderId =
      existing.id;

    orderNumber =
      existing.order_number;
  }

  const {
    data: orderRow,
  } = await admin
    .from("shop_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (
    orderRow &&
    email &&
    !orderRow
      .confirmation_email_sent_at
  ) {
    const {
      data: itemRows,
    } = await admin
      .from("shop_order_items")
      .select(
        "product_name, quantity, line_total_cents",
      )
      .eq(
        "order_id",
        orderId,
      )
      .order("created_at");

    const rows =
      itemRows &&
      itemRows.length > 0
        ? itemRows
        : [
            {
              product_name:
                orderRow.product_name,

              quantity:
                orderRow.quantity,

              line_total_cents:
                orderRow
                  .unit_price_cents *
                orderRow.quantity,
            },
          ];

    const html = emailShell(`
      <h1
        style="
          margin:0 0 18px;
          font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-size:28px;
          line-height:1.25;
          font-weight:600;
          color:#303947;
        "
      >
        Your order is confirmed
      </h1>

      <p
        style="
          margin:0 0 26px;
          font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        Thanks for your order. We've received your payment and your order is now being prepared.
      </p>

      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          margin:0 0 28px;
          background:#F8F5EF;
          border-radius:14px;
        "
      >
        <tr>
          <td
            width="4"
            style="
              width:4px;
              background:#3D8DB7;
              font-size:1px;
              line-height:1px;
            "
          >
            &nbsp;
          </td>

          <td
            style="
              padding:22px 24px;
            "
          >
            <p
              style="
                margin:0 0 4px;
                font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                font-size:13px;
                line-height:1.5;
                font-weight:600;
                text-transform:uppercase;
                letter-spacing:.06em;
                color:#92979D;
              "
            >
              Order ${orderNumber || ""}
            </p>

            <p
              style="
                margin:0;
                font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                font-size:14px;
                line-height:1.5;
                color:#747B84;
              "
            >
              ${
                new Date(
                  orderRow.created_at,
                ).toLocaleDateString(
                  "en-NZ",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )
              }
            </p>
          </td>
        </tr>
      </table>

      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width:100%;
          margin:0 0 24px;
          font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-size:15px;
        "
      >
        ${itemsTable(rows)}

        ${
          orderRow.discount_cents > 0
            ? `
              <tr>
                <td
                  style="
                    padding:10px 0;
                    color:#747B84;
                    border-bottom:1px solid #E9E5DE;
                  "
                >
                  Discount${
                    orderRow.discount_code
                      ? ` (${orderRow.discount_code})`
                      : ""
                  }
                </td>

                <td
                  align="right"
                  style="
                    padding:10px 0 10px 20px;
                    color:#4D5560;
                    border-bottom:1px solid #E9E5DE;
                  "
                >
                  −${money(orderRow.discount_cents)}
                </td>
              </tr>
            `
            : ""
        }

        ${
          isShipped
            ? `
              <tr>
                <td
                  style="
                    padding:10px 0;
                    color:#747B84;
                    border-bottom:1px solid #E9E5DE;
                  "
                >
                  Shipping
                </td>

                <td
                  align="right"
                  style="
                    padding:10px 0 10px 20px;
                    color:#4D5560;
                    border-bottom:1px solid #E9E5DE;
                  "
                >
                  ${
                    orderRow.shipping_cents > 0
                      ? money(orderRow.shipping_cents)
                      : "Free"
                  }
                </td>
              </tr>
            `
            : ""
        }

        <tr>
          <td
            style="
              padding:16px 0 0;
              font-size:16px;
              font-weight:600;
              color:#303947;
            "
          >
            Total
            <span
              style="
                font-weight:400;
                color:#92979D;
              "
            >
              (incl. GST)
            </span>
          </td>

          <td
            align="right"
            style="
              padding:16px 0 0 20px;
              font-size:17px;
              font-weight:600;
              color:#303947;
            "
          >
            ${money(orderRow.amount_total_cents)}
          </td>
        </tr>
      </table>

      ${
        isShipped
          ? addressBlock(orderRow)
          : `
            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                margin:24px 0 0;
                background:#F8F5EF;
                border-radius:14px;
              "
            >
              <tr>
                <td
                  style="
                    padding:20px 22px;
                    font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                  "
                >
                  <p
                    style="
                      margin:0 0 6px;
                      font-size:13px;
                      line-height:1.5;
                      font-weight:600;
                      text-transform:uppercase;
                      letter-spacing:.06em;
                      color:#92979D;
                    "
                  >
                    Local pickup
                  </p>

                  <p
                    style="
                      margin:0;
                      font-size:16px;
                      line-height:1.65;
                      color:#4D5560;
                    "
                  >
                    Show this pickup code when you collect your order:
                    <strong
                      style="
                        color:#303947;
                      "
                    >
                      ${orderRow.pickup_code}
                    </strong>
                  </p>
                </td>
              </tr>
            </table>
          `
      }

      <p
        style="
          margin:26px 0 0;
          font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-size:15px;
          line-height:1.65;
          color:#747B84;
        "
      >
        ${
          isShipped
            ? "We'll email you again when your order is on the way."
            : "We'll let you know when your order is ready for collection."
        }
        Prices are in NZD and include GST.
      </p>
    `);

    const sent =
      await sendCommerceEmail(
        admin,
        {
          orderId,

          type:
            "order_confirmation",

          to:
            email,

          subject:
            `We've received your MINDCAST order — #${orderNumber || ""}`,

          html,
        },
      );

    if (sent) {
      await admin
        .from("shop_orders")
        .update({
          confirmation_email_sent_at:
            new Date().toISOString(),
        })
        .eq("id", orderId);

      await orderEvent(
        admin,
        {
          orderId,

          type:
            "email_sent",

          note:
            "Order confirmation email sent",

          metadata: {
            email_type:
              "order_confirmation",
          },
        },
      );
    } else if (isNew) {
      throw new Error(
        "Order confirmation email could not be sent",
      );
    }
  }

  if (
    orderRow &&
    !orderRow.admin_notified_at
  ) {
    const ORDERS_EMAIL =
      Deno.env.get(
        "ORDERS_EMAIL",
      ) ||
      "orders@mindcast.co.nz";

    const {
      data: adminItems,
    } = await admin
      .from("shop_order_items")
      .select(
        "product_name, quantity, line_total_cents",
      )
      .eq(
        "order_id",
        orderId,
      )
      .order("created_at");

    const adminRows =
      adminItems &&
      adminItems.length > 0
        ? adminItems
        : [
            {
              product_name:
                orderRow.product_name,

              quantity:
                orderRow.quantity,

              line_total_cents:
                orderRow
                  .unit_price_cents *
                orderRow.quantity,
            },
          ];

    const customerName =
      [
        orderRow.customer_first_name,
        orderRow.customer_last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Unknown customer";

    const adminHtml =
      emailShell(`
        <h1
          style="
            margin:0 0 18px;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:28px;
            line-height:1.25;
            font-weight:600;
            color:#303947;
          "
        >
          New order — #${orderNumber || ""}
        </h1>

        <p
          style="
            margin:0 0 26px;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:17px;
            line-height:1.65;
            color:#4D5560;
          "
        >
          ${customerName}<br>
          <span
            style="
              font-size:14px;
              color:#747B84;
            "
          >
            ${
              orderRow.customer_email ||
              "No email on file"
            }
          </span>
        </p>

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            margin:0 0 24px;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:15px;
          "
        >
          ${itemsTable(adminRows)}

          ${
            orderRow.discount_cents > 0
              ? `
                <tr>
                  <td
                    style="
                      padding:10px 0;
                      color:#747B84;
                      border-bottom:1px solid #E9E5DE;
                    "
                  >
                    Discount${
                      orderRow.discount_code
                        ? ` (${orderRow.discount_code})`
                        : ""
                    }
                  </td>

                  <td
                    align="right"
                    style="
                      padding:10px 0 10px 20px;
                      color:#4D5560;
                      border-bottom:1px solid #E9E5DE;
                    "
                  >
                    −${money(orderRow.discount_cents)}
                  </td>
                </tr>
              `
              : ""
          }

          ${
            isShipped
              ? `
                <tr>
                  <td
                    style="
                      padding:10px 0;
                      color:#747B84;
                      border-bottom:1px solid #E9E5DE;
                    "
                  >
                    Shipping
                  </td>

                  <td
                    align="right"
                    style="
                      padding:10px 0 10px 20px;
                      color:#4D5560;
                      border-bottom:1px solid #E9E5DE;
                    "
                  >
                    ${
                      orderRow.shipping_cents > 0
                        ? money(orderRow.shipping_cents)
                        : "Free"
                    }
                  </td>
                </tr>
              `
              : ""
          }

          <tr>
            <td
              style="
                padding:16px 0 0;
                font-size:16px;
                font-weight:600;
                color:#303947;
              "
            >
              Total
              <span
                style="
                  font-weight:400;
                  color:#92979D;
                "
              >
                (incl. GST)
              </span>
            </td>

            <td
              align="right"
              style="
                padding:16px 0 0 20px;
                font-size:17px;
                font-weight:600;
                color:#303947;
              "
            >
              ${money(orderRow.amount_total_cents)}
            </td>
          </tr>
        </table>

        ${
          isShipped
            ? addressBlock(orderRow)
            : `
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin:24px 0 0;
                  background:#F8F5EF;
                  border-radius:14px;
                "
              >
                <tr>
                  <td
                    style="
                      padding:20px 22px;
                      font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                    "
                  >
                    <p
                      style="
                        margin:0 0 6px;
                        font-size:13px;
                        line-height:1.5;
                        font-weight:600;
                        text-transform:uppercase;
                        letter-spacing:.06em;
                        color:#92979D;
                      "
                    >
                      Pickup
                    </p>

                    <p
                      style="
                        margin:0;
                        font-size:16px;
                        line-height:1.65;
                        color:#4D5560;
                      "
                    >
                      Pickup code:
                      <strong
                        style="
                          color:#303947;
                        "
                      >
                        ${orderRow.pickup_code}
                      </strong>
                    </p>
                  </td>
                </tr>
              </table>
            `
        }
      `);

    const notified =
      await sendCommerceEmail(
        admin,
        {
          orderId,

          type:
            "admin_order_notification",

          to:
            ORDERS_EMAIL,

          subject:
            `New MINDCAST order — #${orderNumber || ""}`,

          html:
            adminHtml,
        },
      );

    if (notified) {
      await admin
        .from("shop_orders")
        .update({
          admin_notified_at:
            new Date().toISOString(),
        })
        .eq("id", orderId);

      await orderEvent(
        admin,
        {
          orderId,

          type:
            "admin_notified",

          note:
            "New-order notification sent to admin",

          metadata: {
            email_type:
              "admin_order_notification",
          },
        },
      );
    }
  }
}

/** Checkout expired or async payment failed — release the stock hold. */
/**
 * Founding-100 finalisation — runs when a membership checkout completes.
 * 1. Reservations made at checkout start become ALLOCATED (payment confirmed).
 * 2. Named additional adults/teens become pending household invitations
 *    (the existing invite flow links them; no competing account system).
 * 3. Members selected for an immediate free bracelet get a $0 counter order
 *    and their entitlement is CLAIMED against it.
 * Never throws — membership sync must not fail because of the promotion.
 */
async function finalizeFoundingBracelets(
  s: Stripe.Checkout.Session,
): Promise<string | null> {
  try {
    const meta = (s.metadata ?? {}) as Record<string, string>;
    const reserved = (meta.founding_reserved || "")
      .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (reserved.length === 0) return null;

    await admin
      .rpc("founding_bracelet_finalize", { p_session_key: s.id })
      .catch(() => {});

    let householdId = meta.household_id || "";
    const payerProfileId = meta.profile_id || "";
    let members: { tier?: string; first_name?: string; email?: string }[] = [];
    try {
      const parsed = JSON.parse(meta.member_list || "[]");
      if (Array.isArray(parsed)) members = parsed;
    } catch {
      members = [];
    }

    // First family bundle: create the household so invitations have a home.
    if (!householdId && payerProfileId && members.length > 0) {
      const { data: hh, error: hhErr } = await admin
        .from("households")
        .insert({ name: "Family household", payer_profile_id: payerProfileId })
        .select("id")
        .single();
      if (!hhErr && hh) {
        householdId = hh.id;
        await admin
          .from("household_members")
          .upsert(
            {
              household_id: householdId,
              profile_id: payerProfileId,
              role_in_household: members.some((member) => member.tier === "teen" || member.tier === "child") ? "guardian" : "adult",
            },
            { onConflict: "household_id,profile_id" },
          )
          .catch(() => {});
      }
    }

    if (householdId && members.length > 0) {
      const { data: subRow } = await admin
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", String(s.subscription ?? ""))
        .maybeSingle();
      for (const m of members) {
        const emailNorm = String(m.email ?? "").trim().toLowerCase();
        if (!emailNorm) continue;
        await admin
          .from("household_invitations")
          .upsert(
            {
              household_id: householdId,
              email_norm: emailNorm,
              first_name: String(m.first_name ?? "").slice(0, 80),
              tier: m.tier === "teen" ? "teen" : "adult",
              invited_by: payerProfileId || null,
              subscription_id: subRow?.id ?? null,
              status: "pending",
            },
            { onConflict: "household_id,email_norm" },
          )
          .catch(() => {});
      }
    }

    const selected = (meta.founding_selected || "")
      .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (selected.length === 0) return null;

    const { data: product } = await admin
      .from("shop_products")
      .select("*")
      .eq("slug", "nfc-bracelet")
      .maybeSingle();
    if (!product) return null;

    const nameOf = (mail: string): string => {
      const m = members.find((x) => String(x.email ?? "").trim().toLowerCase() === mail);
      return String(m?.first_name ?? "").trim();
    };

    let firstOrderId: string | null = null;
    for (const email of selected) {
      const { data: order } = await admin
        .from("shop_orders")
        .insert({
          profile_id: payerProfileId || null,
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
          customer_email: email,
          note: "Free founding bracelet — membership activation",
        })
        .select("*")
        .single();
      if (!order) continue;
      if (!firstOrderId) firstOrderId = order.id;

      await admin
        .from("shop_order_items")
        .insert({
          order_id: order.id,
          product_id: product.id,
          slug: product.slug,
          sku: product.sku ?? null,
          product_name: product.name,
          unit_price_cents: 0,
          quantity: 1,
          line_total_cents: 0,
          gst_cents: 0,
          recipient: { email, first_name: nameOf(email) || undefined, founding_free: true },
        })
        .catch(() => {});

      await admin
        .rpc("founding_bracelet_claim", {
          p_email: email,
          p_order_id: order.id,
        })
        .catch(() => {});
    }
    return firstOrderId;
  } catch (e) {
    console.error("finalizeFoundingBracelets:", e);
    return null;
  }
}

/**
 * Household onboarding after a successful membership payment.
 *   * additional adults / teens: invite their auth identity (or link an
 *     existing account — never duplicate), set age_group, join the household
 *   * children: profile + household record with their name — NO auth account,
 *     NO email, NO login. The name feeds door check-in, room roll and the
 *     Welcome Wall (subject to the existing wall-consent rules).
 * Idempotent for webhook redelivery: adults/teens dedupe by email, children
 * by (household, first name, age_group).
 * Never throws — membership sync must not fail because of onboarding.
 */
async function processHouseholdOnboarding(
  s: Stripe.Checkout.Session,
) {
  try {
    const meta = (s.metadata ?? {}) as Record<string, string>;
    const payerProfileId = meta.profile_id || "";
    if (!payerProfileId) return;

    let members: { tier?: string; first_name?: string; email?: string }[] = [];
    try {
      const parsed = JSON.parse(meta.member_list || "[]");
      if (Array.isArray(parsed)) members = parsed;
    } catch {
      members = [];
    }
    if (members.length === 0) return;

    // Ensure the household exists and the payer is in it.
    let householdId = meta.household_id || "";
    if (!householdId) {
      const { data: hh, error: hhErr } = await admin
        .from("households")
        .insert({ name: "Family household", payer_profile_id: payerProfileId })
        .select("id")
        .single();
      if (hhErr || !hh) {
        console.error("processHouseholdOnboarding: household create failed:", hhErr?.message);
        return;
      }
      householdId = hh.id;
    }
    await admin
      .from("household_members")
      .upsert(
        {
          household_id: householdId,
          profile_id: payerProfileId,
          role_in_household: members.some((member) => member.tier === "teen" || member.tier === "child") ? "guardian" : "adult",
        },
        { onConflict: "household_id,profile_id" },
      )
      .catch(() => {});

    // Existing household roster — used to dedupe children on redelivery.
    const { data: existingMembers } = await admin
      .from("household_members")
      .select("profiles(id, first_name, age_group)")
      .eq("household_id", householdId);

    for (const m of members) {
      const firstName = String(m.first_name ?? "").trim().slice(0, 80);
      if (!firstName) continue;

      if (m.tier === "child") {
        const dup = (existingMembers ?? []).find((row: any) =>
          row.profiles?.age_group === "child" &&
          String(row.profiles?.first_name ?? "").trim().toLowerCase() === firstName.toLowerCase());
        if (dup) continue;

        // Child profile: no user_id, no email — name only. nfc_id is issued
        // so the child can hold a door pass/bracelet identity later.
        const nfcId = Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map((b) => b.toString(16).padStart(2, "0")).join("");
        const { data: childProfile, error: childErr } = await admin
          .from("profiles")
          .insert({
            user_id: null,
            name: firstName,
            first_name: firstName,
            display_name: firstName,
            age_group: "child",
            nfc_id: nfcId,
          })
          .select("id")
          .single();
        if (childErr || !childProfile) {
          console.error("processHouseholdOnboarding: child profile failed:", childErr?.message);
          continue;
        }
        await admin
          .from("household_members")
          .upsert(
            { household_id: householdId, profile_id: childProfile.id, role_in_household: "child" },
            { onConflict: "household_id,profile_id" },
          )
          .catch(() => {});
        continue;
      }

      // Adult / teen — they get their own login.
      const emailNorm = String(m.email ?? "").trim().toLowerCase();
      if (!emailNorm) continue;
      const ageGroup = m.tier === "teen" ? "teen" : "adult";

      let userId: string | null = null;
      try {
        const found = await admin.auth.admin.listUsers({
          page: 1, perPage: 1, filter: `email=eq:${emailNorm}`,
        });
        userId = found.users?.[0]?.id ?? null;
      } catch {
        userId = null;
      }
      if (!userId) {
        try {
          const invited = await admin.auth.admin.inviteUserByEmail(emailNorm, {
            data: { first_name: firstName, age_group: ageGroup },
            redirectTo: "https://www.mindcast.co.nz/portal/set-password",
          });
          userId = invited.user?.id ?? null;
        } catch (inviteErr) {
          // The household_invitations row (created alongside) stays pending —
          // the payer can re-invite from Family & Safety.
          console.error(`processHouseholdOnboarding: invite failed for ${emailNorm}:`, inviteErr);
          continue;
        }
      }
      if (!userId) continue;

      const { data: memberProfile, error: profErr } = await admin
        .from("profiles")
        .upsert(
          { user_id: userId, first_name: firstName, age_group: ageGroup },
          { onConflict: "user_id" },
        )
        .select("id")
        .single();
      if (profErr || !memberProfile) {
        console.error("processHouseholdOnboarding: profile upsert failed:", profErr?.message);
        continue;
      }
      await admin
        .from("household_members")
        .upsert(
          { household_id: householdId, profile_id: memberProfile.id, role_in_household: ageGroup },
          { onConflict: "household_id,profile_id" },
        )
        .catch(() => {});

      // The checkout-captured invitation is now fulfilled.
      await admin
        .from("household_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("household_id", householdId)
        .eq("email_norm", emailNorm)
        .eq("status", "pending")
        .catch(() => {});
    }
  } catch (e) {
    console.error("processHouseholdOnboarding:", e);
  }
}

/**
 * Paid bracelet add-ons on a membership checkout: create the commerce order
 * (one line item per recipient) and convert the session's bracelet stock
 * reservation (free + paid) into sales. Never throws.
 */
async function processBraceletOrders(
  s: Stripe.Checkout.Session,
  firstFreeOrderId: string | null,
) {
  try {
    const meta = (s.metadata ?? {}) as Record<string, string>;
    const braceletQty = parseInt(meta.bracelet_qty || "0", 10) || 0;
    const paidEmails = (meta.paid_bracelets || "")
      .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

    let paidOrderId: string | null = null;
    if (paidEmails.length > 0) {
      const payerProfileId = meta.profile_id || "";
      const { data: product } = await admin
        .from("shop_products").select("*").eq("slug", "nfc-bracelet").maybeSingle();
      if (product) {
        let members: { tier?: string; first_name?: string; email?: string }[] = [];
        try {
          const parsed = JSON.parse(meta.member_list || "[]");
          if (Array.isArray(parsed)) members = parsed;
        } catch { members = []; }

        const { data: payerProfile } = payerProfileId
          ? await admin.from("profiles").select("email").eq("id", payerProfileId).maybeSingle()
          : { data: null };

        const unit = 1500;
        const { data: order } = await admin
          .from("shop_orders")
          .insert({
            profile_id: payerProfileId || null,
            product_id: product.id,
            product_name: `${product.name} — membership checkout`,
            unit_price_cents: unit,
            quantity: paidEmails.length,
            amount_total_cents: unit * paidEmails.length,
            currency: "nzd",
            fulfilment: "counter",
            status: "paid",
            payment_status: "paid",
            fulfilment_status: "unfulfilled",
            stripe_session_id: s.id,
            customer_email: payerProfile?.email ?? null,
            note: "Paid bracelet add-ons — membership checkout (one-time)",
          })
          .select("*")
          .single();

        if (order) {
          paidOrderId = order.id;
          for (const pe of paidEmails) {
            const named = members.find((x) => String(x.email ?? "").trim().toLowerCase() === pe);
            await admin
              .from("shop_order_items")
              .insert({
                order_id: order.id,
                product_id: product.id,
                slug: product.slug,
                sku: product.sku ?? null,
                product_name: product.name,
                unit_price_cents: unit,
                quantity: 1,
                line_total_cents: unit,
                gst_cents: Math.round(unit * 15 / 115),
                recipient: { email: pe, first_name: String(named?.first_name ?? "").trim() || undefined },
              })
              .catch(() => {});
          }
          await orderEvent(admin, {
            orderId: order.id,
            type: "payment_confirmed",
            note: "Paid bracelet add-ons — membership checkout",
          });
        }
      }
    }

    // Convert the bracelet stock reservation (free + paid) for this session.
    const convOrderId = paidOrderId ?? firstFreeOrderId;
    if (braceletQty > 0 && convOrderId) {
      await admin
        .rpc("shop_convert_reservation", { p_session_key: s.id, p_order_id: convOrderId })
        .catch((e: unknown) => console.error("processBraceletOrders: stock conversion failed:", e));
    }
  } catch (e) {
    console.error("processBraceletOrders:", e);
  }
}

async function releaseShopReservation(
  s: Stripe.Checkout.Session,
  kind: string,
) {
  // Founding-100 reservations made during a membership checkout are released
  // here too — an expired or failed payment must never consume a founding
  // seat. No-op for sessions that reserved nothing.
  await admin
    .rpc("founding_bracelet_release", {
      p_session_key: s.id,
    })
    .catch(() => {});

  // Bracelet stock reservations (membership checkout add-ons) are released
  // for ANY session kind — a no-op when nothing was reserved.
  await admin
    .rpc(
      "shop_release_reservation",
      {
        p_session_key:
          s.id,
      },
    )
    .catch(() => {});

  if (
    (
      s.metadata as Record<
        string,
        string
      >
    )?.kind !== "shop"
  ) {
    return;
  }

  const { data: order } =
    await admin
      .from("shop_orders")
      .select("id")
      .eq(
        "stripe_session_id",
        s.id,
      )
      .maybeSingle();

  if (order) {
    await orderEvent(
      admin,
      {
        orderId:
          order.id,

        type:
          kind === "expired"
            ? "checkout_expired"
            : "payment_failed",

        note:
          kind === "expired"
            ? "Checkout expired — stock released"
            : "Payment failed — stock released",
      },
    );
  }
}

/** Refund reconciliation — covers refunds issued by us AND from Stripe dashboard. */
async function reconcileRefund(
  charge: Stripe.Charge,
  eventId: string,
) {
  const pi =
    charge.payment_intent
      ? String(
          charge.payment_intent,
        )
      : null;

  if (!pi) {
    return;
  }

  const { data: order } =
    await admin
      .from("shop_orders")
      .select("*")
      .eq(
        "stripe_payment_intent",
        pi,
      )
      .maybeSingle();

  if (!order) {
    return;
  }

  if (
    await eventAlreadyProcessed(
      eventId,
    )
  ) {
    return;
  }

  const refundedTotal =
    charge.amount_refunded ??
    0;

  const isFull =
    refundedTotal >=
    charge.amount;

  const previouslyRecorded =
    order.refunded_cents ?? 0;

  const delta =
    Math.max(
      0,
      refundedTotal -
        previouslyRecorded,
    );

  if (delta > 0) {
    const {
      data: existingRefund,
    } = await admin
      .from("shop_refunds")
      .select("id")
      .eq(
        "order_id",
        order.id,
      )
      .filter(
        "stripe_refund_id",
        "eq",
        pi,
      )
      .limit(1);

    if (
      !existingRefund ||
      existingRefund.length === 0
    ) {
      await admin
        .from("shop_refunds")
        .insert({
          order_id:
            order.id,

          amount_cents:
            delta,

          reason:
            "Refunded via Stripe dashboard",

          stripe_refund_id:
            pi,

          status:
            "succeeded",
        })
        .catch(() => {});
    }
  }

  const paymentStatus =
    isFull
      ? "refunded"
      : refundedTotal > 0
        ? "partially_refunded"
        : order.payment_status;

  await admin
    .from("shop_orders")
    .update({
      refunded_cents:
        refundedTotal,

      payment_status:
        paymentStatus,

      ...(isFull
        ? {
            status:
              "refunded",
          }
        : {}),
    })
    .eq(
      "id",
      order.id,
    );

  await admin
    .from("shop_payments")
    .insert({
      order_id:
        order.id,

      kind:
        "refund",

      amount_cents:
        delta,

      currency:
        order.currency,

      status:
        "succeeded",

      stripe_id:
        pi,
    })
    .catch(() => {});

  await orderEvent(
    admin,
    {
      orderId:
        order.id,

      type:
        "refund_confirmed",

      note:
        `${
          isFull
            ? "Full"
            : "Partial"
        } refund confirmed — ${money(refundedTotal)} of ${money(charge.amount)}`,

      metadata: {
        refunded_cents:
          refundedTotal,

        full:
          isFull,
      },
    },
  );

  await markEventProcessed(
    order.id,
    eventId,
    "charge.refunded",
  );

  if (
    order.customer_email &&
    delta > 0
  ) {
    const html =
      emailShell(`
        <h1
          style="
            margin:0 0 18px;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:28px;
            line-height:1.25;
            font-weight:600;
            color:#303947;
          "
        >
          Your refund has been processed
        </h1>

        <p
          style="
            margin:0 0 26px;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:17px;
            line-height:1.65;
            color:#4D5560;
          "
        >
          We've processed a refund for order
          <strong
            style="
              color:#303947;
            "
          >
            #${order.order_number || ""}
          </strong>.
        </p>

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            margin:0 0 28px;
            background:#F8F5EF;
            border-radius:14px;
          "
        >
          <tr>
            <td
              width="4"
              style="
                width:4px;
                background:#3D8DB7;
                font-size:1px;
                line-height:1px;
              "
            >
              &nbsp;
            </td>

            <td
              style="
                padding:22px 24px;
              "
            >
              <p
                style="
                  margin:0 0 6px;
                  font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                  font-size:13px;
                  line-height:1.5;
                  font-weight:600;
                  text-transform:uppercase;
                  letter-spacing:.06em;
                  color:#92979D;
                "
              >
                Refund amount
              </p>

              <p
                style="
                  margin:0;
                  font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                  font-size:24px;
                  line-height:1.3;
                  font-weight:600;
                  color:#303947;
                "
              >
                ${money(delta)}
              </p>
            </td>
          </tr>
        </table>

        <p
          style="
            margin:0 0 18px;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:17px;
            line-height:1.65;
            color:#4D5560;
          "
        >
          The refund has been sent back to your original payment method. Depending on your bank, it may take a few business days to appear.
        </p>

        ${
          isFull
            ? `
              <p
                style="
                  margin:0 0 18px;
                  font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                  font-size:15px;
                  line-height:1.65;
                  color:#747B84;
                "
              >
                This order has now been fully refunded.
              </p>
            `
            : ""
        }

        <p
          style="
            margin:0;
            font-family:Arial,Helvetica,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            font-size:14px;
            line-height:1.65;
            color:#747B84;
          "
        >
          If you have any questions about the refund, reply to this email and we'll help.
        </p>
      `);

    const sent =
      await sendCommerceEmail(
        admin,
        {
          orderId:
            order.id,

          type:
            "refund_confirmation",

          to:
            order.customer_email,

          subject:
            `Your MINDCAST refund — #${order.order_number || ""}`,

          html,
        },
      );

    if (sent) {
      await orderEvent(
        admin,
        {
          orderId:
            order.id,

          type:
            "email_sent",

          note:
            "Refund confirmation email sent",

          metadata: {
            email_type:
              "refund_confirmation",
          },
        },
      );
    }
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      "POST only",
      {
        status: 405,
      },
    );
  }

  const sig =
    req.headers.get(
      "stripe-signature",
    );

  const secret =
    Deno.env.get(
      "STRIPE_WEBHOOK_SECRET",
    ) || "";

  if (!sig || !secret) {
    return new Response(
      "Missing signature",
      {
        status: 400,
      },
    );
  }

  let event:
    Stripe.Event;

  try {
    const raw =
      await req.text();

    event =
      await stripe.webhooks
        .constructEventAsync(
          raw,
          sig,
          secret,
        );
  } catch (e: any) {
    return new Response(
      `Signature verification failed: ${
        e?.message ?? e
      }`,
      {
        status: 400,
      },
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(
          event.data
            .object as Stripe.Subscription,
        );
        break;

      case "checkout.session.completed": {
        const s =
          event.data
            .object as Stripe.Checkout.Session;

        if (
          s.mode ===
            "subscription" &&
          s.subscription
        ) {
          const sub =
            await stripe
              .subscriptions
              .retrieve(
                String(
                  s.subscription,
                ),
              );

          sub.metadata = {
            ...(
              s.metadata as any
            ),
            ...(
              sub.metadata as any
            ),
          };

          await syncSubscription(
            sub,
          );

          await processHouseholdOnboarding(
            s,
          );

          const firstFreeOrderId = await finalizeFoundingBracelets(
            s,
          );

          await processBraceletOrders(
            s,
            firstFreeOrderId,
          );
        } else if (
          s.mode === "payment" &&
          (
            s.metadata as any
          )?.kind === "access_pass" &&
          s.payment_status === "paid"
        ) {
          await processAccessPassCheckout(
            s,
          );
        } else if (
          s.mode === "payment" &&
          (
            s.metadata as any
          )?.kind === "shop"
        ) {
          await recordShopOrder(
            s,
          );
        }

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        if ((s.metadata as any)?.kind === "access_pass") {
          await processAccessPassCheckout(s);
        }
        break;
      }

      case "checkout.session.expired": {
        await releaseShopReservation(
          event.data
            .object as Stripe.Checkout.Session,
          "expired",
        );

        break;
      }

      case "checkout.session.async_payment_failed": {
        await releaseShopReservation(
          event.data
            .object as Stripe.Checkout.Session,
          "payment_failed",
        );

        break;
      }

      case "charge.refunded": {
        await revokeRefundedAccessPass(
          event.data.object as Stripe.Charge,
        );

        await reconcileRefund(
          event.data
            .object as Stripe.Charge,
          event.id,
        );

        break;
      }

      case "invoice.payment_failed": {
        const inv =
          event.data
            .object as Stripe.Invoice;

        if (inv.subscription) {
          const sub =
            await stripe
              .subscriptions
              .retrieve(
                String(
                  inv.subscription,
                ),
              );

          await syncSubscription(
            sub,
          );
        }

        break;
      }

      default:
        break;
    }

    return new Response(
      JSON.stringify({
        received: true,
      }),
      {
        headers: {
          "Content-Type":
            "application/json",
        },

        status: 200,
      },
    );
  } catch (e: any) {
    return new Response(
      `Handler error: ${
        e?.message ?? e
      }`,
      {
        status: 500,
      },
    );
  }
});
