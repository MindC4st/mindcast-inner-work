// Shop presentation helpers — money and order state.
//
// Pure and free of React so the fulfilment rules can be unit tested. Whether
// a pickup code is still valid decides whether someone walks away with a
// product, so it is worth asserting rather than trusting a glance at the UI.

export type OrderStatus = "paid" | "collected" | "refunded" | "cancelled" | string;

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
