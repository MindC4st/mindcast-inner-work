// lifegroup-assigned.ts — transactional.
// Merge fields: first_name, group_night, group_area, start_week

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  group_night: string;
  group_area: string;
  start_week: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Your Mindcast life group`,
  previewText: () => `Your midweek life group details.`,

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
        Your life group
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
        You've been placed in a midweek life group. Here are the details.
      </p>

      <!-- Group details -->
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
              Your group
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.8;
                color:#4D5560;
              "
            >
              <strong style="color:#303947;">${p.group_night} evenings</strong><br>
              ${p.group_area}<br>
              Starting the week of ${p.start_week}
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
        Life groups are the midweek part of the Mindcast rhythm — a smaller space to come back to what you noticed on Sunday, talk it through and keep practising during the week.
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
        There's nothing you need to prepare. Just come as you are.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;