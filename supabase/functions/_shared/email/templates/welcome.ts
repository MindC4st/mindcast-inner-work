// welcome.ts — sent on account.created (transactional).
// Merge fields: first_name

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
}

const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export default {
  subject: () => `Welcome to Mindcast`,
  previewText: () => `What happens now, and what doesn't.`,
  transactional: true,
  body: (p: P) => `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">You're set up</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">That's your account sorted. You'll get one email a week — what's on this Sunday, the time and the address. Nothing else.</p>
<div style="font-family:${D};font-size:13px;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:#102438;margin:30px 0 10px;">What Sundays look like</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 6px;"><tr><td width="3" bgcolor="#3585AF" style="background:#3585AF;font-size:1px;line-height:1px;">&nbsp;</td><td bgcolor="#DEE9EC" style="background:#DEE9EC;padding:18px 22px;font-family:${S};font-style:italic;font-size:16px;line-height:1.6;color:#102438;">You arrive, you sit down, you listen. Nobody makes you talk. You leave with one thing you've decided to do this week &mdash; and next Sunday somebody asks how it went.</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;"><tr><td bgcolor="#102438" style="background:#102438;"><a href="https://www.mindcast.co.nz/portal" style="display:inline-block;padding:13px 28px;font-family:${D};font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F8F4E8;text-decoration:none;">Open your portal</a></td></tr></table>`,
} satisfies EmailTemplate<P>;
