import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { WEEKS } from "@/data/weekData";

// Week 1 is live for the pilot — rest unlock progressively
const LIVE_WEEKS = new Set([1]);

const PortalWeeks = () => {
  return (
    <PortalLayout>
      <h1 className="heading-display text-3xl text-primary mb-2">MY SESSIONS</h1>
      <p className="text-sm text-muted-foreground mb-8 font-body">All 10 sessions of Term 1 — Taupō Pilot.</p>
      <div className="space-y-3">
        {WEEKS.map((w) => {
          const isLive = LIVE_WEEKS.has(w.number);
          return isLive ? (
            <Link key={w.number} to={`/portal/week/${w.number}`} className="block border-2 border-primary/10 p-4 md:p-6 hover:border-primary transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="font-display text-sm tracking-wider text-primary">SESSION {w.number}: {w.title.toUpperCase()}</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-1">{w.episode}</p>
                </div>
                <span className="text-[10px] tracking-widest text-primary/40 group-hover:text-primary/70 transition-colors shrink-0">OPEN →</span>
              </div>
            </Link>
          ) : (
            <div key={w.number} className="border-2 border-foreground/[0.04] p-4 md:p-6 opacity-40 cursor-default">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="font-display text-sm tracking-wider text-foreground/50">SESSION {w.number}: {w.title.toUpperCase()}</h2>
                  <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-1">{w.episode}</p>
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
