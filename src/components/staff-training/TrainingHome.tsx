import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  GATE_LABEL, STATUS_LABEL, dueDateFor, memberContactCurrent, moduleStatus,
  type GateRule, type ModuleStatus,
} from "@/lib/training";
import { ArrowRight, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

export type ModuleRow = {
  id: string; code: string; title: string; summary: string; position: number;
  gate: GateRule; pass_mark: number | null; ack_required: boolean;
  version: number; effective_date: string; est_minutes: number;
};
type ProgressRow = {
  id: string; module_id: string; module_version: number; status: string;
  score: number | null; completed_at: string | null; due_at: string | null;
  expires_at: string | null;
};

const PILL: Record<ModuleStatus, string> = {
  not_started: "bg-foreground/[0.05] text-muted-foreground",
  in_progress: "bg-primary/15 text-primary",
  passed: "bg-primary/20 text-primary",
  acknowledged: "bg-primary/20 text-primary",
  failed: "bg-foreground/[0.06] text-foreground",
  overdue: "bg-red-500/15 text-red-300",
  expired: "bg-red-500/15 text-red-300",
};

const TrainingHome = ({ embedded = false }: { embedded?: boolean }) => {
  const { user, role } = useAuth();
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: m }, { data: p }, { data: start }, { data: prof }] = await Promise.all([
        supabase.from("staff_training_modules" as never).select("*").order("position"),
        supabase.from("staff_training_progress" as never).select("*")
          .eq("user_id", user.id).eq("superseded", false),
        supabase.from("staff_compliance_records" as never).select("valid_from")
          .eq("user_id", user.id).eq("category", "staff_start").limit(1),
        supabase.from("profiles").select("created_at").eq("user_id", user.id).maybeSingle(),
      ]);
      setModules((m ?? []) as unknown as ModuleRow[]);
      setProgress((p ?? []) as unknown as ProgressRow[]);
      const startRow = (start ?? []) as { valid_from: string | null }[];
      const anchorIso = startRow[0]?.valid_from || (prof as { created_at?: string } | null)?.created_at || null;
      setAnchor(anchorIso ? new Date(anchorIso) : null);
      setLoading(false);
    })();
  }, [user]);

  const rows = useMemo(() => modules.map((mod) => {
    const prog = progress.find((p) => p.module_id === mod.id) || null;
    const dueAt = dueDateFor(mod.gate, anchor);
    const status = moduleStatus({
      progress: prog,
      dueAt,
      now: new Date(),
    });
    return { mod, prog, dueAt, status };
  }), [modules, progress, anchor]);

  const current = useMemo(
    () => memberContactCurrent(rows.map((r) => ({ gate: r.mod.gate, status: r.status }))),
    [rows],
  );
  const actionNeeded = rows.filter((r) => r.status === "overdue" || r.status === "expired" || r.status === "failed");

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className={embedded ? "" : "max-w-4xl mx-auto px-6 py-8"}>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-foreground tracking-wider">Staff training</h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Your training path for the {role === "admin" ? "admin" : "facilitator"} role — the same ten modules for everyone, repeated annually.
          </p>
        </div>
        <div className={`ml-auto flex items-center gap-2 rounded-md px-4 py-2.5 ${current ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-300"}`}>
          {current ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
          <span className="text-xs font-body tracking-widest uppercase">
            {current ? "Current for member-facing work" : "Not current — member-contact gate open"}
          </span>
        </div>
      </div>

      {actionNeeded.length > 0 && (
        <p className="mb-6 rounded-md border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-[12px] font-body text-red-200">
          {actionNeeded.length} module{actionNeeded.length > 1 ? "s" : ""} need{actionNeeded.length > 1 ? "" : "s"} your attention.
          Anyone overdue on a member-contact gate stands down from member-facing duties until current.
        </p>
      )}

      <div className="space-y-2">
        {rows.map(({ mod, prog, dueAt, status }) => (
          <Link key={mod.id} to={`/admin/staff-training/module/${mod.id}`}
            className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5 hover:border-primary/40 transition-colors">
            <span className="font-display text-lg text-muted-foreground w-8 shrink-0">{String(mod.position).padStart(2, "0")}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-body text-foreground truncate">{mod.title}</span>
              <span className="block text-[11px] font-body text-muted-foreground mt-0.5">
                {GATE_LABEL[mod.gate]} ·{" "}
                {mod.pass_mark === null ? "Acknowledgement" : `${Math.round(mod.pass_mark * 100)}% pass`} ·{" "}
                ~{mod.est_minutes} min
                {dueAt && status !== "passed" && status !== "acknowledged" && (
                  <> · due {dueAt.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</>
                )}
                {prog?.completed_at && (
                  <> · completed {new Date(prog.completed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })} (v{prog.module_version})</>
                )}
                {prog?.expires_at && (
                  <> · next due {new Date(prog.expires_at).toLocaleDateString("en-NZ", { month: "short", year: "numeric" })}</>
                )}
              </span>
            </span>
            <span className={`px-2.5 py-1 rounded-sm text-[10px] font-body tracking-widest uppercase shrink-0 ${PILL[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            <ArrowRight size={14} className="text-muted-foreground shrink-0" />
          </Link>
        ))}
        {rows.length === 0 && (
          <p className="text-muted-foreground text-sm font-body py-12 text-center">
            No training is assigned to your role yet.
          </p>
        )}
      </div>

      <div className="mt-6 flex gap-6 text-[11px] font-body text-muted-foreground">
        <Link to="/admin/staff-training/policies" className="underline underline-offset-2 hover:text-foreground transition-colors">Policy acknowledgements</Link>
        <Link to="/admin/staff-training/documents" className="underline underline-offset-2 hover:text-foreground transition-colors">Controlled documents</Link>
        {(role === "admin") && (
          <Link to="/admin/staff-training/team" className="underline underline-offset-2 hover:text-foreground transition-colors">Team compliance</Link>
        )}
      </div>
    </div>
  );
};

export default TrainingHome;
