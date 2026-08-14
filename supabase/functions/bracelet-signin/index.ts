// bracelet-signin — one-time password unlock when a member taps their bracelet
// on a phone that isn't remembered yet.
//
// The bracelet token identifies the account; the member proves ownership with
// their password. On success we return a session the app installs via
// setSession(), so the phone is "theirs" from then on (stayed signed in), or
// until they sign out / the app marks the visit ephemeral.
//
// POST body:  { token: string, password: string }
// Response:   { ok: true, access_token, refresh_token, display_name }
//           | { error: string }

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

const welcomeName = (p: {
  first_name?: string | null; last_name?: string | null;
  name?: string | null; display_name?: string | null;
}): string => {
  const fn = (p.first_name || "").trim();
  const ln = (p.last_name || "").trim();
  const fallback = ((p.display_name || p.name || "") + "").trim();
  const parts = (fn || ln) ? [fn, ln].filter(Boolean) : fallback.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Member";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!token || !password) return json({ error: "Token and password are required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Bracelet → account. Unknown tokens 404 without leaking anything.
    const { data: profile, error: pErr } = await supa
      .from("profiles")
      .select("id, user_id, first_name, last_name, name, display_name")
      .eq("nfc_id", token)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile || !(profile as { user_id?: string | null }).user_id) {
      return json({ error: "Unknown bracelet" }, 404);
    }

    // Account email (service-role only — never exposed unless the password
    // already proves ownership below).
    const { data: authUser, error: uErr } = await supa.auth.admin.getUserById(
      (profile as { user_id: string }).user_id,
    );
    if (uErr || !authUser?.user?.email) return json({ error: "This bracelet isn't linked to a login yet" }, 409);

    // Verify the password by minting a real session server-side.
    const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
    const { data: signed, error: sErr } = await anon.auth.signInWithPassword({
      email: authUser.user.email,
      password,
    });
    if (sErr || !signed.session) return json({ error: "Incorrect password" }, 401);

    return json({
      ok: true,
      access_token: signed.session.access_token,
      refresh_token: signed.session.refresh_token,
      display_name: welcomeName(profile as Parameters<typeof welcomeName>[0]),
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
