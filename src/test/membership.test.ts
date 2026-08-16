import { describe, it, expect } from "vitest";
import { describeMembership, formatRenewalDate } from "@/lib/membership";

// The door-check contract. `admit` decides whether staff wave someone through,
// so these assertions are about real-world behaviour, not copy.

describe("describeMembership", () => {
  it("admits an active member and shows the renewal date", () => {
    const v = describeMembership("active", { currentPeriodEnd: "2026-09-14T00:00:00Z" });
    expect(v.label).toBe("ACTIVE");
    expect(v.tone).toBe("active");
    expect(v.admit).toBe(true);
    expect(v.action).toBe("none");
    expect(v.helper).toContain("14 Sep 2026");
  });

  it("still admits an active member when no renewal date is on file", () => {
    const v = describeMembership("active");
    expect(v.admit).toBe(true);
    expect(v.helper).toBe("Membership active.");
  });

  it("flags an active membership that is set to cancel", () => {
    const v = describeMembership("active", {
      currentPeriodEnd: "2026-09-14T00:00:00Z",
      cancelAtPeriodEnd: true,
    });
    expect(v.admit).toBe(true);
    expect(v.action).toBe("resume");
    expect(v.helper).toContain("won't renew");
  });

  it("admits a trial", () => {
    const v = describeMembership("trialing", { currentPeriodEnd: "2026-09-14T00:00:00Z" });
    expect(v.label).toBe("TRIAL");
    expect(v.admit).toBe(true);
  });

  it("admits past_due but warns, and offers the billing portal", () => {
    const v = describeMembership("past_due");
    expect(v.tone).toBe("warning");
    expect(v.admit).toBe(true);
    expect(v.action).toBe("update_card");
  });

  it("stops a lapsed member and offers renewal", () => {
    const v = describeMembership("lapsed");
    expect(v.label).toBe("LAPSED");
    expect(v.tone).toBe("blocked");
    expect(v.admit).toBe(false);
    expect(v.action).toBe("renew");
  });

  it("stops a paused membership", () => {
    const v = describeMembership("paused");
    expect(v.tone).toBe("paused");
    expect(v.admit).toBe(false);
    expect(v.action).toBe("resume");
  });

  it("fails closed for 'none', null, empty and unrecognised statuses", () => {
    for (const status of ["none", null, undefined, "", "  ", "wat", "ACTIVE_ISH"]) {
      const v = describeMembership(status as string | null | undefined);
      expect(v.admit, `status=${String(status)}`).toBe(false);
      expect(v.tone, `status=${String(status)}`).toBe("blocked");
    }
  });

  it("is case- and whitespace-insensitive on the stored status", () => {
    expect(describeMembership("  Active  ").admit).toBe(true);
    expect(describeMembership("PAST_DUE").action).toBe("update_card");
  });

  it("always gives an action a label when it has an action", () => {
    for (const status of ["active", "trialing", "past_due", "lapsed", "paused", "none"]) {
      const v = describeMembership(status);
      if (v.action !== "none") expect(v.actionLabel.length, status).toBeGreaterThan(0);
    }
  });
});

describe("formatRenewalDate", () => {
  it("formats an ISO date", () => {
    expect(formatRenewalDate("2026-09-14T00:00:00Z")).toBe("14 Sep 2026");
  });

  it("returns null for missing or unparseable input", () => {
    expect(formatRenewalDate(null)).toBeNull();
    expect(formatRenewalDate(undefined)).toBeNull();
    expect(formatRenewalDate("")).toBeNull();
    expect(formatRenewalDate("not-a-date")).toBeNull();
  });
});
