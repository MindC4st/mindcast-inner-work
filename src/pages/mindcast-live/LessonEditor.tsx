import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Youtube, Save, AlertCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ── In-app lesson editor (admin / facilitator) ──────────────────────────────
// Edits every slide's text and swaps the YouTube video for a given week + track,
// writing to mindcast_live_sessions (the table FacilitatorView reads). Built
// mobile-first with a slide rail on desktop, and honours prefers-reduced-motion.

type Draft = {
  id?: string;
  week_number: number;
  audience: string;
  phase: number;
  phase_name: string;
  theme_title: string;
  session_title: string;
  previous_week_callback: string;
  signal_metaphor: string;
  ancient_wisdom_reframe: string;
  opening_hook: string;
  core_concept: string;
  teaching_points: string;
  journaling_prompt: string;
  experiential_exercise: string;
  guided_reflection: string;
  weekly_practice_mon: string;
  weekly_practice_wed: string;
  weekly_practice_sun: string;
  video_link: string;
  video_description: string;
  video_backup_description: string;
  core_affirmation: string;
  facilitator_notes: string;
};

const AUDIENCES = ["Adult", "Teen", "Child"] as const;

type FieldKind = "input" | "area" | "number" | "video";
type Field = { key: keyof Draft; label: string; kind: FieldKind; hint?: string; rows?: number };
type SlideDef = { idx: number; title: string; blurb: string; fields: Field[] };

// One entry per FacilitatorView slide (14) + a private notes panel, mapped to
// the exact columns each slide renders.
const SLIDES: SlideDef[] = [
  { idx: 0, title: "Title", blurb: "Opening slide — theme, session title, phase.", fields: [
    { key: "theme_title", label: "Theme title", kind: "input" },
    { key: "session_title", label: "Session title", kind: "input" },
    { key: "phase_name", label: "Phase name", kind: "input", hint: "e.g. See Clearly" },
    { key: "phase", label: "Phase number", kind: "number", hint: "1–4" },
  ]},
  { idx: 1, title: "Voices from Last Week", blurb: "Intro to the featured reflections carried over from last week.", fields: [
    { key: "previous_week_callback", label: "Callback intro", kind: "area", rows: 3 },
  ]},
  { idx: 2, title: "Signal Metaphor", blurb: "The week's central metaphor.", fields: [
    { key: "signal_metaphor", label: "Signal metaphor", kind: "area", rows: 4 },
  ]},
  { idx: 3, title: "Ancient Wisdom", blurb: "Inner-wisdom reframe (no deity language — one's own inner spirit).", fields: [
    { key: "ancient_wisdom_reframe", label: "Reframe", kind: "area", rows: 4 },
  ]},
  { idx: 4, title: "Opening Hook", blurb: "The line that opens the room.", fields: [
    { key: "opening_hook", label: "Opening hook", kind: "area", rows: 3 },
  ]},
  { idx: 5, title: "Core Concept", blurb: "Teaching heart. Blank line separates paragraphs.", fields: [
    { key: "core_concept", label: "Core concept", kind: "area", rows: 8 },
  ]},
  { idx: 6, title: "Teaching Points", blurb: "One point per line (or 1. 2. 3.) — revealed one at a time.", fields: [
    { key: "teaching_points", label: "Teaching points", kind: "area", rows: 8 },
  ]},
  { idx: 7, title: "Reflection 1", blurb: "First journaling prompt members answer live.", fields: [
    { key: "journaling_prompt", label: "Journaling prompt", kind: "area", rows: 3 },
  ]},
  { idx: 8, title: "Experiential Exercise", blurb: "The interactive activity for this week.", fields: [
    { key: "experiential_exercise", label: "Exercise", kind: "area", rows: 6 },
  ]},
  { idx: 9, title: "Guided Reflection", blurb: "Facilitator-read reflection (also feeds Reflection 2).", fields: [
    { key: "guided_reflection", label: "Guided reflection", kind: "area", rows: 5 },
  ]},
  { idx: 10, title: "Reflection 2", blurb: "Auto-derived from the first sentence of the Guided Reflection — edit that slide.", fields: [] },
  { idx: 11, title: "Weekly Practices", blurb: "Small daily practices to carry home.", fields: [
    { key: "weekly_practice_mon", label: "Monday", kind: "area", rows: 2 },
    { key: "weekly_practice_wed", label: "Wednesday", kind: "area", rows: 2 },
    { key: "weekly_practice_sun", label: "Sunday", kind: "area", rows: 2 },
  ]},
  { idx: 12, title: "Video", blurb: "Swap the YouTube video and its captions.", fields: [
    { key: "video_link", label: "YouTube URL", kind: "video", hint: "Paste any YouTube link — watch, share, or embed." },
    { key: "video_description", label: "Caption", kind: "area", rows: 2 },
    { key: "video_backup_description", label: "Backup caption", kind: "area", rows: 2 },
  ]},
  { idx: 13, title: "Affirmation", blurb: "Closing affirmation.", fields: [
    { key: "core_affirmation", label: "Affirmation", kind: "area", rows: 3 },
  ]},
  { idx: 14, title: "Facilitator Notes", blurb: "Private notes — never shown to members.", fields: [
    { key: "facilitator_notes", label: "Notes", kind: "area", rows: 8 },
  ]},
];

const EMPTY = (week: number, audience: string): Draft => ({
  week_number: week, audience, phase: 0, phase_name: "", theme_title: "", session_title: "",
  previous_week_callback: "", signal_metaphor: "", ancient_wisdom_reframe: "", opening_hook: "",
  core_concept: "", teaching_points: "", journaling_prompt: "", experiential_exercise: "",
  guided_reflection: "", weekly_practice_mon: "", weekly_practice_wed: "", weekly_practice_sun: "",
  video_link: "", video_description: "", video_backup_description: "", core_affirmation: "",
  facilitator_notes: "",
});

// Extract a YouTube video id from any common URL shape.
const ytId = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : (/^[\w-]{11}$/.test(url.trim()) ? url.trim() : null);
};

const LessonEditor = () => {
  const { weekNumber } = useParams();
  const week = Math.min(52, Math.max(1, parseInt(weekNumber || "1", 10) || 1));
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const reduce = useReducedMotion();

  const [audience, setAudience] = useState<string>("Adult");
  const [draft, setDraft] = useState<Draft>(() => EMPTY(week, "Adult"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [active, setActive] = useState(0);
  const cleanRef = useRef<string>("");

  // activity_type lives on curriculum_weeks (week-level, shared across tracks).
  const [activityType, setActivityType] = useState<string>("reflection");
  const activityCleanRef = useRef<string>("reflection");
  const activityDirty = activityType !== activityCleanRef.current;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("mindcast_live_sessions").select("*")
        .eq("week_number", week).eq("audience", audience).maybeSingle();
      if (cancelled) return;
      const next = data ? { ...EMPTY(week, audience), ...data } : EMPTY(week, audience);
      setDraft(next);
      cleanRef.current = JSON.stringify(next);
      setDirty(false);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [week, audience]);

  // Week-level activity_type from curriculum_weeks (independent of track).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("curriculum_weeks").select("activity_type")
        .eq("week_number", week).maybeSingle();
      if (cancelled) return;
      const t = data?.activity_type || "reflection";
      setActivityType(t);
      activityCleanRef.current = t;
    })();
    return () => { cancelled = true; };
  }, [week]);

  const set = (key: keyof Draft, value: string | number) => {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      setDirty(JSON.stringify(next) !== cleanRef.current);
      return next;
    });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const payload: any = { ...draft, phase: Number(draft.phase) || 0 };
    delete payload.id;
    const { data, error } = await (supabase as any)
      .from("mindcast_live_sessions")
      .upsert(payload, { onConflict: "week_number,audience" })
      .select("id").maybeSingle();
    // Persist the week-level activity_type (curriculum_weeks) when it changed.
    let activityErr: any = null;
    if (activityDirty) {
      const r = await (supabase as any)
        .from("curriculum_weeks").update({ activity_type: activityType }).eq("week_number", week);
      activityErr = r.error;
    }
    setSaving(false);
    if (error || activityErr) {
      toast({ title: "Couldn't save", description: (error || activityErr).message, variant: "destructive" });
      return;
    }
    const saved = { ...draft, id: data?.id ?? draft.id };
    setDraft(saved);
    cleanRef.current = JSON.stringify({ ...EMPTY(week, audience), ...saved });
    activityCleanRef.current = activityType;
    setDirty(false);
    setSavedAt(new Date());
    toast({ title: "Saved", description: `Week ${week} · ${audience}` });
  };

  // Warn before navigating away with unsaved edits.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty || activityDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty, activityDirty]);

  const slide = SLIDES[active];
  const vid = useMemo(() => ytId(draft.video_link), [draft.video_link]);
  const ease = reduce ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

  if (!isStaff) {
    return (
      <div className="min-h-screen grid place-items-center bg-[hsl(var(--ivory))] px-6 text-center">
        <p className="text-[hsl(var(--navy))] font-body">Facilitator access only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] text-[hsl(var(--navy))]">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-[hsl(var(--ivory))]/80 border-b border-[hsl(var(--warm-border))]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate("/mindcast-live/library")}
            className="flex items-center gap-1.5 text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] transition-colors text-sm">
            <ArrowLeft size={16} /> Library
          </button>
          <div className="ml-1">
            <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase">Mindcast Live · Editor</p>
            <h1 className="font-display text-2xl md:text-3xl tracking-wide leading-none">WEEK {String(week).padStart(2, "0")}</h1>
          </div>
          {/* Track toggle */}
          <div className="flex gap-1 ml-auto bg-[hsl(var(--warm-border))]/40 rounded-full p-1">
            {AUDIENCES.map((a) => (
              <button key={a} onClick={() => setAudience(a)}
                className={`relative px-3 md:px-4 py-1.5 text-xs font-body tracking-widest uppercase rounded-full transition-colors ${audience === a ? "text-white" : "text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))]"}`}>
                {audience === a && (
                  <motion.span layoutId="trackPill" transition={ease}
                    className="absolute inset-0 rounded-full bg-[hsl(var(--navy))]" />
                )}
                <span className="relative z-10">{a}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 grid md:grid-cols-[220px_1fr] gap-6 md:gap-10">
        {/* Slide navigator — rail on desktop, horizontal chips on mobile */}
        <nav aria-label="Slides" className="md:sticky md:top-24 md:self-start">
          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1">
            {SLIDES.map((s) => {
              const isActive = s.idx === active;
              return (
                <button key={s.idx} onClick={() => setActive(s.idx)}
                  className={`relative shrink-0 text-left rounded-lg px-3 py-2 transition-all duration-200 ${isActive ? "bg-white shadow-[0_2px_20px_-8px_rgba(20,40,60,0.35)]" : "hover:bg-white/60"}`}>
                  {isActive && !reduce && (
                    <motion.span layoutId="slideActive" transition={ease}
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[hsl(var(--blue))]" />
                  )}
                  <span className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono tabular-nums ${isActive ? "text-[hsl(var(--blue))]" : "text-[hsl(var(--navy-mid))]/50"}`}>{String(s.idx).padStart(2, "0")}</span>
                    <span className={`text-xs md:text-[13px] font-body whitespace-nowrap md:whitespace-normal ${isActive ? "text-[hsl(var(--navy))] font-semibold" : "text-[hsl(var(--navy-mid))]"}`}>{s.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Editor panel */}
        <main className="min-w-0">
          {loading ? (
            <div className="grid place-items-center py-32 text-[hsl(var(--navy-mid))]">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.section key={`${audience}-${active}`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={ease}
                className="rounded-2xl border border-[hsl(var(--warm-border))] bg-white/70 backdrop-blur-sm shadow-[0_10px_40px_-24px_rgba(20,40,60,0.4)] p-5 md:p-8">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h2 className="font-display text-xl md:text-2xl tracking-wide">{slide.title}</h2>
                  <span className="text-[10px] font-mono text-[hsl(var(--navy-mid))]/50">SLIDE {String(slide.idx).padStart(2, "0")}</span>
                </div>
                <p className="text-[hsl(var(--navy-mid))] text-sm font-body mb-6">{slide.blurb}</p>

                {slide.fields.length === 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-[hsl(var(--blue-light))]/40 text-[hsl(var(--navy))] p-4 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>This slide is generated automatically — nothing to edit here.</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Experiential Exercise slide: pick the live input widget (week-level). */}
                  {slide.idx === 8 && (
                    <label className="block">
                      <span className="block text-[11px] font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] mb-1.5">Live activity type</span>
                      <select value={activityType} onChange={(e) => setActivityType(e.target.value)}
                        className="w-full max-w-xs rounded-lg border border-[hsl(var(--warm-border))] bg-white px-3.5 py-2.5 text-[15px] font-body text-[hsl(var(--navy))] outline-none transition-all duration-200 focus:border-[hsl(var(--blue))] focus:ring-2 focus:ring-[hsl(var(--blue))]/20">
                        <option value="wordcloud">Word cloud — one word each</option>
                        <option value="poll">Poll / spectrum — vote or rate</option>
                        <option value="reflection">Reflection — submit a line / open Q&amp;A</option>
                        <option value="none">Private only — nothing on screen</option>
                      </select>
                      <span className="block text-[11px] text-[hsl(var(--navy-mid))]/60 mt-1">Drives the live in-session widget. Applies to all tracks for this week.</span>
                    </label>
                  )}
                  {slide.fields.map((f) => (
                    <FieldRow key={String(f.key)} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} vid={f.kind === "video" ? vid : null} />
                  ))}
                </div>
              </motion.section>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-20 backdrop-blur-xl bg-[hsl(var(--ivory))]/85 border-t border-[hsl(var(--warm-border))]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <span className="text-xs font-body text-[hsl(var(--navy-mid))] flex items-center gap-1.5">
            {(dirty || activityDirty) ? (
              <><span className="w-2 h-2 rounded-full bg-[hsl(var(--bronze))] animate-pulse" /> Unsaved changes</>
            ) : savedAt ? (
              <><Check size={14} className="text-[hsl(var(--blue))]" /> Saved {savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
            ) : (
              <>All changes saved</>
            )}
          </span>
          <button onClick={save} disabled={saving || (!dirty && !activityDirty)}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy-mid))] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-body tracking-widest uppercase transition-all active:scale-95">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Field row (input / textarea / number / YouTube-with-preview) ─────────────
const FieldRow = ({ field, value, onChange, vid }: {
  field: Field; value: string | number; onChange: (v: string | number) => void; vid: string | null;
}) => {
  const base = "w-full rounded-lg border border-[hsl(var(--warm-border))] bg-white px-3.5 py-2.5 text-[15px] font-body text-[hsl(var(--navy))] placeholder:text-[hsl(var(--navy-mid))]/40 outline-none transition-all duration-200 focus:border-[hsl(var(--blue))] focus:ring-2 focus:ring-[hsl(var(--blue))]/20";
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[11px] font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] mb-1.5">
        {field.kind === "video" && <Youtube size={13} className="text-[hsl(var(--bronze))]" />}
        {field.label}
      </span>
      {field.kind === "number" ? (
        <input type="number" inputMode="numeric" value={value as number}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} className={`${base} max-w-[8rem]`} />
      ) : field.kind === "input" || field.kind === "video" ? (
        <input type="text" value={value as string} onChange={(e) => onChange(e.target.value)}
          placeholder={field.kind === "video" ? "https://youtu.be/…" : ""} className={base} />
      ) : (
        <textarea rows={field.rows || 4} value={value as string} onChange={(e) => onChange(e.target.value)}
          className={`${base} resize-y leading-relaxed`} />
      )}
      {field.hint && <span className="block text-[11px] text-[hsl(var(--navy-mid))]/60 mt-1">{field.hint}</span>}

      {/* Live YouTube preview */}
      {field.kind === "video" && (
        <div className="mt-3">
          {vid ? (
            <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-[hsl(var(--warm-border))] shadow-sm">
              <iframe src={`https://www.youtube.com/embed/${vid}`} title="Video preview"
                className="absolute inset-0 w-full h-full" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ) : (value as string) ? (
            <div className="flex items-center gap-2 text-[hsl(var(--bronze))] text-xs"><AlertCircle size={13} /> Not a recognisable YouTube link.</div>
          ) : (
            <div className="flex items-center gap-2 text-[hsl(var(--navy-mid))]/50 text-xs"><Play size={13} /> Paste a link to preview.</div>
          )}
        </div>
      )}
    </label>
  );
};

export default LessonEditor;
