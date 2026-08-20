import { Link, useNavigate } from "react-router-dom";
import { Lock, PlayCircle, CheckCircle2, Shield, Pencil } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { trackForAgeGroup } from "@/hooks/useCurriculumWeeks";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { useEntitlement } from "@/hooks/useEntitlement";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";

type Week = {
  week_number: number;
  title: string | null;
  block_theme: string | null;
  source: string | null;
};

const PortalWeeks = () => {
  const { profile, role, user } = useAuth();
  const navigate = useNavigate();
  const track = trackForAgeGroup(profile?.age_group);
  const { isUnlocked, unlockDate, currentWeek } = useProgramSchedule();
  const { isMember } = useEntitlement();
  const [adminFallback, setAdminFallback] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin" || role === "facilitator" || profile?.is_admin === true || adminFallback;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["facilitator", "admin"]).maybeSingle(),
        supabase.from("profiles").select("is_admin").eq("user_id", user.id).single(),
      ]);
      if (roleRow || profileRow?.is_admin) setAdminFallback(true);
    })();
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Titles and descriptions are the public browse surface. Paid lesson
      // bodies come from the track-safe RPC on the individual week page.
      const { data } = await db.rpc("curriculum_public");
      if (cancelled) return;
      const rows = (data || []).map(r => ({
        week_number: r.week_number,
        block_theme: r.block_theme,
        title: track === "child" ? r.kids_title : r.weekly_theme,
        source: r.core_learning || null,
      }));
      setWeeks(rows);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [track, isAdmin]);

  return (
    <PortalLayout>
      <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">
        {isAdmin && <Shield size={13} className="inline mr-1.5" />}
        Coursebook
      </p>
      <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-2">
        {isAdmin ? "ALL SESSIONS" : "MY SESSIONS"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8 font-body">
        {isAdmin
          ? `Admin view — all 52 weeks of the ${track === "teen" ? "Teen" : track === "child" ? "Child" : "Adult"} track are unlocked.`
          : `All 52 weeks of the ${track === "teen" ? "Teen" : track === "child" ? "Child" : "Adult"} track.`}
      </p>

      {loading && (
        <p className="text-xs font-body uppercase tracking-widest text-foreground/40 animate-pulse">Loading…</p>
      )}

      {!loading && weeks.length === 0 && (
        <p className="text-sm text-foreground/40 font-body mb-4">
          The coursebook isn't available right now. Please try again shortly.
        </p>
      )}

      <div className="space-y-3">
        {weeks.map((w) => {
          const hasContent = !!w.title;
          if (!hasContent) {
            return (
              <div key={w.week_number} className="border border-foreground/[0.06] rounded-sm p-4 md:p-6 opacity-50 cursor-default bg-foreground/[0.01]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-body uppercase tracking-widest text-foreground/40 mb-1">Week {w.week_number}</p>
                    <h2 className="font-display text-base md:text-lg tracking-wider text-foreground/50">COMING SOON</h2>
                  </div>
                  <Lock size={13} strokeWidth={1.5} className="text-foreground/30 shrink-0" />
                </div>
              </div>
            );
          }
          const unlocked = isAdmin || isUnlocked(w.week_number);
          const effectiveMember = isAdmin || isMember;
          const isCurrent = currentWeek === w.week_number;
          const opensOn = unlockDate(w.week_number);
          let status: { icon: JSX.Element; label: string; cls: string };
          if (!effectiveMember) status = { icon: <Lock size={13} />, label: "Members only", cls: "text-foreground/40" };
          else if (unlocked) status = { icon: <PlayCircle size={16} strokeWidth={1.5} />, label: isCurrent ? "This week" : "Open", cls: "text-primary" };
          else status = { icon: <Lock size={13} />, label: opensOn ? `Opens ${opensOn.toLocaleDateString(undefined, { day: "numeric", month: "short" })} · 9:30am` : "Locked", cls: "text-foreground/40" };

          return (
            <Link key={w.week_number} to={`/portal/week/${w.week_number}`}
              className={`block border rounded-sm p-4 md:p-6 transition-colors group ${isCurrent ? "border-primary/50 bg-primary/[0.05]" : "border-primary/15 hover:border-primary bg-foreground/[0.02]"}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-body uppercase tracking-widest text-primary/70 mb-1">
                    Week {w.week_number}{w.block_theme ? ` · ${w.block_theme}` : ""}
                  </p>
                  <h2 className={`font-display text-base md:text-lg tracking-wider line-clamp-1 ${unlocked && effectiveMember ? "text-foreground" : "text-foreground/60"}`}>
                    {w.title!.toUpperCase()}
                  </h2>
                  {w.source && <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-1">{w.source}</p>}
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-body tracking-widest uppercase ${status.cls}`}>
                  {isCurrent && unlocked ? <CheckCircle2 size={16} strokeWidth={1.5} /> : status.icon}
                  <span className="hidden sm:inline">{status.label}</span>
                </span>
                {isAdmin && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/mindcast-live/edit/${w.week_number}`); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); navigate(`/mindcast-live/edit/${w.week_number}`); } }}
                    title="Edit this week"
                    className="shrink-0 flex items-center gap-1 text-[10px] font-body tracking-widest uppercase text-foreground/40 hover:text-primary transition-colors"
                  >
                    <Pencil size={12} /> <span className="hidden sm:inline">Edit</span>
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </PortalLayout>
  );
};

export default PortalWeeks;
