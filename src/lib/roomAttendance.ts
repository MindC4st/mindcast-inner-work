// roomAttendance.ts — pure logic for the room attendance kiosk.
//
// The authoritative state lives in roll_events / the room_roll +
// confirm_room_presence RPCs (database). This module holds the presentation
// and decision logic that mirrors those RPCs so it can be unit-tested without
// a database. Keep it in lockstep with supabase/migrations/
// 20260827120000_room_kiosk_presence.sql (confirm_room_presence) and
// 20260819110000_room_roll_child_safety.sql (room_roll state mapping).

import type { Room } from "@/lib/rollOffline";

export type RollState =
  | "expected"
  | "present"
  | "brief_absence"
  | "signed_out"
  | "flagged";

/** A row as returned by the room_roll RPC (kiosk-shaped subset). */
export type KioskRollRow = {
  profile_id: string;
  display_name: string;
  state: RollState;
  last_event?: string;
  departure_reason?: string | null;
  occurred_at?: string;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  teen_self_signout?: boolean;
};

export type PresenceOutcome =
  | "marked_present"
  | "already_present"
  | "not_expected"
  | "wrong_room"
  | "unknown_bracelet";

/**
 * Mirror of confirm_room_presence's decision table. Given the person's latest
 * roll event in THIS room (or null if none) and the room where they are
 * expected (if they are expected somewhere else today), decide the outcome of
 * scanning their bracelet in this room.
 *
 * - signed_in / moved_in            -> expected here      -> marked_present
 * - departed (brief_absence)        -> stepped out, back  -> marked_present
 * - present / returned              -> already confirmed  -> already_present
 * - anything else + expected elsewhere -> wrong_room
 * - anything else + not expected anywhere -> not_expected (door sign-in missing)
 */
export function decidePresence(opts: {
  latestEvent: string | null;
  latestReason: string | null;
  expectedElsewhereRoom: Room | null;
}): PresenceOutcome {
  const { latestEvent, latestReason, expectedElsewhereRoom } = opts;
  if (latestEvent === "signed_in" || latestEvent === "moved_in") return "marked_present";
  if (latestEvent === "departed" && latestReason === "brief_absence") return "marked_present";
  if (latestEvent === "present" || latestEvent === "returned") return "already_present";
  if (expectedElsewhereRoom) return "wrong_room";
  return "not_expected";
}

/** Group a room's roll into the kiosk's display buckets. */
export function groupRoll(rows: KioskRollRow[]): {
  needsConfirming: KioskRollRow[];
  inRoom: KioskRollRow[];
  temporarilyOut: KioskRollRow[];
  out: KioskRollRow[];
} {
  return {
    needsConfirming: rows.filter((r) => r.state === "expected"),
    inRoom: rows.filter((r) => r.state === "present"),
    temporarilyOut: rows.filter((r) => r.state === "brief_absence"),
    out: rows.filter((r) => r.state === "signed_out"),
  };
}

/** Unresolved = still needs a terminal state before the room can close. */
export function unresolvedCount(rows: KioskRollRow[]): number {
  const g = groupRoll(rows);
  return g.needsConfirming.length + g.inRoom.length + g.temporarilyOut.length;
}

/** A teen may sign themselves out only if the guardian enabled it in advance. */
export function canSelfSignOut(row: Pick<KioskRollRow, "teen_self_signout">): boolean {
  return row.teen_self_signout === true;
}

export type NfcScanUi = {
  tone: "success" | "info" | "warning" | "error";
  heading: string;
  body: string;
};

/**
 * Turn a confirm_room_presence result into the staff-facing message shown on
 * the kiosk after a bracelet scan.
 */
export function nfcScanUi(res: {
  outcome: PresenceOutcome;
  display_name?: string | null;
  expected_room?: string | null;
  room: Room;
}): NfcScanUi {
  const name = res.display_name || "This member";
  switch (res.outcome) {
    case "marked_present":
      return { tone: "success", heading: `${name} — IN ROOM`, body: "Marked present." };
    case "already_present":
      return { tone: "info", heading: `${name} — already in room`, body: "Already marked present. No duplicate recorded." };
    case "wrong_room":
      return {
        tone: "warning",
        heading: `${name} — wrong room`,
        body: `Expected in the ${res.expected_room ?? "another"} room, not here.`,
      };
    case "not_expected":
      return {
        tone: "error",
        heading: "NOT SIGNED IN AT THE DOOR",
        body: `${name} isn't on today's expected ${res.room} roll. Check their household arrival before admitting them.`,
      };
    case "unknown_bracelet":
      return {
        tone: "error",
        heading: "BRACELET NOT RECOGNISED",
        body: "This bracelet isn't linked to a member. Link it in Admin → Members, then scan again.",
      };
  }
}
