// layout.ts — the email shell. renderEmail({ template, payload }) -> { subject, html, text }
//
// The shell (masthead, waveform, footer) lives once here. Templates export
// subject, previewText, transactional, and body(payload). The waveform is
// built from table cells — NOT an <img> — so it renders with images disabled
// (the default in Outlook and a meaningful share of Gmail users).
//
// Port the HTML as-is. These are table-based, inline-styled, color-scheme: light only.
// Do NOT modernise into flexbox or divs — they break in Outlook.

import { T } from "./tokens.ts";

// ─── Types ────────────────────────────────────────────────────────────────

// Method syntax (not arrow-function properties) so templates with a specific
// payload type remain assignable to EmailTemplate<Record<string, unknown>> in
// the event map — payloads arrive as jsonb (Record<string, unknown>) at runtime.
export interface EmailTemplate<P = Record<string, unknown>> {
  subject(p: P): string;
  previewText(p: P): string;
  body(p: P): string;
  transactional: boolean;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

type Payload = Record<string, unknown>;

// ─── Merge-field resolver ─────────────────────────────────────────────────
// Replaces {{field}} with payload values. Throws on unresolved fields — a
// never-sent email beats one addressed to {{first_name}}.

function resolveMerge(text: string, p: Payload): string {
  const missing: string[] = [];
  const resolved = text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (key in p && p[key] !== undefined && p[key] !== null) {
      return escapeHtml(String(p[key]));
    }
    missing.push(key);
    return `{{${key}}}`;
  });
  if (missing.length) {
    throw new Error(`Unresolved merge field(s): ${missing.join(", ")}`);
  }
  return resolved;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Waveform (signal bar) ────────────────────────────────────────────────
// 18 table-cell segments with varying heights. Renders with images disabled.

const WAVE_HEIGHTS = [22, 26, 30, 26, 22, 28, 24, 20, 26, 22, 18, 24, 28, 22, 30, 26, 20, 24];

function waveform(): string {
  const cells = WAVE_HEIGHTS.map(
    (h) =>
      `<td width="3" valign="middle" style="padding:0 2px;height:32px;">` +
      `<div style="height:${h}px;background:${T.signalBlue};border-radius:2px;line-height:${h}px;font-size:1px;">&nbsp;</div>` +
      `</td>`,
  ).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="height:32px;"><tr>${cells}</tr></table>`;
}

// ─── Shell ────────────────────────────────────────────────────────────────

function head(title: string): string {
  return `<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<link href="${T.fontsLink}" rel="stylesheet">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme:light only; supported-color-schemes:light only; }
  body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table,td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad,.hd { padding-left:26px !important; padding-right:26px !important; }
  }
</style>
</head>`;
}

function masthead(): string {
  return `  <tr><td class="hd" style="padding:34px 44px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="left" valign="middle">
        <img src="${T.wordmarkUrl}" width="150" alt="Mindcast"
             style="display:block;width:150px;max-width:150px;height:auto;">
      </td>
      <td align="right" valign="middle" style="white-space:nowrap;">
        <span style="display:inline-block;background:${T.navy};color:${T.cardBg};font-family:${T.display};font-size:12px;font-weight:400;letter-spacing:.14em;text-transform:uppercase;padding:4px 9px;margin-left:4px;">Member</span>
      </td>
    </tr></table>
  </td></tr>`;
}

function footer(transactional: boolean, unsubscribeUrl?: string): string {
  const unsub = transactional || !unsubscribeUrl
    ? ""
    : `<div style="font-family:${T.sans};font-size:11px;color:${T.muted};padding-top:10px;">
       <a href="https://www.mindcast.co.nz/privacy" style="color:${T.muted};text-decoration:underline;">Privacy</a>
       &nbsp;·&nbsp;
       <a href="${escapeHtml(unsubscribeUrl)}" style="color:${T.muted};text-decoration:underline;">Unsubscribe</a>
     </div>`;
  return `  <tr><td class="pad" style="padding:0 44px 34px;">
    <div style="height:1px;background:${T.divider};line-height:1px;font-size:1px;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-top:14px;"><tr>
      <td align="left" style="font-family:${T.sans};font-size:10px;color:${T.muted};">
        mindcast.co.nz</td>
      <td align="right" style="font-family:${T.sans};font-size:10px;font-weight:700;
          letter-spacing:.16em;text-transform:uppercase;color:${T.navy};">
        Notice It. Name It. Do It.</td>
    </tr></table>
    <div style="font-family:${T.sans};font-size:11px;line-height:1.7;color:${T.muted};padding-top:16px;">
      Mindcast Limited &nbsp;·&nbsp; Taup&#333;, Aotearoa New Zealand<br>
      Reply to this email and a person will read it.
    </div>
    ${unsub}
  </td></tr>`;
}

// ─── Plain-text alternative ──────────────────────────────────────────────

function toPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#333;/g, "ō")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── renderEmail ──────────────────────────────────────────────────────────

export function renderEmail(template: EmailTemplate, payload: Payload): RenderedEmail {
  const subject = resolveMerge(template.subject(payload), payload);
  const preview = resolveMerge(template.previewText(payload), payload);
  const bodyHtml = resolveMerge(template.body(payload), payload);

  const html = `${head(subject)}
<body style="margin:0;padding:0;background:${T.pageBg};">
<div style="display:none;font-size:1px;color:${T.pageBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preview)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:${T.pageBg};">
<tr><td align="center" style="padding:34px 12px;">

<table role="presentation" class="wrap" width="${T.wrapWidth}" cellpadding="0" cellspacing="0"
       border="0" style="width:${T.wrapWidth}px;max-width:${T.wrapWidth}px;background:${T.cardBg};">

${masthead()}

  <tr><td class="hd" style="padding:26px 44px 0;">${waveform()}</td></tr>

  <tr><td class="pad" style="padding:4px 44px 34px;">
${bodyHtml}
  </td></tr>

${footer(template.transactional, typeof payload.unsubscribe_url === "string" ? payload.unsubscribe_url : undefined)}

</table>
</td></tr></table>
</body>
</html>`;

  const text = toPlainText(bodyHtml);
  return { subject, html, text };
}
