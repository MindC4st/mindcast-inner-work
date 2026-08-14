import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lock, Download, ShoppingCart, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { downloadWorksheetPdf } from "@/lib/generateWorksheetPdf";
import { toast } from "@/hooks/use-toast";

type Session = {
  week_number: number;
  theme_title: string;
  session_title: string;
  phase_name: string;
  core_concept: string;
  signal_metaphor: string;
  journaling_prompt: string;
  experiential_exercise: string;
  weekly_practice_mon: string;
  weekly_practice_wed: string;
  weekly_practice_sun: string;
  core_affirmation: string;
  video_link: string;
  video_description: string;
};

type ResponseRow = { prompt_type: string; response_text: string };

const Lesson = () => {
  const { weekNumber } = useParams();
  const week = parseInt(weekNumber || "1", 10);
  const nav = useNavigate();
  const { user, isStaff } = useAuth();
  const [audience, setAudience] = useState<"Adult" | "Teen" | "Child">("Adult");
  const [session, setSession] = useState<Session | null>(null);
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [savedResponses, setSavedResponses] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [renderedMp4, setRenderedMp4] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, u, r, c, w] = await Promise.all([
        db.from("mindcast_live_sessions_public").select("*").eq("week_number", week).eq("audience", audience).maybeSingle(),
        // Staff bypass — skip unlocked_lessons check, all weeks are unlocked
        isStaff ? Promise.resolve({ data: null }) : db.from("unlocked_lessons").select("week_number").eq("user_id", user.id),
        db.from("session_responses")
          .select("prompt_type, response_text")
          .eq("user_id", user.id)
          .eq("week_number", week)
          .eq("audience_type", audience),
        db.from("lesson_completions")
          .select("week_number")
          .eq("user_id", user.id)
          .eq("week_number", week)
          .maybeSingle(),
        db.from("worksheets")
          .select("video_mp4_url")
          .eq("week_number", week)
          .eq("audience_type", audience)
          .maybeSingle(),
      ]);
      setSession(s.data);
      // Staff: bypass unlock check, always unlocked
      if (isStaff) {
        setIsUnlocked(true);
        const allWeeks: number[] = [];
        for (let i = 1; i <= 52; i++) allWeeks.push(i);
        setUnlocked(allWeeks);
      } else {
        const ids = (u.data || []).map(r => r.week_number).sort((a: number, b: number) => a - b);
        setUnlocked(ids);
        setIsUnlocked(ids.includes(week));
      }
      const responseMap: Record<string, string> = {};
      (r.data || []).forEach((row: ResponseRow) => { responseMap[row.prompt_type] = row.response_text; });
      setSavedResponses(responseMap);
      setCompleted(!!c.data);
      setRenderedMp4(w.data?.video_mp4_url || null);
    })();
  }, [week, audience, user, isStaff]);

  if (isUnlocked === false) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6 text-center">
        <div>
          <Lock className="mx-auto text-[hsl(var(--navy-mid))]/40 mb-4" size={32} />
          <h1 className="font-display text-4xl text-[hsl(var(--navy))] tracking-wider mb-2">LOCKED</h1>
          <p className="text-[hsl(var(--navy-mid))] font-body text-sm mb-6">This lesson unlocks after the live session.</p>
          <Link to="/mindcast-live/library" className="text-[hsl(var(--blue))] font-body text-sm tracking-widest uppercase">← Back to library</Link>
        </div>
      </div>
    );
  }

  if (!session) return <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center text-[hsl(var(--navy-mid))] text-xs tracking-widest font-body animate-pulse">LOADING...</div>;

  const ytId = session.video_link?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/)?.[1];
  const prevWeek = [...unlocked].reverse().find(w => w < week);
  const nextWeek = unlocked.find(w => w > week);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await db.from("lesson_completions")
      .upsert({ user_id: user.id, week_number: week, audience_type: audience }, { onConflict: "user_id,week_number" });
    setSubmitting(false);
    if (error) { toast({ title: "Could not mark complete", description: error.message }); return; }
    setCompleted(true);
    toast({ title: "Worksheet submitted" });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/mindcast-live/library" className="text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] text-xs font-body tracking-widest uppercase">← Library</Link>
          <div className="flex gap-1">
            {(["Adult","Teen","Child"] as const).map(a => (
              <button key={a} onClick={() => setAudience(a)}
                className={`px-3 py-1 text-[10px] font-body tracking-widest uppercase rounded-sm ${audience === a ? "bg-[hsl(var(--blue))] text-white" : "bg-white border border-[hsl(var(--warm-border))] text-[hsl(var(--navy-mid))]"}`}>{a}</button>
            ))}
          </div>
        </div>

        <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-2">Week {week}</p>
        <h1 className="font-display text-5xl md:text-6xl text-[hsl(var(--navy))] tracking-wider mb-2">{session.theme_title.toUpperCase()}</h1>
        <p className="font-serif italic text-[hsl(var(--navy-mid))] text-xl mb-6">{session.session_title}</p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button onClick={() => downloadWorksheetPdf({ ...session, audience })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--navy))] text-[hsl(var(--ivory))] text-[11px] font-body tracking-widest uppercase rounded-sm hover:opacity-90">
            <Download size={13} /> Download Worksheet
          </button>
          <button onClick={async () => {
            try {
              const { data, error } = await supabase.functions.invoke("buy-worksheet", { body: { week_number: week, audience } });
              if (error) throw error;
              if (data?.url) window.open(data.url, "_blank");
            } catch (e) {
              toast({ title: "Couldn't start checkout", description: (e as Error).message });
            }
          }} className="inline-flex items-center gap-2 px-4 py-2 border border-[hsl(var(--bronze))] text-[hsl(var(--bronze))] text-[11px] font-body tracking-widest uppercase rounded-sm hover:bg-[hsl(var(--bronze))]/10">
            <ShoppingCart size={13} /> Buy Printed Copy · $5 NZD
          </button>
          {completed && (
            <span className="flex items-center gap-1.5 text-[hsl(var(--blue))] text-[11px] font-body tracking-widest uppercase ml-1">
              <Check size={13} />Completed
            </span>
          )}
        </div>

        {ytId && (
          <div className="aspect-video rounded-sm overflow-hidden border border-[hsl(var(--warm-border))] mb-8">
            <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        )}

        <Section title="The Signal">
          {renderedMp4 && (
            <div className="aspect-video rounded-sm overflow-hidden border border-[hsl(var(--warm-border))] mb-4 bg-black">
              <video src={renderedMp4} controls className="w-full h-full" />
            </div>
          )}
          <p className="font-serif italic text-xl text-[hsl(var(--navy))] leading-snug">"{session.signal_metaphor}"</p>
        </Section>

        <Section title="Core Concept">
          <div className="space-y-3 text-[hsl(var(--navy))]/90 font-body leading-relaxed">
            {session.core_concept.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Section>

        <Section title="Reflection">
          <p className="font-serif italic text-lg text-[hsl(var(--navy))] mb-3">"{session.journaling_prompt}"</p>
          <SupabaseTextarea
            placeholder="Your reflection..."
            initialValue={savedResponses["reflection"] || ""}
            onSave={(value) => persistResponse({ user, week, audience, promptType: "reflection", value })}
          />
        </Section>

        <Section title="Weekly Practice">
          {[
            { d: "Monday", t: session.weekly_practice_mon, key: "practice_mon" },
            { d: "Wednesday", t: session.weekly_practice_wed, key: "practice_wed" },
            { d: "Sunday", t: session.weekly_practice_sun, key: "practice_sun" },
          ].map(({ d, t, key }) => (
            <PracticeRow
              key={d}
              day={d}
              text={t}
              done={savedResponses[key] === "done"}
              onToggle={(done) => persistResponse({ user, week, audience, promptType: key, value: done ? "done" : "" })}
            />
          ))}
        </Section>

        <div className="border border-[hsl(var(--bronze))]/40 rounded-sm p-6 bg-gradient-to-br from-[hsl(var(--bronze))]/5 to-transparent text-center my-8">
          <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-2">Affirmation</p>
          <p className="font-serif italic text-2xl text-[hsl(var(--navy))]">"{session.core_affirmation}"</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || completed}
          className="w-full bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] disabled:opacity-40 text-white font-body text-sm tracking-widest uppercase py-3 rounded-sm transition-colors"
        >
          {completed ? "Submitted" : submitting ? "Submitting…" : "Mark worksheet complete"}
        </button>

        <div className="flex items-center justify-between mt-12 pt-6 border-t border-[hsl(var(--warm-border))]">
          <button onClick={() => prevWeek && nav(`/mindcast-live/lesson/${prevWeek}`)} disabled={!prevWeek}
            className="flex items-center gap-2 text-xs font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] disabled:opacity-30">
            <ChevronLeft size={14} />Previous lesson
          </button>
          <button onClick={() => nextWeek && nav(`/mindcast-live/lesson/${nextWeek}`)} disabled={!nextWeek}
            className="flex items-center gap-2 text-xs font-body tracking-widest uppercase text-[hsl(var(--navy-mid))] hover:text-[hsl(var(--navy))] disabled:opacity-30">
            Next lesson<ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const persistResponse = async ({ user, week, audience, promptType, value }: {
  user: { id: string } | null;
  week: number;
  audience: string;
  promptType: string;
  value: string;
}) => {
  if (!user) return;
  await db.from("session_responses").upsert({
    user_id: user.id,
    session_code: `LESSON-${week}`,
    week_number: week,
    audience_type: audience,
    prompt_type: promptType,
    response_text: value,
    display_name: "Member",
    is_public: false,
    show_name: false,
  }, { onConflict: "user_id,week_number,audience_type,prompt_type" });
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-3">{title}</p>
    {children}
  </div>
);

const SupabaseTextarea = ({ initialValue, placeholder, onSave }: {
  initialValue: string;
  placeholder: string;
  onSave: (value: string) => Promise<void> | void;
}) => {
  const [val, setVal] = useState(initialValue);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => { setVal(initialValue); }, [initialValue]);

  // Debounced save: 600ms after the user stops typing.
  useEffect(() => {
    if (val === initialValue) return;
    const t = setTimeout(async () => {
      await onSave(val);
      setSavedAt(Date.now());
    }, 600);
    return () => clearTimeout(t);
  }, [val]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-3 bg-white border border-[hsl(var(--warm-border))] rounded-sm font-body text-[hsl(var(--navy))] resize-none focus:outline-none focus:border-[hsl(var(--blue))]"
      />
      {savedAt && (
        <p className="text-[10px] text-[hsl(var(--navy-mid))]/50 font-body tracking-widest uppercase mt-1">Saved</p>
      )}
    </div>
  );
};

const PracticeRow = ({ day, text, done, onToggle }: {
  day: string;
  text: string;
  done: boolean;
  onToggle: (done: boolean) => void;
}) => {
  const [local, setLocal] = useState(done);
  useEffect(() => { setLocal(done); }, [done]);
  return (
    <div className="flex gap-3 items-start py-3 border-b border-[hsl(var(--warm-border))] last:border-0">
      <button
        onClick={() => { const n = !local; setLocal(n); onToggle(n); }}
        className={`mt-1 w-5 h-5 rounded-sm border-2 shrink-0 flex items-center justify-center ${local ? "bg-[hsl(var(--blue))] border-[hsl(var(--blue))]" : "border-[hsl(var(--warm-border))]"}`}
      >
        {local && <span className="text-white text-xs">✓</span>}
      </button>
      <div className="flex-1">
        <p className="font-display text-sm text-[hsl(var(--blue))] tracking-widest">{day.toUpperCase()}</p>
        <p className={`font-body text-sm leading-relaxed ${local ? "text-[hsl(var(--navy-mid))]/50 line-through" : "text-[hsl(var(--navy))]"}`}>{text}</p>
      </div>
    </div>
  );
};

export default Lesson;
