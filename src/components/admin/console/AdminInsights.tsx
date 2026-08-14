import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { CreditCard, Baby, TrendingUp, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Profile = { membership_status: string | null; kids_addon: boolean | null; created_at: string };

const STATUS_COLORS: Record<string, string> = {
  active: "#3585AF",
  trialing: "#C5E3F3",
  past_due: "#8E9299",
  canceled: "#475569",
  none: "#1E293B",
};

const Card = ({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string | number; sub?: string }) => (
  <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-[#3585AF]" />
      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299]">{label}</p>
    </div>
    <p className="font-display text-3xl text-white tracking-wider">{value}</p>
    {sub && <p className="text-[11px] font-body text-[#8E9299] mt-1">{sub}</p>}
  </div>
);

const AdminInsights = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { count }] = await Promise.all([
        (supabase as any).from("profiles").select("membership_status, kids_addon, created_at").limit(2000),
        (supabase as any).from("check_ins").select("id", { count: "exact", head: true }),
      ]);
      setProfiles(p || []);
      setCheckInCount(count || 0);
      setLoading(false);
    })();
  }, []);

  const statusMix = useMemo(() => {
    const c: Record<string, number> = {};
    profiles.forEach((p) => {
      const k = p.membership_status || "none";
      c[k] = (c[k] || 0) + 1;
    });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [profiles]);

  const signups = useMemo(() => {
    const map = new Map<string, number>();
    profiles.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    let running = 0;
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, n]) => {
      running += n;
      const [y, m] = key.split("-").map(Number);
      return {
        label: new Date(y, m - 1, 1).toLocaleDateString("en-NZ", { month: "short", year: "2-digit" }),
        Members: running,
      };
    });
  }, [profiles]);

  const kidsAddon = profiles.filter((p) => p.kids_addon).length;
  const active = profiles.filter((p) => p.membership_status === "active" || p.membership_status === "trialing").length;

  if (loading) {
    return <div className="py-24 flex justify-center"><span className="text-[#8E9299] text-xs font-body tracking-widest uppercase animate-pulse">Loading insights…</span></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wider">Insights</h2>
        <p className="text-[#8E9299] text-sm font-body mt-1">Membership health and community growth at a glance.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={CreditCard} label="Active members" value={active} sub={`${profiles.length} total profiles`} />
        <Card icon={Baby} label="Kids add-ons" value={kidsAddon} sub="families on the child track" />
        <Card icon={Activity} label="Total check-ins" value={checkInCount} sub="NFC + kiosk + manual" />
        <Card icon={TrendingUp} label="Active rate" value={`${profiles.length ? Math.round((active / profiles.length) * 100) : 0}%`} sub="active or trialing" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] mb-4">Membership mix</p>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="#0A1120">
                  {statusMix.map((s) => (
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
            {statusMix.map((s) => (
              <span key={s.name} className="flex items-center gap-2 text-[11px] font-body text-[#8E9299]">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLORS[s.name] || "#64748B" }} />
                {s.name} · {s.value}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] mb-4">Cumulative members</p>
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
