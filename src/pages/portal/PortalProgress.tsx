import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Circle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS } from "@/data/weekData";

interface WeekProgress {
  weekNumber: number;
  podcastListened: boolean;
  bookmarksCompleted: number;
  bookmarksTotal: number;
  commitment: string;
  checkinStatus: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  achieved: { bg: "bg-green-600", text: "text-green-600", label: "Achieved" },
  in_progress: { bg: "bg-amber-500", text: "text-amber-500", label: "In Progress" },
  carried_forward: { bg: "bg-blue-500", text: "text-blue-500", label: "Carried Forward" },
  not_started: { bg: "bg-muted", text: "text-muted-foreground", label: "Not Started" },
};

const PortalProgress = () => {
  const { user, cohortId } = useAuth();
  const [progress, setProgress] = useState<WeekProgress[]>([]);

  useEffect(() => {
    if (!user || !cohortId) return;
    const load = async () => {
      const [bmRes, commitRes, checkinRes, entriesRes] = await Promise.all([
        supabase.from("bookmark_responses").select("week_number, bookmark_id").eq("user_id", user.id).eq("cohort_id", cohortId),
        supabase.from("commitments").select("week_number, commitment_text").eq("user_id", user.id).eq("cohort_id", cohortId),
        supabase.from("implementation_checkins").select("week_number, status").eq("user_id", user.id).eq("cohort_id", cohortId),
        supabase.from("entries").select("week_number, question_key").eq("user_id", user.id).eq("cohort_id", cohortId),
      ]);

      const bmByWeek: Record<number, Set<string>> = {};
      (bmRes.data || []).forEach(r => {
        if (!bmByWeek[r.week_number]) bmByWeek[r.week_number] = new Set();
        bmByWeek[r.week_number].add(r.bookmark_id);
      });

      const commitByWeek: Record<number, string> = {};
      (commitRes.data || []).forEach(c => { commitByWeek[c.week_number] = c.commitment_text || ""; });

      const checkinByWeek: Record<number, string> = {};
      (checkinRes.data || []).forEach(c => { checkinByWeek[c.week_number] = c.status; });

      const entryWeeks = new Set((entriesRes.data || []).map(e => e.week_number));

      const weekProgress = WEEKS.map(w => ({
        weekNumber: w.number,
        podcastListened: (bmByWeek[w.number]?.size || 0) > 0 || entryWeeks.has(w.number),
        bookmarksCompleted: bmByWeek[w.number]?.size || 0,
        bookmarksTotal: w.bookmarks.length,
        commitment: commitByWeek[w.number] || "",
        checkinStatus: checkinByWeek[w.number] || "not_started",
      }));

      setProgress(weekProgress);
    };
    load();
  }, [user, cohortId]);

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="heading-display text-3xl text-primary mb-2">MY PROGRESS</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body">Your implementation journey across all 10 sessions.</p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/10" />

          <div className="space-y-6">
            {progress.map((wp) => {
              const week = WEEKS[wp.weekNumber - 1];
              const status = STATUS_STYLES[wp.checkinStatus] || STATUS_STYLES.not_started;
              const hasActivity = wp.podcastListened || wp.bookmarksCompleted > 0 || wp.commitment;

              return (
                <div key={wp.weekNumber} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full ${
                    wp.checkinStatus === "achieved" ? "bg-green-600" :
                    hasActivity ? "bg-amber-500" : "bg-muted border-2 border-primary/20"
                  }`} />

                  <Link to={`/portal/week/${wp.weekNumber}`} className="block border-2 border-primary/10 p-4 md:p-6 hover:border-primary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-sm tracking-wider text-primary">
                        WEEK {wp.weekNumber}: {week.title.toUpperCase()}
                      </h3>
                      <ArrowRight size={14} className="text-primary/30" />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 mt-3">
                      {/* Podcast listened */}
                      <div className="flex items-center gap-2">
                        {wp.podcastListened ? <CheckCircle size={14} className="text-green-600" /> : <Circle size={14} className="text-muted-foreground" />}
                        <span className="text-[10px] tracking-widest text-primary/40">PODCAST</span>
                      </div>

                      {/* Bookmarks */}
                      <div className="flex items-center gap-2">
                        {wp.bookmarksCompleted === wp.bookmarksTotal && wp.bookmarksTotal > 0
                          ? <CheckCircle size={14} className="text-green-600" />
                          : wp.bookmarksCompleted > 0
                            ? <Clock size={14} className="text-amber-500" />
                            : <Circle size={14} className="text-muted-foreground" />
                        }
                        <span className="text-[10px] tracking-widest text-primary/40">
                          BOOKMARKS {wp.bookmarksCompleted}/{wp.bookmarksTotal}
                        </span>
                      </div>

                      {/* Implementation status */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status.bg}`} />
                        <span className={`text-[10px] tracking-widest ${status.text}`}>
                          {status.label.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {wp.commitment && (
                      <p className="text-xs text-primary/60 font-body mt-3 italic">"{wp.commitment}"</p>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalProgress;
