// trial-pass.ts — transactional. Merge: first_name, pass_code, session_date
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: (p: { first_name: string; pass_code: string; session_date: string }) => `Your Mindcast trial pass`,
  previewText: () => `Your first session is on us — here's your pass.`,
  transactional: true,
  body: (p: { first_name: string; pass_code: string; session_date: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">Your trial pass</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">Your first session is on us. Show this code at the door on Sunday ${p.session_date}.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;"><tr><td bgcolor="#DEE9EC" style="background:#DEE9EC;border:1px solid #C9D9DE;padding:24px;text-align:center;font-family:${D};font-size:42px;font-weight:400;letter-spacing:.08em;color:#102438;">${p.pass_code}</td></tr></table>
<p style="margin:0;font-family:${M};font-size:13px;line-height:1.65;color:#8A8574;">Acacia Bay Community Hall, Taupō. 10am Sunday. No need to bring anything.</p>`,
} satisfies EmailTemplate;
