// issue-trial-ticket — public endpoint behind /try.
//
// The public free trial is ADULT-LED. An adult registers for one free session
// and may bring their own children/teens to that SAME session. Under-18s never
// register or attend independently — each minor becomes an individual
// trial_tickets row linked to the adult (linked_adult_id), and check-in enforces
// that a minor is only admitted with (or after) their adult in the same session.
//
// EMAIL IS THE PASS. This function creates (or reuses) the tickets, sends the
// pass(es) by email, and NEVER returns a token/QR to the browser — the inbox is
// the proof the email address is real. A failed send keeps the unredeemed
// tickets so the same email can retry delivery of the SAME pass.
//
// Public (verify_jwt = false) because the whole point is that the person does
// not have an account yet. One-free-trial-per-person is enforced in the
// database (partial unique index + atomic redemption).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import QRCode from "npm:qrcode@1.5.4";
import { ipAllowed, clientIp } from "../_shared/ip-rate-limit.ts";
import { renderTrialPass } from "./email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Mindcast <hello@mindcast.co.nz>";

/** Unambiguous alphabet: no O/0, I/1. These get read aloud at a door. */
const token = () => {
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const b = new Uint32Array(12);
  crypto.getRandomValues(b);
  return Array.from(b, (n) => A[n % A.length]).join("");
};

const normalizeEmail = (raw: string): string => String(raw ?? "").trim().toLowerCase();
const isValidEmail = (raw: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizeEmail(raw));

/** "ABCDEFGHJKMQ" -> "ABCD EFGH JKMQ" for the readable fallback code. */
const spacedToken = (t: string): string => t.replace(/(.{4})/g, "$1 ").trim();

/**
 * Child vs Teen from the existing Mindcast age-group rule: the Sunday rooms are
 * Little Ones (4–11) and Teens (12+). Boundary = 12th birthday.
 */
function ageGroupForDob(dob: string): "child" | "teen" {
  const d = new Date(`${dob}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age >= 12 ? "teen" : "child";
}

interface MinorInput {
  first_name: string;
  last_name: string;
  dob: string;
  email: string | null;
  age_group: "child" | "teen";
}

/** Deliver one pass by email (QR attachment + readable code fallback). */
async function deliverPass(opts: {
  token: string;
  first_name: string;
  email: string;
  siteOrigin: string;
  track: "Adult" | "Teen";
  linked_adult_name?: string | null;
}): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY unset — trial pass email cannot be sent");
    return false;
  }
  try {
    const passUrl = `${opts.siteOrigin}/b/${opts.token}`;
    const png = await QRCode.toDataURL(passUrl, {
      width: 640, margin: 1,
      color: { dark: "#303947", light: "#FFFFFF" },
    });
    const b64 = png.replace(/^data:image\/png;base64,/, "");

    const { subject, html } = renderTrialPass({
      first_name: opts.first_name,
      pass_code: spacedToken(opts.token),
      pass_url: passUrl,
      qr_cid: "mindcast-pass",
      track: opts.track,
      requires_accompanying_adult: opts.track === "Teen",
      linked_adult_name: opts.linked_adult_name ?? null,
    });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [opts.email],
        subject,
        html,
        attachments: [{ filename: "mindcast-pass.png", content: b64, cid: "mindcast-pass" }],
      }),
    });
    if (!r.ok) {
      console.error("Trial pass email failed:", r.status, await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Trial pass email error:", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  if (!ipAllowed(clientIp(req), 5, 3600_000)) {
    return json({ error: "Too many requests from this connection — please try again later." }, 429);
  }

  try {
    const body = await req.json();

    // Allowlisted pass-link origin only; never attacker-controlled redirects.
    const siteOrigin = (() => {
      const fallback = "https://www.mindcast.co.nz";
      try {
        const u = new URL(req.headers.get("origin") ?? fallback);
        const ok =
          u.hostname === "mindcast.co.nz" ||
          u.hostname.endsWith(".mindcast.co.nz") ||
          u.hostname.endsWith(".lovable.app") ||
          u.hostname === "localhost" ||
          u.hostname === "127.0.0.1";
        return ok ? u.origin : fallback;
      } catch {
        return fallback;
      }
    })();

    // ── Adult ──────────────────────────────────────────────────────────────
    const first_name = String(body.first_name ?? "").trim().slice(0, 80);
    const last_name = String(body.last_name ?? "").trim().slice(0, 80);
    const email = normalizeEmail(String(body.email ?? "")).slice(0, 200);
    const phone = String(body.phone ?? "").trim().slice(0, 40) || null;
    const full_name = [first_name, last_name].filter(Boolean).join(" ") || "Guest";

    if (!first_name || !last_name || !isValidEmail(email)) {
      return json({
        ok: false,
        reason: "invalid_details",
        message: "Please give us your first name, last name and a valid email.",
      }, 400);
    }

    // ── Minors ─────────────────────────────────────────────────────────────
    const minors: MinorInput[] = (Array.isArray(body.minors) ? body.minors : [])
      .slice(0, 6)
      .map((m: Record<string, unknown>) => {
        const fn = String(m?.first_name ?? "").trim().slice(0, 80);
        const ln = String(m?.last_name ?? "").trim().slice(0, 80);
        const dob = String(m?.dob ?? "").trim();
        const rawEmail = typeof m?.email === "string" ? normalizeEmail(m.email) : "";
        const age_group = /^\d{4}-\d{2}-\d{2}$/.test(dob) && !Number.isNaN(Date.parse(dob))
          ? ageGroupForDob(dob)
          : null;
        return {
          first_name: fn,
          last_name: ln,
          dob: dob || null,
          email: rawEmail || null,
          age_group: age_group as "child" | "teen",
        };
      })
      .filter((m: MinorInput & { dob: string | null }) => m.first_name && m.dob);

    for (const m of minors) {
      if (!m.age_group) {
        return json({ ok: false, reason: "invalid_minor", message: "Each child or teen needs a valid date of birth." }, 400);
      }
      if (m.age_group === "teen" && (!m.email || !isValidEmail(m.email))) {
        return json({
          ok: false,
          reason: "teen_email_required",
          message: "Teens need their own email address so their trial pass can be sent to them.",
        }, 400);
      }
    }

    const guardian_consent = body.guardian_consent === true;
    if (minors.length > 0 && !guardian_consent) {
      return json({
        ok: false,
        reason: "consent_required",
        message: "Parent or guardian consent is required before a child or teen can attend.",
      }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // ── One free trial per person ──────────────────────────────────────────
    // A pass is only "used" once successfully checked in (redeemed_at set).
    // Generating a pass never blocks anyone; a used pass does.
    const adultExisting = await supa
      .from("trial_tickets")
      .select("id, token, redeemed_at, expires_at")
      .eq("email", email)
      .is("linked_adult_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let adultTicketId: string;
    let adultToken: string;

    if (adultExisting?.data) {
      const e = adultExisting.data;
      if (e.redeemed_at) {
        return json({
          ok: false,
          reason: "already_used",
          message: "You've already used your free session. Join as a member to come back.",
        }, 409);
      }
      if (new Date(e.expires_at) > new Date()) {
        // Reuse the same unredeemed pass (lost inbox / failed send retry).
        adultTicketId = e.id;
        adultToken = e.token;
      } else {
        adultTicketId = "";
        adultToken = "";
      }
    } else {
      adultTicketId = "";
      adultToken = "";
    }

    // Reject any teen whose email already used their free trial.
    for (const m of minors) {
      if (m.age_group !== "teen" || !m.email) continue;
      const { data: used } = await supa
        .from("trial_tickets")
        .select("id")
        .eq("email", m.email)
        .not("redeemed_at", "is", null)
        .limit(1)
        .maybeSingle();
      if (used) {
        return json({
          ok: false,
          reason: "already_used",
          message: "Someone in this booking has already used their free Mindcast trial.",
        }, 409);
      }
    }

    // ── Create / reuse tickets ─────────────────────────────────────────────
    if (!adultTicketId) {
      adultToken = token();
      const { data: created, error: insErr } = await supa
        .from("trial_tickets")
        .insert({
          token: adultToken,
          full_name,
          email,
          phone,
          track: "Adult",
          guardian_name: minors.length > 0 ? full_name : null,
          guardian_consent_at: minors.length > 0 ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
      if (insErr || !created) throw insErr ?? new Error("Could not create adult ticket");
      adultTicketId = created.id;
    }

    // Minors: one row each, linked to the adult.
    const teenRecipients: { first_name: string; email: string; token: string }[] = [];
    for (const m of minors) {
      if (m.age_group === "teen" && m.email) {
        const { data: teenExisting } = await supa
          .from("trial_tickets")
          .select("id, token, redeemed_at")
          .eq("email", m.email)
          .eq("track", "Teen")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (teenExisting?.data && !teenExisting.data.redeemed_at) {
          // Reuse the teen's own unredeemed pass, re-linked to this adult.
          await supa
            .from("trial_tickets")
            .update({ linked_adult_id: adultTicketId })
            .eq("id", teenExisting.data.id);
          teenRecipients.push({
            first_name: m.first_name,
            email: m.email,
            token: teenExisting.data.token,
          });
          continue;
        }
        const t = token();
        await supa.from("trial_tickets").insert({
          token: t,
          full_name: [m.first_name, m.last_name].filter(Boolean).join(" "),
          email: m.email,
          track: "Teen",
          age_group: "teen",
          dob: m.dob,
          linked_adult_id: adultTicketId,
        });
        teenRecipients.push({ first_name: m.first_name, email: m.email, token: t });
      } else {
        // Child: no email/token of their own — carried on the adult's family scan.
        // Idempotent on retry by (adult, name, age_group).
        const childName = [m.first_name, m.last_name].filter(Boolean).join(" ");
        const { data: childExisting } = await supa
          .from("trial_tickets")
          .select("id")
          .eq("linked_adult_id", adultTicketId)
          .eq("full_name", childName)
          .eq("age_group", "child")
          .limit(1)
          .maybeSingle();
        if (childExisting?.data) continue;
        const t = token();
        await supa.from("trial_tickets").insert({
          token: t,
          full_name: childName,
          email: null,
          track: "Child",
          age_group: "child",
          dob: m.dob,
          linked_adult_id: adultTicketId,
        });
      }
    }

    // ── Deliver passes by email (awaited, never fire-and-forget) ───────────
    const failures: string[] = [];
    const adultOk = await deliverPass({
      token: adultToken,
      first_name,
      email,
      siteOrigin,
      track: "Adult",
    });
    if (!adultOk) failures.push(email);

    for (const t of teenRecipients) {
      const ok = await deliverPass({
        token: t.token,
        first_name: t.first_name,
        email: t.email,
        siteOrigin,
        track: "Teen",
        linked_adult_name: first_name,
      });
      if (!ok) failures.push(t.email);
    }

    if (failures.length > 0) {
      // Keep the unredeemed tickets so the same emails can retry delivery.
      return json({
        ok: false,
        reason: "email_delivery_failed",
        message: "We couldn't send your pass. Check your email address and try again.",
      }, 502);
    }

    return json({ ok: true, emailed: true });
  } catch (e) {
    console.error("issue-trial-ticket failed:", e);
    return json({
      ok: false,
      reason: "server_error",
      message: "Could not create your ticket. Please try again.",
    }, 500);
  }
});
