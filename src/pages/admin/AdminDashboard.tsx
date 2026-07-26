import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, PauseCircle,
  Clock, AlertTriangle, XCircle, UserCheck, Users, CalendarCheck,
  Hash, ArrowRight,
} from "lucide-react";

type Member = {
  id: string;
  name: string;
  email: string | null;
  membership_status: string;
  membership_tier: string;
  age_group: string | null;
  gender: string | null;
  date_of_birth: string | null;
  household_id: string | null;
  created_at: string;
  is_active: boolean;
};

type CheckInRow = {
  id: string;
  profile_id: string;
  checked_in_at: string;
  track: string | null;
  source: string;
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  trialing: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  past_due: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  paused: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  lapsed: "bg-foreground/5 text-foreground/40 border-foreground/10",
  none: "bg-foreground/5 text-foreground/40 border-foreground/10",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle2 size={14} className="text-emerald-400" />,
  trialing: <Clock size={14} className="text-sky-400" />,
  past_due: <AlertTriangle size={14} className="text-amber-400" />,
  paused: <PauseCircle size={14} className="text-slate-400" />,
  lapsed: <XCircle size={14} className="text-foreground/30" />,
};

const StatusPill = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1 text-[9px] font-body font-semibold tracking-[0.15em] uppercase px-2 py-1 rounded-sm border ${STATUS_STYLES[status] || STATUS_STYLES.none}`}>
    {STATUS_ICONS[status]}
    {status.replace("_", " ")}
  </span>
);

const TierLabel = ({ tier }: { tier: string }) => {
  if (!tier || tier === "none") return null;
  return (
    <span className="text-[10px] font-body tracking-[0.1em] uppercase text-foreground/50">
      {tier}
    </span>
  );
};

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/"); return; }
  }, [user, authLoading]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: membersData }, { data: ciData }] = await Promise.all([
        (supabase as any).from("profiles").select(
          "id, name, display_name, email, membership_status, membership_tier, age_group, gender, date_of_birth, household_id:household_members!inner(household_id), created_at, is_active"
        ).order("created_at", { ascending: false }).limit(1000),
        (supabase as any).from("check_ins").select(
          "id, profile_id, checked_in_at, track, source"
        ).order("checked_in_at", { ascending: false }).limit(5000),
      ]);
      setMembers(
        (membersData || []).map((m: any) => ({
          ...m,
          household_id: m.household_id?.[0]?.household_id || null,
        }))
      );
      setCheckIns(ciData || []);
      setLoading(false);
    })();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    members.forEach(m => {
      const k = m.membership_status || "none";
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [members]);

  const checkInsByProfile = useMemo(() => {
    const map: Record<string, CheckInRow[]> = {};
    checkIns.forEach(ci => {
      if (!ci.profile_id) return;
      if (!map[ci.profile_id]) map[ci.profile_id] = [];
      map[ci.profile_id].push(ci);
    });
    return map;
  }, [checkIns]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filterStatus && m.membership_status !== filterStatus) return false;
      if (filterTier && m.membership_tier !== filterTier) return false;
      if (search) {
        const q = search.toLowerCase();
        const display = (m.name || (m as any).display_name || m.email || "").toLowerCase();
        if (!display.includes(q)) return false;
      }
      return true;
    });
  }, [members, filterStatus, filterTier, search]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const distinctTiers = useMemo(() => {
    const s = new Set<string>();
    members.forEach(m => { if (m.membership_tier && m.membership_tier !== "none") s.add(m.membership_tier); });
    return [...s];
  }, [members]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground text-xs tracking-widest animate-pulse">LOADING...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <div className="flex items-center gap-4">
          <Link to="/admin/life-groups" className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-primary font-body hover:text-primary/80 transition-colors">
            <Users size={13} /> Life Groups
          </Link>
          <Link to="/admin" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body text-foreground/40 hover:text-foreground/70">
            <ArrowLeft size={12} /> TOOLS
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-2">DASHBOARD</h1>
        <p className="text-foreground/50 text-sm font-body mb-10">Member registrations, status, and attendance.</p>

        {/* Stats cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-10">
          {["active", "trialing", "past_due", "paused", "lapsed", "none"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? null : status)}
              className={`border rounded-sm p-4 text-left transition-colors ${
                filterStatus === status
                  ? "border-primary bg-primary/5"
                  : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/25"
              }`}
            >
              <div className="font-display text-3xl tracking-wider text-foreground">{counts[status] || 0}</div>
              <div className="text-[10px] font-body uppercase tracking-widest text-foreground/40 mt-1">{status.replace("_", " ")}</div>
            </button>
          ))}
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="flex-1 min-w-[200px] max-w-xs bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-2.5 text-sm text-foreground font-body placeholder:text-foreground/30 focus:outline-none focus:border-foreground/20"
          />
          <div className="flex items-center gap-1.5">
            {distinctTiers.map(tier => (
              <button
                key={tier}
                onClick={() => setFilterTier(filterTier === tier ? null : tier)}
                className={`text-[10px] font-body tracking-[0.12em] uppercase px-3 py-2 rounded-sm border transition-colors ${
                  filterTier === tier
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/10 text-foreground/50 hover:text-foreground/80 hover:border-foreground/25"
                }`}
              >
                {tier}
              </button>
            ))}
            {(filterStatus || filterTier) && (
              <button
                onClick={() => { setFilterStatus(null); setFilterTier(null); }}
                className="text-[10px] tracking-[0.12em] uppercase text-foreground/30 hover:text-foreground/60 px-2"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-[10px] text-foreground/30 font-body ml-auto">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Member list */}
        <div className="border border-foreground/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-foreground/[0.03]">
                <tr className="text-left text-[9px] font-body uppercase tracking-[0.12em] text-foreground/40">
                  <th className="py-3 px-4 w-8" />
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2 hidden md:table-cell">Tier</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 hidden sm:table-cell">Check-ins</th>
                  <th className="py-3 px-2 hidden md:table-cell">Age Group</th>
                  <th className="py-3 px-2 hidden md:table-cell">Gender</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  const memberCIs = checkInsByProfile[m.id] || [];
                  const isExpanded = expandedId === m.id;
                  return (
                    <tbody key={m.id}>
                      <tr
                        onClick={() => toggleExpand(m.id)}
                        className="border-t border-foreground/[0.05] cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="text-foreground/30">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                        </td>
                        <td className="py-3 px-2 text-foreground">
                          <div className="font-medium">{(m as any).display_name || m.name}</div>
                          <div className="text-[10px] text-foreground/40">{m.email || "—"}</div>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell"><TierLabel tier={m.membership_tier} /></td>
                        <td className="py-3 px-2"><StatusPill status={m.membership_status || "none"} /></td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-foreground/60">
                            <CalendarCheck size={12} />
                            {memberCIs.length}
                          </span>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell text-foreground/50 text-xs">{m.age_group || "—"}</td>
                        <td className="py-3 px-2 hidden md:table-cell text-foreground/50 text-xs">{m.gender || "—"}</td>
                      </tr>
                      {/* Expanded check-in log */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            key={`exp-${m.id}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan={7} className="p-0">
                              <div className="bg-foreground/[0.02] border-t border-foreground/[0.04] px-6 py-4">
                                <div className="flex items-center gap-4 mb-3">
                                  <h4 className="text-[10px] font-body tracking-[0.15em] uppercase text-foreground/50">
                                    CHECK-IN HISTORY ({memberCIs.length} total)
                                  </h4>
                                  <span className="text-[9px] text-foreground/30 font-body">
                                    ID: {m.id.slice(0, 8)}…
                                  </span>
                                  {m.date_of_birth && (
                                    <span className="text-[9px] text-foreground/30 font-body">
                                      DOB: {new Date(m.date_of_birth).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="text-[9px] text-foreground/30 font-body">
                                    Joined: {new Date(m.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {memberCIs.length === 0 ? (
                                  <p className="text-xs text-foreground/30 font-body italic">No check-ins recorded.</p>
                                ) : (
                                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                                    {memberCIs.map((ci) => (
                                      <div key={ci.id} className="flex items-center gap-4 text-xs font-body text-foreground/60 hover:text-foreground/80 transition-colors px-2 py-1 rounded hover:bg-foreground/[0.03]">
                                        <span className="text-foreground/30 w-28 shrink-0">
                                          {new Date(ci.checked_in_at).toLocaleDateString("en-NZ", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                                        </span>
                                        <span className="text-foreground/30 w-16 shrink-0">
                                          {new Date(ci.checked_in_at).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {ci.track && (
                                          <span className="text-[10px] tracking-[0.1em] uppercase text-foreground/40 border border-foreground/10 rounded-sm px-1.5 py-0.5 shrink-0">
                                            {ci.track}
                                          </span>
                                        )}
                                        <span className="text-foreground/30 text-[10px] capitalize ml-auto shrink-0">
                                          {ci.source?.replace("_", " ") || "—"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="py-12 text-center text-foreground/30 text-sm font-body">No members match.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
