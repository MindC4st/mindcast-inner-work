// /portal/orders — the member's orders: pickup codes for counter buys,
// shipping status and tracking for posted orders.
//
// A Stripe receipt is not a collection token: a screenshot can be re-used and
// a refunded payment looks identical to a paid one. Counter orders show a
// short pickup code here, and tapping "Collected" in front of the counter
// spends it — no staff hardware needed. Shipped orders show their tracking
// instead. The database refuses a second collection outright (see the guard
// trigger in 20260816140000_shop_products_orders.sql).

import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { describeOrder, formatMoney, spacedCode } from "@/lib/shop";

type OrderItem = {
  product_name: string;
  quantity: number;
  line_total_cents: number;
};

type Order = {
  id: string;
  order_number: string | null;
  product_name: string;
  quantity: number;
  amount_total_cents: number;
  currency: string;
  fulfilment: string;
  pickup_code: string;
  status: string;
  collected_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  partner_name: string | null;
  created_at: string;
  shop_order_items?: OrderItem[];
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
      .select("id, order_number, product_name, quantity, amount_total_cents, currency, fulfilment, pickup_code, status, collected_at, shipped_at, tracking_number, tracking_url, partner_name, created_at, shop_order_items(product_name, quantity, line_total_cents)")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as unknown as Order[]);
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
          Counter orders: show your pickup code, then tap Collected. Shipped
          orders: track the delivery below.
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
              const shipped = o.fulfilment === "ship";
              const view = describeOrder(o.status, o.collected_at);
              const tone = TONE[view.tone];
              const items = (o.shop_order_items ?? []).filter(Boolean);
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-sm p-6 shadow-sm ${tone.card}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className={`font-display text-lg tracking-wider leading-tight ${tone.label}`}>
                        {o.product_name.toUpperCase()}
                        {!shipped && o.quantity > 1 && ` ×${o.quantity}`}
                      </p>
                      {o.order_number && (
                        <p className={`text-[10px] font-body tracking-[0.15em] uppercase mt-1 ${tone.helper}`}>
                          Order {o.order_number}
                        </p>
                      )}
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

                  {items.length > 1 && (
                    <ul className={`text-[11px] font-body mb-3 space-y-0.5 ${tone.helper}`}>
                      {items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-3">
                          <span>{it.product_name}{it.quantity > 1 ? ` ×${it.quantity}` : ""}</span>
                          <span>{formatMoney(it.line_total_cents, o.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className={`text-[10px] font-body tracking-[0.4em] uppercase mb-1 ${tone.helper}`}>
                    {view.label}
                  </p>

                  {shipped ? (
                    <div className={`text-[11px] font-body leading-relaxed ${tone.helper}`}>
                      {o.status === "shipped" && o.tracking_number && (
                        <p className="mb-1">
                          Tracking: <span className="font-semibold">{o.tracking_number}</span>
                          {o.tracking_url && (
                            <>
                              {" · "}
                              <a href={o.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">
                                Track delivery
                              </a>
                            </>
                          )}
                        </p>
                      )}
                      <p>
                        {o.status === "paid" && "We're preparing your order — you'll get an email when it ships."}
                        {o.status === "shipped" && "Your order is on its way."}
                        {o.status === "refunded" && "This order was refunded."}
                        {o.status === "cancelled" && "This order was cancelled."}
                      </p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}

                  {shipped && o.status === "paid" && (
                    <p className={`mt-3 text-[10px] font-body flex items-center gap-1.5 ${tone.helper}`}>
                      <Truck size={12} strokeWidth={1.6} /> Ships New Zealand-wide
                    </p>
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
