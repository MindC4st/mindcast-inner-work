import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Check, Heart, Eye, LogIn } from "lucide-react";

type LiveState = {
  week: number;
  audience: string;
  slide: number;
  promptType: "journaling" | "reflection" | "idle";
  promptText: string;
  title: string;
};

type DisplayMode = "full" | "first_initial" | "anonymous";

const computeDisplayName = (
  profile: { first_name?: string | null; last_name?: string | null; name?: string | null; display_name?: string | null } | null,
  mode: DisplayMode,
): string => {
  if (mode === "anonymous") return "Anonymous";
  const fn = (profile?.first_name || "").trim();
  const ln = (profile?.last_name || "").trim();
  // Fall back to splitting an existing `name` if first/last weren't migrated.
  const fallback = ((profile?.display_name || profile?.name || "") + "").trim();
  const parts = (fn || ln) ? [fn, ln].filter(Boolean) : fallback.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Member";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  if (mode === "full") return last ? `${first} ${last}` : first;
  // first_initial
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
};

const LiveJoin = () => {
  const { code } = useParams();
  const sessionCode = (code || "").toUpperCase();
  const { user, profile, loading } = useAuth();

  // 'auto' = follow the user's profile setting; otherwise this session overrides it.
  // Cast: the generated Supabase types don't know about live_display_mode yet
  // (migration is in this PR — type regen happens after deploy).
  const profileLiveMode = (profile as any)?.live_display_mode as DisplayMode | undefined;
  const [displayMode, setDisplayMode] = useState<DisplayMode>(profileLiveMode || "first_initial");
  useEffect(() => {
    if (profileLiveMode) setDisplayMode(profileLiveMode);
  }, [profileLiveMode]);

  const displayName = useMemo(
    () => computeDisplayName(profile as any, displayMode),
    [profile, displayMode],
  );

  // 'member' = full UX; 'spectator' = read-only screen for non-members.
  const [mode, setMode] = useState<"member" | "spectator" | null>(null);

  const [shareOnScreen, setShareOnScreen] = useState(false);
  const [response, setResponse] = useState("");
  const [state, setState] = useState<LiveState | null>(null);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [submittedRowId, setSubmittedRowId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<"pending" | "approved" | "denied" | null>(null);
  const [denialReason, setDenialReason] = useState<string>("");

  // Once we know who they are (or that they're not signed in), auto-pick a
  // mode. A signed-in member skips the gate; an anon visitor sees the gate.
  useEffect(() => {
    if (loading) return;
    if (user && mode === null) setMode("member");
  }, [loading, user, mode]);

  const joined = mode !== null;

  useEffect(() => {
    if (!joined) return;
    const ch = supabase.channel(`live:${sessionCode}`, { config: { broadcast: { self: true } } });
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setState(payload as LiveState);
      setSubmittedFor(prev => prev === `${payload.slide}` ? prev : null);
    });
    // Moderator decisions land here — we only act on events about *our* row.
    ch.on("broadcast", { event: "moderation" }, ({ payload }) => {
      if (!payload || payload.id !== submittedRowId) return;
      if (payload.status === "approved") setModerationStatus("approved");
      else if (payload.status === "denied") {
        setModerationStatus("denied");
        setDenialReason(payload.reason || "Held — not for tonight's room.");
      }
    });
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // Hello — asks the facilitator to (re)send current state for late joiners.
        ch.send({ type: "broadcast", event: "hello", payload: { ts: Date.now() } });
      }
    });
    return () => { supabase.removeChannel(ch); };
  }, [joined, sessionCode, submittedRowId]);

  // Persist a display-mode change back to the profile so it's the new default.
  const updateDisplayMode = async (next: DisplayMode) => {
    setDisplayMode(next);
    if (!user) return;
    await (supabase as any).from("profiles").update({ live_display_mode: next }).eq("user_id", user.id);
  };

  const submit = async () => {
    if (!state || !response.trim() || !user) return;
    setSubmitting(true);
    const { data, error } = await (supabase as any)
      .from("session_responses")
      .insert({
        session_code: sessionCode,
        week_number: state.week,
        audience_type: state.audience,
        user_id: user.id,
        display_name: displayMode === "anonymous" ? "Anonymous" : displayName,
        response_text: response.trim().slice(0, 300),
        prompt_type: state.promptType,
        is_public: shareOnScreen,
        show_name: displayMode !== "anonymous",
        moderation_status: shareOnScreen ? "pending" : "private",
      })
      .select("id")
      .maybeSingle();
    setSubmitting(false);
    if (error) { toast({ title: "Couldn't submit", description: error.message }); return; }
    setSubmittedFor(`${state.slide}`);
    setSubmittedRowId(data?.id ?? null);
    setModerationStatus(shareOnScreen ? "pending" : "approved");
    setResponse("");
  };

  const tryAgain = () => {
    setSubmittedFor(null);
    setSubmittedRowId(null);
    setModerationStatus(null);
    setDenialReason("");
    setResponse("");
  };

  // ---------- Sign-in gate ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center text-[hsl(var(--navy-mid))]/60 text-xs font-body tracking-widest uppercase">
        Loading…
      </div>
    );
  }

  if (!user && !joined) {
    const redirectPath = `/live/${sessionCode}`;
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-3 text-center">Mindcast LIVE</p>
          <h1 className="font-display text-5xl tracking-wider text-[hsl(var(--navy))] mb-1 text-center">JOIN SESSION</h1>
          <p className="text-center text-[hsl(var(--navy-mid))] font-body text-sm mb-8 tracking-widest">
            CODE · <span className="text-[hsl(var(--blue))] font-bold">{sessionCode}</span>
          </p>

          <p className="font-serif italic text-[hsl(var(--navy))] text-base leading-snug text-center mb-6">
            "Your reflections from each session live in your member coursebook — yours to keep, yours to revisit."
          </p>

          <Link
            to={`/auth?redirect=${encodeURIComponent(redirectPath)}`}
            className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] text-white font-body text-sm tracking-widest uppercase py-3 rounded-sm transition-colors"
          >
            <LogIn size={14} /> Sign in to join
          </Link>

          <p className="text-center text-[hsl(var(--navy-mid))]/70 text-[11px] mt-5 font-body leading-snug">
            Not a member yet? Pick up a printed worksheet from the front desk for $10 — write your reflections by hand, take them home.
          </p>

          <div className="my-6 border-t border-[hsl(var(--warm-border))]" />

          <button
            onClick={() => setMode("spectator")}
            className="w-full flex items-center justify-center gap-2 text-[hsl(var(--navy-mid))]/70 hover:text-[hsl(var(--navy))] font-body text-xs tracking-widest uppercase py-2"
          >
            <Eye size={13} /> Just watching tonight
          </button>
        </div>
      </div>
    );
  }

  const activePrompt = state && (state.promptType === "journaling" || state.promptType === "reflection");
  const alreadySubmitted = submittedFor === `${state?.slide}`;
  const isSpectator = mode === "spectator";

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] px-6 py-8" style={{ paddingTop: "max(2rem, env(safe-area-inset-top))", paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase">Mindcast LIVE</p>
            <p className="font-display text-2xl text-[hsl(var(--navy))] tracking-wider">{sessionCode}</p>
          </div>
          <div className="text-right">
            <p className="text-[hsl(var(--navy-mid))]/60 text-[10px] tracking-widest font-body uppercase">
              {isSpectator ? "Watching" : "You"}
            </p>
            <p className="font-body text-sm text-[hsl(var(--navy))]">{isSpectator ? "Guest" : displayName}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!state ? (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <div className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--blue))] animate-pulse mb-4" />
              <p className="text-[hsl(var(--navy-mid))] text-sm font-body">Connected. Waiting for facilitator…</p>
            </motion.div>
          ) : !activePrompt ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16">
              <p className="text-[hsl(var(--navy-mid))]/60 text-[10px] tracking-widest font-body uppercase mb-3">Now showing</p>
              <p className="font-display text-3xl text-[hsl(var(--navy))] tracking-wider mb-2">{state.title}</p>
              <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm">
                {isSpectator
                  ? "Only members can share reflections. You can still follow along here."
                  : "A prompt will appear when it's time to share."}
              </p>
            </motion.div>
          ) : isSpectator ? (
            <motion.div key="spectator-prompt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-3">Reflect</p>
              <p className="font-serif italic text-2xl text-[hsl(var(--navy))] leading-snug mb-6">"{state.promptText}"</p>
              <div className="border border-[hsl(var(--warm-border))] rounded-sm p-5 bg-white text-center">
                <p className="text-[hsl(var(--navy-mid))]/80 text-sm font-body leading-snug mb-4">
                  This prompt is for members to answer in their coursebook. You can sit with it in the room — or sign in to share.
                </p>
                <Link
                  to={`/auth?redirect=${encodeURIComponent(`/live/${sessionCode}`)}`}
                  className="text-[hsl(var(--blue))] font-body text-xs tracking-widest uppercase border-b border-[hsl(var(--blue))]/40 hover:border-[hsl(var(--blue))]"
                >
                  Sign in to share
                </Link>
              </div>
            </motion.div>
          ) : alreadySubmitted ? (
            moderationStatus === "denied" ? (
              <motion.div key="denied" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6 border border-[hsl(var(--bronze))]/30 rounded-sm bg-white">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--bronze))]/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-[hsl(var(--bronze))]" size={22} />
                </div>
                <p className="font-display text-xl text-[hsl(var(--navy))] tracking-wider mb-3">HELD IN PRIVATE</p>
                <p className="font-serif italic text-[hsl(var(--navy))] text-base leading-snug mb-6">"{denialReason}"</p>
                <button onClick={tryAgain}
                  className="text-[hsl(var(--blue))] font-body text-xs tracking-widest uppercase border-b border-[hsl(var(--blue))]/40 hover:border-[hsl(var(--blue))]">
                  Share another reflection
                </button>
              </motion.div>
            ) : moderationStatus === "approved" ? (
              <motion.div key="approved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 border border-[hsl(var(--blue))]/30 rounded-sm bg-white">
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--blue))]/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="text-[hsl(var(--blue))]" size={24} />
                </div>
                <p className="font-display text-xl text-[hsl(var(--navy))] tracking-wider">SHARED ON SCREEN</p>
                <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm mt-1">Saved to your coursebook.</p>
              </motion.div>
            ) : (
              <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 border border-[hsl(var(--warm-border))] rounded-sm bg-white">
                <div className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--bronze))] animate-pulse mb-4" />
                <p className="font-display text-xl text-[hsl(var(--navy))] tracking-wider">RECEIVED</p>
                <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm mt-1">
                  {shareOnScreen ? "Waiting for the moderator to share it on screen." : "Saved to your coursebook."}
                </p>
              </motion.div>
            )
          ) : (
            <motion.div key={`prompt-${state.slide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-3">Reflect</p>
              <p className="font-serif italic text-2xl text-[hsl(var(--navy))] leading-snug mb-6">"{state.promptText}"</p>
              <textarea value={response} onChange={e => setResponse(e.target.value.slice(0, 300))}
                placeholder="Type your response…"
                rows={5}
                className="w-full px-4 py-3 border border-[hsl(var(--warm-border))] rounded-sm font-body text-[hsl(var(--navy))] resize-none focus:outline-none focus:border-[hsl(var(--blue))]" />
              <div className="flex justify-between text-[10px] text-[hsl(var(--navy-mid))]/60 font-body mt-1 mb-4">
                <span>{response.length}/300</span>
              </div>

              <div className="space-y-3 mb-5">
                <Toggle label="Share on screen" value={shareOnScreen} onChange={setShareOnScreen} />

                <div className="px-3 py-2.5 bg-white border border-[hsl(var(--warm-border))] rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[hsl(var(--navy))] font-body text-sm">Shown as</span>
                    <span className="text-[hsl(var(--navy))] font-body text-sm font-medium">
                      {displayMode === "anonymous" ? "Anonymous" : displayName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {([
                      { v: "full",          label: "Full name" },
                      { v: "first_initial", label: "First + initial" },
                      { v: "anonymous",     label: "Anonymous" },
                    ] as const).map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => updateDisplayMode(opt.v)}
                        className={`text-[10px] font-body tracking-widest uppercase py-1.5 rounded-sm transition-colors ${
                          displayMode === opt.v
                            ? "bg-[hsl(var(--blue))] text-white"
                            : "bg-[hsl(var(--ivory))] text-[hsl(var(--navy-mid))] hover:bg-[hsl(var(--warm-border))]/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[hsl(var(--navy-mid))]/50 text-[10px] font-body mt-2 leading-snug">
                    Change once — saved to your profile for future sessions.
                  </p>
                </div>
              </div>

              <button onClick={submit} disabled={!response.trim() || submitting}
                className="w-full bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] disabled:opacity-40 text-white font-body text-sm tracking-widest uppercase py-3 rounded-sm transition-colors">
                {submitting ? "Sending…" : "Submit"}
              </button>

              <p className="text-center text-[hsl(var(--navy-mid))]/50 text-[10px] mt-3 font-body">
                Your reflection is saved to your member coursebook either way.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-[hsl(var(--warm-border))] rounded-sm">
    <span className="text-[hsl(var(--navy))] font-body text-sm">{label}</span>
    <span className={`w-9 h-5 rounded-full relative transition-colors ${value ? "bg-[hsl(var(--blue))]" : "bg-[hsl(var(--warm-border))]"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
    </span>
  </button>
);

export default LiveJoin;
