import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, Play, Presentation, Film, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type Row = { week_number: number; theme_title: string; phase_name: string; session_title: string };

const Library = () => {
  const { user, role, isStaff } = useAuth();
  const isFacilitator = isStaff;
  const [weeks, setWeeks] = useState<Row[]>([]);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: sessions }, { data: unl }, { data: comp }] = await Promise.all([
        (supabase as any).from("mindcast_live_sessions_public").select("week_number, theme_title, phase_name, session_title").eq("audience", "Adult").order("week_number"),
        isStaff ? Promise.resolve({ data: [] }) : (supabase as any).from("unlocked_lessons").select("week_number").eq("user_id", user.id),
        (supabase as any).from("lesson_completions").select("week_number").eq("user_id", user.id),
      ]);
      const map = new Map<number, Row>();
      (sessions || []).forEach((s: Row) => map.set(s.week_number, s));
      const all: Row[] = [];
      for (let i = 1; i <= 52; i++) {
        all.push(map.get(i) || { week_number: i, theme_title: "", phase_name: "", session_title: "" });
      }
      setWeeks(all);
      // Staff bypass — all 52 weeks unlocked
      if (isStaff) {
        setUnlocked(new Set(Array.from({ length: 52 }, (_, i) => i + 1)));
      } else {
        setUnlocked(new Set((unl || []).map((u: any) => u.week_number)));
      }
      setCompleted(new Set((comp || []).map((c: any) => c.week_number)));
    })();
  }, [user, isStaff]);

  const unlockedCount = unlocked.size;
  const completedCount = completed.size;

  const handleBulkGenerate = async () => {
    setBulkRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-generate-videos", { body: {} });
      if (error) throw error;
      const d = data as any;
      toast({
        title: `Queued ${d.queued_this_run} renders`,
        description: `${d.already_done} already done · ${d.already_processing} already in flight · ${d.remaining_after_this_run} left. Re-click after a few minutes to continue.`,
      });
    } catch (e: any) {
      toast({ title: "Bulk generate failed", description: e.message });
    } finally {
      setBulkRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-2">Mindcast LIVE</p>
            <h1 className="font-display text-6xl text-[hsl(var(--navy))] tracking-wider">LESSON LIBRARY</h1>
            <p className="text-[hsl(var(--navy-mid))] font-body text-sm mt-2">
              {completedCount} of 52 completed · {unlockedCount} unlocked
            </p>
          </div>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="h-2 rounded-full bg-[hsl(var(--warm-border))] overflow-hidden mt-12">
              <div className="h-full bg-[hsl(var(--blue))] transition-all" style={{ width: `${(completedCount / 52) * 100}%` }} />
            </div>
          </div>
          {isFacilitator && (
            <button
              onClick={handleBulkGenerate}
              disabled={bulkRunning}
              title="Queue Shotstack renders for every lesson that has a film script and no MP4 yet"
              className="self-start flex items-center gap-2 px-4 py-2 bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-mid))] disabled:opacity-40 text-white text-[11px] font-body tracking-widest uppercase rounded-sm"
            >
              <Film size={13} />{bulkRunning ? "Queueing…" : "Generate all videos"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {weeks.map(w => {
            const isUnlocked = unlocked.has(w.week_number);
            const isCompleted = completed.has(w.week_number);
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
                {isCompleted && (
                  <p className="text-[10px] text-[hsl(var(--blue))] font-body tracking-widest uppercase mb-2">✓ Completed</p>
                )}
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
                  {isFacilitator && (
                    <Link to={`/mindcast-live/edit/${w.week_number}`}
                      className="flex items-center justify-center gap-1.5 border border-[hsl(var(--navy))]/20 hover:border-[hsl(var(--navy))]/50 text-[hsl(var(--navy))] text-[11px] font-body tracking-widest uppercase py-2 rounded-sm transition-colors">
                      <Pencil size={11} />Edit lesson
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
