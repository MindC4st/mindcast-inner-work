// /shop — public browsing and checkout. Products are always framed as useful,
// optional tools; all prices are NZD with GST included.

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PackageSearch, ShoppingBag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { SHOP_COMING_SOON } from "@/lib/commerce";
import { useCart } from "@/hooks/useCart";
import CartDrawer, { resolveEntries, startCheckout, type CartProduct } from "@/components/shop/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Shop = () => {
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
        setProducts(rows.map(({ tagline, ...product }) => product));
        setTaglines(Object.fromEntries(rows.filter((row) => row.tagline).map((row) => [row.slug, row.tagline as string])));
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Load variant names and price overrides for accurate cart totals.
  useEffect(() => {
    if (products.length === 0) return;
    let active = true;
    db.from("shop_product_variants")
      .select("id, product_id, name, price_override_cents")
      .in("product_id", products.map((product) => product.id))
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!active) return;
        const byProduct = new Map<string, { id: string; name: string; price_override_cents: number | null }[]>();
        for (const variant of (data ?? []) as { id: string; product_id: string; name: string; price_override_cents: number | null }[]) {
          byProduct.set(variant.product_id, [...(byProduct.get(variant.product_id) ?? []), variant]);
        }
        setProducts((current) => current.map((product) => ({ ...product, variants: byProduct.get(product.id) ?? [] })));
      });
    return () => { active = false; };
  }, [products.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const entries = resolveEntries(cart.lines as never, products);

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />

      <main>
        <section className="linen-panel relative overflow-hidden border-x-0 border-t-0 px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-12 lg:pt-32">
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.24em] text-primary">Mindcast shop</p>
                <h1 className="font-serif text-5xl leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">Tools to take the practice with you.</h1>
                <p className="mt-6 max-w-xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
                  Workbooks, cards and practical objects for people who want them. Everything required in a weekly Mindcast session is already provided.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/orders/lookup"
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-primary/30 bg-transparent px-5 font-body text-sm font-semibold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <PackageSearch className="h-4 w-4" aria-hidden="true" /> Find an order
                </Link>
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="relative inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`Open cart, ${cart.count} ${cart.count === 1 ? "item" : "items"}`}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Cart
                  {cart.count > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-primary">
                      {cart.count}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--linen-edge)] pt-5 font-body text-xs leading-5 text-muted-foreground">
              <span className="flex items-center gap-2"><Truck className="h-4 w-4" aria-hidden="true" /> New Zealand-wide delivery</span>
              <span>NZD · GST included</span>
              <span>$8 shipping · free over $120</span>
              <Link to="/portal/orders" className="underline decoration-cream/25 underline-offset-4 hover:text-cream">Member orders</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20" aria-labelledby="shop-range-heading">
          <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="portal-label mb-2">The physical range</p>
              <h2 id="shop-range-heading" className="font-serif text-4xl text-primary">Browse the collection</h2>
            </div>
            <p className="max-w-sm font-body text-xs leading-6 text-muted-foreground">Choose only what feels useful. There is no required kit or complete set.</p>
          </div>

          {SHOP_COMING_SOON && (
            <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/[0.05] p-5 font-body text-sm leading-6 text-foreground">
              <span className="mr-2 font-semibold text-primary">Ordering opens shortly.</span>
              You’re welcome to browse the range now.
            </div>
          )}

          {cancelled && (
            <div className="mb-8 rounded-2xl border border-foreground/10 bg-white p-5 font-body text-sm text-muted-foreground" role="status">
              Checkout was cancelled. Nothing was charged and your cart is still here.
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading products" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-foreground/[0.07] bg-white">
                  <div className="aspect-[4/3] animate-pulse bg-foreground/[0.06]" />
                  <div className="space-y-3 p-6"><div className="h-5 w-2/3 animate-pulse rounded bg-foreground/[0.07]" /><div className="h-4 w-full animate-pulse rounded bg-foreground/[0.05]" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-foreground/[0.08] bg-white p-10 text-center sm:p-14">
              <ShoppingBag className="mx-auto mb-4 h-8 w-8 text-foreground/20" aria-hidden="true" />
              <h3 className="font-serif text-2xl text-primary">The shelves are being prepared.</h3>
              <p className="mt-2 font-body text-sm text-muted-foreground">Products will appear here as they’re ready.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
                  className="paper-card paper-card-hover group flex overflow-hidden rounded-2xl"
                >
                  <Link to={`/shop/${product.slug}`} className="flex w-full flex-col rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20" aria-label={`View ${product.name}`}>
                    <div className="aspect-[4/3] overflow-hidden bg-foreground/[0.04]">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><ShoppingBag className="h-8 w-8 text-foreground/15" aria-hidden="true" /></div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-body text-base font-semibold leading-6 text-primary">{product.name}</h3>
                        <span className="shrink-0 font-body text-sm font-semibold text-foreground">{formatMoney(product.price_cents, product.currency)}</span>
                      </div>
                      {taglines[product.slug] && <p className="mt-3 flex-1 font-body text-sm leading-6 text-muted-foreground">{taglines[product.slug]}</p>}
                      <span className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary">
                        View product <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        entries={entries}
        setQuantity={cart.setQuantity}
        onCheckout={(discountCode) => startCheckout(entries, discountCode)}
      />
      <SiteFooter />
    </div>
  );
};

export default Shop;