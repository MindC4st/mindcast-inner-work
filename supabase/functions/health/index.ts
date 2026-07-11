// health — lightweight uptime probe for UptimeRobot / BetterStack.
//
// Returns 200 only if the DB is reachable; 503 otherwise, so a monitor pages
// on real outages. Public (verify_jwt = false) and does a cheap read. Pair
// this with a separate synthetic Realtime check (connect to a channel and
// expect a heartbeat) — a session going dark mid-broadcast must alert fast.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async () => {
  const started = Date.now();
  const out = (body: Record<string, unknown>, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  try {
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    // Cheap connectivity check against a small, always-present table.
    const { error } = await supa
      .from("framework_steps")
      .select("id", { count: "exact", head: true });
    if (error) throw error;

    return out({ ok: true, db: "up", latency_ms: Date.now() - started }, 200);
  } catch (e: any) {
    return out({ ok: false, db: "down", error: e?.message ?? String(e) }, 503);
  }
});
