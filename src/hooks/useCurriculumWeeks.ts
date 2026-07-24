import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
};

export const trackForAgeGroup = (age?: string | null): Track => {
  const a = (age || "adult").toLowerCase();
  if (a === "teen") return "teen";
  if (a === "child" || a === "kids") return "child";
  return "adult";
};

const resolve = (row: any, track: Track): CurriculumWeek => {
  const title =
    track === "teen" ? row.teen_video_title :
    track === "child" ? row.kids_title :
    row.adult_video_title;
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
      const { data } = await (supabase as any).rpc("curriculum_public");
      if (cancelled) return;
      setWeeks((data || []).map((r: any) => resolve(r, track)));
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
    (supabase as any)
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
