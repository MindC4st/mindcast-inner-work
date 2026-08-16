// roll-absence-sweep — the server-side backstop for brief-absence timers.
//
// The roll page runs a 10-minute timer client-side, but a facilitator's phone
// can sleep, lose wifi, or be closed. This sweep runs from cron and raises
// the same in-room alert the client would: any child whose latest roll state
// is 'brief_absence' for more than 10 minutes gets a brief_absence_overdue
// alert to the adult room, once per absence (deduped against existing alerts).
//
// verify_jwt = false; gated by CRON_SECRET / service-role bearer, same
// pattern as trial-followup and notify-outbox.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = { "Access-Control-Allow-Origin": "*" };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const LIMIT_MS = 10 * 60 * 1000;

const nzToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const cronSecret = Deno.env.get("CRON_SECRET") || "";
  const givenSecret = req.headers.get("x-cron-secret") || "";
  if (!cronSecret || givenSecret !== cronSecret) {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ") || auth.replace("Bearer ", "") !== SERVICE_KEY) {
      return json({ error: "Not authorised" }, 401);
    }
  }

  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const today = nzToday();
    const cutoff = new Date(Date.now() - LIMIT_MS).toISOString();

    // Latest attendance-relevant event per child today.
    const { data: latest, error: latestErr } = await supa.rpc("room_roll_latest_events", {
      p_date: today,
    });
    if (latestErr) throw latestErr;

    const overdue = ((latest ?? []) as {
      room: string; subject_profile_id: string; event: string;
      departure_reason: string | null; occurred_at: string; display_name: string;
    }[]).filter((r) =>
      r.event === "departed" &&
      r.departure_reason === "brief_absence" &&
      r.occurred_at < cutoff,
    );

    let raised = 0;
    for (const o of overdue) {
      // One alert per absence: skip if this room already raised one for this
      // child since the absence began.
      const { data: existing } = await supa
        .from("room_alerts")
        .select("id")
        .eq("session_date", today)
        .eq("source_room", o.room)
        .eq("kind", "brief_absence_overdue")
        .eq("subject_name", o.display_name)
        .gte("created_at", o.occurred_at)
        .limit(1);
      if ((existing ?? []).length > 0) continue;

      const { error: insErr } = await supa.from("room_alerts").insert({
        session_date: today,
        target_room: "Adult",
        source_room: o.room,
        kind: "brief_absence_overdue",
        subject_name: o.display_name,
        body: `${o.display_name} stepped out of the ${o.room} room more than 10 minutes ago and has not returned. Please check with their guardian now.`,
      });
      if (!insErr) raised++;
    }

    return json({ ok: true, overdue: overdue.length, raised });
  } catch (e) {
    console.error("roll-absence-sweep failed:", e);
    return json({ error: String(e) }, 500);
  }
});
