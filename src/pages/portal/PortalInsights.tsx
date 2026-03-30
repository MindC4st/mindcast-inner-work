import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Loader2 } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DOMAINS, WEEKS } from "@/data/weekData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect } from "react";

interface InsightsData {
  domainTrends: { week: string; [domain: string]: string | number }[];
  commitments: { week: number; commitment: string; checkin: string }[];
}

const PortalInsights = () => {
  const { user, cohortId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiReflection, setAiReflection] = useState("");
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);

  useEffect(() => {
    if (!user || !cohortId) return;
    const fetchData = async () => {
      // Fetch domain scores for chart
      const { data: scores } = await supabase
        .from("domain_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId)
        .order("week_number");

      // Fetch commitments
      const { data: commitments } = await supabase
        .from("commitments")
        .select("*")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId)
        .order("week_number");

      // Build chart data
      const weekMap: Record<number, Record<string, number>> = {};
      (scores || []).forEach(s => {
        if (!weekMap[s.week_number]) weekMap[s.week_number] = {};
        weekMap[s.week_number][s.domain_name] = s.score;
      });

      const domainTrends = Object.entries(weekMap).map(([week, domains]) => ({
        week: `W${week}`,
        ...domains,
      }));

      setInsightsData({
        domainTrends,
        commitments: (commitments || []).map(c => ({
          week: c.week_number,
          commitment: c.commitment_text || "",
          checkin: c.checkin_sentence || "",
        })),
      });
    };
    fetchData();
  }, [user, cohortId]);

  const generateReflection = async () => {
    if (!user || !cohortId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: { userId: user.id, cohortId },
      });
      if (error) throw error;
      setAiReflection(data?.reflection || "Unable to generate reflection at this time.");
    } catch (e: any) {
      setAiReflection("AI insights are currently unavailable. Please try again later.");
    }
    setLoading(false);
  };

  const COLORS = [
    "hsl(210, 14%, 83%)", "hsl(200, 60%, 50%)", "hsl(150, 40%, 50%)",
    "hsl(40, 60%, 50%)", "hsl(0, 60%, 50%)", "hsl(270, 40%, 50%)",
    "hsl(180, 40%, 50%)", "hsl(30, 60%, 50%)", "hsl(320, 40%, 50%)",
  ];

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Brain size={24} className="text-primary" />
          <h1 className="heading-display text-3xl text-primary">AI INSIGHTS</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8 font-body">Your thinking over time. Always private — never shared.</p>

        {/* Domain Trends Chart */}
        {insightsData && insightsData.domainTrends.length > 0 && (
          <div className="border-2 border-primary/10 p-4 md:p-6 mb-6">
            <h2 className="heading-display text-lg text-primary mb-4">DOMAIN TRENDS</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insightsData.domainTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(213, 56%, 11%, 0.1)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {DOMAINS.map((d, i) => (
                    <Line key={d} type="monotone" dataKey={d} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Commitment Consistency */}
        {insightsData && insightsData.commitments.length > 0 && (
          <div className="border-2 border-primary/10 p-4 md:p-6 mb-6">
            <h2 className="heading-display text-lg text-primary mb-4">COMMITMENT CONSISTENCY</h2>
            <div className="space-y-3">
              {insightsData.commitments.map(c => (
                <div key={c.week} className="border-2 border-primary/10 p-4">
                  <span className="text-[10px] tracking-widest text-primary/40">WEEK {c.week}</span>
                  <p className="text-sm font-body text-primary mt-1">{c.commitment || "—"}</p>
                  {c.checkin && (
                    <p className="text-xs text-muted-foreground mt-2 italic font-body">Check-in: {c.checkin}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reflection */}
        <div className="border-[3px] border-primary p-6 md:p-8">
          <h2 className="heading-display text-lg text-primary mb-4">AI REFLECTION</h2>
          <p className="text-xs text-muted-foreground mb-4 font-body">
            A thoughtful reflection on your journey so far, powered by AI. Regenerates each visit.
          </p>
          {aiReflection ? (
            <div className="bg-muted/30 p-4 border-2 border-primary/10 mb-4">
              <p className="text-sm font-body text-primary leading-relaxed whitespace-pre-wrap">{aiReflection}</p>
            </div>
          ) : null}
          <button
            onClick={generateReflection}
            disabled={loading}
            className="btn-navy text-xs py-2 px-6 flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {loading ? "GENERATING..." : aiReflection ? "REGENERATE" : "GENERATE MY REFLECTION"}
          </button>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalInsights;
