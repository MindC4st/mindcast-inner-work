// attendance-notify — tells a linked adult that their young person arrived,
// didn't arrive, or left early. Policy: business/07_session_operations.md §3.
//
// Two modes:
//   POST { event: "present" | "left_early", profile_id }  → notify for one person
//   POST { event: "absent_sweep", track?, date? }         → after the session has
//        started, notify guardians of any under-18 expected today with no check-in
//
// Under-18s only. The message contains attendance facts and nothing else —
// never what the young person said, wrote, or reflected on.
//
// SMS is sent via Twilio when configured. With no provider configured the
// function still records every message it *would* have sent (status 'skipped'),
// so the flow is testable and auditable before you have an account.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//      TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM   (all optional)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const TZ = "Pacific/Auckland";
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
const clockTime = () =>
  new Date().toLocaleTimeString("en-NZ", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

const firstName = (p: any) =>
  (p?.first_name || (p?.name || "").split(" ")[0] || "Your young person").trim();

function messageFor(event: string, name: string): string {
  switch (event) {
    case "present":
      return `${name} marked present at Mindcast today, ${clockTime()}.`;
    case "left_early":
      return `${name} left the Mindcast session early at ${clockTime()}.`;
    case "absent":
      return `${name} was not marked present at Mindcast today.`;
    default:
      return `${name}: attendance update.`;
  }
}

/** Send one SMS via Twilio. Returns null on success, an error string otherwise. */
async function sendSms(to: string, body: string): Promise<string | null> {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_FROM");
  if (!sid || !token || !from) return "no_provider";
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa(`${sid}:${token}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    );
    if (!res.ok) return `twilio_${res.status}: ${(await res.text()).slice(0, 200)}`;
    return null;
  } catch (e: any) {
    return e?.message ?? String(e);
  }
}

/** Notify every linked guardian of one young person about one event. */
async function notifyFor(profileId: string, event: "present" | "absent" | "left_early") {
  const { data: subject } = await admin
    .from("profiles").select("id, name, first_name, age_group").eq("id", profileId).maybeSingle();
  if (!subject) return { skipped: "no_profile" };

  // Under-18 tracks only — adults are never reported on.
  const age = (subject.age_group || "adult").toLowerCase();
  if (!["teen", "child", "kids"].includes(age)) return { skipped: "adult" };

  const { data: guardians } = await admin.rpc("guardians_to_notify", { target_profile: profileId });
  if (!guardians || guardians.length === 0) return { skipped: "no_guardian" };

  const name = firstName(subject);
  const body = messageFor(event, name);
  const date = today();
  let sent = 0, skipped = 0, failed = 0;

  for (const g of guardians as any[]) {
    // Per-guardian preferences. Left-early always goes out — it's the
    // safeguarding one — while present/absent can be opted out of.
    if (event === "present" && g.notify_present === false) { skipped++; continue; }
    if (event === "absent" && g.notify_absent === false) { skipped++; continue; }

    const to = (g.phone || "").trim();
    const wantsSms = g.notify_sms !== false && !!to;

    let status = "queued", error: string | null = null, channel = wantsSms ? "sms" : "none";
    if (wantsSms) {
      const err = await sendSms(to, body);
      if (err === "no_provider") { status = "skipped"; error = "No SMS provider configured"; }
      else if (err) { status = "failed"; error = err; failed++; }
      else { status = "sent"; sent++; }
    } else {
      status = "skipped";
      error = to ? "SMS disabled for this guardian" : "No phone number on file";
    }
    if (status === "skipped") skipped++;

    // Log it. The UNIQUE (subject, guardian, date, event) constraint makes the
    // sweep and any retry idempotent — a second run won't double-message.
    await admin.from("attendance_notifications").upsert({
      subject_profile_id: profileId,
      guardian_profile_id: g.guardian_profile_id,
      session_date: date,
      event, channel, destination: to || null, body, status, error,
    }, { onConflict: "subject_profile_id,guardian_profile_id,session_date,event", ignoreDuplicates: true });
  }
  return { sent, skipped, failed };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const event = String(body.event || "");

    if (event === "present" || event === "left_early") {
      if (!body.profile_id) return json({ error: "profile_id required" }, 400);
      return json(await notifyFor(String(body.profile_id), event));
    }

    if (event === "absent_sweep") {
      const date = String(body.date || today());
      // Everyone under 18 who is an active member of a household.
      const { data: youngPeople } = await admin
        .from("household_members")
        .select("profile_id, role_in_household")
        .in("role_in_household", ["child", "teen"]);
      if (!youngPeople?.length) return json({ checked: 0 });

      const ids = youngPeople.map((y: any) => y.profile_id);
      // Who checked in today?
      const { data: present } = await admin
        .from("check_ins")
        .select("profile_id")
        .gte("checked_in_at", `${date}T00:00:00`)
        .in("profile_id", ids);
      const presentIds = new Set((present || []).map((p: any) => p.profile_id));

      let notified = 0;
      for (const id of ids) {
        if (presentIds.has(id)) continue;
        const r = await notifyFor(id, "absent");
        if ((r as any).sent) notified += (r as any).sent;
      }
      return json({ checked: ids.length, absent: ids.length - presentIds.size, notified });
    }

    return json({ error: "Unknown event" }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
