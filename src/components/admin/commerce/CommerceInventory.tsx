// CommerceInventory â€” stock is a ledger, not an editable number.
// Receive stock, record adjustments/damage/stocktake, and read the movement
// history. Current levels come from the materialised variant stock that
// shop_adjust_stock maintains transactionally.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useCommerceRoles } from "@/hooks/useCommerceRoles";
import { toast } from "sonner";
import { Loader2, PackagePlus } from "lucide-react";

type StockRow = {
  id: string;
  sku: string | null;
  name: string;
  stock_available: number;
  products: { name: string; track_stock: boolean; low_stock_threshold: number };
};

type Movement = {
  id: string;
  type: string;
  quantity_change: number;
  reason: string | null;
  note: string | null;
  created_at: string;
  shop_product_variants?: { sku: string | null; name: string; products?: { name: string } } | null;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NZ", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const CommerceInventory = () => {
  const roles = useCommerceRoles();
  const [rows, setRows] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // receive form
  const [receiveVariant, setReceiveVariant] = useState("");
  const [receiveQty, setReceiveQty] = useState("");
  const [supplier, setSupplier] = useState("");
  const [reference, setReference] = useState("");
  // adjust form
  const [adjustVariant, setAdjustVariant] = useState("");
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustType, setAdjustType] = useState("manual_adjustment");
  const [adjustReason, setAdjustReason] = useState("");

  const load = useCallback(async () => {
    const [{ data: stockRows }, { data: movementRows }] = await Promise.all([
      db.from("shop_product_variants")
        .select("id, sku, name, stock_available, product_id, products!inner(name, track_stock, low_stock_threshold)")
        .order("stock_available", { ascending: true })
        .limit(300),
      db.from("shop_inventory_movements")
        .select("id, type, quantity_change, reason, note, created_at, variant_id, shop_product_variants(sku, name, products(name))")
        .order("created_at", { ascending: false })
        .limit(60),
    ]);
    setRows((stockRows ?? []) as unknown as StockRow[]);
    setMovements((movementRows ?? []) as unknown as Movement[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (action: string, payload: Record<string, unknown>, msg: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("shop-admin", { body: { action, ...payload } });
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
      setBusy(false);
    }
  };

  const tracked = rows.filter((r) => r.products.track_stock);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl tracking-wider text-primary mb-1">INVENTORY</h2>
        <p className="text-sm text-muted-foreground">Every change is a ledger movement â€” stock is never edited directly.</p>
      </div>

      {/* Stock levels */}
      <div>
        <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Current stock (tracked SKUs)</p>
        {loading ? (
          <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse py-8 text-center">Loadingâ€¦</p>
        ) : tracked.length === 0 ? (
          <div className="border border-border bg-card rounded-sm p-8 text-center text-sm text-muted-foreground">
            No stock-tracked SKUs yet â€” enable tracking on a product to manage its inventory.
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-x-auto bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/[0.03] text-left">
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">SKU</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Product</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Available</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {tracked.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-semibold">{r.sku || r.name}</td>
                    <td className="px-4 py-2.5">{r.products.name}{r.name !== "Default" ? ` â€” ${r.name}` : ""}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${r.stock_available <= r.products.low_stock_threshold ? "text-amber-700" : ""}`}>
                      {r.stock_available}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{r.products.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {roles.isFulfilment && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Receive stock */}
          <div className="border border-border rounded-sm p-4 space-y-3 bg-card">
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
              <PackagePlus size={12} /> Receive stock
            </p>
            <select className={inputCls} value={receiveVariant} onChange={(e) => setReceiveVariant(e.target.value)}>
              <option value="">Choose SKUâ€¦</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>{r.sku || r.name} â€” {r.products.name}{r.name !== "Default" ? ` ${r.name}` : ""}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="Quantity" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} />
            <input className={inputCls} placeholder="Supplier (optional)" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            <input className={inputCls} placeholder="Purchase reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} />
            <button
              onClick={() => {
                const qty = parseInt(receiveQty, 10);
                if (!receiveVariant || !Number.isFinite(qty) || qty < 1) { toast.error("Choose a SKU and a positive quantity"); return; }
                run("receive_stock", { variant_id: receiveVariant, quantity: qty, supplier, reference }, "Stock received");
                setReceiveQty(""); setSupplier(""); setReference("");
              }}
              disabled={busy}
              className="w-full px-3 py-2.5 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Receive into stock"}
            </button>
          </div>

          {/* Manual adjustment */}
          {roles.canAdjustStock && (
            <div className="border border-border rounded-sm p-4 space-y-3 bg-card">
              <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Adjust stock</p>
              <select className={inputCls} value={adjustVariant} onChange={(e) => setAdjustVariant(e.target.value)}>
                <option value="">Choose SKUâ€¦</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>{r.sku || r.name} â€” {r.products.name}{r.name !== "Default" ? ` ${r.name}` : ""}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} placeholder="Â± quantity" value={adjustDelta} onChange={(e) => setAdjustDelta(e.target.value)} />
                <select className={inputCls} value={adjustType} onChange={(e) => setAdjustType(e.target.value)}>
                  <option value="manual_adjustment">Manual adjustment</option>
                  <option value="damaged">Damaged</option>
                  <option value="missing">Missing</option>
                  <option value="stocktake_adjustment">Stocktake</option>
                  <option value="customer_return">Customer return</option>
                </select>
              </div>
              <input className={inputCls} placeholder="Reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
              <button
                onClick={() => {
                  const delta = parseInt(adjustDelta, 10);
                  if (!adjustVariant || !Number.isFinite(delta) || delta === 0) { toast.error("Choose a SKU and a non-zero quantity (use âˆ’ for reductions)"); return; }
                  run("adjust_stock", { variant_id: adjustVariant, delta, type: adjustType, reason: adjustReason }, "Stock adjusted");
                  setAdjustDelta(""); setAdjustReason("");
                }}
                disabled={busy}
                className="w-full px-3 py-2.5 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50"
              >
                {busy ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Record adjustment"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Movement ledger */}
      <div>
        <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Recent movements</p>
        {movements.length === 0 ? (
          <div className="border border-border bg-card rounded-sm p-8 text-center text-sm text-muted-foreground">No movements yet.</div>
        ) : (
          <div className="border border-border rounded-xl overflow-x-auto bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border bg-foreground/[0.03] text-left">
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">When</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">SKU</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Change</th>
                  <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Reason</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(m.created_at)}</td>
                    <td className="px-4 py-2.5">{m.shop_product_variants?.sku || m.shop_product_variants?.name || "â€”"}</td>
                    <td className="px-4 py-2.5">{m.type.replace(/_/g, " ")}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${m.quantity_change > 0 ? "text-[hsl(152_48%_30%)]" : "text-destructive"}`}>
                      {m.quantity_change > 0 ? "+" : ""}{m.quantity_change}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground max-w-[240px] truncate">{m.reason || m.note || ""}</td>
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

const inputCls = "w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary";

export default CommerceInventory;