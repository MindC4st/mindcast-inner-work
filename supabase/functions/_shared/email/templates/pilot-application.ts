// pilot-application.ts — applicant confirmation and internal review copy.

import type { EmailTemplate } from "../layout.ts";
import { T } from "../tokens.ts";

export interface PilotApplicantPayload {
  first_name: string;
  q1: string;
  q2: string;
  q3: string;
  anything_else: string;
}

export interface PilotAdminPayload extends PilotApplicantPayload {
  last_name: string;
  age: number;
  email: string;
  phone: string;
  gender: string;
  submitted_at: string;
}

const questionBlock = (
  number: string,
  question: string,
  answerField: string,
) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:0 0 14px;border:1px solid ${T.divider};border-radius:12px;">
    <tr>
      <td valign="top" width="42" style="width:42px;padding:18px 0 0 18px;">
        <div style="width:28px;height:28px;line-height:28px;border-radius:14px;background:${T.signalBlue};
                    font-family:${T.sans};font-size:12px;font-weight:700;text-align:center;color:${T.white};">
          ${number}
        </div>
      </td>
      <td style="padding:17px 18px 18px 12px;font-family:${T.sans};">
        <p style="margin:0 0 9px;font-size:14px;line-height:1.55;font-weight:700;color:${T.text};">
          ${question}
        </p>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${T.bodyText};white-space:pre-wrap;">
          {{${answerField}}}
        </p>
      </td>
    </tr>
  </table>`;

const responses = () => `
  ${questionBlock(
    "01",
    "If money were no barrier, what would you actually be doing with your life?",
    "q1",
  )}
  ${questionBlock(
    "02",
    "What would the version of you from ten years ago be most surprised to hear about your life now?",
    "q2",
  )}
  ${questionBlock(
    "03",
    "Tell us about something you once believed you weren’t the kind of person who could do — until you did it.",
    "q3",
  )}
  ${questionBlock("+", "Anything else you’d like Ash to know?", "anything_else")}`;

export const pilotApplicantTemplate = {
  subject: () => "Your Mindcast pilot group application",
  previewText: () => "Your application is safely with us — here’s your copy and what happens next.",
  transactional: true,

  body: (_p: PilotApplicantPayload) => `
    <div style="font-family:${T.sans};color:${T.text};">
      <p style="margin:0 0 10px;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:.14em;
                text-transform:uppercase;color:${T.signalBlue};">
        Pilot group application
      </p>
      <h1 style="margin:0 0 18px;font-family:${T.sans};font-size:30px;line-height:1.2;
                 font-weight:600;color:${T.text};">
        Thanks for applying, {{first_name}}.
      </h1>
      <p style="margin:0 0 24px;font-family:${T.sans};font-size:17px;line-height:1.65;color:${T.bodyText};">
        Your application is safely with us. Below is a copy of exactly what you sent.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin:0 0 28px;background:${T.softPanel};border-radius:14px;">
        <tr>
          <td width="4" style="width:4px;background:${T.signalBlue};font-size:1px;line-height:1px;">&nbsp;</td>
          <td style="padding:20px 22px;font-family:${T.sans};">
            <p style="margin:0 0 6px;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:.1em;
                      text-transform:uppercase;color:${T.mutedDark};">
              What happens next
            </p>
            <p style="margin:0;font-size:15px;line-height:1.65;color:${T.bodyText};">
              Applications close at 9am on Tuesday 29 September. Ashleigh reads every application
              herself and will contact you personally before then, either way.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 14px;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:.1em;
                text-transform:uppercase;color:${T.mutedDark};">
        Your responses
      </p>
      ${responses()}

      <p style="margin:24px 0 0;font-size:14px;line-height:1.65;color:${T.mutedDark};">
        You can reply directly to this email if there’s anything you need to add.
      </p>
    </div>
  `,
} satisfies EmailTemplate<PilotApplicantPayload>;

export const pilotAdminTemplate = {
  subject: () => "New pilot application — {{first_name}} {{last_name}}, {{age}}",
  previewText: () => "New application from {{first_name}} {{last_name}}, age {{age}}.",
  transactional: true,

  body: (_p: PilotAdminPayload) => `
    <div style="font-family:${T.sans};color:${T.text};">
      <p style="margin:0 0 10px;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:.14em;
                text-transform:uppercase;color:${T.signalBlue};">
        Pilot group · New response
      </p>
      <h1 style="margin:0 0 22px;font-family:${T.sans};font-size:30px;line-height:1.2;
                 font-weight:600;color:${T.text};">
        {{first_name}} {{last_name}}
      </h1>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="margin:0 0 28px;background:${T.softPanel};border-radius:14px;">
        <tr><td style="padding:20px 22px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:0 12px 10px 0;font-family:${T.sans};font-size:12px;font-weight:700;
                         letter-spacing:.08em;text-transform:uppercase;color:${T.mutedDark};">Age at 13 Oct 2026</td>
              <td align="right" style="padding:0 0 10px;font-family:${T.sans};font-size:15px;color:${T.text};">{{age}}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px 10px 0;border-top:1px solid ${T.divider};font-family:${T.sans};
                         font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${T.mutedDark};">Email</td>
              <td align="right" style="padding:10px 0;border-top:1px solid ${T.divider};font-family:${T.sans};
                         font-size:14px;color:${T.text};word-break:break-all;">{{email}}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px 10px 0;border-top:1px solid ${T.divider};font-family:${T.sans};
                         font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${T.mutedDark};">Phone</td>
              <td align="right" style="padding:10px 0;border-top:1px solid ${T.divider};font-family:${T.sans};font-size:14px;color:${T.text};">{{phone}}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px 10px 0;border-top:1px solid ${T.divider};font-family:${T.sans};
                         font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${T.mutedDark};">Gender</td>
              <td align="right" style="padding:10px 0;border-top:1px solid ${T.divider};font-family:${T.sans};font-size:14px;color:${T.text};">{{gender}}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px 0 0;border-top:1px solid ${T.divider};font-family:${T.sans};
                         font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${T.mutedDark};">Submitted</td>
              <td align="right" style="padding:10px 0 0;border-top:1px solid ${T.divider};font-family:${T.sans};font-size:14px;color:${T.text};">{{submitted_at}}</td>
            </tr>
          </table>
        </td></tr>
      </table>

      <p style="margin:0 0 14px;font-size:12px;line-height:1.5;font-weight:700;letter-spacing:.1em;
                text-transform:uppercase;color:${T.mutedDark};">
        Application responses
      </p>
      ${responses()}

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
        <tr><td align="center" style="background:${T.signalBlue};border-radius:999px;">
          <a href="https://www.mindcast.co.nz/admin?tab=applications"
             style="display:inline-block;padding:14px 24px;font-family:${T.sans};font-size:15px;
                    line-height:1;font-weight:700;color:${T.white};text-decoration:none;">
            Open applications in admin
          </a>
        </td></tr>
      </table>
    </div>
  `,
} satisfies EmailTemplate<PilotAdminPayload>;
