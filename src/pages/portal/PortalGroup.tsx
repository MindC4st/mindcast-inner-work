import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS, DOMAINS } from "@/data/weekData";

interface GroupEntry {
  week_number: number;
  question_key: string;
  answer_text: string | null;
  profiles: { name: string } | null;
}

const PortalGroup = () => {
  const { user, cohortId, role } = useAuth();
  const [entries, setEntries] = useState<GroupEntry[]>([]);
  const [filterWeek, setFilterWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cohortId) return;
    const fetch = async () => {
      let query = supabase
        .from("entries")
        .select("week_number, question_key, answer_text, profiles!entries_user_id_fkey(name)")
        .eq("cohort_id", cohortId)
        .eq("is_shared", true)
        .order("week_number", { ascending: false });

      if (filterWeek) query = query.eq("week_number", filterWeek);

      const { data } = await query;
      setEntries((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [cohortId, filterWeek]);

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="heading-display text-3xl text-primary mb-2">GROUP VIEW</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body">Shared reflections from your cohort. Read only.</p>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilterWeek(null)}
            className={`text-[10px] tracking-widest px-3 py-1 border-2 whitespace-nowrap ${!filterWeek ? "bg-primary text-secondary border-primary" : "border-primary/20 text-primary/60"}`}
          >
            ALL WEEKS
          </button>
          {WEEKS.map(w => (
            <button
              key={w.number}
              onClick={() => setFilterWeek(w.number)}
              className={`text-[10px] tracking-widest px-3 py-1 border-2 whitespace-nowrap ${filterWeek === w.number ? "bg-primary text-secondary border-primary" : "border-primary/20 text-primary/60"}`}
            >
              WEEK {w.number}
            </button>
          ))}
        </div>

        {/* Feed */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="border-2 border-primary/10 p-8 text-center">
            <p className="text-muted-foreground text-sm font-body">No shared entries yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((e, i) => (
              <div key={i} className="border-2 border-primary/10 p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] tracking-widest text-primary/40">
                    WEEK {e.week_number} — {e.question_key.replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-[10px] tracking-widest text-primary/40">
                    {(e.profiles as any)?.name || "Anonymous"}
                  </span>
                </div>
                <p className="text-sm text-primary font-body leading-relaxed">{e.answer_text}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalGroup;
