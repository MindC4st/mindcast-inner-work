import { Link } from "react-router-dom";
import { Check } from "lucide-react";

interface SeriesNavProps {
  seriesTitle: string;
  sessions: { id: string; label: string; path: string }[];
  currentSessionId: string;
}

const SeriesNav = ({ seriesTitle, sessions, currentSessionId }: SeriesNavProps) => {
  const isComplete = (id: string) => {
    try {
      const saved = localStorage.getItem(`mindcast_session_${id}_progress`);
      if (!saved) return false;
      const data = JSON.parse(saved) as Record<string, { locked?: boolean } | null | undefined>;
      return Object.values(data).some((v) => v?.locked);
    } catch { return false; }
  };

  return (
    <div className="border-2 border-cream/10 p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-cream/40 text-[10px] tracking-[0.3em]">{seriesTitle}</span>
      </div>
      <div className="flex gap-2">
        {sessions.map((s) => {
          const isCurrent = s.id === currentSessionId;
          const done = isComplete(s.id);
          return (
            <Link
              key={s.id}
              to={s.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest border transition-colors ${
                isCurrent
                  ? "border-cream bg-cream/10 text-cream"
                  : done
                  ? "border-cream/30 text-cream/50"
                  : "border-cream/10 text-cream/20 hover:border-cream/30"
              }`}
            >
              {done && <Check size={10} />}
              {s.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SeriesNav;
