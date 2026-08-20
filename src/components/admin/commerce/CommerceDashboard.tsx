// CommerceDashboard — the working screen, not a vanity analytics page.
// Today's orders, revenue, fulfilment queue, low stock, refunds, recent orders.
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { FULFILMENT_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/commerce";

type OrderRow = {
  id: string;
  order_number: string | null;
  amount_total_cents: number;
  currency: string;
  payment_status: string;
  fulfilment_status: string;
  fulfilment: string;
  customer_email: string | null;
  ship_name: string | null;
  created_at: string;
};

type VariantStock = {
  id: string;
  sku: string | null;
  name: string;
  stock_available: number;
  product_name: string;
  low_stock_threshold: number;
};

const RANGES = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
] as const;

const startOfRange = (range: string): Date => {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

const CommerceDashboard = () => {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("today");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [lowStock, setLowStock] = useState<VariantStock[]>([]);
  const [refundedCents, setRefundedCents] = useState(0);

  const load = useCallback(async () => {
    const since = startOfRange(range).toISOString();
    const [{ data: orderRows }, { data: variantRows }, { data: refundRows }] = await Promise.all([
      db.from("shop_orders")
        .select("id, order_number, amount_total_cents, currency, payment_status, fulfilment_status, fulfilment, customer_email, ship_name, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500),
      db.from("shop_product_variants")
        .select("id, sku, name, stock_available, product_id, products!inner(name, track_stock, low_stock_threshold)")
        .eq("products.track_stock", true),
      db.from("shop_refunds")
        .select("amount_cents, status, created_at")
        .gte("created_at", since)
        .eq("status", "succeeded"),
    ]);
    setOrders(((orderRows ?? []) as unknown as OrderRow[]));
    setLowStock(
      ((variantRows ?? []) as unknown as ({ id: string; sku: string | null; name: string; stock_available: number; products: { name: string; low_stock_threshold: number } })[])
        .filter((v) => v.stock_available <= v.products.low_stock_threshold)
        .map((v) => ({ id: v.id, sku: v.sku, name: v.name, stock_available: v.stock_available, product_name: v.products.name, low_stock_threshold: v.products.low_stock_threshold })),
    );
    setRefundedCents(((refundRows ?? []) as { amount_cents: number }[]).reduce((s, r) => s + r.amount_cents, 0));
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => ["paid", "partially_refunded"].includes(o.payment_status));
    const revenue = paidOrders.reduce((s, o) => s + o.amount_total_cents, 0);
    const toFulfil = orders.filter((o) =>
      o.fulfilment === "ship" && ["paid", "partially_refunded"].includes(o.payment_status) &&
      ["unfulfilled", "picking"].includes(o.fulfilment_status));
    const packedReady = orders.filter((o) => o.fulfilment === "ship" && o.fulfilment_status === "packed");
    return { count: orders.length, revenue, toFulfil: toFulfil.length, packedReady: packedReady.length };
  }, [orders]);

  const cards = [
    { label: "Orders", value: String(stats.count) },
    { label: "Revenue (incl. GST)", value: formatMoney(stats.revenue) },
    { label: "To fulfil", value: String(stats.toFulfil) },
    { label: "Packed / ready to ship", value: String(stats.packedReady) },
    { label: "Low stock SKUs", value: String(lowStock.length) },
    { label: "Refunds", value: formatMoney(refundedCents) },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">COMMERCE</h2>
          <p className="text-sm text-muted-foreground">Orders, fulfilment and stock at a glance.</p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm border transition-colors ${
                range === r.id ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="border border-border bg-card rounded-sm p-4">
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1">{c.label}</p>
            <p className="font-display text-2xl text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="border border-amber-600/30 bg-amber-500/5 rounded-sm p-4">
          <p className="text-[10px] font-body tracking-widest uppercase text-amber-700 mb-2">Low stock</p>
          <div className="space-y-1">
            {lowStock.map((v) => (
              <p key={v.id} className="text-sm text-foreground">
                {v.product_name}{v.name !== "Default" ? ` — ${v.name}` : ""}
                <span className="text-muted-foreground"> · {v.stock_available} remaining (threshold {v.low_stock_threshold})</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Recent orders</p>
        {orders.length === 0 ? (
          <div className="border border-border bg-card rounded-sm p-8 text-center text-sm text-muted-foreground">
            No orders in this period yet.
          </div>
        ) : (
          <div className="border border-border rounded-sm overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/[0.03] text-left">
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Order</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Customer</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Total</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Payment</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Fulfilment</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 12).map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-semibold">{o.order_number || "—"}</td>
                    <td className="px-4 py-2.5 max-w-[200px] truncate">{o.ship_name || o.customer_email || "—"}</td>
                    <td className="px-4 py-2.5 text-right">{formatMoney(o.amount_total_cents, o.currency)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{PAYMENT_STATUS_LABEL[o.payment_status] || o.payment_status}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{FULFILMENT_STATUS_LABEL[o.fulfilment_status] || o.fulfilment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommerceDashboard;
