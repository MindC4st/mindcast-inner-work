// seat-invite.ts — transactional.
// Merge fields: first_name, inviter_name

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  inviter_name: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: (p: P) => `${p.inviter_name} invited you to Mindcast`,
  previewText: () => `Your first session is free.`,

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
        You've been invited to Mindcast
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
          margin:0 0 18px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        ${p.inviter_name} invited you to come along to Mindcast.
      </p>

      <p
        style="
          margin:0 0 28px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        It's a weekly in-person gathering built around one theme, some good questions and one small intention to take into the week.
      </p>

      <!-- First session -->
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
              padding:22px 24px;
              font-family:${M};
              color:#303947;
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
              Your first session
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              Your first session is free. Come along, see what the room is like and decide for yourself whether it's useful to you.
            </p>
          </td>
        </tr>
      </table>

      <p
        style="
          margin:0 0 28px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        There's no obligation to join afterwards and no need to prepare anything before you come.
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
              href="https://www.mindcast.co.nz/try"
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
              View your first session
            </a>
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
        If you'd rather not come, there's nothing you need to do.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;