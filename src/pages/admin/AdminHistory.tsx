import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { db } from "@/lib/db";
import { Search, ChevronDown, ChevronUp, CalendarDays } from "lucide-react";

type Scheduled = {
  id: string; session_date: string; track: string; week_number: number;
  room: string | null; session_code: string | null; status: string;
};

const AdminHistory = ({ embedded = false }: { embedded?: boolean }) => {
  const [rows, setRows] = useState<Scheduled[]>([]);
  const [themes, setThemes] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: sched }, { data: ci }, { data: lessons }] = await Promise.all([
        db.from("scheduled_sessions")
          .select("id, session_date, track, week_number, room, session_code, status")
          .order("session_date", { ascending: false }).limit(150),
        db.from("check_ins").select("scheduled_session_id").not("scheduled_session_id", "is", null).limit(5000),
        db.from("mindcast_live_sessions").select("week_number, audience, theme_title").limit(200),
      ]);
      setRows(sched || []);
      const c: Record<string, number> = {};
      (ci || []).forEach((r: { scheduled_session_id: string | null }) => {
        if (r.scheduled_session_id) c[r.scheduled_session_id] = (c[r.scheduled_session_id] || 0) + 1;
      });
      setCounts(c);
      const t: Record<string, string> = {};
      (lessons || []).forEach((l: { week_number: number; audience: string; theme_title: string | null }) => {
        t[`${l.week_number}-${l.audience}`] = l.theme_title || "";
      });
      setThemes(t);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((s) => {
    if (trackFilter !== "all" && s.track !== trackFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const theme = (themes[`${s.week_number}-${s.track}`] || "").toLowerCase();
      if (!String(s.week_number).includes(q) && !theme.includes(q) && !(s.room || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, trackFilter, search, themes]);

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <h1 className="font-display text-2xl font-bold text-primary mb-2">Session History</h1>
        <p className="text-foreground/40 text-sm font-body mb-6">Every scheduled session across the three tracks, with live attendance.</p>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search week, theme or room..." className="w-full bg-transparent border border-foreground/10 text-foreground text-sm font-body py-2.5 pl-9 pr-3 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/15" />
          </div>
          <select value={trackFilter} onChange={(e) => setTrackFilter(e.target.value)} className="bg-background border border-foreground/10 text-foreground/60 text-xs font-body px-3 focus:outline-none">
            <option value="all">All tracks</option>
            <option value="Adult">Adult</option>
            <option value="Teen">Teen</option>
            <option value="Child">Child</option>
          </select>
        </div>

        {loading ? (
          <p className="text-foreground/30 text-sm font-body text-center py-8 animate-pulse">Loading sessions…</p>
        ) : (
          <div className="space-y-1">
            {filtered.map((s) => (
              <div key={s.id} className="border border-foreground/[0.04] hover:border-foreground/10 transition-colors">
                <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="w-full flex items-center gap-4 px-4 py-3 text-left">
                  <CalendarDays size={14} className="text-foreground/25 shrink-0" />
                  <span className="text-foreground/50 text-xs font-body w-24 shrink-0">{s.session_date}</span>
                  <span className="text-foreground/30 text-sm font-body w-10 shrink-0">W{s.week_number}</span>
                  <span className="text-foreground text-sm font-body flex-1 truncate">{themes[`${s.week_number}-${s.track}`] || s.track}</span>
                  <span className="text-foreground/40 text-[10px] font-body uppercase tracking-widest w-12 text-right">{s.track}</span>
                  <span className="text-foreground/15 text-[9px] font-body w-20 text-right">{counts[s.id] || 0} check-ins</span>
                  {expanded === s.id ? <ChevronUp size={14} className="text-foreground/20" /> : <ChevronDown size={14} className="text-foreground/20" />}
                </button>
                {expanded === s.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-foreground/[0.04] space-y-2 text-xs font-body">
                    <p className="text-foreground/40">Status <span className="text-foreground/70">{s.status}</span>{s.room ? <> Â· Room <span className="text-foreground/70">{s.room}</span></> : null}{s.session_code ? <> Â· Join code <span className="text-foreground/70">{s.session_code}</span></> : null}</p>
                    <Link to={`/mindcast-live/facilitate/${s.week_number}?a=${s.track}`} className="inline-block text-blue-400/70 hover:text-blue-400">
                      Open the Week {s.week_number} {s.track} deck →
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <p className="text-foreground/20 text-sm font-body text-center py-8">No scheduled sessions yet — set them up under Sessions → Schedule.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistory;