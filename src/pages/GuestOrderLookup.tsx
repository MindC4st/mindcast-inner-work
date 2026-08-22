// Secure guest order lookup. The edge function only returns an order when the
// supplied checkout email matches; an order number alone reveals nothing.

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Search, ShieldCheck, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/shop";
import { FULFILMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/commerce";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke("shop-admin", {
        body: { action: "guest_lookup", order_number: orderNumber.trim(), email: email.trim() },
      });
      if (functionError) {
        let detail = functionError.message;
        try {
          const context = (functionError as { context?: { body?: unknown } }).context;
          if (context?.body) {
            const text = typeof context.body === "string" ? context.body : await new Response(context.body as ReadableStream).text();
            const parsed = JSON.parse(text);
            if (parsed?.error) detail = parsed.error;
          }
        } catch { /* keep the safe generic response */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setOrder(data?.order ?? null);
    } catch (caught: unknown) {
      setError(caught instanceof Error && caught.message ? caught.message : "We couldn't find that order just now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <main className="px-5 pb-20 pt-28 sm:px-8 lg:px-12 lg:pt-32">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/shop"
            className="mb-8 inline-flex min-h-10 items-center gap-2 rounded-lg font-body text-sm font-semibold text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to shop
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)] lg:gap-16">
            <section>
              <p className="portal-label mb-3">Guest orders</p>
              <h1 className="font-serif text-5xl leading-tight text-primary sm:text-6xl">Find your order.</h1>
              <p className="mt-5 max-w-lg font-body text-sm leading-7 text-muted-foreground">
                Use the order number from your confirmation email and the same email address you entered at checkout.
              </p>

              <form onSubmit={lookup} className="mt-9 space-y-5">
                <div>
                  <label htmlFor="order-number" className="font-body text-sm font-semibold text-foreground">Order number</label>
                  <input
                    id="order-number"
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                    placeholder="e.g. MC-100001"
                    autoComplete="off"
                    required
                    className="mt-2 w-full rounded-xl border border-foreground/10 bg-white px-4 py-3.5 font-body text-base uppercase text-foreground shadow-sm outline-none transition placeholder:normal-case placeholder:text-muted-foreground/45 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label htmlFor="order-email" className="font-body text-sm font-semibold text-foreground">Checkout email</label>
                  <input
                    id="order-email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="mt-2 w-full rounded-xl border border-foreground/10 bg-white px-4 py-3.5 font-body text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/45 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || !orderNumber.trim() || !email.trim()}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3 font-body text-sm font-semibold text-cream shadow-sm transition hover:bg-navy-mid focus:outline-none focus:ring-4 focus:ring-navy/15 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                  {busy ? "Looking for your order…" : "Find order"}
                </button>
                {error && <p className="rounded-xl border border-destructive/15 bg-destructive/[0.04] p-4 font-body text-sm leading-6 text-destructive" role="alert">{error}</p>}
              </form>

              <div className="mt-9 flex items-start gap-3 border-t border-foreground/[0.07] pt-6">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="font-body text-xs leading-5 text-muted-foreground">For privacy, the order number and checkout email must both match.</p>
              </div>
            </section>

            <section aria-live="polite" aria-label="Order result">
              {!order && !busy && (
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-foreground/10 bg-white/45 p-10 text-center">
                  <div>
                    <Search className="mx-auto h-8 w-8 text-foreground/15" aria-hidden="true" />
                    <p className="mt-4 font-body text-sm leading-6 text-muted-foreground">Your order details will appear here.</p>
                  </div>
                </div>
              )}

              {busy && (
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-foreground/[0.07] bg-white" role="status">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                  <span className="ml-3 font-body text-sm text-muted-foreground">Checking securely…</span>
                </div>
              )}

              {order && (
                <article className="overflow-hidden rounded-3xl border border-foreground/[0.08] bg-white shadow-xl shadow-navy/[0.05]">
                  <div className="border-b border-foreground/[0.07] bg-navy p-6 text-cream sm:p-8">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-blue-light/70">Order found</p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-3xl">{order.order_number}</h2>
                        <p className="mt-1 font-body text-xs text-cream/55">
                          {new Date(order.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <p className="font-body text-lg font-semibold">{formatMoney(order.amount_total_cents, order.currency)}</p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="mb-6 flex flex-wrap gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/[0.06] px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
                        {PAYMENT_STATUS_LABEL[order.payment_status] || order.payment_status}
                      </span>
                      <span className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                        {FULFILMENT_STATUS_LABEL[order.fulfilment_status] || order.fulfilment_status}
                      </span>
                    </div>

                    <h3 className="portal-label mb-3">Items</h3>
                    <ul className="divide-y divide-foreground/[0.07] border-y border-foreground/[0.07]">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between gap-4 py-3 font-body text-sm text-muted-foreground">
                          <span>{item.product_name}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
                          <span className="font-semibold text-foreground">{formatMoney(item.line_total_cents, order.currency)}</span>
                        </li>
                      ))}
                    </ul>

                    {order.tracking_number && (
                      <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/[0.05] p-5 font-body text-sm text-muted-foreground">
                        <p className="flex items-center gap-2 font-semibold text-foreground">
                          <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
                          Shipped{order.shipped_at ? ` ${new Date(order.shipped_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long" })}` : ""}
                        </p>
                        <p className="mt-2">Tracking: <span className="font-semibold text-foreground">{order.tracking_number}</span></p>
                        {order.tracking_url && (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
                            Track package <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default GuestOrderLookup;