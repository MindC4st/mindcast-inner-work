// AdminOrdersTab — the fulfilment side of the shop.
//
// Lists every order (counter and shipped), and drives the staff actions the
// database guard keeps out of client hands: marking an order shipped (with
// tracking), resending the confirmation email, and editing the note. All
// actions run through the shop-order-update edge function under service role.

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { toast } from "sonner";
import { Loader2, PackageCheck, RefreshCw, Search, Truck, X } from "lucide-react";

type OrderItem = {
  product_name: string;
  slug: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

type Order = {
  id: string;
  order_number: string | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  amount_total_cents: number;
  shipping_cents: number;
  currency: string;
  fulfilment: string;
  status: string;
  customer_email: string | null;
  ship_name: string | null;
  ship_line1: string | null;
  ship_line2: string | null;
  ship_city: string | null;
  ship_postcode: string | null;
  ship_country: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  confirmation_email_sent_at: string | null;
  shipped_email_sent_at: string | null;
  pickup_code: string;
  note: string | null;
  created_at: string;
  shop_order_items?: OrderItem[];
};

const STATUSES = ["all", "paid", "shipped", "collected", "refunded", "cancelled"] as const;

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-[hsl(var(--blue))]/10 text-[hsl(var(--blue))] border-[hsl(var(--blue))]/30",
  shipped: "bg-[hsl(152_48%_30%)]/10 text-[hsl(152_48%_30%)] border-[hsl(152_48%_30%)]/30",
  collected: "bg-foreground/5 text-muted-foreground border-border",
  refunded: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db
      .from("shop_orders")
      .select("id, order_number, product_name, quantity, unit_price_cents, amount_total_cents, shipping_cents, currency, fulfilment, status, customer_email, ship_name, ship_line1, ship_line2, ship_city, ship_postcode, ship_country, tracking_number, tracking_url, shipped_at, confirmation_email_sent_at, shipped_email_sent_at, pickup_code, note, created_at, shop_order_items(product_name, slug, quantity, unit_price_cents, line_total_cents)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) {
      toast.error("Could not load orders", { description: error.message });
    } else {
      setOrders((data ?? []) as unknown as Order[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        (o.order_number || "").toLowerCase().includes(q) ||
        (o.customer_email || "").toLowerCase().includes(q) ||
        (o.ship_name || "").toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const openOrder = (o: Order) => {
    setSelected(o);
    setTrackingNumber(o.tracking_number || "");
    setTrackingUrl(o.tracking_url || "");
  };

  const act = async (orderId: string, action: string, extra: Record<string, string> = {}) => {
    setBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("shop-order-update", {
        body: { order_id: orderId, action, ...extra },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: { body?: unknown } }).context;
          if (ctx?.body) {
            const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body as ReadableStream).text();
            const parsed = JSON.parse(text);
            if (parsed?.error) detail = parsed.error;
          }
        } catch { /* keep generic */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      return data;
    } finally {
      setBusy(null);
    }
  };

  const markShipped = async () => {
    if (!selected) return;
    try {
      const res = await act(selected.id, "mark_shipped", {
        tracking_number: trackingNumber.trim(),
        tracking_url: trackingUrl.trim(),
      });
      toast.success("Order marked shipped", {
        description: res?.email_sent ? "Shipping email sent to the customer." : "Saved — the shipping email could not be sent (resend from here).",
      });
      await load();
      const fresh = orders.find((o) => o.id === selected.id);
      setSelected(fresh ? { ...fresh, status: "shipped", tracking_number: trackingNumber.trim() || null, tracking_url: trackingUrl.trim() || null } : null);
    } catch (e) {
      toast.error("Could not mark shipped", { description: e instanceof Error ? e.message : undefined });
    }
  };

  const resendConfirmation = async () => {
    if (!selected) return;
    try {
      await act(selected.id, "resend_confirmation");
      toast.success("Confirmation email sent");
      await load();
    } catch (e) {
      toast.error("Could not resend", { description: e instanceof Error ? e.message : undefined });
    }
  };

  const items = (selected?.shop_order_items ?? []).filter(Boolean);
  const singleItem = selected && items.length === 0
    ? [{ product_name: selected.product_name, quantity: selected.quantity, line_total_cents: selected.unit_price_cents * selected.quantity }]
    : items;

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl tracking-wider text-primary mb-1">SHOP ORDERS</h2>
        <p className="text-sm text-muted-foreground">
          Counter pickups and shipped orders. Mark shipped to notify the customer with tracking.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm border transition-colors ${
              filter === s ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, email, name…"
            className="pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-sm w-64 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="border border-border bg-card rounded-sm p-12 text-center">
          <p className="font-display text-lg tracking-wider text-foreground mb-1">NO ORDERS</p>
          <p className="text-sm text-muted-foreground">Orders appear here as soon as someone checks out.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.03] text-left">
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Order</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Date</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Customer</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Items</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Total</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className="border-b border-border last:border-0 hover:bg-foreground/[0.03] cursor-pointer"
                >
                  <td className="px-4 py-3 font-body">
                    <span className="font-semibold">{o.order_number || "—"}</span>
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {o.fulfilment === "ship" ? "ship" : o.fulfilment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="max-w-[220px] truncate">{o.ship_name || o.customer_email || "—"}</div>
                    {o.ship_name && o.customer_email && (
                      <div className="text-[11px] text-muted-foreground max-w-[220px] truncate">{o.customer_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <div className="truncate">{o.product_name}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-body">{formatMoney(o.amount_total_cents, o.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-body tracking-widest uppercase rounded-sm border ${STATUS_STYLE[o.status] || "bg-foreground/5 text-muted-foreground border-border"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md h-full bg-card border-l border-border overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <p className="font-display text-lg tracking-wider text-foreground">{selected.order_number || "ORDER"}</p>
                <p className="text-[11px] text-muted-foreground">{fmtDate(selected.created_at)} Â· {selected.fulfilment === "ship" ? "Shipped goods" : "Counter pickup"}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Status + totals */}
              <div className="flex items-center justify-between">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-body tracking-widest uppercase rounded-sm border ${STATUS_STYLE[selected.status] || "bg-foreground/5 text-muted-foreground border-border"}`}>
                  {selected.status}
                </span>
                <span className="font-display text-xl text-foreground">{formatMoney(selected.amount_total_cents, selected.currency)}</span>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Items</p>
                <div className="space-y-1.5">
                  {singleItem.map((it, i) => (
                    <div key={i} className="flex justify-between gap-3 text-sm">
                      <span>{it.product_name}{it.quantity > 1 ? ` Ã—${it.quantity}` : ""}</span>
                      <span className="text-muted-foreground">{formatMoney(it.line_total_cents, selected.currency)}</span>
                    </div>
                  ))}
                  {selected.fulfilment === "ship" && (
                    <div className="flex justify-between gap-3 text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>{selected.shipping_cents > 0 ? formatMoney(selected.shipping_cents, selected.currency) : "Free"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer + address */}
              <div>
                <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">
                  {selected.fulfilment === "ship" ? "Deliver to" : "Customer"}
                </p>
                <div className="text-sm leading-relaxed">
                  {selected.ship_name && <p>{selected.ship_name}</p>}
                  {selected.ship_line1 && <p>{selected.ship_line1}</p>}
                  {selected.ship_line2 && <p>{selected.ship_line2}</p>}
                  {(selected.ship_city || selected.ship_postcode) && (
                    <p>{[selected.ship_city, selected.ship_postcode].filter(Boolean).join(" ")}</p>
                  )}
                  {selected.ship_country && <p>{selected.ship_country}</p>}
                  {selected.customer_email && <p className="text-muted-foreground">{selected.customer_email}</p>}
                  {!selected.ship_name && !selected.customer_email && <p className="text-muted-foreground">—</p>}
                </div>
              </div>

              {selected.fulfilment !== "ship" && (
                <div>
                  <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1">Pickup code</p>
                  <p className="font-display text-3xl tracking-[0.25em] text-foreground">{selected.pickup_code}</p>
                </div>
              )}

              {/* Shipping actions */}
              {selected.fulfilment === "ship" && selected.status === "paid" && (
                <div className="border border-border rounded-sm p-4 space-y-3">
                  <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                    <Truck size={12} /> Mark shipped
                  </p>
                  <input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Tracking number (optional)"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
                  />
                  <input
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="Tracking URL (optional)"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={markShipped}
                    disabled={busy === "mark_shipped"}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 text-[11px] font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === "mark_shipped" ? <Loader2 size={13} className="animate-spin" /> : <PackageCheck size={13} />}
                    Mark shipped & email customer
                  </button>
                </div>
              )}

              {selected.fulfilment === "ship" && selected.status === "shipped" && (
                <div className="border border-border rounded-sm p-4 text-sm space-y-1">
                  <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1">Shipped</p>
                  {selected.shipped_at && <p className="text-muted-foreground">{fmtDate(selected.shipped_at)}</p>}
                  {selected.tracking_number && <p>Tracking: <span className="font-semibold">{selected.tracking_number}</span></p>}
                  {selected.tracking_url && (
                    <a href={selected.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary underline block">
                      Tracking link
                    </a>
                  )}
                </div>
              )}

              {/* Emails */}
              <div className="border border-border rounded-sm p-4 space-y-2">
                <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Emails</p>
                <p className="text-xs text-muted-foreground">
                  Confirmation: {selected.confirmation_email_sent_at ? `sent ${fmtDate(selected.confirmation_email_sent_at)}` : "not sent"}
                  {selected.fulfilment === "ship" && (
                    <> Â· Shipped: {selected.shipped_email_sent_at ? `sent ${fmtDate(selected.shipped_email_sent_at)}` : "not sent"}</>
                  )}
                </p>
                <button
                  onClick={resendConfirmation}
                  disabled={busy === "resend_confirmation" || !selected.customer_email}
                  className="flex items-center gap-2 text-[11px] font-body tracking-widest uppercase text-primary hover:opacity-80 disabled:opacity-40"
                >
                  {busy === "resend_confirmation" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Resend confirmation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTab;