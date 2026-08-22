import { describe, expect, it } from "vitest";
import {
  buildInvestorMetricSnapshot,
  createEmptyInvestorReport,
  formatMetricChange,
  monthKey,
  previousMonthKey,
  renderInvestorEmail,
  type InvestorReport,
} from "@/lib/investorReports";

const rawMetrics = (overrides: Record<string, unknown> = {}) => ({
  report_month: "2026-08",
  period_start: "2026-08-01",
  period_end: "2026-08-31",
  timezone: "Pacific/Auckland",
  is_incomplete_month: false,
  metric_definition_version: "admin-reporting-v1",
  selected: {
    coverage: { message: null },
    growth: [{ month: "2026-08", starting: 40, new: 8, lost: 2, ending: 46, net: 6, Adult: 26, Teen: 12, Child: 8 }],
    retention: [
      { label: "4 weeks", denominator: 30, retained: 24, overall: 80 },
      { label: "8 weeks", denominator: 20, retained: 15, overall: 75 },
      { label: "3 months", denominator: 0, retained: 0, overall: null },
      { label: "6 months", denominator: 0, retained: 0, overall: null },
    ],
    attendance: { eligible: 100, attended: 72, rate: 72, return_after_miss: 64, return_after_two_misses: 50 },
    track_comparison: [
      { track: "Adult", attendance: 78 },
      { track: "Teen", attendance: 65 },
      { track: "Child", attendance: 70 },
    ],
    journal: { possible_entries: 210, completed_entries: 147, completion_rate: 70, entries_per_active_member_month: 5.65 },
    families: { active_households: 31, family_participation_rate: 58 },
  },
  previous: {
    growth: [{ month: "2026-07", starting: 35, new: 6, lost: 1, ending: 40, net: 5, Adult: 23, Teen: 10, Child: 7 }],
    retention: [
      { label: "4 weeks", denominator: 28, retained: 21, overall: 75 },
      { label: "8 weeks", denominator: 18, retained: 12, overall: 66.7 },
      { label: "3 months", denominator: 0, retained: 0, overall: null },
      { label: "6 months", denominator: 0, retained: 0, overall: null },
    ],
    attendance: { eligible: 90, attended: 63, rate: 70, return_after_miss: 60, return_after_two_misses: 40 },
    track_comparison: [
      { track: "Adult", attendance: 74 },
      { track: "Teen", attendance: 64 },
      { track: "Child", attendance: 69 },
    ],
    journal: { possible_entries: 190, completed_entries: 124, completion_rate: 65.3, entries_per_active_member_month: 5.39 },
    families: { active_households: 27, family_participation_rate: 54 },
  },
  trend: {
    growth: [
      { month: "2026-07", ending: 40 },
      { month: "2026-08", ending: 46 },
    ],
  },
  billing: {
    available: true,
    active_paying_members: 42,
    mrr_cents: 35600,
    currency: "nzd",
    trial_to_paid_numerator: 4,
    trial_to_paid_denominator: 5,
    trial_to_paid_percent: 80,
  },
  previous_billing: {
    available: true,
    active_paying_members: 36,
    mrr_cents: 30200,
    currency: "nzd",
    trial_to_paid_numerator: 3,
    trial_to_paid_denominator: 5,
    trial_to_paid_percent: 60,
  },
  billing_trend: [
    { month: "2026-07", snapshot: { available: true, mrr_cents: 30200 } },
    { month: "2026-08", snapshot: { available: true, mrr_cents: 35600 } },
  ],
  availability: {
    referral: { available: false, reason: "Referral tracking incomplete" },
  },
  ...overrides,
});

const reportFor = (snapshot = buildInvestorMetricSnapshot(rawMetrics())): InvestorReport => ({
  ...createEmptyInvestorReport(snapshot.reportMonth),
  id: "report-1",
  created_at: "2026-08-31T08:00:00Z",
  updated_at: "2026-08-31T08:00:00Z",
  metrics_snapshot: snapshot,
  headline: "Membership grew while retention stayed above target.",
  good: "A genuine result.",
  bad: "Something underperformed.",
  ugly: "An uncomfortable learning.",
  learned_headline: "Customers are buying a reason to return.",
});

describe("investor monthly metric adapter", () => {
  it("uses percentage-point changes for rate metrics", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    const retention = snapshot.metrics.find((item) => item.id === "eight_week_retention")!;
    expect(retention.comparison).toBe(8.3);
    expect(formatMetricChange(retention, "2026-07")).toBe("+8.3 pts vs July");
  });

  it("distinguishes a genuine zero from unavailable data", () => {
    const zero = buildInvestorMetricSnapshot(rawMetrics({
      billing: { available: true, active_paying_members: 0, mrr_cents: 0, trial_to_paid_denominator: 0 },
    }));
    const unavailable = buildInvestorMetricSnapshot(rawMetrics({
      billing: { available: false, reason: "Billing history unavailable" },
    }));
    expect(zero.metrics.find((item) => item.id === "mrr")).toMatchObject({ available: true, value: 0 });
    expect(unavailable.metrics.find((item) => item.id === "mrr")).toMatchObject({ available: false, value: null, reason: "Billing history unavailable" });
  });

  it("does not turn an immature retention cohort into 0%", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    expect(snapshot.metrics.find((item) => item.id === "six_month_retention")).toMatchObject({
      available: false,
      value: null,
      denominator: 0,
    });
  });

  it("keeps referral attribution unavailable until a reliable field exists", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    expect(snapshot.metrics.find((item) => item.id === "referral_rate")).toMatchObject({
      available: false,
      reason: "Referral tracking incomplete",
    });
  });

  it("creates the Adult/Teen/Child mix from the month-end membership row", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    expect(snapshot.memberMix).toEqual([
      { track: "Adult", count: 26, percent: 56.5 },
      { track: "Teen", count: 12, percent: 26.1 },
      { track: "Child", count: 8, percent: 17.4 },
    ]);
  });

  it("marks the current calendar month as incomplete without changing its timezone", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics({
      is_incomplete_month: true,
      period_end: "2026-08-23",
    }));
    expect(snapshot).toMatchObject({
      incomplete: true,
      periodEnd: "2026-08-23",
      timezone: "Pacific/Auckland",
    });
  });
});

describe("investor email renderer", () => {
  it("renders static, table-based, responsive email HTML with the public wordmark", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    const output = renderInvestorEmail({ report: reportFor(snapshot), snapshot, priorities: [] });
    expect(output.html).toContain("width=\"640\"");
    expect(output.html).toContain("Wordmark-White-Transparent.png");
    expect(output.html).toContain("@media only screen and (max-width:620px)");
    expect(output.html).toContain("Member mix");
    expect(output.html).not.toMatch(/<script/i);
    expect(output.html).not.toContain("supabase.rpc");
    expect(output.html).not.toContain("createClient(");
  });

  it("omits optional quote, behaviour, family and ask blocks when empty", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    const output = renderInvestorEmail({ report: reportFor(snapshot), snapshot, priorities: [] });
    expect(output.text).not.toContain("IN THEIR WORDS");
    expect(output.text).not.toContain("BEHAVIOUR CHANGE");
    expect(output.text).not.toContain("AT HOME");
    expect(output.text).not.toContain("ONE ASK");
  });

  it("escapes founder-entered content before placing it in HTML", () => {
    const snapshot = buildInvestorMetricSnapshot(rawMetrics());
    const report = reportFor(snapshot);
    report.headline = "Growth <script>alert('x')</script> & retention";
    const output = renderInvestorEmail({ report, snapshot, priorities: [] });
    expect(output.html).toContain("Growth &lt;script&gt;");
    expect(output.html).not.toContain("<script>alert");
  });

  it("hides empty metric cards instead of publishing a misleading zero", () => {
    const emptySection = {
      coverage: { message: "Reporting capture has just begun." },
      growth: [], retention: [], attendance: {}, track_comparison: [], journal: {}, families: {},
    };
    const snapshot = buildInvestorMetricSnapshot(rawMetrics({
      selected: emptySection,
      previous: emptySection,
      trend: { growth: [] },
      billing: { available: false, reason: "Billing history unavailable" },
      previous_billing: { available: false, reason: "Billing history unavailable" },
      billing_trend: [],
    }));
    const output = renderInvestorEmail({ report: reportFor(snapshot), snapshot, priorities: [] });
    expect(output.html).not.toContain("Not enough data");
    expect(output.html).not.toContain("The numbers");
  });
});

describe("investor report month handling", () => {
  it("moves across year boundaries correctly", () => {
    expect(previousMonthKey("2026-01")).toBe("2025-12");
    expect(monthKey(new Date(2026, 0, 1))).toBe("2026-01");
  });
});
