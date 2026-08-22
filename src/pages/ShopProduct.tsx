// /shop/:slug — product page. Gallery, variant selector, stock status,
// quantity, full description, practical details, shipping note.
//
// Members-only products (the NFC bracelet): the page gate mirrors the
// server-side gate in create-shop-checkout — signed out → sign in first;
// signed in without an active membership → membership CTA; active member →
// choose who the bracelet is for. A member holding an unclaimed founding
// entitlement claims free (no Stripe); everyone else pays $5.

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { stockLabel, SHOP_COMING_SOON } from "@/lib/commerce";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/observability";
import { normalizeEmail, isValidEmail, braceletPurchaseGate, BRACELET_SLUG, type EntitlementState } from "@/lib/foundingBracelets";
import CartDrawer, { resolveEntries, startCheckout, type CartProduct } from "@/components/shop/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Variant = {
  id: string;
  name: string;
  sku: string | null;
  option_values: string | null;
  price_override_cents: number | null;
  stock_available: number;
  is_active: boolean;
  image_url: string | null;
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
  tags: string[];
  variants: Variant[];
};

const ShopProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const cart = useCart();
  const { user, profile, membershipStatus } = useAuth();

  const [product, setProduct] = useState<ProductFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Bracelet recipient flow (members-only products).
  const [recipientMode, setRecipientMode] = useState<"self" | "member">("self");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [eligibility, setEligibility] = useState<Record<string, EntitlementState>>({});
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimResult, setClaimResult] = useState<{ order_number: string; pickup_code: string } | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      const { data: pRows } = await db.from("shop_products")
        .select("id, slug, name, tagline, description, long_description, image_url, image_alt, gallery_urls, price_cents, currency, fulfilment, weight_g, dimensions_mm, materials, track_stock, allow_backorder, tags")
        .eq("slug", slug).eq("status", "active").maybeSingle();
      if (!active) return;
      if (!pRows) { setLoading(false); return; }
      const { data: scoped } = await db.from("shop_product_variants")
        .select("id, name, sku, option_values, price_override_cents, stock_available, is_active, image_url")
        .eq("product_id", (pRows as { id: string }).id)
        .eq("is_active", true).order("sort_order");
      if (!active) return;
      const vs = (scoped ?? []) as Variant[];
      setProduct({
        ...(pRows as unknown as ProductFull),
        gallery_urls: ((pRows as unknown as { gallery_urls: string[] | null }).gallery_urls ?? []),
        tags: ((pRows as unknown as { tags: string[] | null }).tags ?? []),
        variants: vs,
      });
      if (vs.length === 1) setVariantId(vs[0].id);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  const membersOnly = (product?.tags ?? []).includes("members-only");
  const isBracelet = product?.slug === BRACELET_SLUG;
  const gate = braceletPurchaseGate({ signedIn: Boolean(user), membershipStatus });
  const gateReason = gate.allowed ? null : gate.reason;

  // Membership gate analytics — once per view.
  useEffect(() => {
    if (membersOnly && !loading && gateReason) {
      track("nfc_bracelet_membership_gate_shown", { reason: gateReason });
    }
  }, [membersOnly, loading, gateReason]);

  const payerEmail = normalizeEmail(profile?.email || user?.email || "");
  const recipientEmail = recipientMode === "self"
    ? payerEmail
    : normalizeEmail(memberEmail);

  // Eligibility for whoever the bracelet is currently for.
  useEffect(() => {
    if (!membersOnly || !gate.allowed || !isValidEmail(recipientEmail)) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke("founding-bracelet-status", {
          body: { emails: [recipientEmail] },
        });
        const r = (data?.results ?? [])[0] as { email: string; state: EntitlementState } | undefined;
        if (r) setEligibility((prev) => ({ ...prev, [r.email]: r.state }));
      } catch { /* best-effort display; server re-validates */ }
    }, 400);
    return () => clearTimeout(t);
  }, [recipientEmail, membersOnly, gate.allowed]);

  const recipientState: EntitlementState | "unknown" = eligibility[recipientEmail] ?? "unknown";
  const canClaimFree = recipientState === "allocated";

  const claimFree = async () => {
    if (!isValidEmail(recipientEmail)) { setGateError("Enter the member's email."); return; }
    setClaimBusy(true); setGateError(null);
    try {
      const { data, error } = await supabase.functions.invoke("claim-founding-bracelet", {
        body: recipientMode === "self" ? {} : { recipient_email: recipientEmail },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setClaimResult({ order_number: data.order_number, pickup_code: data.pickup_code });
      setEligibility((prev) => ({ ...prev, [recipientEmail]: "claimed" }));
      track("nfc_bracelet_free_claimed", { for: recipientMode });
    } catch (e) {
      setGateError(e?.message ?? "Could not claim the bracelet");
    } finally {
      setClaimBusy(false);
    }
  };

  const addBraceletToCart = () => {
    if (!product) return;
    if (recipientMode === "member" && !isValidEmail(memberEmail)) {
      setGateError("Enter the member's email so we know who the bracelet is for.");
      return;
    }
    setGateError(null);
    cart.add(product.slug, qty, hasOptions ? variantId ?? undefined : undefined, {
      email: recipientEmail || undefined,
      profile_id: recipientMode === "self" ? profile?.id : undefined,
      first_name: recipientMode === "self" ? (profile?.first_name || profile?.name || "Me") : memberName || undefined,
    });
    track("nfc_bracelet_selected", { for: recipientMode, price_cents: unitPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setCartOpen(true);
  };

  const selectedVariant = product?.variants.find((v) => v.id === variantId) ?? null;
  // Selected colour drives the main image; the "-2" lifestyle photo(s) in
  // gallery_urls are the secondary view.
  const mainImage = selectedVariant?.image_url || product?.image_url || null;
  const gallery = useMemo(
    () => product ? [mainImage, ...product.gallery_urls].filter((u): u is string => Boolean(u)) : [],
    [product, mainImage],
  );
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => { setActiveImg(0); }, [slug, variantId]);

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
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center" role="status">
        <p className="text-sm font-body text-[hsl(var(--navy-mid))]/60 animate-pulse">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))]">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-6 py-32 text-center">
          <p className="portal-label mb-3">Mindcast shop</p>
          <h1 className="font-serif text-4xl text-primary mb-4">We couldn’t find that product.</h1>
          <p className="mb-6 font-body text-sm text-muted-foreground">It may have moved or is no longer available.</p>
          <Link to="/shop" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-semibold text-primary-foreground"><ArrowLeft size={14} /> Back to the shop</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pt-28 lg:pt-32 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link to="/shop" className="inline-flex min-h-10 items-center gap-2 rounded-lg font-body text-sm font-semibold text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] focus:outline-none focus:ring-2 focus:ring-primary/30">
            <ArrowLeft size={14} /> Back to shop
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex min-h-10 items-center gap-2 rounded-lg px-2 font-body text-sm font-semibold text-[hsl(var(--navy))] hover:bg-navy/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
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

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div>
            {gallery.length > 0 && (
              <>
                <img
                  src={gallery[Math.min(activeImg, gallery.length - 1)]}
                  alt={product.image_alt || product.name}
                  className="w-full aspect-[4/3] object-cover rounded-2xl mb-3 bg-foreground/[0.04]"
                />
                {gallery.length > 1 && (
                  <div className="flex gap-2">
                    {gallery.map((u, i) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                        aria-label={`Show product image ${i + 1}`}
                        aria-pressed={i === activeImg}
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
            <h1 className="font-serif text-4xl lg:text-5xl text-primary leading-tight mb-2">
              {product.name}
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
              <fieldset className="mb-5">
                <legend className="text-xs font-body font-semibold text-[hsl(var(--navy-mid))] mb-2">Choose a colour</legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Product colour">
                  {product.variants.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      role="radio"
                      aria-checked={variantId === v.id}
                      className={`flex min-h-11 items-center gap-2 px-3 py-2 text-xs font-body rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        variantId === v.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-white text-[hsl(var(--navy))] border-[hsl(var(--navy))]/20 hover:border-[hsl(var(--navy))]/50"
                      }`}
                    >
                      {v.image_url && (
                        <span className="w-6 h-6 rounded-sm overflow-hidden border border-white/40 bg-[hsl(var(--ivory))]">
                          <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                        </span>
                      )}
                      {v.name}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Membership gate (members-only products) */}
            {membersOnly && gateReason && (
              <div className="border border-[hsl(var(--navy))]/15 bg-white rounded-sm p-5 mb-5">
                {gateReason === "signed_out" ? (
                  <>
                    <p className="font-display text-base tracking-wider text-[hsl(var(--navy))] mb-1">MEMBERS ONLY</p>
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed mb-4">
                      Bracelets belong to MINDCAST members. Sign in to buy yours.
                    </p>
                    <Link
                      to="/auth"
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90"
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="font-display text-base tracking-wider text-[hsl(var(--navy))] mb-1">ACTIVE MEMBERSHIP REQUIRED</p>
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed mb-4">
                      Bracelets are for members with an active MINDCAST membership. Start or reactivate yours, then come back.
                    </p>
                    <Link
                      to="/portal/billing"
                      className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90"
                    >
                      Manage membership
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Bracelet recipient flow (active members) */}
            {membersOnly && gate.allowed && isBracelet && (
              <div className="border border-[hsl(var(--navy))]/15 bg-white rounded-sm p-5 mb-5">
                <p className="text-[10px] font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] mb-3">Who is this bracelet for?</p>
                <div className="grid gap-2 mb-4" role="radiogroup" aria-label="Bracelet recipient">
                  <button
                    type="button"
                    onClick={() => { setRecipientMode("self"); setGateError(null); }}
                    role="radio"
                    aria-checked={recipientMode === "self"}
                    className={`border rounded-xl px-4 py-3 text-left text-sm font-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      recipientMode === "self" ? "border-primary bg-primary/5 text-[hsl(var(--navy))]" : "border-[hsl(var(--navy))]/15 text-[hsl(var(--navy-mid))] hover:border-[hsl(var(--navy))]/40"
                    }`}
                  >
                    Me {profile?.first_name || profile?.name ? `— ${profile.first_name || profile.name}` : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRecipientMode("member"); setGateError(null); }}
                    role="radio"
                    aria-checked={recipientMode === "member"}
                    className={`border rounded-xl px-4 py-3 text-left text-sm font-body transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      recipientMode === "member" ? "border-primary bg-primary/5 text-[hsl(var(--navy))]" : "border-[hsl(var(--navy))]/15 text-[hsl(var(--navy-mid))] hover:border-[hsl(var(--navy))]/40"
                    }`}
                  >
                    A member of my household
                  </button>
                </div>

                {recipientMode === "member" && (
                  <div className="grid gap-2 mb-4">
                    <label htmlFor="bracelet-member-name" className="sr-only">Household member first name</label>
                    <input
                      id="bracelet-member-name"
                      type="text"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="Their first name"
                      autoComplete="name"
                      className="border border-[hsl(var(--navy))]/15 rounded-xl px-4 py-3 text-sm font-body bg-[hsl(var(--ivory))] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <label htmlFor="bracelet-member-email" className="sr-only">Household member Mindcast account email</label>
                    <input
                      id="bracelet-member-email"
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="Their MINDCAST account email"
                      autoComplete="email"
                      className="border border-[hsl(var(--navy))]/15 rounded-xl px-4 py-3 text-sm font-body bg-[hsl(var(--ivory))] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                    <p className="text-[11px] font-body text-[hsl(var(--navy-mid))]/70">
                      They need their own MINDCAST login. Children without logins can't receive bracelets yet.
                    </p>
                  </div>
                )}

                {isValidEmail(recipientEmail) && (
                  canClaimFree ? (
                    <p className="text-[11px] font-body text-primary mb-3">
                      Founding member — this bracelet is free. One per person, ever.
                    </p>
                  ) : recipientState === "claimed" ? (
                    <p className="text-[11px] font-body text-[hsl(var(--navy-mid))] mb-3">
                      This member's free founding bracelet has already been claimed — replacements are $5.00.
                    </p>
                  ) : recipientState === "exhausted" ? (
                    <p className="text-[11px] font-body text-[hsl(var(--navy-mid))] mb-3">
                      The first 100 founding bracelets are gone — this one is $5.00.
                    </p>
                  ) : null
                )}

                {SHOP_COMING_SOON ? (
                  <p className="text-sm font-body text-[hsl(var(--navy-mid))]">Bracelets are coming soon — check back shortly to claim yours.</p>
                ) : claimResult ? (
                  <div className="border border-primary/30 bg-primary/5 rounded-sm p-4">
                    <p className="font-display text-base tracking-wider text-[hsl(var(--navy))] mb-1">CLAIMED — IT'S YOURS</p>
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed">
                      Order {claimResult.order_number}. Show pickup code <strong className="text-[hsl(var(--navy))]">{claimResult.pickup_code}</strong> at the counter.
                    </p>
                  </div>
                ) : canClaimFree ? (
                  <button
                    onClick={claimFree}
                    disabled={claimBusy}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {claimBusy ? "Claiming…" : "Claim free bracelet — $0.00"}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[hsl(var(--navy))]/15 rounded-sm bg-[hsl(var(--ivory))]">
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-body text-[hsl(var(--navy))]">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="p-2.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]" aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={addBraceletToCart}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity"
                    >
                      {added ? <Check size={13} /> : <ShoppingBag size={13} />}
                      {added ? "Added" : `Add to cart — ${formatMoney(unitPrice, product?.currency)}`}
                    </button>
                  </div>
                )}

                {gateError && <p className="text-sm text-red-700 font-body mt-3">{gateError}</p>}
              </div>
            )}

            {/* Quantity + add (regular products) */}
            {!(membersOnly) && (
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
                  disabled={SHOP_COMING_SOON || blocked || (hasOptions && !variantId)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {added ? <Check size={13} /> : <ShoppingBag size={13} />}
                  {SHOP_COMING_SOON ? "Coming soon" : blocked ? "Out of stock" : added ? "Added" : hasOptions && !variantId ? "Choose an option" : "Add to cart"}
                </button>
              </div>
            )}

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
      </main>

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

      <SiteFooter />
    </div>
  );
};

export default ShopProduct;