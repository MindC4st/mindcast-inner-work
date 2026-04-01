import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle, Clock, Circle } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS, DOMAINS } from "@/data/weekData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MemberProgress {
  userId: string;
  name: string;
  weeksCompleted: number;
  entriesCount: number;
  avgDomainScores: Record<string, number>;
}

const PortalAdmin = () => {
  const { cohortId, role } = useAuth();
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [groupDomainData, setGroupDomainData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cohortId || role !== "facilitator") return;
    const load = async () => {
      // Get all cohort members with profiles
      const { data: cohortMembers } = await supabase
        .from("cohort_members")
        .select("user_id, profiles!cohort_members_user_id_fkey(name)")
        .eq("cohort_id", cohortId);

      if (!cohortMembers) { setLoading(false); return; }

      // Get all entries, commitments, domain scores for the cohort
      const [entriesRes, commitmentsRes, scoresRes] = await Promise.all([
        supabase.from("entries").select("user_id, week_number").eq("cohort_id", cohortId),
        supabase.from("commitments").select("user_id, week_number, is_locked").eq("cohort_id", cohortId),
        supabase.from("domain_scores").select("user_id, week_number, domain_name, score").eq("cohort_id", cohortId),
      ]);

      const entriesByUser: Record<string, Set<number>> = {};
      (entriesRes.data || []).forEach(e => {
        if (!entriesByUser[e.user_id]) entriesByUser[e.user_id] = new Set();
        entriesByUser[e.user_id].add(e.week_number);
      });

      const completedByUser: Record<string, number> = {};
      (commitmentsRes.data || []).filter(c => c.is_locked).forEach(c => {
        completedByUser[c.user_id] = (completedByUser[c.user_id] || 0) + 1;
      });

      // Group domain scores for chart
      const domainTotals: Record<string, { sum: number; count: number }> = {};
      (scoresRes.data || []).forEach(s => {
        if (!domainTotals[s.domain_name]) domainTotals[s.domain_name] = { sum: 0, count: 0 };
        domainTotals[s.domain_name].sum += s.score;
        domainTotals[s.domain_name].count += 1;
      });

      const domainChartData = DOMAINS.map(d => ({
        domain: d,
        average: domainTotals[d] ? Math.round((domainTotals[d].sum / domainTotals[d].count) * 10) / 10 : 0,
      }));
      setGroupDomainData(domainChartData);

      // Per-user domain averages
      const userDomainScores: Record<string, Record<string, { sum: number; count: number }>> = {};
      (scoresRes.data || []).forEach(s => {
        if (!userDomainScores[s.user_id]) userDomainScores[s.user_id] = {};
        if (!userDomainScores[s.user_id][s.domain_name]) userDomainScores[s.user_id][s.domain_name] = { sum: 0, count: 0 };
        userDomainScores[s.user_id][s.domain_name].sum += s.score;
        userDomainScores[s.user_id][s.domain_name].count += 1;
      });

      const memberProgress: MemberProgress[] = cohortMembers.map(cm => {
        const avgScores: Record<string, number> = {};
        if (userDomainScores[cm.user_id]) {
          Object.entries(userDomainScores[cm.user_id]).forEach(([domain, { sum, count }]) => {
            avgScores[domain] = Math.round((sum / count) * 10) / 10;
          });
        }
        return {
          userId: cm.user_id,
          name: (cm.profiles as any)?.name || "Unknown",
          weeksCompleted: completedByUser[cm.user_id] || 0,
          entriesCount: entriesByUser[cm.user_id]?.size || 0,
          avgDomainScores: avgScores,
        };
      });

      setMembers(memberProgress);
      setLoading(false);
    };
    load();
  }, [cohortId, role]);

  if (role !== "facilitator") {
    return <PortalLayout><p className="text-muted-foreground">Access denied. Facilitators only.</p></PortalLayout>;
  }

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Users size={24} className="text-primary" />
          <h1 className="heading-display text-3xl text-primary">ADMIN PANEL</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8 font-body">Overview of all members' progress and group trends.</p>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <>
            {/* Group domain averages chart */}
            <div className="border-2 border-primary/10 p-4 md:p-6 mb-8">
              <h2 className="heading-display text-lg text-primary mb-4">GROUP DOMAIN AVERAGES</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={groupDomainData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 56%, 11%, 0.1)" />
                    <XAxis dataKey="domain" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="average" fill="hsl(213, 56%, 11%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Members table */}
            <div className="border-2 border-primary/10">
              <div className="bg-primary/5 p-4 border-b border-primary/10">
                <h2 className="heading-display text-lg text-primary">MEMBER PROGRESS ({members.length})</h2>
              </div>
              <div className="divide-y divide-primary/10">
                {members.map(m => (
                  <div key={m.userId} className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-sm tracking-wider text-primary">{m.name.toUpperCase()}</h3>
                      <span className="text-[10px] tracking-widest text-primary/40">
                        {m.weeksCompleted}/10 WEEKS COMPLETED
                      </span>
                    </div>

                    {/* Week progress dots */}
                    <div className="flex gap-1 mb-3">
                      {WEEKS.map(w => {
                        const hasEntries = m.entriesCount >= w.number;
                        return (
                          <div key={w.number} className={`w-6 h-2 ${
                            m.weeksCompleted >= w.number ? "bg-green-600" :
                            hasEntries ? "bg-amber-500" : "bg-muted"
                          }`} title={`Week ${w.number}`} />
                        );
                      })}
                    </div>

                    {/* Domain scores */}
                    {Object.keys(m.avgDomainScores).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {DOMAINS.map(d => (
                          <span key={d} className="text-[9px] tracking-widest text-primary/40 border border-primary/10 px-2 py-0.5">
                            {d.toUpperCase()}: {m.avgDomainScores[d] || "—"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalAdmin;
