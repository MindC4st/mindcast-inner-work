export const REPORTING_TRACKS = ["Adult", "Teen", "Child"] as const;
export type ReportingTrack = (typeof REPORTING_TRACKS)[number];

export const METRIC_DEFINITIONS = {
  activeMember:
    "A profile whose effective membership status is active or trialing, matching the paid-content access gate.",
  payingMember:
    "A profile or household covered by a Stripe subscription whose current status is active. Trialing is not counted as paying.",
  eligibleSession:
    "A non-cancelled session in the member's track and location that occurred while their membership was active or trialing.",
  attended:
    "At least one valid check-in for the member and scheduled session. Duplicate scans count once.",
  missed:
    "An eligible session without a valid check-in. Sessions before joining, after membership ends, in another track/location, or cancelled are excluded.",
  attendanceRate: "Distinct eligible sessions attended divided by eligible sessions available.",
  returnAfterMiss:
    "Misses followed by attendance at the next eligible session, divided by misses that have a subsequent eligible session.",
  journalEntry:
    "An Adult journal field saved with a meaningful non-empty response. Reporting stores completion metadata, never response text.",
  journalCompletion:
    "Currently completed available Adult journal fields divided by fields available for that week. Teen and Child are paper-only and show N/A.",
  retention:
    "Members with an observed, non-baseline active start who remain active at the stated duration. Only members old enough to reach the duration are included.",
  churn:
    "Members moving from active/trialing to terminal lapsed/none during a period divided by members active at the period start. Paused and past-due are not cancellation churn.",
} as const;

export type DatePreset =
  | "7d"
  | "30d"
  | "90d"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "ytd"
  | "12m"
  | "all"
  | "custom";

const isoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const reportRangeForPreset = (preset: DatePreset, now = new Date()) => {
  const end = startOfDay(now);
  const start = new Date(end);
  switch (preset) {
    case "7d": start.setDate(end.getDate() - 6); break;
    case "30d": start.setDate(end.getDate() - 29); break;
    case "90d": start.setDate(end.getDate() - 89); break;
    case "this-month": start.setDate(1); break;
    case "last-month": {
      start.setMonth(end.getMonth() - 1, 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 0);
      return { start: isoDate(start), end: isoDate(last) };
    }
    case "this-quarter": start.setMonth(Math.floor(end.getMonth() / 3) * 3, 1); break;
    case "ytd": start.setMonth(0, 1); break;
    case "12m": start.setMonth(end.getMonth() - 11, 1); break;
    case "all": return { start: null, end: isoDate(end) };
    case "custom": return { start: isoDate(start), end: isoDate(end) };
  }
  return { start: isoDate(start), end: isoDate(end) };
};

export const isMeaningfulResponse = (value: unknown) => {
  if (typeof value !== "string") return false;
  const normalised = value.trim().toLowerCase();
  return normalised.length > 0 && ![
    "[placeholder]", "placeholder", "type here", "write here", "enter response here",
  ].includes(normalised);
};

export const journalCompletion = (
  values: Record<string, unknown>,
  availableFields: readonly string[],
) => {
  const completed = availableFields.filter((field) => isMeaningfulResponse(values[field])).length;
  const available = availableFields.length;
  return { available, completed, rate: available ? completed / available : null };
};

export type TestSession = {
  id: string;
  date: string;
  track: ReportingTrack;
  cancelled?: boolean;
};

export type MembershipInterval = {
  startsAt: string;
  endsAt?: string | null;
  track: ReportingTrack;
};

export type AttendanceOutcome = { sessionId: string; date: string; attended: boolean };

/** Pure reference implementation used by tests; production aggregation lives in SQL. */
export const eligibleAttendanceOutcomes = (
  membership: MembershipInterval,
  sessions: readonly TestSession[],
  attendedSessionIds: ReadonlySet<string>,
): AttendanceOutcome[] => sessions
  .filter((session) => !session.cancelled)
  .filter((session) => session.track === membership.track)
  .filter((session) => session.date >= membership.startsAt.slice(0, 10))
  .filter((session) => !membership.endsAt || session.date < membership.endsAt.slice(0, 10))
  .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  .map((session) => ({
    sessionId: session.id,
    date: session.date,
    attended: attendedSessionIds.has(session.id),
  }));

export const attendanceSummary = (outcomes: readonly AttendanceOutcome[]) => {
  const eligible = outcomes.length;
  const attended = outcomes.filter((outcome) => outcome.attended).length;
  const missed = eligible - attended;
  let currentStreak = 0;
  let currentMissedStreak = 0;
  let longestStreak = 0;
  let running = 0;

  for (const outcome of outcomes) {
    running = outcome.attended ? running + 1 : 0;
    longestStreak = Math.max(longestStreak, running);
  }
  for (const outcome of [...outcomes].reverse()) {
    if (!outcome.attended) break;
    currentStreak += 1;
  }
  for (const outcome of [...outcomes].reverse()) {
    if (outcome.attended) break;
    currentMissedStreak += 1;
  }

  const returns = (misses: number) => {
    let denominator = 0;
    let returned = 0;
    for (let index = 0; index < outcomes.length; index += 1) {
      const window = outcomes.slice(index, index + misses);
      const next = outcomes[index + misses];
      if (window.length !== misses || window.some((item) => item.attended) || !next) continue;
      denominator += 1;
      if (next.attended) returned += 1;
    }
    return { denominator, returned, rate: denominator ? returned / denominator : null };
  };

  return {
    eligible,
    attended,
    missed,
    rate: eligible ? attended / eligible : null,
    currentStreak,
    currentMissedStreak,
    longestStreak,
    returnAfterMiss: returns(1),
    returnAfterTwoMisses: returns(2),
    returnAfterThreeMisses: returns(3),
  };
};

export type RetentionMember = {
  startedAt: string;
  endedAt?: string | null;
};

export const retentionAtDays = (
  members: readonly RetentionMember[],
  durationDays: number,
  asOf: string,
) => {
  const asOfMs = new Date(asOf).getTime();
  const durationMs = durationDays * 86_400_000;
  const matured = members.filter((member) => new Date(member.startedAt).getTime() + durationMs <= asOfMs);
  const retained = matured.filter((member) => {
    const target = new Date(member.startedAt).getTime() + durationMs;
    return !member.endedAt || new Date(member.endedAt).getTime() > target;
  });
  return {
    denominator: matured.length,
    retained: retained.length,
    rate: matured.length ? retained.length / matured.length : null,
  };
};
