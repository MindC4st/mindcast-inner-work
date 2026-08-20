// /shop — the physical range. Browsing and buying both work without an
// account: guests check out through Stripe and look their order up later by
// order number + email. Members' orders attach to their profile.
//
// Copy rules: no must-have, no complete-your-journey, no member-essential,
// no limited, no get-the-full-system, no scarcity. Useful first, optional
// always. Prices in NZD, GST included.

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { useCart } from "@/hooks/useCart";
import CartDrawer, { resolveEntries, startCheckout, type CartProduct } from "@/components/shop/CartDrawer";

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cart = useCart();

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [taglines, setTaglines] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const cancelled = searchParams.get("purchase") === "cancelled";

  useEffect(() => {
    let active = true;
    db.from("shop_products")
      .select("id, slug, name, tagline, image_url, price_cents, currency, fulfilment")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        const rows = (data ?? []) as unknown as (CartProduct & { tagline: string | null })[];
        setProducts(rows.map(({ tagline, ...p }) => p));
        setTaglines(Object.fromEntries(rows.filter((r) => r.tagline).map((r) => [r.slug, r.tagline as string])));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Variant info for the cart drawer (names + price overrides).
  useEffect(() => {
    if (products.length === 0) return;
    let active = true;
    db.from("shop_product_variants")
      .select("id, product_id, name, price_override_cents")
      .in("product_id", products.map((p) => p.id))
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!active) return;
        const byProduct = new Map<string, { id: string; name: string; price_override_cents: number | null }[]>();
        for (const v of (data ?? []) as { id: string; product_id: string; name: string; price_override_cents: number | null }[]) {
          byProduct.set(v.product_id, [...(byProduct.get(v.product_id) ?? []), v]);
        }
        setProducts((prev) => prev.map((p) => ({ ...p, variants: byProduct.get(p.id) ?? [] })));
      });
    return () => { active = false; };
  }, [products.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const entries = resolveEntries(cart.lines as never, products);

  const onCheckout = async (discountCode: string) => {
    await startCheckout(entries, discountCode);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[hsl(var(--navy))]/[0.08]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-[hsl(var(--navy))]">MINDCAST</Link>
        <div className="flex items-center gap-5">
          <Link to="/orders/lookup" className="text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
            Find an order
          </Link>
          <Link to="/portal/orders" className="text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
            My orders
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy))] hover:opacity-70"
            aria-label={`Cart, ${cart.count} items`}
          >
            <ShoppingBag size={16} strokeWidth={1.6} />
            Cart
            {cart.count > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <p className="text-[10px] font-body tracking-[0.35em] uppercase text-primary mb-2">Shop</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider text-[hsl(var(--navy))] mb-3">THE PHYSICAL RANGE</h1>
        <p className="text-[hsl(var(--navy-mid))] text-sm font-body leading-relaxed mb-2 max-w-lg">
          Practical tools for people who want them. MINDCAST products are
          optional — everything required for your weekly session is provided
          as part of your participation.
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
                <Link to={`/shop/${p.slug}`} aria-label={`View ${p.name}`}>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                  )}
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="font-display text-lg tracking-wider text-[hsl(var(--navy))] leading-tight">
                      {p.name.toUpperCase()}
                    </h2>
                    <span className="font-display text-lg text-[hsl(var(--navy))] shrink-0">
                      {formatMoney(p.price_cents, p.currency)}
                    </span>
                  </div>
                  {taglines[p.slug] && (
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed flex-1 mb-4">
                      {taglines[p.slug]}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/shop/${p.slug}`)}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity"
                  >
                    <ArrowRight size={13} /> View product
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        entries={entries}
        setQuantity={cart.setQuantity}
        onCheckout={onCheckout}
      />
    </div>
  );
};

export default Shop;
