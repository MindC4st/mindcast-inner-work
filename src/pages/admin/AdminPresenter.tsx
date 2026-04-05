import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import logoWhite from "@/assets/logo-white.png";
import { format } from "date-fns";

/* ─── helpers ─── */
function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function extractVideoId(url: string): string | null {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

/* ─── Floating Name Bubble ─── */
function FloatingNameBubble({ name, index }: { name: string; index: number }) {
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = 8 + col * 15 + (Math.sin(index * 7) * 3);
  const y = 18 + row * 12 + (Math.cos(index * 5) * 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.5 }}
      animate={{
        opacity: 1, y: 0, scale: 1,
        x: [0, Math.sin(index) * 6, 0],
      }}
      transition={{
        opacity: { duration: 0.6 },
        y: { type: "spring", damping: 20, stiffness: 100, delay: index * 0.08 },
        scale: { duration: 0.4, delay: index * 0.08 },
        x: { repeat: Infinity, duration: 6 + (index % 4), ease: "easeInOut", delay: 1 },
      }}
      style={{ position: "absolute", left: `${x}%`, top: `${y}%` }}
      className="bg-foreground/[0.06] backdrop-blur-sm border border-foreground/10 rounded-full px-5 py-2.5"
    >
      <p className="text-foreground/80 text-sm font-medium whitespace-nowrap">{name}</p>
    </motion.div>
  );
}

/* ─── Circular Timer ─── */
function CircularTimer({ seconds, total }: { seconds: number; total: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = seconds / total;
  const color = seconds <= 10 ? "#ef4444" : seconds <= 30 ? "#f59e0b" : "#fff";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="absolute">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <span className="text-foreground font-mono text-lg font-bold">
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ─── Slide 1: Welcome ─── */
function Slide1({ session, checkins }: { session: any; checkins: any[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#0a1120" }}>
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C4526E]/[0.06] blur-[120px]" />
      </div>
      <div className="absolute top-8 left-0 right-0 flex flex-col items-center z-10">
        <img src={logoWhite} alt="Mindcast" className="h-10 mb-2" />
        <p className="font-mono text-[11px] text-foreground/25 uppercase tracking-widest">
          Week {session.session_number} · {session.session_date ? format(new Date(session.session_date), "d MMM yyyy") : ""}
        </p>
      </div>
      <div className="absolute bottom-24 left-8 z-10">
        <p className="font-mono text-[10px] text-foreground/20 uppercase tracking-widest mb-1">Join on your phone</p>
        <p className="font-mono text-2xl font-bold text-foreground/40 tracking-widest">{session.session_code}</p>
        <p className="font-mono text-[10px] text-foreground/15 mt-0.5">mindcast.co.nz/join</p>
      </div>
      <div className="absolute bottom-24 right-8 text-right z-10">
        <p className="text-5xl font-bold text-foreground">{checkins.length}</p>
        <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-wide">here tonight</p>
      </div>
      <AnimatePresence>
        {checkins.filter(c => !c.is_anonymous).map((c, i) => (
          <FloatingNameBubble key={c.id} name={c.display_name} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Slide 2: Success Stories ─── */
function Slide2({ session, stories }: { session: any; stories: any[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#0a1120" }}>
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-[#C4A96E]/[0.08] blur-[100px]" />
      </div>
      <div className="absolute top-8 left-0 right-0 flex flex-col items-center z-10">
        <img src={logoWhite} alt="Mindcast" className="h-8 mb-3" />
        <h2 className="text-3xl font-semibold text-foreground">Last Week's Wins</h2>
        <p className="text-foreground/40 text-sm mt-1">What did you set out to do? How did it go?</p>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10">
        <div className="bg-white p-3 rounded-2xl">
          <QRCode value={`https://mindcast.co.nz/join/${session.session_code}`} size={120} />
        </div>
        <p className="font-mono text-foreground/40 text-xs uppercase tracking-widest">or type</p>
        <p className="font-mono text-2xl font-bold text-foreground/60 tracking-widest">{session.session_code}</p>
      </div>
      <div className="absolute inset-0 right-52 top-28 bottom-20 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 p-6 auto-rows-min">
          <AnimatePresence>
            {stories.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200, delay: i * 0.05 }}
                className="bg-foreground/[0.05] border border-foreground/10 rounded-2xl p-5"
              >
                {s.show_name && <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-wide mb-2">{s.display_name}</p>}
                {s.last_week_goal && <p className="text-foreground/40 text-xs italic mb-2">Goal: "{s.last_week_goal}"</p>}
                <p className="text-foreground/80 text-sm leading-relaxed">"{s.success_story}"</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute bottom-24 left-8 z-10">
        <p className="font-mono text-[10px] text-foreground/20 uppercase tracking-widest">{stories.length} stories shared tonight</p>
      </div>
    </div>
  );
}

/* ─── Slide 3: Video ─── */
function Slide3({ session, pausePoints }: { session: any; pausePoints: any[] }) {
  const [state, setState] = useState<"intro" | "playing" | "paused" | "complete">("intro");
  const [pauseIdx, setPauseIdx] = useState(0);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (state !== "paused") return;
    const iv = setInterval(() => setTimer((t) => (t <= 0 ? 0 : t - 1)), 1000);
    return () => clearInterval(iv);
  }, [state]);

  const videoId = extractVideoId(session.video_url || "");

  const triggerPause = () => {
    setState("paused");
    setTimer(120);
  };

  const resume = () => {
    setPauseIdx((i) => i + 1);
    setState(pauseIdx + 1 >= pausePoints.length ? "complete" : "playing");
  };

  if (state === "intro") return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "#0a1120" }}>
      <p className="font-mono text-[11px] text-foreground/30 uppercase tracking-widest mb-4">This week's source</p>
      <h2 className="text-4xl font-semibold text-foreground mb-2 text-center max-w-2xl">{session.video_title || session.title}</h2>
      <p className="text-foreground/40 text-sm mb-10">{pausePoints.length} reflection moments</p>
      <button onClick={() => setState("playing")} className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-lg">Begin →</button>
    </div>
  );

  if (state === "paused") return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "#0a1120" }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-[#9B89B4]/[0.12] blur-[80px]" />
      </div>
      <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest mb-6 z-10">Pause · Moment {pauseIdx + 1} of {pausePoints.length}</p>
      <h2 className="text-3xl font-semibold text-foreground text-center max-w-2xl leading-snug mb-8 z-10">{pausePoints[pauseIdx]?.question_text}</h2>
      <p className="text-foreground/30 text-sm mb-8 z-10">Open your app to respond</p>
      <div className="z-10 mb-8"><CircularTimer seconds={timer} total={120} /></div>
      <button onClick={resume} className="z-10 bg-foreground/10 hover:bg-foreground/20 border border-foreground/20 text-foreground px-6 py-3 rounded-xl font-mono text-sm">Resume video →</button>
    </div>
  );

  return (
    <div className="absolute inset-0" style={{ background: "#000" }}>
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 opacity-40">
        <img src={logoWhite} alt="" className="h-5" />
        <span className="font-mono text-[9px] text-foreground/60 uppercase tracking-widest">Week {session.session_number}</span>
      </div>
      {videoId && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      )}
      {state === "playing" && pauseIdx < pausePoints.length && (
        <div className="absolute bottom-20 right-8 z-20">
          <button onClick={triggerPause} className="bg-black/60 backdrop-blur text-foreground px-4 py-2.5 rounded-xl text-xs font-mono border border-foreground/10 hover:bg-black/80">
            Pause & show Q{pauseIdx + 1} →
          </button>
        </div>
      )}
      <div className="absolute bottom-6 left-8 right-8 flex items-center gap-2 z-20">
        {pausePoints.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < pauseIdx ? "bg-foreground/60" : i === pauseIdx ? "bg-white animate-pulse" : "bg-foreground/15"}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Slide 4: Reflect ─── */
function Slide4({ session }: { session: any }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "#0a1120" }}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[500px] h-[500px] rounded-full bg-[#9B89B4] blur-[120px]" />
      </motion.div>
      <img src={logoWhite} alt="" className="h-12 mb-10 opacity-60 z-10" />
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl font-semibold text-foreground text-center mb-4 z-10">Reflect.</motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-foreground/40 text-xl text-center mb-12 z-10">Open your workbook and take 10 minutes.</motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex flex-col items-center gap-3 z-10">
        <div className="bg-foreground/[0.06] border border-foreground/10 rounded-2xl p-4">
          <QRCode value={`https://mindcast.co.nz/join/${session.session_code}`} size={100} bgColor="transparent" fgColor="rgba(255,255,255,0.5)" />
        </div>
        <p className="font-mono text-[10px] text-foreground/20 uppercase tracking-widest">Open your workbook</p>
      </motion.div>
      <div className="absolute bottom-28 font-mono text-[10px] text-foreground/15 uppercase tracking-widest">
        Week {session.session_number} · {session.title}
      </div>
    </div>
  );
}

/* ─── Slide 5: Word Cloud ─── */
function Slide5({ session, words }: { session: any; words: any[] }) {
  const wordCounts = words.reduce((acc: any, { word }: any) => {
    const w = word.toLowerCase();
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(wordCounts).sort(([, a]: any, [, b]: any) => b - a).map(([word, count]) => ({ word, count: count as number }));
  const maxCount = sorted[0]?.count || 1;
  const COLOURS = ["#fff", "rgba(255,255,255,0.8)", "#C4526E", "#9B89B4", "#C4A96E", "#C47A8A", "rgba(255,255,255,0.6)"];

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#0a1120" }}>
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#C4526E]/[0.05] blur-[150px]" />
      </div>
      <div className="absolute top-8 left-0 right-0 flex flex-col items-center z-10">
        <img src={logoWhite} alt="" className="h-8 mb-3" />
        <p className="font-mono text-[11px] text-foreground/25 uppercase tracking-widest">How we're leaving tonight</p>
      </div>
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence>
          {sorted.map(({ word, count }, i) => {
            const fontSize = 16 + ((count / maxCount) * 56);
            const colour = COLOURS[i % COLOURS.length];
            const angle = i * 137.5 * (Math.PI / 180);
            const radius = Math.sqrt(i) * 60;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: i * 0.04 }}
                style={{
                  position: "absolute", fontSize: `${fontSize}px`, color: colour,
                  fontWeight: count > maxCount * 0.7 ? 700 : count > maxCount * 0.4 ? 500 : 400,
                  transform: `translate(${x}px, ${y}px)`, whiteSpace: "nowrap", lineHeight: 1.2,
                }}
              >
                {word}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-24 right-8 flex flex-col items-center gap-2 z-10">
        <div className="bg-foreground/[0.06] border border-foreground/10 rounded-xl p-3">
          <QRCode value={`https://mindcast.co.nz/join/${session.session_code}`} size={80} bgColor="transparent" fgColor="rgba(255,255,255,0.5)" />
        </div>
        <p className="font-mono text-[9px] text-foreground/20 uppercase tracking-widest">Add your word</p>
      </div>
      <div className="absolute bottom-24 left-8 z-10">
        <p className="text-4xl font-bold text-foreground/20">{words.length}</p>
        <p className="font-mono text-[9px] text-foreground/15 uppercase tracking-widest">words shared</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/* ─── MAIN PRESENTER ─── */
/* ═══════════════════════════════════════════════════ */

const AdminPresenter = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [words, setWords] = useState<any[]>([]);
  const [pausePoints, setPausePoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load session
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: sess } = await supabase.from("sessions").select("*").eq("id", id).single();
      if (sess) {
        // Generate session code if missing
        if (!sess.session_code) {
          const code = generateSessionCode();
          await supabase.from("sessions").update({ session_code: code, active_slide: 1 } as any).eq("id", id);
          setSession({ ...sess, session_code: code, active_slide: 1 });
        } else {
          setSession(sess);
          setCurrentSlide(sess.active_slide || 1);
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Load pause points
  useEffect(() => {
    if (!id) return;
    supabase.from("session_pause_points").select("*").eq("session_id", id).order("position")
      .then(({ data }) => setPausePoints(data || []));
  }, [id]);

  // Realtime: checkins
  useEffect(() => {
    if (!id) return;
    supabase.from("check_ins").select("*").eq("session_id", id).order("checked_in_at").then(({ data }) => setCheckins(data || []));
    const channel = supabase.channel("checkins-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "check_ins" }, (payload) => {
      if ((payload.new as any).session_id === id) setCheckins((c) => [...c, payload.new]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Realtime: stories
  useEffect(() => {
    if (!id) return;
    supabase.from("story_submissions").select("*").eq("session_id", id).eq("status", "approved").order("created_at")
      .then(({ data }) => setStories(data || []));
    const channel = supabase.channel("stories-rt").on("postgres_changes", { event: "*", schema: "public", table: "story_submissions" }, (payload) => {
      const row = payload.new as any;
      if (row.session_id === id && row.status === "approved") {
        setStories((s) => {
          if (s.some((x) => x.id === row.id)) return s.map((x) => (x.id === row.id ? row : x));
          return [...s, row];
        });
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Realtime: words
  useEffect(() => {
    if (!id) return;
    supabase.from("word_submissions").select("*").eq("session_id", id).order("created_at")
      .then(({ data }) => setWords(data || []));
    const channel = supabase.channel("words-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "word_submissions" }, (payload) => {
      if ((payload.new as any).session_id === id) setWords((w) => [...w, payload.new]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const goToSlide = useCallback(async (n: number) => {
    setCurrentSlide(n);
    if (id) await supabase.from("sessions").update({ active_slide: n } as any).eq("id", id);
  }, [id]);

  const prevSlide = () => goToSlide(Math.max(1, currentSlide - 1));
  const nextSlide = () => goToSlide(Math.min(5, currentSlide + 1));

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); nextSlide(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide]);

  if (loading || !session) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0a1120" }}>
      <span className="text-foreground/30 text-xs animate-pulse tracking-widest">LOADING...</span>
    </div>
  );

  const renderSlide = () => {
    switch (currentSlide) {
      case 1: return <Slide1 session={session} checkins={checkins} />;
      case 2: return <Slide2 session={session} stories={stories} />;
      case 3: return <Slide3 session={session} pausePoints={pausePoints} />;
      case 4: return <Slide4 session={session} />;
      case 5: return <Slide5 session={session} words={words} />;
      default: return <Slide1 session={session} checkins={checkins} />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#0a1120" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          {renderSlide()}
        </motion.div>
      </AnimatePresence>

      {/* Presenter controls */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-xl border-t border-foreground/[0.06] z-50">
        <div className="flex items-center gap-4">
          <img src={logoWhite} alt="" className="h-5 opacity-40" />
          <span className="font-mono text-[10px] text-foreground/30 uppercase tracking-widest">
            Week {session.session_number} · {session.session_code}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                currentSlide === i ? "w-6 h-2 bg-white" : "w-2 h-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevSlide} className="text-foreground/30 hover:text-foreground/70 transition-colors text-sm font-mono">← Prev</button>
          <button onClick={nextSlide} className="bg-foreground/10 hover:bg-foreground/20 text-foreground font-mono text-sm px-5 py-2 rounded-lg transition-colors">Next →</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPresenter;
