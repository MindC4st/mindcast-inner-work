import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, Film, Loader2, Lock, Pencil, Play, Presentation, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import PortalLayout from "@/components/portal/PortalLayout";

type Row = { week_number: number; theme_title: string; phase_name: string; session_title: string };

const Library = () => {
  const { user, isStaff } = useAuth();
  const [weeks, setWeeks] = useState<Row[]>([]);
  const [unlocked, setUnlocked] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [bulkRunning, setBulkRunning] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: sessions }, { data: unlockedRows }, { data: completionRows }] = await Promise.all([
        db.from("mindcast_live_sessions_public").select("week_number, theme_title, phase_name, session_title").eq("audience", "Adult").order("week_number"),
        isStaff ? Promise.resolve({ data: [] }) : db.from("unlocked_lessons").select("week_number").eq("user_id", user.id),
        db.from("lesson_completions").select("week_number").eq("user_id", user.id),
      ]);
      const map = new Map<number, Row>();
      (sessions || []).forEach((session: Row) => map.set(session.week_number, session));
      setWeeks(Array.from({ length: 52 }, (_, index) => map.get(index + 1) || {
        week_number: index + 1,
        theme_title: "",
        phase_name: "",
        session_title: "",
      }));
      setUnlocked(isStaff
        ? new Set(Array.from({ length: 52 }, (_, index) => index + 1))
        : new Set((unlockedRows || []).map((row) => row.week_number)));
      setCompleted(new Set((completionRows || []).map((row) => row.week_number)));
      setLoading(false);
    })();
  }, [user, isStaff]);

  const handleBulkGenerate = async () => {
    setBulkRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-generate-videos", { body: {} });
      if (error) throw error;
      toast({
        title: `Queued ${data.queued_this_run} renders`,
        description: `${data.already_done} already done · ${data.already_processing} already in flight · ${data.remaining_after_this_run} left.`,
      });
    } catch (caught) {
      toast({ title: "Bulk generate failed", description: (caught as Error).message, variant: "destructive" });
    } finally {
      setBulkRunning(false);
    }
  };

  const completedCount = completed.size;
  const unlockedCount = unlocked.size;

  return (
    <PortalLayout wide>
      <section aria-labelledby="lesson-library-title">
        <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="portal-label mb-3">Mindcast Live</p>
            <h1 id="lesson-library-title" className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">Your 52-week coursebook</h1>
            <p className="mt-4 font-body text-sm leading-7 text-muted-foreground">
              Revisit unlocked lessons, continue your own coursebook, or prepare the room if you’re facilitating.
            </p>
          </div>

          {isStaff && (
            <div className="flex flex-wrap gap-2">
              <Link
                to="/mindcast-live/coursebook"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-foreground/10 bg-card px-4 font-body text-xs font-semibold text-foreground transition hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" /> Print coursebook
              </Link>
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={bulkRunning}
                title="Queue renders for lessons with a film script and no video"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-navy px-4 font-body text-xs font-semibold text-cream transition hover:bg-navy-mid focus:outline-none focus:ring-4 focus:ring-navy/15 disabled:opacity-40"
              >
                {bulkRunning ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Film className="h-4 w-4" aria-hidden="true" />}
                {bulkRunning ? "Queueing videos…" : "Generate missing videos"}
              </button>
            </div>
          )}
        </div>

        <div className="mb-8 rounded-2xl border border-foreground/[0.07] bg-card p-5 shadow-sm sm:flex sm:items-center sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl text-foreground">{completedCount}</span>
            <span className="font-body text-xs text-muted-foreground">of 52 completed</span>
          </div>
          <div className="mt-4 flex-1 sm:mt-0">
            <div
              className="h-2 overflow-hidden rounded-full bg-foreground/[0.07]"
              role="progressbar"
              aria-label="Coursebook completion"
              aria-valuemin={0}
              aria-valuemax={52}
              aria-valuenow={completedCount}
            >
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completedCount / 52) * 100}%` }} />
            </div>
            <p className="mt-2 font-body text-[11px] text-muted-foreground">{unlockedCount} weeks currently unlocked</p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
            <span className="ml-3 font-body text-sm text-muted-foreground">Loading your coursebook…</span>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {weeks.map((week) => {
              const isUnlocked = unlocked.has(week.week_number);
              const isCompleted = completed.has(week.week_number);
              const hasContent = Boolean(week.theme_title);
              return (
                <article
                  key={week.week_number}
                  className={`relative flex min-h-[270px] flex-col rounded-2xl border p-5 transition ${
                    isUnlocked ? "border-foreground/[0.08] bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg" : "border-foreground/[0.06] bg-foreground/[0.025]"
                  } ${!hasContent ? "opacity-60" : ""}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-primary">Week {String(week.week_number).padStart(2, "0")}</span>
                    {isCompleted ? <Check className="h-4 w-4 text-primary" aria-label="Completed" /> : isUnlocked ? <Unlock className="h-4 w-4 text-primary/60" aria-label="Unlocked" /> : <Lock className="h-4 w-4 text-muted-foreground/40" aria-label="Locked" />}
                  </div>
                  <p className="portal-label mb-2">{week.phase_name || "Coming soon"}</p>
                  <h2 className={`font-serif text-2xl leading-tight ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>{week.theme_title || "To be announced"}</h2>
                  <p className="mt-2 flex-1 font-body text-xs italic leading-5 text-muted-foreground">{week.session_title}</p>

                  <div className="mt-5 grid gap-2">
                    {isUnlocked && hasContent && (
                      <Link to={`/mindcast-live/lesson/${week.week_number}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 font-body text-xs font-semibold text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20">
                        <Play className="h-3.5 w-3.5" aria-hidden="true" /> Open lesson
                      </Link>
                    )}
                    {!isUnlocked && hasContent && <p className="py-2 text-center font-body text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Available after the live session</p>}
                    {isStaff && hasContent && (
                      <Link to={`/mindcast-live/facilitate/${week.week_number}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-navy px-3 font-body text-xs font-semibold text-cream focus:outline-none focus:ring-4 focus:ring-navy/15">
                        <Presentation className="h-3.5 w-3.5" aria-hidden="true" /> Facilitate
                      </Link>
                    )}
                    {isStaff && (
                      <Link to={`/mindcast-live/edit/${week.week_number}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-foreground/10 px-3 font-body text-xs font-semibold text-foreground hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit lesson
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PortalLayout>
  );
};

export default Library;
