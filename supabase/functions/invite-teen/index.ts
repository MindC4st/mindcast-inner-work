// invite-teen — a guardian invites a teen by email. Creates the teen's account
// via Supabase's invite magic link, sets their profile to age_group='teen', and
// links them to the guardian's household as a teen. The teen clicks the emailed
// link, confirms, and lands on their (read-only) dashboard.
//
// POST body: { email: string, first_name?: string }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Caller must be signed in.
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await anon.auth.getUser();
    if (!userRes?.user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const first_name = String(body?.first_name ?? "").trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "A valid teen email address is required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // The caller must be an active/trialing member (guardian).
    const { data: caller } = await admin
      .from("profiles").select("id, name, membership_status")
      .eq("user_id", userRes.user.id).maybeSingle();
    if (!caller) return json({ error: "Profile not found" }, 404);
    if (!["active", "trialing"].includes(caller.membership_status ?? "")) {
      return json({ error: "You need an active membership to add a teen" }, 403);
    }

    // Find (or create) the caller's household.
    let householdId: string | null = null;
    const { data: existingMember } = await admin
      .from("household_members").select("household_id")
      .eq("profile_id", caller.id).maybeSingle();
    if (existingMember?.household_id) {
      householdId = existingMember.household_id;
    } else {
      const { data: hh, error: hhErr } = await admin
        .from("households")
        .insert({ name: `${caller.name || "Family"} household`, payer_profile_id: caller.id })
        .select("id").single();
      if (hhErr) return json({ error: `Household create failed: ${hhErr.message}` }, 500);
      householdId = hh.id;
      await admin.from("household_members").insert({
        household_id: householdId, profile_id: caller.id, role_in_household: "adult",
      });
    }

    // Invite the teen — sends the magic link and returns the new user.
    const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, age_group: "teen" },
      redirectTo: "https://www.mindcast.co.nz/portal/set-password",
    });
    if (inviteErr) return json({ error: `Invite failed: ${inviteErr.message}` }, 400);
    const teenUserId = invite.user?.id;
    if (!teenUserId) return json({ error: "Invite returned no user" }, 500);

    // Ensure the teen profile is marked teen + named (the auth trigger may have
    // created a default profile already — upsert to be safe).
    const { data: teenProfile, error: profErr } = await admin
      .from("profiles")
      .upsert({ user_id: teenUserId, first_name: first_name || null, age_group: "teen" }, { onConflict: "user_id" })
      .select("id").single();
    if (profErr) return json({ error: `Profile update failed: ${profErr.message}` }, 500);

    // Link to the household as a teen.
    await admin.from("household_members").upsert(
      { household_id: householdId, profile_id: teenProfile.id, role_in_household: "teen" },
      { onConflict: "household_id,profile_id" },
    );

    return json({ ok: true, email, household_id: householdId });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
