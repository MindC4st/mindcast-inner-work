// welcome.ts — sent on account.created (transactional).
// Merge fields: first_name

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Welcome to Mindcast`,
  previewText: () => `Your Mindcast account is ready.`,

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
        Welcome to Mindcast
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
        Your Mindcast account is set up and ready to go.
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
        Your portal is where you'll find the parts of Mindcast that belong to you — including your weekly intentions, reflections and anything saved from your sessions.
      </p>

      <!-- What Sundays look like -->
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
                margin:0 0 8px;
                font-size:13px;
                line-height:1.5;
                font-weight:600;
                text-transform:uppercase;
                letter-spacing:.06em;
                color:#92979D;
              "
            >
              What Sundays look like
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              Each Sunday we explore one theme, give you space to think about your own experience, and finish with one small intention to take into the week.
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
        You can share when you want to, write privately, listen, or pass. There's no right answer and nothing you need to perform for the room.
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
        During the week, we'll bring you back to the intention you chose so you can notice what actually happened — then we start again from there on Sunday.
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
              href="https://www.mindcast.co.nz/portal"
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
              Open your Mindcast portal
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
        There's nothing you need to prepare before your first session. Just come as you are.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;