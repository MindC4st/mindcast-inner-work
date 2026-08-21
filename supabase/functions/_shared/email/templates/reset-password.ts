// reset-password.ts — transactional.
// Merge fields: first_name, reset_url

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  reset_url: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Reset your Mindcast password`,
  previewText: () => `A password reset was requested for your account.`,

  transactional: true,

  body: (p: P) => `
    <div
      style="
        font-family:${M};
        color:#303947;
      "
    >

      <h1
        style="
          margin:0 0 18px;
          font-family:${M};
          font-size:28px;
          line-height:1.25;
          font-weight:600;
          color:#303947;
        "
      >
        Reset your password
      </h1>

      <p
        style="
          margin:0 0 18px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        Kia ora ${p.first_name},
      </p>

      <p
        style="
          margin:0 0 26px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        We received a request to reset the password for your Mindcast account.
      </p>

      <p
        style="
          margin:0 0 30px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        If that was you, use the button below to choose a new password.
      </p>

      <!-- CTA -->
      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="margin:0 0 30px;"
      >
        <tr>
          <td
            align="center"
            style="
              background:#3D8DB7;
              border-radius:999px;
            "
          >
            <a
              href="${p.reset_url}"
              style="
                display:inline-block;
                padding:15px 30px;
                font-family:${M};
                font-size:16px;
                line-height:1;
                font-weight:600;
                color:#FFFFFF;
                text-decoration:none;
              "
            >
              Reset my password
            </a>
          </td>
        </tr>
      </table>

      <p
        style="
          margin:0 0 8px;
          font-family:${M};
          font-size:14px;
          line-height:1.6;
          color:#747B84;
        "
      >
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <p
        style="
          margin:0 0 26px;
          font-family:${M};
          font-size:13px;
          line-height:1.6;
          word-break:break-all;
        "
      >
        <a
          href="${p.reset_url}"
          style="
            color:#3D8DB7;
            text-decoration:underline;
          "
        >
          ${p.reset_url}
        </a>
      </p>

      <!-- Security note -->
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          margin:0 0 28px;
          background:#F8F5EF;
          border-radius:14px;
          overflow:hidden;
        "
      >
        <tr>
          <td
            width="4"
            style="
              width:4px;
              background:#3D8DB7;
              font-size:1px;
              line-height:1px;
            "
          >
            &nbsp;
          </td>

          <td
            style="
              padding:20px 22px;
              font-family:${M};
              font-size:14px;
              line-height:1.65;
              color:#747B84;
            "
          >
            This reset link expires in 60 minutes.
          </td>
        </tr>
      </table>

      <p
        style="
          margin:0;
          font-family:${M};
          font-size:14px;
          line-height:1.65;
          color:#747B84;
        "
      >
        If you didn't request a password reset, you can safely ignore this email. Your existing password will stay the same.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;