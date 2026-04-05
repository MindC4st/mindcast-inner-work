import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react";

const AdminHistory = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, { checkins: number; workbooks: number }>>({});

  useEffect(() => {
    supabase.from("sessions").select("*").eq("status", "completed").order("session_number", { ascending: false }).then(({ data }) => {
      setSessions(data || []);
      // Fetch stats for each session
      (data || []).forEach(async (s: any) => {
        const [ci, wb] = await Promise.all([
          supabase.from("check_ins").select("id", { count: "exact", head: true }).eq("session_id", s.id),
          supabase.from("workbook_entries").select("id", { count: "exact", head: true }).eq("session_id", s.id),
        ]);
        setStats((prev) => ({ ...prev, [s.id]: { checkins: ci.count || 0, workbooks: wb.count || 0 } }));
      });
    });
  }, []);

  const filtered = sessions.filter((s) => {
    if (ageFilter !== "all" && (s.age_group || "adult") !== ageFilter) return false;
    if (search && !s.title?.toLowerCase().includes(search.toLowerCase()) && !String(s.session_number).includes(search)) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: "#0D0B14", color: "#fff" }}>
      <nav className="flex items-center px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-white/30 text-[10px] tracking-[0.12em] font-body hover:text-white/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <h1 className="font-display text-2xl font-bold text-white mb-8">Session History</h1>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or week..." className="w-full bg-transparent border border-white/10 text-white text-sm font-body py-2.5 pl-9 pr-3 focus:outline-none focus:border-white/25 placeholder:text-white/15" />
          </div>
          <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="bg-[#0D0B14] border border-white/10 text-white/60 text-xs font-body px-3 focus:outline-none">
            <option value="all">All ages</option>
            <option value="adult">Adult</option>
            <option value="teen">Teen</option>
            <option value="child">Child</option>
          </select>
        </div>

        <div className="space-y-1">
          {filtered.map((s) => (
            <div key={s.id} className="border border-white/[0.04] hover:border-white/10 transition-colors">
              <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="w-full flex items-center gap-4 px-4 py-3 text-left">
                <span className="text-white/30 text-sm font-body w-12">W{s.session_number}</span>
                <span className="text-white/20 text-xs font-body w-24">{s.session_date || "—"}</span>
                <span className="text-white text-sm font-body flex-1 truncate">{s.title}</span>
                <span className="text-white/15 text-[9px] font-body">{stats[s.id]?.checkins || 0} check-ins · {stats[s.id]?.workbooks || 0} workbooks</span>
                {expanded === s.id ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
              </button>
              {expanded === s.id && (
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] space-y-3">
                  {s.video_url && <p className="text-xs font-body"><span className="text-white/30">Video: </span><a href={s.video_url} target="_blank" className="text-blue-400/60 hover:text-blue-400">{s.video_url}</a></p>}
                  {s.ai_questions && (
                    <div className="space-y-2">
                      <p className="text-[9px] tracking-[0.12em] text-white/20 font-body">AI QUESTIONS</p>
                      {["question_1", "question_2", "question_3"].map((k, i) => s.ai_questions[k] && (
                        <p key={k} className="text-white/40 text-xs font-body"><span className="text-white/20">Q{i + 1}:</span> {s.ai_questions[k]}</p>
                      ))}
                    </div>
                  )}
                  {s.admin_notes && <p className="text-xs font-body text-white/25"><span className="text-white/15">Notes: </span>{s.admin_notes}</p>}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-white/20 text-sm font-body text-center py-8">No completed sessions found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminHistory;
