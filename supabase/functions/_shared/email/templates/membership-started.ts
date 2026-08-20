// membership-started.ts — transactional. Merge: first_name, plan_summary
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: () => `Your Mindcast membership`,
  previewText: () => `You're in. Here's what happens next.`,
  transactional: true,
  body: (p: { first_name: string; plan_summary: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">You're in</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">Your membership is active. Here's what you're on:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;"><tr><td bgcolor="#DEE9EC" style="background:#DEE9EC;border:1px solid #C9D9DE;padding:18px 22px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">${p.plan_summary}</td></tr></table>
<p style="margin:0;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">See you Sunday. 10am, Acacia Bay Community Hall.</p>`,
} satisfies EmailTemplate;
