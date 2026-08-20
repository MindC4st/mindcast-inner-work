// /shop/:slug — product page. Gallery, variant selector, stock status,
// quantity, full description, practical details, shipping note.

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { stockLabel } from "@/lib/commerce";
import { useCart } from "@/hooks/useCart";
import CartDrawer, { resolveEntries, startCheckout, type CartProduct } from "@/components/shop/CartDrawer";

type Variant = {
  id: string;
  name: string;
  sku: string | null;
  option_values: string | null;
  price_override_cents: number | null;
  stock_available: number;
  is_active: boolean;
};

type ProductFull = Omit<CartProduct, "variants"> & {
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  gallery_urls: string[];
  image_alt: string | null;
  weight_g: number | null;
  dimensions_mm: string | null;
  materials: string | null;
  track_stock: boolean;
  allow_backorder: boolean;
  variants: Variant[];
};

const ShopProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const cart = useCart();

  const [product, setProduct] = useState<ProductFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      const { data: pRows } = await db.from("shop_products")
        .select("id, slug, name, tagline, description, long_description, image_url, image_alt, gallery_urls, price_cents, currency, fulfilment, weight_g, dimensions_mm, materials, track_stock, allow_backorder")
        .eq("slug", slug).eq("status", "active").maybeSingle();
      if (!active) return;
      if (!pRows) { setLoading(false); return; }
      const { data: scoped } = await db.from("shop_product_variants")
        .select("id, name, sku, option_values, price_override_cents, stock_available, is_active")
        .eq("product_id", (pRows as { id: string }).id)
        .eq("is_active", true).order("sort_order");
      if (!active) return;
      const vs = (scoped ?? []) as Variant[];
      setProduct({ ...(pRows as unknown as ProductFull), gallery_urls: ((pRows as unknown as { gallery_urls: string[] | null }).gallery_urls ?? []), variants: vs });
      if (vs.length === 1) setVariantId(vs[0].id);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  const gallery = useMemo(
    () => product ? [product.image_url, ...product.gallery_urls].filter((u): u is string => Boolean(u)) : [],
    [product],
  );
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => { setActiveImg(0); }, [slug]);

  const selectedVariant = product?.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = selectedVariant?.price_override_cents ?? product?.price_cents ?? 0;
  const hasOptions = (product?.variants.length ?? 0) > 1;

  // Stock: variant-level for tracked products. Reservations are enforced at
  // checkout; the storefront shows the materialised level.
  const stock = product?.track_stock
    ? (selectedVariant?.stock_available ?? 0)
    : null;
  const stockInfo = product
    ? stockLabel(product.track_stock, stock, product.allow_backorder)
    : null;
  const blocked = product?.track_stock && !product.allow_backorder && (stock ?? 0) <= 0;

  const addToCart = () => {
    if (!product) return;
    if (hasOptions && !variantId) return;
    cart.add(product.slug, qty, hasOptions ? variantId ?? undefined : undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setCartOpen(true);
  };

  const entries = resolveEntries(cart.lines as never, product ? [product] : []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center">
        <p className="text-xs font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/60 animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))]">
        <div className="max-w-3xl mx-auto px-6 pt-24 text-center">
          <p className="font-display text-2xl tracking-wider text-[hsl(var(--navy))] mb-3">PRODUCT NOT FOUND</p>
          <Link to="/shop" className="text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">Back to the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[hsl(var(--navy))]/[0.08]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-[hsl(var(--navy))]">MINDCAST</Link>
        <div className="flex items-center gap-5">
          <Link to="/shop" className="flex items-center gap-2 text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
            <ArrowLeft size={12} /> Shop
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

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-24">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            {gallery.length > 0 && (
              <>
                <img
                  src={gallery[Math.min(activeImg, gallery.length - 1)]}
                  alt={product.image_alt || product.name}
                  className="w-full aspect-[4/3] object-cover rounded-sm mb-3"
                />
                {gallery.length > 1 && (
                  <div className="flex gap-2">
                    {gallery.map((u, i) => (
                      <button
                        key={u}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded-sm overflow-hidden border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                        aria-label={`Image ${i + 1}`}
                      >
                        <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="font-display text-3xl tracking-wider text-[hsl(var(--navy))] leading-tight mb-1">
              {product.name.toUpperCase()}
            </h1>
            {product.tagline && (
              <p className="text-sm font-body text-[hsl(var(--navy-mid))] italic mb-3">{product.tagline}</p>
            )}
            <div className="flex items-center gap-3 mb-1">
              <p className="font-display text-2xl text-[hsl(var(--navy))]">{formatMoney(unitPrice, product.currency)}</p>
              {stockInfo && (
                <span className={`text-[10px] font-body tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                  stockInfo.tone === "ready" ? "text-[hsl(152_48%_30%)] border-[hsl(152_48%_30%)]/30 bg-[hsl(152_48%_30%)]/10"
                    : stockInfo.tone === "warn" ? "text-amber-700 border-amber-600/30 bg-amber-500/10"
                    : "text-red-700 border-red-600/30 bg-red-500/10"
                }`}>
                  {stockInfo.text}
                </span>
              )}
            </div>
            <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/70 mb-5">NZD, GST included</p>

            {/* Variant selector */}
            {hasOptions && (
              <div className="mb-5">
                <p className="text-[10px] font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] mb-2">Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`px-4 py-2 text-xs font-body rounded-sm border transition-colors ${
                        variantId === v.id
                          ? "bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] border-[hsl(var(--navy))]"
                          : "bg-white text-[hsl(var(--navy))] border-[hsl(var(--navy))]/20 hover:border-[hsl(var(--navy))]/50"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + add */}
            <div className="flex items-center gap-3 mb-5">
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
                onClick={addToCart}
                disabled={blocked || (hasOptions && !variantId)}
                className="flex-1 flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {added ? <Check size={13} /> : <ShoppingBag size={13} />}
                {blocked ? "Out of stock" : added ? "Added" : hasOptions && !variantId ? "Choose an option" : "Add to cart"}
              </button>
            </div>

            <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/70 flex items-center gap-1.5 mb-6">
              <Truck size={12} strokeWidth={1.6} /> Ships New Zealand-wide · $8 flat, free over $120 · or collect at the counter
            </p>

            {product.description && (
              <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed mb-4">{product.description}</p>
            )}
            {product.long_description && (
              <div className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed space-y-3 mb-6">
                {product.long_description.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para}</p>
                ))}
              </div>
            )}

            {/* Practical details */}
            {(product.dimensions_mm || product.materials || product.weight_g) && (
              <div className="border-t border-[hsl(var(--navy))]/10 pt-4 text-xs font-body text-[hsl(var(--navy-mid))] space-y-1">
                {product.dimensions_mm && <p><span className="text-[hsl(var(--navy))]/60 uppercase tracking-widest text-[10px]">Dimensions · </span>{product.dimensions_mm}</p>}
                {product.materials && <p><span className="text-[hsl(var(--navy))]/60 uppercase tracking-widest text-[10px]">Materials · </span>{product.materials}</p>}
                {product.weight_g != null && <p><span className="text-[hsl(var(--navy))]/60 uppercase tracking-widest text-[10px]">Weight · </span>{product.weight_g} g</p>}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs font-body text-[hsl(var(--navy-mid))]/70 mt-12 max-w-lg">
          MINDCAST products are optional. Everything required for your weekly
          session is provided as part of your participation.
        </p>
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        entries={entries.length > 0 ? entries : resolveEntries(cart.lines as never, [product])}
        setQuantity={cart.setQuantity}
        onCheckout={async (code) => {
          // Re-resolve against the full catalogue at checkout time.
          const { data: all } = await db.from("shop_products")
            .select("id, slug, name, image_url, price_cents, currency, fulfilment")
            .eq("status", "active");
          const allProducts = (all ?? []) as unknown as CartProduct[];
          const { data: vRows } = await db.from("shop_product_variants")
            .select("id, product_id, name, price_override_cents")
            .in("product_id", allProducts.map((p) => p.id)).eq("is_active", true);
          const byProduct = new Map<string, { id: string; name: string; price_override_cents: number | null }[]>();
          for (const v of (vRows ?? []) as { id: string; product_id: string; name: string; price_override_cents: number | null }[]) {
            byProduct.set(v.product_id, [...(byProduct.get(v.product_id) ?? []), v]);
          }
          const full = allProducts.map((p) => ({ ...p, variants: byProduct.get(p.id) ?? [] }));
          await startCheckout(resolveEntries(cart.lines as never, full), code);
        }}
      />
    </div>
  );
};

export default ShopProduct;
