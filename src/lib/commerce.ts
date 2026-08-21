// Commerce client helpers — pure functions, unit-testable.
// Money is integer cents; prices are NZD GST-inclusive.

// TEMP — products aren't manufactured yet. Pause purchasing; browse only.
// Flip to false when stock is ready to ship.
export const SHOP_COMING_SOON = true;

export const GST_RATE = 0.15;

/** GST component of a GST-inclusive amount: 115 contains 15 of GST. */
export const gstComponent = (centsInclusive: number): number =>
  Math.round(centsInclusive * GST_RATE / (1 + GST_RATE));

export type PaymentStatus =
  | "pending" | "paid" | "partially_refunded" | "refunded" | "failed" | "cancelled";
export type FulfilmentStatus =
  | "unfulfilled" | "picking" | "packed" | "fulfilled" | "shipped" | "delivered" | "cancelled";

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const FULFILMENT_STATUS_LABEL: Record<string, string> = {
  unfulfilled: "Unfulfilled",
  picking: "Picking",
  packed: "Packed",
  fulfilled: "Partially shipped",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Payment status → tone family shared with the membership band convention. */
export const paymentTone = (s: string): "ready" | "warn" | "void" =>
  s === "paid" ? "ready"
    : s === "pending" || s === "partially_refunded" ? "warn"
    : "void";

export const fulfilmentTone = (s: string): "ready" | "warn" | "void" =>
  s === "shipped" || s === "delivered" ? "ready"
    : s === "unfulfilled" || s === "cancelled" ? "void"
    : "warn";

/** Discount calculation — mirrors create-shop-checkout so the cart preview
 *  matches what Stripe actually charges. */
export const computeDiscount = (
  subtotalCents: number,
  discount: { kind: string; value_cents: number; value_percent: number | null } | null,
): number => {
  if (!discount) return 0;
  if (discount.kind === "fixed") return Math.min(subtotalCents, discount.value_cents);
  if (discount.kind === "percent") return Math.round(subtotalCents * (discount.value_percent ?? 0) / 100);
  return 0; // free_shipping discounts affect shipping, not the subtotal
};

/** Derived available stock for a variant: materialised stock minus active
 *  reservations (mirrors the DB's shop_reserve_stock check). */
export const availableStock = (
  stockAvailable: number,
  activeReservations: number,
  trackStock: boolean,
): number | null => (trackStock ? Math.max(0, stockAvailable - activeReservations) : null);

/** Stock status copy for the storefront. */
export const stockLabel = (
  trackStock: boolean,
  available: number | null,
  backorder: boolean,
): { text: string; tone: "ready" | "warn" | "void" } => {
  if (!trackStock) return { text: "In stock", tone: "ready" };
  if (available === null) return { text: "In stock", tone: "ready" };
  if (available <= 0) {
    return backorder
      ? { text: "Available to order", tone: "warn" }
      : { text: "Out of stock", tone: "void" };
  }
  if (available <= 5) return { text: `Only ${available} left`, tone: "warn" };
  return { text: "In stock", tone: "ready" };
};

/** Order number formatting guard — MC-100001 style. */
export const isOrderNumber = (s: string): boolean => /^MC-\d{6,}$/.test(s.trim().toUpperCase());

/** CSV escape for report exports. */
export const csvEscape = (v: string | number | null | undefined): string => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: (string | number | null | undefined)[][]): string =>
  rows.map((r) => r.map(csvEscape).join(",")).join("\n");

/** Packing slip data — deliberately excludes cost prices and internal notes. */
export interface PackingSlipItem {
  sku: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
}
export interface PackingSlip {
  order_number: string;
  created_at: string;
  ship_name: string | null;
  ship_line1: string | null;
  ship_line2: string | null;
  ship_city: string | null;
  ship_postcode: string | null;
  items: PackingSlipItem[];
}
