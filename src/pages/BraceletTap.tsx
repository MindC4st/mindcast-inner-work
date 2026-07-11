// /b/:token — entry point when a member taps an NFC bracelet (or anyone
// follows the bracelet URL). Records the check-in immediately, then routes
// the visitor based on who's currently signed in on this device:
//
//   member          → /dashboard?source=bracelet (Attending banner)
//   facilitator     → on-page confirmation card ("✓ Member X checked in")
//   not signed in   → sign-in prompt with redirect back to /dashboard
//                     (the check-in itself succeeded — no need to gate it)

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, LogIn } from "lucide-react";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; displayName: string };

const BraceletTap = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });

  // Fire the check-in once. We don't gate on auth — the bracelet token IS
  // the identifier; the kiosk endpoint just records who tapped.
  useEffect(() => {
    if (!token) { setState({ status: "error", message: "Missing bracelet token" }); return; }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("nfc-checkin", {
          body: { nfc_id: token },
        });
        if (error) throw error;
        const d = data as any;
        if (d?.error) throw new Error(d.error);
        setState({ status: "done", displayName: d?.display_name || "Member" });
      } catch (e: any) {
        setState({ status: "error", message: e?.message || "Unknown bracelet" });
      }
    })();
  }, [token]);

  // Once check-in lands AND auth state has resolved, decide where to go.
  useEffect(() => {
    if (state.status !== "done") return;
    if (authLoading) return;
    // Members: pop them onto their dashboard with the attending flag.
    if (user && role === "member") {
      navigate(`/dashboard?source=bracelet&name=${encodeURIComponent(state.displayName)}`, { replace: true });
    }
    // Facilitator + unauthenticated cases stay on this page and show the
    // appropriate UI below.
  }, [state, authLoading, user, role, navigate]);

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
          <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">BRACELET NOT RECOGNISED</h1>
          <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6">{state.message}</p>
          <Link to="/" className="text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // state.status === "done" — check-in recorded. Render based on auth role.
  // Facilitator on a staff tablet sees a confirmation card so they can
  // keep tapping bracelets without leaving the page.
  if (user && role === "facilitator") {
    return (
      <div className="min-h-screen bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm text-center border border-[hsl(var(--ivory))]/15 rounded-sm p-10 bg-[hsl(var(--ivory))]/[0.03]">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--blue))]/15 flex items-center justify-center mx-auto mb-5">
            <Check className="text-[hsl(var(--blue-light))]" size={28} />
          </div>
          <p className="text-primary text-[10px] tracking-[0.5em] font-body uppercase mb-2">Checked in</p>
          <p className="font-display text-3xl tracking-wider mb-6">{state.displayName.toUpperCase()}</p>
          <p className="text-[hsl(var(--ivory))]/50 text-[11px] font-body">Tap the next bracelet to continue, or return to the slideshow.</p>
          <Link to="/mindcast-live/library" className="inline-block mt-6 text-[hsl(var(--blue-light))] text-xs tracking-widest uppercase font-body border-b border-[hsl(var(--blue-light))]/40">
            ← Back to slideshow
          </Link>
        </motion.div>
      </div>
    );
  }

  // Not signed in. Check-in is recorded already; encourage them to sign in
  // so the dashboard / coursebook loads next.
  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[hsl(var(--blue))]/10 flex items-center justify-center mx-auto mb-5">
          <Check className="text-[hsl(var(--blue))]" size={26} />
        </div>
        <p className="text-primary text-[10px] tracking-[0.5em] font-body uppercase mb-2">Welcome, {state.displayName}</p>
        <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">YOU'RE IN.</h1>
        <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6">
          You're checked in. Sign in to open your coursebook on this device.
        </p>
        <Link
          to="/auth?redirect=/dashboard?source=bracelet"
          className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] text-white font-body text-sm tracking-widest uppercase py-3 rounded-sm transition-colors"
        >
          <LogIn size={14} /> Sign in
        </Link>
      </motion.div>
    </div>
  );
};

export default BraceletTap;
