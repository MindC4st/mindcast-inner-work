export const DEFAULT_TZ = "Pacific/Auckland";

// Offset (ms) of `tz` from UTC at a given instant, via Intl (no tz library).
export function tzOffsetMs(tz: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const hour = p.hour === "24" ? 0 : Number(p.hour);
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second));
  return asUTC - date.getTime();
}

// Instant week N unlocks: 09:30 wall-clock in `tz` on start + (N-1)*7 days.
export function unlockInstant(startDate: string, week: number, tz: string): Date | null {
  const base = new Date(startDate + "T00:00:00Z");
  if (isNaN(base.getTime())) return null;
  base.setUTCDate(base.getUTCDate() + (week - 1) * 7);
  const guessUTC = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 9, 30, 0);
  const offset = tzOffsetMs(tz, new Date(guessUTC));
  return new Date(guessUTC - offset);
}

export function isWeekUnlocked(startDate: string | null, week: number, tz: string, nowMs: number): boolean {
  if (!startDate || week < 1) return false;
  const d = unlockInstant(startDate, week, tz);
  return !!d && nowMs >= d.getTime();
}

export function currentUnlockedWeek(startDate: string | null, tz: string, nowMs: number): number | null {
  if (!startDate) return null;
  let current: number | null = null;
  for (let w = 1; w <= 52; w++) if (isWeekUnlocked(startDate, w, tz, nowMs)) current = w;
  return current;
}
