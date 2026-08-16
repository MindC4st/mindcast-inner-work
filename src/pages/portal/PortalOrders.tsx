// /portal/orders — the member's pickup codes.
//
// This is the fulfilment half of the shop. A Stripe receipt is not a
// collection token: a screenshot can be re-used and a refunded payment looks
// identical to a paid one. So the member shows a short pickup code here, and
// tapping "Collected" in front of the counter spends it — no staff hardware
// needed. A spent code renders grey with the time it was used, and the
// database refuses a second collection outright (see the guard trigger in
// 20260816140000_shop_products_orders.sql).

import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { describeOrder, formatMoney, spacedCode } from "@/lib/shop";

type Order = {
  id: string;
  product_name: string;
  quantity: number;
  amount_total_cents: number;
  currency: string;
  pickup_code: string;
  status: string;
  collected_at: string | null;
  partner_name: string | null;
  created_at: string;
};

const TONE = {
  ready: {
    card: "border-[hsl(152_48%_30%)]/40 bg-[hsl(152_48%_19%)]",
    label: "text-[hsl(150_70%_90%)]",
    helper: "text-[hsl(150_32%_80%)]",
    code: "text-[hsl(150_75%_92%)]",
  },
  spent: {
    card: "border-[hsl(var(--navy))]/12 bg-white",
    label: "text-[hsl(var(--navy))]/55",
    helper: "text-[hsl(var(--navy-mid))]/70",
    code: "text-[hsl(var(--navy))]/25",
  },
  void: {
    card: "border-[hsl(2_50%_45%)]/30 bg-[hsl(2_62%_26%)]",
    label: "text-[hsl(6_92%_90%)]",
    helper: "text-[hsl(6_48%_84%)]",
    code: "text-[hsl(6_60%_80%)]/50",
  },
} as const;

const PortalOrders = () => {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const justPurchased = searchParams.get("purchase") === "success";

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await db
      .from("shop_orders")
      .select("id, product_name, quantity, amount_total_cents, currency, pickup_code, status, collected_at, partner_name, created_at")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  // Stripe redirects back the instant payment succeeds, which can beat the
  // webhook that writes the order. Re-check a few times before concluding the
  // list is empty, rather than telling someone who just paid that they have
  // nothing.
  useEffect(() => {
    if (!justPurchased || !profile?.id) return;
    let tries = 0;
    const t = setInterval(() => {
      tries += 1;
      load();
      if (tries >= 6) clearInterval(t);
    }, 1500);
    return () => clearInterval(t);
  }, [justPurchased, profile?.id, load]);

  const collect = async (order: Order) => {
    setBusy(order.id); setError("");
    const { error: upErr } = await db
      .from("shop_orders")
      .update({ status: "collected" })
      .eq("id", order.id);
    if (upErr) {
      // The guard trigger rejects a second collection — surface that plainly
      // rather than pretending it worked.
      setError(upErr.message || "Could not mark that as collected");
    }
    await load();
    setBusy(null);
  };

  const pending = justPurchased && orders.length === 0 && !loading;

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[hsl(var(--navy))]/[0.08]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-[hsl(var(--navy))]">MINDCAST</Link>
        <Link to="/portal/dashboard" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 pt-12 pb-20">
        <p className="text-[10px] font-body tracking-[0.35em] uppercase text-primary mb-2">Shop</p>
        <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">MY ORDERS</h1>
        <p className="text-[hsl(var(--navy-mid))] text-sm font-body leading-relaxed mb-8">
          Show your pickup code at the counter, then tap Collected.
        </p>

        {loading || pending ? (
          <p className="text-xs font-body uppercase tracking-widest text-[hsl(var(--navy-mid))]/60">
            {pending ? "Confirming your payment…" : "Loading…"}
          </p>
        ) : orders.length === 0 ? (
          <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-10 text-center">
            <ShoppingBag className="mx-auto mb-4 text-[hsl(var(--navy))]/20" size={30} strokeWidth={1.4} />
            <p className="font-display text-xl tracking-wider text-[hsl(var(--navy))] mb-3">NO ORDERS YET</p>
            <Link to="/shop" className="text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">
              Visit the shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const view = describeOrder(o.status, o.collected_at);
              const tone = TONE[view.tone];
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-sm p-6 shadow-sm ${tone.card}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className={`font-display text-lg tracking-wider leading-tight ${tone.label}`}>
                        {o.product_name.toUpperCase()}
                        {o.quantity > 1 && ` ×${o.quantity}`}
                      </p>
                      {o.partner_name && (
                        <p className={`text-[10px] font-body tracking-[0.15em] uppercase mt-1 ${tone.helper}`}>
                          From {o.partner_name}
                        </p>
                      )}
                    </div>
                    <span className={`font-display text-lg shrink-0 ${tone.label}`}>
                      {formatMoney(o.amount_total_cents, o.currency)}
                    </span>
                  </div>

                  <p className={`text-[10px] font-body tracking-[0.4em] uppercase mb-1 ${tone.helper}`}>
                    {view.label}
                  </p>
                  <p className={`font-display text-5xl tracking-[0.25em] leading-none mb-3 ${tone.code} ${!view.redeemable ? "line-through" : ""}`}>
                    {spacedCode(o.pickup_code)}
                  </p>
                  <p className={`text-[11px] font-body leading-relaxed ${tone.helper}`}>
                    {view.helper}
                  </p>

                  {view.redeemable && (
                    <button
                      onClick={() => collect(o)}
                      disabled={busy === o.id}
                      className="mt-5 w-full flex items-center justify-center gap-2 bg-[hsl(var(--ivory))] text-[hsl(var(--navy))] py-3.5 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {busy === o.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      {busy === o.id ? "Marking…" : "Collected — tap at the counter"}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-700 font-body mt-6">{error}</p>}
      </div>
    </div>
  );
};

export default PortalOrders;
