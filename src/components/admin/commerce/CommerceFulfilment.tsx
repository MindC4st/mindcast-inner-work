// CommerceFulfilment — the packing queue, built for a phone in one hand.
// Paid shipped orders, fewest clicks to picked → packed → tracking → shipped.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { useCommerceRoles } from "@/hooks/useCommerceRoles";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp, Loader2, Truck } from "lucide-react";

type Item = { id: string; product_name: string; sku: string | null; quantity: number };
type Order = {
  id: string;
  order_number: string | null;
  amount_total_cents: number;
  currency: string;
  fulfilment_status: string;
  ship_name: string | null;
  ship_line1: string | null;
  ship_line2: string | null;
  ship_city: string | null;
  ship_postcode: string | null;
  created_at: string;
  items: Item[];
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });

const CommerceFulfilment = () => {
  const roles = useCommerceRoles();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tracking, setTracking] = useState<Record<string, { carrier: string; number: string; url: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await db
      .from("shop_orders")
      .select("id, order_number, amount_total_cents, currency, fulfilment_status, ship_name, ship_line1, ship_line2, ship_city, ship_postcode, created_at, shop_order_items(id, product_name, sku, quantity)")
      .eq("fulfilment", "ship")
      .in("payment_status", ["paid", "partially_refunded"])
      .in("fulfilment_status", ["unfulfilled", "picking", "packed"])
      .order("created_at", { ascending: true })
      .limit(100);
    setOrders(((data ?? []) as unknown as (Omit<Order, "items"> & { shop_order_items: Item[] })[])
      .map(({ shop_order_items, ...o }) => ({ ...o, items: shop_order_items ?? [] })));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (orderId: string, action: string, payload: Record<string, unknown>, msg: string) => {
    setBusy(`${orderId}:${action}`);
    try {
      const { data, error } = await supabase.functions.invoke("shop-admin", { body: { action, order_id: orderId, ...payload } });
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
      toast.success(msg);
      await load();
    } catch (e) {
      toast.error("Failed", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  if (!roles.isFulfilment) {
    return <div className="border border-border bg-card rounded-sm p-8 text-sm text-muted-foreground">Fulfilment is for fulfilment staff and commerce admins.</div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">FULFILMENT</h2>
        <p className="text-sm text-muted-foreground">Paid orders waiting to be picked, packed and shipped.</p>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="border border-border bg-card rounded-sm p-10 text-center">
          <Check className="mx-auto mb-3 text-muted-foreground/40" size={26} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Nothing to fulfil — the queue is clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const open = openId === o.id;
            const t = tracking[o.id] ?? { carrier: "", number: "", url: "" };
            const setT = (patch: Partial<typeof t>) => setTracking((s) => ({ ...s, [o.id]: { ...t, ...patch } }));
            return (
              <div key={o.id} className="border border-border bg-card rounded-sm">
                <button
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{o.order_number} <span className="text-muted-foreground font-normal">· {fmtDate(o.created_at)}</span></p>
                    <p className="text-xs text-muted-foreground truncate">{o.ship_name || "—"} · {o.items.length} line{o.items.length === 1 ? "" : "s"} · {formatMoney(o.amount_total_cents, o.currency)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm border ${
                      o.fulfilment_status === "unfulfilled" ? "text-muted-foreground border-border bg-foreground/5"
                        : o.fulfilment_status === "picking" ? "text-amber-700 border-amber-600/30 bg-amber-500/10"
                        : "text-[hsl(152_48%_30%)] border-[hsl(152_48%_30%)]/30 bg-[hsl(152_48%_30%)]/10"
                    }`}>{o.fulfilment_status}</span>
                    {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {/* Items checklist */}
                    <div className="space-y-1">
                      {o.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-sm">
                          <span>{it.product_name}{it.quantity > 1 ? ` ×${it.quantity}` : ""}{it.sku ? <span className="text-muted-foreground text-xs"> · {it.sku}</span> : ""}</span>
                        </div>
                      ))}
                    </div>
                    {o.ship_line1 && (
                      <p className="text-xs text-muted-foreground">
                        {o.ship_name} · {o.ship_line1}{o.ship_line2 ? `, ${o.ship_line2}` : ""} · {o.ship_city} {o.ship_postcode}
                      </p>
                    )}

                    {/* Big one-tap actions */}
                    <div className="flex flex-col gap-2">
                      {o.fulfilment_status === "unfulfilled" && (
                        <button
                          onClick={() => act(o.id, "mark_picking", {}, "Marked picking")}
                          disabled={busy !== null}
                          className="w-full py-3 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50"
                        >
                          {busy === `${o.id}:mark_picking` ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Mark picking"}
                        </button>
                      )}
                      {["unfulfilled", "picking"].includes(o.fulfilment_status) && (
                        <button
                          onClick={() => act(o.id, "mark_packed", {}, "Marked packed")}
                          disabled={busy !== null}
                          className="w-full py-3 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50"
                        >
                          {busy === `${o.id}:mark_packed` ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Mark packed"}
                        </button>
                      )}
                    </div>

                    {/* Tracking + ship */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <input className={inputCls} placeholder="Carrier (e.g. NZ Post)" value={t.carrier} onChange={(e) => setT({ carrier: e.target.value })} />
                      <input className={inputCls} placeholder="Tracking number" value={t.number} onChange={(e) => setT({ number: e.target.value })} />
                      <input className={inputCls} placeholder="Tracking URL (optional)" value={t.url} onChange={(e) => setT({ url: e.target.value })} />
                      <button
                        onClick={() => act(o.id, "create_fulfilment", { carrier: t.carrier, tracking_number: t.number, tracking_url: t.url }, "Shipped — customer notified")}
                        disabled={busy !== null}
                        className="w-full flex items-center justify-center gap-2 py-3 text-[11px] font-body font-semibold tracking-widest uppercase bg-[hsl(152_48%_30%)] text-white rounded-sm disabled:opacity-50"
                      >
                        {busy === `${o.id}:create_fulfilment` ? <Loader2 size={13} className="animate-spin" /> : <Truck size={13} />}
                        Ship & notify customer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const inputCls = "w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary";

export default CommerceFulfilment;
