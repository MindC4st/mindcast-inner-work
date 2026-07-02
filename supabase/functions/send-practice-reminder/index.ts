// send-practice-reminder — fires via pg_cron on Mon/Wed evenings + Sun morning.
//
// Body shape: { day: "mon" | "wed" | "sun" }
//
// For every authenticated member with at least one unlocked lesson:
//   1. find their *latest* unlocked week
//   2. look up that week's weekly_practice_<day> text (Adult audience for now)
//   3. send Resend email if notify_practice_email && profile email present
//   4. send Web Push to each device subscription if notify_practice_push
//
// Idempotency: practice_reminder_log has UNIQUE (day, sent_for_date) so a
// re-run on the same NZ day quietly skips repeat sends.
//
// Required Supabase secrets:
//   RESEND_API_KEY, FROM_EMAIL (existing)
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (new)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

type Day = "mon" | "wed" | "sun";

const DAY_COPY: Record<Day, { subject: (week: number) => string; intro: string }> = {
  mon: {
    subject: (w) => `Week ${w} · Monday practice`,
    intro: "Tonight's nudge — small, on purpose. Take 30 seconds to read it, then carry it into your day tomorrow.",
  },
  wed: {
    subject: (w) => `Week ${w} · Wednesday practice`,
    intro: "Mid-week pause. One simple practice for the next 48 hours.",
  },
  sun: {
    subject: (w) => `Week ${w} · Sunday — see you in the room`,
    intro: "Before this morning's session, one small thing to bring with you.",
  },
};

const fieldFor = (day: Day): "weekly_practice_mon" | "weekly_practice_wed" | "weekly_practice_sun" =>
  day === "mon" ? "weekly_practice_mon" : day === "wed" ? "weekly_practice_wed" : "weekly_practice_sun";

const nzDateString = (): string => {
  // YYYY-MM-DD in Pacific/Auckland — locale-independent.
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland", year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date());
};

// Session content is admin-authored, but escape anyway so a stray character
// (or a compromised row) can't inject markup into member emails.
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildEmailHtml = (week: number, day: Day, practice: string, theme: string, lessonUrl: string) => {
  const intro = DAY_COPY[day].intro;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body { font-family: 'Montserrat', -apple-system, sans-serif; background:#fffaf6; color:#0a1120; margin:0; padding:0; }
      .container { max-width:560px; margin:0 auto; padding:48px 32px; }
      .badge { display:inline-block; background:#0a1120; color:#fffaf6; font-size:10px; font-weight:600; letter-spacing:0.2em; padding:6px 14px; margin-bottom:24px; }
      h1 { font-family:'Bebas Neue', sans-serif; font-size:34px; font-weight:400; letter-spacing:0.05em; margin:0 0 12px; }
      p { font-size:15px; line-height:1.7; color:#1a2d45; margin:0 0 20px; }
      blockquote { font-family:Georgia, serif; font-style:italic; font-size:18px; color:#0a1120; border-left:3px solid #3585af; padding:8px 0 8px 18px; margin:24px 0; }
      .cta { display:inline-block; background:#0a1120; color:#fffaf6; font-weight:600; font-size:13px; text-decoration:none; padding:14px 28px; letter-spacing:0.1em; margin-top:8px; }
      .footer { margin-top:48px; font-size:11px; color:#7a8a9a; border-top:1px solid #e8e0d8; padding-top:24px; }
    </style></head><body><div class="container">
      <div class="badge">WEEK ${week} · ${day.toUpperCase()} PRACTICE</div>
      <h1>${escapeHtml(theme) || "This week"}</h1>
      <p>${intro}</p>
      <blockquote>"${escapeHtml(practice)}"</blockquote>
      <a class="cta" href="${lessonUrl}">Open in coursebook →</a>
      <div class="footer">You're getting this because practice reminders are on. Adjust in <a href="https://mindcast.co.nz/portal/settings" style="color:#3585af;">your settings</a>.</div>
    </div></body></html>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // verify_jwt is off for this function, so gate it ourselves: the pg_cron
  // schedule calls with the service-role key as the bearer. Without this,
  // anyone on the internet could trigger member emails/pushes.
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const day: Day = (body?.day as Day) || "mon";
    if (!["mon", "wed", "sun"].includes(day)) return json({ error: "day must be mon|wed|sun" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Mindcast <hello@mindcast.co.nz>";
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:hello@mindcast.co.nz";

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Idempotency check: have we already sent this day in NZ?
    const sentForDate = nzDateString();
    const { data: existing } = await supa
      .from("practice_reminder_log")
      .select("id").eq("day", day).eq("sent_for_date", sentForDate).maybeSingle();
    if (existing) return json({ ok: true, skipped: true, reason: "Already sent today" });

    // Pull every member with notification prefs + their latest unlocked week.
    const { data: profiles } = await supa
      .from("profiles")
      .select("user_id, email, name, notify_practice_email, notify_practice_push, age_group")
      .or("notify_practice_email.eq.true,notify_practice_push.eq.true");

    if (!profiles?.length) {
      await supa.from("practice_reminder_log").insert({ day, sent_for_date: sentForDate, email_sent: 0, push_sent: 0 });
      return json({ ok: true, day, reason: "No opted-in members" });
    }

    // Each member's latest unlocked week.
    const userIds = profiles.map((p: any) => p.user_id);
    const { data: unlocks } = await supa
      .from("unlocked_lessons")
      .select("user_id, week_number")
      .in("user_id", userIds);
    const latestWeek = new Map<string, number>();
    (unlocks || []).forEach((u: any) => {
      const cur = latestWeek.get(u.user_id) || 0;
      if (u.week_number > cur) latestWeek.set(u.user_id, u.week_number);
    });

    // Bulk-fetch the practice copy for the unlocked weeks we care about.
    const weeks = Array.from(new Set(latestWeek.values()));
    if (weeks.length === 0) {
      await supa.from("practice_reminder_log").insert({ day, sent_for_date: sentForDate, email_sent: 0, push_sent: 0 });
      return json({ ok: true, day, reason: "No unlocked weeks yet" });
    }
    const field = fieldFor(day);
    const { data: lessons } = await supa
      .from("mindcast_live_sessions")
      .select(`week_number, audience, theme_title, ${field}`)
      .in("week_number", weeks);

    // index by week + audience for fast lookup
    const lessonIdx = new Map<string, { theme_title: string; practice: string }>();
    (lessons || []).forEach((l: any) => {
      lessonIdx.set(`${l.week_number}::${l.audience}`, {
        theme_title: l.theme_title || "",
        practice: (l as any)[field] || "",
      });
    });

    // Configure web-push.
    let pushReady = false;
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      try {
        webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        pushReady = true;
      } catch (e) {
        console.error("VAPID setup failed", e);
      }
    }

    // Subscriptions, indexed by user_id.
    const { data: subsRaw } = await supa
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth");
    const subsByUser = new Map<string, any[]>();
    (subsRaw || []).forEach((s: any) => {
      const arr = subsByUser.get(s.user_id) || [];
      arr.push(s);
      subsByUser.set(s.user_id, arr);
    });

    let emailSent = 0;
    let pushSent = 0;
    let pushFailed = 0;

    for (const p of profiles as any[]) {
      const week = latestWeek.get(p.user_id);
      if (!week) continue;

      // Audience preference — fall back to Adult if we don't know.
      const audience = (p.age_group === "teen" ? "Teen" : p.age_group === "child" ? "Child" : "Adult");
      const lesson = lessonIdx.get(`${week}::${audience}`) || lessonIdx.get(`${week}::Adult`);
      if (!lesson?.practice) continue; // no copy for this day → skip silently

      const lessonUrl = `https://mindcast.co.nz/mindcast-live/lesson/${week}`;

      // ---- Email ----
      if (p.notify_practice_email && p.email && RESEND_API_KEY) {
        try {
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: p.email,
              subject: DAY_COPY[day].subject(week),
              html: buildEmailHtml(week, day, lesson.practice, lesson.theme_title, lessonUrl),
            }),
          });
          if (r.ok) emailSent++;
        } catch (e) { console.error("email send error", e); }
      }

      // ---- Push ----
      const subs = subsByUser.get(p.user_id) || [];
      if (p.notify_practice_push && pushReady && subs.length > 0) {
        const payload = JSON.stringify({
          title: `Week ${week} · ${day === "sun" ? "Sunday practice" : day === "wed" ? "Wednesday practice" : "Monday practice"}`,
          body: lesson.practice.length > 140 ? lesson.practice.slice(0, 137) + "…" : lesson.practice,
          url: `/mindcast-live/lesson/${week}`,
          tag: `mc-practice-${day}-${week}`,
          icon: "/pwa-icon-192.png",
        });
        for (const s of subs) {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              payload,
            );
            pushSent++;
          } catch (e: any) {
            pushFailed++;
            // 404/410 means the subscription is dead — clean up.
            const code = e?.statusCode;
            if (code === 404 || code === 410) {
              await supa.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
            } else {
              console.error("push send error", code, e?.body);
            }
          }
        }
      }
    }

    await supa.from("practice_reminder_log").insert({
      day, sent_for_date: sentForDate, email_sent: emailSent, push_sent: pushSent, push_failed: pushFailed,
    });

    return json({ ok: true, day, sent_for_date: sentForDate, email_sent: emailSent, push_sent: pushSent, push_failed: pushFailed });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
