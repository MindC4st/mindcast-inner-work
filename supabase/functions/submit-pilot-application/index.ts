// submit-pilot-application — Edge function for pilot group applications
// Public, no auth. Validates, enforces cutoff, rate limits, inserts, sends emails.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Mindcast <hello@mindcast.co.nz>";

// ─── Cutoff: 9am Tuesday 29 Sep 2026, Pacific/Auckland (NZDT = UTC+13) ─────────
const CUTOFF_ISO = "2026-09-29T09:00:00+13:00";
const CUTOFF_MS = new Date(CUTOFF_ISO).getTime();

function nowInNZ(): number {
  // Use Intl to get current time in NZ — handles DST automatically
  const nzString = new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" });
  return new Date(nzString).getTime();
}

function isBeforeCutoff(): boolean {
  return nowInNZ() < CUTOFF_MS;
}

// ─── IP rate limit (reuse pattern from _shared/ip-rate-limit.ts) ───────────────
const buckets = new Map<string, number[]>();

function ipAllowed(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(ip, hits);
    return false;
  }
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 10000) buckets.clear();
  return true;
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// ─── Validation helpers ────────────────────────────────────────────────────────
function normalizePhone(raw: string): string {
  // Accept 027..., +6427..., 07..., with or without spaces
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("64")) return "+" + digits;
  if (digits.startsWith("0")) return "+64" + digits.slice(1);
  return "+64" + digits; // fallback
}

function parseDob(dd: string, mm: string, yyyy: string): Date | null {
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10) - 1;
  const y = parseInt(yyyy, 10);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
  const date = new Date(Date.UTC(y, m, d));
  // Validate by round-trip
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m || date.getUTCDate() !== d) return null;
  return date;
}

function ageAtStart(dob: Date): number {
  const start = new Date("2026-10-13");
  let age = start.getFullYear() - dob.getFullYear();
  const m = start.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && start.getDate() < dob.getDate())) age--;
  return age;
}

function formatDateNZ(dob: Date): string {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(dob);
}

function hashIp(ip: string): string {
  // Simple hash for storage — not cryptographic
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash) + ip.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

// ─── Email sending (direct via Resend, not notification_outbox) ────────────────
async function sendApplicantEmail(data: {
  email: string;
  firstName: string;
  q1: string;
  q2: string;
  q3: string;
  anythingElse: string;
}): Promise<void> {
  const subject = "Your Mindcast pilot group application";
  const preview = "A copy of what you sent, and what happens next.";

  const html = `
<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${subject}</title>
<style>
  body { margin:0; padding:0; background:#fffaf6; font-family:Montserrat,-apple-system,sans-serif; }
  .wrap { max-width:560px; margin:0 auto; padding:32px 24px; }
  .masthead { background:#3585af; padding:24px; text-align:center; }
  .masthead img { width:140px; height:auto; }
  .content { background:#fff; padding:32px 24px; }
  h1 { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:0.05em; color:#0a1120; margin:0 0 16px; }
  p { font-size:15px; line-height:1.7; color:#1a2d45; margin:0 0 16px; }
  .question { font-family:'Cormorant Garamond',Georgia,serif; font-style:italic; font-weight:500; font-size:17px; color:#0a1120; margin:24px 0 8px; }
  .answer { font-size:15px; line-height:1.7; color:#1a2d45; margin:0 0 24px; white-space:pre-wrap; }
  .footer { margin-top:32px; font-size:12px; color:#7a8a9a; border-top:1px solid #e8e0d8; padding-top:24px; }
  @media only screen and (max-width:620px) {
    .wrap { padding:16px 12px; }
    .content { padding:24px 16px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="masthead">
    <img src="https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/logo-cream.png" width="140" alt="Mindcast">
  </div>
  <div class="content">
    <h1>Thanks for applying, ${data.firstName}.</h1>
    <p>Your application has been received — here's a copy of exactly what you sent:</p>

    <div class="question">1. If money were no barrier, what would you actually be doing with your life?</div>
    <div class="answer">${data.q1}</div>

    <div class="question">2. What would the version of you from ten years ago be most surprised to hear about your life now?</div>
    <div class="answer">${data.q2}</div>

    <div class="question">3. Tell us about something you once believed you weren't the kind of person who could do — until you did it.</div>
    <div class="answer">${data.q3}</div>

    <div class="question">Anything else you'd like Ash to know?</div>
    <div class="answer">${data.anythingElse || "—"}</div>

    <p>Applications close at 9am on Tuesday 29 September. Ashleigh reads every application herself and will reach out to you personally before then, either way.</p>
  </div>
  <div class="footer">
    <p>Mindcast Limited · Taupō, Aotearoa New Zealand<br>
    Reply to this email and a person will read it.</p>
  </div>
</div>
</body>
</html>`;

  const text = `Thanks for applying, ${data.firstName}.

Your application has been received — here's a copy of exactly what you sent:

1. If money were no barrier, what would you actually be doing with your life?
${data.q1}

2. What would the version of you from ten years ago be most surprised to hear about your life now?
${data.q2}

3. Tell us about something you once believed you weren't the kind of person who could do — until you did it.
${data.q3}

Anything else you'd like Ash to know?
${data.anythingElse || "—"}

Applications close at 9am on Tuesday 29 September. Ashleigh reads every application herself and will reach out to you personally before then, either way.

--
Mindcast Limited
Taupō, Aotearoa New Zealand
Reply to this email and a person will read it.`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [data.email], subject, html, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend applicant email failed: ${err}`);
  }
}

async function sendAdminEmail(data: {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
  gender: string;
  genderSelfDescribed: string | null;
  q1: string;
  q2: string;
  q3: string;
  anythingElse: string;
  submittedAt: string;
}): Promise<void> {
  const genderLabel = data.gender
    ? data.gender === "another"
      ? `Another (${data.genderSelfDescribed || "not specified"})`
      : data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
    : "Not provided";

  const subject = `New pilot application — ${data.firstName} ${data.lastName}, ${data.age}`;
  const preview = `Application from ${data.firstName} ${data.lastName}, age ${data.age}`;

  const html = `
<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${subject}</title>
<style>
  body { margin:0; padding:0; background:#fffaf6; font-family:Montserrat,-apple-system,sans-serif; }
  .wrap { max-width:600px; margin:0 auto; padding:24px 16px; }
  .masthead { background:#3585af; padding:24px; text-align:center; }
  .masthead img { width:140px; height:auto; }
  .content { background:#fff; padding:24px 16px; }
  h1 { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:0.05em; color:#0a1120; margin:0 0 16px; }
  .meta { font-size:13px; line-height:1.8; color:#1a2d45; margin:0 0 16px; }
  .meta strong { color:#0a1120; }
  .question { font-family:'Cormorant Garamond',Georgia,serif; font-style:italic; font-weight:500; font-size:16px; color:#0a1120; margin:20px 0 6px; }
  .answer { font-size:14px; line-height:1.6; color:#1a2d45; margin:0 0 16px; white-space:pre-wrap; }
  .footer { margin-top:24px; font-size:11px; color:#7a8a9a; border-top:1px solid #e8e0d8; padding-top:16px; }
  @media only screen and (max-width:620px) { .wrap { padding:12px 8px; } }
</style>
</head>
<body>
<div class="wrap">
  <div class="masthead">
    <img src="https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/logo-cream.png" width="140" alt="Mindcast">
  </div>
  <div class="content">
    <h1>New pilot application</h1>
    <div class="meta">
      <strong>Name:</strong> ${data.firstName} ${data.lastName}<br>
      <strong>Age at 13 Oct 2026:</strong> ${data.age}<br>
      <strong>Email:</strong> ${data.email}<br>
      <strong>Phone:</strong> ${data.phone}<br>
      <strong>Gender:</strong> ${genderLabel}<br>
      <strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}
    </div>

    <div class="question">1. If money were no barrier, what would you actually be doing with your life?</div>
    <div class="answer">${data.q1}</div>

    <div class="question">2. What would the version of you from ten years ago be most surprised to hear about your life now?</div>
    <div class="answer">${data.q2}</div>

    <div class="question">3. Tell us about something you once believed you weren't the kind of person who could do — until you did it.</div>
    <div class="answer">${data.q3}</div>

    <div class="question">Anything else you'd like Ash to know?</div>
    <div class="answer">${data.anythingElse || "—"}</div>
  </div>
  <div class="footer">
    <p>View in admin: <a href="https://mindcast.co.nz/admin?tab=applications" style="color:#3585af;">mindcast.co.nz/admin?tab=applications</a></p>
  </div>
</div>
</body>
</html>`;

  const text = `New pilot application

Name: ${data.firstName} ${data.lastName}
Age at 13 Oct 2026: ${data.age}
Email: ${data.email}
Phone: ${data.phone}
Gender: ${genderLabel}
Submitted: ${new Date(data.submittedAt).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}

1. If money were no barrier, what would you actually be doing with your life?
${data.q1}

2. What would the version of you from ten years ago be most surprised to hear about your life now?
${data.q2}

3. Tell us about something you once believed you weren't the kind of person who could do — until you did it.
${data.q3}

Anything else you'd like Ash to know?
${data.anythingElse || "—"}

--
View in admin: https://mindcast.co.nz/admin?tab=applications`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: ["applications@mindcast.co.nz"], subject, html, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend admin email failed: ${err}`);
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // Rate limit: 3 per IP per hour
  const ip = clientIp(req);
  if (!ipAllowed(ip, 3, 60 * 60 * 1000)) {
    return json({ error: "Too many requests. Please try again later." }, 429);
  }

  // Enforce cutoff server-side
  if (!isBeforeCutoff()) {
    return json({ error: "Applications have closed", closed: true }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Validate required fields
  const {
    first_name,
    last_name,
    email,
    phone,
    dob_day,
    dob_month,
    dob_year,
    gender,
    gender_self_described,
    q1_money_no_barrier,
    q2_ten_years_ago,
    q3_didnt_think_could,
    anything_else,
  } = body as Record<string, string>;

  const errors: Record<string, string> = {};

  if (!first_name?.trim() || first_name.length > 60) errors.first_name = "First name required (1–60 chars)";
  if (!last_name?.trim() || last_name.length > 60) errors.last_name = "Last name required (1–60 chars)";
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email required";
  if (!phone?.trim()) errors.phone = "Phone required";

  // DOB validation
  const dob = parseDob(dob_day || "", dob_month || "", dob_year || "");
  if (!dob) {
    errors.dob = "Invalid date of birth";
  } else {
    const age = ageAtStart(dob);
    if (age < 30 || age > 45) {
      errors.dob = "You must be aged 30–45 on 13 October 2026";
    }
  }

  // Gender validation (optional)
  const validGenders = ["female", "male", "another", "undisclosed"];
  if (gender && !validGenders.includes(gender)) {
    errors.gender = "Invalid gender value";
  }
  if (gender === "another" && !gender_self_described?.trim()) {
    errors.gender_self_described = "Please specify";
  }

  // Questions: required, min 40 chars
  if (!q1_money_no_barrier?.trim() || q1_money_no_barrier.trim().length < 40) {
    errors.q1 = "At least 40 characters required";
  }
  if (!q2_ten_years_ago?.trim() || q2_ten_years_ago.trim().length < 40) {
    errors.q2 = "At least 40 characters required";
  }
  if (!q3_didnt_think_could?.trim() || q3_didnt_think_could.trim().length < 40) {
    errors.q3 = "At least 40 characters required";
  }

  if (Object.keys(errors).length > 0) {
    return json({ error: "Validation failed", errors }, 400);
  }

  // Insert application
  const supa = createClient(SUPABASE_URL, SERVICE_KEY);
  const submittedAt = new Date().toISOString();
  const normalizedPhone = normalizePhone(phone);
  const ipHash = hashIp(ip);
  const userAgent = req.headers.get("user-agent") || "";

  const { data: inserted, error: insertError } = await supa
    .from("pilot_applications")
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      date_of_birth: dob!.toISOString().split("T")[0],
      gender: gender || null,
      gender_self_described: gender === "another" ? gender_self_described?.trim() || null : null,
      q1_money_no_barrier: q1_money_no_barrier.trim(),
      q2_ten_years_ago: q2_ten_years_ago.trim(),
      q3_didnt_think_could: q3_didnt_think_could.trim(),
      anything_else: anything_else?.trim() || null,
      submitted_at: submittedAt,
      ip_hash: ipHash,
      user_agent: userAgent,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return json({ error: "An application with this email already exists" }, 409);
    }
    console.error("Insert error:", insertError);
    return json({ error: "Failed to save application" }, 500);
  }

  // Send emails. The application is already saved, so a send failure never
  // loses the submission — but we surface the exact error per email in the
  // response so delivery problems are diagnosable instead of silent.
  const emails: Record<string, { sent: boolean; error?: string }> = {};

  const applicant = await sendApplicantEmail({
    email: email.trim().toLowerCase(),
    firstName: first_name.trim(),
    q1: q1_money_no_barrier.trim(),
    q2: q2_ten_years_ago.trim(),
    q3: q3_didnt_think_could.trim(),
    anythingElse: anything_else?.trim() || "",
  }).then(() => ({ sent: true })).catch((e) => ({ sent: false, error: String(e?.message ?? e).slice(0, 500) }));
  emails.applicant = applicant;

  const admin = await sendAdminEmail({
    firstName: first_name.trim(),
    lastName: last_name.trim(),
    age: ageAtStart(dob!),
    email: email.trim().toLowerCase(),
    phone: normalizedPhone,
    gender: gender || "undisclosed",
    genderSelfDescribed: gender === "another" ? gender_self_described?.trim() || null : null,
    q1: q1_money_no_barrier.trim(),
    q2: q2_ten_years_ago.trim(),
    q3: q3_didnt_think_could.trim(),
    anythingElse: anything_else?.trim() || "",
    submittedAt,
  }).then(() => ({ sent: true })).catch((e) => ({ sent: false, error: String(e?.message ?? e).slice(0, 500) }));
  emails.admin = admin;

  if (!applicant.sent || !admin.sent) {
    console.error("Email send failed (application saved):", JSON.stringify(emails));
  }

  return json({ ok: true, id: inserted.id, emails });
});