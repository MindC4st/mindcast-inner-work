// Self-contained branded trial-pass email renderer.
//
// Duplicated from _shared/email (layout.ts + tokens.ts + templates/trial-pass.ts)
// because `supabase functions deploy` does not reliably bundle the nested
// _shared/email/** tree — it only picked up top-level _shared/*.ts, so the
// live function kept serving the old bundle. Keeping the renderer inside this
// folder (the same pattern as commerce-email.ts) guarantees it deploys.
//
// Palette matches _shared/email/tokens.ts exactly. No session_date — the pass
// is not tied to a Sunday; the session is recorded at check-in.

const M = "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const PAGE_BG = "#F8F5EF";
const CARD_BG = "#FFFFFF";
const BLUE = "#3D8DB7";
const NAVY = "#303947";
const BODY = "#4D5560";
const MUTED_DARK = "#747B84";
const MUTED = "#92979D";
const DIVIDER = "#E9E5DE";
const WORDMARK_URL =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/Wordmark-White-Transparent.png";

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const masthead = () => `
  <tr><td style="background:${BLUE};padding:26px 44px;">
    <img src="${WORDMARK_URL}" width="150" alt="Mindcast"
         style="display:block;width:150px;max-width:150px;height:auto;">
  </td></tr>`;

const footer = () => `
  <tr><td style="padding:0 44px 34px;">
    <div style="height:1px;background:${DIVIDER};line-height:1px;font-size:1px;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin-top:14px;"><tr>
      <td align="left" style="font-family:${M};font-size:10px;color:${MUTED};">
        mindcast.co.nz</td>
      <td align="right" style="font-family:${M};font-size:10px;font-weight:700;
          letter-spacing:.16em;text-transform:uppercase;color:${NAVY};">
        Notice It. Name It. Do It.</td>
    </tr></table>
    <div style="font-family:${M};font-size:11px;line-height:1.7;color:${MUTED};padding-top:16px;">
      Mindcast Limited &nbsp;·&nbsp; Taup&#333;, Aotearoa New Zealand<br>
      Reply to this email and a person will read it.
    </div>
  </td></tr>`;

export interface TrialPassEmail {
  first_name: string;
  pass_code: string;
  pass_url: string;
  qr_cid: string;
  track: "Adult" | "Teen";
  requires_accompanying_adult: boolean;
  linked_adult_name?: string | null;
}

export function renderTrialPass(p: TrialPassEmail): { subject: string; html: string } {
  const subject = "Your Mindcast trial pass";

  const intro =
    p.track === "Teen"
      ? `Your first Mindcast session is free. You'll be joining the <strong style="color:${NAVY};">Teen room</strong>.`
      : `Your first Mindcast session is free. Come along to a Sunday that works for you.`;

  const accompaniment = p.requires_accompanying_adult
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin:0 0 28px;background:${PAGE_BG};border-radius:14px;overflow:hidden;">
        <tr>
          <td width="4" style="width:4px;background:${BLUE};font-size:1px;line-height:1px;">&nbsp;</td>
          <td style="padding:20px 22px;font-family:${M};color:${BODY};">
            <p style="margin:0;font-size:16px;line-height:1.65;">
              You must arrive and check in with
              ${p.linked_adult_name ? `<strong style="color:${NAVY};">${escapeHtml(p.linked_adult_name)}</strong>,` : ""}
              the parent or guardian linked to your booking. Your pass will not work
              unless they are checked into the same session.
            </p>
          </td>
        </tr>
      </table>
      `
    : "";

  const body = `
    <div style="font-family:${M};color:${NAVY};">
      <h1 style="margin:0 0 18px;font-family:${M};font-size:28px;line-height:1.25;font-weight:600;color:${NAVY};">
        Your trial pass
      </h1>

      <p style="margin:0 0 18px;font-family:${M};font-size:17px;line-height:1.65;color:${BODY};">
        Kia ora ${escapeHtml(p.first_name)},
      </p>

      <p style="margin:0 0 26px;font-family:${M};font-size:17px;line-height:1.65;color:${BODY};">
        ${intro}
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin:0 0 28px;background:${PAGE_BG};border-radius:14px;overflow:hidden;">
        <tr>
          <td align="center" style="padding:28px 24px 24px;font-family:${M};color:${NAVY};">
            <img src="cid:${p.qr_cid}" alt="Your trial pass QR code" width="240"
                 style="display:block;width:240px;height:240px;" />

            <p style="margin:22px 0 10px;font-size:13px;line-height:1.5;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${MUTED};">
              Your pass code
            </p>

            <p style="margin:0;font-size:28px;line-height:1.2;font-weight:600;letter-spacing:.08em;color:${NAVY};">
              ${escapeHtml(p.pass_code)}
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 18px;font-family:${M};font-size:17px;line-height:1.65;color:${BODY};">
        Show the QR code when you arrive. If it won't scan, we can use the pass
        code underneath.
      </p>

      ${accompaniment}

      <p style="margin:0;font-family:${M};font-size:15px;line-height:1.65;color:${BODY};">
        <strong style="color:${NAVY};">Great Lake Centre</strong><br>
        5 Story Place, Taup&#333;
      </p>
    </div>
  `;

  const html = `<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE_BG};">
<tr><td align="center" style="padding:34px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
       style="width:600px;max-width:600px;background:${CARD_BG};border-radius:14px;overflow:hidden;">
${masthead()}
  <tr><td style="padding:30px 44px 34px;">
${body}
  </td></tr>
${footer()}
</table>
</td></tr></table>
</body>
</html>`;

  return { subject, html };
}
