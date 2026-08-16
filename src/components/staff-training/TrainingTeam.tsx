import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  dueDateFor, memberContactCurrent, moduleStatus, type ModuleStatus,
} from "@/lib/training";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type StaffUser = { user_id: string; role: string; name: string | null; display_name: string | null; email: string | null; created_at: string };
type ModuleLite = { id: string; code: string; title: string; position: number; gate: Parameters<typeof dueDateFor>[0] };
type ProgressLite = { user_id: string; module_id: string; status: string; expires_at: string | null; due_at: string | null; module_version: number };

const DOT: Record<ModuleStatus, string> = {
  not_started: "bg-foreground/10",
  in_progress: "bg-primary",
  passed: "bg-primary",
  acknowledged: "bg-primary",
  failed: "bg-primary/50",
  overdue: "bg-red-400",
  expired: "bg-red-400",
};

const TrainingTeam = () => {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [modules, setModules] = useState<ModuleLite[]>([]);
  const [progress, setProgress] = useState<ProgressLite[]>([]);
  const [starts, setStarts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: roles }, { data: m }, { data: p }, { data: sr }] = await Promise.all([
        supabase.from("user_roles" as never).select("user_id, role").in("role", ["facilitator", "admin"]),
        supabase.from("staff_training_modules" as never).select("id, code, title, position, gate").order("position"),
        supabase.from("staff_training_progress" as never).select("user_id, module_id, status, expires_at, due_at, module_version").eq("superseded", false),
        supabase.from("staff_compliance_records" as never).select("user_id, valid_from").eq("category", "staff_start"),
      ]);
      const ids = ((roles ?? []) as { user_id: string; role: string }[]).map((r) => r.user_id);
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("user_id, name, display_name, email, created_at").in("user_id", ids)
        : { data: [] };
      const roleByUser = new Map(((roles ?? []) as { user_id: string; role: string }[]).map((r) => [r.user_id, r.role]));
      setStaff(((profs ?? []) as Omit<StaffUser, "role">[]).map((p) => ({ ...p, role: roleByUser.get(p.user_id) || "facilitator" })));
      setModules((m ?? []) as unknown as ModuleLite[]);
      setProgress((p ?? []) as unknown as ProgressLite[]);
      const st: Record<string, string> = {};
      ((sr ?? []) as { user_id: string; valid_from: string | null }[]).forEach((r) => { if (r.valid_from) st[r.user_id] = r.valid_from; });
      setStarts(st);
      setLoading(false);
    })();
  }, []);

  const matrix = useMemo(() => staff.map((s) => {
    const anchor = starts[s.user_id] ? new Date(starts[s.user_id]) : new Date(s.created_at);
    const rows = modules.map((mod) => {
      const prog = progress.find((p) => p.user_id === s.user_id && p.module_id === mod.id) || null;
      return {
        mod,
        status: moduleStatus({
          progress: prog,
          dueAt: dueDateFor(mod.gate, anchor),
          now: new Date(),
        }),
      };
    });
    return {
      staff: s,
      rows,
      current: memberContactCurrent(rows.map((r) => ({ gate: r.mod.gate, status: r.status }))),
    };
  }), [staff, modules, progress, starts]);

  const exportCsv = () => {
    const esc = (v: string) => `"${(v || "").replace(/"/g, '""')}"`;
    const head = ["Member", "Email", "Role", "Member-contact current", ...modules.map((m) => m.code)].map(esc).join(",");
    const lines = matrix.map((row) => [
      row.staff.display_name || row.staff.name || row.staff.email || "",
      row.staff.email || "",
      row.staff.role,
      row.current ? "yes" : "no",
      ...row.rows.map((r) => r.status),
    ].map(esc).join(","));
    const blob = new Blob([[head, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindcast-training-compliance.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Compliance matrix exported — response content is never included.");
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-foreground tracking-wider">Team compliance</h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Who is current, due soon or overdue — at a module level. Free-text answers stay private to each worker.
          </p>
        </div>
        <button onClick={exportCsv}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md border border-primary/50 text-primary text-[11px] font-body tracking-widest uppercase hover:bg-primary/10 transition-colors">
          <Download size={13} /> Export
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-card text-left text-[10px] text-muted-foreground uppercase tracking-widest">
              <th className="px-4 py-3">Team member</th>
              <th className="px-3 py-3">Gate</th>
              {modules.map((m) => (
                <th key={m.id} className="px-2 py-3 text-center" title={m.title}>{String(m.position).padStart(2, "0")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.staff.user_id} className="border-t border-border hover:bg-foreground/[0.03] transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/admin/staff-training/team/${row.staff.user_id}`} className="text-foreground hover:text-foreground underline-offset-2 hover:underline">
                    {row.staff.display_name || row.staff.name || row.staff.email}
                  </Link>
                  <span className="block text-[10px] text-muted-foreground">{row.staff.role}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-sm text-[10px] tracking-widest uppercase ${row.current ? "bg-primary/15 text-primary" : "bg-red-500/15 text-red-300"}`}>
                    {row.current ? "Current" : "Stand down"}
                  </span>
                </td>
                {row.rows.map((r) => (
                  <td key={r.mod.id} className="px-2 py-3 text-center" title={`${r.mod.title}: ${r.status}`}>
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${DOT[r.status]}`} />
                  </td>
                ))}
              </tr>
            ))}
            {matrix.length === 0 && (
              <tr><td colSpan={3 + modules.length} className="px-4 py-12 text-center text-muted-foreground">No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-body text-muted-foreground">
        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-foreground/10" /> Not started</span>
        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> In progress</span>
        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Passed / acknowledged</span>
        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Overdue / expired</span>
      </div>
    </div>
  );
};

export default TrainingTeam;
