// Which session is running in the room right now?
//
// `scheduled_sessions` holds one row per (session_date, track). The bracelet
// dashboard uses this to offer "Open Today's Session", and the staff tap card
// uses it so "Back to slideshow" returns to the running session instead of
// dumping the tablet back on the library list.
//
// Prefers the member's own track (Adult / Teen / Child) and a status of
// 'live'; falls back to any session scheduled for today so the button still
// works before the facilitator has pressed start.

import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export interface TodaysSession {
  id: string;
  weekNumber: number;
  track: string;
  room: string | null;
  status: string;
  startsAt: string | null;
}

/** profiles.age_group → scheduled_sessions.track */
export const trackForAgeGroup = (ageGroup?: string | null): string | null => {
  const g = (ageGroup || "").trim().toLowerCase();
  if (g === "adult" || g === "adults") return "Adult";
  if (g === "teen" || g === "teens" || g === "youth") return "Teen";
  if (g === "child" || g === "children" || g === "kid" || g === "kids") return "Child";
  return null;
};

/** Local calendar date as YYYY-MM-DD (session_date is a date, not a timestamp). */
export const localDateKey = (d = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const useTodaysSession = (ageGroup?: string | null) => {
  const [session, setSession] = useState<TodaysSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await db
        .from("scheduled_sessions")
        .select("id, week_number, track, room, status, starts_at")
        .eq("session_date", localDateKey())
        .in("status", ["live", "scheduled"]);

      if (cancelled) return;

      const rows = data ?? [];
      const preferred = trackForAgeGroup(ageGroup);
      // Best match first: my track and live > my track > anything live > anything.
      const pick =
        rows.find((r) => r.track === preferred && r.status === "live") ??
        rows.find((r) => r.track === preferred) ??
        rows.find((r) => r.status === "live") ??
        rows[0] ??
        null;

      setSession(
        pick
          ? {
              id: pick.id,
              weekNumber: pick.week_number,
              track: pick.track,
              room: pick.room,
              status: pick.status,
              startsAt: pick.starts_at,
            }
          : null,
      );
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [ageGroup]);

  return { session, loading };
};
