// founding-bracelet-status — per-email founding eligibility probe for the
// membership checkout add-on. Display-only: the authoritative reservation
// happens in create-subscription-checkout via founding_bracelet_reserve.
//
// POST body: { emails: string[] }  (max 20)
// Response:  { remaining: number, results: [{ email, state, seat_number }] }
//   state: "free" | "reserved" | "allocated" | "claimed" | "exhausted" | "invalid"
//
// Auth: signed-in users only (verify_jwt). The lookup RPC reveals only the
// state of the emails supplied — no other member data leaves the server.

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

const MAX_EMAILS = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await anon.auth.getUser();
    if (!userRes?.user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const emails = Array.isArray(body?.emails) ? body.emails : [];
    if (emails.length === 0) return json({ error: "No emails supplied" }, 400);
    if (emails.length > MAX_EMAILS) return json({ error: `Maximum ${MAX_EMAILS} emails per check` }, 400);

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const seen = new Set<string>();
    const results: { email: string; state: string; seat_number: number | null }[] = [];
    let remaining = 0;

    for (const raw of emails) {
      const email = String(raw ?? "").trim().toLowerCase();
      if (!email || seen.has(email)) continue;
      seen.add(email);

      const { data, error } = await supa.rpc("founding_bracelet_lookup", { p_email: email });
      if (error) return json({ error: `Eligibility check failed: ${error.message}` }, 500);
      const lookup = (data ?? { state: "invalid", remaining: 0 }) as { state: string; seat_number?: number | null; remaining?: number };
      remaining = lookup.remaining ?? remaining;
      results.push({ email, state: lookup.state, seat_number: lookup.seat_number ?? null });
    }

    return json({ remaining, results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
