// door-scan — the ticketing endpoint behind the QR scanner at the theatre door.
//
// Two actions:
//   { action: "lookup", token }        -> who is this, and are they in?
//   { action: "admit", token, ticket_ids | profile_ids }
//
// Staff only. Unlike nfc-checkin (a public endpoint any bracelet can hit), this
// one reads membership status, household composition and trial families for
// other people, so it requires an authenticated facilitator or admin.
//
// A member scan resolves a HOUSEHOLD; a trial scan resolves a FAMILY — the
// adult plus their linked children/teens. Under-18 trial check-in is enforced
// server-side by redeem_trial_family: a minor is only admitted with (or after)
// their linked adult in the SAME session.
//
// Check-ins are written to public.check_ins, which the Welcome Wall already
// subscribes to over Realtime.

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

/** Local door date as YYYY-MM-DD (the Sunday a trial is used on). */
const todayNZ = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

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

      // Not a member pass — a trial ticket? Resolve the family without
      // consuming anything, so the door can see who is on this booking.
      const { data: t } = await supa
        .from("trial_tickets")
        .select("id, token, full_name, track, age_group, linked_adult_id, guardian_consent_at, redeemed_at, expires_at, trial_used_session_date")
        .eq("token", token)
        .maybeSingle();

      if (!t) return json({ kind: "unknown" }, 404);

      let familyRows = [t];
      if (!t.linked_adult_id) {
        const { data: minors } = await supa
          .from("trial_tickets")
          .select("id, full_name, track, age_group, redeemed_at, trial_used_session_date")
          .eq("linked_adult_id", t.id)
          .order("age_group")
          .order("full_name");
        familyRows = [t, ...(minors ?? [])];
      }

      const today = todayNZ();
      return json({
        kind: "trial",
        full_name: t.full_name,
        already_used: !!t.redeemed_at,
        expired: new Date(t.expires_at) <= new Date(),
        guardian_consent: !!t.guardian_consent_at,
        people: familyRows.map((r: Record<string, unknown>) => ({
          ticket_id: r.id,
          name: r.full_name,
          track: r.track,
          age_group: r.age_group ?? null,
          is_adult: r.linked_adult_id == null,
          already_used: !!r.redeemed_at,
          checked_in_today: !!r.redeemed_at && r.trial_used_session_date === today,
        })),
      });
    }

    // ── Admit ─────────────────────────────────────────────────────────────
    const ticketIds: string[] = Array.isArray(body.ticket_ids) ? body.ticket_ids : [];
    const profileIds: string[] = Array.isArray(body.profile_ids) ? body.profile_ids : [];

    // ── Trial family admit (under-18 enforced in the database) ────────────
    if (ticketIds.length > 0) {
      const { data: red, error: redErr } = await supa
        .rpc("redeem_trial_family", {
          p_token: token,
          p_ticket_ids: ticketIds,
          p_session_date: todayNZ(),
          p_staff: uid,
        });
      if (redErr) throw redErr;

      const r = Array.isArray(red) ? red[0] : red;
      if (!r?.ok) {
        return json({ ok: false, reason: r?.reason ?? "unknown" }, 409);
      }

      const admitted: { id: string; full_name: string; track: string; age_group: string | null; is_adult: boolean }[] =
        Array.isArray(r.admitted) ? r.admitted : [];

      if (admitted.length === 0) {
        return json({ ok: true, kind: "trial", admitted: [], already_in: true });
      }

      // Wall consent: the adult's guardian_consent_at covers the linked minors.
      const { data: anchor } = await supa
        .from("trial_tickets")
        .select("id, linked_adult_id, guardian_consent_at")
        .eq("token", token)
        .maybeSingle();
      let adultConsented = false;
      if (anchor) {
        if (!anchor.linked_adult_id) {
          adultConsented = Boolean(anchor.guardian_consent_at);
        } else {
          const { data: adultRow } = await supa
            .from("trial_tickets")
            .select("guardian_consent_at")
            .eq("id", anchor.linked_adult_id)
            .maybeSingle();
          adultConsented = Boolean(adultRow?.guardian_consent_at);
        }
      }

      const rows = admitted.map((p) => ({
        profile_id: null,
        display_name: p.full_name,
        is_anonymous: false,
        track: p.track,
        source: "trial" as const,
        wall_hidden: p.track !== "Adult" && !adultConsented,
      }));

      const { error: insErr } = await supa.from("check_ins").insert(rows);
      if (insErr) throw insErr;

      return json({ ok: true, kind: "trial", admitted: admitted.map((p) => p.full_name) });
    }

    // ── Member household admit ────────────────────────────────────────────
    const { data: roster, error: rErr } = await supa
      .rpc("door_roster_for_token", { p_token: token });
    if (rErr) throw rErr;

    const allowed = new Map(
      (roster ?? [])
        .filter((p: Record<string, unknown>) => ENTITLED.includes(String(p.membership_status)))
        .map((p: Record<string, unknown>) => [String(p.profile_id), p]),
    );

    const toAdmit = profileIds.filter((id) => allowed.has(id));
    const refused = profileIds.filter((id) => !allowed.has(id));
    if (toAdmit.length === 0) {
      return json({ ok: false, reason: "not_entitled", refused }, 409);
    }

    const rows = await Promise.all(toAdmit.map(async (id) => {
      const p = allowed.get(id) as Record<string, unknown>;
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
        source: "qr" as const,
        wall_hidden: wallHidden,
      };
    }));

    const fresh = rows.filter((r) => {
      const p = allowed.get(r.profile_id) as Record<string, unknown>;
      return !p.checked_in_today;
    });

    if (fresh.length > 0) {
      const { error: insErr } = await supa.from("check_ins").insert(fresh);
      if (insErr) throw insErr;

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
    console.error("door-scan failed:", e);
    return json({ error: "Scan failed. Try again or admit manually." }, 500);
  }
});
