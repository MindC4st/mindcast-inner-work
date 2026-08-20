import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_TZ, currentUnlockedWeek, isWeekUnlocked, unlockInstant } from "@/lib/schedule";

// Client-side mirror of the lesson_unlocked(week) SQL helper. Reads the program
// start date + timezone from app_settings once, then computes which weeks are
// open. Week N unlocks at 09:30 (program tz) on start_date + (N-1)*7 days and
// stays open. Server RLS remains the source of truth for access; this drives UI.

export type ProgramSchedule = {
  startDate: string | null;
  timezone: string;
  loading: boolean;
  demoUnlockAll: boolean;
  isUnlocked: (week: number) => boolean;
  unlockDate: (week: number) => Date | null;
  currentWeek: number | null; // highest unlocked week (1..52), null if not started
};

export function useProgramSchedule(): ProgramSchedule {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(DEFAULT_TZ);
  const [demoUnlockAll, setDemoUnlockAll] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("app_settings").select("key, value")
        .in("key", ["program_start_date", "program_timezone", "demo_unlock_all"]);
      if (!active) return;
      const map: Record<string, string | null> = {};
      (data || []).forEach((r) => { map[r.key] = r.value; });
      setStartDate(map.program_start_date || null);
      setTimezone(map.program_timezone || DEFAULT_TZ);
      setDemoUnlockAll(map.demo_unlock_all === "true");
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const unlockDate = (week: number) =>
    startDate && week >= 1 ? unlockInstant(startDate, week, timezone) : null;
  const isUnlocked = (week: number) =>
    demoUnlockAll ? week >= 1 && week <= 52 : isWeekUnlocked(startDate, week, timezone, Date.now());
  const currentWeek = demoUnlockAll ? 52 : currentUnlockedWeek(startDate, timezone, Date.now());

  return { startDate, timezone, loading, demoUnlockAll, isUnlocked, unlockDate, currentWeek };
}
