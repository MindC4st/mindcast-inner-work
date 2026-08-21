// trial-followup.ts — non-transactional.
// Merge fields: first_name, unsubscribe_url

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  unsubscribe_url: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `How was your first Mindcast session?`,
  previewText: () => `One question. No pressure.`,

  transactional: false,

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
        How was it?
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
        Thanks for coming along to your first Mindcast session. We hope it gave you a useful sense of what the room is about.
      </p>

      <!-- Reflection -->
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
              One question
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              Did the session give you something you could actually use this week?
            </p>

          </td>
        </tr>
      </table>

      <p
        style="
          margin:0 0 26px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        If you'd like to keep coming, you can have a look at the membership options below. If not, that's completely fine too.
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
              href="https://www.mindcast.co.nz/membership"
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
              View membership options
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
        There's no follow-up call and nothing you need to decide today.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;