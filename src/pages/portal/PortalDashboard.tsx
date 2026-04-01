import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle, PlayCircle, ArrowRight } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS } from "@/data/weekData";

const CURRENT_WEEK = 3;

const PortalDashboard = () => {
  const { profile, user, cohortId } = useAuth();
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());
  const [inProgressWeeks, setInProgressWeeks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user || !cohortId) return;
    const fetchProgress = async () => {
      const { data: entries } = await supabase
        .from("entries")
        .select("week_number")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId);
      
      const { data: commitments } = await supabase
        .from("commitments")
        .select("week_number, is_locked")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId);

      const weeksWithEntries = new Set((entries || []).map(e => e.week_number));
      const lockedWeeks = new Set((commitments || []).filter(c => c.is_locked).map(c => c.week_number));

      setCompletedWeeks(lockedWeeks);
      setInProgressWeeks(weeksWithEntries);
    };
    fetchProgress();
  }, [user, cohortId]);

  const getWeekStatus = (weekNum: number) => {
    if (completedWeeks.has(weekNum)) return "complete";
    if (inProgressWeeks.has(weekNum)) return "in-progress";
    if (weekNum > CURRENT_WEEK) return "locked";
    return "not-started";
  };

  const firstName = (profile?.name || "").split(" ")[0] || "there";

  return (
    <PortalLayout>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="portal-heading text-3xl md:text-4xl text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-body font-light">
          Pick up where you left off, or explore a new session.
        </p>
      </motion.div>

      {/* Term & Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="portal-label">Term 2 — Wired</span>
          <span className="portal-label">Week {CURRENT_WEEK} of 10</span>
        </div>
        <div className="flex items-center gap-[3px]">
          {WEEKS.map((w) => {
            const status = getWeekStatus(w.number);
            return (
              <div
                key={w.number}
                className={`flex-1 h-1.5 transition-colors ${
                  status === "complete" ? "bg-foreground" :
                  status === "in-progress" ? "bg-foreground/40" :
                  w.number === CURRENT_WEEK ? "bg-foreground/25" :
                  "bg-foreground/[0.06]"
                }`}
              />
            );
          })}
        </div>
      </motion.div>

      {/* This Week — Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <Link to={`/portal/week/${CURRENT_WEEK}`} className="block mb-10 group">
          <div className="bg-primary p-8 md:p-10 text-primary-foreground transition-all duration-300 group-hover:shadow-lg">
            <span className="text-primary-foreground/30 text-[10px] tracking-[0.2em] font-body">THIS WEEK'S SESSION</span>
            <h2 className="font-serif text-2xl md:text-3xl mt-3 font-medium tracking-normal">
              {WEEKS[CURRENT_WEEK - 1]?.title}
            </h2>
            <p className="text-primary-foreground/40 text-sm mt-3 font-body font-light leading-relaxed max-w-lg">
              {WEEKS[CURRENT_WEEK - 1]?.focus}
            </p>
            <div className="flex items-center gap-2 text-primary-foreground/50 text-[11px] tracking-[0.15em] font-body mt-6 group-hover:text-primary-foreground/70 transition-colors">
              <PlayCircle size={15} strokeWidth={1.5} />
              Open session
              <ArrowRight size={13} strokeWidth={1.5} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* All sessions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}>
        <h2 className="portal-label mb-5">All Sessions</h2>
        <div className="space-y-2">
          {WEEKS.map((w) => {
            const status = getWeekStatus(w.number);
            const locked = status === "locked";

            return (
              <div key={w.number}>
                {locked ? (
                  <div className="portal-card px-5 py-4 flex items-center gap-5 opacity-40">
                    <span className="font-serif text-lg text-foreground/30 w-8 text-center">{w.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-foreground/40">{w.title}</p>
                    </div>
                    <Lock size={13} className="text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                  </div>
                ) : (
                  <Link to={`/portal/week/${w.number}`}>
                    <div className="portal-card px-5 py-4 flex items-center gap-5 hover:bg-white transition-colors group cursor-pointer">
                      <span className="font-serif text-lg text-foreground/50 w-8 text-center group-hover:text-foreground transition-colors">{w.number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-foreground">{w.title}</p>
                        <p className="text-[10px] text-muted-foreground font-body mt-0.5 truncate font-light">{w.episode}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {status === "complete" && (
                          <CheckCircle size={14} className="text-foreground/30" strokeWidth={1.5} />
                        )}
                        <span className="portal-label text-[9px]">
                          {status === "complete" ? "Complete" : status === "in-progress" ? "In progress" : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalDashboard;
