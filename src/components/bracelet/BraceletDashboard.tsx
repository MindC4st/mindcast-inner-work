// The NFC dashboard — what the bracelet's owner sees on their own phone.
//
// Doubles as a door pass. The member taps their bracelet, checks themselves
// in, then holds the phone up to the welcome desk: the membership band is
// sized and coloured to be read at arm's length, so staff can wave an ACTIVE
// member through or stop a LAPSED one and point at the renew button on the
// member's own screen.
//
// Three redundant signals carry the verdict — colour, icon and word — so the
// band still reads correctly for a colour-blind staff member or on a phone
// with the brightness turned down.
//
// Everything here is read client-side under existing RLS with the member's own
// session (subscriptions: read-own; scheduled_sessions: read-authenticated;
// check_ins: read). No new endpoint, and nothing about billing is exposed to
// the public /b/:token path — a stranger who finds a dropped bracelet is never
// signed in as the owner and so never reaches this component.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock, Loader2,
  LogOut, PauseCircle, PlayCircle, User as UserIcon, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";
import { describeMembership, type MembershipTone } from "@/lib/membership";
import { useTodaysSession } from "@/hooks/useTodaysSession";

// Saturated enough to carry across a welcome desk, dark enough to keep the
// brand's ivory-on-navy feel rather than turning into a traffic light.
const TONE: Record<MembershipTone, { band: string; label: string; helper: string; eyebrow: string }> = {
  active: {
    band: "bg-[hsl(152_48%_19%)]",
    label: "text-[hsl(150_70%_90%)]",
    helper: "text-[hsl(150_32%_80%)]",
    eyebrow: "text-[hsl(150_45%_72%)]",
  },
  warning: {
    band: "bg-[hsl(30_72%_25%)]",
    label: "text-[hsl(40_96%_87%)]",
    helper: "text-[hsl(38_48%_82%)]",
    eyebrow: "text-[hsl(38_70%_75%)]",
  },
  blocked: {
    band: "bg-[hsl(2_62%_26%)]",
    label: "text-[hsl(6_92%_90%)]",
    helper: "text-[hsl(6_48%_84%)]",
    eyebrow: "text-[hsl(6_65%_76%)]",
  },
  paused: {
    band: "bg-[hsl(210_22%_25%)]",
    label: "text-[hsl(210_32%_90%)]",
    helper: "text-[hsl(210_20%_80%)]",
    eyebrow: "text-[hsl(210_25%_74%)]",
  },
};

const TONE_ICON: Record<MembershipTone, typeof CheckCircle2> = {
  active: CheckCircle2,
  warning: AlertTriangle,
  blocked: XCircle,
  paused: PauseCircle,
};

const fullName = (p: { first_name?: string | null; last_name?: string | null; name?: string | null; display_name?: string | null } | null): string => {
  if (!p) return "Member";
  const parts = [p.first_name, p.last_name].map((v) => (v || "").trim()).filter(Boolean);
  if (parts.length) return parts.join(" ");
  return ((p.display_name || p.name || "") + "").trim() || "Member";
};

const timeOnly = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
};

interface Props {
  /** The bracelet token that was tapped — kept for the "this is your bracelet" line. */
  token?: string;
}

const BraceletDashboard = ({ token }: Props) => {
  const { profile, membershipStatus, signOut } = useAuth();
  const navigate = useNavigate();
  const { session: todays, loading: sessionLoading } = useTodaysSession(profile?.age_group);

  const [sub, setSub] = useState<{ current_period_end: string | null; cancel_at_period_end: boolean } | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Renewal date + "set to cancel" flag. RLS scopes this to the member's own
  // subscription (or their household's), so an unfiltered select is safe.
  useEffect(() => {
    let cancelled = false;
    db.from("subscriptions")
      .select("current_period_end, cancel_at_period_end")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setSub(data ?? null); });
    return () => { cancelled = true; };
  }, [profile?.id]);

  // Today's check-in — the tap that got them here has already recorded one.
  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    db.from("check_ins")
      .select("checked_in_at")
      .eq("profile_id", profile.id)
      .gte("checked_in_at", startOfDay.toISOString())
      .order("checked_in_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (!cancelled) setCheckedInAt(data?.checked_in_at ?? null); });
    return () => { cancelled = true; };
  }, [profile?.id]);

  const view = describeMembership(membershipStatus, {
    currentPeriodEnd: sub?.current_period_end,
    cancelAtPeriodEnd: sub?.cancel_at_period_end,
  });
  const tone = TONE[view.tone];
  const ToneIcon = TONE_ICON[view.tone];

  // 'renew' sends them to the plan picker (checkout needs household counts);
  // 'update_card' and 'resume' both want the Stripe billing portal.
  const runAction = async () => {
    if (view.action === "none") return;
    if (view.action === "renew") { navigate("/portal/billing"); return; }
    setBusy(true); setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("create-billing-portal", { body: {} });
      if (fnErr) throw fnErr;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not open the billing portal");
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] flex flex-col">
      {/* ---- The door pass. Everything above the fold is for staff to read. ---- */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className={`${tone.band} px-6 pt-12 pb-10 text-center`}
        role="status"
        aria-live="polite"
      >
        <p className={`${tone.eyebrow} text-[10px] font-body tracking-[0.45em] uppercase mb-5`}>
          Mindcast Membership
        </p>

        <ToneIcon className={`${tone.label} mx-auto mb-4`} size={56} strokeWidth={1.5} aria-hidden="true" />

        <h1 className={`${tone.label} font-display text-5xl sm:text-6xl tracking-wider leading-none mb-4`}>
          {view.label}
        </h1>

        <p className={`${tone.label} font-body text-lg sm:text-xl tracking-wide mb-3`}>
          {fullName(profile)}
        </p>

        <p className={`${tone.helper} font-body text-sm leading-relaxed max-w-xs mx-auto`}>
          {view.helper}
        </p>

        {view.action !== "none" && (
          <button
            onClick={runAction}
            disabled={busy}
            className="mt-7 w-full max-w-xs mx-auto flex items-center justify-center gap-2 bg-[hsl(var(--ivory))] text-[hsl(var(--navy))] py-4 text-xs font-body font-semibold tracking-[0.18em] uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            {busy ? "Opening…" : view.actionLabel}
          </button>
        )}

        {error && <p className={`${tone.helper} text-[11px] font-body mt-3`}>{error}</p>}
      </motion.section>

      {/* ---- The member's own controls. ---- */}
      <div className="flex-1 px-6 py-8 max-w-sm w-full mx-auto space-y-3">
        {/* Check-in state */}
        <div className="flex items-center gap-3 border border-[hsl(var(--navy))]/10 bg-white rounded-sm px-4 py-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[hsl(var(--blue))]/10 flex items-center justify-center shrink-0">
            {checkedInAt
              ? <CheckCircle2 className="text-[hsl(var(--blue))]" size={17} strokeWidth={1.7} />
              : <Clock className="text-[hsl(var(--blue))]" size={17} strokeWidth={1.7} />}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base tracking-wider text-[hsl(var(--navy))] leading-none">
              {checkedInAt ? "CHECKED IN" : "NOT CHECKED IN YET"}
            </p>
            <p className="text-[11px] font-body text-[hsl(var(--navy-mid))] mt-1">
              {checkedInAt
                ? `Your name went up on the Welcome Wall at ${timeOnly(checkedInAt)}.`
                : "Tap your bracelet at the door to check in."}
            </p>
          </div>
        </div>

        {/* Today's session */}
        {sessionLoading ? (
          <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm px-4 py-3.5 text-[11px] font-body text-[hsl(var(--navy-mid))] shadow-sm">
            Looking for today's session…
          </div>
        ) : todays ? (
          <Link
            // ?session= binds journal entries to this session instance rather
            // than to the week number. The Lesson page does not read it yet —
            // that binding is the follow-up to this change.
            to={`/mindcast-live/lesson/${todays.weekNumber}?session=${todays.id}`}
            className="flex items-center gap-3 border border-[hsl(var(--navy))]/10 bg-[hsl(var(--navy))] rounded-sm px-4 py-4 shadow-sm hover:opacity-95 transition-opacity"
          >
            <PlayCircle className="text-[hsl(var(--blue-light))] shrink-0" size={20} strokeWidth={1.6} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base tracking-wider text-[hsl(var(--ivory))] leading-none">
                OPEN TODAY'S SESSION
              </p>
              <p className="text-[11px] font-body text-[hsl(var(--ivory))]/55 mt-1">
                {todays.track} · Week {todays.weekNumber}
                {todays.room ? ` · ${todays.room}` : ""}
                {todays.status === "live" ? " · Live now" : ""}
              </p>
            </div>
            <ArrowRight className="text-[hsl(var(--ivory))]/40 shrink-0" size={15} />
          </Link>
        ) : (
          <div className="border border-[hsl(var(--navy))]/10 bg-white rounded-sm px-4 py-3.5 text-[11px] font-body text-[hsl(var(--navy-mid))] shadow-sm">
            No session scheduled for today.
          </div>
        )}

        {/* Everything else lives in the full portal. */}
        <Link
          to="/portal/dashboard"
          className="flex items-center gap-3 border border-[hsl(var(--navy))]/10 bg-white rounded-sm px-4 py-3.5 shadow-sm hover:border-[hsl(var(--blue))]/40 transition-colors"
        >
          <UserIcon className="text-[hsl(var(--navy-mid))] shrink-0" size={17} strokeWidth={1.6} />
          <span className="font-body text-sm text-[hsl(var(--navy))] flex-1">My full portal</span>
          <ArrowRight className="text-[hsl(var(--navy))]/25 shrink-0" size={15} />
        </Link>

        <div className="pt-3 text-center">
          {token && (
            <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/60 mb-3">
              Signed in from your bracelet.
            </p>
          )}
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="inline-flex items-center gap-1.5 text-[10px] font-body tracking-[0.18em] uppercase text-[hsl(var(--navy-mid))]/70 hover:text-[hsl(var(--navy))]"
          >
            <LogOut size={11} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default BraceletDashboard;
