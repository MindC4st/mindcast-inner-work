// layout.ts — the email shell. renderEmail({ template, payload }) -> { subject, html, text }
//
// The shell (masthead, footer) lives once here. Templates export
// subject, previewText, transactional, and body(payload).
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

// ─── Shell ────────────────────────────────────────────────────────────────

function head(title: string): string {
  const fonts = T.fontsLink ? `<link href="${T.fontsLink}" rel="stylesheet">` : "";
  return `<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
${fonts}
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
  return `  <tr><td style="background:${T.signalBlue};padding:26px 44px;">
    <img src="${T.wordmarkUrl}" width="150" alt="Mindcast"
         style="display:block;width:150px;max-width:150px;height:auto;">
  </td></tr>
${signalMark()}`;
}

// The signal mark — the brand's signature device, shown beneath the masthead.
// An <img> so it survives Outlook and stays pixel-identical to the site.
function signalMark(): string {
  return `  <tr><td class="pad" style="padding:18px 44px 0;">
    <img src="${T.signalMarkUrl}" width="200" alt="" aria-hidden="true"
         style="display:block;width:200px;max-width:200px;height:auto;">
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

export function renderEmail<P extends object>(template: EmailTemplate<P>, payload: P): RenderedEmail {
  const fields = payload as Payload;
  const subject = resolveMerge(template.subject(payload), fields);
  const preview = resolveMerge(template.previewText(payload), fields);
  const bodyHtml = resolveMerge(template.body(payload), fields);

  const html = `${head(subject)}
<body style="margin:0;padding:0;background:${T.pageBg};">
<div style="display:none;font-size:1px;color:${T.pageBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preview)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:${T.pageBg};">
<tr><td align="center" style="padding:34px 12px;">

<table role="presentation" class="wrap" width="${T.wrapWidth}" cellpadding="0" cellspacing="0"
       border="0" style="width:${T.wrapWidth}px;max-width:${T.wrapWidth}px;background:${T.cardBg};">

${masthead()}

  <tr><td class="pad" style="padding:30px 44px 34px;">
${bodyHtml}
  </td></tr>

${footer(template.transactional, typeof fields.unsubscribe_url === "string" ? fields.unsubscribe_url : undefined)}

</table>
</td></tr></table>
</body>
</html>`;

  const text = toPlainText(bodyHtml);
  return { subject, html, text };
}
