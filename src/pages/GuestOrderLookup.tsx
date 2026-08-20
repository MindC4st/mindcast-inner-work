// /orders/lookup — secure guest order lookup.
//
// Guest buyers have no account, so they find their order with the order
// number + the email they checked out with. The lookup runs through
// shop-admin's guest_lookup action, which never reveals whether an order
// exists unless the email matches — order numbers alone are not a key.

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Search, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/shop";
import { FULFILMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/commerce";

type LookupOrder = {
  order_number: string;
  created_at: string;
  amount_total_cents: number;
  currency: string;
  payment_status: string;
  fulfilment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  items: { product_name: string; quantity: number; line_total_cents: number }[];
};

const GuestOrderLookup = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<LookupOrder | null>(null);

  const lookup = async () => {
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("shop-admin", {
        body: { action: "guest_lookup", order_number: orderNumber.trim(), email: email.trim() },
      });
      if (fnErr) {
        let detail = fnErr.message;
        try {
          const ctx = (fnErr as { context?: { body?: unknown } }).context;
          if (ctx?.body) {
            const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body as ReadableStream).text();
            const parsed = JSON.parse(text);
            if (parsed?.error) detail = parsed.error;
          }
        } catch { /* keep generic */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setOrder(data?.order ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[hsl(var(--navy))]/[0.08]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-[hsl(var(--navy))]">MINDCAST</Link>
        <Link to="/shop" className="flex items-center gap-2 text-[10px] tracking-[0.15em] font-body uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]">
          <ArrowLeft size={12} /> Shop
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 pt-12 pb-20">
        <p className="text-[10px] font-body tracking-[0.35em] uppercase text-primary mb-2">Shop</p>
        <h1 className="font-display text-3xl tracking-wider text-[hsl(var(--navy))] mb-3">FIND AN ORDER</h1>
        <p className="text-[hsl(var(--navy-mid))] text-sm font-body leading-relaxed mb-8">
          Enter your order number and the email you used at checkout.
        </p>

        <div className="space-y-3 mb-4">
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="Order number — e.g. MC-100001"
            className="w-full px-4 py-3 text-sm bg-white border border-[hsl(var(--navy))]/15 rounded-sm focus:outline-none focus:border-primary"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 text-sm bg-white border border-[hsl(var(--navy))]/15 rounded-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={lookup}
            disabled={busy || !orderNumber.trim() || !email.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] py-3.5 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {busy ? "Looking…" : "Find order"}
          </button>
          {error && <p className="text-sm text-red-700 font-body">{error}</p>}
        </div>

        {order && (
          <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-display text-xl tracking-wider text-[hsl(var(--navy))]">{order.order_number}</p>
                <p className="text-[11px] font-body text-[hsl(var(--navy-mid))]">
                  {new Date(order.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className="font-display text-xl text-[hsl(var(--navy))]">{formatMoney(order.amount_total_cents, order.currency)}</span>
            </div>

            <div className="flex gap-2 mb-4">
              <span className="text-[10px] font-body tracking-widest uppercase px-2 py-0.5 rounded-sm border border-[hsl(var(--navy))]/20 text-[hsl(var(--navy-mid))]">
                {PAYMENT_STATUS_LABEL[order.payment_status] || order.payment_status}
              </span>
              <span className="text-[10px] font-body tracking-widest uppercase px-2 py-0.5 rounded-sm border border-[hsl(var(--navy))]/20 text-[hsl(var(--navy-mid))]">
                {FULFILMENT_STATUS_LABEL[order.fulfilment_status] || order.fulfilment_status}
              </span>
            </div>

            <ul className="text-sm font-body text-[hsl(var(--navy-mid))] space-y-1 mb-4">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{it.product_name}{it.quantity > 1 ? ` ×${it.quantity}` : ""}</span>
                  <span>{formatMoney(it.line_total_cents, order.currency)}</span>
                </li>
              ))}
            </ul>

            {order.tracking_number && (
              <div className="border-t border-[hsl(var(--navy))]/10 pt-4 text-sm font-body text-[hsl(var(--navy-mid))]">
                <p className="flex items-center gap-2 mb-1">
                  <Truck size={14} strokeWidth={1.6} />
                  Shipped{order.shipped_at ? ` ${new Date(order.shipped_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long" })}` : ""}
                </p>
                <p>
                  Tracking: <span className="font-semibold text-[hsl(var(--navy))]">{order.tracking_number}</span>
                  {order.tracking_url && (
                    <>
                      {" · "}
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        Track package
                      </a>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestOrderLookup;
