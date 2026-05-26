// select-weekly-callbacks — fires via pg_cron, Sun 9am NZ.
//
// For every (week, audience) that has approved public reflections from the
// past 7 days, snapshots up to 20 random ones into `featured_callbacks` with
// next_week_number = source_week + 1. That feeds the "Voices from last
// week" slide on next week's facilitator deck.
//
// Idempotent: if callbacks already exist for (next_week_number, audience),
// the function does nothing for that pair on this run.

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

const CALLBACKS_PER_PAIR = 20;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Source pool: approved public reflections from the past 7 days.
    // (Audience submissions only — privately-saved worksheet rows are
    // excluded via is_public = true.)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const { data: pool, error: poolErr } = await supa
      .from("session_responses")
      .select("id, week_number, audience_type, display_name, response_text, prompt_type")
      .eq("is_public", true)
      .eq("moderation_status", "approved")
      .gt("created_at", sevenDaysAgo);
    if (poolErr) throw poolErr;
    if (!pool?.length) return json({ ok: true, reason: "No approved public responses in last 7 days" });

    // Bucket by (week, audience).
    const buckets = new Map<string, any[]>();
    for (const r of pool) {
      const key = `${r.week_number}::${r.audience_type}`;
      const arr = buckets.get(key) || [];
      arr.push(r);
      buckets.set(key, arr);
    }

    const results: { week: number; audience: string; selected: number; skipped?: string }[] = [];

    for (const [key, rows] of buckets) {
      const [weekStr, audience] = key.split("::");
      const sourceWeek = parseInt(weekStr, 10);
      const nextWeek = sourceWeek + 1;

      // Skip if we've already populated callbacks for next week + audience.
      const { count: existingCount } = await supa
        .from("featured_callbacks")
        .select("id", { count: "exact", head: true })
        .eq("next_week_number", nextWeek)
        .eq("audience_type", audience);
      if ((existingCount ?? 0) > 0) {
        results.push({ week: sourceWeek, audience, selected: 0, skipped: "Already populated" });
        continue;
      }

      // Random sample up to CALLBACKS_PER_PAIR.
      const shuffled = [...rows].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, CALLBACKS_PER_PAIR);
      const inserts = picks.map(p => ({
        source_week_number: sourceWeek,
        next_week_number: nextWeek,
        audience_type: audience,
        response_id: p.id,
        display_name: p.display_name || "Anonymous",
        response_text: p.response_text,
        prompt_type: p.prompt_type,
      }));
      const { error: insErr } = await supa.from("featured_callbacks").insert(inserts);
      if (insErr) {
        results.push({ week: sourceWeek, audience, selected: 0, skipped: insErr.message });
        continue;
      }
      results.push({ week: sourceWeek, audience, selected: inserts.length });
    }

    return json({ ok: true, ran_at: new Date().toISOString(), results });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
