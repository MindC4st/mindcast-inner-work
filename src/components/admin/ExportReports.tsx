import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const toCsv = (headers: string[], rows: string[][]) => {
  const escape = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
};

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const ExportReports = () => {
  const { cohortId } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const exportBookmarkResponses = async () => {
    if (!cohortId) return;
    setLoading("bookmark");
    try {
      const [respRes, profilesRes] = await Promise.all([
        supabase.from("bookmark_responses").select("*").eq("cohort_id", cohortId).order("week_number"),
        supabase.from("profiles").select("user_id, name"),
      ]);
      const nameMap: Record<string, string> = {};
      (profilesRes.data || []).forEach(p => { nameMap[p.user_id] = p.name; });

      const headers = ["Member", "Week", "Bookmark ID", "Response", "Voice URL", "Shared", "Date"];
      const rows = (respRes.data || []).map(r => [
        nameMap[r.user_id] || "Unknown",
        String(r.week_number),
        r.bookmark_id,
        r.response_text || "",
        r.voice_url || "",
        r.is_shared ? "Yes" : "No",
        new Date(r.created_at).toLocaleDateString(),
      ]);

      downloadCsv("mindcast-bookmark-responses.csv", toCsv(headers, rows));
      toast.success("Bookmark responses exported");
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  const exportEntries = async () => {
    if (!cohortId) return;
    setLoading("entries");
    try {
      const [entriesRes, profilesRes] = await Promise.all([
        supabase.from("entries").select("*").eq("cohort_id", cohortId).order("week_number"),
        supabase.from("profiles").select("user_id, name"),
      ]);
      const nameMap: Record<string, string> = {};
      (profilesRes.data || []).forEach(p => { nameMap[p.user_id] = p.name; });

      const headers = ["Member", "Week", "Question", "Answer", "Shared", "Date"];
      const rows = (entriesRes.data || []).map(e => [
        nameMap[e.user_id] || "Unknown",
        String(e.week_number),
        e.question_key,
        e.answer_text || "",
        e.is_shared ? "Yes" : "No",
        new Date(e.created_at).toLocaleDateString(),
      ]);

      downloadCsv("mindcast-worksheet-entries.csv", toCsv(headers, rows));
      toast.success("Entries exported");
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  const exportImplementation = async () => {
    if (!cohortId) return;
    setLoading("implementation");
    try {
      const [commRes, checkinRes, profilesRes] = await Promise.all([
        supabase.from("commitments").select("*").eq("cohort_id", cohortId).order("week_number"),
        supabase.from("implementation_checkins").select("*").eq("cohort_id", cohortId).order("week_number"),
        supabase.from("profiles").select("user_id, name"),
      ]);
      const nameMap: Record<string, string> = {};
      (profilesRes.data || []).forEach(p => { nameMap[p.user_id] = p.name; });

      const headers = [
        "Member", "Week", "Commitment", "Why", "Measure", "Obstacle", "Locked",
        "Check-in Status", "What Happened", "Did Achieve", "What Learned",
      ];
      const rows = (commRes.data || []).map(c => {
        const checkin = (checkinRes.data || []).find(ch => ch.user_id === c.user_id && ch.week_number === c.week_number);
        return [
          nameMap[c.user_id] || "Unknown",
          String(c.week_number),
          c.commitment_text || "",
          c.why_text || "",
          c.measure_text || "",
          c.obstacle_text || "",
          c.is_locked ? "Yes" : "No",
          checkin?.status || "",
          checkin?.what_happened || "",
          checkin?.did_achieve || "",
          checkin?.what_learned || "",
        ];
      });

      downloadCsv("mindcast-implementation.csv", toCsv(headers, rows));
      toast.success("Implementation data exported");
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  const exportDomainScores = async () => {
    if (!cohortId) return;
    setLoading("domains");
    try {
      const [scoresRes, profilesRes] = await Promise.all([
        supabase.from("domain_scores").select("*").eq("cohort_id", cohortId).order("week_number"),
        supabase.from("profiles").select("user_id, name"),
      ]);
      const nameMap: Record<string, string> = {};
      (profilesRes.data || []).forEach(p => { nameMap[p.user_id] = p.name; });

      const headers = ["Member", "Week", "Domain", "Score", "Date"];
      const rows = (scoresRes.data || []).map(s => [
        nameMap[s.user_id] || "Unknown",
        String(s.week_number),
        s.domain_name,
        String(s.score),
        new Date(s.created_at).toLocaleDateString(),
      ]);

      downloadCsv("mindcast-domain-scores.csv", toCsv(headers, rows));
      toast.success("Domain scores exported");
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(null);
  };

  const exports = [
    { key: "bookmark", title: "BOOKMARK RESPONSES", desc: "All podcast reflection responses across sessions", fn: exportBookmarkResponses },
    { key: "entries", title: "WORKSHEET ENTRIES", desc: "All belief audits, reflections, and self-audit text entries", fn: exportEntries },
    { key: "implementation", title: "IMPLEMENTATION GOALS & CHECK-INS", desc: "Commitments, check-in status, and learnings per week", fn: exportImplementation },
    { key: "domains", title: "DOMAIN SCORES", desc: "Self-audit domain scores per member per week", fn: exportDomainScores },
  ];

  return (
    <div>
      <h2 className="font-display text-lg tracking-widest text-primary mb-6">EXPORT & REPORTS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exports.map(ex => (
          <div key={ex.key} className="border border-primary/10 p-6 flex flex-col justify-between">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet size={16} className="text-primary/40" />
                <h3 className="font-display text-xs tracking-widest text-primary">{ex.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{ex.desc}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={ex.fn}
              disabled={loading === ex.key}
              className="text-[10px] tracking-widest self-start"
            >
              <Download size={12} />
              {loading === ex.key ? "EXPORTING..." : "DOWNLOAD CSV"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportReports;
