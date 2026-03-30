import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle, PlayCircle } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS } from "@/data/weekData";

const CURRENT_WEEK = 3; // Simulated — in prod this would be calculated from cohort start_date

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

  return (
    <PortalLayout>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="heading-display text-3xl md:text-4xl text-primary">
          WELCOME BACK, {(profile?.name || "MEMBER").toUpperCase()}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-block border-2 border-primary/20 text-primary/60 text-[10px] tracking-widest px-4 py-1">
            TERM 2 — WIRED
          </span>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-1">
          {WEEKS.map((w) => {
            const status = getWeekStatus(w.number);
            return (
              <div
                key={w.number}
                className={`flex-1 h-2 ${
                  status === "complete" ? "bg-green-600" :
                  status === "in-progress" ? "bg-blue-500" :
                  w.number === CURRENT_WEEK ? "bg-primary" :
                  "bg-muted"
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 tracking-widest">WEEK {CURRENT_WEEK} OF 10</p>
      </div>

      {/* This Week CTA */}
      <Link to={`/portal/week/${CURRENT_WEEK}`} className="block mb-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="border-[3px] border-primary bg-primary p-6 md:p-8 text-secondary"
        >
          <span className="text-secondary/40 text-[10px] tracking-widest">THIS WEEK</span>
          <h2 className="font-display text-2xl tracking-widest mt-1">
            WEEK {CURRENT_WEEK}: {WEEKS[CURRENT_WEEK - 1]?.title.toUpperCase()}
          </h2>
          <p className="text-secondary/50 text-xs mt-2 font-body">{WEEKS[CURRENT_WEEK - 1]?.focus}</p>
          <span className="inline-flex items-center gap-2 text-secondary/60 text-xs tracking-widest mt-4">
            <PlayCircle size={14} /> OPEN WORKSHEET →
          </span>
        </motion.div>
      </Link>

      {/* Week Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {WEEKS.map((w) => {
          const status = getWeekStatus(w.number);
          const locked = status === "locked";
          const borderColor = status === "complete" ? "border-l-green-600" :
                              status === "in-progress" ? "border-l-blue-500" :
                              "border-l-muted-foreground/30";

          return (
            <div key={w.number} className="relative">
              {locked ? (
                <div className={`border-2 border-primary/10 border-l-4 ${borderColor} p-4 opacity-50`}>
                  <Lock size={14} className="text-muted-foreground mb-2" />
                  <p className="font-display text-xs tracking-wider text-primary">WEEK {w.number}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{w.title}</p>
                </div>
              ) : (
                <Link to={`/portal/week/${w.number}`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className={`border-2 border-primary/20 border-l-4 ${borderColor} p-4 hover:border-primary transition-colors`}
                  >
                    {status === "complete" && <CheckCircle size={14} className="text-green-600 mb-2" />}
                    <p className="font-display text-xs tracking-wider text-primary">WEEK {w.number}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{w.title}</p>
                    <span className="text-[9px] text-primary/40 tracking-widest mt-2 block">
                      {status === "complete" ? "COMPLETE" : status === "in-progress" ? "IN PROGRESS" : "NOT STARTED"}
                    </span>
                  </motion.div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
};

export default PortalDashboard;
