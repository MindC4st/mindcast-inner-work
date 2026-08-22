// CartDrawer — the shared cart panel used by /shop and /shop/:slug.
// Discounts are validated server-side at checkout; the code travels with the
// request and the reduced total is what Stripe charges.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Minus, Plus, ShoppingBag, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { describeShipping, formatMoney, shippingForSubtotal } from "@/lib/shop";
import { track } from "@/lib/observability";
import type { CartLine } from "@/hooks/useCart";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  price_cents: number;
  currency: string;
  fulfilment: string;
  variants?: { id: string; name: string; price_override_cents: number | null }[];
};

export type CartEntry = {
  line: CartLine & { variant_id?: string };
  product: CartProduct;
  variantName?: string;
  unitPrice: number;
};

const CartDrawer = ({ open, onClose, entries, setQuantity, onCheckout }: {
  open: boolean;
  onClose: () => void;
  entries: CartEntry[];
  setQuantity: (slug: string, quantity: number, variantId?: string, recipient?: CartLine["recipient"]) => void;
  onCheckout: (discountCode: string) => Promise<void>;
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const subtotal = useMemo(
    () => entries.reduce((sum, e) => sum + e.unitPrice * e.line.quantity, 0),
    [entries],
  );
  const allShipped = entries.length > 0 && entries.every((e) => e.product.fulfilment === "ship");
  const shipping = allShipped ? shippingForSubtotal(subtotal) : 0;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  const checkout = async () => {
    setCheckingOut(true);
    setError("");
    try {
      await onCheckout(discountCode.trim());
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong");
      setCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[hsl(var(--navy))]/40 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[hsl(var(--ivory))] z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-[hsl(var(--navy))]/10">
              <h2 id="cart-title" className="font-serif text-2xl text-[hsl(var(--navy))]">Your cart</h2>
              <button ref={closeButtonRef} type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-lg text-[hsl(var(--navy-mid))] transition hover:bg-[hsl(var(--navy))]/5 hover:text-[hsl(var(--navy))] focus:outline-none focus:ring-2 focus:ring-primary/30" aria-label="Close cart">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {entries.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="mx-auto mb-4 text-[hsl(var(--navy))]/20" size={28} strokeWidth={1.4} />
                  <p className="text-sm font-body text-[hsl(var(--navy-mid))]">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((e) => {
                    const key = `${e.line.slug}|${e.line.variant_id ?? ""}|${e.line.recipient?.email ?? e.line.recipient?.profile_id ?? ""}`;
                    return (
                      <div key={key} className="flex gap-4 border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-3">
                        {e.product.image_url && (
                          <img src={e.product.image_url} alt="" className="w-20 h-20 object-cover rounded-sm shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm tracking-wider text-[hsl(var(--navy))] leading-tight mb-0.5">
                            {e.product.name.toUpperCase()}
                          </p>
                          {e.variantName && e.variantName !== "Default" && (
                            <p className="text-[11px] font-body text-[hsl(var(--navy-mid))] mb-1">{e.variantName}</p>
                          )}
                          {e.line.recipient && (e.line.recipient.first_name || e.line.recipient.email) && (
                            <p className="text-[11px] font-body text-[hsl(var(--navy-mid))] mb-1">
                              For {e.line.recipient.first_name || e.line.recipient.email}
                            </p>
                          )}
                          <p className="text-xs font-body text-[hsl(var(--navy-mid))] mb-2">
                            {formatMoney(e.unitPrice, e.product.currency)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[hsl(var(--navy))]/15 rounded-sm">
                              <button
                                type="button"
                                onClick={() => setQuantity(e.line.slug, e.line.quantity - 1, e.line.variant_id, e.line.recipient)}
                                className="flex h-9 w-9 items-center justify-center text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] focus:outline-none focus:ring-2 focus:ring-primary/30"
                                aria-label={`Decrease ${e.product.name} quantity`}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-xs font-body text-[hsl(var(--navy))]">{e.line.quantity}</span>
                              <button
                                type="button"
                                onClick={() => setQuantity(e.line.slug, e.line.quantity + 1, e.line.variant_id, e.line.recipient)}
                                className="flex h-9 w-9 items-center justify-center text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] focus:outline-none focus:ring-2 focus:ring-primary/30"
                                aria-label={`Increase ${e.product.name} quantity`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setQuantity(e.line.slug, 0, e.line.variant_id, e.line.recipient)}
                              className="min-h-9 rounded px-1 text-[10px] font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/70 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-3">
                    <label htmlFor="cart-discount-code" className="text-[10px] font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] flex items-center gap-1.5 mb-2">
                      <Tag size={11} /> Discount code
                    </label>
                    <input
                      id="cart-discount-code"
                      value={discountCode}
                      onChange={(ev) => setDiscountCode(ev.target.value.toUpperCase())}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-sm bg-[hsl(var(--ivory))] border border-[hsl(var(--navy))]/15 rounded-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {entries.length > 0 && (
              <div className="border-t border-[hsl(var(--navy))]/10 px-6 py-5 bg-white">
                <div className="flex justify-between text-sm font-body text-[hsl(var(--navy-mid))] mb-1">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                {allShipped && (
                  <div className="flex justify-between text-sm font-body text-[hsl(var(--navy-mid))] mb-1">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatMoney(shipping)}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-lg text-[hsl(var(--navy))] mt-2 mb-1">
                  <span>Total</span>
                  <span>{formatMoney(subtotal + shipping)}</span>
                </div>
                <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/70 mb-4">
                  NZD, GST included. {allShipped ? describeShipping(subtotal) + "." : "Collect at the counter."}
                </p>
                <button
                  type="button"
                  onClick={checkout}
                  disabled={checkingOut}
                  className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3.5 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {checkingOut ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {checkingOut ? "Opening checkout…" : "Checkout"}
                </button>
                <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/60 text-center mt-2">
                  No account needed — guests can check out with card, Apple Pay or Google Pay.
                </p>
                {error && <p className="text-sm text-red-700 font-body mt-3" role="alert">{error}</p>}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

/** Resolve cart lines to priced entries against the catalogue. */
export const resolveEntries = (
  lines: (CartLine & { variant_id?: string })[],
  products: CartProduct[],
): CartEntry[] => {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const entries: CartEntry[] = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product) continue;
    let variantName = "Default";
    let unitPrice = product.price_cents;
    if (product.variants && product.variants.length > 0) {
      const variant = line.variant_id
        ? product.variants.find((v) => v.id === line.variant_id)
        : product.variants.length === 1 ? product.variants[0] : undefined;
      if (variant) {
        variantName = variant.name;
        unitPrice = variant.price_override_cents ?? product.price_cents;
      }
    }
    entries.push({ line, product, variantName, unitPrice });
  }
  return entries;
};

/** Start Stripe Checkout for the current cart. Throws with a human message. */
export const startCheckout = async (
  entries: CartEntry[],
  discountCode: string,
): Promise<void> => {
  const items = entries.map((e) => ({
    slug: e.line.slug,
    quantity: e.line.quantity,
    ...(e.line.variant_id ? { variant_id: e.line.variant_id } : {}),
    ...(e.line.recipient ? { recipient: e.line.recipient } : {}),
  }));
  const { data, error } = await supabase.functions.invoke("create-shop-checkout", {
    body: { items, ...(discountCode ? { discount_code: discountCode } : {}) },
  });
  if (error) {
    let detail = error.message;
    try {
      const ctx = (error as { context?: { body?: unknown } }).context;
      if (ctx?.body) {
        const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body as ReadableStream).text();
        const parsed = JSON.parse(text);
        if (parsed?.error === "membership_required") {
          detail = parsed.message || "An active MINDCAST membership is required for this product";
        } else if (parsed?.error === "use_free_claim") {
          detail = "This bracelet is free — claim it from the bracelet page instead";
        } else if (parsed?.error) {
          detail = parsed.error;
        }
      }
    } catch { /* keep generic */ }
    throw new Error(detail);
  }
  if (items.some((i) => i.slug === "nfc-bracelet")) {
    track("nfc_bracelet_purchased", {
      bracelets: items.filter((i) => i.slug === "nfc-bracelet").reduce((n, i) => n + i.quantity, 0),
    });
  }
  if (data?.url) {
    window.location.href = data.url;
    return;
  }
  throw new Error(data?.error || "Could not start checkout");
};
