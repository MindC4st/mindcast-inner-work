// shop-products-admin — product, variant and discount management for
// commerce admins. Every change is audited with before/after values.
// Draft products never appear publicly (the storefront policy only reads
// status='active').
//
// POST body: { action: string, ...payload }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { audit } from "./commerce-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const PRODUCT_FIELDS = [
  "name", "slug", "tagline", "description", "long_description", "status", "sku",
  "barcode", "price_cents", "cost_price_cents", "compare_at_price_cents",
  "gst_treatment", "weight_g", "dimensions_mm", "materials", "category",
  "track_stock", "low_stock_threshold", "allow_backorder", "featured",
  "tags", "image_url", "gallery_urls", "image_alt", "sort_order", "fulfilment",
] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "Not authenticated" }, 401);
    const { data: userRes, error: uErr } = await supa.auth.getUser(jwt);
    if (uErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const { data: roleRows } = await supa
      .from("user_roles").select("role").eq("user_id", userRes.user.id);
    const roles = new Set<string>((roleRows ?? []).map((r: { role: string }) => r.role));
    const { data: profile } = await supa
      .from("profiles").select("id, display_name, is_admin")
      .eq("user_id", userRes.user.id).maybeSingle();
    if (profile?.is_admin) roles.add("admin");
    if (!roles.has("admin") && !roles.has("commerce_admin")) {
      return json({ error: "Commerce admin required" }, 403);
    }
    const actorId = profile?.id ?? null;
    const actorName = profile?.display_name || "Staff";

    const body = await req.json();
    const action = typeof body?.action === "string" ? body.action : "";

    switch (action) {
      case "product_create":
      case "product_update": {
        const isCreate = action === "product_create";
        // deno-lint-ignore no-explicit-any
        const patch: Record<string, any> = {};
        for (const f of PRODUCT_FIELDS) {
          if (body[f] !== undefined) patch[f] = body[f];
        }
        if (isCreate) {
          if (!patch.name || !patch.slug) return json({ error: "name and slug are required" }, 400);
          patch.status = patch.status || "draft";
          patch.price_cents = Number.isInteger(patch.price_cents) ? patch.price_cents : 0;
          const { data: created, error } = await supa
            .from("shop_products").insert(patch).select("*").maybeSingle();
          if (error) return json({ error: error.message }, 400);
          // Every product gets a Default variant so inventory has somewhere to live.
          await supa.from("shop_product_variants").insert({
            product_id: created.id, name: "Default", sku: created.sku || null,
          }).catch(() => {});
          await audit(supa, {
            actorId, actorName, action: "product_created",
            entity: "shop_product", entityId: created.id, after: patch,
          });
          return json({ ok: true, product: created });
        }
        const productId = typeof body?.product_id === "string" ? body.product_id : "";
        if (!productId) return json({ error: "product_id is required" }, 400);
        const { data: before } = await supa
          .from("shop_products").select("*").eq("id", productId).maybeSingle();
        if (!before) return json({ error: "Product not found" }, 404);
        const { data: updated, error } = await supa
          .from("shop_products").update(patch).eq("id", productId).select("*").maybeSingle();
        if (error) return json({ error: error.message }, 400);
        await audit(supa, {
          actorId, actorName, action: "product_updated",
          entity: "shop_product", entityId: productId,
          before: pick(before, Object.keys(patch)), after: pick(updated, Object.keys(patch)),
        });
        return json({ ok: true, product: updated });
      }

      case "product_archive": {
        const productId = typeof body?.product_id === "string" ? body.product_id : "";
        const { data: before } = await supa
          .from("shop_products").select("status").eq("id", productId).maybeSingle();
        if (!before) return json({ error: "Product not found" }, 404);
        await supa.from("shop_products").update({ status: "archived" }).eq("id", productId);
        await audit(supa, {
          actorId, actorName, action: "product_archived",
          entity: "shop_product", entityId: productId,
          before: { status: before.status }, after: { status: "archived" },
        });
        return json({ ok: true });
      }

      case "variant_create":
      case "variant_update": {
        const isCreate = action === "variant_create";
        const fields = ["name", "sku", "option_values", "price_override_cents", "cost_price_cents", "weight_g", "allow_backorder", "is_active", "image_url", "sort_order"] as const;
        // deno-lint-ignore no-explicit-any
        const patch: Record<string, any> = {};
        for (const f of fields) if (body[f] !== undefined) patch[f] = body[f];
        if (isCreate) {
          const productId = typeof body?.product_id === "string" ? body.product_id : "";
          if (!productId || !patch.name) return json({ error: "product_id and name are required" }, 400);
          const { data: created, error } = await supa
            .from("shop_product_variants").insert({ ...patch, product_id: productId })
            .select("*").maybeSingle();
          if (error) return json({ error: error.message }, 400);
          await audit(supa, {
            actorId, actorName, action: "variant_created",
            entity: "shop_product_variant", entityId: created.id, after: patch,
          });
          return json({ ok: true, variant: created });
        }
        const variantId = typeof body?.variant_id === "string" ? body.variant_id : "";
        const { data: before } = await supa
          .from("shop_product_variants").select("*").eq("id", variantId).maybeSingle();
        if (!before) return json({ error: "Variant not found" }, 404);
        const { data: updated, error } = await supa
          .from("shop_product_variants").update(patch).eq("id", variantId).select("*").maybeSingle();
        if (error) return json({ error: error.message }, 400);
        await audit(supa, {
          actorId, actorName, action: "variant_updated",
          entity: "shop_product_variant", entityId: variantId,
          before: pick(before, Object.keys(patch)), after: pick(updated, Object.keys(patch)),
        });
        return json({ ok: true, variant: updated });
      }

      case "discount_create":
      case "discount_update": {
        const isCreate = action === "discount_create";
        const fields = ["code", "kind", "value_cents", "value_percent", "scope", "product_ids", "starts_at", "ends_at", "usage_limit", "is_active", "note"] as const;
        // deno-lint-ignore no-explicit-any
        const patch: Record<string, any> = {};
        for (const f of fields) if (body[f] !== undefined) patch[f] = body[f];
        if (typeof patch.code === "string") patch.code = patch.code.trim().toUpperCase();
        if (isCreate) {
          if (!patch.code || !patch.kind) return json({ error: "code and kind are required" }, 400);
          const { data: created, error } = await supa
            .from("shop_discounts").insert(patch).select("*").maybeSingle();
          if (error) return json({ error: error.message }, 400);
          await audit(supa, {
            actorId, actorName, action: "discount_created",
            entity: "shop_discount", entityId: created.id, after: patch,
          });
          return json({ ok: true, discount: created });
        }
        const discountId = typeof body?.discount_id === "string" ? body.discount_id : "";
        const { data: before } = await supa
          .from("shop_discounts").select("*").eq("id", discountId).maybeSingle();
        if (!before) return json({ error: "Discount not found" }, 404);
        const { data: updated, error } = await supa
          .from("shop_discounts").update(patch).eq("id", discountId).select("*").maybeSingle();
        if (error) return json({ error: error.message }, 400);
        await audit(supa, {
          actorId, actorName, action: "discount_updated",
          entity: "shop_discount", entityId: discountId,
          before: pick(before, Object.keys(patch)), after: pick(updated, Object.keys(patch)),
        });
        return json({ ok: true, discount: updated });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

// deno-lint-ignore no-explicit-any
function pick(obj: any, keys: string[]): any {
  // deno-lint-ignore no-explicit-any
  const out: Record<string, any> = {};
  for (const k of keys) out[k] = obj?.[k] ?? null;
  return out;
}
