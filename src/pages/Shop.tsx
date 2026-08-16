// /shop — public catalogue. Browsing needs no account; buying does, because an
// order needs an owner for its pickup code.
//
// Payment is Stripe Checkout in the member's browser: card-not-present, so no
// POS terminal and no card reader. Apple Pay / Google Pay show up automatically
// in Checkout, which is what makes this workable while standing in a queue.

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { useTodaysSession } from "@/hooks/useTodaysSession";

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  currency: string;
  category: string | null;
  fulfilment: string;
  partner_name: string | null;
};

const Shop = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session: todays } = useTodaysSession(profile?.age_group);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const cancelled = searchParams.get("purchase") === "cancelled";

  useEffect(() => {
    let active = true;
    db.from("shop_products")
      .select("id, slug, name, description, image_url, price_cents, currency, category, fulfilment, partner_name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const buy = async (slug: string) => {
    if (!user) { navigate(`/portal/login?next=${encodeURIComponent("/shop")}`); return; }
    setBusy(slug); setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-shop-checkout", {
        // Tagging the order with today's session lets a runner batch a partner
        // order and have it ready as that session ends.
        body: { slug, quantity: 1, scheduled_session_id: todays?.id ?? null },
      });
      if (fnErr) throw fnErr;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not start checkout");
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong");
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[hsl(var(--navy))]/[0.08]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-[hsl(var(--navy))]">MINDCAST</Link>
        <Link to="/portal/orders" className="text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
          My orders
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        <p className="text-[10px] font-body tracking-[0.35em] uppercase text-primary mb-2">Shop</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider text-[hsl(var(--navy))] mb-3">SHOP NOW</h1>
        <p className="text-[hsl(var(--navy-mid))] text-sm font-body leading-relaxed mb-10 max-w-md">
          Order on your phone and collect at the counter — show your pickup code, no queueing to pay.
        </p>

        {cancelled && (
          <div className="border border-[hsl(var(--navy))]/15 bg-white rounded-sm p-4 mb-8">
            <p className="text-sm font-body text-[hsl(var(--navy-mid))]">
              Checkout cancelled — nothing was charged.
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-xs font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/60">Loading…</p>
        ) : products.length === 0 ? (
          <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-10 text-center">
            <ShoppingBag className="mx-auto mb-4 text-[hsl(var(--navy))]/20" size={30} strokeWidth={1.4} />
            <p className="font-display text-xl tracking-wider text-[hsl(var(--navy))] mb-1">NOTHING HERE YET</p>
            <p className="text-sm font-body text-[hsl(var(--navy-mid))]">
              Products will appear here as we add them.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm overflow-hidden flex flex-col shadow-sm"
              >
                {p.image_url && (
                  <img src={p.image_url} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="font-display text-xl tracking-wider text-[hsl(var(--navy))] leading-tight">
                      {p.name.toUpperCase()}
                    </h2>
                    <span className="font-display text-xl text-[hsl(var(--navy))] shrink-0">
                      {formatMoney(p.price_cents, p.currency)}
                    </span>
                  </div>
                  {p.partner_name && (
                    <p className="text-[10px] font-body tracking-[0.15em] uppercase text-primary mb-2">
                      From {p.partner_name}
                    </p>
                  )}
                  {p.description && (
                    <p className="text-sm font-body text-[hsl(var(--navy-mid))] leading-relaxed flex-1 mb-4">
                      {p.description}
                    </p>
                  )}
                  <button
                    onClick={() => buy(p.slug)}
                    disabled={busy === p.slug}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {busy === p.slug ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                    {busy === p.slug ? "Opening…" : user ? "Buy now" : "Sign in to buy"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-700 font-body mt-6">{error}</p>}
      </div>
    </div>
  );
};

export default Shop;
