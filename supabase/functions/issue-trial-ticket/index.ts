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
import QRCode from "npm:qrcode@1.5.4";

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

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Mindcast <hello@mindcast.co.nz>";

// Shared brand layout (marker variant of the ripple — ●))) — because email
// clients cannot be trusted with SVG). Same template as notify-outbox.
const emailLayout = (title: string, bodyHtml: string) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#FFFAF5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFAF5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  <tr><td style="padding:0 8px 24px;">
    <span style="font-family:Georgia,serif;color:#3585AF;font-size:18px;letter-spacing:2px;">&#9679;)))</span>
    <span style="font-family:Arial,Helvetica,sans-serif;color:#102438;font-size:14px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;">&nbsp;Mindcast</span>
  </td></tr>
  <tr><td style="background:#FFFFFF;border:1px solid #E1E7EF;padding:32px;">
    <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.3;color:#102438;">${title}</h1>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#102438;">${bodyHtml}</div>
  </td></tr>
  <tr><td style="padding:20px 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:#307191;text-align:center;">
    NOTICE IT, NAME IT, DO IT
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

const nzDay = (iso: string) =>
  new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date(iso));

/** Deliver the pass by email: QR attachment + plain-text code fallback.
 *  Best-effort — the on-screen pass always works, so an email failure must
 *  never block the ticket itself. */
async function sendTicketEmail(opts: {
  token: string;
  full_name: string;
  email: string;
  intended_date: string | null;
  siteOrigin: string;
}) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY unset — trial pass email skipped");
    return;
  }
  try {
    const passUrl = `${opts.siteOrigin}/b/${opts.token}`;
    const png = await QRCode.toDataURL(passUrl, {
      width: 640, margin: 1,
      color: { dark: "#102438", light: "#FFFAF5" },
    });
    const b64 = png.replace(/^data:image\/png;base64,/, "");
    const when = opts.intended_date
      ? nzDay(`${opts.intended_date}T12:00:00+12:00`)
      : "any Sunday";

    const html = emailLayout(
      "Your Mindcast session pass",
      `<p>Hi ${opts.full_name.split(" ")[0]},</p>
       <p>Your free session pass is ready. It's good for <strong>one session</strong> —
       show the attached code at the door on ${when}.</p>
       <p style="text-align:center;margin:24px 0;">
         <img src="cid:mindcast-pass" alt="Your session pass QR code" width="240" style="width:240px;height:240px;" />
       </p>
       <p>If the code won't scan, just read this out at the door:</p>
       <p style="text-align:center;font-size:20px;letter-spacing:4px;font-weight:bold;color:#102438;">${opts.token}</p>
       <p>Arrive a little early so we can welcome you properly. No card, no obligation —
       and if it isn't for you, that's a fine answer.</p>
       <p style="color:#5F7683;font-size:13px;margin-top:24px;">
         One pass per person, single use. If you'd rather not hear from us about this,
         <a href="${Deno.env.get("SUPABASE_URL")}/functions/v1/trial-unsubscribe?token=${opts.token}" style="color:#307191;">unsubscribe here</a>.
       </p>`,
    );

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [opts.email],
        subject: "Your Mindcast session pass",
        html,
        attachments: [{ filename: "mindcast-pass.png", content: b64, cid: "mindcast-pass" }],
      }),
    });
    if (!r.ok) console.error("Trial pass email failed:", r.status, await r.text());
  } catch (e) {
    console.error("Trial pass email error:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const body = await req.json();

    // Where the pass link points. Allowlisted origins only; never attacker-
    // controlled redirects.
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

    // Under-18 attendance requires recorded guardian consent — same
    // safeguarding gate as membership. The ticket carries the record; the
    // door refuses to project an unconsented minor's name on any wall.
    const minorsAttending = track !== "Adult" || guests.length > 0;
    const guardian_name = String(body.guardian_name ?? "").trim().slice(0, 120) || null;
    const guardianConsents = body.guardian_consent === true;
    if (minorsAttending && (!guardian_name || !guardianConsents)) {
      return json({
        error: "A parent or guardian's name and consent are needed for anyone under 18.",
      }, 400);
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
        // Re-deliver the same pass by email as well, so a lost inbox isn't a
        // dead end. Same single ticket — never a second mint.
        void sendTicketEmail({
          token: existing.token, full_name, email, intended_date, siteOrigin,
        });
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
      guardian_name: minorsAttending ? guardian_name : null,
      guardian_consent_at: minorsAttending ? new Date().toISOString() : null,
    });
    if (error) throw error;

    void sendTicketEmail({ token: t, full_name, email, intended_date, siteOrigin });

    return json({ ok: true, token: t });
  } catch (e) {
    console.error("issue-trial-ticket failed:", e);
    return json({ error: "Could not create your ticket. Please try again." }, 500);
  }
});
