// CommerceSettings — shipping methods and store configuration.
// Carriers are data, not code: nothing here hard-codes a courier.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useCommerceRoles } from "@/hooks/useCommerceRoles";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CommerceSettings = () => {
  const roles = useCommerceRoles();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await db.from("shop_settings").select("key, value");
    setSettings(Object.fromEntries((data ?? []).map((s: { key: string; value: string }) => [s.key, s.value])));
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (key: string, value: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("shop-admin", {
        body: { action: "update_settings", key, value },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "Failed");
      toast.success("Setting saved");
      await load();
    } catch (e) {
      toast.error("Could not save", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  if (!roles.isCommerceAdmin) {
    return <div className="border border-border bg-card rounded-sm p-8 text-sm text-muted-foreground">Settings are managed by commerce admins.</div>;
  }

  const dollars = (cents: string) => (parseInt(cents, 10) / 100).toFixed(2);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">SETTINGS</h2>
        <p className="text-sm text-muted-foreground">Shipping and store configuration. New Zealand only at launch.</p>
      </div>

      <div className="border border-border rounded-sm p-5 space-y-4 bg-card">
        <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Shipping — New Zealand</p>
        <div>
          <p className="text-sm text-foreground mb-1">Standard shipping rate (NZD)</p>
          <div className="flex items-center gap-2">
            <input
              className={inputCls}
              value={settings.shipping_flat_cents ? dollars(settings.shipping_flat_cents) : ""}
              onChange={(e) => setSettings((s) => ({ ...s, shipping_flat_cents: String(Math.round(parseFloat(e.target.value || "0") * 100)) }))}
            />
            <button onClick={() => save("shipping_flat_cents", settings.shipping_flat_cents)} disabled={busy}
              className="px-4 py-2 text-[11px] font-body tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
              {busy ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-foreground mb-1">Free shipping threshold (NZD)</p>
          <div className="flex items-center gap-2">
            <input
              className={inputCls}
              value={settings.free_shipping_threshold_cents ? dollars(settings.free_shipping_threshold_cents) : ""}
              onChange={(e) => setSettings((s) => ({ ...s, free_shipping_threshold_cents: String(Math.round(parseFloat(e.target.value || "0") * 100)) }))}
            />
            <button onClick={() => save("free_shipping_threshold_cents", settings.free_shipping_threshold_cents)} disabled={busy}
              className="px-4 py-2 text-[11px] font-body tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
              {busy ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
        <div>
          <p className="text-sm text-foreground mb-1">Shipping countries (comma-separated ISO codes)</p>
          <div className="flex items-center gap-2">
            <input
              className={inputCls}
              value={settings.shipping_countries ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, shipping_countries: e.target.value.toUpperCase() }))}
            />
            <button onClick={() => save("shipping_countries", settings.shipping_countries)} disabled={busy}
              className="px-4 py-2 text-[11px] font-body tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
              {busy ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Add AU here when Australian shipping is ready.</p>
        </div>
      </div>

      <div className="border border-border rounded-sm p-5 bg-card">
        <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-2">Store</p>
        <p className="text-sm text-foreground mb-2">Currency: NZD · all prices GST inclusive (15%)</p>
        <p className="text-xs text-muted-foreground">
          Rural surcharges, NZ Post / courier integrations and automated labels
          are deliberately out of scope for launch — the shipping model is
          data-driven so they can be added without rework.
        </p>
      </div>
    </div>
  );
};

const inputCls = "w-40 px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary";

export default CommerceSettings;
