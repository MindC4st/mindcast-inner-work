import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize } from "lucide-react";

const GoalWall = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [session, setSession] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = sessionId
        ? await supabase.from("sessions").select("*").eq("id", sessionId).single()
        : await supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle();
      setSession(data);
    };
    load();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const fetch = async () => {
      const { data } = await supabase.from("check_ins").select("*").eq("session_id", session.id).eq("share_goal_publicly", true).eq("goal_status", "approved").not("goal_update", "is", null).order("checked_in_at", { ascending: false });
      setGoals(data || []);
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (goals.length <= 6) return;
    const timer = setInterval(() => setVisibleIdx((i) => (i + 1) % goals.length), 5000);
    return () => clearInterval(timer);
  }, [goals.length]);

  const goFullscreen = () => { document.documentElement.requestFullscreen?.(); };

  if (!session) return <div className="fixed inset-0 bg-background flex items-center justify-center"><p className="text-foreground/20 font-body">Loading...</p></div>;

  const displayed = goals.length <= 6 ? goals : goals.slice(visibleIdx, visibleIdx + 6);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="px-10 py-6 border-b border-foreground/[0.06] flex items-center justify-between">
        <div>
          <p className="font-body text-[10px] text-foreground/20 uppercase tracking-[0.2em]">mindcast · week {session.session_number}</p>
          <h1 className="text-2xl font-display font-bold text-foreground mt-1">Looking Back</h1>
        </div>
        <button onClick={goFullscreen} className="text-foreground/15 hover:text-foreground/40 transition-colors" title="Fullscreen">
          <Maximize size={18} />
        </button>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center">
        {goals.length === 0 ? (
          <p className="text-foreground/15 font-body text-lg">Waiting for stories...</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 max-w-4xl w-full">
            <AnimatePresence mode="popLayout">
              {displayed.map((g) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6">
                  <p className="font-display font-bold text-foreground text-base mb-3">{g.display_name}</p>
                  {g.goal_update && <p className="text-foreground/50 text-sm font-body leading-relaxed">{g.goal_update}</p>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalWall;
