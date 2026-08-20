import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS } from "@/data/weekData";
import IntentionProgress from "@/components/portal/IntentionProgress";

interface WeekProgress {
  weekNumber: number;
  reflectionsCompleted: number;
  reflectionsTotal: number;
  commitment: string;
  checkinStatus: string;
}

const STATUS_STYLES: Record<string, { dot: string; text: string; label: string }> = {
  achieved: { dot: "bg-foreground", text: "text-foreground", label: "Achieved" },
  in_progress: { dot: "bg-foreground/50", text: "text-foreground/60", label: "In Progress" },
  carried_forward: { dot: "bg-foreground/30", text: "text-foreground/40", label: "Carried Forward" },
  not_started: { dot: "bg-foreground/[0.1]", text: "text-muted-foreground/50", label: "Not started" },
};

const PortalProgress = () => {
  const { user, cohortId } = useAuth();
  const [progress, setProgress] = useState<WeekProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !cohortId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const [entriesRes, commitRes, checkinRes] = await Promise.all([
        supabase
          .from("entries")
          .select("week_number, question_key")
          .eq("user_id", user.id)
          .eq("cohort_id", cohortId),
        supabase
          .from("commitments")
          .select("week_number, commitment_text")
          .eq("user_id", user.id)
          .eq("cohort_id", cohortId),
        supabase
          .from("implementation_checkins")
          .select("week_number, status")
          .eq("user_id", user.id)
          .eq("cohort_id", cohortId),
      ]);

      // Count reflection entries per week (exclude final_reflection key)
      const entryKeysByWeek: Record<number, Set<string>> = {};
      (entriesRes.data || []).forEach((e) => {
        if (e.question_key === "final_reflection") return;
        if (!entryKeysByWeek[e.week_number]) entryKeysByWeek[e.week_number] = new Set();
        entryKeysByWeek[e.week_number].add(e.question_key);
      });

      const commitByWeek: Record<number, string> = {};
      (commitRes.data || []).forEach((c) => {
        commitByWeek[c.week_number] = c.commitment_text || "";
      });

      const checkinByWeek: Record<number, string> = {};
      (checkinRes.data || []).forEach((c) => {
        checkinByWeek[c.week_number] = c.status;
      });

      setProgress(
        WEEKS.map((w) => ({
          weekNumber: w.number,
          reflectionsCompleted: entryKeysByWeek[w.number]?.size || 0,
          reflectionsTotal: w.bookmarks.length,
          commitment: commitByWeek[w.number] || "",
          checkinStatus: checkinByWeek[w.number] || "not_started",
        }))
      );
      setLoading(false);
    };
    load();
  }, [user, cohortId]);

  const achievedCount = progress.filter((p) => p.checkinStatus === "achieved").length;
  const commitmentsSet = progress.filter((p) => p.commitment).length;

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="portal-heading text-3xl mb-2">My Progress</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body font-light">
          Your journey across the 52 weeks.
        </p>

        {/* The self-assessment tracker sits above the session list: it is the
            member's own answer to "is this working for me", and unlike the rest
            of this page it does not depend on a cohort being assigned. */}
        <div className="mb-10">
          <IntentionProgress />
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground font-body font-light animate-pulse">Loading...</p>
          </div>
        ) : !cohortId ? (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground font-body font-light">
              Your cohort hasn't been set up yet. Check back after your first session.
            </p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-foreground/[0.06]">
              <div>
                <span className="font-serif text-3xl text-foreground">{achievedCount}</span>
                <span className="portal-label block mt-0.5">Goals achieved</span>
              </div>
              <div>
                <span className="font-serif text-3xl text-foreground/40">{commitmentsSet}</span>
                <span className="portal-label block mt-0.5">Commitments set</span>
              </div>
              <div className="flex-1" />
              <div className="flex gap-[3px]">
                {progress.map((p) => {
                  const s = STATUS_STYLES[p.checkinStatus] || STATUS_STYLES.not_started;
                  return (
                    <div key={p.weekNumber} className={`w-6 h-1.5 ${s.dot}`} title={`Session ${p.weekNumber}`} />
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-foreground/[0.06]" />

              <div className="space-y-3">
                {progress.map((wp, i) => {
                  const week = WEEKS[wp.weekNumber - 1];
                  const status = STATUS_STYLES[wp.checkinStatus] || STATUS_STYLES.not_started;

                  return (
                    <motion.div
                      key={wp.weekNumber}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="relative pl-10"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-[7px] top-5 w-2.5 h-2.5 rounded-full ${status.dot}`} />

                      <Link to={`/portal/week/${wp.weekNumber}`} className="block portal-card p-5 hover:bg-white transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <span className="portal-label text-[9px]">Session {wp.weekNumber}</span>
                            <h3 className="font-serif text-sm text-foreground">{week.title}</h3>
                          </div>
                          <ArrowRight size={13} className="text-foreground/15 group-hover:text-foreground/30 transition-colors" strokeWidth={1.5} />
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center gap-4 mt-2.5">
                          <div className="flex items-center gap-1.5">
                            {wp.reflectionsCompleted === wp.reflectionsTotal && wp.reflectionsTotal > 0
                              ? <CheckCircle size={12} className="text-foreground/30" strokeWidth={1.5} />
                              : wp.reflectionsCompleted > 0
                                ? <Clock size={12} className="text-foreground/20" strokeWidth={1.5} />
                                : <Circle size={12} className="text-foreground/10" strokeWidth={1.5} />
                            }
                            <span className="text-[9px] text-muted-foreground/40 font-body">
                              {wp.reflectionsCompleted}/{wp.reflectionsTotal} reflections
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            <span className={`text-[9px] font-body ${status.text}`}>{status.label}</span>
                          </div>
                        </div>

                        {wp.commitment && (
                          <p className="text-[12px] text-foreground/40 font-body mt-2.5 italic font-light leading-relaxed">
                            "{wp.commitment}"
                          </p>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalProgress;
