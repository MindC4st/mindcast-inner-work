import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Session = {
  week_number: number;
  theme_title: string;
  session_title: string;
  core_concept: string;
  signal_metaphor: string;
  journaling_prompt: string;
  weekly_practice_mon: string;
  weekly_practice_wed: string;
  weekly_practice_sun: string;
  core_affirmation: string;
  video_link: string;
  video_description: string;
};

const Lesson = () => {
  const { weekNumber } = useParams();
  const week = parseInt(weekNumber || "1", 10);
  const nav = useNavigate();
  const [audience, setAudience] = useState<"Adult" | "Teen" | "Child">("Adult");
  const [session, setSession] = useState<Session | null>(null);
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const [s, u] = await Promise.all([
        (supabase as any).from("mindcast_live_sessions").select("*").eq("week_number", week).eq("audience", audience).maybeSingle(),
        (supabase as any).from("unlocked_lessons").select("week_number"),
      ]);
      setSession(s.data);
      const ids = (u.data || []).map((r: any) => r.week_number).sort((a: number, b: number) => a - b);
      setUnlocked(ids);
      setIsUnlocked(ids.includes(week));
    })();
  }, [week, audience]);

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
        <p className="font-serif italic text-[hsl(var(--navy-mid))] text-xl mb-8">{session.session_title}</p>

        {ytId && (
          <div className="aspect-video rounded-sm overflow-hidden border border-[hsl(var(--warm-border))] mb-8">
            <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        )}

        <Section title="The Signal">
          <p className="font-serif italic text-xl text-[hsl(var(--navy))] leading-snug">"{session.signal_metaphor}"</p>
        </Section>

        <Section title="Core Concept">
          <div className="space-y-3 text-[hsl(var(--navy))]/90 font-body leading-relaxed">
            {session.core_concept.split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Section>

        <Section title="Reflection">
          <p className="font-serif italic text-lg text-[hsl(var(--navy))] mb-3">"{session.journaling_prompt}"</p>
          <SaveTextarea storageKey={`mc_reflection_${week}_${audience}`} placeholder="Your reflection..." />
        </Section>

        <Section title="Weekly Practice">
          {[
            { d: "Monday", t: session.weekly_practice_mon },
            { d: "Wednesday", t: session.weekly_practice_wed },
            { d: "Sunday", t: session.weekly_practice_sun },
          ].map(({ d, t }) => <PracticeRow key={d} day={d} text={t} week={week} />)}
        </Section>

        <div className="border border-[hsl(var(--bronze))]/40 rounded-sm p-6 bg-gradient-to-br from-[hsl(var(--bronze))]/5 to-transparent text-center my-8">
          <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-2">Affirmation</p>
          <p className="font-serif italic text-2xl text-[hsl(var(--navy))]">"{session.core_affirmation}"</p>
        </div>

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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-3">{title}</p>
    {children}
  </div>
);

const SaveTextarea = ({ storageKey, placeholder }: { storageKey: string; placeholder: string }) => {
  const [val, setVal] = useState(() => localStorage.getItem(storageKey) || "");
  return (
    <textarea value={val} onChange={e => { setVal(e.target.value); localStorage.setItem(storageKey, e.target.value); }}
      placeholder={placeholder} rows={4}
      className="w-full px-4 py-3 bg-white border border-[hsl(var(--warm-border))] rounded-sm font-body text-[hsl(var(--navy))] resize-none focus:outline-none focus:border-[hsl(var(--blue))]" />
  );
};

const PracticeRow = ({ day, text, week }: { day: string; text: string; week: number }) => {
  const key = `mc_practice_${week}_${day}`;
  const [done, setDone] = useState(() => localStorage.getItem(key) === "1");
  return (
    <div className="flex gap-3 items-start py-3 border-b border-[hsl(var(--warm-border))] last:border-0">
      <button onClick={() => { const n = !done; setDone(n); localStorage.setItem(key, n ? "1" : "0"); }}
        className={`mt-1 w-5 h-5 rounded-sm border-2 shrink-0 flex items-center justify-center ${done ? "bg-[hsl(var(--blue))] border-[hsl(var(--blue))]" : "border-[hsl(var(--warm-border))]"}`}>
        {done && <span className="text-white text-xs">✓</span>}
      </button>
      <div className="flex-1">
        <p className="font-display text-sm text-[hsl(var(--blue))] tracking-widest">{day.toUpperCase()}</p>
        <p className={`font-body text-sm leading-relaxed ${done ? "text-[hsl(var(--navy-mid))]/50 line-through" : "text-[hsl(var(--navy))]"}`}>{text}</p>
      </div>
    </div>
  );
};

export default Lesson;
