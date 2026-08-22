// /b/:token — entry point when a member taps an NFC bracelet (or anyone
// follows the bracelet URL). Records the check-in immediately, greets the
// owner by name (so a lost bracelet can be identified without logging in),
// then routes by *whose bracelet it is*, not by role:
//
//   the signed-in user owns this bracelet → their NFC dashboard (door pass)
//   staff tapping someone else's bracelet → on-page check-in confirmation
//   new / other phone                     → "Welcome, <name>" + one-time
//     password; "stay signed in" remembers the device for next time
//
// Ownership is checked before role on purpose: an admin or facilitator tapping
// their own bracelet on their own phone is a member arriving, not a staff
// member working the door, and should get the dashboard.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { describeFunctionError } from "@/lib/functionError";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Loader2, Lock, Nfc } from "lucide-react";
import { db } from "@/lib/db";
import BraceletDashboard from "@/components/bracelet/BraceletDashboard";
import { useTodaysSession } from "@/hooks/useTodaysSession";

type State =
  | { status: "loading" }
  | { status: "error"; heading: string; message: string }
  | { status: "welcome"; displayName: string; welcomeName: string };

const EPHEMERAL_KEY = "mindcast_ephemeral_session";

// What each failure actually means at the door. Anything unmapped keeps the
// generic heading, so a new failure mode never masquerades as a bad bracelet.
const TAP_ERRORS: Record<number, { heading: string; message: string }> = {
  400: {
    heading: "BRACELET NOT RECOGNISED",
    message: "That link is missing its bracelet code. Try tapping again, or ask a facilitator to check you in.",
  },
  404: {
    heading: "BRACELET NOT LINKED",
    message:
      "This bracelet works, but it isn't linked to a member yet. A facilitator can link it in Admin → Members, then tap again.",
  },
  429: {
    heading: "TOO MANY TAPS",
    message: "Give it a moment and tap again.",
  },
};

const BraceletTap = () => {
  const { token } = useParams();
  const { user, role, loading: authLoading } = useAuth();
  // Used by the staff card so "back to slideshow" returns to the session
  // that's actually running, not the library index.
  const { session: todaysSession } = useTodaysSession();
  const [state, setState] = useState<State>({ status: "loading" });
  const [ownNfcId, setOwnNfcId] = useState<string | null>(null);
  const [ownLoaded, setOwnLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  // Fire the check-in once. We don't gate on auth — the bracelet token IS
  // the identifier; the kiosk endpoint just records who tapped.
  useEffect(() => {
    if (!token) {
      setState({ ...TAP_ERRORS[400], status: "error" });
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("nfc-checkin", {
          body: { nfc_id: token },
        });
        if (error) throw error;
        const d = data as { error?: string; display_name?: string; welcome_name?: string } | null;
        if (d?.error) throw new Error(d.error);
        setState({
          status: "welcome",
          displayName: d?.display_name || "Member",
          welcomeName: d?.welcome_name || d?.display_name || "Member",
        });
      } catch (e: unknown) {
        // Recover the function's real status and body — invoke() reports every
        // non-2xx as the same opaque message otherwise.
        const failure = await describeFunctionError(
          e,
          Object.fromEntries(Object.entries(TAP_ERRORS).map(([s, v]) => [s, v.message])),
          "We couldn't check you in. Please see a facilitator at the door.",
        );
        setState({
          status: "error",
          heading: TAP_ERRORS[failure.status]?.heading ?? "CHECK-IN FAILED",
          message: failure.message,
        });
      }
    })();
  }, [token]);

  // Whose bracelet does this phone already belong to? Re-resolved whenever the
  // signed-in user changes, and flagged unloaded while in flight so a freshly
  // unlocked phone never flashes the password form again on a stale answer.
  useEffect(() => {
    if (!user) { setOwnNfcId(null); setOwnLoaded(true); return; }
    let cancelled = false;
    setOwnLoaded(false);
    db
      .from("profiles").select("nfc_id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setOwnNfcId(data?.nfc_id || null);
        setOwnLoaded(true);
      });
    return () => { cancelled = true; };
  }, [user]);

  const unlock = async () => {
    if (!password || busy) return;
    setBusy(true);
    setFormError("");
    try {
      const { data, error } = await supabase.functions.invoke("bracelet-signin", {
        body: { token, password },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: { json: () => Promise<{ error?: string }> } }).context;
          if (ctx) { const b = await ctx.json(); if (b?.error) detail = b.error; }
        } catch { /* keep message */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      const { error: setErr } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (setErr) throw setErr;
      if (!remember) localStorage.setItem(EPHEMERAL_KEY, "1");
      // Stay on /b/:token — the auth change re-resolves ownership and this
      // page swaps itself for the dashboard, so the member lands on their door
      // pass rather than being bounced into the portal.
      setBusy(false);
    } catch (e: unknown) {
      setFormError(e instanceof Error && e.message ? e.message : "Sign-in failed");
      setBusy(false);
    }
  };

  if (state.status === "loading") {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--blue))] animate-pulse mb-4" />
          <p className="text-[hsl(var(--navy-mid))] text-xs font-body tracking-widest uppercase">Checking you in…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-primary text-xs tracking-[0.5em] font-body uppercase mb-3">Mindcast LIVE</p>
          <h1 className="font-display text-4xl tracking-wider text-primary mb-3">{state.heading}</h1>
          <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6">{state.message}</p>
          <Link to="/" className="text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Auth and ownership must both be resolved before we pick a branch,
  // otherwise the owner sees a flash of the staff card or the password form.
  if (authLoading || !ownLoaded) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--blue))] animate-pulse" />
      </div>
    );
  }

  // This is my bracelet, on my phone → my dashboard, whatever my role is.
  if (user && token && ownNfcId === token) {
    return <BraceletDashboard token={token} />;
  }

  const isStaff = role === "facilitator" || role === "admin";

  // Staff tablet at the door, tapping someone else's bracelet: confirmation
  // card, keep tapping bracelets.
  if (isStaff) {
    return (
      <div className="min-h-screen bg-[hsl(var(--navy))] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center border border-[hsl(var(--ivory))]/10 rounded-sm p-10 bg-[hsl(var(--ivory))]/[0.03]">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--blue))]/15 flex items-center justify-center mx-auto mb-5">
            <Check className="text-[hsl(var(--blue-light))]" size={28} />
          </div>
          <p className="text-primary text-[10px] tracking-[0.5em] font-body uppercase mb-2">Checked in</p>
          <p className="font-display text-3xl tracking-wider text-[hsl(var(--ivory))] mb-6">{state.displayName.toUpperCase()}</p>
          <p className="text-[hsl(var(--ivory))]/50 text-[11px] font-body">Tap the next bracelet to continue, or return to the slideshow.</p>
          <Link
            to={todaysSession ? `/mindcast-live/lesson/${todaysSession.weekNumber}` : "/mindcast-live/library"}
            className="inline-block mt-6 text-[hsl(var(--blue-light))] text-xs tracking-widest uppercase font-body border-b border-[hsl(var(--blue-light))]/40"
          >
            ← Back to slideshow
          </Link>
        </motion.div>
      </div>
    );
  }

  // Member's own remembered phone is handled by the redirect effect above;
  // while it runs (or for a new / different-account phone) show the welcome.
  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--blue))]/10 flex items-center justify-center mx-auto mb-5">
          <Nfc className="text-[hsl(var(--blue))]" size={24} />
        </div>
        <p className="text-primary text-xs tracking-[0.5em] font-body uppercase mb-2">Mindcast LIVE</p>
        <h1 className="font-display text-4xl tracking-wider text-primary mb-1">
          WELCOME, {state.welcomeName.toUpperCase()}
        </h1>
        <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-8">
          This bracelet belongs to {state.welcomeName}. Found it? Hand it to the welcome desk and we'll get it home.
        </p>

        <div className="text-left border border-[hsl(var(--navy))]/10 bg-white rounded-sm p-6 shadow-sm">
          <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-body uppercase text-[hsl(var(--navy-mid))] mb-3">
            <Lock size={11} /> Sign in to your portal
          </p>
          {user && ownNfcId !== token && (
            <p className="text-[11px] font-body text-[hsl(var(--navy-mid))] mb-3">
              This phone is signed in as someone else — enter {state.welcomeName}'s password to switch.
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") unlock(); }}
            placeholder="Your password"
            autoFocus
            className="w-full bg-transparent border border-[hsl(var(--navy))]/15 rounded-sm px-3 py-2.5 text-sm font-body text-[hsl(var(--navy))] placeholder:text-[hsl(var(--navy-mid))]/40 focus:outline-none focus:border-[hsl(var(--blue))]"
          />
          {formError && <p className="text-[11px] font-body text-red-600 mt-2">{formError}</p>}
          <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              className="accent-[hsl(var(--blue))] w-4 h-4" />
            <span className="text-xs font-body text-[hsl(var(--navy-mid))]">Stay signed in on this phone</span>
          </label>
          <button onClick={unlock} disabled={busy || !password}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 text-xs font-body tracking-widest uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {busy ? "Unlocking…" : "Enter my portal"}
          </button>
          <p className="text-[10px] font-body text-[hsl(var(--navy-mid))]/70 mt-3">
            One time on a new phone — after that, tapping your bracelet opens your portal straight away.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BraceletTap;