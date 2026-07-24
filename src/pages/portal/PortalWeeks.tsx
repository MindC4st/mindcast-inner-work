import { Link } from "react-router-dom";
import { Lock, PlayCircle, Clock, CheckCircle2 } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCurriculumWeeks, trackForAgeGroup } from "@/hooks/useCurriculumWeeks";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { useEntitlement } from "@/hooks/useEntitlement";

// Full 52-week grid. Pulls from `curriculum_weeks` (adult/teen/child columns
// resolved by track). Each week shows its live state — open / opens-on / members
// only — from the program schedule + membership. Rows always link to the week
// page, which renders the matching gate.

const PortalWeeks = () => {
  const { profile } = useAuth();
  const track = trackForAgeGroup((profile as any)?.age_group);
  const { weeks, loading } = useCurriculumWeeks(track);
  const { isUnlocked, unlockDate, currentWeek } = useProgramSchedule();
  const { isMember } = useEntitlement();

  return (
    <PortalLayout>
      <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Coursebook</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-2">MY SESSIONS</h1>
      <p className="text-sm text-muted-foreground mb-8 font-body">
        All 52 weeks of the {track === "teen" ? "Teen" : track === "child" ? "Child" : "Adult"} track.
      </p>

      {loading && (
        <p className="text-xs font-body uppercase tracking-widest text-foreground/40 animate-pulse">Loading…</p>
      )}

      <div className="space-y-3">
        {weeks.map((w) => {
          const hasContent = !!w.title;
          if (!hasContent) {
            return (
              <div key={w.week_number} className="border border-foreground/[0.06] rounded-sm p-4 md:p-6 opacity-50 cursor-default bg-foreground/[0.01]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-body uppercase tracking-widest text-foreground/40 mb-1">Week {w.week_number}</p>
                    <h2 className="font-display text-base md:text-lg tracking-wider text-foreground/50">COMING SOON</h2>
                  </div>
                  <Lock size={13} strokeWidth={1.5} className="text-foreground/30 shrink-0" />
                </div>
              </div>
            );
          }
          const unlocked = isUnlocked(w.week_number);
          const isCurrent = currentWeek === w.week_number;
          const opensOn = unlockDate(w.week_number);
          let status: { icon: JSX.Element; label: string; cls: string };
          if (!isMember) status = { icon: <Lock size={13} />, label: "Members only", cls: "text-foreground/40" };
          else if (unlocked) status = { icon: <PlayCircle size={16} strokeWidth={1.5} />, label: isCurrent ? "This week" : "Open", cls: "text-primary" };
          else status = { icon: <Clock size={13} />, label: opensOn ? `Opens ${opensOn.toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : "Opens soon", cls: "text-foreground/40" };

          return (
            <Link key={w.week_number} to={`/portal/week/${w.week_number}`}
              className={`block border rounded-sm p-4 md:p-6 transition-colors group ${isCurrent ? "border-primary/50 bg-primary/[0.05]" : "border-primary/15 hover:border-primary bg-foreground/[0.02]"}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-body uppercase tracking-widest text-primary/70 mb-1">
                    Week {w.week_number}{w.block_theme ? ` · ${w.block_theme}` : ""}
                  </p>
                  <h2 className={`font-display text-base md:text-lg tracking-wider line-clamp-1 ${unlocked && isMember ? "text-foreground" : "text-foreground/60"}`}>
                    {w.title!.toUpperCase()}
                  </h2>
                  {w.source && <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-1">{w.source}</p>}
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-body tracking-widest uppercase ${status.cls}`}>
                  {isCurrent && unlocked ? <CheckCircle2 size={16} strokeWidth={1.5} /> : status.icon}
                  <span className="hidden sm:inline">{status.label}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </PortalLayout>
  );
};

export default PortalWeeks;
