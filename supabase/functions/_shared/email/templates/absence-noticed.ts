// absence-noticed.ts — sent after 2 consecutive absences (non-transactional).
// Merge fields: first_name, unsubscribe_url

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  unsubscribe_url: string;
}

const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export default {
  subject: () => `Noticed you weren't there`,
  previewText: () => `Nothing you need to do.`,
  transactional: false,
  body: (p: P) => `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">Noticed you weren't there</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">You haven't been along for a couple of Sundays, and it seemed better to say so than to say nothing.</p>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">There's nothing you need to do. Your place is still yours, you haven't fallen behind, and nobody's keeping score.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 6px;"><tr><td width="3" bgcolor="#3585AF" style="background:#3585AF;font-size:1px;line-height:1px;">&nbsp;</td><td bgcolor="#DEE9EC" style="background:#DEE9EC;padding:18px 22px;font-family:${S};font-style:italic;font-size:16px;line-height:1.6;color:#102438;">If something's changed and Mindcast isn't right for you just now, that's completely fine and you don't owe anyone an explanation.</td></tr></table>
<p style="margin:18px 0 0;font-family:${M};font-size:13px;line-height:1.65;color:#8A8574;">And if you'd just like to come back this Sunday, come back this Sunday. It picks up wherever you left it.</p>`,
} satisfies EmailTemplate<P>;
