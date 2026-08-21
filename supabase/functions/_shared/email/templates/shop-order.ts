// shop-order.ts — transactional.
// Merge fields: first_name, order_number, order_items, order_total

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  order_number: string;
  order_items: string;
  order_total: string;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: (p: P) => `Order ${p.order_number} confirmed`,
  previewText: () => `We've received your Mindcast order.`,

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
        Your order is confirmed
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
        Thanks for your order. We've received it and will let you know when it's ready to make its way to you.
      </p>

      <!-- Order details -->
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
              Order ${p.order_number}
            </p>

            <div
              style="
                margin:0 0 18px;
                font-size:17px;
                line-height:1.75;
                color:#4D5560;
              "
            >
              ${p.order_items}
            </div>

            <div
              style="
                height:1px;
                background:#E9E5DE;
                width:100%;
                margin:0 0 16px;
              "
            ></div>

            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
            >
              <tr>
                <td
                  style="
                    padding:0;
                    font-family:${M};
                    font-size:16px;
                    line-height:1.5;
                    color:#747B84;
                  "
                >
                  Total
                </td>

                <td
                  align="right"
                  style="
                    padding:0;
                    font-family:${M};
                    font-size:17px;
                    line-height:1.5;
                    font-weight:600;
                    color:#303947;
                  "
                >
                  ${p.order_total}
                </td>
              </tr>
            </table>

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
        If your order is being shipped, we'll send you another email as soon as it's on the way.
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
        If you've selected local pickup, we'll let you know when your order is ready. Sunday pickup is available at Acacia Bay Community Hall.
      </p>

    </div>
  `,
} satisfies EmailTemplate<P>;