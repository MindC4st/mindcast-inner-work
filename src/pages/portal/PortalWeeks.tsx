import { Link } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import { WEEKS } from "@/data/weekData";

const PortalWeeks = () => {
  return (
    <PortalLayout>
      <h1 className="heading-display text-3xl text-primary mb-2">MY WEEKS</h1>
      <p className="text-sm text-muted-foreground mb-8 font-body">All 10 weeks of Term 2 — Wired.</p>
      <div className="space-y-3">
        {WEEKS.map((w) => (
          <Link key={w.number} to={`/portal/week/${w.number}`} className="block border-2 border-primary/10 p-4 md:p-6 hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm tracking-wider text-primary">WEEK {w.number}: {w.title.toUpperCase()}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-1">{w.episode}</p>
              </div>
              <span className="text-[10px] tracking-widest text-primary/40">OPEN →</span>
            </div>
          </Link>
        ))}
      </div>
    </PortalLayout>
  );
};

export default PortalWeeks;
