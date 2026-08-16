// bulk-generate-videos — generate metaphor videos for every lesson that has a
// `signal_metaphor`/`film_script_2min` and doesn't already have a finished asset.
//
// Strategy: this function does NOT do the generation itself. It walks the
// `mindcast_live_sessions` table and, for each (week, audience) that
// qualifies, calls the `generate-session-video` edge function (synchronous
// Gemini generation) via HTTP. Completed lessons carry
// `worksheets.render_status='ready'` and are skipped.
//
// Required env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
//   GENERATE_FN_URL (optional, derived from SUPABASE_URL otherwise)

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

const BATCH_SIZE = 4;
const PAUSE_MS = 1500;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!SUPABASE_URL || !SERVICE_KEY) return json({ error: "Server misconfigured" }, 500);
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Facilitator-only.
    const authHeader = req.headers.get("Authorization") || "";
    const { data: userResp } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    const uid = userResp?.user?.id;
    if (!uid) return json({ error: "Unauthorised" }, 401);
    const { data: roleRow } = await supa
      .from("user_roles").select("role").eq("user_id", uid).in("role", ["facilitator", "admin"]).limit(1);
    if (!roleRow || roleRow.length === 0) return json({ error: "Facilitators and admins only" }, 403);

    // Optional body: { audiences?: string[], force?: boolean }
    let body: { audiences?: string[]; force?: boolean } = {};
    try { body = await req.json(); } catch { /* empty body is fine */ }
    const wantAudiences = body.audiences && body.audiences.length > 0
      ? body.audiences
      : ["Adult", "Teen", "Child"];

    // Pull every lesson that has a non-empty script.
    const { data: lessons, error: lErr } = await supa
      .from("mindcast_live_sessions")
      .select("week_number, audience, film_script_2min")
      .in("audience", wantAudiences)
      .order("week_number", { ascending: true });
    if (lErr) throw lErr;

    const candidates = (lessons || []).filter(l => (l.film_script_2min || "").trim().length > 0);

    // Skip lessons whose worksheet already has a finished MP4 (unless force).
    const { data: existing } = await supa
      .from("worksheets")
      .select("week_number, audience_type, video_mp4_url, render_status");
    const doneSet = new Set(
      (existing || [])
        .filter(w => w.video_mp4_url && w.render_status === "ready")
        .map(w => `${w.week_number}::${w.audience_type}`)
    );
    const pendingSet = new Set(
      (existing || [])
        .filter(w => w.render_status === "processing")
        .map(w => `${w.week_number}::${w.audience_type}`)
    );

    const queue = candidates.filter(l => {
      const k = `${l.week_number}::${l.audience}`;
      if (body.force) return true;
      if (doneSet.has(k)) return false;
      if (pendingSet.has(k)) return false; // already in flight
      return true;
    });

    const generateUrl =
      Deno.env.get("GENERATE_FN_URL") || `${SUPABASE_URL}/functions/v1/generate-session-video`;

    const results: { week: number; audience: string; ok: boolean; error?: string }[] = [];
    const deadline = Date.now() + 45_000; // bail before Supabase 50s timeout

    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      if (Date.now() > deadline) {
        results.push({ week: -1, audience: "*", ok: false, error: "Time budget exhausted — re-run to continue" });
        break;
      }
      const batch = queue.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(async (l) => {
        try {
          const r = await fetch(generateUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Forward caller's bearer so the downstream fn still passes the
              // facilitator role check.
              Authorization: authHeader,
            },
            body: JSON.stringify({ week_number: l.week_number, audience: l.audience }),
          });
          const text = await r.text();
          if (!r.ok) return { week: l.week_number, audience: l.audience, ok: false, error: `${r.status} ${text.slice(0, 200)}` };
          return { week: l.week_number, audience: l.audience, ok: true };
        } catch (e: any) {
          return { week: l.week_number, audience: l.audience, ok: false, error: e?.message ?? String(e) };
        }
      }));
      results.push(...batchResults);
      if (i + BATCH_SIZE < queue.length) await new Promise(r => setTimeout(r, PAUSE_MS));
    }

    return json({
      ok: true,
      total_lessons_with_script: candidates.length,
      already_done: doneSet.size,
      already_processing: pendingSet.size,
      queued_this_run: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok && r.week !== -1),
      remaining_after_this_run: Math.max(0, queue.length - results.filter(r => r.ok).length),
      results,
    });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
