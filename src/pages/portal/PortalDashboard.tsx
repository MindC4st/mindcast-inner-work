import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCheck, PlayCircle, History, Baby, Users, Download, TrendingUp,
  Settings, ArrowRight, Radio, KeyRound, X, Clapperboard,
  LayoutDashboard, CalendarRange, MessageSquare, Nfc, GraduationCap, CreditCard, ShieldCheck,
} from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";

import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { useHouseholdFlags } from "@/hooks/useHouseholdFlags";

// Member portal home — an adaptive tile launcher that changes by role:
//   member      → their weekly journey (check-in, session, journal, progress)
//   facilitator → session tools (deck, schedule, moderation, kiosk, training)
//   admin       → community management (console, membership, training, team)
// Settings is not a tile; it lives on the header gear and in the nav.

const trackForAgeGroup = (age?: string | null): string => {
  const a = (age || "adult").toLowerCase();
  if (a === "teen") return "Teen";
  if (a === "child" || a === "kids") return "Child";
  return "Adult";
};

type Tile = {
  key: string; title: string; subtitle: string; icon: ElementType;
  to?: string; onClick?: () => void; accent?: boolean; badge?: string;
};

const PortalDashboard = () => {
  const { profile, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const track = trackForAgeGroup(profile?.age_group);
  const isTeen = track === "Teen";
  const { hasKids, hasTeens } = useHouseholdFlags();
  const firstName = (profile?.name || "").split(" ")[0] || "there";
  const view: "admin" | "facilitator" | "member" = isAdmin ? "admin" : isStaff ? "facilitator" : "member";

  const [liveCode, setLiveCode] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [code, setCode] = useState("");
  const { currentWeek, startDate, loading: schedLoading } = useProgramSchedule();
  const weekNo = currentWeek;
  const notStarted = !schedLoading && !startDate;

  // Today's scheduled session for the member's track — drives the live deep-link.
  useEffect(() => {
    if (!profile || view !== "member") return;
    const date = new Date().toISOString().slice(0, 10);
    db
      .from("scheduled_sessions")
      .select("session_code, status")
      .eq("session_date", date).eq("track", track).neq("status", "cancelled")
      .maybeSingle()
      .then(({ data }: { data: { session_code: string | null; status: string } | null }) => {
        if (data?.status === "live" && data.session_code) setLiveCode(data.session_code);
      });
  }, [profile, track, view]);

  const openTodaysSession = useCallback(() => {
    if (liveCode) navigate(`/live/${liveCode}`);
    else setJoinOpen(true);
  }, [liveCode, navigate, setJoinOpen]);

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c) navigate(`/live/${c}`);
  };

const tiles = useMemo<Tile[]>(() => {
    if (view === "admin") {
      return [
        { key: "console", title: "Admin Console", subtitle: "Dashboard, membership, insights & training", icon: LayoutDashboard, to: "/admin", accent: true },
        { key: "membership", title: "Membership", subtitle: "Subscriptions, members & bracelets", icon: CreditCard, to: "/admin?tab=membership" },
        { key: "training", title: "Staff Training", subtitle: "Your modules & the team compliance view", icon: GraduationCap, to: "/admin/staff-training" },
        { key: "team", title: "Team Compliance", subtitle: "Who's current, due soon or overdue", icon: ShieldCheck, to: "/admin/staff-training/team" },
        { key: "facilitate", title: "Facilitate", subtitle: weekNo ? `Run the live deck for Week ${weekNo}` : "Open the coursebook to run a session", icon: Clapperboard, to: weekNo ? `/mindcast-live/facilitate/${weekNo}` : "/mindcast-live/library" },
        { key: "downloads", title: "Downloads", subtitle: "Reports & member worksheets", icon: Download, to: "/portal/downloads" },
      ];
    }
    if (view === "facilitator") {
      return [
        { key: "facilitate", title: "Facilitate", subtitle: weekNo ? `Open the live deck for Week ${weekNo}` : "Open the coursebook to run a session", icon: Clapperboard, to: weekNo ? `/mindcast-live/facilitate/${weekNo}` : "/mindcast-live/library", accent: true },
        { key: "sessions", title: "Sessions", subtitle: "Schedule, program & kids sessions", icon: CalendarRange, to: "/admin?tab=sessions" },
        { key: "moderation", title: "Moderation", subtitle: "Review shared live responses", icon: MessageSquare, to: "/admin?tab=sessions&sub=moderation" },
        { key: "kiosk", title: "Check-in Kiosk", subtitle: "Staff NFC bracelet scan mode", icon: Nfc, to: "/admin/kiosk" },
        { key: "training", title: "Staff Training", subtitle: "Your required modules & due dates", icon: GraduationCap, to: "/admin/staff-training" },
        { key: "group", title: "Group View", subtitle: "Life groups & households", icon: Users, to: "/admin?tab=groups" },
      ];
    }
    // Teens get a read-only dashboard: read previous sessions, no submissions.
    const member: Tile[] = isTeen
      ? [
          { key: "history", title: "My Sessions", subtitle: "Read this week's lesson — no submissions", icon: History, to: "/portal/weeks", accent: true },
          { key: "downloads", title: "Downloads", subtitle: "Worksheets & resources", icon: Download, to: "/portal/downloads" },
        ]
      : [
          { key: "checkin", title: "Check-In", subtitle: "Mark your attendance · your name goes on the welcome wall", icon: UserCheck, to: "/portal/checkin", accent: true },
          { key: "today", title: "Today's Session", subtitle: liveCode ? "Live now — join with one tap" : "Enter your join code to open the live session", icon: liveCode ? Radio : PlayCircle, onClick: openTodaysSession, accent: true, badge: liveCode ? "LIVE" : undefined },
          { key: "history", title: "Session History", subtitle: "Revisit past lessons and your journal entries", icon: History, to: "/portal/weeks" },
          { key: "group", title: "Life Group", subtitle: "Your midweek group space", icon: Users, to: "/portal/group" },
          { key: "downloads", title: "Downloads", subtitle: hasKids ? "Worksheets & kids colouring pages" : "Worksheets & resources", icon: Download, to: "/portal/downloads" },
          { key: "progress", title: "My Progress", subtitle: "Streaks, completed weeks & commitments", icon: TrendingUp, to: "/portal/progress" },
        ];
    if (!isTeen && hasTeens) {
      member.splice(3, 0, { key: "teens", title: "Teen Sessions", subtitle: "Your teen's weekly lessons", icon: GraduationCap, to: "/portal/teens", badge: "TEENS" });
    }
    if (!isTeen && hasKids) {
      member.splice(4, 0, { key: "kids", title: "Kid Sessions", subtitle: "Kids lessons & colouring pages", icon: Baby, to: "/portal/kids", badge: "KIDS" });
    }
    return member;
  }, [view, liveCode, hasKids, hasTeens, isTeen, weekNo, openTodaysSession]);

  const roleLabel = view === "admin" ? "Admin" : view === "facilitator" ? "Facilitator" : isTeen ? "Teen member" : hasKids ? "Family membership" : "Member";

  return (
    <PortalLayout>
      {/* Greeting + settings (settings is NOT a tile) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">{roleLabel}</p>
          <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground">
            WELCOME, {firstName.toUpperCase()}
          </h1>
          {view === "member" && weekNo && (
            <p className="text-sm text-muted-foreground mt-2 font-body">You're on Week {weekNo} of your journey.</p>
          )}
          {view === "facilitator" && (
            <p className="text-sm text-muted-foreground mt-2 font-body">Session tools and your own staff training.</p>
          )}
          {view === "admin" && (
            <p className="text-sm text-muted-foreground mt-2 font-body">Everything that keeps the room running.</p>
          )}
        </div>
        <Link to="/portal/settings" aria-label="Profile & settings"
          className="shrink-0 w-10 h-10 grid place-items-center rounded-full border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-colors">
          <Settings size={17} strokeWidth={1.5} />
        </Link>
      </motion.div>

      {/* Member-only: live-now banner */}
      {view === "member" && liveCode && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg bg-primary text-primary-foreground p-4 flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-2 text-[11px] font-body tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" /> Live now
          </span>
          <span className="text-sm font-body flex-1 min-w-0">Your session is running.</span>
          <Link to="/portal/checkin" className="text-[11px] font-body tracking-widest uppercase bg-primary-foreground/15 hover:bg-primary-foreground/25 rounded px-3 py-1.5 transition-colors">Check in</Link>
          <button onClick={() => navigate(`/live/${liveCode}`)} className="text-[11px] font-body tracking-widest uppercase bg-primary-foreground text-primary rounded px-3 py-1.5">Join →</button>
        </motion.div>
      )}

      {/* Member-only: cold-start */}
      {view === "member" && notStarted && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-body text-foreground/80">Your 52-week journey hasn't started yet — your facilitator will set the start date soon. You can still explore the coursebook below.</p>
        </div>
      )}

      {/* Member-only: join-code entry */}
      {view === "member" && joinOpen && (
        <motion.form onSubmit={submitCode} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="mb-6 border border-primary/25 bg-primary/5 rounded-lg p-4 flex items-center gap-3">
          <KeyRound size={16} className="text-primary shrink-0" />
          <input autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter join code"
            className="flex-1 min-w-0 bg-transparent outline-none text-foreground font-body tracking-[0.3em] uppercase placeholder:tracking-normal placeholder:normal-case placeholder:text-muted-foreground/50" />
          <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-[11px] font-body tracking-widest uppercase">Join</button>
          <button type="button" onClick={() => setJoinOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </motion.form>
      )}

      {/* Tile grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {tiles.map((t, i) => {
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
              className={`group relative h-full rounded-xl border p-5 md:p-6 cursor-pointer transition-all duration-200 overflow-hidden ${
                t.accent
                  ? "border-primary/30 bg-primary/[0.06] hover:bg-primary/[0.1]"
                  : "border-foreground/10 bg-foreground/[0.02] hover:border-foreground/25 hover:bg-foreground/[0.04]"
              } hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-20px_rgba(20,40,60,0.5)]`}>
              {t.badge && (
                <span className={`absolute top-3 right-3 text-[8px] font-body tracking-[0.15em] px-1.5 py-0.5 rounded ${t.badge === "LIVE" ? "bg-primary text-primary-foreground animate-pulse" : "bg-foreground/10 text-foreground/60"}`}>
                  {t.badge}
                </span>
              )}
              <div className={`w-11 h-11 rounded-lg grid place-items-center mb-4 transition-colors ${t.accent ? "bg-primary/15 text-primary" : "bg-foreground/[0.06] text-foreground/60 group-hover:text-foreground"}`}>
                <t.icon size={20} strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-base md:text-lg tracking-wide text-foreground leading-tight mb-1">{t.title}</h2>
              <p className="text-[11px] md:text-xs text-muted-foreground font-body leading-snug pr-4">{t.subtitle}</p>
              <ArrowRight size={15} strokeWidth={1.5}
                className="absolute bottom-5 right-5 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </motion.div>
          );
          return t.to ? (
            <Link key={t.key} to={t.to} className="block h-full">{inner}</Link>
          ) : (
            <button key={t.key} onClick={t.onClick} className="block h-full text-left">{inner}</button>
          );
        })}
      </div>
    </PortalLayout>
  );
};

export default PortalDashboard;
