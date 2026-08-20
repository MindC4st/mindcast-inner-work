// CartDrawer — the shared cart panel used by /shop and /shop/:slug.
// Discounts are validated server-side at checkout; the code travels with the
// request and the reduced total is what Stripe charges.

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Minus, Plus, ShoppingBag, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { describeShipping, formatMoney, shippingForSubtotal } from "@/lib/shop";
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
  setQuantity: (slug: string, quantity: number, variantId?: string) => void;
  onCheckout: (discountCode: string) => Promise<void>;
}) => {
  const [discountCode, setDiscountCode] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  const subtotal = useMemo(
    () => entries.reduce((sum, e) => sum + e.unitPrice * e.line.quantity, 0),
    [entries],
  );
  const allShipped = entries.length > 0 && entries.every((e) => e.product.fulfilment === "ship");
  const shipping = allShipped ? shippingForSubtotal(subtotal) : 0;

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
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[hsl(var(--ivory))] z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--navy))]/10">
              <h2 className="font-display text-xl tracking-wider text-[hsl(var(--navy))]">YOUR CART</h2>
              <button onClick={onClose} className="text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Close cart">
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
                    const key = `${e.line.slug}|${e.line.variant_id ?? ""}`;
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
                          <p className="text-xs font-body text-[hsl(var(--navy-mid))] mb-2">
                            {formatMoney(e.unitPrice, e.product.currency)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[hsl(var(--navy))]/15 rounded-sm">
                              <button
                                onClick={() => setQuantity(e.line.slug, e.line.quantity - 1, e.line.variant_id)}
                                className="p-1.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-xs font-body text-[hsl(var(--navy))]">{e.line.quantity}</span>
                              <button
                                onClick={() => setQuantity(e.line.slug, e.line.quantity + 1, e.line.variant_id)}
                                className="p-1.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => setQuantity(e.line.slug, 0, e.line.variant_id)}
                              className="text-[10px] font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/70 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-3">
                    <label className="text-[10px] font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] flex items-center gap-1.5 mb-2">
                      <Tag size={11} /> Discount code
                    </label>
                    <input
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
                {error && <p className="text-sm text-red-700 font-body mt-3">{error}</p>}
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
        if (parsed?.error) detail = parsed.error;
      }
    } catch { /* keep generic */ }
    throw new Error(detail);
  }
  if (data?.url) {
    window.location.href = data.url;
    return;
  }
  throw new Error(data?.error || "Could not start checkout");
};
