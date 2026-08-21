// trial-pass.ts — transactional.
// The family free-trial pass email. Shared between the adult and teen passes;
// `track` and `requires_accompanying_adult` switch the copy.
//
// Payload: first_name, pass_code, pass_url, qr_cid, track,
//          requires_accompanying_adult, linked_adult_name
//
// No session_date: the pass is not tied to a Sunday — the session is recorded
// when the pass is used at check-in.

import type { EmailTemplate } from "../layout.ts";

interface P {
  first_name: string;
  pass_code: string;
  pass_url: string;
  qr_cid: string;
  track: "Adult" | "Teen";
  requires_accompanying_adult: boolean;
  linked_adult_name?: string | null;
}

const M =
  "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default {
  subject: () => `Your Mindcast trial pass`,
  previewText: () => `Your first Mindcast session is free — here's your pass.`,

  transactional: true,

  body: (p: P) => {
    const intro =
      p.track === "Teen"
        ? `Your first Mindcast session is free. You'll be joining the <strong style="color:#303947;">Teen room</strong>.`
        : `Your first Mindcast session is free. Come along to a Sunday that works for you.`;

    const accompaniment = p.requires_accompanying_adult
      ? `
      <!-- Accompaniment rule -->
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
          <td width="4" style="width:4px;background:#3D8DB7;font-size:1px;line-height:1px;">
            &nbsp;
          </td>
          <td style="padding:20px 22px;font-family:${M};color:#4D5560;">
            <p style="margin:0;font-size:16px;line-height:1.65;">
              You must arrive and check in with
              ${p.linked_adult_name ? `<strong style="color:#303947;">${p.linked_adult_name}</strong>,` : ""}
              the parent or guardian linked to your booking. Your pass will not work
              unless they are checked into the same session.
            </p>
          </td>
        </tr>
      </table>
      `
      : "";

    return `
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
        Your trial pass
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
        ${intro}
      </p>

      <!-- QR -->
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
            align="center"
            style="
              padding:28px 24px 24px;
              font-family:${M};
              color:#303947;
            "
          >
            <img
              src="cid:${p.qr_cid}"
              alt="Your trial pass QR code"
              width="240"
              style="display:block;width:240px;height:240px;"
            />

            <p
              style="
                margin:22px 0 10px;
                font-size:13px;
                line-height:1.5;
                font-weight:600;
                text-transform:uppercase;
                letter-spacing:.06em;
                color:#92979D;
              "
            >
              Your pass code
            </p>

            <p
              style="
                margin:0;
                font-size:28px;
                line-height:1.2;
                font-weight:600;
                letter-spacing:.08em;
                color:#303947;
              "
            >
              ${p.pass_code}
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
        Show the QR code when you arrive. If it won't scan, we can use the pass
        code underneath.
      </p>

      ${accompaniment}

      <p
        style="
          margin:0;
          font-family:${M};
          font-size:15px;
          line-height:1.65;
          color:#4D5560;
        "
      >
        <strong style="color:#303947;">Great Lake Centre</strong><br>
        5 Story Place, Taup&#333;
      </p>

    </div>
  `;
  },
} satisfies EmailTemplate<P>;
