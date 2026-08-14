import { describe, expect, it } from "vitest";
import {
  Checkpoint, dueDateFor, evaluateCheckpoint, evaluateModule,
  expiresFrom, memberContactCurrent, moduleStatus,
} from "@/lib/training";

const cp = (over: Partial<Checkpoint>): Checkpoint => ({
  id: over.id || "c1",
  kind: "single",
  prompt: "Question",
  options: ["a", "b", "c"],
  correct: [1],
  scoreable: true,
  required: true,
  policy_code: null,
  policy_version: null,
  ...over,
});

describe("evaluateCheckpoint", () => {
  it("single-select compares against the correct index", () => {
    const c = cp({});
    expect(evaluateCheckpoint(c, 1)).toBe(true);
    expect(evaluateCheckpoint(c, 0)).toBe(false);
  });

  it("multi-select is order-insensitive and exact", () => {
    const c = cp({ kind: "multi", correct: [0, 2] });
    expect(evaluateCheckpoint(c, [2, 0])).toBe(true);
    expect(evaluateCheckpoint(c, [0])).toBe(false);
    expect(evaluateCheckpoint(c, [0, 1, 2])).toBe(false);
  });

  it("order checkpoints require the exact sequence", () => {
    const c = cp({ kind: "order", options: ["x", "y", "z"], correct: null });
    expect(evaluateCheckpoint(c, [0, 1, 2])).toBe(true);
    expect(evaluateCheckpoint(c, [1, 0, 2])).toBe(false);
  });

  it("free text and acknowledgements are not scored", () => {
    expect(evaluateCheckpoint(cp({ kind: "freetext", scoreable: false }), "anything")).toBeNull();
    expect(evaluateCheckpoint(cp({ kind: "acknowledge", scoreable: false }), true)).toBeNull();
  });
});

describe("evaluateModule", () => {
  const checkpoints = [
    cp({ id: "q1" }),
    cp({ id: "q2", kind: "multi", correct: [0, 1] }),
    cp({ id: "note", kind: "freetext", scoreable: false }),
  ];

  it("100% gates fail on any wrong scored answer", () => {
    const ev = evaluateModule(checkpoints, { q1: 1, q2: [0], note: "done" }, 1);
    expect(ev.passed).toBe(false);
    expect(ev.score).toBeCloseTo(0.5);
  });

  it("100% gates pass only with every scored answer right and everything answered", () => {
    const ev = evaluateModule(checkpoints, { q1: 1, q2: [1, 0], note: "done" }, 1);
    expect(ev.passed).toBe(true);
  });

  it("incomplete modules are never passed", () => {
    const ev = evaluateModule(checkpoints, { q1: 1, q2: [1, 0] }, 1);
    expect(ev.passed).toBe(false);
    expect(ev.missingCount).toBe(1);
  });

  it("80% pass marks allow one miss across five questions", () => {
    const five = [0, 1, 2, 3, 4].map((i) => cp({ id: `s${i}`, correct: [0] }));
    const responses: Record<string, number> = { s0: 0, s1: 0, s2: 0, s3: 0, s4: 1 };
    expect(evaluateModule(five, responses, 0.8).passed).toBe(true);
    responses.s3 = 1;
    expect(evaluateModule(five, responses, 0.8).passed).toBe(false);
  });
});

describe("due dates and recertification", () => {
  const anchor = new Date("2026-08-03T00:00:00Z");

  it("week 1 and month 1 gates are relative to the staff start", () => {
    expect(dueDateFor("week_1", anchor)?.toISOString().slice(0, 10)).toBe("2026-08-10");
    expect(dueDateFor("month_1", anchor)?.toISOString().slice(0, 10)).toBe("2026-09-02");
  });

  it("session/member-contact gates carry no calendar due date", () => {
    expect(dueDateFor("before_first_session", anchor)).toBeNull();
    expect(dueDateFor("before_member_contact", anchor)).toBeNull();
  });

  it("certification expires annually", () => {
    const done = new Date("2026-08-15T00:00:00Z");
    expect(expiresFrom(done).toISOString().slice(0, 10)).toBe("2027-08-15");
  });
});

describe("moduleStatus and the member-contact gate", () => {
  const now = new Date("2026-08-20T12:00:00Z");

  it("flags overdue when a due date has passed without completion", () => {
    expect(moduleStatus({ progress: null, dueAt: new Date("2026-08-19"), now })).toBe("overdue");
    expect(moduleStatus({ progress: { status: "in_progress", expires_at: null }, dueAt: new Date("2026-08-19"), now })).toBe("overdue");
  });

  it("expired certifications are visible, not silently passed", () => {
    expect(moduleStatus({
      progress: { status: "passed", expires_at: "2026-08-01" }, dueAt: null, now,
    })).toBe("expired");
  });

  it("member-contact currency requires every gate module current", () => {
    expect(memberContactCurrent([
      { gate: "before_member_contact", status: "passed" },
      { gate: "before_member_contact", status: "overdue" },
    ])).toBe(false);
    expect(memberContactCurrent([
      { gate: "before_member_contact", status: "passed" },
      { gate: "week_1", status: "overdue" },
    ])).toBe(true);
  });
});
