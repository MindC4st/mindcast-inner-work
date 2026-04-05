import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Radio, Users, BookOpen, Clock } from "lucide-react";

const AdminLive = () => {
  const [session, setSession] = useState<any>(null);
  const [checkinCount, setCheckinCount] = useState(0);
  const [workbookCount, setWorkbookCount] = useState(0);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle().then(({ data }) => setSession(data));
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchStats = async () => {
      const [ci, wb, recent] = await Promise.all([
        supabase.from("check_ins").select("id", { count: "exact", head: true }).eq("session_id", session.id),
        supabase.from("workbook_entries").select("id", { count: "exact", head: true }).eq("session_id", session.id),
        supabase.from("check_ins").select("*").eq("session_id", session.id).order("checked_in_at", { ascending: false }).limit(10),
      ]);
      setCheckinCount(ci.count || 0);
      setWorkbookCount(wb.count || 0);
      setRecentCheckins(recent.data || []);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!startedAt) return;
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${m}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const endSession = async () => {
    if (!session) return;
    await supabase.from("sessions").update({ status: "completed" } as any).eq("id", session.id);
    setSession({ ...session, status: "completed" });
  };

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center" className="bg-background">
      <div className="text-center">
        <p className="text-foreground/30 font-body text-sm mb-4">No active session.</p>
        <Link to="/admin/sessions" className="text-foreground/20 text-xs font-body hover:text-foreground/40">Go to sessions →</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" className="bg-background text-foreground">
      <nav className="flex items-center px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-foreground/30 text-[10px] tracking-[0.12em] font-body hover:text-foreground/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-3 mb-8">
          <Radio size={16} className="text-emerald-400 animate-pulse" />
          <h1 className="font-display text-2xl font-bold text-foreground">Live Session</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Stats */}
          <div className="space-y-4">
            <div className="border border-foreground/[0.06] p-5">
              <p className="text-foreground/30 text-[10px] tracking-[0.12em] font-body mb-1">SESSION</p>
              <p className="text-foreground font-display text-lg font-bold">{session.title}</p>
              <p className="text-foreground/20 text-xs font-body">Week {session.session_number}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="border border-foreground/[0.06] p-4 text-center">
                <Users size={16} className="mx-auto text-foreground/20 mb-2" />
                <p className="text-foreground text-xl font-display font-bold">{checkinCount}</p>
                <p className="text-foreground/20 text-[9px] font-body">CHECK-INS</p>
              </div>
              <div className="border border-foreground/[0.06] p-4 text-center">
                <BookOpen size={16} className="mx-auto text-foreground/20 mb-2" />
                <p className="text-foreground text-xl font-display font-bold">{workbookCount}</p>
                <p className="text-foreground/20 text-[9px] font-body">WORKBOOKS</p>
              </div>
              <div className="border border-foreground/[0.06] p-4 text-center">
                <Clock size={16} className="mx-auto text-foreground/20 mb-2" />
                <p className="text-foreground text-xl font-display font-bold">{elapsed || "—"}</p>
                <p className="text-foreground/20 text-[9px] font-body">ELAPSED</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-3">
            {!startedAt ? (
              <button onClick={() => setStartedAt(new Date().toISOString())} className="w-full py-4 bg-emerald-500/20 text-emerald-400 text-xs tracking-[0.15em] font-display font-bold hover:bg-emerald-500/30 transition-colors">
                START SESSION
              </button>
            ) : (
              <button onClick={endSession} className="w-full py-4 bg-red-500/10 text-red-400/60 text-xs tracking-[0.15em] font-display font-bold hover:bg-red-500/20 transition-colors">
                END SESSION
              </button>
            )}
            <a href={`/admin/present/${session.id}`} target="_blank" className="block w-full py-3 text-center bg-foreground/10 text-foreground text-xs tracking-[0.1em] font-body font-semibold hover:bg-foreground/20 transition-colors">
              🖥 Open Presentation ↗
            </a>
            <a href={`/display?session=${session.id}`} target="_blank" className="block w-full py-3 text-center border border-foreground/10 text-foreground/40 text-xs tracking-[0.1em] font-body hover:border-foreground/20 transition-colors">
              Show Check-in Wall ↗
            </a>
            <a href={`/display/goals?session=${session.id}`} target="_blank" className="block w-full py-3 text-center border border-foreground/10 text-foreground/40 text-xs tracking-[0.1em] font-body hover:border-foreground/20 transition-colors">
              Show Goal Wall ↗
            </a>
            <a href={`/display/wordcloud?session=${session.id}`} target="_blank" className="block w-full py-3 text-center border border-foreground/10 text-foreground/40 text-xs tracking-[0.1em] font-body hover:border-foreground/20 transition-colors">
              Show Word Cloud ↗
            </a>
            {session.session_code && (
              <div className="border border-foreground/[0.06] p-4 text-center mt-4">
                <p className="text-foreground/20 text-[9px] tracking-[0.15em] font-body mb-1">SESSION CODE</p>
                <p className="font-mono text-2xl font-bold text-foreground/60 tracking-widest">{session.session_code}</p>
                <p className="text-foreground/15 text-[9px] font-body mt-1">mindcast.co.nz/join</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent check-ins */}
        <div className="mt-10">
          <h2 className="text-[10px] tracking-[0.15em] text-foreground/30 font-body mb-4">RECENT CHECK-INS</h2>
          <div className="space-y-1">
            {recentCheckins.map((ci) => (
              <div key={ci.id} className="flex items-center gap-4 px-4 py-3 border border-foreground/[0.04]">
                <span className="text-foreground text-sm font-body">{ci.display_name}</span>
                <span className="text-foreground/20 text-xs font-body flex-1 truncate">{ci.welcome_note || ""}</span>
                <span className="text-foreground/10 text-[9px] font-body">{new Date(ci.checked_in_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {recentCheckins.length === 0 && <p className="text-foreground/15 text-xs font-body text-center py-4">No check-ins yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLive;
