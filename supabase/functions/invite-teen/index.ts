// invite-teen — a guardian invites a teen (or, with role:"adult", an additional
// adult) by email. Creates the member's account via Supabase's invite magic
// link, sets their profile age_group, and links them to the guardian's
// household. The invitee clicks the emailed link, confirms, and lands on their
// dashboard. Existing accounts are linked, never duplicated.
//
// POST body: { email: string, first_name?: string, role?: "teen" | "adult" }

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
    const role: "teen" | "adult" = body?.role === "adult" ? "adult" : "teen";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: `A valid ${role} email address is required` }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // The caller must be an active/trialing member (guardian).
    const { data: caller } = await admin
      .from("profiles").select("id, name, membership_status")
      .eq("user_id", userRes.user.id).maybeSingle();
    if (!caller) return json({ error: "Profile not found" }, 404);
    if (!["active", "trialing"].includes(caller.membership_status ?? "")) {
      return json({ error: `You need an active membership to add a ${role}` }, 403);
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

    // Invite the member — sends the magic link and returns the new user.
    // If the email already has an account, link that account instead of
    // creating a duplicate.
    let memberId: string | null = null;
    const { data: invite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, age_group: role },
      redirectTo: "https://www.mindcast.co.nz/portal/set-password",
    });
    if (!inviteErr && invite.user?.id) {
      memberId = invite.user.id;
    } else {
      const { data: found } = await admin.auth.admin.listUsers({
        page: 1, perPage: 1, filter: `email=eq:${email}`,
      });
      const existingUser = found?.users?.[0];
      if (!existingUser?.id) {
        return json({ error: `Invite failed: ${inviteErr?.message ?? "no user found"}` }, 400);
      }
      memberId = existingUser.id;
    }
    if (!memberId) return json({ error: "Invite returned no user" }, 500);

    // Ensure the member profile carries the right age group + name (the auth
    // trigger may have created a default profile already — upsert to be safe).
    const { data: memberProfile, error: profErr } = await admin
      .from("profiles")
      .upsert({ user_id: memberId, first_name: first_name || null, age_group: role }, { onConflict: "user_id" })
      .select("id").single();
    if (profErr) return json({ error: `Profile update failed: ${profErr.message}` }, 500);

    // Link to the household.
    await admin.from("household_members").upsert(
      { household_id: householdId, profile_id: memberProfile.id, role_in_household: role },
      { onConflict: "household_id,profile_id" },
    );

    // A checkout-captured invitation for this email is now fulfilled.
    await admin
      .from("household_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("household_id", householdId)
      .eq("email_norm", email)
      .eq("status", "pending")
      .catch(() => {});

    return json({ ok: true, email, household_id: householdId });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
