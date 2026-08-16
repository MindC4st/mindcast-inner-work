// door-scan — the ticketing endpoint behind the QR scanner at the theatre door.
//
// Two actions:
//   { action: "lookup",  token }              -> who is this, and are they in?
//   { action: "admit",   token, profile_ids } -> write the check-ins
//
// Staff only. Unlike nfc-checkin (which is a public endpoint any bracelet can
// hit), this one reads membership status and household composition for other
// people, so it requires an authenticated facilitator or admin.
//
// A scan resolves a HOUSEHOLD, not just a person — children do not carry
// phones and teens are often dropped off. The scanner shows the roster and the
// door staff admit whoever actually turned up. See the 20260818120000
// migration for the reasoning.
//
// Check-ins are written to public.check_ins, which the Welcome Wall already
// subscribes to over Realtime — so an admitted name appears on the wall with
// no extra plumbing.

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

const ENTITLED = ["active", "trialing"];

/** Accepts a raw token, a /b/<token> path, or a full bracelet URL. */
const extractToken = (raw: string): string => {
  const v = (raw || "").trim();
  const m = v.match(/\/b\/([A-Za-z0-9_-]+)/);
  return (m ? m[1] : v).trim();
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supa = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // ── Staff gate ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") || "";
    const { data: userResp } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
    const uid = userResp?.user?.id;
    if (!uid) return json({ error: "Sign in required" }, 401);

    const { data: roleRow } = await supa
      .from("user_roles").select("role").eq("user_id", uid)
      .in("role", ["facilitator", "admin"]).limit(1);
    if (!roleRow || roleRow.length === 0) return json({ error: "Door staff only" }, 403);

    const body = await req.json();
    const token = extractToken(String(body.token ?? ""));
    if (!token) return json({ error: "No code found in that scan" }, 400);

    // ── Lookup ────────────────────────────────────────────────────────────
    if (body.action !== "admit") {
      const { data: roster, error: rErr } = await supa
        .rpc("door_roster_for_token", { p_token: token });
      if (rErr) throw rErr;

      if (roster && roster.length > 0) {
        return json({
          kind: "member",
          people: roster.map((p: Record<string, unknown>) => ({
            ...p,
            entitled: ENTITLED.includes(String(p.membership_status)),
          })),
        });
      }

      // Not a member pass — is it an unredeemed trial ticket? Peek without
      // consuming it, so the door can see the name before admitting.
      const { data: t } = await supa
        .from("trial_tickets")
        .select("full_name, track, guests, redeemed_at, expires_at")
        .eq("token", token).maybeSingle();

      if (!t) return json({ kind: "unknown" }, 404);

      return json({
        kind: "trial",
        full_name: t.full_name,
        track: t.track,
        guests: t.guests ?? [],
        already_used: !!t.redeemed_at,
        expired: new Date(t.expires_at) <= new Date(),
      });
    }

    // ── Admit ─────────────────────────────────────────────────────────────
    const ids: string[] = Array.isArray(body.profile_ids) ? body.profile_ids : [];

    // Trial ticket: redeem atomically, then seat the guest. No profile exists
    // for a trial guest, so the check-in is nameless at the DB level and only
    // carries the display name for the wall.
    if (ids.length === 0) {
      const { data: red, error: redErr } = await supa
        .rpc("redeem_trial_ticket", { p_token: token, p_staff: uid });
      if (redErr) throw redErr;

      const r = Array.isArray(red) ? red[0] : red;
      if (!r?.ok) {
        return json({
          ok: false,
          reason: r?.reason ?? "unknown",
          full_name: r?.full_name ?? null,
        }, 409);
      }

      const guestCount = Array.isArray(r.guests) ? r.guests.length : 0;
      // Trial attendees appear on the wall like anyone else (never marked as
      // a trial) — but an under-18 trial guest without recorded guardian
      // consent stays off the projected surface entirely.
      const { data: ticketRow } = await supa
        .from("trial_tickets")
        .select("guardian_consent_at")
        .eq("token", token)
        .maybeSingle();
      const minorNoConsent = r.track !== "Adult" && !ticketRow?.guardian_consent_at;
      const { error: insErr } = await supa.from("check_ins").insert({
        profile_id: null,
        display_name: r.full_name,
        is_anonymous: false,
        track: r.track,
        source: "trial",
        wall_hidden: minorNoConsent,
      });
      if (insErr) throw insErr;

      return json({ ok: true, admitted: [r.full_name], guests: guestCount, kind: "trial" });
    }

    // Member household: re-read the roster server-side rather than trusting the
    // ids the tablet sent, so a tampered request cannot admit someone who is
    // not on this pass or not entitled.
    const { data: roster, error: rErr } = await supa
      .rpc("door_roster_for_token", { p_token: token });
    if (rErr) throw rErr;

    const allowed = new Map(
      (roster ?? [])
        .filter((p: Record<string, unknown>) => ENTITLED.includes(String(p.membership_status)))
        .map((p: Record<string, unknown>) => [String(p.profile_id), p]),
    );

    const toAdmit = ids.filter((id) => allowed.has(id));
    const refused = ids.filter((id) => !allowed.has(id));
    if (toAdmit.length === 0) {
      return json({ ok: false, reason: "not_entitled", refused }, 409);
    }

    const rows = await Promise.all(toAdmit.map(async (id) => {
      const p = allowed.get(id) as Record<string, unknown>;
      // Consent resolved per person at write time: minors need a live
      // wall_display consent; anyone may have opted out.
      let wallHidden = true;
      try {
        const { data: ok } = await supa.rpc("wall_display_allowed", { p_profile: id });
        wallHidden = ok !== true;
      } catch { /* default stays hidden */ }
      return {
        profile_id: id,
        display_name: String(p.display_name ?? "Member"),
        is_anonymous: false,
        track: String(p.track ?? "Adult"),
        source: "qr",
        wall_hidden: wallHidden,
      };
    }));

    // Skip anyone already seated today so a re-scan does not double the wall.
    const fresh = rows.filter((r) => {
      const p = allowed.get(r.profile_id) as Record<string, unknown>;
      return !p.checked_in_today;
    });

    if (fresh.length > 0) {
      const { error: insErr } = await supa.from("check_ins").insert(fresh);
      if (insErr) throw insErr;

      // Signing a teen/child in at the door creates an EXPECTED record on the
      // room roll — not an attendance record. The facilitator's roll call
      // turns expected into present, or surfaces the gap between the door and
      // the room. Never block entry on a failure here: record and resolve.
      const expected = fresh
        .filter((r) => r.track === "Teen" || r.track === "Child")
        .map((r) => ({
          room: r.track,
          subject_profile_id: r.profile_id,
          event: "signed_in",
          actor_user_id: uid,
        }));
      if (expected.length > 0) {
        const { error: rollErr } = await supa.from("roll_events").insert(expected);
        if (rollErr) console.error("roll_events signed_in failed (entry not blocked):", rollErr);
      }
    }

    return json({
      ok: true,
      kind: "member",
      admitted: fresh.map((r) => r.display_name),
      already_in: rows.length - fresh.length,
      refused,
    });
  } catch (e) {
    // Staff-facing but still authenticated-only; log detail, return a summary.
    console.error("door-scan failed:", e);
    return json({ error: "Scan failed. Try again or admit manually." }, 500);
  }
});
