import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Database } from "@/integrations/supabase/types";

type CurriculumPublicRow = Database["public"]["Functions"]["curriculum_public"]["Returns"][number];

// Life-group companion pulls the full 52-week curriculum from the database
// (the live 52-week lesson plans) instead of a hardcoded pilot array. Each
// track (adult/teen/child) reads its own title column but shares the weekly
// theme.

export type Track = "adult" | "teen" | "child";

export type CurriculumWeek = {
  id: string;
  week_number: number;
  block_number: number | null;
  block_theme: string | null;
  weekly_theme: string | null;
  title: string | null; // resolved for the given track
  source: string | null; // resolved for the given track (adult/teen source or kids format)
  notes: string | null;
  /**
   * Per-track session titles, exactly as `curriculum_public` returns them.
   * Optional so existing callers (and their test fixtures) keep working;
   * the /curriculum Life Binder uses them for its ADULT/TEEN/CHILD toggle.
   */
  track_titles?: {
    adult: string | null;
    teen: string | null;
    child: string | null;
  };
};

export const trackForAgeGroup = (age?: string | null): Track => {
  const a = (age || "adult").toLowerCase();
  if (a === "teen") return "teen";
  if (a === "child" || a === "kids") return "child";
  return "adult";
};

const resolve = (row: CurriculumPublicRow, track: Track): CurriculumWeek => {
  const title =
    track === "child" ? row.kids_title :
    row.weekly_theme;
  return {
    id: String(row.week_number),
    week_number: row.week_number,
    block_number: row.block_number,
    block_theme: row.block_theme,
    weekly_theme: row.weekly_theme,
    title,
    // The list only needs titles/themes; the paid body (video, notes) is fetched
    // per-week behind RLS on the week page.
    source: null,
    notes: row.core_learning ?? null,
    track_titles: {
      adult: row.adult_video_title ?? null,
      teen: row.teen_video_title ?? null,
      child: row.kids_title ?? null,
    },
  };
};

export const useCurriculumWeeks = (track: Track) => {
  const [weeks, setWeeks] = useState<CurriculumWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Public browse (titles + description for all weeks) — bypasses the paid
      // RLS on curriculum_weeks so the padlocked future weeks still list.
      const { data } = await db.rpc("curriculum_public");
      if (cancelled) return;
      setWeeks((data || []).map(r => resolve(r, track)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [track]);

  return { weeks, loading };
};

// Resolve "today's / this week's" row for the member. Prefers a scheduled_sessions
// row for today; otherwise falls back to week 1. Returns null while loading.
export const useCurrentCurriculumWeek = (track: Track) => {
  const { weeks, loading } = useCurriculumWeeks(track);
  const [scheduledWeek, setScheduledWeek] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const trackLabel = track === "teen" ? "Teen" : track === "child" ? "Child" : "Adult";
    db
      .from("scheduled_sessions")
      .select("week_number")
      .lte("session_date", today)
      .eq("track", trackLabel)
      .order("session_date", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }: { data: { week_number: number } | null }) => {
        setScheduledWeek(data?.week_number ?? null);
      });
  }, [track]);

  if (loading || weeks.length === 0) return { current: null, all: weeks, loading };
  const targetNumber = scheduledWeek ?? 1;
  const current = weeks.find((w) => w.week_number === targetNumber) ?? weeks[0];
  return { current, all: weeks, loading: false };
};
