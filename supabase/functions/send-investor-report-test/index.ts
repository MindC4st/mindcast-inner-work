// Admin-only test delivery for the Investor Monthly Report Generator.
// The browser sends the exact static HTML/text snapshot it is previewing;
// this function authorises the Admin, validates the payload, sends via the
// existing Resend account and records a non-invasive delivery audit row.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { mindcastFrom } from "../_shared/email/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  if (!supabaseUrl || !serviceKey || !resendKey) {
    return json({ error: "Email service is not configured" }, 503);
  }

  const service = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: userError } = await service.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return json({ error: "Invalid session" }, 401);

  const [{ data: roles }, { data: profile }] = await Promise.all([
    service.from("user_roles").select("role").eq("user_id", user.id),
    service.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle(),
  ]);
  const isAdmin = roles?.some((row) => row.role === "admin") || profile?.is_admin === true;
  if (!isAdmin) return json({ error: "Admin access required" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const reportId = typeof body.report_id === "string" ? body.report_id : null;
  const to = typeof body.to === "string" ? body.to.trim().toLowerCase() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const html = typeof body.html === "string" ? body.html : "";
  const text = typeof body.text === "string" ? body.text : "";

  if (!reportId) return json({ error: "Investor report id is required" }, 400);
  if (!emailPattern.test(to)) return json({ error: "Enter a valid test email address" }, 400);
  if (!subject || /[\r\n]/.test(subject) || !html || !text) return json({ error: "A single-line subject, HTML and plain text are required" }, 400);
  if (html.length > 750_000 || text.length > 150_000) return json({ error: "Report output is too large" }, 413);
  if (/<script[\s>]/i.test(html)) return json({ error: "Scripts are not permitted in investor email HTML" }, 400);

  const { data: report } = await service
    .from("investor_reports")
    .select("id")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return json({ error: "Investor report not found" }, 404);

  const from = mindcastFrom(Deno.env.get("FROM_EMAIL"));
  const testSubject = `TEST — ${subject}`;
  const resend = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject: testSubject, html, text }),
  });
  const providerBody = await resend.json().catch(() => ({})) as { id?: string; message?: string };

  await service.from("investor_report_deliveries").insert({
    report_id: reportId,
    recipient_email: to,
    recipient_count: 1,
    subject: testSubject,
    sender: from,
    is_test: true,
    provider_message_id: providerBody.id ?? null,
    status: resend.ok ? "sent" : "failed",
    error: resend.ok ? null : providerBody.message ?? `Resend returned ${resend.status}`,
    sent_html: html,
    sent_text: text,
    sent_by: user.id,
  });

  if (!resend.ok) {
    return json({ error: providerBody.message ?? "Resend test delivery failed" }, 502);
  }

  await service.from("investor_report_audit").insert({
    report_id: reportId,
    event: "test_sent",
    actor_id: user.id,
    detail: { recipient: to, provider_message_id: providerBody.id ?? null },
  });

  return json({ ok: true, id: providerBody.id ?? null });
});
