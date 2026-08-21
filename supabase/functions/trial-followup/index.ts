// trial-followup — ONE warm email after a guest's trial session.
//
// Charter rules this function exists to honour:
//   - One send only. follow_up_sent_at is set atomically in the same UPDATE
//     that claims the row, so a double run can never double-send.
//   - No pressure, no urgency, no discount, no countdown. The copy below is
//     the whole playbook: thank them, tell them what membership is, leave the
//     door open.
//   - Respect unsubscribe: marketing_opt_out rows are never touched.
//
// Runs from pg_cron (see 20260819180000 migration for the schedule block) or
// manually by staff. verify_jwt = false, so the gate is the CRON_SECRET /
// service-role bearer — same pattern as send-practice-reminder.

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

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Mindcast <hello@mindcast.co.nz>";
const SITE = "https://www.mindcast.co.nz";

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

  // Gate: cron secret or a service-role bearer. Nothing else.
  const cronSecret = Deno.env.get("CRON_SECRET") || "";
  const givenSecret = req.headers.get("x-cron-secret") || "";
  if (!cronSecret || givenSecret !== cronSecret) {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ") || auth.replace("Bearer ", "") !== SERVICE_KEY) {
      return json({ error: "Not authorised" }, 401);
    }
  }

  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Claim eligible tickets atomically: redeemed at least 18 hours ago (let
    // the day settle), within the last 7 days (a month-late thank-you is
    // strange), never sent, never opted out.
    const { data: due, error: claimErr } = await supa
      .from("trial_tickets")
      .update({ follow_up_sent_at: new Date().toISOString() })
      .not("redeemed_at", "is", null)
      .not("email", "is", null)
      .lt("redeemed_at", new Date(Date.now() - 18 * 3600 * 1000).toISOString())
      .gt("redeemed_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
      .is("follow_up_sent_at", null)
      .eq("marketing_opt_out", false)
      .select("token, full_name, email")
      .limit(25);
    if (claimErr) throw claimErr;

    if (!RESEND_API_KEY) {
      return json({ ok: false, error: "RESEND_API_KEY unset", claimed: (due ?? []).length }, 500);
    }

    let sent = 0;
    for (const t of due ?? []) {
      const first = (t.full_name || "there").split(" ")[0];
      const html = emailLayout(
        "Thanks for coming on Sunday",
        `<p>Hi ${first},</p>
         <p>It was genuinely good to have you in the room. That's the whole first half of this
         email — thank you for giving a Sunday to it.</p>
         <p>If you're weighing up what comes next: Mindcast is one room, the same people, every
         week, for a year — a Sunday session across three rooms (adults, teens, kids), a workbook
         you keep, and a midweek group that goes deeper. Membership is how the room stays open;
         everything about it, including the free trial you used and the concession rate, is on
         <a href="${SITE}/membership" style="color:#307191;">the membership page</a>.</p>
         <p>If it wasn't for you, that's completely fine, and we won't chase you. And if you just
         want to keep following the material without attending, the weekly worksheet is always
         available on its own.</p>
         <p>Either way — notice it, name it, do it.</p>
         <p style="color:#5F7683;font-size:13px;margin-top:24px;">
           This is the only follow-up we send. If you'd rather not hear from us at all,
           <a href="${SUPABASE_URL}/functions/v1/trial-unsubscribe?token=${t.token}" style="color:#307191;">unsubscribe here</a>.
         </p>`,
      );

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [t.email],
          subject: "Thanks for coming on Sunday",
          html,
        }),
      });
      if (r.ok) sent++;
      else console.error(`follow-up failed for ${t.email}:`, r.status, await r.text());
    }

    return json({ ok: true, claimed: (due ?? []).length, sent });
  } catch (e) {
    console.error("trial-followup failed:", e);
    return json({ error: String(e) }, 500);
  }
});
