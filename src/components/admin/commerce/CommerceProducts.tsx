// CommerceProducts — catalogue management for commerce admins.
// Create / edit / archive products and their variants; images are URLs in the
// assets bucket (upload via any storage tool — the field takes the public URL).
// Every change is audited by the shop-products-admin function.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { useCommerceRoles } from "@/hooks/useCommerceRoles";
import { toast } from "sonner";
import { Archive, Loader2, Pencil, Plus, X } from "lucide-react";

type Variant = {
  id: string;
  name: string;
  sku: string | null;
  option_values: string | null;
  price_override_cents: number | null;
  stock_available: number;
  is_active: boolean;
  image_url: string | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  status: string;
  sku: string | null;
  price_cents: number;
  cost_price_cents: number | null;
  compare_at_price_cents: number | null;
  category: string | null;
  track_stock: boolean;
  low_stock_threshold: number;
  allow_backorder: boolean;
  featured: boolean;
  weight_g: number | null;
  dimensions_mm: string | null;
  materials: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  image_alt: string | null;
  sort_order: number;
  variants?: Variant[];
};

const EMPTY: Partial<Product> = {
  status: "draft", price_cents: 0, track_stock: false,
  low_stock_threshold: 5, allow_backorder: false, featured: false, sort_order: 100,
};

const CommerceProducts = () => {
  const roles = useCommerceRoles();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await db.from("shop_products")
      .select("*").order("sort_order").limit(200);
    setProducts((data ?? []) as unknown as Product[]);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const call = async (action: string, payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("shop-products-admin", {
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
      setBusy(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    try {
      const isCreate = !editing.id;
      await call(isCreate ? "product_create" : "product_update", {
        ...(isCreate ? {} : { product_id: editing.id }),
        ...editing,
      });
      toast.success(isCreate ? "Product created" : "Product saved");
      setEditing(null);
      await load();
    } catch (e) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : undefined });
    }
  };

  const archive = async (p: Product) => {
    if (!confirm(`Archive ${p.name}? It disappears from the shop immediately.`)) return;
    try {
      await call("product_archive", { product_id: p.id });
      toast.success("Product archived");
      await load();
    } catch (e) {
      toast.error("Archive failed", { description: e instanceof Error ? e.message : undefined });
    }
  };

  if (!roles.canManageProducts) {
    return <div className="border border-border bg-card rounded-sm p-8 text-sm text-muted-foreground">Products are managed by commerce admins.</div>;
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-primary mb-1">PRODUCTS</h2>
          <p className="text-sm text-muted-foreground">Draft products never appear publicly.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm">
          <Plus size={13} /> New product
        </button>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.03] text-left">
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Product</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">SKU</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Price</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Stock</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-sm" />}
                      <div>
                        <p className="font-semibold">{p.name}{p.featured ? " ★" : ""}</p>
                        <p className="text-[11px] text-muted-foreground">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sku || "—"}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(p.price_cents)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase rounded-sm border ${
                      p.status === "active" ? "text-[hsl(152_48%_30%)] border-[hsl(152_48%_30%)]/30 bg-[hsl(152_48%_30%)]/10"
                        : "text-muted-foreground border-border bg-foreground/5"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.track_stock ? "tracked" : "untracked"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="text-muted-foreground hover:text-foreground p-1"><Pencil size={13} /></button>
                    {p.status !== "archived" && (
                      <button onClick={() => archive(p)} className="text-muted-foreground hover:text-destructive p-1"><Archive size={13} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductEditor
          product={editing}
          busy={busy}
          onChange={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
          call={call}
          onSaved={load}
        />
      )}
    </div>
  );
};

const ProductEditor = ({ product, busy, onChange, onSave, onClose, call, onSaved }: {
  product: Partial<Product>;
  busy: boolean;
  onChange: (p: Partial<Product>) => void;
  onSave: () => void;
  onClose: () => void;
  call: (action: string, payload: Record<string, unknown>) => Promise<unknown>;
  onSaved: () => Promise<void>;
}) => {
  const set = (k: keyof Product, v: unknown) => onChange({ ...product, [k]: v });
  const money = (cents: number | null | undefined) => cents != null ? (cents / 100).toFixed(2) : "";
  const fromMoney = (s: string) => { const n = parseFloat(s); return Number.isFinite(n) ? Math.round(n * 100) : null; };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-card border-l border-border overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl tracking-wider text-primary">{product.id ? "EDIT PRODUCT" : "NEW PRODUCT"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <Field label="Name"><input className={inputCls} value={product.name || ""} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Slug"><input className={inputCls} value={product.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="url-friendly-slug" /></Field>
        <Field label="Status">
          <select className={inputCls} value={product.status || "draft"} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SKU"><input className={inputCls} value={product.sku || ""} onChange={(e) => set("sku", e.target.value)} /></Field>
          <Field label="Category"><input className={inputCls} value={product.category || ""} onChange={(e) => set("category", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price ($ NZD)"><input className={inputCls} value={money(product.price_cents)} onChange={(e) => set("price_cents", fromMoney(e.target.value) ?? 0)} /></Field>
          <Field label="Cost ($, admin only)"><input className={inputCls} value={money(product.cost_price_cents)} onChange={(e) => set("cost_price_cents", fromMoney(e.target.value))} /></Field>
        </div>
        <Field label="Tagline (card copy)"><input className={inputCls} value={product.tagline || ""} onChange={(e) => set("tagline", e.target.value)} /></Field>
        <Field label="Short description"><textarea rows={2} className={inputCls} value={product.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Full description"><textarea rows={5} className={inputCls} value={product.long_description || ""} onChange={(e) => set("long_description", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary image URL"><input className={inputCls} value={product.image_url || ""} onChange={(e) => set("image_url", e.target.value)} /></Field>
          <Field label="Image alt text"><input className={inputCls} value={product.image_alt || ""} onChange={(e) => set("image_alt", e.target.value)} /></Field>
        </div>
        <Field label="Gallery URLs (one per line)">
          <textarea rows={2} className={inputCls} value={(product.gallery_urls ?? []).join("\n")}
            onChange={(e) => set("gallery_urls", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Weight (g)"><input className={inputCls} value={product.weight_g ?? ""} onChange={(e) => set("weight_g", e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Dimensions"><input className={inputCls} value={product.dimensions_mm || ""} onChange={(e) => set("dimensions_mm", e.target.value)} placeholder="210Ã—148Ã—10 mm" /></Field>
          <Field label="Materials"><input className={inputCls} value={product.materials || ""} onChange={(e) => set("materials", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={product.track_stock ?? false} onChange={(e) => set("track_stock", e.target.checked)} />
            Track stock
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={product.allow_backorder ?? false} onChange={(e) => set("allow_backorder", e.target.checked)} />
            Allow backorder
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={product.featured ?? false} onChange={(e) => set("featured", e.target.checked)} />
            Featured
          </label>
          <Field label="Low-stock threshold"><input className={inputCls} value={product.low_stock_threshold ?? 5} onChange={(e) => set("low_stock_threshold", Number(e.target.value) || 0)} /></Field>
        </div>

        {/* Variants */}
        {product.id && <VariantManager productId={product.id} call={call} onSaved={onSaved} />}

        <button onClick={onSave} disabled={busy}
          className="w-full px-4 py-3 text-[11px] font-body font-semibold tracking-widest uppercase bg-foreground text-background rounded-sm disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin mx-auto" /> : product.id ? "Save product" : "Create product"}
        </button>
      </div>
    </div>
  );
};

const VariantManager = ({ productId, call, onSaved }: {
  productId: string;
  call: (action: string, payload: Record<string, unknown>) => Promise<unknown>;
  onSaved: () => Promise<void>;
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const load = useCallback(async () => {
    const { data } = await db.from("shop_product_variants")
      .select("id, name, sku, option_values, price_override_cents, stock_available, is_active, image_url")
      .eq("product_id", productId).order("sort_order");
    setVariants((data ?? []) as Variant[]);
  }, [productId]);
  useEffect(() => { load(); }, [load]);

  const addVariant = async () => {
    if (!name.trim()) return;
    try {
      await call("variant_create", {
        product_id: productId,
        name: name.trim(),
        sku: sku.trim() || null,
        option_values: name.trim(),
        price_override_cents: price ? Math.round(parseFloat(price) * 100) : null,
        image_url: imageUrl.trim() || null,
      });
      toast.success("Variant added");
      setName(""); setSku(""); setPrice(""); setImageUrl("");
      await load();
      await onSaved();
    } catch (e) {
      toast.error("Could not add variant", { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <div className="border border-border rounded-sm p-4 space-y-2">
      <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Variants</p>
      {variants.map((v) => (
        <div key={v.id} className="flex items-center gap-2 text-sm">
          {v.image_url && <img src={v.image_url} alt="" className="w-6 h-6 object-cover rounded-sm border border-border" />}
          <span className="flex-1">{v.name}{v.sku ? <span className="text-muted-foreground text-xs"> Â· {v.sku}</span> : ""}</span>
          <span className="text-muted-foreground">stock {v.stock_available}{v.price_override_cents != null ? ` Â· ${formatMoney(v.price_override_cents)}` : ""}</span>
        </div>
      ))}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <input className={inputCls} placeholder="Option (e.g. Navy)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <input className={inputCls} placeholder="Price $" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <input className={inputCls} placeholder="Colour image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <button onClick={addVariant} className="px-3 py-1.5 text-[11px] font-body tracking-widest uppercase border border-border rounded-sm text-foreground">
        Add variant
      </button>
    </div>
  );
};

const inputCls = "w-full px-3 py-2 text-sm bg-background border border-border rounded-sm focus:outline-none focus:border-primary";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);

export default CommerceProducts;