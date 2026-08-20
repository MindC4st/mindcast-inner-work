// reset-password.ts — transactional. Merge: first_name, reset_url
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: () => `Reset your Mindcast password`,
  previewText: () => `A password reset was requested for your account.`,
  transactional: true,
  body: (p: { first_name: string; reset_url: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">Reset password</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">Someone requested a password reset for your Mindcast account. If that was you, tap below. If it wasn't, you can ignore this — nothing changes.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;"><tr><td bgcolor="#102438" style="background:#102438;"><a href="${p.reset_url}" style="display:inline-block;padding:13px 28px;font-family:${D};font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F8F4E8;text-decoration:none;">Reset password</a></td></tr></table>
<p style="margin:14px 0 0;font-family:${M};font-size:13px;line-height:1.65;color:#8A8574;">This link expires in 60 minutes.</p>`,
} satisfies EmailTemplate;
