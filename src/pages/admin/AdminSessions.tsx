import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft } from "lucide-react";

const AdminSessions = () => {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/"); return; }
    supabase.from("profiles").select("is_admin").eq("user_id", user.id).single().then(({ data }) => {
      if (!data?.is_admin) { toast({ title: "Access denied", variant: "destructive" }); navigate("/"); }
    });
    fetchSessions();
  }, [user, authLoading]);

  const fetchSessions = async () => {
    const { data } = await supabase.from("sessions").select("*").order("session_number", { ascending: true });
    setSessions(data || []);
    setLoading(false);
  };

  const setActive = async (id: string) => {
    // Set all active sessions to completed, then set this one to active
    await supabase.from("sessions").update({ status: "completed" } as any).eq("status", "active");
    await supabase.from("sessions").update({ status: "active" } as any).eq("id", id);
    toast({ title: "Session activated", description: "This is now the live session." });
    fetchSessions();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-white/10 text-white/40",
      active: "bg-emerald-500/20 text-emerald-400",
      completed: "bg-white/5 text-white/20",
    };
    return (
      <span className={`text-[9px] tracking-[0.1em] font-body px-2 py-0.5 ${colors[status] || colors.draft}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen" className="bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-white/30 text-[10px] tracking-[0.12em] font-body hover:text-white/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
        <Link to="/admin/sessions/new" className="flex items-center gap-2 text-xs tracking-[0.12em] font-body text-white/60 hover:text-white border border-white/10 px-4 py-2 hover:border-white/25 transition-colors">
          <Plus size={14} /> NEW SESSION
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <h1 className="font-display text-2xl font-bold text-white mb-8">Sessions</h1>

        {loading ? (
          <p className="text-white/20 text-sm font-body animate-pulse">Loading...</p>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[60px_100px_1fr_100px_80px_120px] gap-3 px-4 py-2 text-[9px] tracking-[0.12em] text-white/20 font-body">
              <span>WEEK</span><span>DATE</span><span>TITLE</span><span>STATUS</span><span>AGE</span><span>ACTIONS</span>
            </div>
            {sessions.map((s) => (
              <div key={s.id} className="grid grid-cols-[60px_100px_1fr_100px_80px_120px] gap-3 px-4 py-3 border border-white/[0.04] hover:border-white/10 transition-colors items-center">
                <span className="text-white/50 text-sm font-body">{s.session_number}</span>
                <span className="text-white/30 text-xs font-body">{s.session_date || "—"}</span>
                <span className="text-white text-sm font-body truncate">{s.title || <span className="text-white/20 italic">Not planned yet</span>}</span>
                {statusBadge(s.status)}
                <span className="text-white/20 text-[9px] font-body">{(s.age_group || "adult").toUpperCase()}</span>
                <div className="flex gap-3 text-[10px] font-body">
                  <Link to={`/admin/sessions/${s.id}`} className="text-white/30 hover:text-white/60 transition-colors">Edit</Link>
                  {s.status !== "active" && (
                    <button onClick={() => setActive(s.id)} className="text-emerald-400/50 hover:text-emerald-400 transition-colors">Activate</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSessions;
