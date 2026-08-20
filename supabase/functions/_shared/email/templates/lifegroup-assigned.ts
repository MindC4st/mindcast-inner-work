// lifegroup-assigned.ts — transactional. Merge: first_name, group_night, group_area, start_week
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: () => `Your life group`,
  previewText: () => `You've been placed in a midweek group.`,
  transactional: true,
  body: (p: { first_name: string; group_night: string; group_area: string; start_week: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">Your life group</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">You've been placed in a midweek group. Here are the details:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;"><tr><td bgcolor="#DEE9EC" style="background:#DEE9EC;border:1px solid #C9D9DE;padding:18px 22px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">${p.group_night} evenings<br>${p.group_area}<br>Starting the week of ${p.start_week}</td></tr></table>
<p style="margin:0;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">Life groups are where the Sunday conversation goes deeper — same people, same thread, every week.</p>`,
} satisfies EmailTemplate;
