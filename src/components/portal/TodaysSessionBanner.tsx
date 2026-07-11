import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Shows today's scheduled session for the member's track (from scheduled_sessions).
// Renders nothing if there isn't one today. Links straight into the live room
// when the facilitator has marked it live.

const trackForAgeGroup = (age?: string | null): string => {
  const a = (age || "adult").toLowerCase();
  if (a === "teen") return "Teen";
  if (a === "child" || a === "kids") return "Child";
  return "Adult";
};

type Sched = { track: string; week_number: number; room: string | null; session_code: string | null; status: string };

const TodaysSessionBanner = () => {
  const { profile } = useAuth();
  const [row, setRow] = useState<Sched | null>(null);

  useEffect(() => {
    if (!profile) return;
    const today = new Date().toISOString().slice(0, 10);
    const track = trackForAgeGroup(profile.age_group);
    (supabase as any)
      .from("scheduled_sessions")
      .select("track, week_number, room, session_code, status")
      .eq("session_date", today)
      .eq("track", track)
      .neq("status", "cancelled")
      .maybeSingle()
      .then(({ data }: { data: Sched | null }) => setRow(data));
  }, [profile]);

  if (!row) return null;

  const isLive = row.status === "live" && row.session_code;

  return (
    <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5">
          <Radio size={13} /> {isLive ? "Live now" : "Today"} · {row.track}
        </p>
        <p className="text-sm mt-1 text-foreground">
          Week {row.week_number}{row.room ? ` · ${row.room}` : ""}
        </p>
      </div>
      {isLive ? (
        <Link to={`/live/${row.session_code}`} className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm shrink-0">
          Join live
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground shrink-0">Starts soon</span>
      )}
    </div>
  );
};

export default TodaysSessionBanner;
