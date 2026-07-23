import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, PlayCircle, ArrowRight, Headphones, Target } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import TodaysSessionBanner from "@/components/portal/TodaysSessionBanner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCurriculumWeek, trackForAgeGroup } from "@/hooks/useCurriculumWeeks";

// Life-group companion to Sunday Live. Pulls the 52-week curriculum from
// `curriculum_weeks` (the live 52-week lesson plans) and resolves the current
// week from `scheduled_sessions`. No more hardcoded pilot list.

const PortalDashboard = () => {
  const { profile, user } = useAuth();
  const track = trackForAgeGroup((profile as any)?.age_group);
  const { current, all, loading } = useCurrentCurriculumWeek(track);
  const [latestGoal, setLatestGoal] = useState<{ what_i_will_implement: string | null; status: string } | null>(null);

  const firstName = (profile?.name || "").split(" ")[0] || "there";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("implementation_goals")
      .select("what_i_will_implement, status")
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setLatestGoal(data); });
  }, [user]);

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Life group</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground">
          WELCOME BACK, {firstName.toUpperCase()}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-body">
          Your weekly companion to Sunday Live.
        </p>
      </motion.div>

      <TodaysSessionBanner />

      {/* This Week — Hero card, pulled from curriculum_weeks */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        {current && (
          <Link to={`/portal/week/${current.week_number}`} className="block mb-10 group">
            <div className="bg-primary p-8 md:p-10 text-primary-foreground transition-all duration-300 group-hover:shadow-lg rounded-sm">
              <div className="flex items-center gap-2 mb-3">
                <Headphones size={14} strokeWidth={1.5} className="text-primary-foreground/50" />
                <span className="text-primary-foreground/60 text-[10px] tracking-[0.2em] font-body font-semibold uppercase">This week</span>
              </div>
              <p className="text-primary-foreground/60 text-[10px] tracking-[0.15em] font-body uppercase mb-3">
                Week {current.week_number}{current.block_theme ? ` · ${current.block_theme}` : ""}
              </p>
              <h2 className="font-display text-2xl md:text-3xl tracking-wider leading-tight mb-2">
                {(current.title || current.weekly_theme || "Coming soon").toUpperCase()}
              </h2>
              {current.source && (
                <p className="text-primary-foreground/70 text-sm mt-2 font-body">{current.source}</p>
              )}
              <div className="flex items-center gap-3 mt-6">
                <span className="text-[10px] tracking-[0.15em] font-body uppercase px-3 py-1 bg-primary-foreground/15 text-primary-foreground rounded-sm">
                  Listen before your life group
                </span>
                <div className="flex items-center gap-1.5 text-primary-foreground/80 text-[11px] tracking-[0.15em] font-body uppercase group-hover:text-primary-foreground transition-colors">
                  <PlayCircle size={15} strokeWidth={1.5} />
                  Open week
                  <ArrowRight size={13} strokeWidth={1.5} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </motion.div>

      {/* Full 52-week curriculum */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-12">
        <h2 className="text-[10px] font-body tracking-[0.3em] uppercase text-foreground/50 mb-5">All weeks</h2>
        {loading && (
          <p className="text-xs font-body uppercase tracking-widest text-foreground/40 animate-pulse">Loading…</p>
        )}
        <div className="space-y-2">
          {all.map((w) => {
            const isCurrent = current?.week_number === w.week_number;
            const hasContent = !!w.title;
            return hasContent ? (
              <Link key={w.week_number} to={`/portal/week/${w.week_number}`}>
                <div className={`border rounded-sm px-5 py-4 flex items-center gap-5 transition-colors group cursor-pointer ${
                  isCurrent
                    ? "border-primary/40 bg-primary/5"
                    : "border-foreground/10 hover:border-foreground/25 bg-foreground/[0.02]"
                }`}>
                  <span className="font-display text-lg tracking-wider text-foreground/60 w-10 text-center group-hover:text-foreground transition-colors">
                    {String(w.week_number).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground truncate">{w.title}</p>
                    {w.block_theme && (
                      <p className="text-[10px] text-foreground/40 font-body uppercase tracking-widest mt-0.5">{w.block_theme}</p>
                    )}
                  </div>
                  <PlayCircle size={14} className="text-foreground/30 shrink-0 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
              </Link>
            ) : (
              <div key={w.week_number} className="border border-foreground/[0.04] rounded-sm px-5 py-4 flex items-center gap-5 opacity-40 cursor-default">
                <span className="font-display text-lg tracking-wider text-foreground/30 w-10 text-center">
                  {String(w.week_number).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-foreground/40">Coming soon</p>
                </div>
                <Lock size={13} className="text-foreground/30 shrink-0" strokeWidth={1.5} />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Implementation Tracker */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <h2 className="text-[10px] font-body tracking-[0.3em] uppercase text-foreground/50 mb-5">My implementation tracker</h2>
        {latestGoal ? (
          <div className="border border-foreground/10 rounded-sm p-5 md:p-6 bg-foreground/[0.02]">
            <div className="flex items-start gap-4">
              <Target size={18} className="text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {latestGoal.what_i_will_implement || "No commitment set yet"}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-[10px] tracking-[0.15em] font-body uppercase px-3 py-1 rounded-sm border ${
                    latestGoal.status === "achieved" ? "border-primary/40 bg-primary/10 text-primary" :
                    latestGoal.status === "in_progress" ? "border-primary/25 bg-primary/5 text-primary" :
                    "border-foreground/10 bg-foreground/5 text-foreground/50"
                  }`}>
                    {latestGoal.status === "achieved" ? "Achieved" :
                     latestGoal.status === "in_progress" ? "In progress" : "Committed"}
                  </span>
                  {current && (
                    <Link to={`/portal/week/${current.week_number}`} className="text-[10px] tracking-[0.15em] font-body uppercase text-foreground/40 hover:text-primary transition-colors">
                      Check in →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-foreground/10 rounded-sm p-5 md:p-6 text-center bg-foreground/[0.02]">
            <p className="text-sm text-muted-foreground font-body">
              Complete your first week to set an implementation commitment.
            </p>
          </div>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalDashboard;
