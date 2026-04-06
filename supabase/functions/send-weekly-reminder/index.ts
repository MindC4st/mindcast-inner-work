import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Mindcast <hello@mindcast.co.nz>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const testEmail = body?.test_email;

    // Test mode: send a sample email to a specific address
    if (testEmail) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: testEmail,
          subject: "Week 1 reminder — Mindcast Pilot session is Tuesday",
          html: buildEmailHtml(1, { name: "Taupō Pilot", theme: "Lost Connections" }),
        }),
      });
      const resBody = await res.text();
      return new Response(JSON.stringify({ ok: res.ok, test: true, status: res.status, detail: resBody }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all cohorts with a start_date
    const { data: cohorts } = await supabase
      .from("cohorts")
      .select("id, name, start_date, theme");

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const results: { cohort: string; week: number; sent: number }[] = [];

    for (const cohort of cohorts ?? []) {
      if (!cohort.start_date) continue;

      const cohortStart = new Date(cohort.start_date);
      cohortStart.setUTCHours(0, 0, 0, 0);

      // Find which week's Sunday reminder matches today
      let weekNumber: number | null = null;
      for (let w = 1; w <= 10; w++) {
        // Tuesday of week W = cohortStart + (w-1)*7 + 1 day (cohortStart is Monday)
        const tuesdayMs = cohortStart.getTime() + ((w - 1) * 7 + 1) * 86400000;
        const sundayMs = tuesdayMs - 2 * 86400000;
        if (Math.abs(today.getTime() - sundayMs) < 86400000) {
          weekNumber = w;
          break;
        }
      }

      if (!weekNumber) continue;

      // Check if already sent for this week
      const { data: existing } = await supabase
        .from("email_reminders")
        .select("id")
        .eq("cohort_id", cohort.id)
        .eq("week_number", weekNumber)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Get all members of this cohort
      const { data: members } = await supabase
        .from("cohort_members")
        .select("user_id")
        .eq("cohort_id", cohort.id);

      if (!members?.length) continue;

      // Get emails from auth.users
      const userIds = members.map((m: any) => m.user_id);
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const emails = users
        .filter((u: any) => userIds.includes(u.id) && u.email)
        .map((u: any) => u.email as string);

      if (!emails.length) continue;

      // Send email to each member
      let sentCount = 0;
      for (const email of emails) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: email,
            subject: `Week ${weekNumber} reminder — ${cohort.name} session is Tuesday`,
            html: buildEmailHtml(weekNumber, cohort),
          }),
        });
        if (res.ok) sentCount++;
      }

      // Log the send
      await supabase.from("email_reminders").insert({
        cohort_id: cohort.id,
        week_number: weekNumber,
        recipient_count: sentCount,
        status: sentCount > 0 ? "sent" : "failed",
      });

      results.push({ cohort: cohort.name, week: weekNumber, sent: sentCount });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildEmailHtml(week: number, cohort: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body { font-family: 'Montserrat', -apple-system, sans-serif; background: #fffaf6; color: #0a1120; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 0 auto; padding: 48px 32px; }
        h1 { font-family: 'Bebas Neue', sans-serif; font-size: 32px; font-weight: 400; letter-spacing: 0.05em; margin: 0 0 12px; color: #0a1120; }
        p { font-size: 15px; line-height: 1.7; color: #1a2d45; margin: 0 0 24px; }
        .cta { display: inline-block; background: #0a1120; color: #fffaf6; font-weight: 600; font-size: 13px;
               text-decoration: none; padding: 14px 28px; letter-spacing: 0.1em; margin-bottom: 12px; }
        .cta-secondary { display: inline-block; border: 2px solid #0a1120; color: #0a1120; font-weight: 600; font-size: 13px;
                         text-decoration: none; padding: 12px 28px; letter-spacing: 0.1em; margin-left: 12px; }
        .footer { margin-top: 48px; font-size: 12px; color: #7a8a9a; border-top: 1px solid #e8e0d8; padding-top: 24px; }
        .week-badge { display: inline-block; background: #0a1120; color: #fffaf6;
                      font-size: 11px; font-weight: 600; letter-spacing: 0.15em; padding: 6px 14px; margin-bottom: 24px; }
        .theme-highlight { color: #3585af; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="week-badge">WEEK ${week} OF 10 — ${cohort.name.toUpperCase()}</div>
        <h1>Tomorrow's session is almost here.</h1>
        <p>
          This week's theme is <span class="theme-highlight">${cohort.theme || "inner work"}</span>.
          Before Tuesday's session, take 20 minutes to listen to this week's podcast episode
          and work through the reflection questions in your workbook.
        </p>
        <p>You'll get more out of the session when you come prepared.</p>
        <a href="https://mindcast.co.nz/workbook" class="cta">Open my workbook →</a>
        <a href="https://mindcast.co.nz/portal" class="cta-secondary">Listen to podcast</a>
        <div class="footer">
          <p>You're receiving this because you're a member of ${cohort.name}.<br/>
          <a href="https://mindcast.co.nz" style="color:#3585af;">mindcast.co.nz</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
