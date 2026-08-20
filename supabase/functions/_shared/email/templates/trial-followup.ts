// trial-followup.ts — non-transactional. Merge: first_name, unsubscribe_url
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: () => `How was it?`,
  previewText: () => `One question — no pressure.`,
  transactional: false,
  body: (p: { first_name: string; unsubscribe_url: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">How was it?</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">You came along to a trial session. We'd love to know how it went — one question, no pressure.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 6px;"><tr><td width="3" bgcolor="#3585AF" style="background:#3585AF;font-size:1px;line-height:1px;">&nbsp;</td><td bgcolor="#DEE9EC" style="background:#DEE9EC;padding:18px 22px;font-family:${S};font-style:italic;font-size:16px;line-height:1.6;color:#102438;">Did the session give you something you could actually use this week?</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;"><tr><td bgcolor="#102438" style="background:#102438;"><a href="https://www.mindcast.co.nz/membership" style="display:inline-block;padding:13px 28px;font-family:${D};font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F8F4E8;text-decoration:none;">Join Mindcast</a></td></tr></table>`,
} satisfies EmailTemplate;
