// payment-failed.ts — transactional.
// Merge fields: first_name, amount, next_billing_date

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  amount: string;
  next_billing_date: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Payment issue with your Mindcast membership`,
  previewText: () => `We couldn't process your last payment.`,

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
        We couldn't process your payment
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
        We weren't able to process your Mindcast membership payment of <strong>${p.amount}</strong>.
      </p>

      <!-- Payment details -->
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
              What happens next
            </p>

            <p
              style="
                margin:0;
                font-size:17px;
                line-height:1.7;
                color:#4D5560;
              "
            >
              We'll try the payment again on <strong>${p.next_billing_date}</strong>.
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
        If your card has expired or you'd like to use a different payment method, you can update your billing details now.
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
              href="https://www.mindcast.co.nz/portal/billing"
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
              Update payment details
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
        Payment issues can happen for a number of reasons, including an expired card or a temporary decline from your bank.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;