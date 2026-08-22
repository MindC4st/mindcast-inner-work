import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { CheckCircle2, PenLine, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ProgressStats = {
  checkins_by_week: { week_start: string; Adult: number; Teen: number; Child: number; total: number }[];
  track_totals: { Adult: number; Teen: number; Child: number };
  completions_by_week: { week_number: number; Lessons: number }[];
  journals_by_week: { week_number: number; Journals: number }[];
};

const Stat = ({ icon: Icon, label, value, tone }: {
  icon: LucideIcon; label: string; value: string | number; tone?: string;
}) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className={tone || "text-primary"} />
      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
    </div>
    <p className="font-display text-3xl text-foreground tracking-wider">{value}</p>
  </div>
);

const AdminProgress = () => {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: rpcErr } = await supabase.rpc("admin_progress_stats" as never);
      if (rpcErr) { setError(rpcErr.message); return; }
      setStats(data as unknown as ProgressStats);
    })();
  }, []);

  const weekly = useMemo(
    () => (stats?.checkins_by_week || []).map((w) => ({
      label: new Date(w.week_start).toLocaleDateString("en-NZ", { day: "numeric", month: "short" }),
      Adult: w.Adult, Teen: w.Teen, Child: w.Child,
    })),
    [stats],
  );

  const perWeek = useMemo(() => {
    if (!stats) return [];
    const journals = new Map(stats.journals_by_week.map((j) => [j.week_number, j.Journals]));
    return stats.completions_by_week.map((c) => ({
      label: `W${c.week_number}`,
      Lessons: c.Lessons,
      Journals: journals.get(c.week_number) || 0,
    }));
  }, [stats]);

  if (error) {
    return <p className="text-muted-foreground text-sm font-body py-12 text-center">Couldn't load progress: {error}</p>;
  }
  if (!stats) {
    return <div className="py-24 flex justify-center"><span className="text-muted-foreground text-xs font-body tracking-widest uppercase animate-pulse">Loading progressâ€¦</span></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary tracking-wider">Progress</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">Attendance, lesson completion and journaling across the three tracks.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={Users} label="Check-ins Â· Adult" value={stats.track_totals.Adult} />
        <Stat icon={Users} label="Check-ins Â· Teen" value={stats.track_totals.Teen} tone="text-primary" />
        <Stat icon={Users} label="Check-ins Â· Child" value={stats.track_totals.Child} tone="text-muted-foreground" />
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">Live attendance by session week</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} barSize={18}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#8E9299" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#8E9299" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ background: "#0A1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Adult" stackId="t" fill="#3585AF" />
              <Bar dataKey="Teen" stackId="t" fill="#C5E3F3" />
              <Bar dataKey="Child" stackId="t" fill="#8E9299" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2"><CheckCircle2 size={12} /> Lessons completed</p>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2"><PenLine size={12} /> Journal entries</p>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perWeek} barSize={14}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#8E9299" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#8E9299" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ background: "#0A1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              <Bar dataKey="Lessons" fill="#3585AF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Journals" fill="#C5E3F3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminProgress;