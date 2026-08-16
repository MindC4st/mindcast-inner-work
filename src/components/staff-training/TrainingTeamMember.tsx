import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { stt } from "@/lib/stt";
import { STATUS_LABEL, type ModuleStatus } from "@/lib/training";
import { ArrowLeft, Loader2, RefreshCw, StickyNote } from "lucide-react";
import { toast } from "sonner";

type ProgressRow = {
  id: string; module_id: string; module_code: string; module_version: number;
  status: string; score: number | null; attempts: number; started_at: string;
  completed_at: string | null; due_at: string | null; expires_at: string | null; superseded: boolean;
};
type ModuleLite = { id: string; code: string; title: string };
type ComplianceRow = { id: string; category: string; status: string; detail: string; valid_from: string | null; valid_until: string | null; created_at: string };

const TrainingTeamMember = () => {
  const { userId = "" } = useParams();
  const [profile, setProfile] = useState<{ name: string | null; display_name: string | null; email: string | null } | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [modules, setModules] = useState<ModuleLite[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRow[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [category, setCategory] = useState("note");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: pr }, { data: m }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("name, display_name, email").eq("user_id", userId).maybeSingle(),
        supabase.from("staff_training_progress" as never).select("*").eq("user_id", userId).order("started_at", { ascending: false }),
        supabase.from("staff_training_modules" as never).select("id, code, title"),
        supabase.from("staff_compliance_records" as never).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      setProfile((p ?? null) as typeof profile);
      setProgress((pr ?? []) as unknown as ProgressRow[]);
      setModules((m ?? []) as unknown as ModuleLite[]);
      setCompliance((c ?? []) as unknown as ComplianceRow[]);
      setLoading(false);
    })();
  }, [userId]);

  const modTitle = (code: string) => modules.find((m) => m.code === code)?.title || code;

  const recertify = async (row: ProgressRow) => {
    setBusy(row.id);
    const { error: supErr } = await (supabase.from("staff_training_progress" as never) as unknown as {
      update: (p: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { message: string } | null }> }
    }).update({ superseded: true }).eq("id", row.id);
    const mod = modules.find((m) => m.code === row.module_code);
    const { error: insErr } = supErr ? { error: supErr } : await stt("staff_training_progress").insert({
      user_id: userId, module_id: row.module_id, module_code: row.module_code, module_version: row.module_version,
    });
    setBusy(null);
    if (supErr || insErr) { toast.error((supErr || insErr)?.message || "Could not open recertification"); return; }
    setProgress((ps) => [
      { ...row, superseded: true },
      { ...row, id: `${row.id}-new`, status: "in_progress", superseded: false, attempts: 0, score: null, completed_at: null, started_at: new Date().toISOString() },
      ...ps.filter((p) => p.id !== row.id),
    ]);
    toast.success(`Recertification opened for ${modTitle(row.module_code)} — their history is preserved.`);
  };

  const addNote = async () => {
    if (!detail.trim() || busy) return;
    setBusy("note");
    const { error } = await stt("staff_compliance_records").insert({
      user_id: userId, category, detail: detail.trim(), recorded_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    });
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    setCompliance((c) => [{ id: "new", category, status: "current", detail: detail.trim(), valid_from: null, valid_until: null, created_at: new Date().toISOString() }, ...c]);
    setNoteOpen(false);
    setDetail("");
    toast.success("Recorded.");
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link to="/admin/staff-training/team" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-[11px] font-body tracking-widest uppercase transition-colors mb-6">
        <ArrowLeft size={12} /> Team compliance
      </Link>
      <h2 className="font-display text-2xl text-foreground tracking-wider mb-1">
        {profile?.display_name || profile?.name || profile?.email || "Team member"}
      </h2>
      <p className="text-muted-foreground text-sm font-body mb-6">{profile?.email}</p>

      <div className="space-y-2 mb-8">
        {progress.map((row) => (
          <div key={row.id} className={`flex items-center gap-4 rounded-lg border px-4 py-3.5 ${row.superseded ? "border-border bg-card opacity-60" : "border-border bg-card"}`}>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-body text-foreground">
                {modTitle(row.module_code)} <span className="text-muted-foreground">v{row.module_version}</span>
                {row.superseded && <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">historical</span>}
              </span>
              <span className="block text-[11px] font-body text-muted-foreground mt-0.5">
                {row.completed_at
                  ? `Completed ${new Date(row.completed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}`
                  : `Started ${new Date(row.started_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}`}
                {row.score !== null && <> · {Math.round(row.score * 100)}%</>}
                {row.expires_at && <> · due again {new Date(row.expires_at).toLocaleDateString("en-NZ", { month: "short", year: "numeric" })}</>}
              </span>
            </span>
            <span className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">
              {row.superseded ? "Superseded" : STATUS_LABEL[(row.status === "in_progress" ? "in_progress" : row.status) as ModuleStatus] || row.status}
            </span>
            {!row.superseded && ["passed", "acknowledged", "expired"].includes(row.status) && (
              <button onClick={() => recertify(row)} disabled={busy === row.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-primary/50 text-primary text-[10px] font-body tracking-widest uppercase hover:bg-primary/10 transition-colors disabled:opacity-40">
                <RefreshCw size={11} /> Recertify
              </button>
            )}
          </div>
        ))}
        {progress.length === 0 && (
          <p className="text-muted-foreground text-sm font-body py-8 text-center">No training activity yet.</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-body tracking-[0.2em] uppercase text-muted-foreground">Compliance record</h3>
        <button onClick={() => setNoteOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border text-muted-foreground hover:text-foreground text-[10px] font-body tracking-widest uppercase transition-colors">
          <StickyNote size={11} /> Record
        </button>
      </div>

      {noteOpen && (
        <div className="rounded-lg border border-border bg-card p-4 mb-4 space-y-3">
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary">
            <option value="note">Note</option>
            <option value="exception">Exception / stand-down decision</option>
            <option value="safety_check">Safety check status</option>
            <option value="retraining">Targeted retraining</option>
            <option value="staff_start">Staff start date</option>
          </select>
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3}
            placeholder="Facts only — this record is administrative, not a safeguarding case file."
            className="w-full bg-transparent border border-border rounded-md px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-y" />
          <button onClick={addNote} disabled={busy === "note" || !detail.trim()}
            className="px-4 py-2 rounded-sm bg-primary text-primary-foreground text-[10px] font-body tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-40">
            Save record
          </button>
        </div>
      )}

      <div className="space-y-2">
        {compliance.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">
              {c.category.replace("_", " ")} · {new Date(c.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="text-[13px] font-body text-foreground/80 mt-1">{c.detail}</p>
          </div>
        ))}
        {compliance.length === 0 && <p className="text-muted-foreground text-sm font-body py-6 text-center">No compliance records.</p>}
      </div>
    </div>
  );
};

export default TrainingTeamMember;
