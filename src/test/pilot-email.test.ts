import { describe, expect, it } from "vitest";

import { renderEmail } from "../../supabase/functions/_shared/email/layout.ts";
import { mindcastFrom } from "../../supabase/functions/_shared/email/sender.ts";
import {
  pilotAdminTemplate,
  pilotApplicantTemplate,
} from "../../supabase/functions/_shared/email/templates/pilot-application.ts";

describe("pilot application emails", () => {
  it("uses the shared Mindcast shell and safely escapes applicant answers", () => {
    const rendered = renderEmail(pilotApplicantTemplate, {
      first_name: "Aroha <Test>",
      q1: "I would build <script>alert('no')</script> a welcoming community.",
      q2: "I changed careers and found work that feels meaningful.",
      q3: "I learned that I could lead a room with confidence.",
      anything_else: "Please call after 5 & leave a message.",
    });

    expect(rendered.subject).toBe("Your Mindcast pilot group application");
    expect(rendered.html).toContain("Wordmark-White-Transparent.png");
    expect(rendered.html).not.toContain("logo-cream.png");
    expect(rendered.html).not.toContain('<link href=""');
    expect(rendered.html).toContain("Aroha &lt;Test&gt;");
    expect(rendered.html).toContain("&lt;script&gt;alert('no')&lt;/script&gt;");
    expect(rendered.html).not.toContain("<script>alert");
    expect(rendered.html).toContain("Please call after 5 &amp; leave a message.");
  });

  it("renders the internal application summary and admin action", () => {
    const rendered = renderEmail(pilotAdminTemplate, {
      first_name: "Test",
      last_name: "Person",
      age: 38,
      email: "test@example.com",
      phone: "+64270000000",
      gender: "Undisclosed",
      submitted_at: "22/08/2026, 3:45 pm",
      q1: "A complete first response.",
      q2: "A complete second response.",
      q3: "A complete third response.",
      anything_else: "—",
    });

    expect(rendered.subject).toBe("New pilot application — Test Person, 38");
    expect(rendered.html).toContain("Open applications in admin");
    expect(rendered.html).toContain("https://www.mindcast.co.nz/admin?tab=applications");
    expect(rendered.text).toContain("Test Person");
    expect(rendered.text).toContain("test@example.com");
  });
});

describe("Mindcast From header", () => {
  it("keeps the configured mailbox and replaces an old display name", () => {
    expect(mindcastFrom("Mindcast <applications@mindcast.co.nz>")).toBe(
      "M🎙️N D C A S T <applications@mindcast.co.nz>",
    );
  });

  it("uses the hello mailbox when the setting is missing or malformed", () => {
    expect(mindcastFrom()).toBe("M🎙️N D C A S T <hello@mindcast.co.nz>");
    expect(mindcastFrom("not an email")).toBe("M🎙️N D C A S T <hello@mindcast.co.nz>");
  });
});
