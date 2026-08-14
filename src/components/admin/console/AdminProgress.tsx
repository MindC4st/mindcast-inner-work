import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { CheckCircle2, PenLine, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CheckIn = { checked_in_at: string; track: string | null };
type Completion = { week_number: number; audience_type: string | null };
type Journal = { week_number: number; track: string | null };

const TRACKS = ["Adult", "Teen", "Child"] as const;

const mondayOf = (d: Date): Date => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

const Stat = ({ icon: Icon, label, value, tone }: {
  icon: LucideIcon; label: string; value: string | number; tone?: string;
}) => (
  <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className={tone || "text-[#3585AF]"} />
      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299]">{label}</p>
    </div>
    <p className="font-display text-3xl text-white tracking-wider">{value}</p>
  </div>
);

const AdminProgress = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: ci }, { data: lc }, { data: lj }] = await Promise.all([
        (supabase as any).from("check_ins").select("checked_in_at, track").order("checked_in_at", { ascending: false }).limit(5000),
        (supabase as any).from("lesson_completions").select("week_number, audience_type").limit(5000),
        (supabase as any).from("lesson_journal").select("week_number, track").limit(5000),
      ]);
      setCheckIns(ci || []);
      setCompletions(lc || []);
      setJournals(lj || []);
      setLoading(false);
    })();
  }, []);

  const weekly = useMemo(() => {
    const map = new Map<string, { label: string; Adult: number; Teen: number; Child: number; total: number }>();
    checkIns.forEach((ci) => {
      if (!ci.checked_in_at) return;
      const mon = mondayOf(new Date(ci.checked_in_at));
      const key = mon.toISOString().slice(0, 10);
      if (!map.has(key)) {
        map.set(key, {
          label: mon.toLocaleDateString("en-NZ", { day: "numeric", month: "short" }),
          Adult: 0, Teen: 0, Child: 0, total: 0,
        });
      }
      const row = map.get(key)!;
      const track = (TRACKS as readonly string[]).includes(ci.track || "") ? (ci.track as typeof TRACKS[number]) : "Adult";
      row[track] += 1;
      row.total += 1;
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-10).map(([, v]) => v);
  }, [checkIns]);

  const perWeek = useMemo(() => {
    const comp = new Map<number, number>();
    completions.forEach((c) => comp.set(c.week_number, (comp.get(c.week_number) || 0) + 1));
    const jour = new Map<number, number>();
    journals.forEach((j) => jour.set(j.week_number, (jour.get(j.week_number) || 0) + 1));
    const weeks = [...new Set([...comp.keys(), ...jour.keys()])].sort((a, b) => a - b).slice(0, 12);
    return weeks.map((w) => ({ label: `W${w}`, Lessons: comp.get(w) || 0, Journals: jour.get(w) || 0 }));
  }, [completions, journals]);

  const trackTotals = useMemo(() => {
    const t: Record<string, number> = { Adult: 0, Teen: 0, Child: 0 };
    checkIns.forEach((ci) => {
      const k = (TRACKS as readonly string[]).includes(ci.track || "") ? ci.track! : "Adult";
      t[k] = (t[k] || 0) + 1;
    });
    return t;
  }, [checkIns]);

  if (loading) {
    return <div className="py-24 flex justify-center"><span className="text-[#8E9299] text-xs font-body tracking-widest uppercase animate-pulse">Loading progress…</span></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wider">Progress</h2>
        <p className="text-[#8E9299] text-sm font-body mt-1">Attendance, lesson completion and journaling across the three tracks.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat icon={Users} label="Check-ins · Adult" value={trackTotals.Adult} />
        <Stat icon={Users} label="Check-ins · Teen" value={trackTotals.Teen} tone="text-[#C5E3F3]" />
        <Stat icon={Users} label="Check-ins · Child" value={trackTotals.Child} tone="text-[#8E9299]" />
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] mb-4">Live attendance by session week</p>
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
              <Bar dataKey="Adult" stackId="t" fill="#3585AF" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Teen" stackId="t" fill="#C5E3F3" />
              <Bar dataKey="Child" stackId="t" fill="#8E9299" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-4 mb-4">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] flex items-center gap-2"><CheckCircle2 size={12} /> Lessons completed</p>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] flex items-center gap-2"><PenLine size={12} /> Journal entries</p>
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
