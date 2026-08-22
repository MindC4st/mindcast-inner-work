// CommerceOrders — order list + full order detail.
//
// The detail drawer is the Shopify-style working screen: statuses, customer,
// address, items, payment summary, immutable timeline, fulfilment actions
// (pick → pack → ship with tracking), refunds (full/partial with optional
// restock), email resends and a printable packing slip. All actions run
// through the shop-admin edge function, which enforces roles and writes the
// audit log + timeline.
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { FULFILMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL, fulfilmentTone, paymentTone } from "@/lib/commerce";
import { useCommerceRoles } from "@/hooks/useCommerceRoles";
import { toast } from "sonner";
import { Loader2, Printer, RefreshCw, Search, Truck, X } from "lucide-react";

type OrderItem = {
  id: string;
  product_name: string;
  slug: string;
  sku: string | null;
  variant_id: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
};

type OrderEvent = {
  id: string;
  type: string;
  actor_name: string | null;
  note: string | null;
  created_at: string;
};

type Fulfilment = {
  id: string;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
};

type Order = {
  id: string;
  order_number: string | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  amount_total_cents: number;
  shipping_cents: number;
  discount_cents: number;
  discount_code: string | null;
  gst_cents: number;
  refunded_cents: number;
  currency: string;
  fulfilment: string;
  status: string;
  payment_status: string;
  fulfilment_status: string;
  customer_email: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  ship_name: string | null;
  ship_line1: string | null;
  ship_line2: string | null;
  ship_city: string | null;
  ship_postcode: string | null;
  ship_country: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  pickup_code: string;
  note: string | null;
  created_at: string;
  shop_order_items?: OrderItem[];
  shop_order_events?: OrderEvent[];
  shop_fulfillments?: Fulfilment[];
};

const FILTERS = [
  "all", "today", "paid", "unpaid", "unfulfilled", "picking", "packed",
  "shipped", "refunded", "cancelled",
] as const;

const TONE_CLASS: Record<string, string> = {
  ready: "bg-[hsl(152_48%_30%)]/10 text-[hsl(152_48%_30%)] border-[hsl(152_48%_30%)]/30",
  warn: "bg-amber-500/10 text-amber-700 border-amber-600/30",
  void: "bg-foreground/5 text-muted-foreground border-border",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit" });

const CommerceOrders = () => {
  const roles = useCommerceRoles();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await db
      .from("shop_orders")
      .select("*, shop_order_items(*), shop_order_events(*), shop_fulfillments(*)")
      .order("created_at", { ascending: false })
      .limit(400);
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
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    return orders.filter((o) => {
      switch (filter) {
        case "today": if (new Date(o.created_at) < todayStart) return false; break;
        case "paid": if (!["paid", "partially_refunded"].includes(o.payment_status)) return false; break;
        case "unpaid": if (!["pending", "failed"].includes(o.payment_status)) return false; break;
        case "unfulfilled": if (o.fulfilment !== "ship" || o.fulfilment_status !== "unfulfilled") return false; break;
        case "picking": if (o.fulfilment_status !== "picking") return false; break;
        case "packed": if (o.fulfilment_status !== "packed") return false; break;
        case "shipped": if (!["shipped", "delivered"].includes(o.fulfilment_status)) return false; break;
        case "refunded": if (!["refunded", "partially_refunded"].includes(o.payment_status)) return false; break;
        case "cancelled": if (o.payment_status !== "cancelled" && o.status !== "cancelled") return false; break;
        default: break;
      }
      if (!q) return true;
      const items = o.shop_order_items ?? [];
      return (
        (o.order_number || "").toLowerCase().includes(q) ||
        (o.customer_email || "").toLowerCase().includes(q) ||
        (o.ship_name || "").toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        items.some((it) => (it.sku || "").toLowerCase().includes(q))
      );
    });
  }, [orders, filter, query]);

  const act = useCallback(async (action: string, payload: Record<string, unknown>) => {
    setBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("shop-admin", {
        body: { action, ...payload },
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
  }, []);

  const refreshSelected = useCallback(async (orderId: string) => {
    const { data } = await db
      .from("shop_orders")
      .select("*, shop_order_items(*), shop_order_events(*), shop_fulfillments(*)")
      .eq("id", orderId).maybeSingle();
    if (data) {
      const fresh = data as unknown as Order;
      setSelected(fresh);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? fresh : o)));
    }
  }, []);

  const items = selected?.shop_order_items ?? (selected ? [{
    id: "", product_name: selected.product_name, slug: "", sku: null, variant_id: null,
    unit_price_cents: selected.unit_price_cents, quantity: selected.quantity,
    line_total_cents: selected.unit_price_cents * selected.quantity,
  }] : []);

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h2 className="font-display text-2xl tracking-wider text-primary mb-1">ORDERS</h2>
        <p className="text-sm text-muted-foreground">Payment and fulfilment status are tracked separately.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm border transition-colors ${
              filter === f ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order #, name, email, SKU…"
            className="pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-sm w-64 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="border border-border bg-card rounded-sm p-12 text-center text-sm text-muted-foreground">
          No orders match.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.03] text-left">
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Order</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Date</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Customer</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Items</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Total</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Payment</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Fulfilment</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-border last:border-0 hover:bg-foreground/[0.03] cursor-pointer">
                  <td className="px-4 py-3 font-semibold">
                    {o.order_number || "—"}
                    <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">{o.fulfilment === "ship" ? "ship" : o.fulfilment}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(o.created_at)}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="truncate">{o.ship_name || o.customer_email || "Guest"}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]"><div className="truncate">{o.product_name}</div></td>
                  <td className="px-4 py-3 text-right">{formatMoney(o.amount_total_cents, o.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-body tracking-widest uppercase rounded-sm border ${TONE_CLASS[paymentTone(o.payment_status)]}`}>
                      {PAYMENT_STATUS_LABEL[o.payment_status] || o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-body tracking-widest uppercase rounded-sm border ${TONE_CLASS[fulfilmentTone(o.fulfilment_status)]}`}>
                      {FULFILMENT_STATUS_LABEL[o.fulfilment_status] || o.fulfilment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order detail drawer ── */}
      {selected && (
        <OrderDetail
          order={selected}
          items={items}
          roles={roles}
          busy={busy}
          onClose={() => setSelected(null)}
          onRefresh={() => refreshSelected(selected.id)}
          act={act}
        />
      )}
    </div>
  );
};

const OrderDetail = ({ order, items, roles, busy, onClose, onRefresh, act }: {
  order: Order;
  items: OrderItem[];
  roles: ReturnType<typeof useCommerceRoles>;
  busy: string | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  act: (action: string, payload: Record<string, unknown>) => Promise<unknown>;
}) => {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
  const [carrier, setCarrier] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [note, setNote] = useState(order.note || "");

  const events = [...(order.shop_order_events ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const fulfillments = order.shop_fulfillments ?? [];
  const fulfilledQty = new Map<string, number>();
  for (const f of fulfillments.filter((f) => f.status !== "cancelled")) {
    // quantities live on fulfillment_items; not joined here — approximate via
    // the fulfilment status display below when partial.
    void f;
  }

  const run = async (action: string, payload: Record<string, unknown>, successMsg: string) => {
    try {
      await act(action, { order_id: order.id, ...payload });
      toast.success(successMsg);
      await onRefresh();
    } catch (e) {
      toast.error("Action failed", { description: e instanceof Error ? e.message : undefined });
    }
  };

  const printPackingSlip = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Packing slip ${order.order_number || ""}</title>
      <style>body{font-family:Georgia,serif;padding:32px;color:#102438;} h1{letter-spacing:0.2em;font-size:20px;} table{width:100%;border-collapse:collapse;margin-top:16px;} td,th{border:1px solid #ccc;padding:8px;text-align:left;font-size:14px;} .muted{color:#666;font-size:13px;}</style>
      </head><body>
      <h1>MINDCAST</h1>
      <p class="muted">Order ${order.order_number || ""} Â· ${fmtDate(order.created_at)}</p>
      <p><strong>${order.ship_name || ""}</strong><br/>
      ${order.ship_line1 || ""}<br/>
      ${order.ship_line2 ? order.ship_line2 + "<br/>" : ""}
      ${order.ship_city || ""} ${order.ship_postcode || ""}</p>
      <table><thead><tr><th>SKU</th><th>Product</th><th>Qty</th></tr></thead><tbody>
      ${items.map((it) => `<tr><td>${it.sku || ""}</td><td>${it.product_name}</td><td>${it.quantity}</td></tr>`).join("")}
      </tbody></table>
      <script>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  const canFulfil = roles.isFulfilment;
  const canRefund = roles.canRefund;
  const canEmail = roles.isSupport;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-card border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg tracking-wider text-foreground">#{order.order_number || "ORDER"}</p>
              <p className="text-[11px] text-muted-foreground">{fmtDate(order.created_at)} {fmtTime(order.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-body tracking-widest uppercase rounded-sm border ${TONE_CLASS[paymentTone(order.payment_status)]}`}>
                {PAYMENT_STATUS_LABEL[order.payment_status] || order.payment_status}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-body tracking-widest uppercase rounded-sm border ${TONE_CLASS[fulfilmentTone(order.fulfilment_status)]}`}>
                {FULFILMENT_STATUS_LABEL[order.fulfilment_status] || order.fulfilment_status}
              </span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-1" aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Customer */}
          <section>
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1.5">Customer</p>
            <p className="text-sm">{[order.customer_first_name, order.customer_last_name].filter(Boolean).join(" ") || order.ship_name || "—"}</p>
            {order.customer_email && <p className="text-sm text-muted-foreground">{order.customer_email}</p>}
            {order.customer_phone && <p className="text-sm text-muted-foreground">{order.customer_phone}</p>}
          </section>

          {/* Shipping address */}
          {order.fulfilment === "ship" && (
            <section>
              <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1.5">Shipping address</p>
              <div className="text-sm leading-relaxed">
                <p>{order.ship_name || "—"}</p>
                {order.ship_line1 && <p>{order.ship_line1}</p>}
                {order.ship_line2 && <p>{order.ship_line2}</p>}
                {(order.ship_city || order.ship_postcode) && <p>{[order.ship_city, order.ship_postcode].filter(Boolean).join(" ")}</p>}
                {order.ship_country && <p>{order.ship_country}</p>}
              </div>
            </section>
          )}
          {order.fulfilment !== "ship" && (
            <section>
              <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1.5">Pickup code</p>
              <p className="font-display text-3xl tracking-[0.25em] text-foreground">{order.pickup_code}</p>
            </section>
          )}

          {/* Items */}
          <section>
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1.5">Items</p>
            <div className="space-y-1.5">
              {items.map((it) => (
                <div key={it.id || it.product_name} className="flex justify-between gap-3 text-sm">
                  <span>{it.product_name}{it.quantity > 1 ? ` Ã—${it.quantity}` : ""}{it.sku ? <span className="text-muted-foreground text-xs"> Â· {it.sku}</span> : ""}</span>
                  <span className="text-muted-foreground">{formatMoney(it.line_total_cents, order.currency)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Payment summary */}
          <section>
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1.5">Payment summary</p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(order.amount_total_cents - order.shipping_cents + order.discount_cents, order.currency)}</span></div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount{order.discount_code ? ` (${order.discount_code})` : ""}</span><span>−{formatMoney(order.discount_cents, order.currency)}</span></div>
              )}
              {order.fulfilment === "ship" && (
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping_cents > 0 ? formatMoney(order.shipping_cents, order.currency) : "Free"}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">GST included</span><span>{formatMoney(order.gst_cents, order.currency)}</span></div>
              <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1"><span>Total</span><span>{formatMoney(order.amount_total_cents, order.currency)}</span></div>
              {order.refunded_cents > 0 && (
                <div className="flex justify-between text-destructive"><span>Refunded</span><span>−{formatMoney(order.refunded_cents, order.currency)}</span></div>
              )}
            </div>
          </section>

          {/* Fulfilment actions */}
          {order.fulfilment === "ship" && canFulfil && ["paid", "partially_refunded"].includes(order.payment_status) && (
            <section className="border border-border rounded-sm p-4 space-y-3">
              <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                <Truck size={12} /> Fulfilment
              </p>
              <div className="flex flex-wrap gap-2">
                {order.fulfilment_status === "unfulfilled" && (
                  <button onClick={() => run("mark_picking", {}, "Marked picking")} disabled={busy !== null}
                    className="px-3 py-2 text-[11px] font-body tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
                    Mark picking
                  </button>
                )}
                {["unfulfilled", "picking"].includes(order.fulfilment_status) && (
                  <button onClick={() => run("mark_packed", {}, "Marked packed")} disabled={busy !== null}
                    className="px-3 py-2 text-[11px] font-body tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
                    Mark packed
                  </button>
                )}
                {order.fulfilment_status === "shipped" && (
                  <button onClick={() => run("mark_delivered", {}, "Marked delivered")} disabled={busy !== null}
                    className="px-3 py-2 text-[11px] font-body tracking-widest uppercase bg-foreground/10 text-foreground rounded-sm border border-border disabled:opacity-50">
                    Mark delivered
                  </button>
                )}
              </div>
              {["unfulfilled", "picking", "packed", "fulfilled"].includes(order.fulfilment_status) && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier (e.g. NZ Post)"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary" />
                  <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary" />
                  <input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="Tracking URL (optional)"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary" />
                  <button
                    onClick={() => run("create_fulfilment", { carrier, tracking_number: trackingNumber, tracking_url: trackingUrl }, "Fulfilment created — customer notified")}
                    disabled={busy !== null}
                    className="w-full px-3 py-2.5 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50"
                  >
                    {busy === "create_fulfilment" ? <Loader2 size={13} className="animate-spin mx-auto" /> : trackingNumber ? "Ship all items & notify" : "Create fulfilment"}
                  </button>
                </div>
              )}
              {fulfillments.length > 0 && (
                <div className="text-xs text-muted-foreground space-y-1 pt-1">
                  {fulfillments.map((f) => (
                    <p key={f.id}>
                      {f.status}{f.tracking_number ? ` Â· ${f.carrier || ""} ${f.tracking_number}` : ""}{f.shipped_at ? ` Â· ${fmtDate(f.shipped_at)}` : ""}
                    </p>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Refunds + cancel */}
          {canRefund && ["paid", "partially_refunded"].includes(order.payment_status) && (
            <section className="border border-border rounded-sm p-4 space-y-2">
              <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Refunds & cancellation</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setRefundOpen(true)} className="px-3 py-2 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground">
                  Refund…
                </button>
                {!["shipped", "delivered"].includes(order.fulfilment_status) && (
                  <button
                    onClick={() => { if (confirm("Cancel this order? Any payment is refunded and stock is returned.")) run("cancel_order", {}, "Order cancelled"); }}
                    disabled={busy !== null}
                    className="px-3 py-2 text-[11px] font-body tracking-widest uppercase border border-destructive/40 text-destructive rounded-sm disabled:opacity-50"
                  >
                    Cancel order
                  </button>
                )}
              </div>
              {refundOpen && (
                <RefundForm
                  order={order}
                  items={items}
                  busy={busy}
                  onSubmit={async (payload) => {
                    await run("refund", payload, "Refund issued");
                    setRefundOpen(false);
                  }}
                  onCancel={() => setRefundOpen(false)}
                />
              )}
            </section>
          )}

          {/* Emails + packing slip + note */}
          <section className="border border-border rounded-sm p-4 space-y-3">
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Actions</p>
            <div className="flex flex-wrap gap-2">
              {canEmail && (
                <>
                  <button onClick={() => run("resend_email", { kind: "confirmation" }, "Confirmation email sent")} disabled={busy !== null || !order.customer_email}
                    className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground disabled:opacity-40">
                    <RefreshCw size={11} /> Resend confirmation
                  </button>
                  {order.fulfilment === "ship" && (
                    <button onClick={() => run("resend_email", { kind: "shipped" }, "Shipping email sent")} disabled={busy !== null || !order.customer_email}
                      className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground disabled:opacity-40">
                      <RefreshCw size={11} /> Resend shipping
                    </button>
                  )}
                </>
              )}
              {order.fulfilment === "ship" && (
                <button onClick={printPackingSlip} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground">
                  <Printer size={11} /> Packing slip
                </button>
              )}
            </div>
            <div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Admin note (internal only)"
                rows={2}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
              />
              <button onClick={() => run("note", { note }, "Note saved")} disabled={busy !== null}
                className="mt-1 px-3 py-1.5 text-[11px] font-body tracking-widest uppercase bg-foreground/5 border border-border rounded-sm text-foreground disabled:opacity-50">
                Save note
              </button>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Timeline</p>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            ) : (
              <div className="space-y-2.5 border-l border-border pl-4">
                {[...events].reverse().map((e) => (
                  <div key={e.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                    <p className="text-sm text-foreground">{e.note || e.type.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmtDate(e.created_at)} {fmtTime(e.created_at)} Â· {e.actor_name || "SYSTEM"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const RefundForm = ({ order, items, busy, onSubmit, onCancel }: {
  order: Order;
  items: OrderItem[];
  busy: string | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) => {
  const [mode, setMode] = useState<"full" | "partial" | "manual">("full");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [manualAmount, setManualAmount] = useState("");
  const [refundShipping, setRefundShipping] = useState(false);
  const [restock, setRestock] = useState(false);
  const [reason, setReason] = useState("");

  const remaining = order.amount_total_cents - order.refunded_cents;

  const payload = (): Record<string, unknown> | null => {
    if (mode === "full") return { amount_cents: remaining, refund_shipping: true, restock, reason };
    if (mode === "manual") {
      const dollars = parseFloat(manualAmount);
      if (!Number.isFinite(dollars) || dollars <= 0) return null;
      return { amount_cents: Math.round(dollars * 100), refund_shipping: refundShipping, restock, reason };
    }
    const sel = Object.entries(selectedItems).filter(([, q]) => q > 0);
    if (sel.length === 0) return null;
    return {
      items: sel.map(([order_item_id, quantity]) => ({ order_item_id, quantity })),
      refund_shipping: refundShipping,
      restock,
      reason,
    };
  };

  return (
    <div className="border-t border-border pt-3 space-y-3">
      <div className="flex gap-2">
        {(["full", "partial", "manual"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm border ${mode === m ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground"}`}>
            {m === "full" ? "Full" : m === "partial" ? "By item" : "Manual"}
          </button>
        ))}
      </div>

      {mode === "partial" && (
        <div className="space-y-1.5">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex-1 truncate">{it.product_name}</span>
              <select
                value={selectedItems[it.id] ?? 0}
                onChange={(e) => setSelectedItems((s) => ({ ...s, [it.id]: Number(e.target.value) }))}
                className="px-2 py-1 text-sm bg-background border border-border rounded-sm"
              >
                {Array.from({ length: it.quantity + 1 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {mode === "manual" && (
        <input
          value={manualAmount}
          onChange={(e) => setManualAmount(e.target.value)}
          placeholder={`Amount in $ (max ${(remaining / 100).toFixed(2)})`}
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
        />
      )}

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={refundShipping} onChange={(e) => setRefundShipping(e.target.checked)} />
        Refund shipping too
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} />
        Return items to inventory (only if actually restocked)
      </label>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { const p = payload(); if (p) onSubmit(p); }}
          disabled={busy !== null || payload() === null}
          className="flex-1 px-3 py-2.5 text-[11px] font-body font-semibold tracking-widest uppercase bg-destructive text-destructive-foreground rounded-sm disabled:opacity-40"
        >
          {busy === "refund" ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Issue refund via Stripe"}
        </button>
        <button onClick={onCancel} className="px-3 py-2.5 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CommerceOrders;