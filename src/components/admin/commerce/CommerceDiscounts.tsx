// CommerceDiscounts — restrained by design: fixed / percent / free shipping,
// date windows and usage limits. No urgency mechanics.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { useCommerceRoles } from "@/hooks/useCommerceRoles";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

type Discount = {
  id: string;
  code: string;
  kind: "fixed" | "percent" | "free_shipping";
  value_cents: number;
  value_percent: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  note: string | null;
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" }) : "—";

const CommerceDiscounts = () => {
  const roles = useCommerceRoles();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const [code, setCode] = useState("");
  const [kind, setKind] = useState<Discount["kind"]>("percent");
  const [value, setValue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const { data } = await db.from("shop_discounts").select("*").order("created_at", { ascending: false });
    setDiscounts((data ?? []) as Discount[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    const v = parseFloat(value);
    if (!code.trim() || !Number.isFinite(v) || v <= 0) {
      toast.error("Enter a code and a positive value");
      return;
    }
    if (kind === "percent" && v > 100) { toast.error("Percent can't exceed 100"); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("shop-products-admin", {
        body: {
          action: "discount_create",
          code: code.trim(),
          kind,
          value_cents: kind === "fixed" ? Math.round(v * 100) : 0,
          value_percent: kind === "percent" ? Math.round(v) : null,
          starts_at: startsAt ? new Date(startsAt).toISOString() : null,
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
          note: note || null,
          is_active: true,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "Failed");
      toast.success("Discount created");
      setCreating(false);
      setCode(""); setValue(""); setStartsAt(""); setEndsAt(""); setUsageLimit(""); setNote("");
      await load();
    } catch (e) {
      toast.error("Could not create discount", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (d: Discount) => {
    try {
      const { data, error } = await supabase.functions.invoke("shop-products-admin", {
        body: { action: "discount_update", discount_id: d.id, is_active: !d.is_active },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "Failed");
      await load();
    } catch (e) {
      toast.error("Could not update", { description: e instanceof Error ? e.message : undefined });
    }
  };

  if (!roles.canManageProducts) {
    return <div className="border border-border bg-card rounded-sm p-8 text-sm text-muted-foreground">Discounts are managed by commerce admins.</div>;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">DISCOUNTS</h2>
          <p className="text-sm text-muted-foreground">For customer service, staff, community support and testing — never scarcity.</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm">
          <Plus size={13} /> New discount
        </button>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : discounts.length === 0 ? (
        <div className="border border-border bg-card rounded-sm p-10 text-center text-sm text-muted-foreground">No discounts yet.</div>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.03] text-left">
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Code</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Value</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Window</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Used</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">{d.code}</td>
                  <td className="px-4 py-3">
                    {d.kind === "fixed" ? formatMoney(d.value_cents) : d.kind === "percent" ? `${d.value_percent}%` : "Free shipping"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(d.starts_at)} → {fmtDate(d.ends_at)}</td>
                  <td className="px-4 py-3 text-right">{d.times_used}{d.usage_limit ? ` / ${d.usage_limit}` : ""}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm border ${
                      d.is_active ? "text-[hsl(152_48%_30%)] border-[hsl(152_48%_30%)]/30 bg-[hsl(152_48%_30%)]/10" : "text-muted-foreground border-border bg-foreground/5"
                    }`}>{d.is_active ? "active" : "inactive"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggle(d)} className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                      {d.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setCreating(false)} />
          <div className="relative bg-card border border-border rounded-sm p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg tracking-wider text-foreground">NEW DISCOUNT</h3>
              <button onClick={() => setCreating(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <input className={inputCls} placeholder="Code (e.g. STAFF20)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            <div className="grid grid-cols-2 gap-2">
              <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as Discount["kind"])}>
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed $ off</option>
                <option value="free_shipping">Free shipping</option>
              </select>
              {kind !== "free_shipping" && (
                <input className={inputCls} placeholder={kind === "percent" ? "% off" : "$ off"} value={value} onChange={(e) => setValue(e.target.value)} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Starts</p>
                <input type="date" className={inputCls} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Ends</p>
                <input type="date" className={inputCls} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
            <input className={inputCls} placeholder="Usage limit (blank = unlimited)" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
            <input className={inputCls} placeholder="Note (who it's for)" value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={create} disabled={busy}
              className="w-full px-4 py-3 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
              {busy ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Create discount"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputCls = "w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary";

export default CommerceDiscounts;
