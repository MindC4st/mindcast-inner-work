import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";

const Checkin = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const nfcMemberId = searchParams.get("member");
  const [session, setSession] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [welcomeNote, setWelcomeNote] = useState("");
  const [goalUpdate, setGoalUpdate] = useState("");
  const [shareGoal, setShareGoal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [previousGoal, setPreviousGoal] = useState<string | null>(null);
  const [nfcVerified, setNfcVerified] = useState(false);

  useEffect(() => {
    supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle().then(({ data }) => setSession(data));
  }, []);

  // NFC auto-fill
  useEffect(() => {
    if (nfcMemberId) {
      supabase.from("profiles").select("display_name, opt_in_public_goals").eq("nfc_id", nfcMemberId).maybeSingle().then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setNfcVerified(true);
        }
      });
    }
  }, [nfcMemberId]);

  useEffect(() => {
    if (!user || !session) return;
    supabase.from("profiles").select("display_name, name").eq("user_id", user.id).single().then(({ data }) => {
      if (data && !nfcVerified) setDisplayName((data as any).display_name || data.name || "");
    });
    supabase.from("workbook_entries").select("weekly_goal, session_id").eq("profile_id", user.id).not("weekly_goal", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      if (data?.weekly_goal) setPreviousGoal(data.weekly_goal);
    });
  }, [user, session]);

  const handleCheckin = async () => {
    if (!session || !displayName.trim()) return;
    setSubmitting(true);
    await supabase.from("check_ins").insert({
      session_id: session.id,
      profile_id: user?.id || null,
      display_name: displayName.trim(),
      welcome_note: welcomeNote || null,
      goal_update: goalUpdate || null,
      share_goal_publicly: shareGoal,
      is_anonymous: isAnonymous,
    });
    setSubmitting(false);
    setDone(true);
  };

  if (!session) return (
    <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center px-6">
      <p className="text-white/30 font-body text-sm text-center">There's no session running right now.</p>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-[#0D0B14] flex flex-col items-center justify-center px-6">
      <Check size={32} className="text-emerald-400/60 mb-4" />
      <h2 className="text-2xl font-display font-bold text-white mb-2">You're in.</h2>
      <p className="text-white/30 font-body text-sm mb-8">See you on screen.</p>
      {user && <Link to="/workbook" className="text-white/30 text-xs font-body hover:text-white/50 transition-colors">Open my workbook →</Link>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0B14] flex flex-col items-center justify-center px-5 py-10">
      <p className="font-body text-[10px] text-white/20 uppercase tracking-[0.2em] mb-8">
        mindcast · week {session.session_number}
      </p>

      {nfcVerified && (
        <div className="flex items-center gap-2 mb-6 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <Check size={14} className="text-emerald-400" />
          <span className="text-emerald-400 text-sm font-body">Welcome back, {displayName} ✓</span>
        </div>
      )}

      <h1 className="text-2xl font-display font-bold text-white text-center mb-2">Welcome. You made it.</h1>
      <p className="text-white/30 text-sm font-body text-center mb-10 max-w-xs">
        This takes 30 seconds. Everything here is optional.
      </p>

      <div className="w-full max-w-sm space-y-5">
        <div>
          <label className="text-[10px] font-body text-white/25 uppercase tracking-[0.1em] block mb-2">Your name (shown on screen)</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="First name or nickname"
            autoCapitalize="words"
            autoComplete="given-name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base font-body placeholder-white/15 focus:outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="text-[10px] font-body text-white/25 uppercase tracking-[0.1em] block mb-2">A welcome note (optional — shown on screen)</label>
          <input value={welcomeNote} onChange={(e) => setWelcomeNote(e.target.value)} placeholder="e.g. First time here, glad to be back..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base font-body placeholder-white/15 focus:outline-none focus:border-white/20" />
        </div>

        {previousGoal && (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-body text-white/25 uppercase tracking-[0.1em]">Last week you wrote...</p>
            <p className="text-sm text-white/50 italic font-body">"{previousGoal}"</p>
            <textarea value={goalUpdate} onChange={(e) => setGoalUpdate(e.target.value)} placeholder="How did it go? (optional)" rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body resize-none placeholder-white/15 focus:outline-none focus:border-white/20" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={shareGoal} onChange={(e) => setShareGoal(e.target.checked)} className="accent-white" />
              <span className="text-xs text-white/30 font-body">Share this with the group tonight</span>
            </label>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="accent-white" />
          <span className="text-sm text-white/30 font-body">Check in without showing my name on screen</span>
        </label>

        <button onClick={handleCheckin} disabled={submitting || !displayName.trim()} className="w-full bg-white text-[#0D0B14] font-display font-bold py-4 rounded-xl text-base disabled:opacity-30 hover:bg-white/90 transition-colors">
          {submitting ? "Checking in..." : "Check in →"}
        </button>
      </div>
    </div>
  );
};

export default Checkin;
