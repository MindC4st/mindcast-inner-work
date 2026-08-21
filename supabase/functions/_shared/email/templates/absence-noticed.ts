// absence-noticed.ts — sent after 2 consecutive absences (non-transactional).
// Merge fields: first_name, unsubscribe_url

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  unsubscribe_url: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Noticed you weren't there`,
  previewText: () => `Nothing you need to do.`,

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
        Noticed you weren't there
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
        You haven't been along for a couple of Sundays, and it seemed better to say so than to say nothing.
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
        There's nothing you need to do. Your place is still yours, you haven't fallen behind, and nobody's keeping score.
      </p>

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
              font-size:16px;
              line-height:1.65;
              color:#4D5560;
            "
          >
            If something's changed and Mindcast isn't right for you just now, that's completely fine. You don't owe anyone an explanation.
          </td>
        </tr>
      </table>

      <p
        style="
          margin:0;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        And if you'd just like to come back this Sunday, come back this Sunday. We'll pick up from wherever you are.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;