import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoNavLight from "@/assets/logo-cream.png";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle().then(({ data }) => setActiveSession(data));
    supabase.from("sessions").select("*").order("session_number").then(({ data }) => setSessions(data || []));
    supabase.from("workbook_entries").select("*").eq("profile_id", user.id).then(({ data }) => setEntries(data || []));
  }, [user, authLoading]);

  useEffect(() => {
    if (activeSession && entries.length) {
      setActiveEntry(entries.find((e) => e.session_id === activeSession.id));
    }
  }, [activeSession, entries]);

  const entryBySession = new Map(entries.map((e) => [e.session_id, e]));
  const leavingWords = entries.filter((e) => e.leaving_word).map((e) => e.leaving_word);
  const recentGoals = entries.filter((e) => e.weekly_goal).slice(-5).reverse();

  const weekGrid = Array.from({ length: 52 }, (_, i) => {
    const s = sessions.find((s: any) => s.session_number === i + 1);
    const hasEntry = s ? entryBySession.has(s.id) : false;
    const isActive = s?.status === "active";
    return { week: i + 1, session: s, hasEntry, isActive };
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link to="/">
          <img src={logoNavLight} alt="Mindcast" className="h-7" />
        </Link>
        <Link to="/portal/settings" className="text-muted-foreground text-xs font-body hover:text-foreground">Profile</Link>
      </nav>

      <div className="max-w-lg mx-auto px-5 pt-6">
        {activeSession && (
          <div className="border border-border p-5 mb-8">
            <p className="text-muted-foreground text-[9px] tracking-[0.15em] font-body mb-2">
              WEEK {activeSession.session_number} · {activeSession.session_date}
            </p>
            <h2 className="font-display text-lg font-bold text-foreground mb-1">{activeSession.title}</h2>
            {activeEntry?.completed_at ? (
              <div className="flex items-center gap-2 mt-3">
                <Check size={14} className="text-emerald-500/60" />
                <span className="text-emerald-500/60 text-xs font-body">Completed</span>
                <Link to="/workbook" className="ml-auto text-muted-foreground text-xs font-body hover:text-foreground">Read again →</Link>
              </div>
            ) : (
              <div className="mt-3">
                <Link to="/workbook" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-display font-bold hover:bg-primary/90 transition-colors">
                  {activeEntry ? "Continue" : "Start"} my workbook <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 52-week grid */}
        <div className="mb-8">
          <p className="text-muted-foreground text-[9px] tracking-[0.15em] font-body mb-4">MY YEAR</p>
          <div className="grid grid-cols-13 gap-1">
            {weekGrid.map((w) => (
              <div
                key={w.week}
                title={w.session?.title || `Week ${w.week}`}
                className={`aspect-square rounded-sm transition-colors cursor-default ${
                  w.isActive ? "bg-primary animate-pulse" : w.hasEntry ? "bg-primary/30" : w.session ? "bg-foreground/[0.06]" : "bg-foreground/[0.03]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Goals */}
        {recentGoals.length > 0 && (
          <div className="mb-8">
            <p className="text-muted-foreground text-[9px] tracking-[0.15em] font-body mb-4">MY GOALS</p>
            <div className="space-y-2">
              {recentGoals.map((e, i) => {
                const s = sessions.find((s: any) => s.id === e.session_id);
                return (
                  <div key={i} className="flex gap-3 text-sm font-body">
                    <span className="text-muted-foreground text-xs shrink-0">W{s?.session_number || "?"}</span>
                    <span className="text-foreground/60">"{e.weekly_goal}"</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Word collection */}
        {leavingWords.length > 0 && (
          <div className="mb-8">
            <p className="text-muted-foreground text-[9px] tracking-[0.15em] font-body mb-4">MY WORD COLLECTION</p>
            <div className="flex flex-wrap gap-2">
              {leavingWords.map((w, i) => (
                <span key={i} className="text-foreground/50 text-sm font-body border border-border px-3 py-1">{w}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sessions list — expandable */}
        <div>
          <p className="text-muted-foreground text-[9px] tracking-[0.15em] font-body mb-4">ALL SESSIONS</p>
          <div className="space-y-1">
            {sessions.filter((s: any) => s.status !== "draft").map((s: any) => {
              const e = entryBySession.get(s.id);
              const isExpanded = expandedId === s.id;
              return (
                <div key={s.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-border/50 hover:border-border transition-colors text-left"
                  >
                    <span className="text-muted-foreground text-xs font-body w-8">W{s.session_number}</span>
                    <span className="text-foreground text-sm font-body flex-1 truncate">{s.title}</span>
                    {e?.completed_at && <Check size={12} className="text-emerald-500/50" />}
                    {e && (isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />)}
                  </button>
                  <AnimatePresence>
                    {isExpanded && e && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-muted/30 border border-border/50 border-t-0 px-5 py-4 space-y-3">
                          {e.arriving_word && (
                            <div>
                              <p className="text-muted-foreground text-[9px] tracking-wide font-body mb-1">ARRIVING WORD</p>
                              <p className="text-foreground/60 text-sm font-body">{e.arriving_word}</p>
                            </div>
                          )}
                          {e.key_idea && (
                            <div>
                              <p className="text-muted-foreground text-[9px] tracking-wide font-body mb-1">KEY IDEA</p>
                              <p className="text-foreground/60 text-sm font-body">{e.key_idea}</p>
                            </div>
                          )}
                          {[1, 2, 3].map((n) => e[`question_${n}_response`] && (
                            <div key={n}>
                              <p className="text-muted-foreground text-[9px] tracking-wide font-body mb-1">
                                {e[`question_${n}_text`] || `QUESTION ${n}`}
                              </p>
                              <p className="text-foreground/60 text-sm font-body">{e[`question_${n}_response`]}</p>
                            </div>
                          ))}
                          {e.weekly_goal && (
                            <div>
                              <p className="text-muted-foreground text-[9px] tracking-wide font-body mb-1">GOAL</p>
                              <p className="text-foreground/60 text-sm font-body">{e.weekly_goal}</p>
                              {e.action_step && <p className="text-muted-foreground text-xs font-body mt-1">First step: {e.action_step}</p>}
                            </div>
                          )}
                          {e.leaving_word && (
                            <div>
                              <p className="text-muted-foreground text-[9px] tracking-wide font-body mb-1">LEAVING WORD</p>
                              <p className="text-foreground/60 text-sm font-body">{e.leaving_word}</p>
                            </div>
                          )}
                          {e.completed_at && (
                            <p className="text-muted-foreground/50 text-[9px] font-body mt-2">Completed {new Date(e.completed_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
