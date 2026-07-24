import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Client-side mirror of the lesson_unlocked(week) SQL helper. Reads the program
// start date + timezone from app_settings once, then computes which weeks are
// open. Week N unlocks at 09:30 (program tz) on start_date + (N-1)*7 days and
// stays open. Server RLS remains the source of truth for access; this drives UI.

const DEFAULT_TZ = "Pacific/Auckland";

// Offset (ms) of `tz` from UTC at a given instant, via Intl (no tz library).
function tzOffsetMs(tz: string, date: Date): number {
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
function unlockInstant(startDate: string, week: number, tz: string): Date | null {
  const base = new Date(startDate + "T00:00:00Z");
  if (isNaN(base.getTime())) return null;
  base.setUTCDate(base.getUTCDate() + (week - 1) * 7);
  const guessUTC = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 9, 30, 0);
  const offset = tzOffsetMs(tz, new Date(guessUTC));
  return new Date(guessUTC - offset);
}

export type ProgramSchedule = {
  startDate: string | null;
  timezone: string;
  loading: boolean;
  isUnlocked: (week: number) => boolean;
  unlockDate: (week: number) => Date | null;
  currentWeek: number | null; // highest unlocked week (1..52), null if not started
};

export function useProgramSchedule(): ProgramSchedule {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TZ);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("app_settings").select("key, value")
        .in("key", ["program_start_date", "program_timezone"]);
      if (!active) return;
      const map: Record<string, string | null> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      setStartDate(map.program_start_date || null);
      setTimezone(map.program_timezone || DEFAULT_TZ);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const unlockDate = (week: number) =>
    startDate && week >= 1 ? unlockInstant(startDate, week, timezone) : null;
  const isUnlocked = (week: number) => {
    const d = unlockDate(week);
    return !!d && Date.now() >= d.getTime();
  };

  let currentWeek: number | null = null;
  if (startDate) for (let w = 1; w <= 52; w++) if (isUnlocked(w)) currentWeek = w;

  return { startDate, timezone, loading, isUnlocked, unlockDate, currentWeek };
}
