import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { CreditCard, Baby, TrendingUp, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type InsightsStats = {
  status_mix: { name: string; value: number }[];
  signups_by_month: { month: string; new: number }[];
  totals: { profiles: number; active: number; kids_addon: number; checkins: number };
};

const STATUS_COLORS: Record<string, string> = {
  active: "#3585AF",
  trialing: "#C5E3F3",
  past_due: "#8E9299",
  canceled: "#475569",
  none: "#1E293B",
};

const Card = ({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string | number; sub?: string }) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-primary" />
      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
    </div>
    <p className="font-display text-3xl text-foreground tracking-wider">{value}</p>
    {sub && <p className="text-[11px] font-body text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const AdminInsights = () => {
  const [stats, setStats] = useState<InsightsStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: rpcErr } = await supabase.rpc("admin_insights_stats" as never);
      if (rpcErr) { setError(rpcErr.message); return; }
      setStats(data as unknown as InsightsStats);
    })();
  }, []);

  const signups = useMemo(() => {
    let running = 0;
    return (stats?.signups_by_month || []).map((m) => {
      running += m.new;
      const [y, mo] = m.month.split("-").map(Number);
      return {
        label: new Date(y, mo - 1, 1).toLocaleDateString("en-NZ", { month: "short", year: "2-digit" }),
        Members: running,
      };
    });
  }, [stats]);

  if (error) {
    return <p className="text-muted-foreground text-sm font-body py-12 text-center">Couldn't load insights: {error}</p>;
  }
  if (!stats) {
    return <div className="py-24 flex justify-center"><span className="text-muted-foreground text-xs font-body tracking-widest uppercase animate-pulse">Loading insightsâ€¦</span></div>;
  }

  const { totals, status_mix } = stats;
  const activeRate = totals.profiles ? Math.round((totals.active / totals.profiles) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-primary tracking-wider">Insights</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">Membership health and community growth at a glance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={CreditCard} label="Active members" value={totals.active} sub={`${totals.profiles} total profiles`} />
        <Card icon={Baby} label="Kids add-ons" value={totals.kids_addon} sub="families on the child track" />
        <Card icon={Activity} label="Total check-ins" value={totals.checkins} sub="NFC + kiosk + manual" />
        <Card icon={TrendingUp} label="Active rate" value={`${activeRate}%`} sub="active or trialing" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">Membership mix</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={status_mix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="#0A1120">
                  {status_mix.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name] || "#64748B"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0A1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
            {status_mix.map((s) => (
              <span key={s.name} className="flex items-center gap-2 text-[11px] font-body text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLORS[s.name] || "#64748B" }} />
                {s.name} Â· {s.value}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-4">Cumulative members</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signups}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#8E9299" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#8E9299" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0A1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#E2E8F0" }}
                />
                <Area type="monotone" dataKey="Members" stroke="#3585AF" fill="#3585AF" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInsights;