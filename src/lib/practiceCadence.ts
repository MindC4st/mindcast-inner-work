// The weekly practice cadence, defined once.
//
// SUN (TODAY) -> MIDWEEK -> FRI -> back to SUN.
//
// Every surface that renders the practice table — the room screen, the printed
// worksheet, the coursebook, the portal, the reminder emails — reads this. Two
// separate ordering bugs this session came from a label and a value being
// declared in different places and drifting apart, so there is exactly one
// declaration.
//
// MIDWEEK rather than a weekday: Life Groups run Tuesday AND Wednesday, not
// every member is in one, and a printed sheet cannot carry a per-member day
// without reprinting the year. The member's night lives on their Life Group
// card instead.

export type PracticeSlotKey = "practice_sun_today" | "practice_midweek" | "practice_fri";

export type PracticeSlot = {
  key: PracticeSlotKey;
  /** Short label for the room screen. */
  label: string;
  /** Uppercase label for print. */
  printLabel: string;
  /** What this slot is for, in one line — used as a caption where there's room. */
  purpose: string;
};

export const PRACTICE_SLOTS: readonly PracticeSlot[] = [
  {
    key: "practice_sun_today",
    label: "Sun (today)",
    printLabel: "SUN (TODAY)",
    purpose: "Write the if-then plan",
  },
  {
    key: "practice_midweek",
    label: "Midweek",
    printLabel: "MIDWEEK",
    purpose: "Check in on it",
  },
  {
    key: "practice_fri",
    label: "Fri",
    printLabel: "FRI",
    purpose: "Check in again",
  },
] as const;

/** A row holding practice text, tolerant of the pre-rename column names. */
type PracticeSource = Partial<Record<PracticeSlotKey, string | null>> &
  Partial<Record<"weekly_practice_mon" | "weekly_practice_wed" | "weekly_practice_sun" | "weekly_practice_fri", string | null>>;

// Until `supabase db push` runs and types are regenerated, a row read from the
// deployed schema still carries the old column names. Falling back keeps the
// practice table populated through the deploy window instead of rendering three
// empty boxes in front of a room.
const LEGACY_FALLBACK: Record<PracticeSlotKey, keyof PracticeSource> = {
  practice_sun_today: "weekly_practice_mon",
  practice_midweek: "weekly_practice_wed",
  practice_fri: "weekly_practice_sun",
};

export const practiceText = (row: PracticeSource | null | undefined, key: PracticeSlotKey): string =>
  (row?.[key] ?? row?.[LEGACY_FALLBACK[key]] ?? "").toString().trim();

/** The three slots with their text, skipping any that are empty. */
export const practiceEntries = (row: PracticeSource | null | undefined) =>
  PRACTICE_SLOTS
    .map((slot) => ({ ...slot, text: practiceText(row, slot.key) }))
    .filter((s) => s.text.length > 0);
