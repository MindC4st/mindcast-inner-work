import { useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense, type ReactNode } from "react";
import { CanvasSurface, isCanvasSurface } from "@/components/session/activitySurfaces";
import { practiceEntries } from "@/lib/practiceCadence";
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
import WelcomeWall from "@/components/mindcast-live/WelcomeWall";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { downloadWorksheetPdf } from "@/lib/generateWorksheetPdf";
import { resolveColouringUrl } from "@/lib/colouringUrl";
import SlideTimer from "@/components/session-runner/SlideTimer";
import { enqueue, flush, type Room } from "@/lib/rollOffline";
import { splitKidsGame } from "@/lib/kidsGame";

// Data-driven deck: a session is an ordered list of slide "kinds", so the order
// can change (and the video can flex position) without touching the renderer.
// Confirmed order: wisdom -> metaphor + how-to-apply -> video (as supporting
// evidence), with the video flexing to near the end when video_position='late'.
// Facilitator deck sequence:
// Check In → Return to Your Intention → Inner Wisdom → In Today's World →
// [Video (Evidence)] → [Coloring Activity (Child only)] → Go Deeper →
// Reflect & Share → Together (Activity) → Guided Reflection → This Week's Practice
// v4 deck — 8 projected slides for Adult/Teen. Child has 9: it adds the
// safeguarded colouring activity and replaces the affirmation close with the
// active group game from the Notion lesson.
// `wisdomworld` merges Inner Wisdom with In Today's World; `deeper` merges Go
// Deeper with the Together activity. The retired kinds are kept so any stored
// per-week override still type-checks, but nothing maps to them any more.
type SlideKind =
  | "title" | "intention" | "wisdomworld" | "video" | "coloring"
  | "deeper" | "reflect" | "practice" | "affirmation" | "closing_game"
  // retired from projection in v4:
  | "wisdom" | "metaphor" | "core" | "activity" | "guided" | "commitment";

const SLIDE_TITLE: Record<SlideKind, string> = {
  title: "Welcome + Opening Question",
  intention: "Return to Your Intention",
  wisdomworld: "Inner Wisdom + In Today's World",
  video: "This Week's Listen",
  coloring: "Colouring Activity",
  deeper: "Go Deeper + Together",
  reflect: "Reflect & Share",
  practice: "Before You Leave",
  affirmation: "Closing Affirmation",
  closing_game: "The Closing Game / Activity",
  // retired
  wisdom: "Inner Wisdom", metaphor: "In Today's World", core: "Go Deeper",
  activity: "Together", guided: "Guided Reflection",
  commitment: "Your Intention for the Week",
};

// The v3 deck is data-driven: lesson_slides rows map to a render kind via the
// stable slide_key. This map is the ONLY hard-coded link; order, active state,
// track applicability and titles all come from the table.
const SLIDE_KEY_TO_KIND: Record<string, SlideKind | null> = {
  welcome: "title",
  voices: "intention",
  ancient: "wisdomworld",   // now carries BOTH wisdom and today's world
  video: "video",
  coloring: "coloring",     // Child track only, via applies_to_tracks
  deeper: "deeper",         // now carries BOTH go-deeper and the activity
  reflection: "reflect",
  intention: "practice",    // 90s write + weekly practice table
  affirmation: "affirmation",
  closing_game: "closing_game",
  notes: null,              // facilitator notes live in the drawer, not projected
  // Retired in v4; deactivated in the DB but mapped to null so an old row
  // can never reintroduce a slide the deck no longer has.
  todays_world: null,
  theme: null,
  exercise: null,
};

const buildDeck = (audience?: string): SlideKind[] => {
  // Child keeps the full lesson journey, inserts an approved colouring
  // activity before Go Deeper, and closes with its physical group game.
  if (audience === "Child") {
    return [
      "title", "intention", "wisdomworld", "video",
      "coloring", "deeper", "reflect", "practice", "closing_game",
    ];
  }
  return [
    "title", "intention", "wisdomworld", "video",
    "deeper", "reflect", "practice", "affirmation",
  ];
};

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
  opening_question: string;
  teaching_points: string;
  experiential_exercise: string;
  guided_reflection: string;
  journaling_prompt: string;
  weekly_practice_mon: string;
  weekly_practice_wed: string;
  weekly_practice_sun: string;
  core_affirmation: string;
  closing_quote: string;
  closing_quote_attribution: string;
  private_write_prompt: string;
  intention_prompt: string;
  todays_theme: string;
  ancient_wisdom_video_url: string;
  ancient_wisdom_captions_url: string;
  ancient_wisdom_approval: string;
  todays_world_video_url: string;
  todays_world_captions_url: string;
  todays_world_approval: string;
  video_local_url: string;
  video_link: string;
  video_description: string;
  video_backup_description: string;
  video_transcript: string;
  video_question_1: string;
  video_question_2: string;
  facilitator_notes: string;
  previous_week_callback: string;
  video_position: string;
  coloring_page_url: string | null;
  coloring_pdf_url: string | null;
  // Approval gate: generated colouring pages land 'unapproved' and cannot be
  // displayed or printed until a facilitator approves them.
  coloring_approval: string;
  // Child-track content (curriculum_weeks kids_* columns).
  kids_picture_book: string;
  kids_picture_book_author: string;
  kids_picture_book_question: string;
  kids_colouring_prompt: string;
  kids_game: string;
  kids_game_equipment: string;
  kids_game_under5: string;
  kids_source: string;
  kids_read_aloud_source_check: string;
  kids_signal_metaphor: string;
  // Child Slide 2 recap — last week's theme in child terms.
  last_week_theme: string;
  // Which live widget the Together slide runs, and the poll's choices.
  thought_provoking_question: string;
  activity_type: string;
  activity_options: string;
};

type Callback = {
  id: string;
  display_name: string;
  response_text: string;
  prompt_type: string | null;
};

type Response = {
  id: string;
  display_name: string;
  response_text: string;
  show_name: boolean;
  is_public: boolean;
  created_at: string;
  hidden: boolean;
  moderation_status: string | null;
  prompt_type?: string | null;
};

// Mindcast-tone presets — moderators can pick one or write their own.
const DENIAL_PRESETS = [
  "Held — not for tonight's room. Thank you for trusting us with it.",
  "Some words live better between you and the page. We'll keep this one private.",
  "We're keeping the space gentle tonight. Feel free to share another reflection.",
];

const genCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");

// The live slide content lives in mindcast_live_sessions, but the 52-week CSV
// lesson fields (YouTube URL, reflective question, interactive activity, and the
// deity-free inner-wisdom alignment) live in curriculum_weeks. Merge the
// curriculum row in as a fallback so the CSV lessons drive the live session and
// any week that exists only in curriculum_weeks still renders.
const pick = (a: string | null | undefined, b: string | null | undefined): string => (a && String(a).trim() ? String(a) : (b ? String(b) : "")) || "";
const buildSession = (live: Tables<"mindcast_live_sessions"> | null, cur: Tables<"curriculum_weeks"> | null, wk: number, aud: string, lastWeekTheme = ""): Session | null => {
  if (!live && !cur) return null;
  return {
    id: live?.id || `curriculum-${wk}-${aud}`,
    week_number: wk,
    phase: live?.phase ?? cur?.block_number ?? 0,
    phase_name: pick(live?.phase_name, cur?.block_theme),
    theme_title: pick(live?.theme_title, cur?.weekly_theme),
    audience: aud,
    core_concept: pick(live?.core_concept, cur?.core_learning),
    signal_metaphor: pick(live?.signal_metaphor, cur?.signal_metaphor),
    ancient_wisdom_reframe: pick(live?.ancient_wisdom_reframe, cur?.inner_wisdom_alignment),
    session_title: pick(live?.session_title, cur?.weekly_theme),
    opening_hook: live?.opening_hook || "",
    opening_question: cur?.opening_question || "",
    teaching_points: live?.teaching_points || "",
    experiential_exercise: pick(live?.experiential_exercise, cur?.interactive_activity),
    guided_reflection: pick(live?.guided_reflection, cur?.reflective_question),
    journaling_prompt: pick(live?.journaling_prompt, cur?.reflective_question),
    weekly_practice_mon: live?.weekly_practice_mon || "",
    weekly_practice_wed: live?.weekly_practice_wed || "",
    weekly_practice_sun: live?.weekly_practice_sun || "",
    core_affirmation: live?.core_affirmation || "",
    closing_quote: (live as unknown as { closing_quote?: string } | null)?.closing_quote || "",
    closing_quote_attribution: (live as unknown as { closing_quote_attribution?: string } | null)?.closing_quote_attribution || "",
    private_write_prompt: (live as unknown as { private_write_prompt?: string } | null)?.private_write_prompt || "",
    intention_prompt: live?.intention_prompt || "",
    todays_theme: (live as unknown as { todays_theme?: string } | null)?.todays_theme || "",
    ancient_wisdom_video_url: (live as unknown as { ancient_wisdom_video_url?: string } | null)?.ancient_wisdom_video_url || "",
    ancient_wisdom_captions_url: (live as unknown as { ancient_wisdom_captions_url?: string } | null)?.ancient_wisdom_captions_url || "",
    ancient_wisdom_approval: (live as unknown as { ancient_wisdom_approval?: string } | null)?.ancient_wisdom_approval || "unapproved",
    todays_world_video_url: (live as unknown as { todays_world_video_url?: string } | null)?.todays_world_video_url || "",
    todays_world_captions_url: (live as unknown as { todays_world_captions_url?: string } | null)?.todays_world_captions_url || "",
    todays_world_approval: (live as unknown as { todays_world_approval?: string } | null)?.todays_world_approval || "unapproved",
    video_local_url: (live as unknown as { video_local_url?: string } | null)?.video_local_url || "",
    video_link: pick(live?.video_link, cur?.youtube_url),
    video_description: pick(live?.video_description, cur?.youtube_title),
    video_backup_description: live?.video_backup_description || "",
    video_transcript: live?.video_transcript || "",
    video_question_1: live?.video_question_1 || "",
    video_question_2: live?.video_question_2 || "",
    facilitator_notes: [live?.facilitator_notes, cur?.inner_wisdom_alignment ? `Inner-wisdom alignment: ${cur.inner_wisdom_alignment}` : ""].filter(Boolean).join("\n\n"),
    previous_week_callback: live?.previous_week_callback || "",
    video_position: cur?.video_position || "early",
    // Added by migration 20260820120000. src/integrations/supabase/types.ts is
    // generated from the deployed schema, so it will not know this column until
    // `supabase db push` + a types regen — narrow cast until then.
    thought_provoking_question:
      (live as { thought_provoking_question?: string } | null)?.thought_provoking_question ||
      (cur as { thought_provoking_question?: string } | null)?.thought_provoking_question || "",
    activity_type: (cur?.activity_type || "reflection"),
    activity_options: (cur?.activity_options || ""),
    coloring_page_url: live?.coloring_page_url || null,
    coloring_pdf_url: live?.coloring_pdf_url || null,
    // Added by migration 20260820180000 — narrow cast until types regen.
    coloring_approval:
      (live as { coloring_approval?: string } | null)?.coloring_approval || "unapproved",
    kids_picture_book: cur?.kids_picture_book || "",
    kids_picture_book_author: cur?.kids_picture_book_author || "",
    kids_picture_book_question: cur?.kids_picture_book_question || "",
    kids_colouring_prompt: cur?.kids_colouring_prompt || "",
    kids_game: cur?.kids_game || "",
    kids_game_equipment: cur?.kids_game_equipment || "",
    kids_game_under5: cur?.kids_game_under5 || "",
    kids_source: cur?.kids_source || "",
    kids_read_aloud_source_check: cur?.kids_read_aloud_source_check || "",
    kids_signal_metaphor: cur?.kids_signal_metaphor || "",
    last_week_theme: lastWeekTheme,
  };
};

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
  const { user, role, isStaff } = useAuth();

  const [audience, setAudience] = useState<"Adult" | "Teen" | "Child">(
    (search.get("a") as "Adult" | "Teen" | "Child" | null) || "Adult"
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
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  // Gate G — facilitator-only elapsed-vs-expected per slide (never projected).
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(0);
    const start = Date.now();
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [slide]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Data-driven deck (v3): load the active, track-applicable slides in order.
  // Falls back to the hard-coded deck when lesson_slides has no rows yet.
  const [slideDefs, setSlideDefs] = useState<{ slide_key: string; title: string; default_duration_seconds: number }[]>([]);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await db
        .from("lesson_slides" as never)
        .select("slide_key, title, default_duration_seconds")
        .eq("is_active", true)
        .contains("applies_to_tracks", [audience])
        .order("position");
      if (!active) return;
      setSlideDefs((data ?? []) as unknown as { slide_key: string; title: string; default_duration_seconds: number }[]);
    })();
    return () => { active = false; };
  }, [audience]);

  // The ordered deck; `slide` indexes it.
  const deck = useMemo<SlideKind[]>(() => {
    const dataDriven = slideDefs
      .map((d) => SLIDE_KEY_TO_KIND[d.slide_key])
      .filter((k): k is SlideKind => k != null);
    return dataDriven.length ? dataDriven : buildDeck(session?.audience);
  }, [slideDefs, session?.audience]);
  const lastSlide = deck.length - 1;
  const currentKind: SlideKind = deck[Math.min(slide, lastSlide)] ?? "title";

  // Persist code in URL
  useEffect(() => {
    if (!search.get("code")) {
      const next = new URLSearchParams(search);
      next.set("code", code);
      setSearch(next, { replace: true });
    }
  }, [code, search, setSearch]);

  // Load session — merge the live slide content with the 52-week CSV lesson row.
  useEffect(() => {
    (async () => {
      const [{ data: live }, { data: cur }, { data: prevCur }] = await Promise.all([
        db.from("mindcast_live_sessions").select("*")
          .eq("week_number", week).eq("audience", audience).maybeSingle(),
        db.from("curriculum_weeks").select("*")
          .eq("week_number", week).maybeSingle(),
        // Child Slide 2 is a recap of last week's theme — pull it for 5-11s.
        audience === "Child" && week > 1
          ? db.from("curriculum_weeks").select("weekly_theme").eq("week_number", week - 1).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setSession(buildSession(live, cur, week, audience, (prevCur as { weekly_theme?: string } | null)?.weekly_theme || ""));
      setRevealCount(1);
    })();
  }, [week, audience]);

  // Gate F — preload the approved metaphor clips + the local video when the
  // deck opens so there is no spinner mid-session.
  useEffect(() => {
    if (!session) return;
    const urls = [session.ancient_wisdom_video_url, session.todays_world_video_url, session.video_local_url]
      .filter((u) => u && u.startsWith("http"));
    for (const u of urls) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = u;
      document.head.appendChild(link);
    }
  }, [session, session?.id, session?.ancient_wisdom_video_url, session?.todays_world_video_url, session?.video_local_url]);

  // Load up to 20 moderator-approved reflections from last week for the
  // "Voices from Last Week" slide. Selected by the Sun 9am cron and stored
  // in featured_callbacks (next_week_number = this week).
  useEffect(() => {
    (async () => {
      const { data } = await db
        .from("featured_callbacks")
        .select("id, display_name, response_text, prompt_type")
        .eq("next_week_number", week)
        .eq("audience_type", audience)
        .order("selected_at", { ascending: true })
        .limit(20);
      setCallbacks(data || []);
    })();
  }, [week, audience]);

  // Load unlocked state — count rows for this week across members. The
  // facilitator considers a lesson "unlocked" when at least one member has it.
  // Staff bypass — admin/facilitator always has full access.
  useEffect(() => {
    if (isStaff) {
      setUnlocked(true);
      return;
    }
    (async () => {
      const { count } = await db
        .from("unlocked_lessons")
        .select("user_id", { count: "exact", head: true })
        .eq("week_number", week);
      setUnlocked((count ?? 0) > 0);
    })();
  }, [week, isStaff]);

  // Load + subscribe responses (public only — private submissions stay hidden
  // from the live feed even though RLS lets facilitators read them).
  // Pending rows feed the moderation queue; approved rows feed the live wall.
  useEffect(() => {
    (async () => {
      const { data } = await db
        .from("session_responses")
        .select("id, display_name, response_text, show_name, is_public, created_at, hidden, moderation_status, prompt_type")
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
        (p) => { const row = p.new as Response; if (row?.is_public) setResponses(prev => [row, ...prev]); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "session_responses", filter: `session_code=eq.${code}` },
        (p) => setResponses(prev => {
          const row = p.new as Response;
          // If a row was just made private, hidden, or denied, drop it.
          if (!row?.is_public || row?.hidden || row?.moderation_status === "denied") {
            return prev.filter(r => r.id !== row.id);
          }
          const existing = prev.find(r => r.id === row.id);
          return existing
            ? prev.map(r => r.id === row.id ? row : r)
            : [row, ...prev];
        }))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "session_responses", filter: `session_code=eq.${code}` },
        (p) => setResponses(prev => prev.filter(r => r.id !== p.old?.id)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [code]);

  // Broadcast current prompt to audience
  useEffect(() => {
    if (!session) return;
    // No member digital input in the children's room — there are no devices,
    // so there is nothing to broadcast and no live state to mirror.
    if (audience === "Child") return;
    const promptType =
      currentKind === "reflect" ? "journaling"
      : currentKind === "practice" ? "intention"
      : currentKind === "intention" ? "intention_review"
      : currentKind === "deeper" ? "activity"
      : "idle";
    const promptText =
      currentKind === "reflect" ? session.journaling_prompt
      : currentKind === "practice" ? (session.intention_prompt || "What is the one specific thing you will do this week?")
      : currentKind === "deeper" ? (session.experiential_exercise || "")
      : "";
    const activityOptions = (session.activity_options || "")
      .split(/\r?\n/).map((o: string) => o.trim()).filter(Boolean);
    const payload = {
      week, audience, slide, promptType, promptText, title: session.theme_title,
      // The live widget config, so each member's phone shows the right input.
      activityType: currentKind === "deeper" ? (session.activity_type || "reflection") : null,
      activityOptions: currentKind === "deeper" ? activityOptions : [],
    };

    const ch = supabase.channel(`live:${code}`, { config: { broadcast: { self: false } } });
    const sendState = () => ch.send({ type: "broadcast", event: "state", payload });

    // Durable mirror: broadcast is low-latency but ephemeral, so a late joiner
    // or a reconnect can miss it. Persist the current state so LiveJoin can
    // resolve it on mount regardless of presenter timing.
    db.from("live_session_state").upsert({
      session_code: code,
      week_number: week,
      audience,
      current_slide: slide,
      prompt_type: promptType,
      prompt_text: promptText,
      title: session.theme_title,
      activity_type: currentKind === "deeper" ? (session.activity_type || "reflection") : null,
      activity_options: currentKind === "deeper" ? activityOptions : [],
      is_live: true,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "session_code" }).then(() => {});

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
  }, [slide, session, code, week, audience, currentKind, user]);

  // Keyboard navigation
  const goNext = useCallback(() => {
    setSlide(s => Math.min(s + 1, lastSlide));
  }, [lastSlide]);
  const goPrev = useCallback(() => setSlide(s => Math.max(s - 1, 0)), []);

  const toggleFs = useCallback(async () => {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (notesOpen) {
        if (e.key === "Escape") setNotesOpen(false);
        return;
      }
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "f") toggleFs();
    };
    window.addEventListener("keydown", onKey);
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("fullscreenchange", onFs); };
  }, [goNext, goPrev, toggleFs, notesOpen]);

  const isFacilitator = role === "facilitator" || role === "admin";

  const handleUnlock = async () => {
    if (!isFacilitator && !isStaff) { toast({ title: "Facilitators only" }); return; }
    if (unlocked) return;
    // Fan out: one unlock row per member profile so each user sees their own
    // unlock state. Upserts on (user_id, week_number).
    const { data: profiles, error: profilesError } = await db
      .from("profiles").select("user_id");
    if (profilesError) {
      toast({ title: "Could not load members", description: profilesError.message });
      return;
    }
    const rows = (profiles || [])
      .filter((p) => p.user_id)
      .map((p) => ({ user_id: p.user_id, week_number: week, facilitator_id: user?.id }));
    if (rows.length === 0) {
      toast({ title: "No members to unlock for" });
      return;
    }
    const { error } = await db.from("unlocked_lessons")
      .upsert(rows, { onConflict: "user_id,week_number", ignoreDuplicates: true });
    if (error) { toast({ title: "Could not unlock", description: error.message }); return; }
    setUnlocked(true);
    toast({ title: `Lesson unlocked for ${rows.length} member${rows.length === 1 ? "" : "s"}` });
  };

  const hideResponse = async (id: string) => {
    await db.from("session_responses").update({ hidden: true }).eq("id", id);
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
    const { error } = await db
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
    const { error } = await db
      .from("session_responses")
      .delete()
      .eq("id", id);
    if (error) { toast({ title: "Couldn't remove response", description: error.message }); return; }
    setResponses(prev => prev.filter(r => r.id !== id));
  };

  // Gate D — per-slide metaphor video (Ancient Wisdom / In Today's World).
  const [metaphorBusy, setMetaphorBusy] = useState(false);
  const handleGenerateMetaphor = async (slide: "ancient" | "todays_world") => {
    if (!isFacilitator && !isStaff) { toast({ title: "Facilitators only" }); return; }
    setMetaphorBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-metaphor-video", {
        body: { week_number: week, audience, slide },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: { body?: unknown } }).context;
          if (ctx?.body) {
            const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body as ReadableStream).text();
            const parsed = JSON.parse(text);
            if (parsed?.error) detail = parsed.error;
          }
        } catch { /* keep generic */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setSession((s) => s ? {
        ...s,
        ...(slide === "ancient"
          ? { ancient_wisdom_video_url: data.video_url, ancient_wisdom_captions_url: data.captions_url, ancient_wisdom_approval: "unapproved" }
          : { todays_world_video_url: data.video_url, todays_world_captions_url: data.captions_url, todays_world_approval: "unapproved" }),
      } : s);
      toast({ title: data.cached ? "Metaphor already current" : "Metaphor generated", description: data.cached ? undefined : "Review it, then Approve to go live." });
    } catch (e: unknown) {
      toast({ title: "Metaphor generation failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setMetaphorBusy(false);
    }
  };
  const handleApproveMetaphor = async (slide: "ancient" | "todays_world") => {
    const col = slide === "ancient" ? "ancient_wisdom_approval" : "todays_world_approval";
    const updater = db.from("mindcast_live_sessions") as unknown as {
      update: (p: Record<string, unknown>) => {
        eq: (c: string, v: unknown) => { eq: (c2: string, v2: unknown) => Promise<{ error: { message: string } | null }> }
      }
    };
    const { error } = await updater.update({ [col]: "approved" }).eq("week_number", week).eq("audience", audience);
    if (error) { toast({ title: "Could not approve", description: error.message, variant: "destructive" }); return; }
    setSession((s) => s ? { ...s, ...(slide === "ancient" ? { ancient_wisdom_approval: "approved" } : { todays_world_approval: "approved" }) } : s);
    toast({ title: "Metaphor approved" });
  };

  // Colouring approval gate — an unreviewed AI image must not reach children.
  // Generation lands 'unapproved'; approve before the page can display/print.
  const handleApproveColoring = async () => {
    const { error } = await db.from("mindcast_live_sessions")
      .update({ coloring_approval: "approved" } as never)
      .eq("week_number", week).eq("audience", "Child");
    if (error) { toast({ title: "Could not approve", description: error.message, variant: "destructive" }); return; }
    setSession((s) => s ? { ...s, coloring_approval: "approved" } : s);
    toast({ title: "Colouring page approved", description: "It can now be displayed and printed." });
  };

  // Gate E — closing the session invalidates the join code (members see
  // "session ended" the moment is_live flips false).
  const handleCloseSession = async () => {
    if (!window.confirm("Close this live session? The join code will stop working for everyone in the room.")) return;
    const { error } = await db.from("live_session_state").update({ is_live: false, closed_at: new Date().toISOString() }).eq("session_code", code);
    if (error) { toast({ title: "Could not close session", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Session closed", description: "The join code is now invalid." });
  };

  if (!session) {
    return <div className="min-h-screen bg-[hsl(var(--chrome))] flex items-center justify-center text-[hsl(var(--chrome-ink))]/60 font-body text-sm" role="status">Loading Week {week} ({audience})…</div>;
  }

  const liveBoard = responses.filter(r => !r.hidden && r.moderation_status === "approved");
  const pendingQueue = responses.filter(r => !r.hidden && (r.moderation_status === "pending" || r.moderation_status === null));
  // No member digital input in the children's room, so there is no moderated
  // response panel to show on the reflect slide either.
  const onReflection = currentKind === "reflect" && audience !== "Child";
  const joinUrl = `${window.location.origin}/live/${code}`;

  return (
    <div ref={containerRef} className="deck-canvas min-h-screen flex flex-col relative overflow-hidden">
      {/* Top bar */}
      <div className="deck-chrome flex items-center justify-between gap-5 overflow-x-auto scrollbar-none px-4 sm:px-6 py-3 border-b border-[hsl(var(--chrome-ink))]/10 z-30">
        <div className="flex shrink-0 items-center gap-4">
          <button type="button" onClick={() => navigate("/mindcast-live/library")} className="min-h-9 rounded-lg px-2 text-[hsl(var(--chrome-ink))]/40 hover:text-[hsl(var(--chrome-ink))]/80 text-xs font-body tracking-widest focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30">← LIBRARY</button>
          <span className="text-[hsl(var(--bronze))] font-display text-2xl tracking-wider">WEEK {week}</span>
          <span className="text-[hsl(var(--chrome-ink))]/50 text-xs font-body tracking-widest uppercase">{session.phase_name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Facilitation track">
          {(["Adult", "Teen", "Child"] as const).map(a => (
            <button type="button" key={a} onClick={() => setAudience(a)} role="radio" aria-checked={audience === a}
              className={`px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm transition-colors ${audience === a ? "bg-[hsl(var(--blue))] text-white" : "bg-[hsl(var(--chrome-ink))]/5 text-[hsl(var(--chrome-ink))]/60 hover:bg-[hsl(var(--chrome-ink))]/10"}`}>{a}</button>
          ))}
          </div>
          <div className="w-px h-5 bg-[hsl(var(--chrome-ink))]/20 mx-2" />
          <button type="button" onClick={handleUnlock} disabled={unlocked}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm transition-colors ${unlocked ? "bg-[hsl(var(--bronze))]/20 text-[hsl(var(--bronze))]" : "bg-[hsl(var(--chrome-ink))]/5 text-[hsl(var(--chrome-ink))]/70 hover:bg-[hsl(var(--chrome-ink))]/10"}`}>
            {unlocked ? <Unlock size={12} /> : <Lock size={12} />}{unlocked ? "Unlocked" : "Unlock"}
          </button>
          <button type="button" onClick={() => session && downloadWorksheetPdf(session)} title="Download worksheet PDF" aria-label="Download worksheet PDF" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30"><Download size={14} /></button>
          {isFacilitator && (currentKind === "wisdom" || currentKind === "metaphor" || currentKind === "wisdomworld") && (() => {
            // The merged slide carries BOTH columns, so offer controls for each.
            const slideKeys: ("ancient" | "todays_world")[] =
              currentKind === "wisdomworld"
                ? ["ancient", "todays_world"]
                : [currentKind === "wisdom" ? "ancient" : "todays_world"];
            return slideKeys.map((slideKey) => {
              const hasVideo = slideKey === "ancient" ? session.ancient_wisdom_video_url : session.todays_world_video_url;
              const approval = slideKey === "ancient" ? session.ancient_wisdom_approval : session.todays_world_approval;
              return (
                <span key={slideKey} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateMetaphor(slideKey)}
                    disabled={metaphorBusy}
                    title="Generate 10s metaphor video (Gemini)"
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm bg-[hsl(var(--chrome-ink))]/5 text-[hsl(var(--chrome-ink))]/70 hover:bg-[hsl(var(--chrome-ink))]/10 disabled:opacity-40"
                  >
                    <Film size={12} />{metaphorBusy ? "Generating…" : `Generate ${slideKey === "ancient" ? "wisdom" : "today"}`}
                  </button>
                  {hasVideo && approval === "unapproved" && (
                    <button
                      type="button"
                      onClick={() => handleApproveMetaphor(slideKey)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm bg-[hsl(var(--blue))] text-white hover:bg-[hsl(var(--blue-light))] hover:text-[hsl(var(--chrome))]"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}
                </span>
              );
            });
          })()}
          <button type="button" onClick={() => setNotesOpen(true)} aria-label="Open facilitator notes" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30"><StickyNote size={14} /></button>
          {isFacilitator && (
            <button type="button" onClick={handleCloseSession} title="Close the session — invalidates the join code"
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-body tracking-widest uppercase rounded-sm bg-[hsl(var(--chrome-ink))]/5 text-[hsl(var(--chrome-ink))]/70 hover:bg-[hsl(var(--chrome-ink))]/10">
              <Lock size={12} /> Close session
            </button>
          )}
          <button type="button" onClick={toggleFs} aria-label={isFs ? "Exit full screen" : "Enter full screen"} className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30">{isFs ? <Minimize size={14} /> : <Maximize size={14} />}</button>
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
              <SlideRenderer kind={currentKind} session={session} responses={responses} joinUrl={joinUrl} code={code} onSessionUpdate={setSession} isFacilitator={isFacilitator} onApproveColoring={handleApproveColoring} />
            </motion.div>
          </AnimatePresence>

          {/* Brand footer — projected once at the deck level, so it stays on
              every slide (and future slide kinds) without per-slide markup. */}
          <div className="absolute bottom-5 inset-x-0 z-20 pointer-events-none flex justify-center">
            <p className="font-body text-[10px] tracking-[0.5em] text-[hsl(var(--navy))]/25 uppercase">
              NOTICE IT. NAME IT. DO IT.
            </p>
          </div>
        </div>

        {/* Live response panel on reflection slides */}
        {onReflection && showResponses && (
          <div className="deck-chrome hidden lg:flex w-1/3 border-l border-[hsl(var(--chrome-ink))]/10 flex-col">
            <div className="p-4 border-b border-[hsl(var(--chrome-ink))]/10 flex items-center justify-between">
              <div>
                <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.3em] font-body uppercase">Moderation</p>
                <p className="text-[hsl(var(--chrome-ink))]/70 text-xs font-body mt-0.5">
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
                  <div className="text-center py-6 text-[hsl(var(--chrome-ink))]/20 text-[10px] font-body tracking-widest uppercase">No pending responses</div>
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
                        className="group bg-[hsl(var(--chrome-ink))]/[0.04] border border-[hsl(var(--chrome-ink))]/10 rounded-sm p-3 relative">
                        <p className="text-[hsl(var(--chrome-ink))] text-sm font-body leading-relaxed">{r.response_text}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[hsl(var(--chrome-ink))]/30 text-[10px] font-body tracking-widest uppercase">
                            {r.show_name ? r.display_name : "Anonymous"}
                          </span>
                          <button onClick={() => hideResponse(r.id)} title="Hide from screen" className="opacity-0 group-hover:opacity-100 text-[hsl(var(--chrome-ink))]/30 hover:text-red-400">
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

      {/* Calm, clickable progress navigation. It gives the room a sense of
          movement without adding another animated object to the slide. */}
      <nav aria-label="Lesson progress" className="deck-chrome px-6 pt-3 z-30 border-t border-[hsl(var(--chrome-ink))]/10">
        <ol className="flex items-center gap-1.5">
          {deck.map((kind, index) => {
            const complete = index < slide;
            const active = index === slide;
            return (
              <li key={`${kind}-${index}`} className="flex-1">
                <button
                  type="button"
                  onClick={() => setSlide(index)}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Go to slide ${index + 1}: ${SLIDE_TITLE[kind]}`}
                  title={`${index + 1}. ${SLIDE_TITLE[kind]}`}
                  className={`block h-2 w-full rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--blue-light))]/60 focus:ring-offset-2 focus:ring-offset-[hsl(var(--chrome))] ${
                    active
                      ? "bg-[hsl(var(--bronze))]"
                      : complete
                      ? "bg-[hsl(var(--blue))]"
                      : "bg-[hsl(var(--chrome-ink))]/15 hover:bg-[hsl(var(--chrome-ink))]/25"
                  }`}
                >
                  <span className="sr-only">{SLIDE_TITLE[kind]}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Bottom controls */}
      <div className="deck-chrome flex items-center justify-between px-6 py-3 z-30">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goPrev} disabled={slide === 0} aria-label="Previous slide" className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 disabled:opacity-20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30"><ChevronLeft size={18} /></button>
          <button type="button" onClick={goNext} disabled={slide === lastSlide} aria-label="Next slide" className="flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 disabled:opacity-20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30"><ChevronRight size={18} /></button>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[hsl(var(--chrome-ink))]/50 text-[10px] font-body tracking-widest uppercase">{SLIDE_TITLE[currentKind]}</span>
          <span className="text-[hsl(var(--bronze))] font-display text-lg tracking-wider">{slide + 1} / {deck.length}</span>
          {(() => {
            const expected = slideDefs.find((d) => SLIDE_KEY_TO_KIND[d.slide_key] === currentKind)?.default_duration_seconds ?? 0;
            if (!expected) return null;
            const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
            const over = elapsed > expected;
            return (
              <span className={`text-[10px] font-mono ${over ? "text-amber-400" : "text-[hsl(var(--chrome-ink))]/40"}`} title="Elapsed vs expected — facilitator only, never projected">
                {mm(elapsed)} / {mm(expected)}{over ? " · over" : ""}
              </span>
            );
          })()}
        </div>
        <div className="flex items-center gap-2">
          {onReflection && (
            <button type="button" onClick={() => setShowResponses(s => !s)} aria-pressed={showResponses} className="flex min-h-10 items-center gap-1.5 px-3 py-1.5 text-xs font-body tracking-widest uppercase rounded-lg bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30">
              {showResponses ? <Eye size={12} /> : <EyeOff size={12} />}{showResponses ? "Showing" : "Hidden"}
            </button>
          )}
          {/* No join code in the children's room — attendance is the roll call. */}
          {audience !== "Child" && (
            <>
              <span className="text-[hsl(var(--chrome-ink))]/40 text-[10px] font-body tracking-widest uppercase">Code</span>
              <span className="font-display text-[hsl(var(--bronze))] text-xl tracking-[0.3em]">{code}</span>
            </>
          )}
        </div>
      </div>

      {/* Notes drawer */}
      <AnimatePresence>
        {notesOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3 }}
            className="absolute top-0 right-0 h-full w-full max-w-96 bg-[hsl(var(--chrome))] border-l border-[hsl(var(--chrome-ink))]/15 z-40 p-6 overflow-y-auto"
            role="dialog" aria-modal="true" aria-labelledby="facilitator-notes-title">
            <div className="flex items-center justify-between mb-4">
              <h3 id="facilitator-notes-title" className="font-display text-xl tracking-wider text-[hsl(var(--bronze))]">FACILITATOR NOTES</h3>
              <button type="button" onClick={() => setNotesOpen(false)} aria-label="Close facilitator notes" className="flex h-10 w-10 items-center justify-center rounded-lg text-[hsl(var(--chrome-ink))]/40 hover:bg-[hsl(var(--chrome-ink))]/5 hover:text-[hsl(var(--chrome-ink))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chrome-ink))]/30"><X size={18} /></button>
            </div>
            <p className="text-[hsl(var(--chrome-ink))]/80 text-sm font-body leading-relaxed whitespace-pre-wrap">{session.facilitator_notes || "No notes for this session."}</p>
            {/* Child — a pre-session quick reference. The same content becomes
                the final projected slide while the facilitator runs the game. */}
            {audience === "Child" && (session.kids_game || session.kids_game_equipment || session.kids_game_under5) && (
              <div className="mt-6 pt-6 border-t border-[hsl(var(--chrome-ink))]/10">
                <p className="text-[hsl(var(--bronze))] text-[10px] tracking-widest uppercase mb-2 font-body">Group game — closing</p>
                {session.kids_game && <p className="text-[hsl(var(--chrome-ink))]/80 text-sm font-body leading-relaxed whitespace-pre-wrap mb-3">{session.kids_game}</p>}
                {session.kids_game_equipment && (
                  <p className="text-[hsl(var(--chrome-ink))]/60 text-xs font-body mb-2"><span className="text-[hsl(var(--chrome-ink))]/40 uppercase tracking-widest text-[10px]">Equipment · </span>{session.kids_game_equipment}</p>
                )}
                {session.kids_game_under5 && (
                  <p className="text-[hsl(var(--chrome-ink))]/60 text-xs font-body"><span className="text-[hsl(var(--chrome-ink))]/40 uppercase tracking-widest text-[10px]">Under-5s · </span>{session.kids_game_under5}</p>
                )}
              </div>
            )}
            {/* No member devices in the children's room — no join QR. */}
            {audience !== "Child" && (
              <div className="mt-6 pt-6 border-t border-[hsl(var(--chrome-ink))]/10">
                <p className="text-[hsl(var(--chrome-ink))]/40 text-[10px] tracking-widest uppercase mb-2 font-body">Join QR</p>
                <div className="bg-white p-3 rounded inline-block"><QRCode value={joinUrl} size={150} level="M" /></div>
                <p className="text-[hsl(var(--chrome-ink))]/60 text-xs mt-2 font-body">{joinUrl}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Slide renderer ---------------- */

// 90-second private write gate: projected, one-tap start, unskippable. When the
// timer completes it quietly reveals the exercise beneath it.
const PrivateWriteGate = ({ prompt, children }: { prompt: string; children: ReactNode }) => {
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <>{children}</>;
  const fallback = "Take 90 seconds — write what you actually think, before anyone else speaks.";
  return (
    <div className="text-center max-w-4xl w-full">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">90-second private write</p>
      {!started ? (
        <button onClick={() => setStarted(true)}
          className="px-8 py-4 bg-[hsl(var(--blue))] text-white font-display tracking-[0.2em] text-xl rounded-sm hover:bg-[hsl(var(--blue-light))] hover:text-[hsl(var(--navy))] transition-colors">
          START THE 90-SECOND WRITE
        </button>
      ) : (
        <>
          <SlideTimer seconds={90} running={started} projected onComplete={() => setDone(true)} />
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))]/95 italic mt-8 max-w-3xl mx-auto leading-snug">
            {prompt || fallback}
          </p>
        </>
      )}
    </div>
  );
};

const SlideRenderer = ({ kind, session, responses = [], joinUrl, code, onSessionUpdate, isFacilitator, onApproveColoring }: { kind: SlideKind; session: Session; responses?: Response[]; joinUrl: string; code: string; onSessionUpdate: (s: Session) => void; isFacilitator: boolean; onApproveColoring: () => void | Promise<void> }) => {
  const isChild = session.audience === "Child";
  switch (kind) {
    case "title": return isChild ? (
      <RollCallSlide
        weekNumber={session.week_number}
        themeTitle={session.theme_title}
        sessionTitle={session.session_title}
        phaseName={session.phase_name}
      />
    ) : (
      <WelcomeWall
        weekNumber={session.week_number}
        themeTitle={session.theme_title}
        sessionTitle={session.session_title}
        phaseName={session.phase_name}
        joinCode={session.audience === "Adult" ? code : undefined}
        joinUrl={session.audience === "Adult" ? joinUrl : undefined}
      />
    );
    case "intention": return isChild ? (
      <LastWeekWeLearntSlide weekNumber={session.week_number} lastWeekTheme={session.last_week_theme} />
    ) : (
      <ReturnToIntentionSlide
        previousWeekCallback={session.previous_week_callback}
        weekNumber={session.week_number}
        sessionTitle={session.session_title}
        themeTitle={session.theme_title}
      />
    );
    // Slide 3 — Inner Wisdom AND In Today's World together. The principle and
    // its modern form are one idea; splitting them made the metaphor read as a
    // separate teaching rather than the same teaching made concrete.
    case "wisdomworld": return (
      <WisdomWorldSlide
        wisdom={session.ancient_wisdom_reframe}
        world={isChild && session.kids_signal_metaphor ? session.kids_signal_metaphor : session.signal_metaphor}
        wisdomVideoUrl={session.ancient_wisdom_approval === "approved" ? session.ancient_wisdom_video_url : ""}
        worldVideoUrl={session.todays_world_approval === "approved" ? session.todays_world_video_url : ""}
      />
    );
    // Slide 5 — Go Deeper AND the Together activity. The thought-provoking
    // question is the SUBHEADING of the activity, not a prompt members answer,
    // so it sits between the teaching and the exercise.
    case "deeper": {
      const deeperResponses = responses.filter(
        r => r.prompt_type === "activity" && !r.hidden && r.moderation_status === "approved",
      );
      return (
        <DeeperSlide
          coreConcept={session.core_concept}
          question={session.thought_provoking_question}
          exercise={session.experiential_exercise}
          activityType={(session.activity_type || "reflection").toLowerCase()}
          options={(session.activity_options || "").split(/\r?\n/).map(o => o.trim()).filter(Boolean)}
          responses={deeperResponses}
          week={session.week_number}
          audience={session.audience}
          sessionCode={code}
        />
      );
    }
    case "reflect": return isChild ? (
      <TalkAboutPictureSlide />
    ) : (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">Reflect & Share</p>
        <motion.p initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-10">"{session.journaling_prompt}"</motion.p>
        <div className="inline-flex items-center gap-4 bg-[hsl(var(--navy))]/5 px-6 py-3 rounded-sm">
          <QrCode size={16} className="text-[hsl(var(--primary))]" />
          <span className="text-[hsl(var(--navy))]/70 font-body text-sm">Join at <span className="text-[hsl(var(--primary))] font-bold">{joinUrl.replace(/^https?:\/\//, "")}</span> · code <span className="text-[hsl(var(--primary))] font-bold tracking-[0.2em]">{code}</span></span>
        </div>
      </div>
    );
    case "activity": {
      // Only approved, visible submissions from this slide feed the screen.
      const activityResponses = responses.filter(
        r => r.prompt_type === "activity" && !r.hidden && r.moderation_status === "approved",
      );
      const type = (session.activity_type || "reflection").toLowerCase();
      const options = (session.activity_options || "")
        .split(/\r?\n/).map(o => o.trim()).filter(Boolean);

      let inner: ReactNode;
      if (type === "wordcloud") {
        inner = <WordCloudSlide text={session.experiential_exercise} responses={activityResponses} />;
      } else if ((type === "poll" || type === "choice") && options.length > 0) {
        inner = <PollSlide text={session.experiential_exercise} options={options} responses={activityResponses} />;
      } else if (type === "scale") {
        inner = (
          <ScaleSlide
            text={session.experiential_exercise}
            statement={options[0] || "How true does this feel for you right now?"}
            minLabel={options[1] || "Not at all"}
            maxLabel={options[2] || "Completely"}
            responses={activityResponses}
          />
        );
      } else if (type === "phrase") {
        inner = <PhraseWallSlide text={session.experiential_exercise} responses={activityResponses} />;
      } else {
        inner = <ExerciseSlide text={session.experiential_exercise} week={session.week_number} audience={session.audience} sessionCode={code} />;
      }
      // The whole-room exercise opens with a 90-second, projected, unskippable
      // private write so the quiet half of the room writes their own answer.
      return <PrivateWriteGate prompt={session.private_write_prompt}>{inner}</PrivateWriteGate>;
    }
    case "guided": return (
      <div className="max-w-4xl">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Guided Reflection</p>
        <div className="border-l-2 border-[hsl(var(--blue))] pl-8 py-4">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))]/95 leading-relaxed italic">{session.guided_reflection}</p>
        </div>
      </div>
    );
    case "practice": {
      // Child — one plain thing, no if-then (too abstract below about ten).
      if (isChild) {
        const childDays = [
          { day: "Mon", text: session.weekly_practice_mon },
          { day: "Wed", text: session.weekly_practice_wed },
          { day: "Sun", text: session.weekly_practice_sun },
        ].filter(d => (d.text || "").trim().length > 0);
        return (
          <div className="max-w-5xl w-full text-center">
            <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">One Thing This Week</p>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-6">
              One thing I want to work on this week is…
            </motion.p>
            <p className="text-[hsl(var(--navy))]/60 font-body text-lg mb-10">
              Write it or draw it on your worksheet. You can say it out loud if you want to — you don't have to.
            </p>
            {childDays.length > 0 && (
              <div className="grid md:grid-cols-3 gap-5 text-left">
                {childDays.map(({ day, text }) => (
                  <div key={day} className="border border-[hsl(var(--navy))]/15 rounded-sm p-6 bg-[hsl(var(--navy))]/[0.03]">
                    <p className="font-display text-[hsl(var(--blue))] text-3xl tracking-wider mb-4">{day.toUpperCase()}</p>
                    <p className="text-[hsl(var(--navy))]/90 font-body text-base leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      // Only show days that actually have a practice — many weeks have none,
      // and three empty boxes read as a broken slide.
      // One declaration of the cadence, in @/lib/practiceCadence — labels and
      // columns drifting apart is what caused two ordering bugs already.
      const days = practiceEntries(session).map(e => ({ day: e.label, text: e.text }));
      return (
        <div className="max-w-6xl w-full">
          <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8 text-center">This Week's Practice</p>
          {days.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5">
              {days.map(({ day, text }) => (
                <div key={day} className="border border-[hsl(var(--navy))]/15 rounded-sm p-6 bg-[hsl(var(--navy))]/[0.03]">
                  <p className="font-display text-[hsl(var(--blue))] text-3xl tracking-wider mb-4">{day.toUpperCase()}</p>
                  <p className="text-[hsl(var(--navy))]/90 font-body text-base leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          ) : (
            // Fallback: carry the week's metaphor "Today: ..." action into the room.
            <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))]/95 leading-relaxed text-center max-w-3xl mx-auto">
              {session.signal_metaphor || "Carry this week's practice into your everyday life."}
            </p>
          )}
        </div>
      );
    }
    // Closing slide — the member writes the one thing they'll do this week.
    // This is the half of the loop the opening "Return to Your Intention" slide
    // depends on: what's written here comes back next Sunday.
    case "commitment": return (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">Before You Leave</p>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-6">
          Write down one specific thing you will do this week.
        </motion.p>
        <p className="text-[hsl(var(--navy))]/60 font-body text-lg mb-10">
          It goes in your workbook — and it comes back with you next Sunday.
        </p>
        <div className="inline-flex items-center gap-4 bg-[hsl(var(--navy))]/5 px-6 py-3 rounded-sm">
          <QrCode size={16} className="text-[hsl(var(--primary))]" />
          <span className="text-[hsl(var(--navy))]/70 font-body text-sm">
            Add it in the app · code <span className="text-[hsl(var(--primary))] font-bold tracking-[0.3em]">{code}</span>
          </span>
        </div>
        <p className="text-[hsl(var(--navy))]/30 text-[11px] font-body tracking-widest uppercase mt-6">Private to you — it is not shown on screen</p>
      </div>
    );
    // Closing affirmation — a quote from the author or speaker in the video.
    case "affirmation": return (
      <div className="text-center max-w-4xl">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">Closing Affirmation</p>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-6">
          "{session.closing_quote || session.core_affirmation}"
        </motion.p>
        {session.closing_quote_attribution && (
          <p className="text-[hsl(var(--navy))]/60 font-body text-lg">{session.closing_quote_attribution}</p>
        )}
      </div>
    );
    case "closing_game": return (
      <ClosingGameSlide
        game={session.kids_game}
        equipment={session.kids_game_equipment}
        under5={session.kids_game_under5}
      />
    );
    // Video — supporting evidence / how-to / personal story (position flexes).
    // Presentation-only: URL / transcript / question generation live in the
    // lesson editor, never on the facilitation screen.
    case "video": return isChild ? (
      <PictureBookSlide
        book={session.kids_picture_book}
        author={session.kids_picture_book_author}
        question={session.kids_picture_book_question}
        readAloudUrl={session.kids_source}
        sourceCheck={session.kids_read_aloud_source_check}
      />
    ) : (
      <VideoSlide
        link={session.video_link}
        description={session.video_description}
        backup={session.video_backup_description}
        question1={session.video_question_1}
        question2={session.video_question_2}
        localUrl={session.video_local_url}
      />
    );
    case "coloring": return (
      <ColoringActivitySlide
        coloringPageUrl={session.coloring_page_url}
        coloringPdfUrl={session.coloring_pdf_url}
        approval={session.coloring_approval}
        canApprove={isFacilitator}
        onApprove={onApproveColoring}
        weekNumber={session.week_number}
        themeTitle={session.theme_title}
        sessionTitle={session.session_title}
        onGenerated={async () => {
          const { data } = await db.from("mindcast_live_sessions")
            .select("*")
            .eq("week_number", session.week_number).eq("audience", "Child").maybeSingle();
          if (data) onSessionUpdate({
            ...session,
            coloring_page_url: data.coloring_page_url,
            coloring_pdf_url: data.coloring_pdf_url,
            coloring_approval: (data as { coloring_approval?: string }).coloring_approval || "unapproved",
          });
        }}
      />
    );
    default: return null;
  }
};

/**
 * Coloring Activity — shown only for Child audience.
 * Approval gate: generation lands 'unapproved' and the page cannot be
 * displayed or printed until a facilitator approves it, so an unreviewed AI
 * image never reaches children in one tap. No REGENERATE on this screen.
 */
const ColoringActivitySlide = ({
  coloringPageUrl, coloringPdfUrl, approval, canApprove, onApprove, weekNumber, themeTitle, sessionTitle, onGenerated,
}: {
  coloringPageUrl: string | null;
  coloringPdfUrl: string | null;
  approval: string;
  canApprove: boolean;
  onApprove: () => void | Promise<void>;
  weekNumber: number;
  themeTitle: string;
  sessionTitle: string;
  onGenerated?: () => void | Promise<void>;
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);

  // On-demand generation — pulls the lesson fields server-side to build the
  // image prompt, so it always reflects the current lesson content. The new
  // page lands 'unapproved' and waits for a facilitator before it can show.
  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-coloring-page", {
        body: { week_number: weekNumber },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: { json: () => Promise<{ error?: string }> } }).context;
          if (ctx) { const body = await ctx.json(); if (body?.error) detail = body.error; }
        } catch { /* keep message */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      toast({ title: "Colouring page ready", description: "Review it, then Approve to display and print." });
      await onGenerated?.();
    } catch (e: unknown) {
      toast({ title: "Colouring generation failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // No coloring page yet — show placeholder
  // The stored value is a path in the private `colouring` bucket; sign it.
  const [signedSrc, setSignedSrc] = useState<string | null>(null);
  useEffect(() => {
    let on = true;
    resolveColouringUrl(coloringPageUrl).then(u => { if (on) setSignedSrc(u); });
    return () => { on = false; };
  }, [coloringPageUrl]);

  if (!coloringPageUrl) {
    return (
      <div className="text-center max-w-2xl">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6">Coloring Activity</p>
        <div className="border border-dashed border-[hsl(var(--navy))]/20 rounded-sm p-16 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-[hsl(var(--navy))]/[0.04] flex items-center justify-center">
            <span className="text-4xl text-[hsl(var(--navy))]/20">🖍️</span>
          </div>
          <p className="font-serif text-xl text-[hsl(var(--navy))]/50 italic">
            Coloring page not yet generated for this session.
          </p>
          {canApprove && (
            <button onClick={generate} disabled={generating}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-[hsl(var(--blue))] text-white text-xs font-body tracking-widest uppercase rounded-sm disabled:opacity-50">
              {generating ? "Generating…" : "Generate colouring page"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Awaiting approval — dimmed preview for the facilitator, never full-screen,
  // and no PDF download until it is approved.
  if (approval !== "approved") {
    return (
      <div className="flex flex-col items-center gap-6 max-w-4xl w-full">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase">
          Coloring Activity — Week {weekNumber}
        </p>
        <div className="relative w-full max-w-lg">
          <img
            src={signedSrc ?? undefined}
            alt={`Colouring page awaiting approval for week ${weekNumber}`}
            className="w-full rounded-sm shadow-lg opacity-40"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="bg-[hsl(var(--ivory))]/95 border border-[hsl(var(--primary))]/40 text-[hsl(var(--navy))]/80 text-xs font-body tracking-widest uppercase px-4 py-2 rounded-sm">
              Awaiting approval — not live yet
            </p>
          </div>
        </div>
        {canApprove && (
          <button onClick={() => void onApprove()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--blue))] text-white text-xs font-body tracking-widest uppercase rounded-sm hover:bg-[hsl(var(--blue-light))] hover:text-[hsl(var(--navy))]">
            <Check size={14} /> Approve for the room
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-4xl w-full">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase">
        Coloring Activity — Week {weekNumber}
      </p>
      <p className="font-serif text-xl text-[hsl(var(--navy))]/90 -mt-3">
        {themeTitle}: {sessionTitle}
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        {!imgLoaded && (
          <div className="aspect-square bg-[hsl(var(--navy))]/[0.02] animate-pulse rounded-sm" />
        )}
        <img
          src={signedSrc ?? undefined}
          alt={`Coloring page for week ${weekNumber}`}
          className={`w-full rounded-sm shadow-lg ${imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
          onLoad={() => setImgLoaded(true)}
        />
      </motion.div>

      {coloringPdfUrl && (
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault();
              const u = await resolveColouringUrl(coloringPdfUrl);
              if (u) window.open(u, "_blank", "noopener");
              else toast({ title: "Couldn't open the colouring PDF" });
            }}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Roll Call — the child Slide 1. No join code, no bracelet tap, no devices.
 * The facilitator reads names and marks each child present with one tap,
 * writing to the same safeguarding roll (roll_events) as the dedicated roll
 * screen, so the positive record of who is in the room is kept.
 */
const nzToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

type RollEntry = { profile_id: string; display_name: string; state: string };

const RollCallSlide = ({ weekNumber, themeTitle, sessionTitle, phaseName }: {
  weekNumber: number; themeTitle: string; sessionTitle: string; phaseName: string;
}) => {
  const [rows, setRows] = useState<RollEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const sessionDate = nzToday();
  const room: Room = "Child";

  useEffect(() => {
    let on = true;
    (async () => {
      const { data } = await supabase.rpc("room_roll", { p_date: sessionDate, p_room: room });
      if (!on) return;
      setRows(((data ?? []) as RollEntry[]).map(r => ({ ...r })));
      setLoaded(true);
    })();
    return () => { on = false; };
  }, [sessionDate, room]);

  const markPresent = (child: RollEntry) => {
    enqueue({
      type: "present",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      childProfileId: child.profile_id,
      occurredAt: new Date().toISOString(),
    });
    setRows(prev => prev.map(r => r.profile_id === child.profile_id ? { ...r, state: "present" } : r));
    void flush();
  };

  const present = rows.filter(r => r.state === "present" || r.state === "brief_absence");

  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-8">
        <p className="text-[hsl(var(--primary))]/70 text-[10px] tracking-[0.6em] font-body uppercase mb-3">
          Week {weekNumber} · {phaseName}
        </p>
        <h1 className="font-display text-4xl md:text-6xl tracking-wide text-[hsl(var(--navy))]/40 leading-none">
          {(themeTitle || "").toUpperCase()}
        </h1>
        <p className="text-[hsl(var(--navy))]/40 font-serif italic text-lg md:text-xl mt-3">{sessionTitle}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase">Roll Call</p>
        <p className="text-[hsl(var(--primary))] font-display text-xl tracking-wider">{present.length} in the room</p>
      </div>

      {!loaded ? (
        <p className="text-[hsl(var(--navy))]/40 font-body text-sm">Loading the roll…</p>
      ) : rows.length === 0 ? (
        <p className="text-[hsl(var(--navy))]/50 font-body text-base border border-dashed border-[hsl(var(--navy))]/20 rounded-sm p-8 text-center">
          No children are rostered for today's session yet. Read names aloud and welcome each child as they arrive.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {rows.map(child => {
            const here = child.state === "present" || child.state === "brief_absence";
            const away = child.state === "signed_out";
            const canMark = !here && !away;
            return (
              <button
                key={child.profile_id}
                onClick={() => { if (canMark) markPresent(child); }}
                className={`text-left px-4 py-3 rounded-sm border transition-colors ${
                  here
                    ? "bg-[hsl(var(--blue))]/20 border-[hsl(var(--blue))] text-[hsl(var(--navy))]"
                    : away
                    ? "bg-[hsl(var(--navy))]/[0.02] border-[hsl(var(--navy))]/10 text-[hsl(var(--navy))]/30"
                    : "bg-[hsl(var(--navy))]/[0.03] border-[hsl(var(--navy))]/15 text-[hsl(var(--navy))]/70 hover:bg-[hsl(var(--navy))]/[0.07]"
                }`}
              >
                <span className="font-body text-lg leading-tight block">{child.display_name}</span>
                <span className={`text-[10px] tracking-widest uppercase font-body ${here ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--navy))]/30"}`}>
                  {here ? "Here" : away ? "Signed out" : "Tap when here"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Last Week We Learnt — the child Slide 2. Recap only; no intention return.
 * Week 1 says so in child language instead of the adult fallback.
 */
const LastWeekWeLearntSlide = ({ weekNumber, lastWeekTheme }: { weekNumber: number; lastWeekTheme: string }) => {
  if (weekNumber === 1) {
    return (
      <div className="text-center max-w-3xl">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">Welcome</p>
        <motion.p initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-8">
          This is our very first week together!
        </motion.p>
        <p className="text-[hsl(var(--navy))]/60 font-body text-lg">
          There's nothing to remember yet — today we start. Let's learn each other's names.
        </p>
      </div>
    );
  }
  return (
    <div className="text-center max-w-3xl">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">Last Week We Learnt</p>
      <motion.p initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-8">
        Last week we learnt about {lastWeekTheme ? <span className="text-[hsl(var(--primary))]">{lastWeekTheme.toLowerCase()}</span> : "our last idea"}.
      </motion.p>
      <p className="text-[hsl(var(--navy))]/60 font-body text-lg">
        Who remembers something from last week?
      </p>
    </div>
  );
};

/**
 * Talk About Your Picture — the child Slide 6. Spoken only: nothing recorded,
 * nothing displayed beyond the invitation, nothing stored.
 */
const TalkAboutPictureSlide = () => (
  <div className="text-center max-w-3xl">
    <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">Talk About Your Picture</p>
    <motion.p initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="font-serif text-3xl md:text-5xl text-[hsl(var(--navy))] leading-snug mb-8">
      Who wants to tell us about their picture?
    </motion.p>
    <p className="text-[hsl(var(--navy))]/50 font-body text-base">
      Spoken only — nothing written down, nothing put on the screen.
    </p>
  </div>
);

/**
 * The child close is active and physical. The game name, how-to, equipment and
 * younger-child adaptation remain visible while the facilitator runs it, with
 * one calm countdown instead of another attention-grabbing animation.
 */
const ClosingGameSlide = ({ game, equipment, under5 }: {
  game: string;
  equipment: string;
  under5: string;
}) => {
  const parts = splitKidsGame(game);
  const [minutes, setMinutes] = useState(8);
  const [remaining, setRemaining] = useState(8 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  const chooseMinutes = (value: number) => {
    setMinutes(value);
    setRemaining(value * 60);
    setRunning(false);
  };
  const reset = () => {
    setRemaining(minutes * 60);
    setRunning(false);
  };
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = Math.max(0, Math.min(100, (remaining / (minutes * 60)) * 100));

  return (
    <div className="w-full max-w-6xl max-h-[72vh] overflow-y-auto pr-2">
      <div className="text-center mb-7">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-3">The Closing Game / Activity</p>
        <h2 className="font-display text-4xl md:text-6xl tracking-wide text-[hsl(var(--navy))] leading-none">
          {parts.title.toUpperCase()}
        </h2>
      </div>

      <div className="grid md:grid-cols-[1.45fr_0.75fr] gap-6 items-stretch">
        <section className="rounded-xl border border-[hsl(var(--navy))]/15 bg-[hsl(var(--navy))]/[0.04] p-6 md:p-8">
          <p className="text-[hsl(var(--primary))] text-[10px] tracking-[0.35em] font-body uppercase mb-3">How to play</p>
          <p className="max-h-[30vh] overflow-y-auto pr-2 whitespace-pre-wrap font-body text-base md:text-lg leading-relaxed text-[hsl(var(--navy))]/90">
            {parts.instructions}
          </p>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/[0.06] p-5">
            <p className="text-[hsl(var(--primary))] text-[10px] tracking-[0.35em] font-body uppercase mb-2">What you need</p>
            <p className="font-body text-sm md:text-base leading-relaxed text-[hsl(var(--navy))]/85">
              {equipment || "No special equipment."}
            </p>
          </section>

          {under5 && (
            <section className="rounded-xl border border-[hsl(var(--navy))]/10 bg-black/10 p-5">
              <p className="text-[hsl(var(--navy))]/45 text-[10px] tracking-[0.35em] font-body uppercase mb-2">For younger children</p>
              <p className="font-body text-xs md:text-sm leading-relaxed text-[hsl(var(--navy))]/70">{under5}</p>
            </section>
          )}

          <section className="rounded-xl border border-[hsl(var(--navy))]/15 p-5" aria-label="Game timer">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[hsl(var(--navy))]/40 text-[10px] tracking-[0.35em] font-body uppercase mb-1">Game timer</p>
                <p role="timer" aria-live="off" className="font-display text-5xl tracking-wider tabular-nums text-[hsl(var(--navy))]">
                  {mm}:{ss}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRunning((value) => !value)} aria-label={running ? "Pause game timer" : "Start game timer"} className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--blue))] text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--blue-light))]">
                  {running ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button type="button" onClick={reset} aria-label="Reset game timer" className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--navy))]/10 text-[hsl(var(--navy))]/75 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--navy))]/40">
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[hsl(var(--navy))]/10">
              <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex gap-2">
              {[5, 8, 10].map((value) => (
                <button type="button" key={value} onClick={() => chooseMinutes(value)} aria-pressed={minutes === value} className={`min-h-9 flex-1 rounded-lg text-[10px] font-body tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[hsl(var(--navy))]/30 ${minutes === value ? "bg-[hsl(var(--navy))]/15 text-[hsl(var(--navy))]" : "bg-[hsl(var(--navy))]/5 text-[hsl(var(--navy))]/45"}`}>
                  {value} min
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

/**
 * Picture Book — the child Slide 4. Read live from a purchased copy by default.
 * A read-aloud video is shown only when it is the SAME book and its source has
 * been rights-checked; otherwise the facilitator reads aloud. The "Ask the
 * children" prompts are spoken, not written.
 */
const PictureBookSlide = ({ book, author, question, readAloudUrl, sourceCheck }: {
  book: string; author: string; question: string; readAloudUrl: string; sourceCheck: string;
}) => {
  const cleared = /approved|licensed|verified|rights/i.test(sourceCheck || "");
  const ytMatch = cleared && readAloudUrl
    ? readAloudUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)
    : null;
  const ytId = ytMatch?.[1];

  return (
    <div className="max-w-5xl w-full">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase text-center mb-6">This Week's Story</p>

      <div className="text-center mb-8">
        <p className="font-display text-3xl md:text-5xl text-[hsl(var(--navy))] leading-tight mb-3">
          {book || "The picture book for this week"}
        </p>
        {author && <p className="text-[hsl(var(--navy))]/60 font-body text-lg">by {author}</p>}
      </div>

      {ytId ? (
        <div className="aspect-video w-full max-w-3xl mx-auto rounded-sm overflow-hidden border border-[hsl(var(--navy))]/15">
          <iframe key={ytId} src={`https://www.youtube.com/embed/${ytId}?cc_load_policy=1&rel=0`} title="Lesson video" className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto border border-[hsl(var(--navy))]/15 rounded-sm p-10 text-center bg-[hsl(var(--navy))]/[0.03]">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))]/90 italic leading-relaxed">
            Read live from a purchased copy.
          </p>
          <p className="text-[hsl(var(--navy))]/50 font-body text-sm mt-4">
            No video is set — gather the children close and read the book aloud together.
          </p>
        </div>
      )}

      {question && (
        <div className="max-w-3xl mx-auto mt-8 border-l-2 border-[hsl(var(--blue))] pl-6 py-2">
          <p className="text-[hsl(var(--primary))] text-[10px] tracking-[0.4em] font-body uppercase mb-2">Ask the children</p>
          <p className="font-serif text-xl md:text-2xl text-[hsl(var(--navy))]/90 italic leading-relaxed">{question}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Live word cloud — words members send from their phones, sized by how many
 * people chose the same one. Free text, so every word has already been through
 * moderation before it reaches here (see the moderate-content function).
 */
const WordCloudSlide = ({ text, responses }: { text: string; responses: Response[] }) => {
  const words = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of responses) {
      for (const raw of (r.response_text || "").split(/[,\s]+/)) {
        const w = raw.trim().toLowerCase().replace(/[^\p{L}\p{N}'-]/gu, "");
        if (w.length < 2 || w.length > 24) continue;
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 60);
  }, [responses]);

  const max = words[0]?.[1] ?? 1;

  return (
    <div className="max-w-6xl w-full text-center">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-3">Together</p>
      {text && <p className="text-[hsl(var(--navy))]/60 font-body text-sm mb-8 max-w-3xl mx-auto">{text}</p>}
      {words.length === 0 ? (
        <p className="text-[hsl(var(--navy))]/40 font-body text-lg py-16">Waiting for the room…</p>
      ) : (
        <div className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 py-6">
          <AnimatePresence>
            {words.map(([word, n]) => {
              // Scale 1.15rem → 4.5rem by relative frequency.
              const size = 1.15 + (n / max) * 3.35;
              const opacity = 0.55 + (n / max) * 0.45;
              return (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="font-display tracking-wide text-[hsl(var(--navy))] leading-none"
                  style={{ fontSize: `${size}rem` }}
                  title={`${n}`}
                >
                  {word}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <p className="text-[hsl(var(--navy))]/30 text-[10px] tracking-widest font-body uppercase mt-6">
        {responses.length} {responses.length === 1 ? "voice" : "voices"}
      </p>
    </div>
  );
};

/**
 * Live poll — members tap one of the facilitator's own options, so there is no
 * free text on screen and nothing to moderate.
 */
/**
 * ScaleSlide — the room's answer to a 1-10 statement, as a distribution.
 *
 * The average alone hides the interesting shape: a room split between 2s and
 * 9s averages the same as a room of all 5s, and those are completely different
 * conversations to facilitate. So the bars are the point; the average is the
 * caption.
 */
const ScaleSlide = ({
  text, statement, minLabel, maxLabel, responses,
}: { text: string; statement: string; minLabel: string; maxLabel: string; responses: Response[] }) => {
  const { buckets, total, average } = useMemo(() => {
    const b = Array.from({ length: 10 }, () => 0);
    let sum = 0, n = 0;
    for (const r of responses) {
      const v = Math.round(Number((r.response_text || "").trim()));
      if (Number.isFinite(v) && v >= 1 && v <= 10) { b[v - 1] += 1; sum += v; n += 1; }
    }
    return { buckets: b, total: n, average: n ? sum / n : 0 };
  }, [responses]);

  const peak = Math.max(1, ...buckets);

  return (
    <div className="max-w-5xl w-full">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Together</p>
      <p className="font-body text-lg text-[hsl(var(--navy))]/80 mb-8 text-center">{text}</p>
      <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))] mb-10 text-center italic">{statement}</p>

      <div className="flex items-end justify-between gap-2 md:gap-3 h-56">
        {buckets.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className={`font-display text-lg mb-2 ${count ? "text-[hsl(var(--navy))]" : "text-[hsl(var(--navy))]/20"}`}>
              {count || ""}
            </span>
            <motion.div
              className="w-full rounded-t-sm bg-[hsl(var(--blue))]"
              initial={{ height: 0 }}
              animate={{ height: `${(count / peak) * 100}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
              style={{ minHeight: count ? 6 : 2, opacity: count ? 1 : 0.15 }}
            />
            <span className="font-body text-[11px] text-[hsl(var(--navy))]/40 mt-2">{i + 1}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4 text-[11px] tracking-[0.2em] font-body uppercase text-[hsl(var(--navy))]/40">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      <p className="text-center mt-8 font-body text-sm text-[hsl(var(--navy))]/50">
        {total === 0
          ? "Waiting for the room…"
          : `${total} ${total === 1 ? "response" : "responses"} · average ${average.toFixed(1)}`}
      </p>
    </div>
  );
};

/**
 * PhraseWallSlide — completed sentence stems, newest first.
 *
 * Free text, so it obeys the same rule as the word cloud: only rows the
 * moderator has approved ever reach the wall (filtered by the caller).
 */
const PhraseWallSlide = ({ text, responses }: { text: string; responses: Response[] }) => {
  const phrases = useMemo(
    () => responses.map(r => (r.response_text || "").trim()).filter(Boolean).slice(-12).reverse(),
    [responses],
  );

  return (
    <div className="max-w-5xl w-full">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Together</p>
      <p className="font-body text-lg text-[hsl(var(--navy))]/80 mb-10 text-center">{text}</p>

      {phrases.length === 0 ? (
        <p className="text-center font-body text-sm text-[hsl(var(--navy))]/40">Waiting for the room…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {phrases.map((p, i) => (
              <motion.p
                key={`${p}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="font-serif text-xl md:text-2xl text-[hsl(var(--navy))]/90 leading-snug border-l-2 border-[hsl(var(--blue))] pl-5 py-2"
              >
                {p}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="text-center mt-10 font-body text-sm text-[hsl(var(--navy))]/50">
        {responses.length === 0 ? "" : `${responses.length} shared`}
      </p>
    </div>
  );
};

/**
 * WisdomWorldSlide — the principle and its modern form, side by side.
 *
 * Two columns on a room screen, stacked on anything narrow. Deliberately no
 * scroll: if a week's text does not fit at this size it is too long to read
 * aloud, and the facilitator drawer holds the full version.
 */
const WisdomWorldSlide = ({
  wisdom, world, wisdomVideoUrl, worldVideoUrl,
}: { wisdom: string; world: string; wisdomVideoUrl?: string | null; worldVideoUrl?: string | null }) => (
  <div className="w-full max-w-6xl">
    <div className="grid md:grid-cols-2 gap-10 md:gap-14">
      <div>
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6">Inner Wisdom</p>
        {wisdomVideoUrl ? (
          <video src={wisdomVideoUrl} autoPlay muted loop playsInline className="w-full rounded-sm mb-5" />
        ) : null}
        <p className="font-serif text-xl md:text-2xl text-[hsl(var(--navy))]/90 leading-relaxed italic">{wisdom}</p>
      </div>

      <div className="md:border-l md:border-[hsl(var(--navy))]/15 md:pl-14">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6">In Today's World</p>
        {worldVideoUrl ? (
          <video src={worldVideoUrl} autoPlay muted loop playsInline className="w-full rounded-sm mb-5" />
        ) : null}
        <p className="font-body text-xl md:text-2xl text-[hsl(var(--navy))]/90 leading-relaxed">{world}</p>
      </div>
    </div>
  </div>
);

/**
 * DeeperSlide — the teaching and the activity as one beat.
 *
 * Order on screen: what we are unpacking, then the question that frames it,
 * then the exercise itself and whatever the room has submitted. The question
 * is a subheading, never a field — members answer the exercise, not the
 * question.
 */
const DeeperSlide = ({
  coreConcept, question, exercise, activityType, options, responses, week, audience, sessionCode,
}: {
  coreConcept: string; question: string; exercise: string; activityType: string;
  options: string[]; responses: Response[]; week: number; audience: string; sessionCode: string;
}) => {
  const paras = (coreConcept || "").split(/\n+/).filter(Boolean);
  const isChild = audience === "Child";
  return (
    <div className="w-full max-w-6xl">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6">Go Deeper</p>

      {paras.length > 0 && (
        <div className="space-y-4 mb-8 max-h-[26vh] overflow-y-auto pr-2">
          {paras.map((para, i) => (
            <p key={i} className="text-[hsl(var(--navy))]/85 text-lg md:text-xl font-body leading-relaxed">{para}</p>
          ))}
        </div>
      )}

      {question ? (
        <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))] italic leading-snug border-l-2 border-[hsl(var(--blue))] pl-6 mb-8">
          {question}
        </p>
      ) : null}

      <div className="border-t border-[hsl(var(--navy))]/10 pt-8">
        {isChild ? (
          <ExerciseSlide text={exercise} week={week} audience={audience} sessionCode={sessionCode} />
        ) : isCanvasSurface(activityType) ? (
          <>
            {exercise ? (
              <p className="font-body text-base text-[hsl(var(--navy))]/70 mb-4 leading-relaxed">{exercise}</p>
            ) : null}
            <CanvasSurface activityType={activityType} week={week} audience={audience} sessionCode={sessionCode} />
          </>
        ) : activityType === "wordcloud" ? (
          <WordCloudSlide text={exercise} responses={responses} />
        ) : (activityType === "poll" || activityType === "choice") && options.length > 0 ? (
          <PollSlide text={exercise} options={options} responses={responses} />
        ) : activityType === "scale" ? (
          <ScaleSlide
            text={exercise}
            statement={options[0] || "How true does this feel for you right now?"}
            minLabel={options[1] || "Not at all"}
            maxLabel={options[2] || "Completely"}
            responses={responses}
          />
        ) : activityType === "phrase" ? (
          <PhraseWallSlide text={exercise} responses={responses} />
        ) : (
          <ExerciseSlide text={exercise} week={week} audience={audience} sessionCode={sessionCode} />
        )}
      </div>
    </div>
  );
};

const PollSlide = ({ text, options, responses }: { text: string; options: string[]; responses: Response[] }) => {
  const tally = useMemo(() => {
    const counts = new Map<string, number>(options.map(o => [o.toLowerCase(), 0]));
    for (const r of responses) {
      const key = (r.response_text || "").trim().toLowerCase();
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return options.map(o => ({ option: o, count: counts.get(o.toLowerCase()) ?? 0 }));
  }, [options, responses]);

  const total = tally.reduce((n, t) => n + t.count, 0);
  const max = Math.max(1, ...tally.map(t => t.count));

  return (
    <div className="max-w-4xl w-full">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-3 text-center">Together</p>
      {text && <p className="text-[hsl(var(--navy))]/60 font-body text-sm mb-8 text-center">{text}</p>}
      <div className="space-y-4">
        {tally.map(({ option, count }) => {
          const pct = total === 0 ? 0 : Math.round((count / total) * 100);
          return (
            <div key={option}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="font-body text-lg md:text-xl text-[hsl(var(--navy))]/90">{option}</span>
                <span className="font-display text-xl text-[hsl(var(--blue))] tabular-nums">{pct}%</span>
              </div>
              <div className="h-4 rounded-sm bg-[hsl(var(--navy))]/[0.07] overflow-hidden">
                <motion.div
                  className="h-full bg-[hsl(var(--blue))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / max) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[hsl(var(--navy))]/30 text-[10px] tracking-widest font-body uppercase mt-8 text-center">
        {total} {total === 1 ? "response" : "responses"}
      </p>
    </div>
  );
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
      className="bg-[hsl(var(--primary))]/[0.06] border border-[hsl(var(--primary))]/30 rounded-sm p-3">
      <p className="text-[hsl(var(--chrome-ink))] text-sm font-body leading-relaxed">{response.response_text}</p>
      <div className="flex items-center justify-between mt-2 mb-2">
        <span className="text-[hsl(var(--chrome-ink))]/30 text-[10px] font-body tracking-widest uppercase">
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
          className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 text-[hsl(var(--chrome-ink))]/70 text-[10px] font-body tracking-widest uppercase py-1.5 rounded-sm">
          <ShieldOff size={11} /> Hold back
        </button>
      </div>
      <AnimatePresence>
        {showDenyMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-[hsl(var(--chrome-ink))]/10 space-y-1.5">
            <p className="text-[hsl(var(--chrome-ink))]/40 text-[9px] tracking-widest font-body uppercase mb-1">Pick a message to send back</p>
            {DENIAL_PRESETS.map((preset, i) => (
              <button key={i} onClick={() => onDeny(response.id, preset)}
                className="w-full text-left text-[hsl(var(--chrome-ink))]/80 text-xs font-body leading-snug bg-[hsl(var(--chrome-ink))]/5 hover:bg-[hsl(var(--chrome-ink))]/10 px-2.5 py-2 rounded-sm">
                {preset}
              </button>
            ))}
            <div className="flex gap-1 mt-2">
              <input
                value={customReason}
                onChange={e => setCustomReason(e.target.value.slice(0, 200))}
                placeholder="Custom message…"
                className="flex-1 bg-[hsl(var(--chrome-ink))]/5 border border-[hsl(var(--chrome-ink))]/10 rounded-sm px-2 py-1.5 text-xs text-[hsl(var(--chrome-ink))] font-body focus:outline-none focus:border-[hsl(var(--blue))]"
              />
              <button
                onClick={() => customReason.trim() && onDeny(response.id, customReason.trim())}
                disabled={!customReason.trim()}
                className="bg-[hsl(var(--chrome-ink))]/10 hover:bg-[hsl(var(--chrome-ink))]/15 disabled:opacity-30 text-[hsl(var(--chrome-ink))] text-[10px] font-body tracking-widest uppercase px-3 rounded-sm">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Return to Your Intention — replaces "Voices from Last Week".
 * Prompts participants to open their workbook to the intention they set
 * seven days ago. Guides them through reflection questions and a brief
 * pair-share / group popcorning moment.
 */
const ReturnToIntentionSlide = ({
  previousWeekCallback, weekNumber, sessionTitle, themeTitle,
}: { previousWeekCallback: string; weekNumber: number; sessionTitle: string; themeTitle: string }) => {
  // Week 1 — no previous intention to return to
  if (weekNumber === 1 || !previousWeekCallback) {
    return (
      <div className="max-w-4xl text-center">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6">Return to Your Intention</p>
        <div className="border border-[hsl(var(--primary))]/30 rounded-sm p-10 md:p-14 bg-gradient-to-br from-[hsl(var(--navy))]/[0.03] to-transparent">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))] leading-relaxed mb-6">
            {weekNumber === 1
              ? "This is your first session — there's no intention to return to yet. Take a moment to introduce yourself to someone new. What brought you here today?"
              : "Open your workbook to the intention you wrote seven days ago."}
          </p>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <div className="bg-[hsl(var(--navy))]/[0.04] border border-[hsl(var(--navy))]/10 rounded-sm p-5">
              <p className="font-serif text-xl text-[hsl(var(--navy))]/90 leading-relaxed italic">
                {weekNumber === 1
                  ? '"What intention would you like to set for your first session together?"'
                  : '"Did you do it?"'}
              </p>
            </div>
            <div className="bg-[hsl(var(--navy))]/[0.04] border border-[hsl(var(--navy))]/10 rounded-sm p-5">
              <p className="font-serif text-xl text-[hsl(var(--navy))]/90 leading-relaxed italic">
                {weekNumber === 1
                  ? '"Who are you and what does being here mean to you right now?"'
                  : '"What got in the way?"'}
              </p>
            </div>
            <div className="bg-[hsl(var(--navy))]/[0.04] border border-[hsl(var(--navy))]/10 rounded-sm p-5">
              <p className="font-serif text-xl text-[hsl(var(--navy))]/90 leading-relaxed italic">
                {weekNumber === 1
                  ? '"Find someone you do not know and share what you hope to find here."'
                  : '"What did you notice? Share briefly with someone beside you."'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl text-center">
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6">Return to Your Intention</p>
      <div className="border border-[hsl(var(--primary))]/30 rounded-sm p-10 md:p-14 bg-gradient-to-br from-[hsl(var(--navy))]/[0.03] to-transparent">
        <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))] leading-relaxed mb-6">
          Open your workbook to the intention you wrote seven days ago.
        </p>
        <p className="font-serif text-xl md:text-2xl text-[hsl(var(--primary))]/80 italic mb-8">
          "{previousWeekCallback}"
        </p>
        <div className="space-y-4 text-left max-w-2xl mx-auto">
          <div className="bg-[hsl(var(--navy))]/[0.04] border border-[hsl(var(--navy))]/10 rounded-sm p-5">
            <p className="font-serif text-xl text-[hsl(var(--navy))]/90 leading-relaxed italic">"Did you do it?"</p>
          </div>
          <div className="bg-[hsl(var(--navy))]/[0.04] border border-[hsl(var(--navy))]/10 rounded-sm p-5">
            <p className="font-serif text-xl text-[hsl(var(--navy))]/90 leading-relaxed italic">"What got in the way?"</p>
          </div>
          <div className="bg-[hsl(var(--navy))]/[0.04] border border-[hsl(var(--navy))]/10 rounded-sm p-5">
            <p className="font-serif text-xl text-[hsl(var(--navy))]/90 leading-relaxed italic">"What did you notice? Share briefly with someone beside you."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExerciseSlide = ({ text, week, audience, sessionCode }: { text: string; week: number; audience: string; sessionCode: string }) => {
  const [duration, setDuration] = useState(5);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  // The whiteboard is a separate view of this slide — opens on demand and
  // keeps its drawing under this live session code via tldraw persistenceKey.
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[hsl(var(--navy))]/10 hover:bg-[hsl(var(--navy))]/15 text-[hsl(var(--navy))]/80 text-xs font-body tracking-widest uppercase rounded-sm"
          >
            <ArrowLeft size={12} /> Back to instructions
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInstructionsCollapsed(c => !c)}
              className="px-3 py-1.5 bg-[hsl(var(--navy))]/10 hover:bg-[hsl(var(--navy))]/15 text-[hsl(var(--navy))]/70 text-[10px] font-body tracking-widest uppercase rounded-sm"
            >
              {instructionsCollapsed ? "Show instructions" : "Hide instructions"}
            </button>
            <div className="flex items-center gap-2 bg-[hsl(var(--navy))]/10 px-3 py-1.5 rounded-sm">
              <span className="text-[hsl(var(--navy))]/40 text-[10px] tracking-widest font-body uppercase">Timer</span>
              <span className="font-display text-[hsl(var(--primary))] text-base tracking-wider tabular-nums">
                {running || remaining > 0 ? `${mm}:${ss}` : `${duration}:00`}
              </span>
              <button onClick={start} className="p-1 bg-[hsl(var(--blue))] text-white rounded-sm"><Play size={10} /></button>
              <button onClick={() => setRunning(r => !r)} className="p-1 bg-[hsl(var(--navy))]/10 rounded-sm">{running ? <Pause size={10} /> : <Play size={10} />}</button>
              <button onClick={() => { setRunning(false); setRemaining(0); }} className="p-1 bg-[hsl(var(--navy))]/10 rounded-sm"><RotateCcw size={10} /></button>
            </div>
          </div>
        </div>

        {/* Whiteboard surface (fills remaining height). The light theme keeps
            ink readable; the surrounding slide stays dark navy. */}
        <div className="relative flex-1 rounded-sm overflow-hidden border border-[hsl(var(--navy))]/15 bg-white min-h-[60vh]">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--navy-mid))]/60 text-xs font-body tracking-widest uppercase">
              Loading whiteboard…
            </div>
          }>
            <ExerciseWhiteboard week={week} audience={audience} sessionCode={sessionCode} />
          </Suspense>

          {/* Floating instructions card — collapsible reference */}
          {!instructionsCollapsed && (
            <div className="absolute top-3 left-3 z-30 max-w-sm bg-[hsl(var(--ivory))]/95 backdrop-blur-sm border border-[hsl(var(--navy))]/15 rounded-sm p-4 shadow-xl">
              <p className="text-[hsl(var(--primary))] text-[9px] tracking-[0.4em] font-body uppercase mb-2">Exercise</p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {steps.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="font-display text-[hsl(var(--primary))] text-xs shrink-0 w-4">{i + 1}.</span>
                    <p className="text-[hsl(var(--navy))]/90 font-body text-xs leading-relaxed">{s.replace(/^\d+\.?\s*/, "")}</p>
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
      <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-6 text-center">Together</p>
      <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="font-display text-[hsl(var(--blue))] text-xl shrink-0 w-7">{i + 1}.</span>
              <p className="text-[hsl(var(--navy))]/90 font-body text-base md:text-lg leading-relaxed">{s.replace(/^\d+\.?\s*/, "")}</p>
            </div>
          ))}
          <button
            onClick={() => setWhiteboardOpen(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--blue))]/80 text-white text-xs font-body tracking-widest uppercase rounded-sm"
          >
            <PenLine size={13} /> Open whiteboard
          </button>
          <p className="mt-2 text-[10px] font-body text-[hsl(var(--navy))]/40">
            This board is saved to session {sessionCode} and remains visible in member lesson history.
          </p>
        </div>
        <div className="border border-[hsl(var(--navy))]/15 rounded-sm p-6 text-center min-w-[180px]">
          <p className="text-[hsl(var(--navy))]/40 text-[10px] tracking-widest font-body uppercase mb-3">Timer</p>
          <p className="font-display text-[hsl(var(--primary))] text-5xl tracking-wider tabular-nums">{running || remaining > 0 ? `${mm}:${ss}` : `${duration}:00`}</p>
          <div className="flex justify-center gap-1 mt-3">
            {[1,3,5,10,15].map(m => (
              <button key={m} onClick={() => setDuration(m)}
                className={`px-2 py-1 text-[10px] font-body rounded-sm ${duration === m ? "bg-[hsl(var(--blue))] text-white" : "bg-[hsl(var(--navy))]/10 text-[hsl(var(--navy))]/60"}`}>{m}m</button>
            ))}
          </div>
          <div className="flex gap-2 mt-3 justify-center">
            <button onClick={start} className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--blue))] text-white text-xs font-body rounded-sm">
              <Play size={12} />Start
            </button>
            <button onClick={() => setRunning(r => !r)} className="p-1.5 bg-[hsl(var(--navy))]/10 rounded-sm">{running ? <Pause size={12} /> : <Play size={12} />}</button>
            <button onClick={() => { setRunning(false); setRemaining(0); }} className="p-1.5 bg-[hsl(var(--navy))]/10 rounded-sm"><RotateCcw size={12} /></button>
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
const MetaphorVideoSlide = ({
  title, text, videoUrl, captionsUrl, approval,
}: { title: string; text: string; videoUrl: string; captionsUrl: string; approval: string }) => {
  const isImage = /\.(png|jpe?g|webp)(\?|$)/i.test(videoUrl);
  const approved = approval === "approved" && Boolean(videoUrl);

  // 3-step fallback: approved video -> static branded card -> text. The text is
  // ALWAYS present on the slide (a member with hearing loss must never depend
  // on the voiceover).
  if (approved) {
    return (
      <div className="max-w-5xl w-full">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-4 text-center">{title}</p>
        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[hsl(var(--navy))]/15 bg-black">
          {isImage ? (
            <img src={videoUrl} alt="" className="w-full h-full object-contain" />
          ) : (
            <video src={videoUrl} controls preload="auto" className="w-full h-full">
              {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />}
            </video>
          )}
        </div>
        <motion.blockquote initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
          className="text-center mt-6 px-8">
          <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))]/95 leading-snug italic">"{text}"</p>
        </motion.blockquote>
      </div>
    );
  }

  if (videoUrl && approval === "unapproved") {
    return (
      <div className="max-w-5xl w-full">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-4 text-center">{title}</p>
        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[hsl(var(--primary))]/30 bg-black flex items-center justify-center">
          <video src={videoUrl} muted loop playsInline autoPlay className="w-full h-full opacity-40" />
          <div className="absolute text-center">
            <p className="text-[hsl(var(--navy))]/70 text-xs font-body tracking-widest uppercase">Awaiting approval — not live yet</p>
          </div>
        </div>
        <p className="font-serif text-2xl md:text-3xl text-[hsl(var(--navy))]/95 leading-snug italic text-center mt-6 px-8">"{text}"</p>
      </div>
    );
  }

  // Text only — the metaphor stands alone (and is the fallback if generation fails).
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--blue))]/10 via-transparent to-[hsl(var(--primary))]/10 animate-pulse" style={{ animationDuration: "6s" }} />
      <motion.blockquote initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}
        className="relative max-w-4xl text-center px-8">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase mb-8">{title}</p>
        <p className="font-serif text-4xl md:text-5xl text-[hsl(var(--navy))] leading-snug italic">"{text}"</p>
      </motion.blockquote>
    </div>
  );
};

const VideoSlide = ({ link, description, backup, question1, question2, localUrl }: {
  link: string; description: string; backup: string; question1: string; question2: string; localUrl: string;
}) => {
  const ytMatch = link?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  const ytId = ytMatch?.[1];

  return (
    <div className="max-w-5xl w-full">
      <div className="flex items-center justify-center gap-3 mb-4">
        <p className="text-[hsl(var(--primary))] text-xs tracking-[0.5em] font-body uppercase">This Week's Listen</p>
        {localUrl && <span className="text-[hsl(var(--blue))] text-[9px] font-body tracking-widest uppercase">Local copy</span>}
      </div>
      {localUrl ? (
        // Pre-downloaded local copy — venue wifi cannot be trusted with a 20-min
        // stream. Played from our storage instead of YouTube.
        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[hsl(var(--navy))]/15 bg-black">
          <video src={localUrl} controls preload="auto" className="w-full h-full" />
        </div>
      ) : ytId ? (
        <div className="aspect-video w-full rounded-sm overflow-hidden border border-[hsl(var(--navy))]/15">
          <iframe key={ytId} src={`https://www.youtube.com/embed/${ytId}?cc_load_policy=1&rel=0`} title="Lesson video" className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-sm border border-[hsl(var(--navy))]/15 flex items-center justify-center bg-[hsl(var(--navy))]/[0.03]">
          <p className="text-[hsl(var(--navy))]/40 text-sm font-body">No video set for this session yet</p>
        </div>
      )}
      {(question1 || question2) && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {[question1, question2].filter(Boolean).map((q, i) => (
            <div key={i} className="border border-[hsl(var(--navy))]/15 rounded-sm p-4 bg-[hsl(var(--navy))]/[0.03]">
              <p className="text-[hsl(var(--primary))] text-[11px] tracking-[0.2em] font-body mb-2">Reflective Question {i + 1}:</p>
              <p className="text-[hsl(var(--navy))]/90 font-serif italic text-base leading-relaxed">"{q}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitatorView;
