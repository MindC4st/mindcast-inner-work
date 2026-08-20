import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import RateScale from "@/components/session/RateScale";
import MultipleChoiceReflection from "@/components/session/MultipleChoiceReflection";
import WordPhraseBuilder from "@/components/session/WordPhraseBuilder";
import IntentionLadder, { LadderValue } from "@/components/session/IntentionLadder";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Check, Heart, Eye, LogIn } from "lucide-react";

type LiveState = {
  week: number;
  audience: string;
  slide: number;
  promptType: "journaling" | "reflection" | "intention" | "intention_review" | "activity" | "idle";
  promptText: string;
  title: string;
  activityType?: string | null;
  activityOptions?: string[];
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
  const profileLiveMode = profile?.live_display_mode as DisplayMode | undefined;
  const [displayMode, setDisplayMode] = useState<DisplayMode>(profileLiveMode || "first_initial");
  useEffect(() => {
    if (profileLiveMode) setDisplayMode(profileLiveMode);
  }, [profileLiveMode]);

  const displayName = useMemo(
    () => computeDisplayName(profile, displayMode),
    [profile, displayMode],
  );

  // 'member' = full UX; 'spectator' = read-only screen for non-members.
  const [mode, setMode] = useState<"member" | "spectator" | null>(null);

  const [shareOnScreen, setShareOnScreen] = useState(false);
  const [response, setResponse] = useState("");
  const [state, setState] = useState<LiveState | null>(null);
  const [ended, setEnded] = useState(false);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [submittedRowId, setSubmittedRowId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [moderationStatus, setModerationStatus] = useState<"pending" | "approved" | "denied" | null>(null);
  const [denialReason, setDenialReason] = useState<string>("");
  // Loop-back: the member's own intention from last week, shown on their phone
  // during the opening "Return to Your Intention" slide. Private to them.
  const [lastIntention, setLastIntention] = useState<string | null>(null);
  // The Notice -> Name -> Do rung the member records against LAST week.
  const [lastOutcome, setLastOutcome] = useState<LadderValue | null>(null);
  const [savingOutcome, setSavingOutcome] = useState(false);

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

    // Durable fallback: if the presenter's broadcast hasn't reached us yet
    // (late join / reconnect), resolve the current slide from the DB. A live
    // broadcast that arrives after this still wins (it setState unconditionally).
    db
      .from("live_session_state")
      .select("*")
      .eq("session_code", sessionCode)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.is_live) {
          setState((prev) => prev ?? {
            week: data.week_number,
            audience: data.audience,
            slide: data.current_slide,
            promptType: data.prompt_type as LiveState["promptType"],
            promptText: data.prompt_text,
            title: data.title,
          });
        } else if (data && data.is_live === false) {
          setEnded(true);
        }
      });

    return () => { supabase.removeChannel(ch); };
  }, [joined, sessionCode, submittedRowId]);

  // When the facilitator is on the opening intention slide, fetch this member's
  // own intention from the previous week (never anyone else's — the RPC is
  // scoped to the caller).
  useEffect(() => {
    if (!user || state?.promptType !== "intention_review" || !state?.week) return;
    const prevWeek = state.week - 1;
    if (prevWeek < 1) { setLastIntention(null); return; }
    db
      .rpc("my_intention_for_week", { p_week: prevWeek, p_track: state.audience || "Adult" })
      .then(({ data }) => {
        const row = (Array.isArray(data) ? data[0] : data) as unknown as
          { weekly_intention: string | null; intention_outcome: string | null } | null | undefined;
        setLastIntention((row?.weekly_intention || "").trim() || null);
        setLastOutcome((row?.intention_outcome as LadderValue | null) ?? null);
      }, () => { setLastIntention(null); setLastOutcome(null); });
  }, [user, state?.promptType, state?.week, state?.audience]);

  // Record how far along Notice -> Name -> Do the member got with LAST week's
  // intention. Saved against the previous week, which is the week the intention
  // belongs to. Private: it never reaches the room screen.
  const saveOutcome = async (v: LadderValue) => {
    if (!user || !state?.week) return;
    const prevWeek = state.week - 1;
    if (prevWeek < 1) return;
    setLastOutcome(v);           // optimistic — a tap should feel instant
    setSavingOutcome(true);
    const { error } = await (db as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
    }).rpc("set_intention_outcome", {
      p_week: prevWeek,
      p_track: state.audience || "Adult",
      p_outcome: v,
    });
    setSavingOutcome(false);
    if (error) {
      toast({ title: "Couldn't save that", description: "Tap it again in a moment.", variant: "destructive" });
    }
  };

  // Persist a display-mode change back to the profile so it's the new default.
  const updateDisplayMode = async (next: DisplayMode) => {
    setDisplayMode(next);
    if (!user) return;
    await db.from("profiles").update({ live_display_mode: next }).eq("user_id", user.id);
  };

  const submit = async () => {
    if (!state || !response.trim() || !user) return;

    // Closing "intention" prompt: the one thing they'll do this week. Private by
    // design — saved only to their own journal so it can be read back next
    // Sunday. Never written to session_responses (nothing on the big screen).
    if (state.promptType === "intention") {
      const pid = profile?.id;
      if (!pid) { toast({ title: "Couldn't save", description: "Profile not ready — try again." }); return; }
      setSubmitting(true);
      const { error: intErr } = await db.from("lesson_journal").upsert(
        { profile_id: pid, week_number: state.week, track: state.audience, weekly_intention: response.trim().slice(0, 2000) },
        { onConflict: "profile_id,week_number,track" },
      );
      setSubmitting(false);
      if (intErr) { toast({ title: "Couldn't save your intention", description: intErr.message }); return; }
      setSubmittedFor(`${state.slide}`);
      setSubmittedRowId(null);
      setModerationStatus("approved");
      setResponse("");
      toast({ title: "Intention saved", description: "It'll be waiting for you next Sunday." });
      return;
    }

    // Live activity ("Together" slide). Word clouds are free text, so each word
    // is auto-screened before it can reach the screen; poll votes come from the
    // facilitator's own option list, so there is nothing to review.
    if (state.promptType === "activity") {
      const kind = (state.activityType || "reflection").toLowerCase();
      // 60 chars suits a single word-cloud word, but a completed sentence stem
      // is longer than that before the member types anything — truncating it
      // there would cut every phrase mid-word.
      const value = response.trim().slice(0, kind === "phrase" ? 220 : 60);
      setSubmitting(true);

      let status: "approved" | "pending" = "approved";
      // Free-text kinds reach the big screen verbatim, so every one of them is
      // screened first. `scale` and `choice` come from the facilitator's own
      // options, so there is nothing to review.
      if (kind === "wordcloud" || kind === "phrase") {
        try {
          const { data: mod } = await supabase.functions.invoke("moderate-content", { body: { text: value } });
          status = mod?.approved === false ? "pending" : "approved";
        } catch {
          // If the screener is unavailable, hold it for a human rather than
          // risking unmoderated text on the big screen.
          status = "pending";
        }
      }

      const { data: actRow, error: actErr } = await db
        .from("session_responses")
        .insert({
          session_code: sessionCode,
          week_number: state.week,
          audience_type: state.audience,
          user_id: user.id,
          display_name: displayMode === "anonymous" ? "Anonymous" : displayName,
          response_text: value,
          prompt_type: "activity",
          is_public: true,
          show_name: false,          // the wall shows the words, not who said them
          moderation_status: status,
        })
        .select("id")
        .maybeSingle();
      setSubmitting(false);
      if (actErr) { toast({ title: "Couldn't submit", description: actErr.message }); return; }
      setSubmittedFor(`${state.slide}`);
      setSubmittedRowId(actRow?.id ?? null);
      setModerationStatus(status);
      setResponse("");
      return;
    }

    setSubmitting(true);
    const { data, error } = await db
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

    // Persist to the member's durable journal so their live activity input shows
    // up under Session History. Only activity_response is set, so a portal
    // reflection for the same week is preserved (on-conflict updates that column
    // only). Best-effort — never block the live submission on it.
    const pid = profile?.id;
    if (pid && state.audience) {
      try {
        await db.from("lesson_journal").upsert(
          { profile_id: pid, week_number: state.week, track: state.audience, activity_response: response.trim().slice(0, 2000) },
          { onConflict: "profile_id,week_number,track" },
        );
      } catch { /* journal write is best-effort */ }
    }

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

  if (ended && !state) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-3">Mindcast LIVE</p>
          <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">SESSION ENDED</h1>
          <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6">
            This session has closed. Your reflections are already saved to your coursebook.
          </p>
          <Link to="/portal/dashboard" className="text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">Back to your dashboard</Link>
        </div>
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
            to={`/portal/login?redirect=${encodeURIComponent(redirectPath)}`}
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

  const activePrompt = state && (state.promptType === "journaling" || state.promptType === "reflection" || state.promptType === "intention" || state.promptType === "activity");
  const isActivity = state?.promptType === "activity";
  const activityKind = (state?.activityType || "reflection").toLowerCase();
  const pollOptions = state?.activityOptions ?? [];
  // activity_options doubles as widget config (see the 20260817120000 migration):
  //   scale  -> [statement, lowLabel, highLabel]
  //   phrase -> [template with ________ blanks]
  //   choice -> the option list, same as poll
  const scaleConfig = {
    statement: pollOptions[0] || "How true does this feel for you right now?",
    minLabel: pollOptions[1] || "Not at all",
    maxLabel: pollOptions[2] || "Completely",
  };
  const phraseTemplate = pollOptions[0] || "One thing I will do this week is ________.";
  const isIntentionPrompt = state?.promptType === "intention";
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

              {/* Loop-back: your own intention from last Sunday */}
              {!isSpectator && state.promptType === "intention_review" && (
                <div className="mt-8 text-left border border-[hsl(var(--blue))]/30 bg-[hsl(var(--blue))]/[0.06] rounded-sm p-5">
                  <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-2">Your intention last week</p>
                  {lastIntention ? (
                    <>
                      <p className="font-serif italic text-xl text-[hsl(var(--navy))] leading-snug">"{lastIntention}"</p>
                      <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm mt-4">Did you do it? What got in the way?</p>
                      <IntentionLadder
                        value={lastOutcome}
                        onChange={saveOutcome}
                        disabled={savingOutcome}
                      />
                    </>
                  ) : (
                    <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm">
                      No intention saved from last week — you can set one at the end of today's session.
                    </p>
                  )}
                </div>
              )}
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
                  to={`/portal/login?redirect=${encodeURIComponent(`/live/${sessionCode}`)}`}
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
              <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-3">
                {isIntentionPrompt ? "Before you leave" : isActivity ? "Together" : "Reflect"}
              </p>
              {state.promptText && (
                <p className={`text-[hsl(var(--navy))] leading-snug mb-6 ${isActivity ? "font-body text-base" : "font-serif italic text-2xl"}`}>
                  {isActivity ? state.promptText : `"${state.promptText}"`}
                </p>
              )}

              {/* Scale — a 1-10 slider. The fastest interaction in the room, so
                  it carries weeks that used to be a plain textarea. */}
              {isActivity && activityKind === "scale" ? (
                <div className="mb-5">
                  <RateScale
                    statement={scaleConfig.statement}
                    minLabel={scaleConfig.minLabel}
                    maxLabel={scaleConfig.maxLabel}
                    storageKey={`live-scale-${sessionCode}-${state?.slide}`}
                    initialValue={Number(response) || 5}
                    onSave={(v) => setResponse(String(v))}
                  />
                </div>
              ) : isActivity && activityKind === "phrase" ? (
                <div className="mb-5">
                  <WordPhraseBuilder
                    template={phraseTemplate}
                    storageKey={`live-phrase-${sessionCode}-${state?.slide}`}
                    onSave={(vals) => {
                      // Rebuild the finished sentence, so the room screen shows
                      // language rather than disconnected fragments.
                      const parts = phraseTemplate.split("________");
                      setResponse(parts.map((p, i) => p + (vals[i] ?? "")).join("").trim());
                    }}
                  />
                </div>
              ) : isActivity && activityKind === "choice" && pollOptions.length > 0 ? (
                <div className="mb-5">
                  <MultipleChoiceReflection
                    question={state?.promptText || "Which is closest to you?"}
                    options={pollOptions}
                    storageKey={`live-choice-${sessionCode}-${state?.slide}`}
                    onSave={({ selected }) => setResponse(selected[0] ?? "")}
                  />
                </div>
              ) : /* Poll — tap one of the facilitator's options. */
              isActivity && activityKind === "poll" && pollOptions.length > 0 ? (
                <div className="space-y-2 mb-5">
                  {pollOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setResponse(opt)}
                      className={`w-full text-left px-4 py-3 rounded-sm border font-body text-base transition-colors ${
                        response === opt
                          ? "border-[hsl(var(--blue))] bg-[hsl(var(--blue))]/10 text-[hsl(var(--navy))]"
                          : "border-[hsl(var(--warm-border))] bg-white text-[hsl(var(--navy))]/80 hover:border-[hsl(var(--blue))]/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : isActivity && activityKind === "wordcloud" ? (
                <>
                  <input
                    value={response}
                    onChange={e => setResponse(e.target.value.slice(0, 24))}
                    placeholder="One word…"
                    className="w-full px-4 py-3 border border-[hsl(var(--warm-border))] rounded-sm font-body text-xl text-center text-[hsl(var(--navy))] focus:outline-none focus:border-[hsl(var(--blue))]"
                  />
                  <p className="text-[10px] text-[hsl(var(--navy-mid))]/60 font-body mt-1 mb-4 text-center">
                    Your word joins the wall — your name is not shown.
                  </p>
                </>
              ) : (
              <>
              <textarea value={response} onChange={e => setResponse(e.target.value.slice(0, 300))}
                placeholder={isIntentionPrompt ? "One specific thing I will do this week…" : "Type your response…"}
                rows={5}
                className="w-full px-4 py-3 border border-[hsl(var(--warm-border))] rounded-sm font-body text-[hsl(var(--navy))] resize-none focus:outline-none focus:border-[hsl(var(--blue))]" />
              <div className="flex justify-between text-[10px] text-[hsl(var(--navy-mid))]/60 font-body mt-1 mb-4">
                <span>{response.length}/300</span>
              </div>
              </>
              )}

              <div className="space-y-3 mb-5">
                {isIntentionPrompt ? (
                  <p className="text-[hsl(var(--navy-mid))]/70 font-body text-xs px-1">
                    Private to you. It goes in your coursebook and comes back next Sunday.
                  </p>
                ) : isActivity ? (
                  <p className="text-[hsl(var(--navy-mid))]/70 font-body text-xs px-1">
                    {activityKind === "poll" || activityKind === "choice"
                      ? "Your choice is counted in the room's totals — no names shown."
                      : activityKind === "scale"
                      ? "Your number joins the room's spread — no names shown."
                      : activityKind === "phrase"
                      ? "Your sentence joins the wall anonymously, once it's checked."
                      : "Your word joins the wall anonymously."}
                  </p>
                ) : (
                  <Toggle label="Share on screen" value={shareOnScreen} onChange={setShareOnScreen} />
                )}

                <div className={`px-3 py-2.5 bg-white border border-[hsl(var(--warm-border))] rounded-sm ${isIntentionPrompt || isActivity ? "hidden" : ""}`}>
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
