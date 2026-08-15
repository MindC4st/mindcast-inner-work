// issue-trial-ticket — public endpoint behind /try.
//
// Sessions are members-only. This is the one door in: a prospective member
// registers their details once and gets a ticket for ONE session. There is no
// standing free tier, so the ticket is single use and the enforcement lives in
// the database (see redeem_trial_ticket in the 20260818120000 migration), not
// in this function and not in the UI.
//
// Public (verify_jwt = false) because the whole point is that the person does
// not have an account yet.

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

const TRACKS = ["Adult", "Teen", "Child"];

const token = () => {
  // Unambiguous alphabet: no O/0, I/1. These get read aloud at a door.
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const b = new Uint32Array(12);
  crypto.getRandomValues(b);
  return Array.from(b, (n) => A[n % A.length]).join("");
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const body = await req.json();
    const full_name = String(body.full_name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
    const phone = String(body.phone ?? "").trim().slice(0, 40) || null;
    const track = TRACKS.includes(body.track) ? body.track : "Adult";
    const intended_date = typeof body.intended_date === "string" ? body.intended_date : null;

    // Children coming along: names and ages only, so the door knows how many
    // seats and which rooms. No profiles are created for someone who may never
    // return, and nothing here is a login.
    const guests = Array.isArray(body.guests)
      ? body.guests.slice(0, 6).map((g: Record<string, unknown>) => ({
          name: String(g?.name ?? "").trim().slice(0, 80),
          track: TRACKS.includes(String(g?.track)) ? String(g?.track) : "Child",
        })).filter((g: { name: string }) => g.name)
      : [];

    if (!full_name || !email.includes("@")) {
      return json({ error: "Please give us a name and a valid email." }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // One free session per person. If they already hold an unredeemed ticket,
    // hand back the same one rather than minting a second — otherwise "single
    // use" is trivially defeated by filling the form twice.
    const { data: existing } = await supa
      .from("trial_tickets")
      .select("token, redeemed_at, expires_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (!existing.redeemed_at && new Date(existing.expires_at) > new Date()) {
        return json({ ok: true, token: existing.token, reissued: true });
      }
      // Already used their free session. Say so plainly; do not silently mint
      // another, and do not pretend it worked.
      return json({
        ok: false,
        reason: "already_used",
        message: "You've already used your free session. Join as a member to come back.",
      }, 409);
    }

    const t = token();
    const { error } = await supa.from("trial_tickets").insert({
      token: t, full_name, email, phone, track, guests, intended_date,
    });
    if (error) throw error;

    return json({ ok: true, token: t });
  } catch (e) {
    console.error("issue-trial-ticket failed:", e);
    return json({ error: "Could not create your ticket. Please try again." }, 500);
  }
});
