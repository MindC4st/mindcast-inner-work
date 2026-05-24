import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, Play, Presentation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Row = { week_number: number; theme_title: string; phase_name: string; session_title: string };

const Library = () => {
  const { role } = useAuth();
  const isFacilitator = role === "facilitator";
  const [weeks, setWeeks] = useState<Row[]>([]);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: sessions }, { data: unl }] = await Promise.all([
        (supabase as any).from("mindcast_live_sessions").select("week_number, theme_title, phase_name, session_title").eq("audience", "Adult").order("week_number"),
        (supabase as any).from("unlocked_lessons").select("week_number"),
      ]);
      // Build full 52-week grid: use data we have; pad missing
      const map = new Map<number, Row>();
      (sessions || []).forEach((s: Row) => map.set(s.week_number, s));
      const all: Row[] = [];
      for (let i = 1; i <= 52; i++) {
        all.push(map.get(i) || { week_number: i, theme_title: "", phase_name: "", session_title: "" });
      }
      setWeeks(all);
      setUnlocked(new Set((unl || []).map((u: any) => u.week_number)));
    })();
  }, []);

  const unlockedCount = unlocked.size;

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-2">Mindcast LIVE</p>
            <h1 className="font-display text-6xl text-[hsl(var(--navy))] tracking-wider">LESSON LIBRARY</h1>
            <p className="text-[hsl(var(--navy-mid))] font-body text-sm mt-2">{unlockedCount} of 52 lessons unlocked</p>
          </div>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="h-2 rounded-full bg-[hsl(var(--warm-border))] overflow-hidden mt-12">
              <div className="h-full bg-[hsl(var(--blue))] transition-all" style={{ width: `${(unlockedCount / 52) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {weeks.map(w => {
            const isUnlocked = unlocked.has(w.week_number);
            const hasContent = !!w.theme_title;
            return (
              <div key={w.week_number}
                className={`relative border rounded-sm p-5 transition-all ${
                  isUnlocked
                    ? "bg-white border-[hsl(var(--warm-border))] hover:border-[hsl(var(--blue))] hover:shadow-lg"
                    : "bg-[hsl(var(--warm-border))]/30 border-[hsl(var(--warm-border))]"
                } ${!hasContent ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-display text-3xl text-[hsl(var(--blue))] tracking-wider">W{String(w.week_number).padStart(2, "0")}</span>
                  {isUnlocked ? <Unlock size={14} className="text-[hsl(var(--blue))]" /> : <Lock size={14} className="text-[hsl(var(--navy-mid))]/40" />}
                </div>
                <p className="text-[hsl(var(--bronze))] text-[10px] tracking-widest font-body uppercase mb-1">{w.phase_name || "Coming soon"}</p>
                <h3 className={`font-display text-xl tracking-wide mb-1 ${isUnlocked ? "text-[hsl(var(--navy))]" : "text-[hsl(var(--navy-mid))]/50"}`}>
                  {w.theme_title || "TBA"}
                </h3>
                <p className={`font-body text-xs italic mb-4 min-h-[2rem] ${isUnlocked ? "text-[hsl(var(--navy-mid))]" : "text-[hsl(var(--navy-mid))]/40"}`}>
                  {w.session_title}
                </p>
                <div className="flex flex-col gap-2">
                  {isUnlocked && hasContent && (
                    <Link to={`/mindcast-live/lesson/${w.week_number}`}
                      className="flex items-center justify-center gap-1.5 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] text-white text-[11px] font-body tracking-widest uppercase py-2 rounded-sm transition-colors">
                      <Play size={11} />Watch
                    </Link>
                  )}
                  {!isUnlocked && hasContent && (
                    <p className="text-center text-[10px] text-[hsl(var(--navy-mid))]/50 font-body tracking-widest uppercase py-2">Available after live session</p>
                  )}
                  {isFacilitator && hasContent && (
                    <Link to={`/mindcast-live/facilitate/${w.week_number}`}
                      className="flex items-center justify-center gap-1.5 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-mid))] text-white text-[11px] font-body tracking-widest uppercase py-2 rounded-sm transition-colors">
                      <Presentation size={11} />Facilitate
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Library;
