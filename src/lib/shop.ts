// Shop presentation helpers — money and order state.
//
// Pure and free of React so the fulfilment rules can be unit tested. Whether
// a pickup code is still valid decides whether someone walks away with a
// product, so it is worth asserting rather than trusting a glance at the UI.

export type OrderStatus = "paid" | "collected" | "shipped" | "refunded" | "cancelled" | string;

// Shipping mirrors the constants in create-shop-checkout. Kept here (pure,
// testable) so the checkout function and the shop page can't drift apart
// silently — if one changes, the tests around describeShipping notice.
export const SHIPPING_FLAT_CENTS = 800;
export const FREE_SHIPPING_THRESHOLD_CENTS = 12000;

/** Shipping cost for a given merchandise subtotal (NZD cents). */
export const shippingForSubtotal = (subtotalCents: number): number =>
  subtotalCents <= 0 ? 0
    : subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0
    : SHIPPING_FLAT_CENTS;

/** "Free over $120" — the plain-language version shown in the cart. */
export const describeShipping = (subtotalCents: number): string => {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return "Shipping — free";
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;
  return `Shipping $${(SHIPPING_FLAT_CENTS / 100).toFixed(2)} · free with $${(remaining / 100).toFixed(2)} more`;
};

// ── Cart ────────────────────────────────────────────────────────────────────
// A line may carry a recipient (the household member a bracelet belongs to).
// Lines are keyed by slug + recipient so bracelets for different members stay
// separate; a line without a recipient behaves exactly as before.
export type CartRecipient = { email?: string; profile_id?: string; first_name?: string };
export type CartLine = { slug: string; quantity: number; variant_id?: string; recipient?: CartRecipient };

const CART_KEY = "mindcast.shop.cart.v1";
export const MAX_QUANTITY_PER_ITEM = 20;

export const recipientKey = (r?: CartRecipient): string => r?.email || r?.profile_id || "";

export const readCart = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l): l is CartLine => Boolean(l) && typeof l.slug === "string" && Number.isInteger(l.quantity))
      .filter((l) => l.slug.length > 0 && l.quantity > 0 && l.quantity <= MAX_QUANTITY_PER_ITEM)
      .map((l) => {
        const rawLine = l as CartLine & { variant_id?: string };
        return {
          slug: l.slug,
          quantity: l.quantity,
          ...(rawLine.variant_id ? { variant_id: rawLine.variant_id } : {}),
          ...(l.recipient && recipientKey(l.recipient) ? { recipient: l.recipient } : {}),
        } as CartLine;
      });
  } catch {
    return [];
  }
};

export const writeCart = (lines: CartLine[]): void => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines.filter((l) => l.quantity > 0)));
  } catch { /* private mode — cart lives for this render only */ }
};

export const addToCart = (lines: CartLine[], slug: string, quantity: number, recipient?: CartRecipient): CartLine[] => {
  const key = recipientKey(recipient);
  const existing = lines.find((l) => l.slug === slug && recipientKey(l.recipient) === key);
  const next = existing
    ? lines.map((l) => l.slug === slug && recipientKey(l.recipient) === key
      ? { ...l, quantity: Math.min(MAX_QUANTITY_PER_ITEM, l.quantity + quantity) }
      : l)
    : [...lines, { slug, quantity: Math.min(MAX_QUANTITY_PER_ITEM, quantity), ...(key ? { recipient } : {}) }];
  writeCart(next);
  return next;
};

export const setCartQuantity = (lines: CartLine[], slug: string, quantity: number, recipient?: CartRecipient): CartLine[] => {
  const key = recipientKey(recipient);
  const matches = (l: CartLine) => l.slug === slug && recipientKey(l.recipient) === key;
  const next = quantity <= 0
    ? lines.filter((l) => !matches(l))
    : lines.map((l) => matches(l) ? { ...l, quantity: Math.min(MAX_QUANTITY_PER_ITEM, quantity) } : l);
  writeCart(next);
  return next;
};

export const cartCount = (lines: CartLine[]): number => lines.reduce((n, l) => n + l.quantity, 0);

/** "$45.00" — cents in, display string out. */
export const formatMoney = (cents: number, currency = "nzd"): string => {
  const amount = (Math.round(cents) / 100).toFixed(2);
  const symbol = currency.toLowerCase() === "nzd" || currency.toLowerCase() === "usd" ? "$" : "";
  return symbol ? `${symbol}${amount}` : `${amount} ${currency.toUpperCase()}`;
};

export interface OrderPresentation {
  label: string;
  /** Traffic-light family, same convention as the membership band. */
  tone: "ready" | "spent" | "void";
  helper: string;
  /** Is this code still worth handing a product over for? */
  redeemable: boolean;
}

export const describeOrder = (
  status: OrderStatus,
  collectedAt?: string | null,
): OrderPresentation => {
  switch ((status || "").trim().toLowerCase()) {
    case "paid":
      return {
        label: "READY TO COLLECT",
        tone: "ready",
        helper: "Show this code at the counter.",
        redeemable: true,
      };
    case "collected":
      return {
        label: "COLLECTED",
        tone: "spent",
        helper: collectedAt
          ? `Collected ${formatCollectedAt(collectedAt)}. This code has been used.`
          : "This code has already been used.",
        redeemable: false,
      };
    case "shipped":
      return {
        label: "ON ITS WAY",
        tone: "ready",
        helper: "Your order has been shipped.",
        redeemable: false,
      };
    case "refunded":
      return {
        label: "REFUNDED",
        tone: "void",
        helper: "This order was refunded and can't be collected.",
        redeemable: false,
      };
    case "cancelled":
      return {
        label: "CANCELLED",
        tone: "void",
        helper: "This order was cancelled.",
        redeemable: false,
      };
    // Fail closed: an unrecognised state is never handed over.
    default:
      return {
        label: "NOT COLLECTABLE",
        tone: "void",
        helper: "Check with the welcome desk.",
        redeemable: false,
      };
  }
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "at 8:42 pm" for today, "on 14 Sep" otherwise. Fixed strings, not locale. */
export const formatCollectedAt = (iso: string, now = new Date()): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    const h24 = d.getHours();
    const h = h24 % 12 === 0 ? 12 : h24 % 12;
    const m = String(d.getMinutes()).padStart(2, "0");
    return `at ${h}:${m}${h24 < 12 ? "am" : "pm"}`;
  }
  return `on ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** Group a pickup code for readability: "K4P9T" → "K4P 9T". */
export const spacedCode = (code: string): string => {
  const c = (code || "").trim().toUpperCase();
  return c.length === 5 ? `${c.slice(0, 3)} ${c.slice(3)}` : c;
};
