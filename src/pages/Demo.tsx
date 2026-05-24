import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Custom Mindcast-style SVG icons ────────────────────────────────────────
const stroke = "currentColor";
const sw = 1.25;

const IconStillness = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="20" r="6" />
    <path d="M16 52c2-9 8-14 16-14s14 5 16 14" />
    <path d="M8 32h8M48 32h8" opacity="0.4" />
  </svg>
);
const IconSignal = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="3" />
    <path d="M22 22a14 14 0 0 0 0 20M42 22a14 14 0 0 1 0 20" />
    <path d="M14 14a26 26 0 0 0 0 36M50 14a26 26 0 0 1 0 36" opacity="0.55" />
  </svg>
);
const IconSpark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="5" />
    <path d="M32 12v8M32 44v8M12 32h8M44 32h8M18 18l5 5M41 41l5 5M46 18l-5 5M23 41l-5 5" />
  </svg>
);
const IconPause = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="32" r="22" />
    <path d="M26 24v16M38 24v16" />
    <path d="M32 4v4M32 56v4" opacity="0.4" />
  </svg>
);
const IconSunrise = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 46h48" />
    <path d="M20 46a12 12 0 0 1 24 0" />
    <path d="M32 22v6M14 32l4 3M50 32l-4 3" />
  </svg>
);
const IconConnect = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="32" r="5" />
    <circle cx="46" cy="32" r="5" />
    <path d="M23 32h18" />
    <path d="M10 32H6M58 32h-4" opacity="0.4" />
  </svg>
);
const IconReturn = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M52 32a20 20 0 1 1-6-14" />
    <path d="M46 10v10h-10" />
  </svg>
);
const IconSlides = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="14" width="44" height="28" rx="2" />
    <path d="M18 50h28M22 22h20M22 30h14" />
  </svg>
);
const IconBroadcast = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="32" cy="40" r="4" />
    <path d="M24 30a10 10 0 0 1 16 0M18 24a18 18 0 0 1 28 0M12 18a26 26 0 0 1 40 0" />
    <path d="M32 44v8" />
  </svg>
);
const IconGrid = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="10" width="18" height="18" rx="1" />
    <rect x="36" y="10" width="18" height="18" rx="1" opacity="0.4" />
    <rect x="10" y="36" width="18" height="18" rx="1" opacity="0.4" />
    <rect x="36" y="36" width="18" height="18" rx="1" />
  </svg>
);
const IconWorksheet = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8h22l10 10v38a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" />
    <path d="M38 8v10h10" />
    <path d="M20 34h24M20 42h18" />
  </svg>
);
const IconArcs = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 44a18 18 0 0 1 36 0" />
    <path d="M20 44a12 12 0 0 1 24 0" opacity="0.7" />
    <path d="M26 44a6 6 0 0 1 12 0" opacity="0.5" />
  </svg>
);
const IconYearArc = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d="M32 8a24 24 0 1 1-17 7" />
    <circle cx="32" cy="8" r="2" fill="currentColor" />
  </svg>
);
const IconArrow = ({ className = "", dir = "right" }: { className?: string; dir?: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    {dir === "right" ? <path d="M5 12h14M13 6l6 6-6 6" /> : <path d="M19 12H5M11 6l-6 6 6 6" />}
  </svg>
);

// ─── Signal wave background ─────────────────────────────────────────────────
const SignalWaves = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 600">
    <defs>
      <linearGradient id="wg" x1="0" x2="1">
        <stop offset="0" stopColor="hsl(200,50%,45%)" stopOpacity="0" />
        <stop offset="0.5" stopColor="hsl(200,50%,45%)" stopOpacity="0.5" />
        <stop offset="1" stopColor="hsl(200,50%,45%)" stopOpacity="0" />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.path
        key={i}
        d={`M0 ${250 + i * 25} Q 360 ${200 + i * 20} 720 ${250 + i * 25} T 1440 ${250 + i * 25}`}
        stroke="url(#wg)"
        strokeWidth="1"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 - i * 0.05 }}
        transition={{ duration: 4 + i, delay: i * 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    ))}
  </svg>
);

// ─── Slide content ──────────────────────────────────────────────────────────
type Slide = { label: string; kind: "signal" | "opening" | "reflection" | "activity" | "affirmation"; body: string; sub?: string };

const slidesByTab: Record<"Adult" | "Teen" | "Child", Slide[]> = {
  Adult: [
    { label: "The Signal — Week 3", kind: "signal", body: "Every system has a feedback loop. Most of ours are so fast we do not even know they are happening. But the loop can be interrupted — not by force, but by awareness. Awareness is the pause button." },
    { label: "Opening", kind: "opening", body: "Think of a behaviour you keep repeating that you would genuinely like to change. Not something shameful — just a pattern. Something you do and then think: why did I do that again?", sub: "Room discussion — hold here" },
    { label: "Live Reflection", kind: "reflection", body: "Describe a recent moment when a familiar pattern ran. What triggered it? What were you feeling just before?" },
    { label: "This week's affirmation", kind: "affirmation", body: "I am bigger than my patterns. I can see them. I can pause. And in that pause, I choose.", sub: "Take a moment with it" },
  ],
  Teen: [
    { label: "The Signal — Week 3", kind: "signal", body: "Think of your brain like a group chat that is constantly running. Most of the time you are not consciously reading every message. The pattern interrupt is when you actually open the chat and decide what to respond to — and what to let pass." },
    { label: "Opening", kind: "opening", body: "Raise your hand if you have ever sent a message, said something, or walked away from a situation and immediately thought: I should not have done that. What does that feel like?", sub: "Room discussion — hold here" },
    { label: "Live Reflection", kind: "reflection", body: "What is one automatic reaction you have that you would like to pause before it runs? What do you think it is actually protecting?" },
    { label: "This week's affirmation", kind: "affirmation", body: "I am not my reactions. I am the one who notices them — and that means I have a choice.", sub: "Take a moment with it" },
  ],
  Child: [
    { label: "The Signal — Week 3", kind: "signal", body: "You know the remote control for the TV? It has a pause button. Your brain has one too — it just takes practice to find it. Today we find it." },
    { label: "Opening", kind: "opening", body: "Has anyone ever said or done something and then straight away wished they had not? Tell me what that feels like in your body. Your tummy? Your chest? Your face?", sub: "Room discussion — hold here" },
    { label: "The Pause Button", kind: "activity", body: "Everyone gets a card with a pause symbol on it. Press it to your heart. Count slowly: one, two, three. Breathe. Practise with the person beside you." },
    { label: "This week's affirmation", kind: "affirmation", body: "When I feel a big feeling, I can pause. I am in charge of what happens next.", sub: "Take a moment with it" },
  ],
};

const seedResponses: Record<"Adult" | "Teen", { text: string; name: string }[]> = {
  Adult: [
    { text: "The moment my partner's tone changes. Instantly defensive. I know it is older than this relationship.", name: "Anonymous" },
    { text: "Reaching for my phone the moment I feel bored or uncomfortable. Before I have even noticed I am doing it.", name: "Sarah" },
    { text: "When my manager cc's someone on an email. Immediate stomach drop. Every time.", name: "Anonymous" },
  ],
  Teen: [
    { text: "Getting defensive when my mum asks about school. Before she has even finished the sentence.", name: "Anonymous" },
    { text: "Saying I am fine before I have even checked whether I am.", name: "Jess" },
    { text: "Laughing things off when I am actually hurt. It is faster than explaining.", name: "Anonymous" },
  ],
};

// ─── Live response panel ────────────────────────────────────────────────────
const ResponsePanel = ({ tab }: { tab: "Adult" | "Teen" }) => {
  const [text, setText] = useState("");
  const [share, setShare] = useState(false);
  const [showName, setShowName] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<{ id: string; response_text: string; display_name: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("session_responses")
        .select("id, response_text, display_name")
        .eq("session_code", "DEMO01")
        .eq("audience_type", tab)
        .eq("is_public", true)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!cancelled) setResponses(data || []);
    })();
    const ch = supabase
      .channel(`demo-${tab}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_responses", filter: `session_code=eq.DEMO01` }, (payload: any) => {
        const r = payload.new;
        if (r.audience_type !== tab || !r.is_public || r.hidden) return;
        setResponses((p) => [{ id: r.id, response_text: r.response_text, display_name: r.display_name }, ...p]);
      })
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [tab]);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("session_responses").insert({
      session_code: "DEMO01",
      response_text: text.trim(),
      display_name: showName && name.trim() ? name.trim() : "Anonymous",
      audience_type: tab,
      week_number: 3,
      prompt_type: "journaling",
      is_public: share,
      show_name: showName,
    });
    setSubmitting(false);
    if (!error) {
      setText("");
      if (!share) {
        // give them visual confirmation even when private
        setResponses((p) => [{ id: crypto.randomUUID(), response_text: text.trim(), display_name: showName && name.trim() ? name.trim() : "Anonymous" }, ...p]);
      }
    }
  };

  const feed = [...responses, ...seedResponses[tab].map((r, i) => ({ id: `seed-${i}`, response_text: r.text, display_name: r.name }))];

  return (
    <div className="mt-8 max-w-3xl mx-auto w-full">
      <div className="border border-cream/15 bg-cream/[0.03] backdrop-blur-sm rounded-sm p-5 md:p-7">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Respond here. Anonymous by default."
          rows={3}
          className="w-full bg-transparent text-cream placeholder:text-cream/30 text-sm md:text-base font-body border-0 focus:outline-none resize-none leading-relaxed"
        />
        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center mt-4 pt-4 border-t border-cream/10">
          <label className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-cream/60 cursor-pointer">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="accent-[hsl(var(--electric))]" />
            Share on screen
          </label>
          <label className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-cream/60 cursor-pointer">
            <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="accent-[hsl(var(--electric))]" />
            Show my name
          </label>
          {showName && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="flex-1 min-w-[140px] bg-transparent border-b border-cream/20 text-cream text-sm py-1 focus:outline-none focus:border-cream/60 placeholder:text-cream/30" />
          )}
          <button
            onClick={submit}
            disabled={submitting || !text.trim()}
            className="ml-auto text-[11px] tracking-widest uppercase bg-cream text-navy px-5 py-2 font-body font-bold disabled:opacity-40 hover:bg-cream/90 transition-colors"
          >
            {submitting ? "Sending…" : "Submit"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-none">
        <AnimatePresence initial={false}>
          {feed.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="border-l-2 border-cream/20 pl-4 py-1"
            >
              <p className="text-cream/85 text-sm md:text-base font-body leading-relaxed">"{r.response_text}"</p>
              <p className="text-cream/40 text-[11px] tracking-widest uppercase mt-1 font-body">— {r.display_name || "Anonymous"}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Slide renderer ─────────────────────────────────────────────────────────
const SlideView = ({ slide, tab, slideIdx }: { slide: Slide; tab: "Adult" | "Teen" | "Child"; slideIdx: number }) => {
  const isChild = tab === "Child";
  return (
    <motion.div
      key={`${tab}-${slideIdx}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-h-[520px] md:min-h-[600px] flex flex-col px-6 md:px-16 py-12"
    >
      <p className="text-cream/40 text-[11px] tracking-[0.25em] uppercase font-body mb-10">{slide.label}</p>

      <div className="flex-1 flex items-center justify-center">
        {slide.kind === "opening" ? (
          <div className="max-w-3xl text-center">
            <p className="font-serif italic text-2xl md:text-4xl leading-snug" style={{ color: "hsl(200,70%,72%)" }}>
              {slide.body}
            </p>
            {slide.sub && <p className="text-cream/40 text-[11px] tracking-[0.25em] uppercase mt-8 font-body">{slide.sub}</p>}
          </div>
        ) : slide.kind === "affirmation" ? (
          <div className="max-w-3xl text-center">
            <p className="font-serif text-3xl md:text-5xl leading-tight text-cream">{slide.body}</p>
            {slide.sub && <p className="text-cream/40 text-[11px] tracking-[0.25em] uppercase mt-10 font-body">{slide.sub}</p>}
          </div>
        ) : slide.kind === "activity" ? (
          <div className="max-w-2xl w-full border border-cream/15 bg-cream/[0.03] rounded-sm p-10 text-center">
            <IconPause className="w-20 h-20 mx-auto text-cream/80 mb-6" />
            <h3 className="font-display text-3xl md:text-4xl text-cream tracking-wide mb-5">{slide.label}</h3>
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed">{slide.body}</p>
          </div>
        ) : slide.kind === "reflection" ? (
          <div className="w-full max-w-3xl">
            <p className={`text-center font-serif ${isChild ? "text-2xl md:text-3xl" : "text-xl md:text-3xl"} leading-snug text-cream`}>{slide.body}</p>
            {tab !== "Child" && <ResponsePanel tab={tab as "Adult" | "Teen"} />}
          </div>
        ) : (
          <div className="max-w-3xl text-center">
            <p className={`${isChild ? "text-xl md:text-3xl" : "text-lg md:text-2xl"} leading-relaxed text-cream/90 font-body font-light`}>
              {slide.body}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Main page ──────────────────────────────────────────────────────────────
const tiles = [
  { Icon: IconSlides, title: "Facilitator Deck", body: "13 slides per session. Full-screen presentation mode. Progressive reveal, session timer, facilitator notes drawer, and audience toggle." },
  { Icon: IconBroadcast, title: "Live Audience Response", body: "Audience members join on their own device. Responses appear on the facilitator's screen in real time. Anonymous by default. Opt-in to share name." },
  { Icon: IconGrid, title: "Lesson Library", body: "52 sessions unlock after each live gathering. Members access video, reflection tools, and their saved responses in their personal portal." },
  { Icon: IconWorksheet, title: "Session Worksheets", body: "A printable worksheet for every session. Available to purchase at the door and as a member portal download after each session." },
  { Icon: IconArcs, title: "Three Streams", body: "Every theme has three versions — adult, teen, and child. The same session, the right depth. Switch with one tap in the facilitator view." },
  { Icon: IconYearArc, title: "A 52-Week Arc", body: "Four phases across the year. See Clearly. Unlearn. Rebuild. Live It. A complete practice — not a course, not a programme. A year of genuine inner work." },
];

const phases = [
  { num: 1, name: "See Clearly", weeks: "Weeks 1 – 13", line: "Awareness. Patterns. The stories we carry.", themes: "The Signal and the Noise · The Stories We Carry · The Pattern Interrupt · The Inner Critic · Emotions as Data · The Wounds We Carry · The Masks We Wear", bg: "hsl(210, 56%, 14%)", text: "hsl(30,100%,98%)" },
  { num: 2, name: "Unlearn", weeks: "Weeks 14 – 26", line: "Releasing. Forgiving. Rewiring.", themes: "The Permission You Are Still Waiting For · Letting Go of Who You Were Supposed to Be · Forgiving Yourself · Breaking the People-Pleasing Pattern · Setting Down the Armour · Grief and Growth", bg: "hsl(207, 53%, 23%)", text: "hsl(30,100%,98%)" },
  { num: 3, name: "Rebuild", weeks: "Weeks 27 – 39", line: "Identity. Values. New habits.", themes: "Who Are You Now? · What Do You Actually Value? · The Habits That Build You · Your Body as Foundation · Purpose · The Community You Build", bg: "hsl(200, 50%, 38%)", text: "hsl(30,100%,98%)" },
  { num: 4, name: "Live It", weeks: "Weeks 40 – 52", line: "Integration. Contribution. Legacy.", themes: "From Self-Development to Service · The Courage to Be Seen · Conflict as a Growth Practice · Generosity as a Way of Being · A Year of Becoming", bg: "hsl(200, 70%, 72%)", text: "hsl(210,56%,14%)" },
];

const Demo = () => {
  const [tab, setTab] = useState<"Adult" | "Teen" | "Child">("Adult");
  const [slideIdx, setSlideIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [joinErr, setJoinErr] = useState("");

  const slides = slidesByTab[tab];
  useEffect(() => setSlideIdx(0), [tab]);

  const next = () => setSlideIdx((i) => Math.min(slides.length - 1, i + 1));
  const prev = () => setSlideIdx((i) => Math.max(0, i - 1));

  // swipe
  const [touchX, setTouchX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (dx < -40) next(); else if (dx > 40) prev();
    setTouchX(null);
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinErr("");
    if (!email.includes("@")) { setJoinErr("Please enter a valid email."); return; }
    const { error } = await supabase.from("waitlist" as any).insert({ email: email.trim(), source: "demo" });
    if (error) { setJoinErr("Something went wrong. Try again."); return; }
    setJoined(true);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-ivory text-navy">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="section-navy relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36">
        <SignalWaves />
        <div className="container mx-auto px-6 relative">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            className="text-cream/50 text-[11px] tracking-[0.3em] uppercase font-body mb-8 text-center"
          >
            Tune Into Your Inner Self
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl text-cream text-center leading-none tracking-tight"
          >
            A YEAR OF BECOMING.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="text-cream/70 text-base md:text-xl font-body font-light max-w-2xl mx-auto text-center mt-8 leading-relaxed"
          >
            Mindcast LIVE is a 52-week community practice — for adults, teens, and children — exploring the same themes at the same time, in their own way.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 items-center justify-center mt-12"
          >
            <a href="#demo" className="bg-cream text-navy px-10 py-4 text-[11px] tracking-[0.25em] uppercase font-body font-bold hover:bg-cream/90 transition-colors">
              Experience the Demo
            </a>
            <a href="#structure" className="text-cream/70 hover:text-cream text-[11px] tracking-[0.25em] uppercase font-body border-b border-cream/30 hover:border-cream pb-1 transition-colors">
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── STRUCTURE ────────────────────────────────────────────────── */}
      <section id="structure" className="section-cream py-24 md:py-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl text-navy text-center tracking-tight mb-6">ONE THEME. THREE ROOMS. EVERY SUNDAY.</h2>
          <p className="font-body text-navy/70 text-base md:text-lg max-w-3xl mx-auto text-center leading-relaxed mb-20">
            While adults gather in the main space for deep self-inquiry, teens meet separately for the same theme in their own language, and children explore it through story, craft, and movement. One family. One conversation at the dinner table, later.
          </p>
          <div className="grid md:grid-cols-3 gap-10 md:gap-14 max-w-6xl mx-auto">
            {[
              { Icon: IconStillness, label: "Adults", sub: "Theatre", body: "Evidence-based teaching, honest self-inquiry, guided reflection, and the kind of community that used to happen in places we no longer attend." },
              { Icon: IconSignal, label: "Teens", sub: "Conference Room", body: "Same theme, real language. Identity, patterns, values, and what it means to know yourself in a world that is constantly trying to define you." },
              { Icon: IconSpark, label: "Children", sub: "Hall", body: "Story, movement, and honest conversation at the right depth. The same questions — translated into wonder." },
            ].map((c) => (
              <div key={c.label} className="text-center">
                <c.Icon className="w-14 h-14 mx-auto text-[hsl(var(--electric))] mb-6" />
                <h3 className="font-display text-3xl text-navy tracking-wide">{c.label.toUpperCase()}</h3>
                <p className="font-body text-[11px] tracking-[0.25em] uppercase text-navy/40 mt-2 mb-5">{c.sub}</p>
                <p className="font-body text-navy/70 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ───────────────────────────────────────────────── */}
      <section id="demo" className="section-navy py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl text-cream text-center tracking-tight">THIS WEEK'S SESSION</h2>
          <p className="text-cream/50 text-[11px] tracking-[0.25em] uppercase font-body text-center mt-4">
            Week 3 — The Pattern Interrupt — Phase 1: See Clearly
          </p>

          {/* Tabs */}
          <div className="mt-14 flex justify-center gap-1 md:gap-2 border-b border-cream/10 max-w-md mx-auto">
            {(["Adult", "Teen", "Child"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 px-4 md:px-8 py-4 text-[11px] tracking-[0.25em] uppercase font-body transition-colors ${
                  tab === t ? "text-cream border-b-2 border-cream -mb-px" : "text-cream/40 hover:text-cream/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Slide */}
          <div
            className="mt-10 max-w-5xl mx-auto border border-cream/10 rounded-sm bg-[hsl(210,56%,10%)] relative overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence mode="wait">
              <SlideView slide={slides[slideIdx]} tab={tab} slideIdx={slideIdx} />
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button onClick={prev} disabled={slideIdx === 0} className="p-3 md:p-5 text-cream/40 hover:text-cream disabled:opacity-20 transition-colors">
                <IconArrow dir="left" className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button onClick={next} disabled={slideIdx === slides.length - 1} className="p-3 md:p-5 text-cream/40 hover:text-cream disabled:opacity-20 transition-colors">
                <IconArrow dir="right" className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setSlideIdx(i)} className={`h-1 transition-all ${i === slideIdx ? "w-8 bg-cream" : "w-4 bg-cream/20"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WEEKLY PRACTICE ─────────────────────────────────────────── */}
      <section className="section-cream py-24 md:py-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl text-navy text-center tracking-tight">THE WORK CONTINUES THROUGH THE WEEK.</h2>
          <p className="font-body text-navy/70 text-base md:text-lg max-w-3xl mx-auto text-center leading-relaxed mt-6 mb-20">
            Every session closes with three touchpoints — one for Monday, one for Wednesday, one for Sunday. The theme does not stay in the room.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { Icon: IconSunrise, day: "Monday", body: "Notice one moment where you are on autopilot. Do not change it. Just see it." },
              { Icon: IconConnect, day: "Wednesday", body: "Tell someone what you are learning to notice. Naming it to another person makes it more real." },
              { Icon: IconReturn, day: "Sunday", body: "Bring one example of a moment you caught a pattern before it ran. What happened?" },
            ].map((c) => (
              <div key={c.day} className="border border-navy/10 bg-card p-8 rounded-sm">
                <c.Icon className="w-10 h-10 text-[hsl(var(--electric))] mb-5" />
                <p className="font-body text-[11px] tracking-[0.25em] uppercase text-navy/40 mb-4">{c.day}</p>
                <p className="font-body text-navy/80 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
          <p className="font-body text-navy/50 text-xs text-center mt-12">
            Members receive their weekly practice in their portal and as a printable worksheet for each session.
          </p>
        </div>
      </section>

      {/* ── PLATFORM TILES ──────────────────────────────────────────── */}
      <section className="section-cream pb-24 md:pb-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl text-navy text-center tracking-tight mb-16">THE PLATFORM.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {tiles.map(({ Icon, title, body }) => (
              <div key={title} className="border border-navy/10 p-8 bg-card rounded-sm hover:border-[hsl(var(--electric))]/40 transition-colors">
                <Icon className="w-10 h-10 text-[hsl(var(--electric))] mb-5" />
                <h3 className="font-display text-2xl text-navy tracking-wide mb-3">{title.toUpperCase()}</h3>
                <p className="font-body text-navy/70 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUR PHASES ─────────────────────────────────────────────── */}
      <section className="section-cream pb-24 md:pb-32">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl text-navy text-center tracking-tight mb-16">THE YEAR.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-7xl mx-auto">
            {phases.map((p) => (
              <div key={p.num} className="p-8 rounded-sm flex flex-col min-h-[340px]" style={{ background: p.bg, color: p.text }}>
                <p className="text-[11px] tracking-[0.25em] uppercase opacity-60 font-body mb-3">Phase {p.num}</p>
                <h3 className="font-display text-3xl tracking-wide mb-2">{p.name.toUpperCase()}</h3>
                <p className="text-[11px] tracking-widest uppercase opacity-60 font-body mb-5">{p.weeks}</p>
                <p className="font-serif italic text-lg leading-snug mb-6">{p.line}</p>
                <p className="text-xs leading-relaxed opacity-75 font-body mt-auto">{p.themes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISION ──────────────────────────────────────────────────── */}
      <section className="section-navy py-32 md:py-44">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-7 font-serif text-cream text-xl md:text-3xl leading-relaxed text-center">
            <p>Most of us are living on the frequency we inherited.</p>
            <p>We absorbed our stories, our patterns, our sense of what we deserve before we were old enough to question any of it.</p>
            <p>Mindcast LIVE is the practice of tuning in.</p>
            <p>Of learning to tell the difference between the signal — your inner wisdom, your genuine values, your real responses — and the noise.</p>
            <p>This is not therapy. It is not religion. It is not a seminar.</p>
            <p>It is a community of people doing honest inner work together.</p>
            <p className="text-cream/70">Every Sunday. For a year.</p>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ─────────────────────────────────────────────── */}
      <section className="section-cream py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-xl text-center">
          <h2 className="font-display text-4xl md:text-6xl text-navy tracking-tight">LAUNCHING IN TAUPŌ, NEW ZEALAND.</h2>
          <p className="font-body text-navy/70 text-base md:text-lg leading-relaxed mt-6">
            Sundays at 10am. Adults, teens, and children at the same time, in their own spaces. A paid membership. A genuine community. Facilitated by Ashleigh Carlson.
          </p>

          {joined ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 font-serif italic text-2xl text-navy">
              You are on the list. We will be in touch.
            </motion.p>
          ) : (
            <form onSubmit={submitWaitlist} className="mt-12 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 bg-transparent border border-navy/20 text-navy px-5 py-3 text-sm font-body placeholder:text-navy/40 focus:outline-none focus:border-navy transition-colors"
              />
              <button type="submit" className="bg-navy text-cream px-8 py-3 text-[11px] tracking-[0.25em] uppercase font-body font-bold hover:bg-navy/90 transition-colors">
                Join the waitlist
              </button>
            </form>
          )}
          {joinErr && <p className="text-destructive text-xs mt-3">{joinErr}</p>}

          <a href="https://mindcast.co.nz" className="inline-block mt-10 text-navy/50 hover:text-navy text-xs tracking-widest font-body border-b border-navy/20 hover:border-navy pb-0.5 transition-colors">
            Visit mindcast.co.nz
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;
