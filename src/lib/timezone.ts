// Timezone utilities for pilot application cutoff

// Cutoff: 9am Tuesday 29 September 2026, Pacific/Auckland (NZDT = UTC+13)
const CUTOFF_ISO = "2026-09-29T09:00:00+13:00";
const CUTOFF_MS = new Date(CUTOFF_ISO).getTime();

export function nowInNZ(): number {
  const nzString = new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" });
  return new Date(nzString).getTime();
}

export function isBeforeCutoff(): boolean {
  return nowInNZ() < CUTOFF_MS;
}

export function getCutoffISO(): string {
  return CUTOFF_ISO;
}

export function getTimeUntilCutoff(): number {
  return Math.max(0, CUTOFF_MS - nowInNZ());
}

export function formatCutoffNZ(): string {
  return new Date(CUTOFF_ISO).toLocaleString("en-NZ", {
    timeZone: "Pacific/Auckland",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}