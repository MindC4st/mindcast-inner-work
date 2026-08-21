import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Users, GraduationCap, Baby } from "lucide-react";
import heroFamily from "@/assets/home-family-workbooks.jpg";
import facilitatorRoom from "@/assets/home-facilitator-room.jpg";
import adultWorkbook from "@/assets/home-adult-workbook.jpg";
import childColouring from "@/assets/home-child-colouring.jpg";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import lifeGroup from "@/assets/home-life-group.jpg";
import founderPortrait from "@/assets/founder-portrait.jpg";
import logoNavLight from "@/assets/logo-cream.png";
import logoBlue from "@/assets/logo-blue-wordmark.png";
import howItWorksImage from "@/assets/home-adult-workbook.jpg";

// Great Lake Centre photography (Supabase assets bucket).
const GLC_FRONT_ENTRANCE = "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-frontentrance.png";
const GLC_ADULTS_ROOM = "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-adultsroom.png";
const GLC_TEENS_ROOM = "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-teensroom.png";
const GLC_KIDS_ROOM = "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-kidsroom.png";
// Rhythm section photography (Supabase assets bucket).
const HOME_THE_GATHERING = "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/homepage-thegathering.png";
const HOME_IN_THE_ROOMS = "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/homepage-intherooms.png";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import Ripple from "@/components/brand/Ripple";
import {
  Reveal,
  SectionHeading,
  GlassCard,
  GlowButton,
  StatCounter,
  ScrollProgress,
  Marquee,
} from "@/components/glow";
import { AboutContent } from "./About";
import { MembershipContent } from "./Membership";

gsap.registerPlugin(ScrollTrigger);

// Home — the one dark-canvas page. Cinematic navy (surface tokens), glass
// elevation, blue glow, scroll choreography. Every other surface in the
// product is ivory-first; this page is the night the rest of the week points
// at. All motion is transform/opacity, cleaned up per-effect, and fully
// silent under prefers-reduced-motion.

const prefersReduce = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── NAV — light theme, matches About/Membership pages ──────────────────── */

const CinematicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "ABOUT", to: "/about" },
    { label: "CURRICULUM", to: "/curriculum" },
    { label: "MEMBERSHIP", to: "/membership" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 backdrop-blur-sm border-b border-border py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" aria-label="Mindcast home">
          <img src={logoBlue} alt="Mindcast" className="h-8 md:h-9 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="text-foreground/60 hover:text-foreground text-xs font-body font-semibold tracking-[0.2em] transition-colors">
              {l.label}
            </Link>
          ))}
          <Link
            to="/portal/login"
            className="border border-primary hover:bg-primary hover:text-primary-foreground text-primary text-xs font-body font-semibold tracking-[0.2em] px-6 py-2.5 transition-colors"
          >
            MEMBER LOGIN
          </Link>
          <Link
            to="/membership"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-body font-semibold tracking-[0.2em] px-6 py-2.5 transition-colors"
          >
            BECOME A MEMBER
          </Link>
        </div>

        <button
          className="lg:hidden text-foreground w-11 h-11 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 top-14 z-40 bg-white"
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 safe-area-bottom">
            {links.map((l, i) => (
              <motion.div key={l.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link to={l.to} onClick={() => setMobileOpen(false)} className="text-foreground text-2xl font-display tracking-widest">{l.label}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col items-center gap-4">
              <Link to="/portal/login" onClick={() => setMobileOpen(false)} className="mt-4 px-10 py-4 border border-primary text-primary text-sm tracking-widest font-body min-h-[56px] flex items-center">
                MEMBER LOGIN
              </Link>
              <Link to="/membership" onClick={() => setMobileOpen(false)} className="px-10 py-4 bg-primary text-primary-foreground text-sm tracking-widest font-body min-h-[56px] flex items-center">
                BECOME A MEMBER
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

/* ── HERO — light theme, Front Entrance photo ───────────────────────────── */

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduce()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", { y: 70, opacity: 0, stagger: 0.08, duration: 0.9, delay: 0.3, ease: "power3.out" });
      gsap.to(".hero-copy", {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "70% top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const heroLines = [
    ["STOP", "CONSUMING."],
    ["START", "DOING."],
  ];

  return (
    <section ref={ref} className="relative min-h-[100svh] bg-white flex items-center overflow-hidden">
      <div className="hero-media absolute inset-0 will-change-transform">
        <img
          src={GLC_FRONT_ENTRANCE}
          alt="Mindcast venue front entrance"
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white/70" />
      </div>

      <div className="hero-copy container mx-auto px-6 relative z-10 pt-24 pb-16 text-center">
        <p className="font-body text-[11px] font-bold tracking-[0.5em] text-primary uppercase mb-8">
          COMING SOON · TAUPŌ, AOTEAROA NEW ZEALAND
        </p>
        <h1 className="font-display leading-[0.9] tracking-tight text-foreground text-[clamp(2.25rem,8vw,9rem)] [text-shadow:0_2px_24px_rgba(255,255,255,0.9)]">
          {heroLines.map((line) => (
            <span key={line.join("")} className="block">
              {line.map((w) => (
                <span key={w} className="hero-word inline-block mr-[0.2em]">{w}</span>
              ))}
            </span>
          ))}
        </h1>
        <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mt-8 leading-relaxed [text-shadow:0_1px_12px_rgba(255,255,255,0.85)]">
          We consume more self-development than any generation before us—and apply almost none of it.
          Mindcast is a weekly live gathering built for follow-through. We are the room that holds
          you accountable to the things you already know.
        </p>
        <div className="flex flex-col items-center justify-center mt-10">
          <GlowButton href="#membership">JOIN THE FOUNDING WAITLIST</GlowButton>
          <p className="font-body font-light italic text-[0.85rem] text-muted-foreground/80 max-w-md mt-4 leading-relaxed [text-shadow:0_1px_10px_rgba(255,255,255,0.8)]">
            The first 100 to register receive a complimentary NFC smart-bracelet—your physical key
            for tap-and-go room entry and instant session access.
          </p>
        </div>
      </div>

      <a href="#manifesto" aria-label="Scroll to the manifesto" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
        <ChevronDown className="animate-float" size={26} />
      </a>
    </section>
  );
};

/* ── MANIFESTO — words surface as you scroll ────────────────────────────── */

const MANIFESTO = [
  "You are unaware, so you don't change.",
  "You are aware, but you still don't change.",
  "You are aware, you take action, and you come back next week.",
];

const ManifestoSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduce()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLSpanElement>(".manifesto-line").forEach((line) => {
        gsap.fromTo(line, { opacity: 0.3 }, {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: line, start: "top 78%", end: "top 45%", scrub: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="manifesto" ref={ref} className="section-cream relative py-32 md:py-44">
      <div className="container mx-auto px-6 max-w-4xl">
        <p className="font-body text-[11px] font-bold tracking-[0.35em] text-primary uppercase mb-12">THREE KINDS OF PEOPLE</p>
        {MANIFESTO.map((line, i) => (
          <p key={i} className="manifesto-line font-display text-foreground text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-8">
            {line}
          </p>
        ))}
        <Reveal delay={0.1}>
          <p className="font-body text-muted-foreground text-lg md:text-xl mt-14">
            Mindcast is the room built for the third.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ── CONNECTIVE RIBBON ──────────────────────────────────────────────────── */

const Ribbon = () => (
  <div className="section-cream border-y border-border py-16 md:py-20">
    <Marquee items={["A STRUCTURED WEEKLY PRACTICE", "EVERY AGE, THE SAME WORK", "NOTICE IT, NAME IT, DO IT", "UNCONSCIOUS → CONSCIOUS → CHANGED"]} />
  </div>
);

/* ── THE GATHERING (How it works) — light theme ─────────────────────────── */

const GatheringSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduce()) return;
    const ctx = gsap.context(() => {
      gsap.to(".gathering-img", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="gathering" ref={ref} className="section-white relative py-28 md:py-36 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal className="relative overflow-hidden aspect-[4/5] shadow-cinematic">
            <img
              src={howItWorksImage}
              alt="A woman sitting at a table working in her workbook"
              className="gathering-img w-full h-[112%] object-cover will-change-transform"
              loading="lazy"
              width={1200}
              height={1500}
            />
          </Reveal>
          <div>
            <SectionHeading
              label="How it works"
              title={<>WE ALL KNOW WHAT TO DO.<br />WHY AREN'T WE DOING IT?</>}
            />
            <Reveal delay={0.15}>
              <p className="font-body text-muted-foreground text-base leading-relaxed mt-8 mb-10">
                We've listened to the podcast. Read the book. Saved the quote. Then Monday arrives,
                and nothing actually changes. Mindcast is the missing step. We are a weekly live
                room designed to bring the unconscious to the conscious, help you set one honest
                intention, and ensure you come back next week to be held to it.
              </p>
              <GlowButton to="/about#the-story" variant="outline">READ THE STORY</GlowButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── THREE TRACKS — light theme ─────────────────────────────────────────── */

const TRACKS = [
  {
    key: "adult",
    icon: Users,
    name: "ADULTS",
    desc: "A guided digital course book featuring live prompts, Q&A, and dedicated space to unpack what the weekly theme surfaces for you.",
    image: GLC_ADULTS_ROOM,
    alt: "The adults' room at the Great Lake Centre during a session",
  },
  {
    key: "teen",
    icon: GraduationCap,
    name: "TEENS",
    desc: "Relevant prompts and reflections in a private room. Real language, real questions, and absolutely no talking down. (Phones away).",
    image: GLC_TEENS_ROOM,
    alt: "The teens' room at the Great Lake Centre during a session",
  },
  {
    key: "kids",
    icon: Baby,
    name: "CHILDREN",
    desc: "Gentle activities, movement, and guided play built around the weekly theme, allowing younger minds to safely grow into the practice.",
    image: GLC_KIDS_ROOM,
    alt: "The kids' room at the Great Lake Centre during a session",
  },
];

const TracksSection = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Two effects, deliberately. `pinned` swaps the section from `py-28` to
  // `h-screen`, and ScrollTrigger measures the element when it is created — so
  // creating the pin in the same effect that sets the flag measured the OLD
  // layout. The pin spacer was then sized from the wrong height, leaving a
  // full viewport of blank white in the middle of the page at some window
  // sizes (and not others, which is why it looked like a zoom bug).
  useEffect(() => {
    setPinned(!prefersReduce());
  }, []);

  useEffect(() => {
    if (!pinned || !wrapRef.current) return;
    // Let the class change paint before measuring.
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setActive(Math.min(TRACKS.length - 1, Math.floor(self.progress * TRACKS.length)));
      },
    });
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [pinned]);

  const Panel = ({ t, i }: { t: (typeof TRACKS)[number]; i: number }) => (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${pinned ? "absolute inset-0 transition-opacity duration-500" : "mb-20"}`}
      style={pinned ? { opacity: active === i ? 1 : 0, pointerEvents: active === i ? "auto" : "none" } : undefined}>
      <div className="relative overflow-hidden aspect-[4/3] shadow-cinematic">
        <img src={t.image} alt={t.alt} className="w-full h-full object-cover" loading="lazy" width={1600} height={1200} />
      </div>
      <div className="bg-card border border-border p-8 md:p-10">
        <t.icon className="text-primary mb-5" size={30} aria-hidden />
        <h3 className="font-display text-foreground text-5xl md:text-6xl tracking-wide mb-4">{t.name}</h3>
        <p className="font-body text-muted-foreground text-base leading-relaxed">{t.desc}</p>
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className="relative">
      <section className={`container mx-auto px-6 ${pinned ? "h-screen flex flex-col justify-center" : "py-28"}`}>
        <div className="text-center mb-10">
          <SectionHeading label="Every age. The same work." title="ONE THEME, THREE ROOMS." />
          <Reveal delay={0.1}>
            <p className="font-body text-muted-foreground text-sm max-w-xl mx-auto mt-5">
              Real behavioural change starts with a shared language at home. Adults, teens, and
              children each have their own dedicated space, tailored workbook, and expert
              facilitation—all exploring the exact same weekly theme.
            </p>
          </Reveal>
          {pinned && (
            <div className="flex justify-center gap-3 mt-6" aria-hidden>
              {TRACKS.map((t, i) => (
                <span key={t.key} className={`h-1.5 rounded-full transition-all duration-400 ${active === i ? "w-10 bg-primary" : "w-4 bg-muted"}`} />
              ))}
            </div>
          )}
        </div>
        <div className={pinned ? "relative flex-1 max-h-[62vh]" : ""}>
          {TRACKS.map((t, i) => <Panel key={t.key} t={t} i={i} />)}
        </div>
      </section>
    </div>
  );
};

/* ── STATS — the shape of the practice ──────────────────────────────────── */

const StatsBand = () => (
  <section className="section-cream border-y border-border py-24 relative">
    <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-14">
      <Reveal><StatCounter value={52} label="Weeks in the journey" /></Reveal>
      <Reveal delay={0.1}><StatCounter value={3} label="Rooms, one theme" /></Reveal>
      <Reveal delay={0.2}><StatCounter value={1} label="Intention, kept weekly" /></Reveal>
    </div>
  </section>
);

/* ── THE RHYTHM — animated spine ────────────────────────────────────────── */

const RHYTHM_STEPS = [
  {
    title: "SUNDAY · THE GATHERING",
    body: "Every session begins the same way: we return to the intention you set seven days ago. Did you do it? What got in the way? No shame, just honest data.",
    image: HOME_THE_GATHERING,
  },
  {
    title: "IN THE ROOMS",
    body: "Adults, teens, and children move into their own dedicated spaces to work the same theme in parallel. Live facilitation, workbook prompts, and real conversation. The goal isn't more information—it's bringing the unconscious to the conscious.",
    image: HOME_IN_THE_ROOMS,
  },
  {
    title: "BEFORE YOU LEAVE",
    body: "You write down one specific thing you will do this week. It goes in your workbook, and it comes back with you next Sunday. That is how a session turns into a practice, and how a community actually changes.",
    image: HOME_THE_GATHERING,
  },
];

const RhythmSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduce()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".rhythm-spine", { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        transformOrigin: "top",
        scrollTrigger: { trigger: ref.current, start: "top 60%", end: "bottom 80%", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="rhythm" ref={ref} className="section-white relative py-28 md:py-36">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-20">
          <SectionHeading label="Notice it. Name it. Do it." title="THE RHYTHM" />
          <Reveal delay={0.1}>
            <p className="font-body text-muted-foreground text-sm max-w-xl mx-auto mt-5">
              A structure built around the only thing that actually changes behaviour: coming back
              next week and being asked if you did it.
            </p>
          </Reveal>
        </div>

        <div className="relative">
          {/* The spine: draws itself as you move through the week. */}
          <div className="rhythm-spine absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--primary))] via-[hsl(var(--blue))] to-transparent" aria-hidden />
          {RHYTHM_STEPS.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.05}
              className={`relative mb-12 md:mb-16 md:w-[calc(50%-3rem)] pl-12 md:pl-0 ${
                i % 2 ? "md:ml-auto" : ""
              } ${i > 0 ? "md:-mt-28" : ""}`}
            >
              <span className="absolute -left-0.5 md:left-auto top-1 text-primary" style={i % 2 ? { left: "-4.05rem" } : { right: "-4.05rem" }} aria-hidden>
                <Ripple size={30} />
              </span>
              <div className="bg-card border border-border p-7">
                <div className="overflow-hidden aspect-[4/3] mb-5 -mx-7 -mt-7">
                  <img src={s.image} alt="" className="w-full h-full object-cover object-center" loading="lazy" width={1200} height={900} />
                </div>
                <h3 className="font-display text-foreground text-2xl tracking-wide mb-3">{s.title}</h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── VENUE ──────────────────────────────────────────────────────────────── */

const VENUE_POINTS = [
  { label: "ADULTS", desc: "The main hall — room for the whole community in the heart of Taupō" },
  { label: "TEENS", desc: "Their own meeting room, phones away, no adults wandering through" },
  { label: "CHILDREN", desc: "A dedicated space of their own, with room to move" },
  { label: "KITCHEN", desc: "Tea, coffee and something to eat before and after" },
];

const VenueSection = () => (
  <section className="section-cream py-28 md:py-36">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div>
          <SectionHeading label="Taupō" title="WHERE WE MEET" />
          <Reveal delay={0.1}>
            <p className="font-body text-muted-foreground text-base leading-relaxed mt-8 mb-6">
              We gather at the Great Lake Centre, 5 Story Place, Taupō — a 600-person
              venue in the heart of town.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-body text-muted-foreground text-base leading-relaxed mb-10">
              Three rooms run at once. Adults in the main hall, teens in their own room, children
              in a space of their own. There is a kitchen, so there is always a cup of tea.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {VENUE_POINTS.map((v, i) => (
              <Reveal key={v.label} delay={0.05 * i}>
                <div className="bg-card border border-border p-5 h-full">
                  <p className="font-display text-primary tracking-[0.2em] text-sm mb-1.5">{v.label}</p>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="relative overflow-hidden aspect-[4/3] shadow-cinematic">
          <img
            src={GLC_FRONT_ENTRANCE}
            alt="Members arriving at the Great Lake Centre"
            className="w-full h-full object-cover"
            loading="lazy"
            width={1400}
            height={1050}
          />
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── VISION QUOTE ───────────────────────────────────────────────────────── */

const VisionQuote = () => (
  <section className="section-white py-28 md:py-40">
    <div className="container mx-auto px-6 max-w-3xl text-center relative">
      <Reveal>
        <Ripple size={40} className="mx-auto mb-10 text-primary" animate />
        <blockquote className="font-serif italic text-foreground text-2xl sm:text-3xl md:text-4xl leading-snug mb-10">
          "We don't have a knowledge problem. We have a follow-through problem. Mindcast is the
          room that finally closes that gap — together, every week."
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <img src={founderPortrait} alt="Ashleigh Carlson, founder of Mindcast" className="w-14 h-14 rounded-full object-cover" width={112} height={112} loading="lazy" />
          <p className="font-body text-muted-foreground text-sm text-left">
            Ashleigh Carlson
            <span className="block text-muted-foreground/60 text-xs">Founder</span>
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── FINAL CTA ──────────────────────────────────────────────────────────── */

const FinalCTA = () => (
  <section className="section-cream border-t border-border py-28 md:py-36 relative overflow-hidden">
    <div className="container mx-auto px-6 max-w-3xl text-center relative">
      <Reveal>
        <p className="font-body text-[11px] font-bold tracking-[0.5em] text-primary uppercase mb-6">Taupō · Sundays</p>
        <h2 className="font-display text-foreground leading-[0.92] tracking-tight text-6xl sm:text-7xl md:text-8xl mb-8">
          STOP CONSUMING.
          <br />
          START DOING.
        </h2>
        <p className="font-body text-muted-foreground text-base leading-relaxed max-w-xl mx-auto mb-12">
          One room, the same people, every week, for a year. Come and sit in it once, free, and
          see what it is — no card, no chase, no countdown.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlowButton to="/try">GET A FREE SESSION PASS</GlowButton>
          <GlowButton href="#membership" variant="outline">SEE MEMBERSHIP</GlowButton>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── HOME PAGE ──────────────────────────────────────────────────────────── */

const Home = () => {
  const reduce = useReducedMotion();

  // Route-scoped ScrollTrigger hygiene: anything a section missed is cleared
  // when the page unmounts, so navigation never leaks pinned spacers.
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {!reduce && <CustomCursor />}
      <ScrollProgress />
      <CinematicNav />
      <HeroSection />
      <ManifestoSection />
      <Ribbon />
      <GatheringSection />
      <TracksSection />
      <StatsBand />
      <RhythmSection />
      <VenueSection />
      <VisionQuote />

      {/* Ivory contrast bands — the About and Membership pages live in-page
          here, reached from the nav exactly like #rhythm. */}
      <div id="about" className="scroll-mt-14">
        <AboutContent />
      </div>
      <div id="membership" className="scroll-mt-14">
        <MembershipContent />
      </div>

      <FinalCTA />
      <Footer variant="light" />
    </div>
  );
};

export default Home;
