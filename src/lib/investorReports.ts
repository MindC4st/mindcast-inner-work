export const INVESTOR_TIMEZONE = "Pacific/Auckland";
export const INVESTOR_WORDMARK_URL =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/Wordmark-White-Transparent.png";
export const INVESTOR_SIGNAL_MARK_URL =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/signal-mark-v4.png";

export type InvestorReportStatus = "draft" | "ready" | "sent" | "archived";

export type InvestorReport = {
  id: string;
  report_month: string;
  version: number;
  revision_of: string | null;
  status: InvestorReportStatus;
  subject: string;
  preheader: string;
  headline: string;
  good: string;
  bad: string;
  ugly: string;
  learned_headline: string;
  learned_body: string;
  customer_quote: string;
  customer_quote_attribution: string;
  behaviour_change_numerator: number | null;
  behaviour_change_denominator: number | null;
  behaviour_change_period: string;
  behaviour_change_notes: string;
  family_signal_label: string;
  family_signal_numerator: number | null;
  family_signal_denominator: number | null;
  family_signal_notes: string;
  one_ask: string;
  selected_metric_ids: string[];
  metrics_snapshot: InvestorMetricSnapshot | Record<string, never>;
  metric_definition_version: string;
  metrics_refreshed_at: string | null;
  generated_html: string | null;
  generated_text: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestorPriorityStatus = "planned" | "complete" | "moved" | "not_met";

export type InvestorPriority = {
  id?: string;
  report_id?: string;
  position: number;
  objective: string;
  target: string;
  status: InvestorPriorityStatus;
  outcome: string;
};

type JsonObject = Record<string, unknown>;

export type InvestorMetricUnit = "count" | "currency" | "percent" | "decimal";

export type InvestorMetric = {
  id: string;
  label: string;
  value: number | null;
  unit: InvestorMetricUnit;
  available: boolean;
  reason: string | null;
  denominator: number | null;
  numerator: number | null;
  comparison: number | null;
  comparisonKind: "absolute" | "percentage_points";
  definition: string;
  source: string;
  selectedPeriod: string;
  primary: boolean;
};

export type InvestorTrendPoint = {
  month: string;
  members: number | null;
  mrrCents: number | null;
  mrrAvailable: boolean;
};

export type InvestorMemberMix = {
  track: "Adult" | "Teen" | "Child";
  count: number;
  percent: number;
};

export type InvestorMetricSnapshot = {
  reportMonth: string;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  incomplete: boolean;
  capturedAt: string;
  definitionVersion: string;
  coverageMessage: string | null;
  metrics: InvestorMetric[];
  trend: InvestorTrendPoint[];
  memberMix: InvestorMemberMix[];
  dataSuggestions: {
    good: string[];
    bad: string[];
    ugly: string[];
  };
};

export const DEFAULT_INVESTOR_METRICS = [
  "active_paying_members",
  "mrr",
  "net_member_growth",
  "eight_week_retention",
  "weekly_attendance",
  "journal_completion",
  "referral_rate",
  "active_households",
] as const;

export const EMPTY_PRIORITIES: InvestorPriority[] = [1, 2, 3].map((position) => ({
  position,
  objective: "",
  target: "",
  status: "planned",
  outcome: "",
}));

const asObject = (value: unknown): JsonObject =>
  value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
const asArray = (value: unknown): JsonObject[] =>
  Array.isArray(value) ? value.map(asObject) : [];
const numberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const stringOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

const findMonth = (report: JsonObject, month: string) =>
  asArray(report.growth).find((row) => row.month === month) ?? {};
const findRetention = (report: JsonObject, label: string) =>
  asArray(report.retention).find((row) => row.label === label) ?? {};
const findTrack = (report: JsonObject, track: string) =>
  asArray(report.track_comparison).find((row) => row.track === track) ?? {};

const metric = (
  values: Omit<InvestorMetric, "comparison" | "comparisonKind" | "denominator" | "numerator" | "primary"> &
    Partial<Pick<InvestorMetric, "comparison" | "comparisonKind" | "denominator" | "numerator" | "primary">>,
): InvestorMetric => ({
  comparison: null,
  comparisonKind: values.unit === "percent" ? "percentage_points" : "absolute",
  denominator: null,
  numerator: null,
  primary: false,
  ...values,
});

const withAvailability = (
  value: number | null,
  unavailableReason: string,
  sourceAvailable = true,
) => ({
  value,
  available: sourceAvailable && value !== null,
  reason: sourceAvailable && value !== null ? null : unavailableReason,
});

const difference = (value: number | null, previous: number | null) =>
  value === null || previous === null ? null : Math.round((value - previous) * 10) / 10;

export function monthKey(input: string | Date): string {
  if (input instanceof Date) {
    return `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, "0")}`;
  }
  return input.slice(0, 7);
}

export function monthStart(input: string | Date): string {
  return `${monthKey(input)}-01`;
}

export function previousMonthKey(input: string): string {
  const [year, month] = monthKey(input).split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  return monthKey(date);
}

export function formatReportMonth(input: string, uppercase = false): string {
  const [year, month] = monthKey(input).split("-").map(Number);
  const label = new Intl.DateTimeFormat("en-NZ", { month: "long", year: "numeric" })
    .format(new Date(year, month - 1, 1));
  return uppercase ? label.toUpperCase() : label;
}

export function defaultInvestorSubject(input: string) {
  return `MINDCAST — ${formatReportMonth(input)} Investor Update`;
}

export function createEmptyInvestorReport(reportMonth: string): Omit<InvestorReport, "id" | "created_at" | "updated_at"> {
  return {
    report_month: monthStart(reportMonth),
    version: 1,
    revision_of: null,
    status: "draft",
    subject: defaultInvestorSubject(reportMonth),
    preheader: "",
    headline: "",
    good: "",
    bad: "",
    ugly: "",
    learned_headline: "",
    learned_body: "",
    customer_quote: "",
    customer_quote_attribution: "",
    behaviour_change_numerator: null,
    behaviour_change_denominator: null,
    behaviour_change_period: "",
    behaviour_change_notes: "",
    family_signal_label: "",
    family_signal_numerator: null,
    family_signal_denominator: null,
    family_signal_notes: "",
    one_ask: "",
    selected_metric_ids: [...DEFAULT_INVESTOR_METRICS],
    metrics_snapshot: {},
    metric_definition_version: "admin-reporting-v1",
    metrics_refreshed_at: null,
    generated_html: null,
    generated_text: null,
    sent_at: null,
  };
}

export function buildInvestorMetricSnapshot(raw: unknown): InvestorMetricSnapshot {
  const payload = asObject(raw);
  const selected = asObject(payload.selected);
  const previous = asObject(payload.previous);
  const billing = asObject(payload.billing);
  const previousBilling = asObject(payload.previous_billing);
  const availability = asObject(payload.availability);
  const operations = asObject(payload.operations);
  const previousOperations = asObject(payload.previous_operations);
  const membershipSnapshot = asObject(payload.membership_snapshot);
  const previousMembershipSnapshot = asObject(payload.previous_membership_snapshot);
  const reportMonth = String(payload.report_month ?? "");
  const previousMonth = previousMonthKey(reportMonth);
  const currentGrowth = findMonth(selected, reportMonth);
  const priorGrowth = findMonth(previous, previousMonth);
  const attendance = asObject(selected.attendance);
  const priorAttendance = asObject(previous.attendance);
  const journal = asObject(selected.journal);
  const priorJournal = asObject(previous.journal);
  const families = asObject(selected.families);
  const priorFamilies = asObject(previous.families);
  const billingAvailable = billing.available === true;
  const previousBillingAvailable = previousBilling.available === true;
  const billingReason = stringOrNull(billing.reason) ?? "Billing history is not available at this cutoff.";
  const previousBillingReason = stringOrNull(previousBilling.reason) ?? "Previous-month billing history is not available.";
  const currentPaying = billingAvailable ? numberOrNull(billing.active_paying_members) : null;
  const priorPaying = previousBillingAvailable ? numberOrNull(previousBilling.active_paying_members) : null;
  const currentMrr = billingAvailable ? numberOrNull(billing.mrr_cents) : null;
  const priorMrr = previousBillingAvailable ? numberOrNull(previousBilling.mrr_cents) : null;
  const mrrGrowth = currentMrr !== null && priorMrr !== null && priorMrr > 0
    ? Math.round((currentMrr - priorMrr) / priorMrr * 1000) / 10 : null;
  const currentActive = numberOrNull(currentGrowth.ending);
  const priorActive = numberOrNull(priorGrowth.ending);
  const currentNew = numberOrNull(currentGrowth.new);
  const priorNew = numberOrNull(priorGrowth.new);
  const currentNet = numberOrNull(currentGrowth.net);
  const priorNet = numberOrNull(priorGrowth.net);
  const retention = (label: string) => findRetention(selected, label);
  const previousRetention = (label: string) => findRetention(previous, label);
  const track = (name: string) => findTrack(selected, name);
  const previousTrack = (name: string) => findTrack(previous, name);
  const coverage = asObject(selected.coverage);
  const referralAvailability = asObject(availability.referral);

  const metrics: InvestorMetric[] = [
    metric({
      id: "active_members", label: "Active members", unit: "count", primary: true,
      ...withAvailability(currentActive, "No trustworthy month-end membership snapshot is available."),
      comparison: difference(currentActive, priorActive),
      definition: "Members whose active or trialing interval includes the selected month-end cutoff.",
      source: "membership_status_events → reporting_membership_intervals",
      selectedPeriod: "Month-end snapshot",
    }),
    metric({
      id: "active_paying_members", label: "Active paying members", unit: "count", primary: true,
      ...withAvailability(currentPaying, billingReason, billingAvailable),
      comparison: previousBillingAvailable ? difference(currentPaying, priorPaying) : null,
      definition: "Active members covered by an active Stripe subscription at the selected month-end cutoff.",
      source: "subscription_reporting_events + membership intervals",
      selectedPeriod: "Month-end snapshot",
    }),
    metric({
      id: "new_members", label: "New members", unit: "count",
      ...withAvailability(currentNew, "Membership starts are only measured after reporting capture began."),
      comparison: difference(currentNew, priorNew),
      definition: "Members whose first observed non-baseline active or trialing interval began in the selected month.",
      source: "membership_status_events",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "net_member_growth", label: "Net member growth", unit: "count", primary: true,
      ...withAvailability(currentNet, "Membership transitions are not complete for this month."),
      comparison: difference(currentNet, priorNet),
      definition: "Observed new membership starts minus terminal lapsed/none transitions in the month.",
      source: "membership_status_events",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "mrr", label: "MRR", unit: "currency", primary: true,
      ...withAvailability(currentMrr, billingReason, billingAvailable),
      comparison: previousBillingAvailable ? difference(currentMrr, priorMrr) : null,
      definition: "Recurring monthly revenue at the cutoff, with weekly subscriptions normalised using 52 ÷ 12. One-off revenue is excluded.",
      source: "Stripe subscription webhook MRR snapshots",
      selectedPeriod: "Month-end snapshot",
    }),
    metric({
      id: "mrr_growth", label: "MRR growth", unit: "percent",
      ...withAvailability(
        mrrGrowth,
        previousBillingAvailable ? "Previous-month MRR was zero, so relative growth is not meaningful." : previousBillingReason,
        billingAvailable && previousBillingAvailable,
      ),
      comparison: null,
      definition: "Month-end MRR minus previous month-end MRR, divided by previous month-end MRR.",
      source: "Stripe subscription webhook MRR snapshots",
      selectedPeriod: "Selected month-end vs previous month-end",
    }),
    metric({
      id: "arpm", label: "Average revenue / paying member", unit: "currency",
      ...withAvailability(
        currentMrr !== null && currentPaying !== null && currentPaying > 0 ? currentMrr / currentPaying : null,
        billingAvailable ? "No active paying members in this month." : billingReason,
        billingAvailable,
      ),
      comparison: previousBillingAvailable && priorMrr !== null && priorPaying && priorPaying > 0 && currentMrr !== null && currentPaying && currentPaying > 0
        ? difference(currentMrr / currentPaying, priorMrr / priorPaying) : null,
      definition: "Month-end MRR divided by active paying members at the same cutoff.",
      source: "Stripe subscription snapshots + membership intervals",
      selectedPeriod: "Month-end snapshot",
    }),
    metric({
      id: "trial_to_paid", label: "Trial → paid", unit: "percent",
      ...withAvailability(
        billingAvailable ? numberOrNull(billing.trial_to_paid_percent) : null,
        billingAvailable ? "No trials resolved during this month." : billingReason,
        billingAvailable,
      ),
      numerator: numberOrNull(billing.trial_to_paid_numerator),
      denominator: numberOrNull(billing.trial_to_paid_denominator),
      comparison: previousBillingAvailable
        ? difference(numberOrNull(billing.trial_to_paid_percent), numberOrNull(previousBilling.trial_to_paid_percent)) : null,
      definition: "Trialing subscriptions that became active ÷ trialing subscriptions that resolved during the month.",
      source: "subscription_reporting_events",
      selectedPeriod: "Selected calendar month",
    }),
    ...[
      ["four_week_retention", "4-week retention", "4 weeks"],
      ["eight_week_retention", "8-week retention", "8 weeks"],
      ["three_month_retention", "3-month retention", "3 months"],
      ["six_month_retention", "6-month retention", "6 months"],
    ].map(([id, label, period]) => {
      const current = retention(period);
      const prior = previousRetention(period);
      const denominator = numberOrNull(current.denominator);
      const value = numberOrNull(current.overall);
      return metric({
        id, label, unit: "percent", primary: id === "eight_week_retention",
        ...withAvailability(value, `No eligible cohort has matured to ${period} yet.`),
        numerator: numberOrNull(current.retained), denominator,
        comparison: difference(value, numberOrNull(prior.overall)),
        definition: `Eligible observed cohorts still active ${period} after membership start ÷ cohorts old enough to reach ${period}.`,
        source: "membership_status_events → shared retention cohorts",
        selectedPeriod: `Eligible through ${String(payload.period_end ?? "month end")}`,
      });
    }),
    metric({
      id: "weekly_attendance", label: "Weekly attendance", unit: "percent", primary: true,
      ...withAvailability(numberOrNull(attendance.rate), "No eligible scheduled sessions occurred in this month."),
      numerator: numberOrNull(attendance.attended), denominator: numberOrNull(attendance.eligible),
      comparison: difference(numberOrNull(attendance.rate), numberOrNull(priorAttendance.rate)),
      definition: "Distinct eligible sessions attended ÷ eligible non-cancelled sessions available.",
      source: "check_ins + scheduled_sessions + membership intervals",
      selectedPeriod: "Selected calendar month",
    }),
    ...["Adult", "Teen", "Child"].map((name) => {
      const current = numberOrNull(track(name).attendance);
      const prior = numberOrNull(previousTrack(name).attendance);
      return metric({
        id: `${name.toLowerCase()}_attendance`, label: `${name} attendance`, unit: "percent",
        ...withAvailability(current, `No eligible ${name.toLowerCase()} sessions occurred in this month.`),
        comparison: difference(current, prior),
        definition: `Eligible ${name.toLowerCase()} sessions attended ÷ eligible ${name.toLowerCase()} sessions available.`,
        source: "check_ins + scheduled_sessions + membership intervals",
        selectedPeriod: "Selected calendar month",
      });
    }),
    metric({
      id: "return_after_miss", label: "Return after miss", unit: "percent",
      ...withAvailability(numberOrNull(attendance.return_after_miss), "No missed session in this month has a subsequent eligible session yet."),
      comparison: difference(numberOrNull(attendance.return_after_miss), numberOrNull(priorAttendance.return_after_miss)),
      definition: "Misses followed by attendance at the next eligible session ÷ misses with a subsequent eligible session.",
      source: "shared eligible attendance outcomes",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "return_after_two_misses", label: "Return after two misses", unit: "percent",
      ...withAvailability(numberOrNull(attendance.return_after_two_misses), "No two-miss sequence has a subsequent eligible session yet."),
      comparison: difference(numberOrNull(attendance.return_after_two_misses), numberOrNull(priorAttendance.return_after_two_misses)),
      definition: "Two consecutive misses followed by attendance ÷ two-miss sequences with a subsequent eligible session.",
      source: "shared eligible attendance outcomes",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "journal_completion", label: "Journal completion", unit: "percent", primary: true,
      ...withAvailability(numberOrNull(journal.completion_rate), "No eligible Adult digital journal fields occurred in this month."),
      numerator: numberOrNull(journal.completed_entries), denominator: numberOrNull(journal.possible_entries),
      comparison: difference(numberOrNull(journal.completion_rate), numberOrNull(priorJournal.completion_rate)),
      definition: "Meaningful completed Adult journal fields ÷ legitimate fields available for eligible sessions. Teen and Child are paper-only.",
      source: "privacy-safe journal activity metadata; no journal text",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "entries_per_member", label: "Journal entries / active member", unit: "decimal",
      ...withAvailability(numberOrNull(journal.entries_per_active_member_month), "No eligible Adult journal activity occurred in this month."),
      comparison: difference(numberOrNull(journal.entries_per_active_member_month), numberOrNull(priorJournal.entries_per_active_member_month)),
      definition: "Meaningful Adult journal field completions ÷ eligible active Adult member-months.",
      source: "privacy-safe journal activity metadata",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "total_journal_responses", label: "Journal responses", unit: "count",
      ...withAvailability(numberOrNull(journal.completed_entries), "No eligible Adult journal fields occurred in this month."),
      comparison: difference(numberOrNull(journal.completed_entries), numberOrNull(priorJournal.completed_entries)),
      definition: "Total meaningful Adult journal fields completed for eligible sessions in the selected month.",
      source: "privacy-safe journal activity metadata",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "active_households", label: "Active families", unit: "count", primary: true,
      ...withAvailability(numberOrNull(membershipSnapshot.active_households ?? families.active_households), "No active linked households are available."),
      comparison: difference(
        numberOrNull(membershipSnapshot.active_households ?? families.active_households),
        numberOrNull(previousMembershipSnapshot.active_households ?? priorFamilies.active_households),
      ),
      definition: "Linked households containing at least one active or trialing member in the reporting scope.",
      source: "households + household_members + membership status",
      selectedPeriod: "Selected report scope",
    }),
    metric({
      id: "family_participation", label: "Family participation", unit: "percent",
      ...withAvailability(numberOrNull(families.family_participation_rate), "No multi-member household had enough eligible attendance data."),
      comparison: difference(numberOrNull(families.family_participation_rate), numberOrNull(priorFamilies.family_participation_rate)),
      definition: "Multi-member household-weeks where more than one member attended ÷ multi-member household-weeks with more than one eligible member.",
      source: "household membership + eligible attendance outcomes",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "referral_rate", label: "Referral acquisition", unit: "percent", primary: true,
      ...withAvailability(null, stringOrNull(referralAvailability.reason) ?? "Referral tracking is incomplete.", false),
      definition: "New paying members attributed to member referral ÷ all new paying members in the month.",
      source: "Not yet available: reliable signup/referral attribution required",
      selectedPeriod: "Selected calendar month",
    }),
    metric({
      id: "active_locations", label: "Active locations", unit: "count",
      ...withAvailability(numberOrNull(operations.active_locations), "No delivered locations were recorded in this month."),
      comparison: difference(numberOrNull(operations.active_locations), numberOrNull(previousOperations.active_locations)),
      definition: "Programme locations with at least one non-cancelled scheduled session during the selected month.",
      source: "scheduled_sessions + programme_locations",
      selectedPeriod: "Selected calendar month",
    }),
  ];

  const trendReport = asObject(payload.trend);
  const billingTrend = asArray(payload.billing_trend);
  const trend: InvestorTrendPoint[] = asArray(trendReport.growth).slice(-6).map((row) => {
    const billingRow = billingTrend.find((item) => item.month === row.month) ?? {};
    const snapshot = asObject(billingRow.snapshot);
    return {
      month: String(row.month ?? ""),
      members: numberOrNull(row.ending),
      mrrCents: snapshot.available === true ? numberOrNull(snapshot.mrr_cents) : null,
      mrrAvailable: snapshot.available === true,
    };
  });
  const mixCounts = (["Adult", "Teen", "Child"] as const).map((trackName) => ({
    track: trackName,
    count: numberOrNull(currentGrowth[trackName]) ?? 0,
  }));
  const mixTotal = mixCounts.reduce((sum, item) => sum + item.count, 0);
  const memberMix: InvestorMemberMix[] = mixTotal > 0 ? mixCounts.map((item) => ({
    ...item,
    percent: Math.round(item.count / mixTotal * 1000) / 10,
  })) : [];

  const positive = metrics
    .filter((item) => item.available && item.comparison !== null && item.comparison > 0)
    .sort((a, b) => (b.comparison ?? 0) - (a.comparison ?? 0));
  const negative = metrics
    .filter((item) => item.available && item.comparison !== null && item.comparison < 0)
    .sort((a, b) => (a.comparison ?? 0) - (b.comparison ?? 0));
  const coverageMessage = stringOrNull(coverage.message);

  return {
    reportMonth,
    periodStart: String(payload.period_start ?? ""),
    periodEnd: String(payload.period_end ?? ""),
    timezone: String(payload.timezone ?? INVESTOR_TIMEZONE),
    incomplete: payload.is_incomplete_month === true,
    capturedAt: new Date().toISOString(),
    definitionVersion: String(payload.metric_definition_version ?? "admin-reporting-v1"),
    coverageMessage,
    metrics,
    trend,
    memberMix,
    dataSuggestions: {
      good: positive.slice(0, 4).map((item) => `${item.label}: ${formatMetricValue(item)} (${formatMetricChange(item, previousMonth)})`),
      bad: negative.slice(0, 4).map((item) => `${item.label}: ${formatMetricValue(item)} (${formatMetricChange(item, previousMonth)})`),
      ugly: [
        coverageMessage,
        billingAvailable ? null : billingReason,
        stringOrNull(referralAvailability.reason),
      ].filter((item): item is string => Boolean(item)),
    },
  };
}

export function formatMetricValue(metricValue: InvestorMetric): string {
  if (!metricValue.available || metricValue.value === null) return "Not enough data";
  if (metricValue.unit === "currency") {
    const dollars = metricValue.value / 100;
    if (Math.abs(dollars) >= 1000) return `$${(dollars / 1000).toFixed(dollars >= 10000 ? 1 : 2).replace(/\.0$/, "")}K`;
    return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(dollars);
  }
  if (metricValue.unit === "percent") return `${metricValue.value.toFixed(metricValue.value % 1 ? 1 : 0)}%`;
  if (metricValue.unit === "decimal") return metricValue.value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return new Intl.NumberFormat("en-NZ", { maximumFractionDigits: 1 }).format(metricValue.value);
}

export function formatMetricChange(metricValue: InvestorMetric, comparisonMonth: string): string {
  if (metricValue.comparison === null) return "No prior comparison";
  const sign = metricValue.comparison > 0 ? "+" : metricValue.comparison < 0 ? "−" : "";
  const absolute = Math.abs(metricValue.comparison);
  const month = formatReportMonth(comparisonMonth).replace(/ \d{4}$/, "");
  if (metricValue.comparisonKind === "percentage_points") {
    return `${sign}${absolute.toFixed(absolute % 1 ? 1 : 0)} pts vs ${month}`;
  }
  if (metricValue.unit === "currency") {
    const dollars = absolute / 100;
    return `${sign}${new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(dollars)} vs ${month}`;
  }
  return `${sign}${new Intl.NumberFormat("en-NZ", { maximumFractionDigits: 1 }).format(absolute)} vs ${month}`;
}

export function suggestedInvestorHeadline(snapshot: InvestorMetricSnapshot): string {
  const byId = Object.fromEntries(snapshot.metrics.map((item) => [item.id, item]));
  const paying = byId.active_paying_members;
  const retention = byId.eight_week_retention;
  const mrr = byId.mrr;
  if (paying?.available && paying.comparison !== null && paying.comparison > 0 && retention?.available) {
    return `Paid membership grew by ${Math.round(paying.comparison)} while eight-week retention reached ${formatMetricValue(retention)}.`;
  }
  if (mrr?.available && mrr.comparison !== null && mrr.comparison > 0) {
    return `Monthly recurring revenue increased by ${formatMetricChange(mrr, previousMonthKey(snapshot.reportMonth)).split(" vs ")[0]} this month.`;
  }
  const strongest = snapshot.metrics
    .filter((item) => item.available && item.comparison !== null && item.comparison > 0)
    .sort((a, b) => (b.comparison ?? 0) - (a.comparison ?? 0))[0];
  return strongest
    ? `${strongest.label} reached ${formatMetricValue(strongest)} this month.`
    : "";
}

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const paragraphs = (value: string) => value.trim().split(/\n{2,}/)
  .filter(Boolean)
  .map((part) => `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#303947;">${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
  .join("");

const sectionTitle = (title: string) => `
  <tr><td style="padding:34px 36px 14px;">
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.22em;color:#3585AF;text-transform:uppercase;">${escapeHtml(title)}</div>
  </td></tr>`;

const metricCard = (item: InvestorMetric, priorMonth: string) => `
  <td class="metric-cell" width="50%" valign="top" style="width:50%;padding:7px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E4DDD1;background:#FFFFFF;">
      <tr><td style="padding:18px 16px 6px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1;font-weight:700;color:#102438;">${escapeHtml(formatMetricValue(item))}</td></tr>
      <tr><td style="padding:0 16px 8px;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:1.4;font-weight:700;letter-spacing:.16em;color:#5F6D78;text-transform:uppercase;">${escapeHtml(item.label)}</td></tr>
      <tr><td style="padding:0 16px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;color:#3585AF;">${escapeHtml(formatMetricChange(item, priorMonth))}${item.denominator !== null && item.numerator !== null ? `<br><span style="color:#7A8188;">${escapeHtml(`${item.numerator} of ${item.denominator}`)}</span>` : ""}</td></tr>
    </table>
  </td>`;

const metricRows = (metrics: InvestorMetric[], priorMonth: string) => {
  const rows: string[] = [];
  for (let index = 0; index < metrics.length; index += 2) {
    const first = metricCard(metrics[index], priorMonth);
    const second = metrics[index + 1]
      ? metricCard(metrics[index + 1], priorMonth)
      : '<td class="metric-cell" width="50%" style="width:50%;padding:7px;">&nbsp;</td>';
    rows.push(`<tr class="metric-row">${first}${second}</tr>`);
  }
  return rows.join("");
};

const secondaryMetricRows = (metrics: InvestorMetric[], priorMonth: string) => metrics.map((item) => `
  <tr>
    <td style="padding:9px 10px 9px 0;border-top:1px solid #E4DDD1;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.1em;color:#5F6D78;text-transform:uppercase;">${escapeHtml(item.label)}</td>
    <td align="right" style="padding:9px 0;border-top:1px solid #E4DDD1;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#102438;">${escapeHtml(formatMetricValue(item))}<br><span style="font-size:10px;font-weight:400;color:#3585AF;">${escapeHtml(formatMetricChange(item, priorMonth))}</span></td>
  </tr>`).join("");

const trendRows = (trend: InvestorTrendPoint[], value: "members" | "mrrCents") => {
  const available = trend.filter((point) => point[value] !== null);
  if (available.length < 2) return "";
  const max = Math.max(...available.map((point) => point[value] ?? 0), 1);
  return available.map((point) => {
    const raw = point[value] ?? 0;
    const width = Math.max(3, Math.round(raw / max * 100));
    const label = formatReportMonth(point.month).replace(/ \d{4}$/, "").slice(0, 3);
    const display = value === "mrrCents"
      ? formatMetricValue(metric({ id: "trend", label: "", value: raw, unit: "currency", available: true, reason: null, definition: "", source: "", selectedPeriod: "" }))
      : String(raw);
    return `<tr>
      <td width="48" style="padding:5px 8px 5px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#747B84;text-transform:uppercase;">${escapeHtml(label)}</td>
      <td style="padding:5px 10px 5px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="${width}%" style="height:8px;background:#3585AF;font-size:1px;line-height:1px;">&nbsp;</td><td style="height:8px;background:#E8F2F7;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td>
      <td width="54" align="right" style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#102438;">${escapeHtml(display)}</td>
    </tr>`;
  }).join("");
};

const memberMixBlock = (mix: InvestorMemberMix[]) => {
  if (!mix.length) return "";
  const colours = { Adult: "#102438", Teen: "#3585AF", Child: "#C5E3F3" };
  const segments = mix.filter((item) => item.percent > 0).map((item) =>
    `<td width="${item.percent}%" style="width:${item.percent}%;height:12px;background:${colours[item.track]};font-size:1px;line-height:1px;">&nbsp;</td>`).join("");
  const labels = mix.map((item) =>
    `<td valign="top" style="padding:10px 10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.45;color:#5F6D78;"><strong style="color:#102438;">${item.track}</strong><br>${item.percent}% · ${item.count}</td>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${segments}</tr></table><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${labels}</tr></table>`;
};

const narrativeBlock = (label: string, body: string, accent: string) => body.trim() ? `
  <tr><td style="padding:0 36px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid ${accent};background:#F8F5EF;">
      <tr><td style="padding:18px 20px 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.18em;color:#102438;text-transform:uppercase;">${escapeHtml(label)}</td></tr>
      <tr><td style="padding:0 20px 14px;">${paragraphs(body)}</td></tr>
    </table>
  </td></tr>` : "";

const priorityRows = (priorities: InvestorPriority[]) => priorities
  .filter((item) => item.objective.trim() || item.target.trim())
  .sort((a, b) => a.position - b.position)
  .map((item) => `
    <tr><td width="44" valign="top" style="padding:13px 10px 13px 0;border-top:1px solid #E4DDD1;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#3585AF;">${String(item.position).padStart(2, "0")}</td>
    <td valign="top" style="padding:13px 0;border-top:1px solid #E4DDD1;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#303947;"><strong>${escapeHtml(item.objective)}</strong>${item.target.trim() ? `<br><span style="color:#747B84;">${escapeHtml(item.target)}</span>` : ""}</td></tr>`)
  .join("");

const priorPriorityRows = (priorities: InvestorPriority[]) => priorities
  .filter((item) => item.objective.trim() && (item.outcome.trim() || item.status !== "planned"))
  .sort((a, b) => a.position - b.position)
  .map((item) => {
    const symbol = item.status === "complete" ? "✓" : item.status === "moved" ? "→" : item.status === "not_met" ? "—" : "·";
    return `<tr><td width="24" valign="top" style="padding:5px 8px 5px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#3585AF;">${symbol}</td><td style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#5F6D78;">${escapeHtml(item.outcome.trim() || item.objective)}</td></tr>`;
  }).join("");

export type InvestorRenderInput = {
  report: InvestorReport;
  snapshot: InvestorMetricSnapshot;
  priorities: InvestorPriority[];
  previousPriorities?: InvestorPriority[];
};

export function renderInvestorEmail({ report, snapshot, priorities, previousPriorities = [] }: InvestorRenderInput) {
  const priorMonth = previousMonthKey(snapshot.reportMonth);
  const selectedMetrics = report.selected_metric_ids
    .map((id) => snapshot.metrics.find((item) => item.id === id))
    .filter((item): item is InvestorMetric => Boolean(item?.available))
    .slice(0, 8);
  const primaryMetrics = selectedMetrics.filter((item) => item.primary);
  const secondaryMetrics = selectedMetrics.filter((item) => !item.primary);
  const memberTrend = trendRows(snapshot.trend, "members");
  const mrrTrend = trendRows(snapshot.trend, "mrrCents");
  const memberMix = memberMixBlock(snapshot.memberMix ?? []);
  const previousResults = priorPriorityRows(previousPriorities);
  const currentPriorities = priorityRows(priorities);
  const behaviourReady = report.behaviour_change_numerator !== null
    && report.behaviour_change_denominator !== null
    && report.behaviour_change_denominator > 0
    && report.behaviour_change_numerator <= report.behaviour_change_denominator;
  const familyReady = report.family_signal_numerator !== null
    && report.family_signal_denominator !== null
    && report.family_signal_denominator > 0
    && report.family_signal_numerator <= report.family_signal_denominator;
  const behaviourPercent = behaviourReady
    ? Math.round(report.behaviour_change_numerator! / report.behaviour_change_denominator! * 100)
    : null;
  const familyPercent = familyReady
    ? Math.round(report.family_signal_numerator! / report.family_signal_denominator! * 100)
    : null;
  const subject = report.subject.trim() || defaultInvestorSubject(report.report_month);
  const preheader = report.preheader.trim() || report.headline.trim();

  const html = `<!doctype html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<title>${escapeHtml(subject)}</title>
<style>
  :root{color-scheme:light only;supported-color-schemes:light only}
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  @media only screen and (max-width:620px){
    .wrap{width:100%!important}.outer{padding:0!important}.pad{padding-left:22px!important;padding-right:22px!important}
    .metric-cell{display:block!important;width:100%!important;box-sizing:border-box!important}
    .metric-row{display:block!important}.mast{padding-left:24px!important;padding-right:24px!important}
  }
  @media print{body{background:#fff!important}.outer{padding:0!important}.wrap{width:100%!important;max-width:none!important}}
</style>
</head>
<body style="margin:0;padding:0;background:#F8F5EF;">
<div style="display:none;font-size:1px;color:#F8F5EF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#F8F5EF;">
<tr><td class="outer" align="center" style="padding:28px 10px;">
<table role="presentation" class="wrap" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background:#FFFAF5;">
  <tr><td class="mast" style="padding:26px 36px;background:#3585AF;">
    <img src="${INVESTOR_WORDMARK_URL}" width="154" height="31" alt="MINDCAST" style="display:block;width:154px;max-width:154px;height:auto;">
  </td></tr>
  <tr><td class="pad" style="padding:18px 36px 0;"><img src="${INVESTOR_SIGNAL_MARK_URL}" width="170" alt="" aria-hidden="true" style="display:block;width:170px;max-width:170px;height:auto;"></td></tr>
  <tr><td class="pad" style="padding:34px 36px 28px;border-bottom:1px solid #E4DDD1;">
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.24em;color:#3585AF;text-transform:uppercase;">Monthly investor update</div>
    <h1 style="margin:8px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:42px;line-height:1.05;color:#102438;">${escapeHtml(formatReportMonth(report.report_month))}</h1>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.08em;color:#747B84;">Tools for Intentional Living</div>
  </td></tr>
  ${report.headline.trim() ? `
  <tr><td class="pad" style="padding:30px 36px 12px;"><div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.22em;color:#3585AF;text-transform:uppercase;">The headline</div></td></tr>
  <tr><td class="pad" style="padding:0 36px 12px;"><div style="padding:22px 24px;background:#102438;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.35;font-weight:700;color:#FFFAF5;">${escapeHtml(report.headline)}</div></td></tr>` : ""}
  ${selectedMetrics.length ? `${sectionTitle("The numbers")}${primaryMetrics.length ? `<tr><td class="pad" style="padding:0 29px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${metricRows(primaryMetrics, priorMonth)}</table></td></tr>` : ""}${secondaryMetrics.length ? `<tr><td class="pad" style="padding:0 36px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${secondaryMetricRows(secondaryMetrics, priorMonth)}</table></td></tr>` : ""}` : ""}
  ${memberTrend ? `${sectionTitle("Membership trend")}<tr><td class="pad" style="padding:0 36px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${memberTrend}</table></td></tr>` : ""}
  ${memberMix ? `${sectionTitle("Member mix")}<tr><td class="pad" style="padding:0 36px 14px;">${memberMix}</td></tr>` : ""}
  ${mrrTrend ? `${sectionTitle("MRR trend")}<tr><td class="pad" style="padding:0 36px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${mrrTrend}</table></td></tr>` : ""}
  ${(report.good || report.bad || report.ugly) ? sectionTitle("Good / Bad / Ugly") : ""}
  ${narrativeBlock("Good", report.good, "#3585AF")}
  ${narrativeBlock("Bad", report.bad, "#9AA9B3")}
  ${narrativeBlock("Ugly", report.ugly, "#102438")}
  ${(report.learned_headline || report.learned_body) ? `${sectionTitle("What we learned")}<tr><td class="pad" style="padding:0 36px 16px;"><div style="padding:22px 24px;border:1px solid #C5E3F3;background:#EDF7FB;"><div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.4;font-weight:700;color:#102438;">${escapeHtml(report.learned_headline)}</div>${report.learned_body ? `<div style="padding-top:12px;">${paragraphs(report.learned_body)}</div>` : ""}</div></td></tr>` : ""}
  ${report.customer_quote.trim() ? `${sectionTitle("In their words")}<tr><td class="pad" style="padding:0 36px 18px;"><blockquote style="margin:0;padding:0 0 0 20px;border-left:2px solid #3585AF;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.5;font-style:italic;color:#303947;">“${escapeHtml(report.customer_quote.replace(/^[“"]|[”"]$/g, ""))}”</blockquote>${report.customer_quote_attribution.trim() ? `<div style="padding:12px 0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#747B84;">${escapeHtml(report.customer_quote_attribution)}</div>` : ""}</td></tr>` : ""}
  ${behaviourReady ? `${sectionTitle("Behaviour change")}<tr><td class="pad" style="padding:0 36px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#102438;"><tr><td width="115" valign="top" style="padding:22px;font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:700;color:#FFFAF5;">${behaviourPercent}%</td><td valign="top" style="padding:22px 22px 22px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#FFFAF5;">of surveyed members reported a specific behaviour change.<br><span style="font-size:11px;color:#C5E3F3;">${report.behaviour_change_numerator} of ${report.behaviour_change_denominator}${report.behaviour_change_period ? ` · ${escapeHtml(report.behaviour_change_period)}` : ""}</span></td></tr></table>${report.behaviour_change_notes ? `<div style="padding-top:9px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#747B84;">${escapeHtml(report.behaviour_change_notes)}</div>` : ""}</td></tr>` : ""}
  ${familyReady ? `${sectionTitle("At home")}<tr><td class="pad" style="padding:0 36px 18px;"><div style="padding:20px 22px;border:1px solid #E4DDD1;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;color:#303947;"><strong style="font-size:30px;color:#102438;">${familyPercent}%</strong><br><span style="font-size:14px;line-height:1.55;">${escapeHtml(report.family_signal_label || "of participating families met this month's family indicator")}</span><br><span style="font-size:11px;color:#747B84;">${report.family_signal_numerator} of ${report.family_signal_denominator}</span>${report.family_signal_notes ? `<br><span style="font-size:11px;line-height:1.5;color:#747B84;">${escapeHtml(report.family_signal_notes)}</span>` : ""}</div></td></tr>` : ""}
  ${previousResults ? `${sectionTitle("Last month")}<tr><td class="pad" style="padding:0 36px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${previousResults}</table></td></tr>` : ""}
  ${currentPriorities ? `${sectionTitle("Next month")}<tr><td class="pad" style="padding:0 36px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${currentPriorities}</table></td></tr>` : ""}
  ${report.one_ask.trim() ? `${sectionTitle("One ask")}<tr><td class="pad" style="padding:0 36px 22px;"><div style="padding:20px 22px;background:#EDF7FB;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#102438;">${escapeHtml(report.one_ask)}</div></td></tr>` : ""}
  <tr><td class="pad" style="padding:28px 36px 30px;border-top:1px solid #E4DDD1;">
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#102438;">Thanks for following the MINDCAST journey.</div>
    <div style="padding-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#747B84;">Notice It. Name It. Do It.</div>
    <div style="padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#92979D;"><a href="https://www.mindcast.co.nz" style="color:#3585AF;text-decoration:none;">mindcast.co.nz</a> · Taupō, Aotearoa New Zealand</div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const metricText = selectedMetrics.map((item) => {
    const sample = item.denominator !== null && item.numerator !== null
      ? ` (${item.numerator} of ${item.denominator})` : "";
    return `${item.label.toUpperCase()}: ${formatMetricValue(item)} — ${formatMetricChange(item, priorMonth)}${sample}`;
  }).join("\n");
  const priorityText = priorities.filter((item) => item.objective.trim() || item.target.trim())
    .sort((a, b) => a.position - b.position)
    .map((item) => `${String(item.position).padStart(2, "0")} ${item.objective}${item.target ? ` — ${item.target}` : ""}`)
    .join("\n");
  const text = [
    "MINDCAST — MONTHLY INVESTOR UPDATE",
    formatReportMonth(report.report_month, true),
    report.headline && `THE HEADLINE\n${report.headline}`,
    metricText && `THE NUMBERS\n${metricText}`,
    report.good && `GOOD\n${report.good}`,
    report.bad && `BAD\n${report.bad}`,
    report.ugly && `UGLY\n${report.ugly}`,
    (report.learned_headline || report.learned_body) && `WHAT WE LEARNED\n${[report.learned_headline, report.learned_body].filter(Boolean).join("\n")}`,
    report.customer_quote && `IN THEIR WORDS\n“${report.customer_quote.replace(/^[“"]|[”"]$/g, "")}”${report.customer_quote_attribution ? `\n— ${report.customer_quote_attribution}` : ""}`,
    behaviourReady && `BEHAVIOUR CHANGE\n${behaviourPercent}% · ${report.behaviour_change_numerator} of ${report.behaviour_change_denominator}${report.behaviour_change_period ? ` · ${report.behaviour_change_period}` : ""}`,
    familyReady && `AT HOME\n${familyPercent}% · ${report.family_signal_numerator} of ${report.family_signal_denominator}\n${report.family_signal_label}`,
    priorityText && `NEXT MONTH\n${priorityText}`,
    report.one_ask && `ONE ASK\n${report.one_ask}`,
    "Thanks for following the MINDCAST journey.\nNotice It. Name It. Do It.\nmindcast.co.nz",
  ].filter(Boolean).join("\n\n---\n\n");

  return { subject, preheader, html, text };
}
