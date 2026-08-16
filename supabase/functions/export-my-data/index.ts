// export-my-data — the member-facing companion to delete-account (audit G8).
//
// Collects everything the database holds about the CALLER and returns it as
// one JSON document the portal downloads. Service-role reads (RLS bypass) but
// strictly scoped to the caller's own rows — never another member's.
//
// Authenticated (verify_jwt = true). No body needed.

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
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization") || "";
    const { data: userRes, error: userErr } = await supa.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userErr || !userRes?.user) return json({ error: "Not authenticated" }, 401);
    const userId = userRes.user.id;

    const { data: profile } = await supa
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) return json({ error: "No profile found" }, 404);
    const profileId = (profile as { id: string }).id;

    // Billing internals are ops data, not "your data" — strip them.
    delete (profile as Record<string, unknown>).stripe_customer_id;

    const byProfile = ["workbook_entries", "teen_workbook_entries", "kids_workbook_entries", "lesson_journal", "check_ins", "subscriptions"];
    const byUser = ["entries", "commitments", "domain_scores", "implementation_checkins", "bookmark_responses", "session_responses", "concession_requests"];

    const data: Record<string, unknown> = { profile };

    for (const t of byProfile) {
      const { data: rows } = await supa.from(t).select("*").eq("profile_id", profileId);
      data[t] = rows ?? [];
    }
    for (const t of byUser) {
      const { data: rows } = await supa.from(t).select("*").eq("user_id", userId);
      data[t] = rows ?? [];
    }

    // Safeguarding-adjacent records the member is entitled to see.
    const { data: consents } = await supa
      .from("guardian_consents").select("*").eq("subject_profile_id", profileId);
    data.guardian_consents = consents ?? [];

    const { data: collectors } = await supa
      .from("authorised_collectors").select("*").eq("added_by", profileId);
    data.authorised_collectors_added = collectors ?? [];

    const { data: outbox } = await supa
      .from("notification_outbox").select("*").eq("recipient_profile_id", profileId);
    data.notifications_sent_to_you = outbox ?? [];

    const { data: attSubj } = await supa
      .from("attendance_notifications").select("*").eq("subject_profile_id", profileId);
    const { data: attGuard } = await supa
      .from("attendance_notifications").select("*").eq("guardian_profile_id", profileId);
    data.attendance_notifications = [...(attSubj ?? []), ...(attGuard ?? [])];

    return json({
      exported_at: new Date().toISOString(),
      account: { user_id: userId, email: userRes.user.email },
      data,
    });
  } catch (e) {
    console.error("export-my-data failed:", e);
    return json({ error: "Export failed. Please try again." }, 500);
  }
});
