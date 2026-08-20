// practice-reminder.ts — non-transactional. Merge: first_name, intention_text, unsubscribe_url
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: () => `Your midweek practice`,
  previewText: () => `One thing from Sunday — how's it going?`,
  transactional: false,
  body: (p: { first_name: string; intention_text: string; unsubscribe_url: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">Midweek check-in</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">On Sunday you set an intention. Here it is, in your own words:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 6px;"><tr><td width="3" bgcolor="#3585AF" style="background:#3585AF;font-size:1px;line-height:1px;">&nbsp;</td><td bgcolor="#DEE9EC" style="background:#DEE9EC;padding:18px 22px;font-family:${S};font-style:italic;font-size:16px;line-height:1.6;color:#102438;">${p.intention_text}</td></tr></table>
<p style="margin:0;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">No need to have done it perfectly. Just notice whether you did, and come back Sunday.</p>`,
} satisfies EmailTemplate;
