// nfc-checkin — door kiosk hits this with a bracelet's NFC id, we look the
// member up and drop a row into public.check_ins. The Welcome Wall slide
// is subscribed to that table's realtime feed, so the name appears the
// moment the bracelet is scanned.
//
// Public endpoint (no JWT). NFC ids are opaque tokens; an unknown id just
// 404s without leaking anything.
//
// POST body:  { nfc_id: string }
// Response:   { ok: true, display_name } | { error: string }

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

type DisplayMode = "full" | "first_initial" | "anonymous";

const computeDisplayName = (
  p: { first_name?: string | null; last_name?: string | null; name?: string | null; display_name?: string | null },
  mode: DisplayMode,
): string => {
  if (mode === "anonymous") return "Anonymous";
  const fn = (p.first_name || "").trim();
  const ln = (p.last_name || "").trim();
  const fallback = ((p.display_name || p.name || "") + "").trim();
  const parts = (fn || ln) ? [fn, ln].filter(Boolean) : fallback.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Member";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  if (mode === "full") return last ? `${first} ${last}` : first;
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const { nfc_id } = await req.json();
    if (!nfc_id || typeof nfc_id !== "string") return json({ error: "nfc_id required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: profile, error: pErr } = await supa
      .from("profiles")
      .select("id, user_id, first_name, last_name, name, display_name, live_display_mode")
      .eq("nfc_id", nfc_id)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) return json({ error: "Unknown bracelet" }, 404);

    const mode = ((profile as any).live_display_mode as DisplayMode) || "first_initial";
    const displayName = computeDisplayName(profile, mode);
    const isAnonymous = mode === "anonymous";

    // Idempotency: collapse duplicate scans within the last 5 minutes so an
    // accidental double-tap doesn't double-name the wall.
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    const { data: recent } = await supa
      .from("check_ins")
      .select("id")
      .eq("profile_id", profile.id)
      .gt("checked_in_at", fiveMinAgo)
      .limit(1);
    if (recent && recent.length > 0) {
      return json({ ok: true, deduped: true, display_name: displayName });
    }

    const { error: insErr } = await supa.from("check_ins").insert({
      profile_id: profile.id,
      display_name: displayName,
      is_anonymous: isAnonymous,
    });
    if (insErr) throw insErr;

    return json({ ok: true, display_name: displayName });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
