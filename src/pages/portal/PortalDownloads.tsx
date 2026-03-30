import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS, DOMAINS, BELIEF_QUESTIONS, REFLECTION_QUESTIONS, SELF_AUDIT_QUESTIONS } from "@/data/weekData";
import { toast } from "@/hooks/use-toast";

const CURRENT_WEEK = 3;

const PortalDownloads = () => {
  const { user, cohortId } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<"all" | "private" | "shared">("all");
  const canDownload = CURRENT_WEEK >= 8;

  const generateTextExport = async () => {
    if (!user || !cohortId) return;
    setGenerating(true);

    try {
      const [entriesRes, scoresRes, commitmentsRes] = await Promise.all([
        supabase.from("entries").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).order("week_number"),
        supabase.from("domain_scores").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).order("week_number"),
        supabase.from("commitments").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).order("week_number"),
      ]);

      const entries = entriesRes.data || [];
      const scores = scoresRes.data || [];
      const commitments = commitmentsRes.data || [];

      let text = "══════════════════════════════\nMINDCAST — TERM 2: WIRED\nYour Personal Journal\n══════════════════════════════\n\n";

      for (const week of WEEKS) {
        const weekEntries = entries.filter(e => e.week_number === week.number);
        if (weekEntries.length === 0) continue;

        if (filter === "private" && weekEntries.every(e => e.is_shared)) continue;
        if (filter === "shared" && weekEntries.every(e => !e.is_shared)) continue;

        text += `\n── WEEK ${week.number}: ${week.title.toUpperCase()} ──\n`;
        text += `Episode: ${week.episode}\n\n`;

        const beliefs = weekEntries.filter(e => e.question_key.startsWith("belief_"));
        if (beliefs.length > 0) {
          text += "BELIEF AUDIT\n";
          BELIEF_QUESTIONS.forEach((q, i) => {
            const before = weekEntries.find(e => e.question_key === `belief_${i}_before`);
            const after = weekEntries.find(e => e.question_key === `belief_${i}_after`);
            if (before || after) {
              text += `  "${q}"\n`;
              if (before?.answer_text) text += `    Before: ${before.answer_text}\n`;
              if (after?.answer_text) text += `    After: ${after.answer_text}\n`;
            }
          });
          text += "\n";
        }

        const reflections = weekEntries.filter(e => e.question_key.startsWith("reflection_"));
        if (reflections.length > 0) {
          text += "REFLECTIONS\n";
          REFLECTION_QUESTIONS.forEach((q, i) => {
            const entry = weekEntries.find(e => e.question_key === `reflection_${i}`);
            if (entry?.answer_text) text += `  ${q}\n    ${entry.answer_text}\n\n`;
          });
        }

        const weekScores = scores.filter(s => s.week_number === week.number);
        if (weekScores.length > 0) {
          text += "SELF AUDIT\n";
          weekScores.forEach(s => { text += `  ${s.domain_name}: ${s.score}/5\n`; });
          text += "\n";
        }

        const weekCommitment = commitments.find(c => c.week_number === week.number);
        if (weekCommitment?.commitment_text) {
          text += "COMMITMENT\n";
          text += `  What: ${weekCommitment.commitment_text}\n`;
          if (weekCommitment.why_text) text += `  Why: ${weekCommitment.why_text}\n`;
          if (weekCommitment.checkin_sentence) text += `  Check-in: ${weekCommitment.checkin_sentence}\n`;
          text += "\n";
        }
      }

      text += "\n══════════════════════════════\n© 2026 MINDCAST\n══════════════════════════════\n";

      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mindcast-term2-journal.txt";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Download started", description: "Your journal is being downloaded." });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
    setGenerating(false);
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="heading-display text-3xl text-primary mb-2">MY DOWNLOADS</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body">Export your journal and reflections.</p>

        <div className="border-[3px] border-primary p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Download size={20} className="text-primary" />
            <h2 className="heading-display text-xl text-primary">TERM 2 JOURNAL</h2>
          </div>

          {!canDownload ? (
            <div className="flex items-center gap-3 bg-muted/30 p-4 border-2 border-primary/10 mb-4">
              <Lock size={16} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-body">
                Your full journal export unlocks after Week 8 to encourage completion. You're on Week {CURRENT_WEEK}.
              </p>
            </div>
          ) : null}

          <div className="flex gap-2 mb-4">
            {(["all", "private", "shared"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] tracking-widest px-3 py-1 border-2 ${
                  filter === f ? "bg-primary text-secondary border-primary" : "border-primary/20 text-primary/60"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={generateTextExport}
            disabled={generating || !canDownload}
            className="btn-navy text-xs py-3 px-8 disabled:opacity-30"
          >
            {generating ? "GENERATING..." : "DOWNLOAD MY JOURNAL (TXT)"}
          </button>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalDownloads;
