// payment-failed.ts — transactional. Merge: first_name, amount, next_billing_date
import type { EmailTemplate } from "../layout.ts";
const D = "'Bebas Neue','Haettenschweiler','Arial Narrow',Impact,sans-serif";
const S = "'Cormorant Garamond',Georgia,'Iowan Old Style','Palatino Linotype',Palatino,serif";
const M = "'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
export default {
  subject: () => `Payment issue with your membership`,
  previewText: () => `We couldn't process your last payment.`,
  transactional: true,
  body: (p: { first_name: string; amount: string; next_billing_date: string }) =>
    `<div style="font-family:${D};font-size:38px;font-weight:400;letter-spacing:.03em;text-transform:uppercase;line-height:1.04;color:#102438;margin:16px 0 8px;">Payment issue</div>
<div style="font-family:${S};font-style:italic;font-size:16px;color:#2A4257;margin:0 0 4px;">Kia ora ${p.first_name}</div>
<p style="margin:0 0 15px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">We couldn't process your payment of ${p.amount}. This usually just means the card expired or the bank declined it.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;"><tr><td bgcolor="#DEE9EC" style="background:#DEE9EC;border:1px solid #C9D9DE;padding:18px 22px;font-family:${M};font-size:15px;line-height:1.7;color:#2A4257;">We'll try again on ${p.next_billing_date}.<br>If you'd like to update your card now, use the link below.</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;"><tr><td bgcolor="#102438" style="background:#102438;"><a href="https://www.mindcast.co.nz/portal/billing" style="display:inline-block;padding:13px 28px;font-family:${D};font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#F8F4E8;text-decoration:none;">Update payment</a></td></tr></table>`,
} satisfies EmailTemplate;
