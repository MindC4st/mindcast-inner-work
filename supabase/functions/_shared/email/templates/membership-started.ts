// membership-started.ts — transactional.
// Merge fields: first_name, plan_summary

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  plan_summary: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Your Mindcast membership`,
  previewText: () => `Your membership is active.`,

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
        Your membership is active
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
        Your Mindcast membership is now active. Here are the details of your plan.
      </p>

      <!-- Membership details -->
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
              Your membership
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              ${p.plan_summary}
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
        Your weekly rhythm starts with the Sunday session, where we'll explore one theme, set one intention and give you something practical to take into the week.
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
        See you Sunday at 10am, Acacia Bay Community Hall.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;