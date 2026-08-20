// session-reminder.ts — the weekly "this Sunday" email (non-transactional).
// Merge fields: weekly_theme, session_date, venue_name, venue_address,
// callback_line, intention_text, unsubscribe_url

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  weekly_theme: string;
  session_date: string;
  venue_name: string;
  venue_address: string;
  callback_line: string;
  intention_text?: string;
  unsubscribe_url: string;
}

const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export default {
  subject: (p: P) => `This Sunday: ${p.weekly_theme}`,
  previewText: () => `Bring back what happened with last week's plan.`,
  transactional: false,
  body: (p: P) => `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">${p.weekly_theme}</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">This Sunday, ${p.session_date}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;"><tr><td bgcolor="#DEE9EC" style="background:#DEE9EC;border:1px solid #C9D9DE;padding:18px 22px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">Sunday ${p.session_date} &nbsp;\u00b7&nbsp; 10am<br>${p.venue_name}, ${p.venue_address}</td></tr></table>
<div style="font-family:${D};font-size:13px;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:#102438;margin:30px 0 10px;">Bring back</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 6px;"><tr><td width="3" bgcolor="#3585AF" style="background:#3585AF;font-size:1px;line-height:1px;">&nbsp;</td><td bgcolor="#DEE9EC" style="background:#DEE9EC;padding:18px 22px;font-family:${S};font-style:italic;font-size:16px;line-height:1.6;color:#102438;">Last Sunday you wrote a plan about ${p.callback_line}.</td></tr></table>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">Bring whatever happened — including nothing. That's a real answer and it's the most common one.</p>${p.intention_text ? `<div style="height:1px;background:#DED7C6;line-height:1px;font-size:1px;margin:18px 0;">&nbsp;</div>
<div style="font-family:${D};font-size:13px;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:#102438;margin:0 0 10px;">Your intention</div>
<div style="background:#F0EBDD;border:1px solid #E5DDC8;padding:16px 20px;font-family:${S};font-style:italic;font-size:16px;line-height:1.6;color:#102438;">${p.intention_text}</div>` : ``}`,
} satisfies EmailTemplate<P>;
