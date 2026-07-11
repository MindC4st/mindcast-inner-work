import { Link } from "react-router-dom";
import { Lock, PlayCircle } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCurriculumWeeks, trackForAgeGroup } from "@/hooks/useCurriculumWeeks";

// Full 52-week grid. Pulls from `curriculum_weeks` (adult/teen/child columns
// resolved by track) so it stays in sync with what admins publish, instead of
// the frozen 10-session pilot array.

const PortalWeeks = () => {
  const { profile } = useAuth();
  const track = trackForAgeGroup((profile as any)?.age_group);
  const { weeks, loading } = useCurriculumWeeks(track);

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
          return hasContent ? (
            <Link
              key={w.week_number}
              to={`/portal/week/${w.week_number}`}
              className="block border border-primary/15 rounded-sm p-4 md:p-6 hover:border-primary transition-colors group bg-foreground/[0.02]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-body uppercase tracking-widest text-primary/70 mb-1">
                    Week {w.week_number}{w.block_theme ? ` · ${w.block_theme}` : ""}
                  </p>
                  <h2 className="font-display text-base md:text-lg tracking-wider text-foreground line-clamp-1">
                    {w.title!.toUpperCase()}
                  </h2>
                  {w.source && (
                    <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-1">{w.source}</p>
                  )}
                </div>
                <PlayCircle size={16} strokeWidth={1.5} className="text-primary/50 group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          ) : (
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
        })}
      </div>
    </PortalLayout>
  );
};

export default PortalWeeks;
