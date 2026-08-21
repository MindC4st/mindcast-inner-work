// trial-pass.ts — transactional.
// Merge fields: first_name, pass_code, session_date

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  pass_code: string;
  session_date: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Your Mindcast trial pass`,
  previewText: () => `Your first session is free — here's your pass.`,

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
        Your trial pass
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
        Your first Mindcast session is free. Bring this pass with you on Sunday ${p.session_date}.
      </p>

      <!-- Pass code -->
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
            align="center"
            style="
              padding:24px;
              font-family:${M};
              color:#303947;
            "
          >

            <p
              style="
                margin:0 0 10px;
                font-size:13px;
                line-height:1.5;
                font-weight:600;
                text-transform:uppercase;
                letter-spacing:.06em;
                color:#92979D;
              "
            >
              Your pass code
            </p>

            <p
              style="
                margin:0;
                font-size:36px;
                line-height:1.2;
                font-weight:600;
                letter-spacing:.08em;
                color:#303947;
              "
            >
              ${p.pass_code}
            </p>

          </td>
        </tr>
      </table>

      <p
        style="
          margin:0 0 18px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        Show the code at the door when you arrive. You don't need to print this email.
      </p>

      <!-- Session details -->
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          margin:0 0 28px;
          background:#FFFFFF;
          border:1px solid #E9E5DE;
          border-radius:14px;
        "
      >
        <tr>
          <td
            style="
              padding:20px 22px;
              font-family:${M};
              color:#4D5560;
            "
          >
            <p
              style="
                margin:0 0 6px;
                font-size:13px;
                line-height:1.5;
                font-weight:600;
                text-transform:uppercase;
                letter-spacing:.06em;
                color:#92979D;
              "
            >
              Sunday ${p.session_date}
            </p>

            <p
              style="
                margin:0;
                font-size:16px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              <strong style="color:#303947;">10am</strong><br>
              Great Lake Centre<br>
              Taupō
            </p>
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
        There's nothing you need to prepare or bring. Just come along and see what the session is like.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;