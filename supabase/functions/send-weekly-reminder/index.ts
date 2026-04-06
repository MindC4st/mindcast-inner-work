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
      <style>
        body { font-family: -apple-system, 'Nunito', sans-serif; background: #0F1E35; color: #F5F1E8; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 0 auto; padding: 48px 32px; }
        h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #F5F1E8; }
        p { font-size: 16px; line-height: 1.6; color: #a0b0c0; margin: 0 0 24px; }
        .cta { display: inline-block; background: #F5F1E8; color: #0F1E35; font-weight: 600;
               text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-bottom: 12px; }
        .cta-secondary { display: inline-block; border: 1px solid #2a3f55; color: #F5F1E8; font-weight: 600;
                         text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-left: 12px; }
        .footer { margin-top: 48px; font-size: 12px; color: #556677; }
        .week-badge { display: inline-block; background: #1a2d45; border: 1px solid #2a3f55;
                      color: #a0b0c0; font-size: 12px; padding: 4px 12px; border-radius: 20px; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="week-badge">WEEK ${week} OF 10 — ${cohort.name.toUpperCase()}</div>
        <h1>Tomorrow's session is almost here.</h1>
        <p>
          This week's theme is <strong style="color:#F5F1E8;">${cohort.theme || "inner work"}</strong>.
          Before Tuesday's session, take 20 minutes to listen to this week's podcast episode
          and work through the reflection questions in your workbook.
        </p>
        <p>You'll get more out of the session when you come prepared.</p>
        <a href="https://mindcast-inner-work.lovable.app/workbook" class="cta">Open my workbook →</a>
        <a href="https://mindcast-inner-work.lovable.app/portal" class="cta-secondary">Listen to podcast</a>
        <div class="footer">
          <p>You're receiving this because you're a member of ${cohort.name}.<br/>
          <a href="https://mindcast.co.nz" style="color:#556677;">mindcast.co.nz</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
