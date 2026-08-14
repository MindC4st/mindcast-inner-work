export type GateRule = "before_first_session" | "before_member_contact" | "week_1" | "month_1";
export type CheckpointKind = "single" | "multi" | "checklist" | "freetext" | "acknowledge" | "order";

export type Checkpoint = {
  id: string;
  kind: CheckpointKind;
  prompt: string;
  options: string[];
  correct: number[] | null;
  scoreable: boolean;
  required: boolean;
  policy_code: string | null;
  policy_version: string | null;
};

export type ResponseValue = number | number[] | string | boolean | null;

export type ModuleStatus =
  | "not_started" | "in_progress" | "passed" | "acknowledged"
  | "failed" | "overdue" | "expired";

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort((x, y) => x - y).join(",") === [...b].sort((x, y) => x - y).join(",");

export function isAnswered(cp: Checkpoint, value: ResponseValue): boolean {
  if (value === null || value === undefined) return false;
  switch (cp.kind) {
    case "freetext": return typeof value === "string" && value.trim().length > 0;
    case "acknowledge": return value === true;
    case "single": return typeof value === "number";
    case "multi":
    case "checklist": return Array.isArray(value) && value.length > 0;
    case "order": return Array.isArray(value) && value.length === cp.options.length;
    default: return false;
  }
}

// null = not scoreable (free text / acknowledgement)
export function evaluateCheckpoint(cp: Checkpoint, value: ResponseValue): boolean | null {
  if (!cp.scoreable) return null;
  if (!isAnswered(cp, value)) return false;
  switch (cp.kind) {
    case "single": return value === (cp.correct?.[0] ?? -1);
    case "multi":
    case "checklist": return Array.isArray(value) && sameSet(value, cp.correct || []);
    case "order": return Array.isArray(value) && value.every((v, i) => v === i);
    default: return null;
  }
}

export type ModuleEvaluation = {
  score: number | null;
  passed: boolean;
  complete: boolean;
  missingCount: number;
};

export function evaluateModule(
  checkpoints: Checkpoint[],
  responses: Record<string, ResponseValue>,
  passMark: number | null,
): ModuleEvaluation {
  const required = checkpoints.filter((c) => c.required);
  const missingCount = required.filter((c) => !isAnswered(c, responses[c.id] ?? null)).length;
  const scoreable = checkpoints.filter((c) => c.scoreable);
  const correct = scoreable.filter((c) => evaluateCheckpoint(c, responses[c.id] ?? null) === true).length;
  const score = scoreable.length ? correct / scoreable.length : null;
  const passed = missingCount === 0 && (passMark === null || (score !== null && score >= passMark));
  return { score, passed, complete: missingCount === 0, missingCount };
}

// Timing gates: week_1 / month_1 are relative to the person's staff start
// date; before_first_session / before_member_contact are gates, not dates.
export function dueDateFor(gate: GateRule, anchor: Date | null): Date | null {
  if (!anchor) return null;
  if (gate === "week_1") return addDays(anchor, 7);
  if (gate === "month_1") return addDays(anchor, 30);
  return null;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

// Full manual repeats annually.
export const RECERTIFICATION_DAYS = 365;

export function expiresFrom(completedAt: Date): Date {
  return addDays(completedAt, RECERTIFICATION_DAYS);
}

export function moduleStatus(args: {
  progress: { status: string; expires_at: string | null } | null;
  dueAt: Date | null;
  now: Date;
}): ModuleStatus {
  const { progress, dueAt, now } = args;
  if (!progress) {
    return dueAt && now > dueAt ? "overdue" : "not_started";
  }
  if (progress.status === "passed" || progress.status === "acknowledged") {
    if (progress.expires_at && now > new Date(progress.expires_at)) return "expired";
    return progress.status;
  }
  if (dueAt && now > dueAt) return "overdue";
  return progress.status === "failed" ? "failed" : "in_progress";
}

// Member-contact gate: everyone overdue/blocked on a before_member_contact
// module is not current for member-facing work.
export function memberContactCurrent(
  entries: { gate: GateRule; status: ModuleStatus }[],
): boolean {
  return entries
    .filter((e) => e.gate === "before_member_contact")
    .every((e) => e.status === "passed" || e.status === "acknowledged");
}

export const GATE_LABEL: Record<GateRule, string> = {
  before_first_session: "Before first session",
  before_member_contact: "Before member contact",
  week_1: "Week 1",
  month_1: "Month 1",
};

export const STATUS_LABEL: Record<ModuleStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  passed: "Passed",
  acknowledged: "Acknowledged",
  failed: "Not passed yet",
  overdue: "Overdue",
  expired: "Due for recertification",
};
