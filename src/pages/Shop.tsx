// /shop — the physical range. Browsing needs no account; buying does, because
// an order needs an owner and a shipping confirmation needs somewhere to go.
//
// Payment is Stripe Checkout in the member's browser: card-not-present, with
// Apple Pay / Google Pay appearing automatically. Stripe collects the shipping
// address (NZ only). Counter-pickup products keep their one-tap buy flow.
//
// Copy rules for this page: no must-have, no complete-your-journey, no
// member-essential, no limited, no get-the-full-system. Useful first,
// optional always. Prices in NZD, GST included.

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import {
  addToCart, cartCount, describeShipping, formatMoney, readCart,
  setCartQuantity, shippingForSubtotal, writeCart, type CartLine,
} from "@/lib/shop";

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  price_cents: number;
  currency: string;
  category: string | null;
  fulfilment: string;
  partner_name: string | null;
  bundle_slugs: string[] | null;
};

const Shop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartLine[]>(() => readCart());
  const [detail, setDetail] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  const cancelled = searchParams.get("purchase") === "cancelled";

  useEffect(() => {
    let active = true;
    db.from("shop_products")
      .select("id, slug, name, tagline, description, long_description, image_url, gallery_urls, price_cents, currency, category, fulfilment, partner_name, bundle_slugs")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setProducts(((data ?? []) as unknown as Product[]).map((p) => ({
          ...p,
          gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
          bundle_slugs: Array.isArray(p.bundle_slugs) ? p.bundle_slugs : [],
        })));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);
  const cartLines = useMemo(
    () => cart
      .map((l) => ({ line: l, product: bySlug.get(l.slug) }))
      .filter((x): x is { line: CartLine; product: Product } => Boolean(x.product)),
    [cart, bySlug],
  );
  const subtotal = cartLines.reduce((sum, x) => sum + x.product.price_cents * x.line.quantity, 0);
  const allShipped = cartLines.length > 0 && cartLines.every((x) => x.product.fulfilment === "ship");
  const shipping = allShipped ? shippingForSubtotal(subtotal) : 0;
  const count = cartCount(cart);

  const add = (slug: string, quantity: number) => {
    setCart((c) => addToCart(c, slug, quantity));
    setError("");
  };

  const buyCounter = async (slug: string) => {
    if (!user) { navigate(`/portal/login?next=${encodeURIComponent("/shop")}`); return; }
    setBusy(slug); setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-shop-checkout", {
        body: { slug, quantity: 1 },
      });
      if (fnErr) throw fnErr;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not start checkout");
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong");
      setBusy(null);
    }
  };

  const checkout = async () => {
    if (!user) {
      navigate(`/portal/login?next=${encodeURIComponent("/shop")}`);
      return;
    }
    setCheckingOut(true); setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-shop-checkout", {
        body: { items: cart.map((l) => ({ slug: l.slug, quantity: l.quantity })) },
      });
      if (fnErr) throw fnErr;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not start checkout");
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong");
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[hsl(var(--navy))]/[0.08]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-[hsl(var(--navy))]">MINDCAST</Link>
        <div className="flex items-center gap-5">
          <Link to="/portal/orders" className="text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
            My orders
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy))] hover:opacity-70"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={16} strokeWidth={1.6} />
            Cart
            {count > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <p className="text-[10px] font-body tracking-[0.35em] uppercase text-primary mb-2">Shop</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider text-[hsl(var(--navy))] mb-3">THE PHYSICAL RANGE</h1>
        <p className="text-[hsl(var(--navy-mid))] text-sm font-body leading-relaxed mb-2 max-w-lg">
          Tools for the practice — useful first, optional always. Nothing here is
          required to take part in Mindcast.
        </p>
        <p className="text-[hsl(var(--navy-mid))]/80 text-xs font-body flex items-center gap-2 mb-10">
          <Truck size={13} strokeWidth={1.6} />
          Prices in NZD, GST included · $8 shipping nationwide, free on orders over $120
        </p>

        {cancelled && (
          <div className="border border-[hsl(var(--navy))]/15 bg-white rounded-sm p-4 mb-8">
            <p className="text-sm font-body text-[hsl(var(--navy-mid))]">Checkout cancelled — nothing was charged.</p>
          </div>
        )}

        {loading ? (
          <p className="text-xs font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/60">Loading…</p>
        ) : products.length === 0 ? (
          <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-10 text-center">
            <ShoppingBag className="mx-auto mb-4 text-[hsl(var(--navy))]/20" size={30} strokeWidth={1.4} />
            <p className="font-display text-xl tracking-wider text-[hsl(var(--navy))] mb-1">NOTHING HERE YET</p>
            <p className="text-sm font-body text-[hsl(var(--navy-mid))]">Products will appear here as we add them.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
                className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                <button onClick={() => setDetail(p)} className="text-left" aria-label={`View ${p.name}`}>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                  )}
                </button>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="font-display text-lg tracking-wider text-[hsl(var(--navy))] leading-tight">
                      {p.name.toUpperCase()}
                    </h2>
                    <span className="font-display text-lg text-[hsl(var(--navy))] shrink-0">
                      {formatMoney(p.price_cents, p.currency)}
                    </span>
                  </div>
                  {p.tagline && (
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed flex-1 mb-4">
                      {p.tagline}
                    </p>
                  )}
                  {p.fulfilment === "ship" ? (
                    <button
                      onClick={() => setDetail(p)}
                      className="mt-auto w-full flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity"
                    >
                      <ArrowRight size={13} /> View
                    </button>
                  ) : (
                    <button
                      onClick={() => buyCounter(p.slug)}
                      disabled={busy === p.slug}
                      className="mt-auto w-full flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {busy === p.slug ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                      {busy === p.slug ? "Opening…" : user ? "Buy now" : "Sign in to buy"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {error && !cartOpen && <p className="text-sm text-red-700 font-body mt-6">{error}</p>}
      </div>

      {/* Product detail */}
      <AnimatePresence>
        {detail && (
          <ProductDetail
            product={detail}
            onClose={() => setDetail(null)}
            onAdd={(qty) => {
              add(detail.slug, qty);
              setDetail(null);
              setCartOpen(true);
            }}
            busy={busy === detail.slug}
          />
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[hsl(var(--navy))]/40 z-40"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[hsl(var(--ivory))] z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[hsl(var(--navy))]/10">
                <h2 className="font-display text-xl tracking-wider text-[hsl(var(--navy))]">YOUR CART</h2>
                <button onClick={() => setCartOpen(false)} className="text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Close cart">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cartLines.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="mx-auto mb-4 text-[hsl(var(--navy))]/20" size={28} strokeWidth={1.4} />
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] mb-4">Your cart is empty.</p>
                    <button onClick={() => setCartOpen(false)} className="text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">
                      Keep browsing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartLines.map(({ line, product }) => (
                      <div key={line.slug} className="flex gap-4 border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-3">
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="w-20 h-20 object-cover rounded-sm shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm tracking-wider text-[hsl(var(--navy))] leading-tight mb-1">
                            {product.name.toUpperCase()}
                          </p>
                          <p className="text-xs font-body text-[hsl(var(--navy-mid))] mb-2">
                            {formatMoney(product.price_cents, product.currency)}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[hsl(var(--navy))]/15 rounded-sm">
                              <button
                                onClick={() => setCart((c) => setCartQuantity(c, line.slug, line.quantity - 1))}
                                className="p-1.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center text-xs font-body text-[hsl(var(--navy))]">{line.quantity}</span>
                              <button
                                onClick={() => setCart((c) => setCartQuantity(c, line.slug, line.quantity + 1))}
                                className="p-1.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => setCart((c) => setCartQuantity(c, line.slug, 0))}
                              className="text-[10px] font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/70 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartLines.length > 0 && (
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
                    {checkingOut ? "Opening checkout…" : user ? "Checkout" : "Sign in to checkout"}
                  </button>
                  {error && <p className="text-sm text-red-700 font-body mt-3">{error}</p>}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductDetail = ({ product, onClose, onAdd, busy }: {
  product: Product;
  onClose: () => void;
  onAdd: (quantity: number) => void;
  busy: boolean;
}) => {
  const gallery = useMemo(
    () => [product.image_url, ...(product.gallery_urls ?? [])].filter((u): u is string => Boolean(u)),
    [product],
  );
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[hsl(var(--navy))]/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-0 top-0 bottom-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 pointer-events-none"
      >
        <div className="pointer-events-auto bg-[hsl(var(--ivory))] rounded-sm shadow-2xl w-full max-w-3xl border border-[hsl(var(--navy))]/10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--navy))]/10">
            <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary">Product</p>
            <button onClick={onClose} className="text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div>
              {gallery.length > 0 && (
                <>
                  <img
                    src={gallery[Math.min(active, gallery.length - 1)]}
                    alt={product.name}
                    className="w-full aspect-[4/3] object-cover rounded-sm mb-3"
                  />
                  {gallery.length > 1 && (
                    <div className="flex gap-2">
                      {gallery.map((u, i) => (
                        <button
                          key={u}
                          onClick={() => setActive(i)}
                          className={`w-16 h-16 rounded-sm overflow-hidden border-2 ${i === active ? "border-primary" : "border-transparent"}`}
                          aria-label={`Image ${i + 1}`}
                        >
                          <img src={u} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col">
              <h2 className="font-display text-2xl tracking-wider text-[hsl(var(--navy))] leading-tight mb-1">
                {product.name.toUpperCase()}
              </h2>
              {product.tagline && (
                <p className="text-sm font-body text-[hsl(var(--navy-mid))] italic mb-3">{product.tagline}</p>
              )}
              <p className="font-display text-2xl text-[hsl(var(--navy))] mb-1">
                {formatMoney(product.price_cents, product.currency)}
              </p>
              <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/70 mb-4">NZD, GST included</p>

              {product.long_description && (
                <div className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed space-y-3 mb-6">
                  {product.long_description.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="whitespace-pre-line">{para}</p>
                  ))}
                </div>
              )}

              {product.fulfilment === "ship" ? (
                <div className="mt-auto">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center border border-[hsl(var(--navy))]/15 rounded-sm bg-white">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-body text-[hsl(var(--navy))]">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-2.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => onAdd(qty)}
                      disabled={busy}
                      className="flex-1 flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} />}
                      Add to cart
                    </button>
                  </div>
                  <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/70 flex items-center gap-1.5">
                    <Truck size={12} strokeWidth={1.6} /> Ships New Zealand-wide · $8 flat, free over $120
                  </p>
                </div>
              ) : (
                <p className="text-xs font-body text-[hsl(var(--navy-mid))] mt-auto">
                  Available at the counter.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Shop;
