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
      const data = JSON.parse(saved);
      return Object.values(data).some((v: any) => v?.locked);
    } catch { return false; }
  };

  return (
    <div className="border-2 border-silver/10 p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-silver/40 text-[10px] tracking-[0.3em]">{seriesTitle}</span>
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
                  ? "border-silver bg-silver/10 text-silver"
                  : done
                  ? "border-silver/30 text-silver/50"
                  : "border-silver/10 text-silver/20 hover:border-silver/30"
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
