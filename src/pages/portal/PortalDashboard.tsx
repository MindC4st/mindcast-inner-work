import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle, PlayCircle, ArrowRight, Headphones, Target } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PILOT_SESSIONS = [
  { number: 1, date: "21 Apr", title: "Everything You Think You Know About Meaning and Happiness Is Wrong", guest: "Johann Hari", show: "Diary of a CEO", ready: true },
  { number: 2, date: "28 Apr", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 3, date: "5 May", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 4, date: "12 May", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 5, date: "19 May", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 6, date: "26 May", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 7, date: "2 Jun", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 8, date: "9 Jun", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 9, date: "16 Jun", title: "Coming Soon", guest: "", show: "", ready: false },
  { number: 10, date: "23 Jun", title: "Coming Soon", guest: "", show: "", ready: false },
];

const PortalDashboard = () => {
  const { profile, user } = useAuth();
  const [latestGoal, setLatestGoal] = useState<{ what_i_will_implement: string | null; status: string } | null>(null);

  const firstName = (profile?.name || "").split(" ")[0] || "there";

  useEffect(() => {
    if (!user) return;
    const fetchGoal = async () => {
      const { data } = await supabase
        .from("implementation_goals")
        .select("what_i_will_implement, status")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data) setLatestGoal(data);
    };
    fetchGoal();
  }, [user]);

  // Determine "this week's session" — for now always session 1
  const currentSession = PILOT_SESSIONS[0];

  return (
    <PortalLayout>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <h1 className="portal-heading text-3xl md:text-4xl text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-body font-light">
          Term 1 — Taupo Pilot
        </p>
      </motion.div>

      {/* This Week's Session — Hero card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Link to="/portal/week/1" className="block mb-10 group">
          <div className="bg-primary p-8 md:p-10 text-primary-foreground transition-all duration-300 group-hover:shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Headphones size={14} strokeWidth={1.5} className="text-primary-foreground/40" />
              <span className="text-primary-foreground/30 text-[10px] tracking-[0.2em] font-body">THIS WEEK'S SESSION</span>
            </div>
            <p className="text-primary-foreground/50 text-[10px] tracking-[0.15em] font-body mb-1">SESSION 1 — {currentSession.date.toUpperCase()}</p>
            <h2 className="font-serif text-xl md:text-2xl mt-2 font-medium tracking-normal leading-snug">
              {currentSession.title}
            </h2>
            <p className="text-primary-foreground/40 text-sm mt-2 font-body font-light">
              {currentSession.guest} · {currentSession.show}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <span className="text-[10px] tracking-[0.15em] font-body px-3 py-1 bg-primary-foreground/10 text-primary-foreground/60">
                Listen before Tuesday
              </span>
              <div className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] tracking-[0.15em] font-body group-hover:text-primary-foreground/70 transition-colors">
                <PlayCircle size={15} strokeWidth={1.5} />
                Open session
                <ArrowRight size={13} strokeWidth={1.5} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* All 10 Sessions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-12">
        <h2 className="portal-label mb-5">ALL SESSIONS</h2>
        <div className="space-y-2">
          {PILOT_SESSIONS.map((s) => (
            <div key={s.number}>
              {s.ready ? (
                <Link to={`/portal/week/${s.number}`}>
                  <div className="portal-card px-5 py-4 flex items-center gap-5 hover:bg-white transition-colors group cursor-pointer">
                    <span className="font-serif text-lg text-foreground/50 w-8 text-center group-hover:text-foreground transition-colors">{s.number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-foreground truncate">{s.title}</p>
                      <p className="text-[10px] text-muted-foreground font-body mt-0.5 font-light">{s.guest} · {s.date}</p>
                    </div>
                    <PlayCircle size={14} className="text-foreground/30 shrink-0" strokeWidth={1.5} />
                  </div>
                </Link>
              ) : (
                <div className="portal-card px-5 py-4 flex items-center gap-5 opacity-40">
                  <span className="font-serif text-lg text-foreground/30 w-8 text-center">{s.number}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-foreground/40">Coming — {s.date}</p>
                  </div>
                  <Lock size={13} className="text-muted-foreground/40 shrink-0" strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Implementation Tracker */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <h2 className="portal-label mb-5">MY IMPLEMENTATION TRACKER</h2>
        {latestGoal ? (
          <div className="portal-card p-5 md:p-6">
            <div className="flex items-start gap-4">
              <Target size={18} className="text-foreground/40 mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-sm font-body text-foreground leading-relaxed">
                  {latestGoal.what_i_will_implement || "No commitment set yet"}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-[10px] tracking-[0.15em] font-body px-3 py-1 ${
                    latestGoal.status === "achieved" ? "bg-green-100 text-green-700" :
                    latestGoal.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                    "bg-foreground/5 text-foreground/50"
                  }`}>
                    {latestGoal.status === "achieved" ? "ACHIEVED" :
                     latestGoal.status === "in_progress" ? "IN PROGRESS" : "COMMITTED"}
                  </span>
                  <Link to="/portal/week/1" className="text-[10px] tracking-[0.15em] font-body text-foreground/40 hover:text-foreground/70 transition-colors">
                    Check in →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="portal-card p-5 md:p-6 text-center">
            <p className="text-sm text-muted-foreground font-body font-light">
              Complete your first session to set an implementation commitment.
            </p>
          </div>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalDashboard;
