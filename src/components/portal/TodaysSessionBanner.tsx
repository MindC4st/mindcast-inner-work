import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";


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
    db
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
    <div className="mb-8 border border-primary/25 bg-primary/5 rounded-sm p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-body font-semibold uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
          <Radio size={12} strokeWidth={1.5} /> {isLive ? "Live now" : "Today"} · {row.track}
        </p>
        <p className="font-display text-2xl tracking-wider text-foreground mt-2">WEEK {row.week_number}</p>
        {row.room && <p className="text-xs text-foreground/50 font-body mt-1">{row.room}</p>}
      </div>
      {isLive ? (
        <Link
          to={`/live/${row.session_code}`}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-body font-semibold tracking-widest uppercase px-5 py-3 rounded-sm shrink-0"
        >
          Join live
        </Link>
      ) : (
        <span className="text-[10px] font-body tracking-widest uppercase text-foreground/40 shrink-0">Starts soon</span>
      )}
    </div>
  );
};

export default TodaysSessionBanner;
