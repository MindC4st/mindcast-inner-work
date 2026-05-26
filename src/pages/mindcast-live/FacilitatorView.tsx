import { useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import {
  ChevronLeft, ChevronRight, Maximize, Minimize, Lock, Unlock,
  StickyNote, Eye, EyeOff, Play, Pause, RotateCcw, X, QrCode, Download, Film,
  Check, ShieldOff, PenLine, ArrowLeft,
} from "lucide-react";

// tldraw is ~400KB+ — only fetch the chunk when the facilitator actually
// opens the whiteboard on the Exercise slide.
const ExerciseWhiteboard = lazy(() => import("@/components/whiteboard/ExerciseWhiteboard"));
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { downloadWorksheetPdf } from "@/lib/generateWorksheetPdf";

const SLIDE_TITLES = [
  "Title", "Signal Metaphor", "Ancient Wisdom", "Opening Hook",
  "Core Concept", "Teaching Points", "Reflection 1", "Experiential Exercise",
  "Guided Reflection", "Reflection 2", "Weekly Practices", "Video", "Affirmation",
];

type Session = {
  id: string;
  week_number: number;
  phase: number;
  phase_name: string;
  theme_title: string;
  audience: string;
  core_concept: string;
  signal_metaphor: string;
  ancient_wisdom_reframe: string;
  session_title: string;
  opening_hook: string;
  teaching_points: string;
  experiential_exercise: string;
  guided_reflection: string;
  journaling_prompt: string;
  weekly_practice_mon: string;
  weekly_practice_wed: string;
  weekly_practice_sun: string;
  core_affirmation: string;
  video_link: string;
  video_description: string;
  video_backup_description: string;
  facilitator_notes: string;
};

type Response = {
  id: string;
  display_name: string;
  response_text: string;
  show_name: boolean;
  is_public: boolean;
  created_at: string;
  hidden: boolean;
  moderation_status: "pending" | "approved" | "denied" | null;
};

// Mindcast-tone presets — moderators can pick one or write their own.
const DENIAL_PRESETS = [
  "Held — not for tonight's room. Thank you for trusting us with it.",
  "Some words live better between you and the page. We'll keep this one private.",
  "We're keeping the space gentle tonight. Feel free to share another reflection.",
];

const genCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");

const splitPoints = (text: string): string[] => {
  if (!text) return [];
  const numbered = text.split(/\n?\s*\d+\.\s+/).filter(Boolean);
  if (numbered.length > 1) return numbered.map(s => s.trim());
  return text.split(/\n+/).filter(s => s.trim().length > 0);
};

const FacilitatorView = () => {
  const { weekNumber } = useParams();
  const week = parseInt(weekNumber || "1", 10);
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [audience, setAudience] = useState<"Adult" | "Teen" | "Child">(
    (search.get("a") as any) || "Adult"
  );
  const [session, setSession] = useState<Session | null>(null);
  const [slide, setSlide] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [revealCount, setRevealCount] = useState(1);
  const [unlocked, setUnlocked] = useState(false);
  const [showResponses, setShowResponses] = useState(true);
  const [responses, setResponses] = useState<Response[]>([]);
  const [code] = useState(() => search.get("code") || genCode());
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [renderedMp4, setRenderedMp4] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist code in URL
  useEffect(() => {
    if (!search.get("code")) {
      const next = new URLSearchParams(search);
      next.set("code", code);
      setSearch(next, { replace: true });
    }
  }, []);

  // Load session
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("mindcast_live_sessions")
        .select("*")
        .eq("week_number", week)
        .eq("audience", audience)
        .maybeSingle();
      setSession(data as Session | null);
      setRevealCount(1);
    })();
  }, [week, audience]);

  // Load + realtime-subscribe the worksheets row for this lesson so the
  // generated MP4 appears the moment the Shotstack webhook completes.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("worksheets")
        .select("video_mp4_url, render_status")
        .eq("week_number", week).eq("audience_type", audience).maybeSingle();
      if (!active) return;
      setRenderedMp4(data?.video_mp4_url || null);
      setRenderStatus(data?.render_status || null);
    })();
    const ch = supabase
      .channel(`worksheet:${week}:${audience}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "worksheets",
          filter: `week_number=eq.${week}` },
        (p: any) => {
          if (p.new?.audience_type !== audience) return;
          setRenderedMp4(p.new?.video_mp4_url || null);
          setRenderStatus(p.new?.render_status || null);
        })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [week, audience]);

  // Load unlocked state — count rows for this week across members. The
  // facilitator considers a lesson "unlocked" when at least one member has it.
  useEffect(() => {
    (async () => {
      const { count } = await (supabase as any)
        .from("unlocked_lessons")
        .select("user_id", { count: "exact", head: true })
        .eq("week_number", week);
      setUnlocked((count ?? 0) > 0);
    })();
  }, [week]);

  // Load + subscribe responses (public only — private submissions stay hidden
  // from the live feed even though RLS lets facilitators read them).
  // Pending rows feed the moderation queue; approved rows feed the live wall.
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("session_responses")
        .select("id, display_name, response_text, show_name, is_public, created_at, hidden, moderation_status")
        .eq("session_code", code)
        .eq("is_public", true)
        .in("moderation_status", ["pending", "approved"])
        .order("created_at", { ascending: false })
        .limit(80);
      setResponses(data || []);
    })();
    const ch = supabase
      .channel(`responses:${code}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_responses", filter: `session_code=eq.${code}` },
        (p: any) => { if (p.new?.is_public) setResponses(prev => [p.new, ...prev]); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "session_responses", filter: `session_code=eq.${code}` },
        (p: any) => setResponses(prev => {
          // If a row was just made private, hidden, or denied, drop it.
          if (!p.new?.is_public || p.new?.hidden || p.new?.moderation_status === "denied") {
            return prev.filter(r => r.id !== p.new.id);
          }
          const existing = prev.find(r => r.id === p.new.id);
          return existing
            ? prev.map(r => r.id === p.new.id ? p.new : r)
            : [p.new, ...prev];
        }))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "session_responses", filter: `session_code=eq.${code}` },
        (p: any) => setResponses(prev => prev.filter(r => r.id !== p.old?.id)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [code]);

  // Broadcast current prompt to audience
  useEffect(() => {
    if (!session) return;
    const promptType = slide === 6 ? "journaling" : slide === 9 ? "reflection" : "idle";
    const promptText = slide === 6 ? session.journaling_prompt : slide === 9 ? session.guided_reflection : "";
    const payload = { week, audience, slide, promptType, promptText, title: session.theme_title };

    const ch = supabase.channel(`live:${code}`, { config: { broadcast: { self: false } } });
    const sendState = () => ch.send({ type: "broadcast", event: "state", payload });

    // Re-send state whenever a member requests it (on join)
    ch.on("broadcast", { event: "hello" }, () => { sendState(); });
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        sendState();
        // Re-broadcast to catch late joiners
        setTimeout(sendState, 1000);
        setTimeout(sendState, 3000);
      }
    });
    return () => { supabase.removeChannel(ch); };
  }, [slide, session, code, week, audience]);

  // Keyboard navigation
  const goNext = useCallback(() => {
    if (slide === 5 && session) {
      const total = splitPoints(session.teaching_points).length;
      if (revealCount < total) { setRevealCount(c => c + 1); return; }
    }
    setSlide(s => Math.min(s + 1, 12));
  }, [slide, session, revealCount]);
  const goPrev = useCallback(() => setSlide(s => Math.max(s - 1, 0)), []);

  const toggleFs = useCallback(async () => {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "f") toggleFs();
    };
    window.addEventListener("keydown", onKey);
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFs); };
  }, [goNext, goPrev, toggleFs]);

  const isFacilitator = role === "facilitator";

  const handleUnlock = async () => {
    if (!isFacilitator) { toast({ title: "Facilitators only" }); return; }
    if (unlocked) return;
    // Fan out: one unlock row per member profile so each user sees their own
    // unlock state. Upserts on (user_id, week_number).
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from("profiles").select("user_id");
    if (profilesError) {
      toast({ title: "Could not load members", description: profilesError.message });
      return;
    }
    const rows = (profiles || [])
      .filter((p: any) => p.user_id)
      .map((p: any) => ({ user_id: p.user_id, week_number: week, facilitator_id: user?.id }));
    if (rows.length === 0) {
      toast({ title: "No members to unlock for" });
      return;
    }
    const { error } = await (supabase as any).from("unlocked_lessons")
      .upsert(rows, { onConflict: "user_id,week_number", ignoreDuplicates: true });
    if (error) { toast({ title: "Could not unlock", description: error.message }); return; }
    setUnlocked(true);
    toast({ title: `Lesson unlocked for ${rows.length} member${rows.length === 1 ? "" : "s"}` });
  };

  const hideResponse = async (id: string) => {
    await (supabase as any).from("session_responses").update({ hidden: true }).eq("id", id);
    setResponses(prev => prev.filter(r => r.id !== id));
  };

  // Fire-and-forget broadcast to the audience so the submitter sees the
  // moderator's decision land on their own device.
  const broadcastModeration = async (
    id: string,
    status: "approved" | "denied",
    reason?: string,
  ) => {
    const ch = supabase.channel(`live:${code}`);
    await new Promise<void>((resolve) => {
      ch.subscribe((s) => { if (s === "SUBSCRIBED") resolve(); });
    });
    await ch.send({
      type: "broadcast",
      event: "moderation",
      payload: { id, status, reason },
    });
    supabase.removeChannel(ch);
  };

  const approveResponse = async (id: string) => {
    const { error } = await (supabase as any)
      .from("session_responses")
      .update({ moderation_status: "approved" })
      .eq("id", id);
    if (error) { toast({ title: "Couldn't approve", description: error.message }); return; }
    setResponses(prev => prev.map(r => r.id === id ? { ...r, moderation_status: "approved" } : r));
    broadcastModeration(id, "approved");
  };

  const denyResponse = async (id: string, reason: string) => {
    // Broadcast first so the submitter sees the Mindcast-tone message even
    // if the DB delete races with their realtime listener.
    await broadcastModeration(id, "denied", reason);
    const { error } = await (supabase as any)
      .from("session_responses")
      .delete()
      .eq("id", id);
    if (error) { toast({ title: "Couldn't remove response", description: error.message }); return; }
    setResponses(prev => prev.filter(r => r.id !== id));
  };

  const handleGenerateVideo = async () => {
    if (!isFacilitator) { toast({ title: "Facilitators only" }); return; }
    setGeneratingVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-session-video", {
        body: { week_number: week, audience },
      });
      // supabase-js gives a generic FunctionsHttpError on non-2xx — pull the real
      // error message out of the response body when available.
      if (error) {
        let detail = error.message;
        try {
          const ctx: any = (error as any).context;
          if (ctx?.body) {
            const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body).text();
            const parsed = JSON.parse(text);
            if (parsed?.error) detail = parsed.error;
          }
        } catch { /* keep generic */ }
        throw new Error(detail);
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      setRenderStatus("processing");
      toast({
        title: "Video rendering started",
        description: "Storyboard + narration uploaded. MP4 will appear on the slide when Shotstack finishes (~3–5 min).",
      });
    } catch (e: any) {
      console.error("generate-session-video failed:", e);
      toast({ title: "Video generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingVideo(false);
    }
  };

  if (!session) {
    return <div className="min-h-screen bg-[hsl(var(--navy))] flex items-center justify-center text-[hsl(var(--ivory))]/60 font-body text-sm tracking-widest">LOADING WEEK {week} ({audience})...</div>;
  }

  const liveBoard = responses.filter(r => !r.hidden && r.moderation_status === "approved");
  const pendingQueue = responses.filter(r => !r.hidden && (r.moderation_status === "pending" || r.moderation_status === null));
  const onReflection = slide === 6 || slide === 9;
  const joinUrl = `${window.location.origin}/live/${code}`;

  return (
    <div ref={containerRef} className="min-h-screen bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] flex flex-col relative overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[hsl(var(--ivory))]/10 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/mindcast-live/library")} className="text-[hsl(var(--ivory))]/40 hover:text-[hsl(var(--ivory))]/80 text-xs font-body tracking-widest">← LIBRARY</button>
          <span className="text-[hsl(var(--bronze))] font-display text-2xl tracking-wider">WEEK {week}</span>
          <span className="text-[hsl(var(--ivory))]/50 text-xs font-body tracking-widest uppercase">{session.phase_name}</span>
        </div>
        <div className="flex items-center gap-2">
          {(["Adult", "Teen", "Child"] as const).map(a => (
            <button key={a} onClick={() => setAudience(a)}
              className={`px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm transition-colors ${audience === a ? "bg-[hsl(var(--blue))] text-white" : "bg-[hsl(var(--ivory))]/5 text-[hsl(var(--ivory))]/60 hover:bg-[hsl(var(--ivory))]/10"}`}>{a}</button>
          ))}
          <div className="w-px h-5 bg-[hsl(var(--ivory))]/20 mx-2" />
          <button onClick={handleUnlock} disabled={unlocked}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm transition-colors ${unlocked ? "bg-[hsl(var(--bronze))]/20 text-[hsl(var(--bronze))]" : "bg-[hsl(var(--ivory))]/5 text-[hsl(var(--ivory))]/70 hover:bg-[hsl(var(--ivory))]/10"}`}>
            {unlocked ? <Unlock size={12} /> : <Lock size={12} />}{unlocked ? "Unlocked" : "Unlock"}
          </button>
          <button onClick={() => session && downloadWorksheetPdf(session as any)} title="Download worksheet PDF" className="p-1.5 rounded-sm bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10"><Download size={14} /></button>
          {isFacilitator && (
            <button
              onClick={handleGenerateVideo}
              disabled={generatingVideo}
              title="Generate Session Video (Claude storyboard + ElevenLabs narration)"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm bg-[hsl(var(--ivory))]/5 text-[hsl(var(--ivory))]/70 hover:bg-[hsl(var(--ivory))]/10 disabled:opacity-40"
            >
              <Film size={12} />{generatingVideo ? "Generating…" : "Generate Video"}
            </button>
          )}
          <button onClick={() => setNotesOpen(true)} className="p-1.5 rounded-sm bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10"><StickyNote size={14} /></button>
          <button onClick={toggleFs} className="p-1.5 rounded-sm bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10">{isFs ? <Minimize size={14} /> : <Maximize size={14} />}</button>
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 flex relative">
        <div className={`flex-1 relative ${onReflection && showResponses ? "lg:w-2/3" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div key={`${slide}-${audience}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center px-12 py-8">
              <SlideRenderer slide={slide} session={session} revealCount={revealCount} joinUrl={joinUrl} code={code} renderedMp4={renderedMp4} renderStatus={renderStatus} onSessionUpdate={setSession} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live response panel on reflection slides */}
        {onReflection && showResponses && (
          <div className="hidden lg:flex w-1/3 border-l border-[hsl(var(--ivory))]/10 bg-black/20 flex-col">
            <div className="p-4 border-b border-[hsl(var(--ivory))]/10 flex items-center justify-between">
              <div>
                <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.3em] font-body uppercase">Moderation</p>
                <p className="text-[hsl(var(--ivory))]/70 text-xs font-body mt-0.5">
                  {pendingQueue.length} pending · {liveBoard.length} on screen
                </p>
              </div>
            <div className="bg-white p-2 rounded inline-block">
                <QRCode value={joinUrl} size={80} level="M" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Pending queue */}
              <div>
                <p className="text-[hsl(var(--bronze))] text-[9px] tracking-[0.3em] font-body uppercase mb-2">Awaiting approval</p>
                {pendingQueue.length === 0 && (
                  <div className="text-center py-6 text-[hsl(var(--ivory))]/20 text-[10px] font-body tracking-widest uppercase">No pending responses</div>
                )}
                <div className="space-y-2">
                  {pendingQueue.map(r => (
                    <PendingCard key={r.id} response={r} onApprove={approveResponse} onDeny={denyResponse} />
                  ))}
                </div>
              </div>

              {/* Approved → on screen */}
              {liveBoard.length > 0 && (
                <div>
                  <p className="text-[hsl(var(--blue-light))] text-[9px] tracking-[0.3em] font-body uppercase mb-2">On screen</p>
                  <div className="space-y-2">
                    {liveBoard.map(r => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="group bg-[hsl(var(--ivory))]/[0.04] border border-[hsl(var(--ivory))]/10 rounded-sm p-3 relative">
                        <p className="text-[hsl(var(--ivory))] text-sm font-body leading-relaxed">{r.response_text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[hsl(var(--ivory))]/30 text-[10px] font-body tracking-widest uppercase">
                            {r.show_name ? r.display_name : "Anonymous"}
                          </span>
                          <button onClick={() => hideResponse(r.id)} title="Hide from screen" className="opacity-0 group-hover:opacity-100 text-[hsl(var(--ivory))]/30 hover:text-red-400">
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[hsl(var(--ivory))]/10 z-30">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={slide === 0} className="p-2 rounded-sm bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10 disabled:opacity-20"><ChevronLeft size={18} /></button>
          <button onClick={goNext} disabled={slide === 12} className="p-2 rounded-sm bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10 disabled:opacity-20"><ChevronRight size={18} /></button>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[hsl(var(--ivory))]/50 text-[10px] font-body tracking-widest uppercase">{SLIDE_TITLES[slide]}</span>
          <span className="text-[hsl(var(--bronze))] font-display text-lg tracking-wider">{slide + 1} / 13</span>
        </div>
        <div className="flex items-center gap-2">
          {onReflection && (
            <button onClick={() => setShowResponses(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-body tracking-widest uppercase rounded-sm bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10">
              {showResponses ? <Eye size={12} /> : <EyeOff size={12} />}{showResponses ? "Showing" : "Hidden"}
            </button>
          )}
          <span className="text-[hsl(var(--ivory))]/40 text-[10px] font-body tracking-widest uppercase">Code</span>
          <span className="font-display text-[hsl(var(--bronze))] text-xl tracking-[0.3em]">{code}</span>
        </div>
      </div>

      {/* Notes drawer */}
      <AnimatePresence>
        {notesOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 h-full w-96 bg-[hsl(var(--navy))] border-l border-[hsl(var(--ivory))]/15 z-40 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl tracking-wider text-[hsl(var(--bronze))]">FACILITATOR NOTES</h3>
              <button onClick={() => setNotesOpen(false)} className="text-[hsl(var(--ivory))]/40 hover:text-[hsl(var(--ivory))]"><X size={18} /></button>
            </div>
            <p className="text-[hsl(var(--ivory))]/80 text-sm font-body leading-relaxed whitespace-pre-wrap">{session.facilitator_notes || "No notes for this session."}</p>
            <div className="mt-6 pt-6 border-t border-[hsl(var(--ivory))]/10">
              <p className="text-[hsl(var(--ivory))]/40 text-[10px] tracking-widest uppercase mb-2 font-body">Join QR</p>
              <div className="bg-white p-3 rounded inline-block"><QRCode value={joinUrl} size={150} level="M" /></div>
              <p className="text-[hsl(var(--ivory))]/60 text-xs mt-2 font-body">{joinUrl}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Slide renderer ---------------- */

const SlideRenderer = ({ slide, session, revealCount, joinUrl, code, renderedMp4, renderStatus, onSessionUpdate }: { slide: number; session: Session; revealCount: number; joinUrl: string; code: string; renderedMp4: string | null; renderStatus: string | null; onSessionUpdate: (s: Session) => void }) => {
  switch (slide) {
    case 0: return (
      <div className="text-center max-w-5xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-6">Week {session.week_number} · {session.phase_name}</p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="font-display text-7xl md:text-8xl tracking-wide text-[hsl(var(--ivory))] mb-6">{session.theme_title.toUpperCase()}</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-[hsl(var(--blue-light))] text-2xl font-serif italic">{session.session_title}</motion.p>
      </div>
    );
    case 1: return (
      <SignalMetaphorSlide
        text={session.signal_metaphor}
        mp4Url={renderedMp4}
        renderStatus={renderStatus}
      />
    );
    case 2: return (
      <div className="max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Ancient Wisdom</p>
        <div className="border border-[hsl(var(--bronze))]/30 rounded-sm p-10 md:p-14 bg-gradient-to-br from-[hsl(var(--ivory))]/[0.03] to-transparent">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--ivory))] leading-relaxed">{session.ancient_wisdom_reframe}</p>
        </div>
      </div>
    );
    case 3: return (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-8">Opening Hook</p>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-4xl text-[hsl(var(--ivory))] leading-snug">{session.opening_hook}</motion.p>
      </div>
    );
    case 4: return (
      <div className="max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-6">Core Concept</p>
        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
          {session.core_concept.split(/\n+/).filter(Boolean).map((para, i) => (
            <p key={i} className="text-[hsl(var(--ivory))]/90 text-xl md:text-2xl font-body leading-relaxed">{para}</p>
          ))}
        </div>
      </div>
    );
    case 5: {
      const points = splitPoints(session.teaching_points);
      return (
        <div className="max-w-5xl w-full">
          <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-8">Teaching Points</p>
          <div className="space-y-5">
            {points.slice(0, revealCount).map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="flex gap-5 items-start">
                <span className="font-display text-[hsl(var(--blue))] text-4xl leading-none w-12 shrink-0">{i + 1}</span>
                <p className="text-[hsl(var(--ivory))]/90 text-lg md:text-xl font-body leading-relaxed flex-1">{p.replace(/^\d+\.\s*/, "")}</p>
              </motion.div>
            ))}
          </div>
          {revealCount < points.length && (
            <p className="text-[hsl(var(--ivory))]/30 text-[10px] tracking-widest font-body uppercase mt-8">→ Press space for next point ({revealCount} of {points.length})</p>
          )}
        </div>
      );
    }
    case 6: return (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-8">Reflect & Share</p>
        <motion.p initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="font-serif text-3xl md:text-5xl text-[hsl(var(--ivory))] leading-snug mb-10">"{session.journaling_prompt}"</motion.p>
        <div className="inline-flex items-center gap-4 bg-[hsl(var(--ivory))]/5 px-6 py-3 rounded-sm">
          <QrCode size={16} className="text-[hsl(var(--blue-light))]" />
          <span className="text-[hsl(var(--ivory))]/70 font-body text-sm">Join at <span className="text-[hsl(var(--bronze))] font-bold">{joinUrl.replace(/^https?:\/\//, "")}</span></span>
        </div>
      </div>
    );
    case 7: return (
      <ExerciseSlide text={session.experiential_exercise} week={session.week_number} audience={session.audience} />
    );
    case 8: return (
      <div className="max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Guided Reflection</p>
        <div className="border-l-2 border-[hsl(var(--blue))] pl-8 py-4">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--ivory))]/95 leading-relaxed italic">{session.guided_reflection}</p>
        </div>
      </div>
    );
    case 9: return (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-8">Share Your Reflection</p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-serif text-3xl md:text-4xl text-[hsl(var(--ivory))] leading-snug mb-10">"{session.guided_reflection.split(/[?.]/)[0]}?"</motion.p>
        <div className="inline-flex items-center gap-4 bg-[hsl(var(--ivory))]/5 px-6 py-3 rounded-sm">
          <QrCode size={16} className="text-[hsl(var(--blue-light))]" />
          <span className="text-[hsl(var(--ivory))]/70 font-body text-sm">Code <span className="text-[hsl(var(--bronze))] font-bold tracking-[0.3em]">{code}</span></span>
        </div>
      </div>
    );
    case 10: return (
      <div className="max-w-6xl w-full">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-8 text-center">This Week's Practice</p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { day: "Mon", text: session.weekly_practice_mon },
            { day: "Wed", text: session.weekly_practice_wed },
            { day: "Sun", text: session.weekly_practice_sun },
          ].map(({ day, text }) => (
            <div key={day} className="border border-[hsl(var(--ivory))]/15 rounded-sm p-6 bg-[hsl(var(--ivory))]/[0.03]">
              <p className="font-display text-[hsl(var(--blue))] text-3xl tracking-wider mb-4">{day.toUpperCase()}</p>
              <p className="text-[hsl(var(--ivory))]/90 font-body text-base leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    );
    case 11: return (
      <VideoSlide
        link={session.video_link}
        description={session.video_description}
        backup={session.video_backup_description}
        onUpdateLink={async (newLink) => {
          const { error } = await (supabase as any).from("mindcast_live_sessions").update({ video_link: newLink }).eq("id", session.id);
          if (error) { toast({ title: "Could not save video", description: error.message, variant: "destructive" }); return; }
          onSessionUpdate({ ...session, video_link: newLink });
          toast({ title: "Video updated" });
        }}
      />
    );
    case 12: return (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-10">Affirmation</p>
        <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
          className="font-serif text-4xl md:text-6xl text-[hsl(var(--ivory))] leading-snug italic">"{session.core_affirmation}"</motion.p>
      </div>
    );
    default: return null;
  }
};

const PendingCard = ({
  response, onApprove, onDeny,
}: {
  response: Response;
  onApprove: (id: string) => void | Promise<void>;
  onDeny: (id: string, reason: string) => void | Promise<void>;
}) => {
  const [showDenyMenu, setShowDenyMenu] = useState(false);
  const [customReason, setCustomReason] = useState("");
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[hsl(var(--bronze))]/[0.06] border border-[hsl(var(--bronze))]/30 rounded-sm p-3">
      <p className="text-[hsl(var(--ivory))] text-sm font-body leading-relaxed">{response.response_text}</p>
      <div className="flex items-center justify-between mt-2 mb-2">
        <span className="text-[hsl(var(--ivory))]/30 text-[10px] font-body tracking-widest uppercase">
          {response.show_name ? response.display_name : "Anonymous"}
        </span>
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => onApprove(response.id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--blue))]/80 text-white text-[10px] font-body tracking-widest uppercase py-1.5 rounded-sm">
          <Check size={11} /> Approve
        </button>
        <button
          onClick={() => setShowDenyMenu(s => !s)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10 text-[hsl(var(--ivory))]/70 text-[10px] font-body tracking-widest uppercase py-1.5 rounded-sm">
          <ShieldOff size={11} /> Hold back
        </button>
      </div>
      <AnimatePresence>
        {showDenyMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-[hsl(var(--ivory))]/10 space-y-1.5">
            <p className="text-[hsl(var(--ivory))]/40 text-[9px] tracking-widest font-body uppercase mb-1">Pick a message to send back</p>
            {DENIAL_PRESETS.map((preset, i) => (
              <button key={i} onClick={() => onDeny(response.id, preset)}
                className="w-full text-left text-[hsl(var(--ivory))]/80 text-xs font-body leading-snug bg-[hsl(var(--ivory))]/5 hover:bg-[hsl(var(--ivory))]/10 px-2.5 py-2 rounded-sm">
                {preset}
              </button>
            ))}
            <div className="flex gap-1 mt-2">
              <input
                value={customReason}
                onChange={e => setCustomReason(e.target.value.slice(0, 200))}
                placeholder="Custom message…"
                className="flex-1 bg-[hsl(var(--ivory))]/5 border border-[hsl(var(--ivory))]/10 rounded-sm px-2 py-1.5 text-xs text-[hsl(var(--ivory))] font-body focus:outline-none focus:border-[hsl(var(--blue))]"
              />
              <button
                onClick={() => customReason.trim() && onDeny(response.id, customReason.trim())}
                disabled={!customReason.trim()}
                className="bg-[hsl(var(--ivory))]/10 hover:bg-[hsl(var(--ivory))]/15 disabled:opacity-30 text-[hsl(var(--ivory))] text-[10px] font-body tracking-widest uppercase px-3 rounded-sm">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ExerciseSlide = ({ text, week, audience }: { text: string; week: number; audience: string }) => {
  const [duration, setDuration] = useState(5);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  // The whiteboard is a separate view of this slide — opens on demand and
  // keeps its drawing per (week, audience) via tldraw persistenceKey.
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  // While the whiteboard is open we also collapse the instruction text into
  // a small floating card so the facilitator can still reference it.
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => { if (remaining === 0) setRunning(false); }, [remaining]);
  const start = () => { setRemaining(duration * 60); setRunning(true); };
  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");
  const steps = text.split(/\n+/).filter(Boolean);

  // ---------- Whiteboard mode ----------
  if (whiteboardOpen) {
    return (
      <div className="relative w-full h-full min-h-[70vh] flex flex-col">
        {/* Top toolbar — back button + collapse-instructions toggle + timer */}
        <div className="flex items-center justify-between gap-3 mb-3 z-20">
          <button
            onClick={() => setWhiteboardOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--ivory))]/10 hover:bg-[hsl(var(--ivory))]/15 text-[hsl(var(--ivory))]/80 text-xs font-body tracking-widest uppercase rounded-sm"
          >
            <ArrowLeft size={12} /> Back to instructions
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInstructionsCollapsed(c => !c)}
              className="px-3 py-1.5 bg-[hsl(var(--ivory))]/10 hover:bg-[hsl(var(--ivory))]/15 text-[hsl(var(--ivory))]/70 text-[10px] font-body tracking-widest uppercase rounded-sm"
            >
              {instructionsCollapsed ? "Show instructions" : "Hide instructions"}
            </button>
            <div className="flex items-center gap-2 bg-[hsl(var(--ivory))]/10 px-3 py-1.5 rounded-sm">
              <span className="text-[hsl(var(--ivory))]/40 text-[10px] tracking-widest font-body uppercase">Timer</span>
              <span className="font-display text-[hsl(var(--bronze))] text-base tracking-wider tabular-nums">
                {running || remaining > 0 ? `${mm}:${ss}` : `${duration}:00`}
              </span>
              <button onClick={start} className="p-1 bg-[hsl(var(--blue))] text-white rounded-sm"><Play size={10} /></button>
              <button onClick={() => setRunning(r => !r)} className="p-1 bg-[hsl(var(--ivory))]/10 rounded-sm">{running ? <Pause size={10} /> : <Play size={10} />}</button>
              <button onClick={() => { setRunning(false); setRemaining(0); }} className="p-1 bg-[hsl(var(--ivory))]/10 rounded-sm"><RotateCcw size={10} /></button>
            </div>
          </div>
        </div>

        {/* Whiteboard surface (fills remaining height). The light theme keeps
            ink readable; the surrounding slide stays dark navy. */}
        <div className="relative flex-1 rounded-sm overflow-hidden border border-[hsl(var(--ivory))]/15 bg-white min-h-[60vh]">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--navy-mid))]/60 text-xs font-body tracking-widest uppercase">
              Loading whiteboard…
            </div>
          }>
            <ExerciseWhiteboard week={week} audience={audience} />
          </Suspense>

          {/* Floating instructions card — collapsible reference */}
          {!instructionsCollapsed && (
            <div className="absolute top-3 left-3 z-30 max-w-sm bg-[hsl(var(--navy))]/90 backdrop-blur-sm border border-[hsl(var(--ivory))]/15 rounded-sm p-4 shadow-xl">
              <p className="text-[hsl(var(--bronze))] text-[9px] tracking-[0.4em] font-body uppercase mb-2">Exercise</p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="font-display text-[hsl(var(--blue-light))] text-xs shrink-0 w-4">{i + 1}.</span>
                    <p className="text-[hsl(var(--ivory))]/90 font-body text-xs leading-relaxed">{s.replace(/^\d+\.?\s*/, "")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- Default (instructions + timer) view ----------
  return (
    <div className="max-w-5xl w-full">
      <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Experiential Exercise</p>
      <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="font-display text-[hsl(var(--blue))] text-xl shrink-0 w-7">{i + 1}.</span>
              <p className="text-[hsl(var(--ivory))]/90 font-body text-base md:text-lg leading-relaxed">{s.replace(/^\d+\.?\s*/, "")}</p>
            </div>
          ))}
          <button
            onClick={() => setWhiteboardOpen(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--blue))]/80 text-white text-xs font-body tracking-widest uppercase rounded-sm"
          >
            <PenLine size={13} /> Open whiteboard
          </button>
        </div>
        <div className="border border-[hsl(var(--ivory))]/15 rounded-sm p-6 text-center min-w-[180px]">
          <p className="text-[hsl(var(--ivory))]/40 text-[10px] tracking-widest font-body uppercase mb-3">Timer</p>
          <p className="font-display text-[hsl(var(--bronze))] text-5xl tracking-wider tabular-nums">{running || remaining > 0 ? `${mm}:${ss}` : `${duration}:00`}</p>
          <div className="flex justify-center gap-1 mt-3">
            {[1,3,5,10,15].map(m => (
              <button key={m} onClick={() => setDuration(m)}
                className={`px-2 py-1 text-[10px] font-body rounded-sm ${duration === m ? "bg-[hsl(var(--blue))] text-white" : "bg-[hsl(var(--ivory))]/10 text-[hsl(var(--ivory))]/60"}`}>{m}m</button>
            ))}
          </div>
          <div className="flex gap-2 mt-3 justify-center">
            <button onClick={start} className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--blue))] text-white text-xs font-body rounded-sm">
              <Play size={12} />Start
            </button>
            <button onClick={() => setRunning(r => !r)} className="p-1.5 bg-[hsl(var(--ivory))]/10 rounded-sm">{running ? <Pause size={12} /> : <Play size={12} />}</button>
            <button onClick={() => { setRunning(false); setRemaining(0); }} className="p-1.5 bg-[hsl(var(--ivory))]/10 rounded-sm"><RotateCcw size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Signal Metaphor slide — the AI-generated 2-min film is conceptually a
 * visual rendering of this metaphor (city/noise → signal), so we play it
 * here when it exists. If no MP4 yet, the quote stands alone.
 */
const SignalMetaphorSlide = ({
  text, mp4Url, renderStatus,
}: { text: string; mp4Url: string | null; renderStatus: string | null }) => {
  const rendering = renderStatus === "processing" || renderStatus === "rendering" || renderStatus === "saving";

  if (mp4Url) {
    return (
      <div className="max-w-5xl w-full">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-4 text-center">The Signal</p>
        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[hsl(var(--ivory))]/15 bg-black">
          <video src={mp4Url} controls className="w-full h-full" />
        </div>
        <motion.blockquote initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
          className="text-center mt-6 px-8">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--ivory))]/95 leading-snug italic">"{text}"</p>
        </motion.blockquote>
      </div>
    );
  }

  if (rendering) {
    return (
      <div className="max-w-5xl w-full">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-4 text-center">The Signal</p>
        <div className="aspect-video w-full rounded-sm border border-[hsl(var(--ivory))]/15 flex flex-col items-center justify-center bg-[hsl(var(--ivory))]/[0.03] gap-3">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--blue))] animate-pulse" />
          <p className="text-[hsl(var(--ivory))]/60 text-xs font-body tracking-widest uppercase">Rendering session video…</p>
          <p className="text-[hsl(var(--ivory))]/30 text-[10px] font-body">Shotstack typically takes 3–5 minutes</p>
        </div>
        <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--ivory))]/95 leading-snug italic text-center mt-6 px-8">"{text}"</p>
      </div>
    );
  }

  // Default — original full-bleed metaphor design with ambient gradient pulse.
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--blue))]/10 via-transparent to-[hsl(var(--bronze))]/10 animate-pulse" style={{ animationDuration: "6s" }} />
      <motion.blockquote initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}
        className="relative max-w-4xl text-center px-8">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-8">The Signal</p>
        <p className="font-serif text-4xl md:text-5xl text-[hsl(var(--ivory))] leading-snug italic">"{text}"</p>
      </motion.blockquote>
    </div>
  );
};

const VideoSlide = ({ link, description, backup, onUpdateLink }: { link: string; description: string; backup: string; onUpdateLink: (newLink: string) => void | Promise<void> }) => {
  const ytMatch = link?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  const ytId = ytMatch?.[1];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(link || "");
  const [saving, setSaving] = useState(false);
  useEffect(() => { setDraft(link || ""); }, [link]);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const valid = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/.test(trimmed);
    if (!valid) { toast({ title: "Invalid YouTube URL", variant: "destructive" }); return; }
    setSaving(true);
    await onUpdateLink(trimmed);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="max-w-5xl w-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase">This Week's Listen</p>
        <button onClick={() => setEditing(e => !e)} className="text-[hsl(var(--ivory))]/40 hover:text-[hsl(var(--ivory))] text-[10px] font-body tracking-widest uppercase border border-[hsl(var(--ivory))]/20 rounded-sm px-2 py-1">
          {editing ? "Cancel" : "Replace URL"}
        </button>
      </div>
      {editing && (
        <div className="mb-4 flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 bg-[hsl(var(--ivory))]/5 border border-[hsl(var(--ivory))]/20 rounded-sm px-3 py-2 text-[hsl(var(--ivory))] text-sm font-body"
          />
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-[hsl(var(--blue))] text-white text-xs font-body tracking-widest uppercase rounded-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
      {ytId ? (
        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[hsl(var(--ivory))]/15">
          <iframe key={ytId} src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-sm border border-[hsl(var(--ivory))]/15 flex items-center justify-center bg-[hsl(var(--ivory))]/[0.03]">
          <p className="text-[hsl(var(--ivory))]/40 text-sm font-body">No video — paste a YouTube URL above</p>
        </div>
      )}
      <p className="text-[hsl(var(--ivory))]/80 text-base font-body mt-4 text-center">{description}</p>
      {backup && <p className="text-[hsl(var(--ivory))]/30 text-xs font-body mt-2 text-center italic">Backup: {backup}</p>}
    </div>
  );
};

export default FacilitatorView;
