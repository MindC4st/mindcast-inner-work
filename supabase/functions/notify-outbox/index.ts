// notify-outbox — drains the channel-agnostic notification queue.
//
// Layer 2 of the safeguarding notification design: the DATABASE row is the
// record (queued by record_departure / queue_notification, with the original
// occurred_at even when captured offline); this function is only a courier.
//
// Channel adapters: 'email' via Resend today; 'push' is a stub that records
// 'skipped' until the native app exists. Adding push is a new adapter and a
// per-guardian preference value (profiles.notify_channel) — not a rewrite.
//
// Content rules for guardian emails (charter/safeguarding):
//   - What happened, when (Pacific/Auckland), and who with.
//   - No other child's name, no room roll, no detail about anyone else.
//   - Calm and factual for a routine collection; for an unaccompanied
//     departure the email says a call is coming — email is never the only
//     handling for anything urgent.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { renderEmail } from "../_shared/email/layout.ts";
import { EVENT_MAP } from "../_shared/email/event-map.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Mindcast <hello@mindcast.co.nz>";

const nzTime = (iso: string) =>
  new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));

type OutboxRow = {
  id: string;
  recipient_profile_id: string;
  event: string;
  payload: Record<string, unknown>;
  occurred_at: string;
};

type Rendered = { subject: string; html: string; text: string } | null;

// deno-lint-ignore no-explicit-any
async function render(row: OutboxRow, supa: any): Promise<Rendered> {
  // 1. Template-based emails (the 13-event system)
  const template = EVENT_MAP[row.event];
  if (template) {
    const payload = { ...row.payload };
    // Inject unsubscribe_url for non-transactional emails
    if (!template.transactional) {
      payload.unsubscribe_url = `https://www.mindcast.co.nz/portal/settings`;
    }
    try {
      return renderEmail(template, payload);
    } catch (e) {
      console.error(`renderEmail failed for ${row.event}:`, e instanceof Error ? e.message : String(e));
      return null;
    }
  }

  // 2. Child-departure safeguarding emails (keep existing logic)
  if (row.event === "child_departure") {
    const p = row.payload as {
      child_name?: string;
      room?: string;
      reason?: string;
      destination?: string;
      collected_by_profile?: string;
      collected_by_collector?: string;
    };
    const when = nzTime(row.occurred_at);
    const name = p.child_name ?? "Your child";

    let withWhom = "";
    if (p.collected_by_profile) {
      const { data } = await supa
        .from("profiles")
        .select("display_name, first_name, name")
        .eq("id", p.collected_by_profile)
        .maybeSingle();
      withWhom = data?.display_name || data?.first_name || data?.name || "their guardian";
    } else if (p.collected_by_collector) {
      const { data } = await supa
        .from("authorised_collectors")
        .select("name")
        .eq("id", p.collected_by_collector)
        .maybeSingle();
      withWhom = data?.name || "an authorised collector";
    }

    const guardianEmail = (subject: string, preview: string, bodyHtml: string): Rendered =>
      renderEmail({
        subject: () => subject,
        previewText: () => preview,
        transactional: true,
        body: () => bodyHtml,
      }, {});

    const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
    const para = (s: string) => `<p style="margin:0 0 12px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">${s}</p>`;

    switch (p.reason) {
      case "collected":
        return guardianEmail(
          `${name} was collected from Mindcast`,
          `${name} has been collected`,
          para(`${name} was collected from the ${p.room} room on ${when} by ${withWhom}.`) +
          para(`Nothing to do — this is just the record of it. If anything about this looks wrong, reply to this email or speak to the team on Sunday.`),
        );
      case "moved":
        return guardianEmail(
          `${name} moved rooms at Mindcast`,
          `${name} moved to the ${p.destination} room`,
          para(`${name} left the ${p.room} room on ${when} and joined the ${p.destination} room — usually this means sitting with family for the rest of the session.`) +
          para(`Nothing to do; this is the record of it.`),
        );
      case "self_signout":
        return guardianEmail(
          `${name} signed out of Mindcast`,
          `${name} signed themselves out`,
          para(`${name} signed out of the ${p.room} room on ${when}, using the self-sign-out permission you set up.`) +
          para(`If you'd like to change that permission, you can do it any time in your portal settings.`),
        );
      case "brief_absence":
        return null;
      case "unaccompanied":
        return guardianEmail(
          `Please read now — ${name} left the session room`,
          `${name} left the room unaccompanied`,
          para(`${name} left the ${p.room} room on ${when} without an adult and without being signed out to anyone.`) +
          `<p style="margin:0 0 12px;font-family:${M};font-size:15px;line-height:1.7;color:#102438;"><strong>The team in the building was alerted immediately and someone will phone you — this email is the written record, not the response.</strong></p>` +
          para(`If you are in the building, please come to the ${p.room} room now.`),
        );
      default:
        return null;
    }
  }

  // Unknown event types are skipped, visibly, rather than guessed at.
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    // Caller must be staff (the roll UI calls this after queuing) or the cron.
    const cronSecret = Deno.env.get("CRON_SECRET") || "";
    const givenSecret = req.headers.get("x-cron-secret") || "";
    if (!cronSecret || givenSecret !== cronSecret) {
      const authHeader = req.headers.get("Authorization") || "";
      if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
      const anon = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userRes } = await anon.auth.getUser();
      if (!userRes?.user) return json({ error: "Not authenticated" }, 401);
      const { data: roles } = await supa
        .from("user_roles")
        .select("role")
        .eq("user_id", userRes.user.id);
      const staff = (roles ?? []).some((r: { role: string }) =>
        r.role === "facilitator" || r.role === "admin"
      );
      if (!staff) return json({ error: "Staff only" }, 403);
    }

    // Claim a batch atomically: the UPDATE only matches queued rows, so two
    // concurrent drains cannot both send the same message.
    const { data: claimed, error: claimErr } = await supa
      .from("notification_outbox")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("status", "queued")
      .select("id, recipient_profile_id, event, payload, occurred_at")
      .limit(25);
    if (claimErr) throw claimErr;

    let sent = 0, skipped = 0, failed = 0;

    for (const row of (claimed ?? []) as OutboxRow[]) {
      const finish = async (patch: Record<string, unknown>) => {
        await supa.from("notification_outbox").update(patch).eq("id", row.id);
      };

      try {
        const { data: recipient } = await supa
          .from("profiles")
          .select("email, notify_channel, display_name, first_name, marketing_opt_out")
          .eq("id", row.recipient_profile_id)
          .maybeSingle();

        const channel = recipient?.notify_channel ?? "email";

        if (channel === "none") {
          await finish({ status: "skipped", channel, error: "recipient opted out" });
          skipped++;
          continue;
        }
        if (channel === "push") {
          // Adapter not built yet — recorded, not lost.
          await finish({ status: "skipped", channel, error: "push adapter not yet available" });
          skipped++;
          continue;
        }

        const message = await render(row, supa);
        if (!message) {
          await finish({ status: "skipped", channel, error: `no template for ${row.event}/payload` });
          skipped++;
          continue;
        }
        // Suppress non-transactional emails for unsubscribed members
        const tmpl = EVENT_MAP[row.event];
        if (tmpl && !tmpl.transactional && recipient?.marketing_opt_out) {
          await finish({ status: "skipped", channel, error: "marketing opt-out" });
          skipped++;
          continue;
        }
        if (!recipient?.email || !RESEND_API_KEY) {
          await finish({ status: "failed", channel, error: !recipient?.email ? "no email on file" : "RESEND_API_KEY unset" });
          failed++;
          continue;
        }

        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [recipient.email],
            subject: message.subject,
            html: message.html,
            text: message.text,
          }),
        });
        if (!r.ok) {
          const errText = await r.text();
          await finish({ status: "failed", channel, destination: recipient.email, error: errText.slice(0, 500) });
          failed++;
          continue;
        }
        await finish({ channel, destination: recipient.email });
        sent++;
      } catch (e) {
        await finish({ status: "failed", error: String(e).slice(0, 500) });
        failed++;
      }
    }

    return json({ ok: true, sent, skipped, failed, claimed: (claimed ?? []).length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
