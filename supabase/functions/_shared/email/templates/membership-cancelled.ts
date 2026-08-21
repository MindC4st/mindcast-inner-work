// membership-cancelled.ts — transactional.
// Merge fields: first_name

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Your Mindcast membership`,
  previewText: () => `Your membership has been cancelled.`,

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
        Your membership has been cancelled
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
          margin:0 0 28px;
          font-family:${M};
          font-size:17px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        Your Mindcast membership has been cancelled. There are no further membership charges to pay.
      </p>

      <!-- Confirmation -->
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
            If you want to return another time, you're welcome to. There is nothing to catch up on and no explanation needed.
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
        Anything you took from your time with Mindcast is still yours to use in whatever way is useful to you.
      </p>

      <p
        style="
          margin:0;
          font-family:${M};
          font-size:14px;
          line-height:1.65;
          color:#747B84;
        "
      >
        You may still receive essential account emails, such as password resets or other security messages, if needed.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;