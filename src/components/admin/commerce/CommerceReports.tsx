// CommerceReports — the accounting basics, exportable.
// Gross/net sales, GST, refunds, shipping, units, per-product, AOV, orders
// over time. Structured so an accounting integration (e.g. Xero) can read
// the same numbers later.
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { gstComponent, toCsv } from "@/lib/commerce";
import { Download } from "lucide-react";

type OrderRow = {
  id: string;
  order_number: string | null;
  amount_total_cents: number;
  shipping_cents: number;
  discount_cents: number;
  refunded_cents: number;
  payment_status: string;
  currency: string;
  created_at: string;
  shop_order_items: { product_name: string; sku: string | null; quantity: number; line_total_cents: number }[];
};

const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "all", label: "All", days: 0 },
] as const;

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });

const CommerceReports = () => {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30d");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const days = RANGES.find((r) => r.id === range)?.days ?? 0;
    let query = db.from("shop_orders")
      .select("id, order_number, amount_total_cents, shipping_cents, discount_cents, refunded_cents, payment_status, currency, created_at, shop_order_items(product_name, sku, quantity, line_total_cents)")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (days > 0) {
      query = query.gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    }
    const { data } = await query;
    setOrders((data ?? []) as unknown as OrderRow[]);
    setLoading(false);
  }, [range]);
  useEffect(() => { load(); }, [load]);

  const report = useMemo(() => {
    const paid = orders.filter((o) => ["paid", "partially_refunded"].includes(o.payment_status));
    const gross = paid.reduce((s, o) => s + o.amount_total_cents, 0);
    const refunds = orders.reduce((s, o) => s + (o.refunded_cents ?? 0), 0);
    const net = gross - refunds;
    const gst = paid.reduce((s, o) => s + gstComponent(o.amount_total_cents), 0);
    const shipping = paid.reduce((s, o) => s + (o.shipping_cents ?? 0), 0);
    const discounts = paid.reduce((s, o) => s + (o.discount_cents ?? 0), 0);
    const units = paid.reduce((s, o) => s + (o.shop_order_items ?? []).reduce((n, it) => n + it.quantity, 0), 0);
    const aov = paid.length > 0 ? Math.round(gross / paid.length) : 0;

    const byProduct = new Map<string, { name: string; units: number; revenue: number }>();
    for (const o of paid) {
      for (const it of o.shop_order_items ?? []) {
        const key = it.sku || it.product_name;
        const cur = byProduct.get(key) ?? { name: it.product_name, units: 0, revenue: 0 };
        cur.units += it.quantity;
        cur.revenue += it.line_total_cents;
        byProduct.set(key, cur);
      }
    }
    const productRows = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);

    const byDay = new Map<string, { orders: number; revenue: number }>();
    for (const o of paid) {
      const day = o.created_at.slice(0, 10);
      const cur = byDay.get(day) ?? { orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += o.amount_total_cents;
      byDay.set(day, cur);
    }
    const dayRows = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    return { paidCount: paid.length, gross, net, gst, refunds, shipping, discounts, units, aov, productRows, dayRows };
  }, [orders]);

  const exportOrders = () => {
    const rows: (string | number)[][] = [
      ["order_number", "date", "payment_status", "subtotal_cents", "discount_cents", "shipping_cents", "gst_cents", "total_cents", "refunded_cents", "currency"],
      ...orders.map((o) => [
        o.order_number || "", o.created_at, o.payment_status,
        o.amount_total_cents - o.shipping_cents + o.discount_cents,
        o.discount_cents, o.shipping_cents, gstComponent(o.amount_total_cents),
        o.amount_total_cents, o.refunded_cents ?? 0, o.currency,
      ]),
    ];
    download("mindcast-orders.csv", toCsv(rows));
  };

  const exportProducts = () => {
    const rows: (string | number)[][] = [
      ["product", "sku", "units", "revenue_cents"],
      ...report.productRows.map((p) => [p.name, "", p.units, p.revenue]),
    ];
    download("mindcast-sales-by-product.csv", toCsv(rows));
  };

  const cards = [
    { label: "Orders", value: String(report.paidCount) },
    { label: "Gross sales", value: formatMoney(report.gross) },
    { label: "Net sales", value: formatMoney(report.net) },
    { label: "GST collected", value: formatMoney(report.gst) },
    { label: "Refunds", value: formatMoney(report.refunds) },
    { label: "Shipping income", value: formatMoney(report.shipping) },
    { label: "Discounts", value: formatMoney(report.discounts) },
    { label: "Units sold", value: String(report.units) },
    { label: "Avg order value", value: formatMoney(report.aov) },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">REPORTS</h2>
          <p className="text-sm text-muted-foreground">All figures NZD, GST included in totals and broken out as GST collected.</p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm border ${
                range === r.id ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cards.map((c) => (
              <div key={c.label} className="border border-border bg-card rounded-sm p-4">
                <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1">{c.label}</p>
                <p className="font-display text-xl text-foreground">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Sales by product</p>
            <div className="flex gap-2">
              <button onClick={exportProducts} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground">
                <Download size={11} /> Products CSV
              </button>
              <button onClick={exportOrders} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground">
                <Download size={11} /> Orders CSV
              </button>
            </div>
          </div>
          {report.productRows.length === 0 ? (
            <div className="border border-border bg-card rounded-sm p-8 text-center text-sm text-muted-foreground">No paid orders in this period.</div>
          ) : (
            <div className="border border-border rounded-sm overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-foreground/[0.03] text-left">
                    <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Product</th>
                    <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Units</th>
                    <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.productRows.map((p) => (
                    <tr key={p.name} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">{p.name}</td>
                      <td className="px-4 py-2.5 text-right">{p.units}</td>
                      <td className="px-4 py-2.5 text-right">{formatMoney(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Orders over time</p>
            {report.dayRows.length === 0 ? (
              <div className="border border-border bg-card rounded-sm p-8 text-center text-sm text-muted-foreground">No paid orders in this period.</div>
            ) : (
              <div className="border border-border rounded-sm overflow-hidden bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-foreground/[0.03] text-left">
                      <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Day</th>
                      <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Orders</th>
                      <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dayRows.map(([day, v]) => (
                      <tr key={day} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5">{fmtDay(day)}</td>
                        <td className="px-4 py-2.5 text-right">{v.orders}</td>
                        <td className="px-4 py-2.5 text-right">{formatMoney(v.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default CommerceReports;
