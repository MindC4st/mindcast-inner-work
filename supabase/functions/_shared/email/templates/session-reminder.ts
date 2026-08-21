// session-reminder.ts — the weekly "this Sunday" email (non-transactional).
// Merge fields: first_name, weekly_theme, session_date, venue_name, venue_address,
// callback_line, intention_text, unsubscribe_url

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  weekly_theme: string;
  session_date: string;
  venue_name: string;
  venue_address: string;
  callback_line: string;
  intention_text?: string;
  unsubscribe_url: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: (p: P) => `This Sunday: ${p.weekly_theme}`,
  previewText: () => `Bring back whatever happened with the intention you set last Sunday.`,

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
        ${p.weekly_theme}
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
        We're back together this Sunday. Here's what you need to know before you come.
      </p>

      <!-- Session details -->
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          margin:0 0 32px;
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
                margin:0 0 8px;
                font-size:13px;
                line-height:1.5;
                font-weight:600;
                text-transform:uppercase;
                letter-spacing:.06em;
                color:#92979D;
              "
            >
              This Sunday
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.75;
                color:#4D5560;
              "
            >
              <strong style="color:#303947;">
                ${p.session_date} · 10am
              </strong><br>
              ${p.venue_name}<br>
              ${p.venue_address}
            </p>
          </td>
        </tr>
      </table>

      <!-- Bring back -->
      <p
        style="
          margin:0 0 10px;
          font-family:${M};
          font-size:13px;
          line-height:1.5;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:.06em;
          color:#92979D;
        "
      >
        Bring back
      </p>

      <p
        style="
          margin:0 0 24px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        Last Sunday, you set a small intention around ${p.callback_line}.
      </p>

      ${
        p.intention_text
          ? `
      <!-- Saved intention -->
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
              Your intention
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              ${p.intention_text}
            </p>
          </td>
        </tr>
      </table>
      `
          : ``
      }

      <p
        style="
          margin:0 0 18px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        Bring back whatever happened with it — including if you didn't notice it, forgot about it, or nothing changed.
      </p>

      <p
        style="
          margin:0;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        There's nothing to catch up on and nothing you need to get right before Sunday. We start from what actually happened.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;