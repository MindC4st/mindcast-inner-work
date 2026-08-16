#!/usr/bin/env node
// brand-auth-emails.mjs — apply the Mindcast brand layout to Supabase's auth
// emails (audit G12): confirm signup, magic link, reset password, invite and
// email change. The notification-only templates (password changed, etc.) are
// deliberately left default — they're not member-facing lifecycle moments.
//
//   node scripts/brand-auth-emails.mjs [--dry-run]
//
// Env: SUPABASE_MGMT_TOKEN (Supabase personal access token).
// Idempotent: sets the same template every run.
//
// Placeholders used by Supabase:
//   {{ .ConfirmationURL }}  {{ .Token }}  {{ .Email }}  {{ .SiteURL }}

const PROJECT = process.env.SUPABASE_PROJECT_REF || "pjyelgogdsuiugaudecc";
const TOKEN = process.env.SUPABASE_MGMT_TOKEN;
if (!TOKEN) {
  console.error("Set SUPABASE_MGMT_TOKEN (a Supabase personal access token).");
  process.exit(1);
}
const DRY_RUN = process.argv.includes("--dry-run");
const URI = `https://api.supabase.com/v1/projects/${PROJECT}/config/auth`;

// Shared brand layout — the marker-variant ripple (●))) + Ivory/Navy palette,
// matching notify-outbox / issue-trial-ticket.
const layout = (title, bodyHtml) => `<!doctype html>
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

const button = (url, label) =>
  `<p style="text-align:center;margin:24px 0;"><a href="${url}" style="display:inline-block;background:#3585AF;color:#FFFFFF;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:2px;padding:14px 28px;">${label}</a></p>`;

const TEMPLATES = {
  confirmation: {
    subject: "Confirm your Mindcast account",
    content: layout(
      "Welcome to Mindcast",
      `<p>Hi {{ .Email }},</p>
       <p>One more step and you're in. Confirm your email to finish setting up your account.</p>
       ${button("{{ .ConfirmationURL }}", "CONFIRM MY EMAIL")}
       <p style="color:#5F7683;font-size:13px;">If you didn't create a Mindcast account, you can ignore this email.</p>`,
    ),
  },
  magic_link: {
    subject: "Your Mindcast sign-in link",
    content: layout(
      "Your sign-in link",
      `<p>Use the link below to sign in to Mindcast. It's good for a short time, for one use only.</p>
       ${button("{{ .ConfirmationURL }}", "SIGN IN TO MINDCAST")}
       <p style="color:#5F7683;font-size:13px;">If you didn't ask to sign in, you can ignore this email — your account is safe.</p>`,
    ),
  },
  recovery: {
    subject: "Reset your Mindcast password",
    content: layout(
      "Reset your password",
      `<p>A password reset was requested for {{ .Email }}.</p>
       ${button("{{ .ConfirmationURL }}", "RESET PASSWORD")}
       <p style="color:#5F7683;font-size:13px;">If you didn't ask to reset your password, ignore this email and nothing will change.</p>`,
    ),
  },
  invite: {
    subject: "You've been invited to Mindcast",
    content: layout(
      "You've been invited",
      `<p>Someone has invited you to join Mindcast. Create your account to accept the invitation.</p>
       ${button("{{ .ConfirmationURL }}", "ACCEPT INVITATION")}
       <p style="color:#5F7683;font-size:13px;">This link is for you — please don't forward it.</p>`,
    ),
  },
  email_change: {
    subject: "Confirm your new Mindcast email",
    content: layout(
      "Confirm your new email",
      `<p>You asked to change your Mindcast account email to {{ .Email }}.</p>
       ${button("{{ .ConfirmationURL }}", "CONFIRM NEW EMAIL")}
       <p style="color:#5F7683;font-size:13px;">Use this code if asked: <strong>{{ .Token }}</strong></p>`,
    ),
  },
};

const body = {};
for (const [k, t] of Object.entries(TEMPLATES)) {
  body[`mailer_subjects_${k}`] = t.subject;
  body[`mailer_templates_${k}_content`] = t.content;
}

if (DRY_RUN) {
  console.log(`Dry run — would PATCH ${Object.keys(body).length} auth fields:`);
  Object.keys(body).forEach((k) => console.log(`  ${k}`));
  process.exit(0);
}

const r = await fetch(URI, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const j = await r.json();
if (!r.ok) {
  console.error("PATCH failed:", r.status, JSON.stringify(j).slice(0, 500));
  process.exit(1);
}
console.log(`Branded ${Object.keys(TEMPLATES).length} auth email templates (confirmation, magic link, recovery, invite, email change).`);
