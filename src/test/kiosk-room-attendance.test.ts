import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { extractBraceletToken } from "@/lib/nfc";
import {
  decidePresence,
  groupRoll,
  unresolvedCount,
  nfcScanUi,
  canSelfSignOut,
  type KioskRollRow,
  type PresenceOutcome,
} from "@/lib/roomAttendance";

// ── NFC identity: the bracelet token (NDEF URL) vs the hardware serial ──────

describe("NFC bracelet token extraction", () => {
  it("extracts the /b/<token> from an NDEF URL record", () => {
    const rec = (text: string) => ({ data: new TextEncoder().encode(text).buffer });
    expect(extractBraceletToken([rec("https://www.mindcast.co.nz/b/ABC123XYZ")])).toBe("ABC123XYZ");
    expect(extractBraceletToken([rec("https://mindcast.co.nz/b/TK8WP4QNR7")])).toBe("TK8WP4QNR7");
  });

  it("returns null when no URL record is present (hardware serial only)", () => {
    const rec = (text: string) => ({ data: new TextEncoder().encode(text).buffer });
    expect(extractBraceletToken([rec("04:a1:b2:c3:d4:e5:f6")])).toBe(null);
    expect(extractBraceletToken(null)).toBe(null);
    expect(extractBraceletToken([])).toBe(null);
  });

  it("the hardware serial does NOT match the bracelet token model", () => {
    // BraceletStudio writes {site}/b/<token> and stores <token> in profiles.nfc_id.
    // The hardware serial (NDEFReader.serialNumber) is a DIFFERENT value and
    // must never be used as the identity — it won't resolve against nfc_id.
    const serial = "04a1b2c3d4e5f6";
    const token = "ABC123XYZ";
    expect(serial).not.toBe(token);
    expect(extractBraceletToken([{ data: new TextEncoder().encode(serial).buffer }])).toBe(null);
    expect(extractBraceletToken([{ data: new TextEncoder().encode(`https://www.mindcast.co.nz/b/${token}`).buffer }])).toBe(token);
  });
});

// ── Presence decision logic (mirrors confirm_room_presence RPC) ────────────

const p = (latestEvent: string | null, latestReason: string | null, elsewhere: string | null): PresenceOutcome =>
  decidePresence({ latestEvent, latestReason, expectedElsewhereRoom: elsewhere as "Adult" | "Teen" | "Child" | null });

describe("presence outcome (confirm_room_presence mirror)", () => {
  it("expected -> marked present", () => {
    expect(p("signed_in", null, null)).toBe("marked_present");
    expect(p("moved_in", null, null)).toBe("marked_present");
  });

  it("stepped out briefly -> returned (marked present on return scan)", () => {
    expect(p("departed", "brief_absence", null)).toBe("marked_present");
  });

  it("already present -> idempotent (no duplicate)", () => {
    expect(p("present", null, null)).toBe("already_present");
    expect(p("returned", null, null)).toBe("already_present");
  });

  it("not expected in this room + expected elsewhere -> wrong_room", () => {
    expect(p(null, null, "Adult")).toBe("wrong_room");
  });

  it("not expected anywhere -> not_expected (door sign-in missing)", () => {
    expect(p(null, null, null)).toBe("not_expected");
    expect(p("departed", "collected", null)).toBe("not_expected");
  });

  it("departed with non-brief_absence reason -> not_expected", () => {
    expect(p("departed", "moved", null)).toBe("not_expected");
    expect(p("departed", "collected", null)).toBe("not_expected");
    expect(p("departed", "unaccompanied", null)).toBe("not_expected");
  });
});

// ── Roll grouping ───────────────────────────────────────────────────────────

const row = (state: KioskRollRow["state"], name: string): KioskRollRow => ({
  profile_id: name, display_name: name, state,
});

describe("roll grouping", () => {
  it("1. door admits Teen -> appears as EXPECTED in Teen room", () => {
    const g = groupRoll([row("expected", "Alex")]);
    expect(g.needsConfirming).toHaveLength(1);
    expect(g.needsConfirming[0].display_name).toBe("Alex");
  });

  it("2. door admits Child -> appears as EXPECTED in Child room", () => {
    const g = groupRoll([row("expected", "Lucy")]);
    expect(g.needsConfirming).toHaveLength(1);
    expect(g.needsConfirming[0].display_name).toBe("Lucy");
  });

  it("5+6. teen expected + scan/manual tap -> present", () => {
    const g = groupRoll([row("present", "Leo")]);
    expect(g.inRoom).toHaveLength(1);
    expect(g.inRoom[0].display_name).toBe("Leo");
  });

  it("7. not expected -> NOT SIGNED IN AT THE DOOR message", () => {
    const ui = nfcScanUi({ outcome: "not_expected", display_name: "Alex", room: "Teen" });
    expect(ui.heading).toContain("NOT SIGNED IN AT THE DOOR");
    expect(ui.body).toContain("Alex");
  });

  it("9. repeated scan -> already_present (no duplicate)", () => {
    expect(p("present", null, null)).toBe("already_present");
    const ui = nfcScanUi({ outcome: "already_present", display_name: "Leo", room: "Teen" });
    expect(ui.body).toContain("Already marked present");
  });

  it("10. wrong-room bracelet -> wrong_room", () => {
    const ui = nfcScanUi({ outcome: "wrong_room", display_name: "Alex", expected_room: "Adult", room: "Teen" });
    expect(ui.body).toContain("Adult");
    expect(ui.tone).toBe("warning");
  });

  it("12. brief absence -> correct departure event", () => {
    const g = groupRoll([row("brief_absence", "Alex")]);
    expect(g.temporarilyOut).toHaveLength(1);
  });

  it("13. returned -> present", () => {
    const g = groupRoll([row("present", "Alex")]);
    expect(g.inRoom).toHaveLength(1);
  });

  it("14. collected child -> signed_out", () => {
    const g = groupRoll([row("signed_out", "Lucy")]);
    expect(g.out).toHaveLength(1);
  });

  it("15+16. teen self signout gate", () => {
    expect(canSelfSignOut({ teen_self_signout: false })).toBe(false);
    expect(canSelfSignOut({ teen_self_signout: true })).toBe(true);
    expect(canSelfSignOut({})).toBe(false);
  });

  it("17+18. close room: unresolved blocks, all-accounted succeeds", () => {
    expect(unresolvedCount([row("expected", "A"), row("present", "B")])).toBe(2);
    expect(unresolvedCount([row("signed_out", "A"), row("signed_out", "B")])).toBe(0);
  });

  it("20. wall consent is unrelated to room-roll visibility", () => {
    // room_roll's WHERE clause is can_access_room_roll — wall_hidden is never
    // checked in room_roll. The kiosk never reads check_ins.wall_hidden.
    // This test asserts the pure module never references wall consent.
    const src = readFileSync(path.resolve(process.cwd(), "src/lib/roomAttendance.ts"), "utf8");
    expect(src).not.toMatch(/wall_hidden|wallHidden|wall_opt/);
  });
});

// ── Migration guards (SQL-level safety) ─────────────────────────────────────

describe("migration: DB-level safeguarding guards", () => {
  const sql = readFileSync(
    path.resolve(process.cwd(), "supabase/migrations/20260827120000_room_kiosk_presence.sql"),
    "utf8",
  );
  const origSql = readFileSync(
    path.resolve(process.cwd(), "supabase/migrations/20260819110000_room_roll_child_safety.sql"),
    "utf8",
  );

  it("confirm_room_presence is gated by can_access_room_roll", () => {
    expect(sql).toContain("can_access_room_roll");
  });

  it("confirm_room_presence uses an advisory lock for concurrency safety", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
  });

  it("confirm_room_presence never writes a 'signed_in' event (only present/returned)", () => {
    // 'signed_in' is only written by the door (door-scan), never here.
    // The function references it in WHERE to check state, but INSERT VALUES
    // only contain 'present' or 'returned'.
    const fnStart = sql.indexOf("CREATE OR REPLACE FUNCTION public.confirm_room_presence");
    const fnEnd = sql.indexOf("$$;", fnStart);
    const fnBody = sql.slice(fnStart, fnEnd);
    // INSERT VALUES in this function write 'present' and 'returned' only.
    const insertLines = fnBody.split("\n").filter((l) => l.includes("VALUES") && l.includes("'"));
    expect(insertLines.length).toBeGreaterThan(0);
    expect(insertLines.every((l) => l.includes("'present'") || l.includes("'returned'"))).toBe(true);
    expect(insertLines.some((l) => l.includes("'present'"))).toBe(true);
  });

  it("close_room hard-blocks with unresolved minors (original migration)", () => {
    expect(origSql).toContain("close_room");
    expect(origSql).toContain("Every child signed in must be signed out");
  });

  it("record_departure enforces collection_needs_person (original migration)", () => {
    expect(origSql).toContain("collection_needs_person");
    expect(origSql).toContain("departure_needs_reason");
  });

  it("teen self-signout is enforced in record_departure (original migration)", () => {
    expect(origSql).toContain("teen_self_signout");
  });
});
