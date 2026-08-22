import { useState } from "react";
import { db } from "@/lib/db";
import type { Tables } from "@/integrations/supabase/types";
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
  const [loading, setLoading] = useState<string | null>(null);

  const nameMapOf = async (): Promise<Record<string, string>> => {
    const { data } = await db
      .from("profiles").select("id, name, display_name, email");
    const map: Record<string, string> = {};
    (data || []).forEach(p => { map[p.id] = p.display_name || p.name || p.email || "Unknown"; });
    return map;
  };

  const exportMembers = async () => {
    setLoading("members");
    try {
      const { data } = await db
        .from("profiles")
        .select("name, display_name, email, age_group, membership_status, membership_tier, kids_addon, nfc_id, created_at")
        .order("created_at", { ascending: false });
      const headers = ["Member", "Display name", "Email", "Age group", "Status", "Tier", "Kids add-on", "Bracelet", "Joined"];
      const rows = (data || []).map(p => [
        p.name || "", p.display_name || "", p.email || "", p.age_group || "",
        p.membership_status || "", p.membership_tier || "", p.kids_addon ? "Yes" : "No",
        p.nfc_id || "", new Date(p.created_at).toLocaleDateString(),
      ]);
      downloadCsv("mindcast-members.csv", toCsv(headers, rows));
      toast.success("Members exported");
    } catch (e) { toast.error((e as Error).message); }
    setLoading(null);
  };

  const exportAttendance = async () => {
    setLoading("attendance");
    try {
      const [ci, names] = await Promise.all([
        db.from("check_ins")
          .select("display_name, profile_id, track, source, checked_in_at, left_early_at")
          .order("checked_in_at", { ascending: false }).limit(5000),
        nameMapOf(),
      ]);
      const headers = ["Member", "Wall name", "Track", "Source", "Checked in", "Left early"];
      const rows = ((ci || []) as unknown as Tables<"check_ins">[]).map(c => [
        c.profile_id ? names[c.profile_id] || "Unknown" : "Walk-in",
        c.display_name || "", c.track || "", c.source || "",
        new Date(c.checked_in_at).toLocaleString(), c.left_early_at ? new Date(c.left_early_at).toLocaleString() : "",
      ]);
      downloadCsv("mindcast-attendance.csv", toCsv(headers, rows));
      toast.success("Attendance exported");
    } catch (e) { toast.error((e as Error).message); }
    setLoading(null);
  };

  const exportJournals = async () => {
    setLoading("journals");
    try {
      const [j, names] = await Promise.all([
        db.from("lesson_journal")
          .select("profile_id, week_number, track, reflection_answer, video_question_1_response, video_question_2_response, activity_response, weekly_intention, updated_at")
          .order("week_number").limit(5000),
        nameMapOf(),
      ]);
      const headers = ["Member", "Week", "Track", "Video Q1", "Video Q2", "Reflection", "Activity", "Intention", "Updated"];
      const rows = ((j || []) as unknown as Tables<"lesson_journal">[]).map(r => [
        names[r.profile_id] || "Unknown", String(r.week_number), r.track || "",
        r.video_question_1_response || "", r.video_question_2_response || "",
        r.reflection_answer || "", r.activity_response || "", r.weekly_intention || "",
        new Date(r.updated_at).toLocaleDateString(),
      ]);
      downloadCsv("mindcast-journals.csv", toCsv(headers, rows));
      toast.success("Journals exported");
    } catch (e) { toast.error((e as Error).message); }
    setLoading(null);
  };

  const exportCompletions = async () => {
    setLoading("completions");
    try {
      const { data } = await db
        .from("lesson_completions")
        .select("user_id, week_number, audience_type, created_at")
        .order("week_number").limit(5000);
      const names = await nameMapOf();
      const headers = ["Member", "Week", "Track", "Completed"];
      const rows = ((data || []) as unknown as { user_id: string; week_number: number; audience_type: string; created_at: string }[]).map(r => [
        names[r.user_id] || "Unknown", String(r.week_number), r.audience_type || "",
        new Date(r.created_at).toLocaleDateString(),
      ]);
      downloadCsv("mindcast-completions.csv", toCsv(headers, rows));
      toast.success("Completions exported");
    } catch (e) { toast.error((e as Error).message); }
    setLoading(null);
  };

  const exports = [
    { key: "members", title: "MEMBERS", desc: "Roster with status, tier, kids add-on and bracelet tokens", fn: exportMembers },
    { key: "attendance", title: "ATTENDANCE", desc: "Every check-in with track, source and left-early flags", fn: exportAttendance },
    { key: "journals", title: "JOURNALS", desc: "Per-week reflections, video answers and intentions", fn: exportJournals },
    { key: "completions", title: "COMPLETIONS", desc: "Lesson completions per member per week", fn: exportCompletions },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exports.map(ex => (
          <div key={ex.key} className="border border-border rounded-lg p-5 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet size={14} className="text-primary" />
              <h3 className="text-[11px] font-body tracking-[0.15em] text-primary">{ex.title}</h3>
            </div>
            <p className="text-[11px] font-body text-muted-foreground mb-4">{ex.desc}</p>
            <Button variant="outline" size="sm" onClick={ex.fn} disabled={loading !== null}
              className="gap-2">
              <Download size={13} /> {loading === ex.key ? "Exportingâ€¦" : "Export CSV"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExportReports;