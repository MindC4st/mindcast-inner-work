// Shared between the nfc-checkin edge function and the vitest suite.
// Collapse duplicate scans of the same bracelet within this window so an
// accidental double-tap doesn't double-name the welcome wall.
export const CHECKIN_DEDUPE_WINDOW_MS = 5 * 60_000;

export function shouldDedupe(previousCheckedInAtIso: string, nowMs: number): boolean {
  const prev = Date.parse(previousCheckedInAtIso);
  if (isNaN(prev)) return false;
  return nowMs - prev < CHECKIN_DEDUPE_WINDOW_MS;
}
