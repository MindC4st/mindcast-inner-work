// nfc-checkin — door kiosk hits this with a bracelet's NFC id, we look the
// member up and drop a row into public.check_ins. The Welcome Wall slide
// is subscribed to that table's realtime feed, so the name appears the
// moment the bracelet is scanned.
//
// Public endpoint (no JWT). NFC ids are opaque tokens; an unknown id just
// 404s without leaking anything.
//
// POST body:  { nfc_id: string, track?: 'Adult'|'Teen'|'Child',
//               source?: 'kiosk'|'member_app'|'manual', scheduled_session_id?: string,
//               action?: 'checkin'|'left_early' }
// left_early is staff-only even though ordinary check-in remains token-based.
// Response:   { ok: true, display_name, track } | { error: string }
//
// The member's own-phone tap and the staff kiosk scan both call this endpoint;
// only `source` differs. Supabase Realtime on check_ins remains the single
// source of truth for the Welcome Wall either way.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { shouldDedupe } from "../_shared/checkin-dedupe.ts";
import { ipAllowed, clientIp } from "../_shared/ip-rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

type DisplayMode = "full" | "first_initial" | "anonymous";

const computeDisplayName = (
  p: { first_name?: string | null; last_name?: string | null; name?: string | null; display_name?: string | null },
  mode: DisplayMode,
): string => {
  if (mode === "anonymous") return "Anonymous";
  const fn = (p.first_name || "").trim();
  const ln = (p.last_name || "").trim();
  const fallback = ((p.display_name || p.name || "") + "").trim();
  const parts = (fn || ln) ? [fn, ln].filter(Boolean) : fallback.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Member";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  if (mode === "full") return last ? `${first} ${last}` : first;
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

const isStaffCaller = async (req: Request, admin: any, serviceKey: string): Promise<boolean> => {
  const authHeader = req.headers.get("Authorization") || "";
  if (serviceKey && authHeader === `Bearer ${serviceKey}`) return true;
  if (!authHeader.startsWith("Bearer ")) return false;

  const { data: userResult, error: userError } = await admin.auth.getUser(
    authHeader.slice("Bearer ".length),
  );
  if (userError || !userResult.user) return false;

  const { data: role, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userResult.user.id)
    .in("role", ["facilitator", "admin"])
    .limit(1)
    .maybeSingle();
  return !roleError && !!role;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // Flood guard only — a real kiosk scans dozens of bracelets an hour, so the
  // ceiling is generous (240/min per IP). Duplicate taps are already deduped.
  if (!ipAllowed(clientIp(req), 240, 60_000)) {
    return json({ error: "Too many scans — one moment, please." }, 429);
  }

  try {
    const body = await req.json();
    const { nfc_id } = body;
    if (!nfc_id || typeof nfc_id !== "string") return json({ error: "nfc_id required" }, 400);

    const VALID_TRACKS = ["Adult", "Teen", "Child"];
    const VALID_SOURCES = ["kiosk", "member_app", "manual"];
    const normalizeTrack = (v: unknown): string | null => {
      if (typeof v !== "string") return null;
      const t = v.trim().toLowerCase();
      if (t === "adult") return "Adult";
      if (t === "teen") return "Teen";
      if (t === "child" || t === "kids" || t === "kid") return "Child";
      return null;
    };
    const track = VALID_TRACKS.includes(body.track) ? body.track : normalizeTrack(body.track);
    const source = VALID_SOURCES.includes(body.source) ? body.source : "kiosk";
    const scheduledSessionId =
      typeof body.scheduled_session_id === "string" ? body.scheduled_session_id : null;
    // "left_early" is the same bracelet, scanned on the way out — the teen is
    // collecting their phone at the door anyway. See business/07_session_operations.md.
    const action = body.action === "left_early" ? "left_early" : "checkin";

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    if (action === "left_early" && !(await isStaffCaller(req, supa, SERVICE_KEY))) {
      return json({ error: "Staff authorisation required" }, 403);
    }

    const { data: profile, error: pErr } = await supa
      .from("profiles")
      .select("id, user_id, first_name, last_name, name, display_name, live_display_mode, age_group")
      .eq("nfc_id", nfc_id)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) return json({ error: "Unknown bracelet" }, 404);

    // Teen and child participation fails closed until a guardian has completed
    // the current annual form in /portal/family. The bracelet choice is
    // separate and explicit: a young person may attend without an NFC bracelet,
    // but this NFC endpoint cannot be used unless that use was consented to.
    const ageGroup = String((profile as any).age_group || "").toLowerCase();
    if (action === "checkin" && ["teen", "child", "little_ones"].includes(ageGroup)) {
      const programmeYear = Number(new Intl.DateTimeFormat("en-NZ", {
        timeZone: "Pacific/Auckland",
        year: "numeric",
      }).format(new Date()));
      const { data: consent, error: consentError } = await supa
        .from("youth_participation_consents")
        .select("attendance_consent, operational_data_consent, nfc_bracelet_consent, expires_at, revoked_at")
        .eq("subject_profile_id", profile.id)
        .eq("programme_year", programmeYear)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (consentError) throw consentError;
      if (!consent?.attendance_consent || !consent?.operational_data_consent) {
        return json({
          error: "A parent or guardian must complete the annual participation form before check-in.",
          code: "youth_consent_required",
        }, 403);
      }
      if (!consent.nfc_bracelet_consent) {
        return json({
          error: "NFC bracelet consent is not recorded. Please see a facilitator for check-in.",
          code: "youth_nfc_consent_required",
        }, 403);
      }
    }

    const mode = ((profile as any).live_display_mode as DisplayMode) || "first_initial";
    const displayName = computeDisplayName(profile, mode);
    // Always the member's first name + last initial — the tap page greets the
    // owner by name so a lost bracelet can be identified without logging in
    // (independent of the on-screen welcome-wall privacy mode).
    const welcomeName = computeDisplayName(profile, "first_initial");
    const isAnonymous = mode === "anonymous";

    // --- Leaving the room -------------------------------------------------
    if (action === "left_early") {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const { data: todays } = await supa
        .from("check_ins")
        .select("id, left_early_at")
        .eq("profile_id", profile.id)
        .gt("checked_in_at", startOfDay.toISOString())
        .order("checked_in_at", { ascending: false })
        .limit(1);
      const row = todays?.[0];
      if (!row) return json({ error: "No check-in found for today", display_name: displayName, welcome_name: welcomeName }, 404);
      if (row.left_early_at) {
        return json({ ok: true, deduped: true, action, display_name: displayName, welcome_name: welcomeName });
      }
      const { error: upErr } = await supa
        .from("check_ins")
        .update({ left_early_at: new Date().toISOString() })
        .eq("id", row.id);
      if (upErr) throw upErr;

      // Tell the linked adult — this is the safeguarding one, so it is sent
      // even when a guardian has opted out of present/absent pings.
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/attendance-notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
          body: JSON.stringify({ event: "left_early", profile_id: profile.id }),
        });
      } catch { /* best-effort */ }

      return json({ ok: true, action, display_name: displayName, welcome_name: welcomeName });
    }
    // -----------------------------------------------------------------------

    // Idempotency: collapse duplicate scans within the dedupe window so an
    // accidental double-tap doesn't double-name the wall.
    const { data: recent } = await supa
      .from("check_ins")
      .select("id, checked_in_at")
      .eq("profile_id", profile.id)
      .order("checked_in_at", { ascending: false })
      .limit(1);
    if (recent && recent.length > 0 && shouldDedupe((recent[0] as { checked_in_at: string }).checked_in_at, Date.now())) {
      return json({ ok: true, deduped: true, display_name: displayName, welcome_name: welcomeName });
    }

    // Wall consent is resolved at write time, so a revoked consent or opt-out
    // is honoured on the very next scan. Failure here hides rather than shows.
    let wallHidden = true;
    try {
      const { data: allowed } = await supa.rpc("wall_display_allowed", { p_profile: profile.id });
      wallHidden = allowed !== true;
    } catch { /* default stays hidden */ }

    const { error: insErr } = await supa.from("check_ins").insert({
      profile_id: profile.id,
      display_name: displayName,
      is_anonymous: isAnonymous,
      track: track ?? normalizeTrack((profile as any).age_group),
      source,
      scheduled_session_id: scheduledSessionId,
      wall_hidden: wallHidden,
    });
    if (insErr) throw insErr;

    // Tell the linked adult they arrived (under-18s only; the notifier decides
    // and no-ops for adults). Best-effort — never block a check-in on it.
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/attendance-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ event: "present", profile_id: profile.id }),
      });
    } catch { /* notification is best-effort */ }

    return json({ ok: true, display_name: displayName, welcome_name: welcomeName, track });
  } catch (e: any) {
    // This endpoint is public and unauthenticated, so the raw error (Postgres
    // messages, column names, constraint names) must not go back over the wire.
    // Log it where staff can read it; tell the caller only that it failed.
    console.error("nfc-checkin failed:", e);
    return json({ error: "Check-in failed. Please see a facilitator." }, 500);
  }
});
