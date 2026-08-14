// assign-nfc — staff assigns a bracelet token to a member's profile.
//
// profiles.nfc_id is a privileged field guarded by the
// prevent_profile_privilege_escalation trigger (service_role only), so the
// admin UI can't write it directly. This endpoint does it with the service
// role, gated so only a facilitator/admin can call it.
//
// POST body:  { profile_id: string, nfc_id: string | null }
//   nfc_id is the URL-safe token written to the bracelet (the part after /b/),
//   or null/"" to unassign.
// Response:   { ok: true } | { error: string }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
    const token = authHeader.slice(7);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const userSupa = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user } } = await userSupa.auth.getUser(token);
    if (!user) return json({ error: "Unauthenticated" }, 401);

    const { data: roleRow } = await supa
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["facilitator", "admin"])
      .limit(1);
    if (!roleRow || roleRow.length === 0) return json({ error: "Staff only" }, 403);

    const body = await req.json();
    const profile_id: string | null = typeof body?.profile_id === "string" ? body.profile_id : null;
    if (!profile_id) return json({ error: "profile_id required" }, 400);

    // nfc_id is null/empty (unassign) or a URL-safe alphanumeric token.
    const rawNfc: unknown = body?.nfc_id;
    const trimmed = typeof rawNfc === "string" ? rawNfc.trim() : "";
    if (trimmed !== "" && !/^[A-Za-z0-9]{1,64}$/.test(trimmed)) {
      return json({ error: "Token must be letters + digits only (max 64)" }, 400);
    }
    const nfcId = trimmed === "" ? null : trimmed;

    // Bracelet tokens are the check-in identifier — enforce uniqueness so a
    // scan always resolves to exactly one member.
    if (nfcId) {
      const { data: clash } = await supa
        .from("profiles")
        .select("id, display_name, name")
        .eq("nfc_id", nfcId)
        .neq("id", profile_id)
        .limit(1);
      if (clash && clash.length > 0) {
        const who = (clash[0] as any)?.display_name || (clash[0] as any)?.name || "another member";
        return json({ error: `That bracelet token is already assigned to ${who}` }, 409);
      }
    }

    const { error: upErr } = await supa
      .from("profiles")
      .update({ nfc_id: nfcId })
      .eq("id", profile_id);
    if (upErr) throw upErr;

    return json({ ok: true });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
