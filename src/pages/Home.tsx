import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Users, GraduationCap, Baby } from "lucide-react";
import heroFamily from "@/assets/home-family-workbooks.jpg";
import facilitatorRoom from "@/assets/home-facilitator-room.jpg";
import adultWorkbook from "@/assets/home-adult-workbook.jpg";
import teenWorkbook from "@/assets/home-teen-workbook.jpg";
import childColouring from "@/assets/home-child-colouring.jpg";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import lifeGroup from "@/assets/home-life-group.jpg";
import founderPortrait from "@/assets/founder-portrait.jpg";
import mindcastBuilding from "@/assets/mindcast-building.png";
import logoNavLight from "@/assets/logo-cream.png";
import { useAuth } from "@/contexts/AuthContext";
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

gsap.registerPlugin(ScrollTrigger);

// Home — the one dark-canvas page. Cinematic navy (surface tokens), glass
// elevation, blue glow, scroll choreography. Every other surface in the
// product is ivory-first; this page is the night the rest of the week points
// at. All motion is transform/opacity, cleaned up per-effect, and fully
// silent under prefers-reduced-motion.

const prefersReduce = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── NAV — transparent over the hero, morphs to glass on scroll ─────────── */

const CinematicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "HOW IT WORKS", href: "#gathering" },
    { label: "THE RHYTHM", href: "#rhythm" },
    { label: "ABOUT", href: "/about" },
    { label: "MEMBERSHIP", href: "/membership" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-panel border-x-0 border-t-0 rounded-none py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" aria-label="Mindcast home">
          <img src={logoNavLight} alt="Mindcast" className="h-8 md:h-9 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.label} href={l.href} className="text-cream/60 hover:text-cream text-xs font-body font-semibold tracking-[0.2em] transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.href} className="text-cream/60 hover:text-cream text-xs font-body font-semibold tracking-[0.2em] transition-colors">
                {l.label}
              </Link>
            ),
          )}
          <Link
            to={session ? "/portal/dashboard" : "/portal/login"}
            className="border border-cream/25 hover:border-glow hover:text-glow text-cream text-xs font-body font-semibold tracking-[0.2em] px-6 py-2.5 transition-colors"
          >
            PORTAL
          </Link>
        </div>

        <button
          className="lg:hidden text-cream w-11 h-11 flex items-center justify-center"
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
          className="lg:hidden fixed inset-0 top-14 z-40 bg-surface-0"
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 safe-area-bottom">
            {links.map((l, i) => (
              <motion.div key={l.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                {l.href.startsWith("#") ? (
                  <a href={l.href} onClick={() => setMobileOpen(false)} className="text-cream text-2xl font-display tracking-widest">{l.label}</a>
                ) : (
                  <Link to={l.href} onClick={() => setMobileOpen(false)} className="text-cream text-2xl font-display tracking-widest">{l.label}</Link>
                )}
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Link to={session ? "/portal/dashboard" : "/portal/login"} onClick={() => setMobileOpen(false)} className="mt-4 px-10 py-4 border border-cream/40 text-cream text-sm tracking-widest font-body min-h-[56px] flex items-center">
                PORTAL
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

/* ── HERO — scroll-driven scale + mask ──────────────────────────────────── */

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduce()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", { y: 70, opacity: 0, stagger: 0.08, duration: 0.9, delay: 0.3, ease: "power3.out" });
      // Scroll scrub: the image scales up and dims as the headline leaves.
      gsap.to(".hero-media", {
        scale: 1.12,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-copy", {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: "70% top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const words = ["TUNE", "INTO", "YOUR", "INNER", "SELF."];

  return (
    <section ref={ref} className="relative min-h-[100svh] surface-dark flex items-center overflow-hidden">
      <div className="hero-media absolute inset-0 will-change-transform">
        <img
          src={heroFamily}
          alt="A family gathered together with open workbooks"
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, hsl(var(--surface-0) / 0.55) 0%, hsl(var(--surface-0) / 0.75) 60%, hsl(var(--surface-0)) 100%)" }} />
      </div>
      <div className="absolute inset-0 gradient-hero pointer-events-none" />

      <div className="hero-copy container mx-auto px-6 relative z-10 pt-24 pb-16 text-center">
        <p className="font-body text-[11px] font-bold tracking-[0.5em] text-glow uppercase mb-8">
          Coming soon · Taupō, Aotearoa New Zealand
        </p>
        <h1 className="font-display leading-[0.88] tracking-tight text-cream text-[17vw] sm:text-[13vw] lg:text-[10rem]">
          {words.map((w) => (
            <span key={w} className="hero-word inline-block mr-[0.2em]">{w}</span>
          ))}
        </h1>
        <p className="font-body text-cream/70 text-base md:text-lg max-w-2xl mx-auto mt-8 leading-relaxed">
          We consume more self-development than any generation before us — and apply almost none
          of it. Mindcast is a weekly live gathering built for follow-through: a room that holds
          you accountable to the things you already know.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <GlowButton to="/membership">SEE MEMBERSHIP</GlowButton>
          <GlowButton to="/try" variant="outline">GET A FREE SESSION PASS</GlowButton>
        </div>
      </div>

      <a href="#manifesto" aria-label="Scroll to the manifesto" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/40 hover:text-cream transition-colors">
        <ChevronDown className="animate-float" size={26} />
      </a>
    </section>
  );
};

/* ── MANIFESTO — words surface as you scroll ────────────────────────────── */

const MANIFESTO = [
  "You are unaware, and you don't change.",
  "You are aware, and you still don't change.",
  "You are aware, you act, and you come back next week.",
];

const ManifestoSection = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReduce()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLSpanElement>(".manifesto-line").forEach((line) => {
        gsap.fromTo(line, { opacity: 0.14 }, {
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: line, start: "top 78%", end: "top 45%", scrub: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="manifesto" ref={ref} className="surface-dark relative py-32 md:py-44 grain-overlay">
      <div className="container mx-auto px-6 max-w-4xl">
        <p className="font-body text-[11px] font-bold tracking-[0.35em] text-glow uppercase mb-12">Three kinds of people</p>
        {MANIFESTO.map((line, i) => (
          <p key={i} className="manifesto-line font-display text-cream text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-8">
            {line}
          </p>
        ))}
        <Reveal delay={0.1}>
          <p className="font-serif italic text-glow text-2xl md:text-3xl mt-14">
            Mindcast is the room built for that third one.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ── CONNECTIVE RIBBON ──────────────────────────────────────────────────── */

const Ribbon = () => (
  <div className="surface-dark border-y border-cream/10 py-7">
    <Marquee items={["NOTICE IT, NAME IT, DO IT", "UNCONSCIOUS → CONSCIOUS → CHANGED", "A STRUCTURED WEEKLY PRACTICE", "EVERY AGE, THE SAME WORK"]} />
  </div>
);

/* ── THE GATHERING ──────────────────────────────────────────────────────── */

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
    <section id="gathering" ref={ref} className="surface-dark-1 relative py-28 md:py-36 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <Reveal className="relative overflow-hidden aspect-[4/5] shadow-cinematic">
            <img
              src={facilitatorRoom}
              alt="A facilitator leading a warm gathering"
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
              <p className="font-body text-cream/70 text-base leading-relaxed mt-8 mb-6">
                We've listened to the podcast. Read the book. Saved the reel. Then Monday arrives
                and nothing actually changes.
              </p>
              <p className="font-body text-cream/70 text-base leading-relaxed mb-10">
                Mindcast is a weekly live room built for the missing step — a community that helps
                you bring the unconscious to the conscious, set one honest intention, and come
                back the following week to be held to it.
              </p>
              <GlowButton to="/about" variant="outline">READ THE STORY</GlowButton>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── THREE TRACKS — scroll-pinned sequence ──────────────────────────────── */

const TRACKS = [
  {
    key: "adult",
    icon: Users,
    name: "ADULTS",
    desc: "A guided digital course book with live prompts, Q&A, and space to write into what the theme surfaces for you.",
    image: adultWorkbook,
    alt: "The adult workbook open mid-session",
  },
  {
    key: "teen",
    icon: GraduationCap,
    name: "TEENS",
    desc: "Age-appropriate prompts and reflections in their own room — real language, real questions, no talking down.",
    image: teenWorkbook,
    alt: "The teen workbook",
  },
  {
    key: "kids",
    icon: Baby,
    name: "KIDS",
    desc: "Gentle activities and colouring pages built around the same weekly theme, so the little ones grow into the practice.",
    image: childColouring,
    alt: "A child's colouring page from the kids' room",
  },
];

const TracksSection = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (prefersReduce()) { setPinned(false); return; }
    setPinned(true);
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setActive(Math.min(TRACKS.length - 1, Math.floor(self.progress * TRACKS.length)));
      },
    });
    return () => st.kill();
  }, []);

  const Panel = ({ t, i }: { t: (typeof TRACKS)[number]; i: number }) => (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${pinned ? "absolute inset-0 transition-opacity duration-500" : "mb-20"}`}
      style={pinned ? { opacity: active === i ? 1 : 0, pointerEvents: active === i ? "auto" : "none" } : undefined}>
      <div className="relative overflow-hidden aspect-[4/3] md:aspect-[4/5] max-h-[60vh] shadow-cinematic">
        <img src={t.image} alt={t.alt} className="w-full h-full object-cover" loading="lazy" width={1200} height={1500} />
      </div>
      <GlassCard className="p-8 md:p-10">
        <t.icon className="text-glow mb-5" size={30} aria-hidden />
        <h3 className="font-display text-cream text-5xl md:text-6xl tracking-wide mb-4">{t.name}</h3>
        <p className="font-body text-cream/70 text-base leading-relaxed">{t.desc}</p>
      </GlassCard>
    </div>
  );

  return (
    <div ref={wrapRef} className="surface-dark relative">
      <section className={`container mx-auto px-6 ${pinned ? "h-screen flex flex-col justify-center" : "py-28"}`}>
        <div className="text-center mb-10">
          <SectionHeading label="Every age. The same work." title="ONE THEME, THREE ROOMS" />
          <Reveal delay={0.1}>
            <p className="font-body text-cream/60 text-sm max-w-xl mx-auto mt-5">
              Whānau-wide behaviour change starts with a shared language. Adults, teens and kids
              each have their own workbook — different depth, different words, same weekly theme.
            </p>
          </Reveal>
          {pinned && (
            <div className="flex justify-center gap-3 mt-6" aria-hidden>
              {TRACKS.map((t, i) => (
                <span key={t.key} className={`h-1.5 rounded-full transition-all duration-400 ${active === i ? "w-10 bg-[hsl(var(--glow))]" : "w-4 bg-cream/15"}`} />
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
  <section className="surface-dark-1 border-y border-cream/10 py-20 relative glow-behind">
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
    body: "Every session begins the same way — we return to the intention you set seven days ago. Did you do it? What got in the way? Where did the old pattern win? No shame, just honest data.",
    image: lifeGroup,
  },
  {
    title: "IN THE ROOMS",
    body: "Adults, teens and kids move into their own rooms and work the same theme in parallel — live facilitation, workbook prompts, real conversation. The goal isn't more information. It's bringing the unconscious to the conscious.",
    image: threeWorkbooks,
  },
  {
    title: "BEFORE YOU LEAVE",
    body: "You write down one specific thing you'll do this week. It goes in your workbook, and it comes back with you next Sunday. That's how a room turns into a life. That's how a community changes.",
    image: heroFamily,
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
    <section id="rhythm" ref={ref} className="surface-dark relative py-28 md:py-36 grain-overlay">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-20">
          <SectionHeading label="Reflect. Gather. Commit." title="THE RHYTHM" />
          <Reveal delay={0.1}>
            <p className="font-body text-cream/60 text-sm max-w-xl mx-auto mt-5">
              A cadence built around the only thing that actually changes behaviour — coming back
              next week and being asked whether you did it.
            </p>
          </Reveal>
        </div>

        <div className="relative">
          {/* The spine: draws itself as you move through the week. */}
          <div className="rhythm-spine absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--glow))] via-[hsl(var(--blue))] to-transparent" aria-hidden />
          {RHYTHM_STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05} className={`relative mb-20 md:w-[calc(50%-3rem)] pl-12 md:pl-0 ${i % 2 ? "md:ml-auto" : ""}`}>
              <span className="absolute -left-0.5 md:left-auto top-1 text-glow" style={i % 2 ? { left: "-4.05rem" } : { right: "-4.05rem" }} aria-hidden>
                <Ripple size={30} />
              </span>
              <GlassCard className="p-7">
                <div className="overflow-hidden aspect-[16/9] mb-5 -mx-7 -mt-7">
                  <img src={s.image} alt="" className="w-full h-full object-cover" loading="lazy" width={1200} height={675} />
                </div>
                <h3 className="font-display text-cream text-2xl tracking-wide mb-3">{s.title}</h3>
                <p className="font-body text-cream/70 text-sm leading-relaxed">{s.body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── VENUE ──────────────────────────────────────────────────────────────── */

const VENUE_POINTS = [
  { label: "THEATRE", desc: "120-seat auditorium with stage and LED wall" },
  { label: "LIFE GROUP ROOMS", desc: "Glass-walled rooms for 15-person Life Groups" },
  { label: "CAFE", desc: "Espresso, communal tables, pre-session gathering" },
  { label: "PLAYGROUND", desc: "Soft-play and climbing — visible from the cafe" },
];

const VenueSection = () => (
  <section className="surface-dark-1 py-28 md:py-36">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div>
          <SectionHeading label="Coming soon" title="A SPACE BUILT FOR FOLLOW-THROUGH" />
          <Reveal delay={0.1}>
            <p className="font-body text-cream/70 text-base leading-relaxed mt-8 mb-10">
              Every detail designed so Sunday gatherings and midweek Life Groups have a permanent,
              purpose-built home — theatre, breakout rooms, cafe, and a playground so parents can
              stay present.
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {VENUE_POINTS.map((v, i) => (
              <Reveal key={v.label} delay={0.05 * i}>
                <GlassCard className="p-5 h-full">
                  <p className="font-display text-glow tracking-[0.2em] text-sm mb-1.5">{v.label}</p>
                  <p className="font-body text-cream/65 text-sm leading-relaxed">{v.desc}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="relative overflow-hidden aspect-[4/3] shadow-cinematic glow-behind">
          <img
            src={mindcastBuilding}
            alt="Mindcast venue — theatre, breakout rooms, cafe, playground"
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
  <section className="surface-dark py-28 md:py-40 grain-overlay">
    <div className="container mx-auto px-6 max-w-3xl text-center relative glow-behind">
      <Reveal>
        <Ripple size={40} className="mx-auto mb-10 text-glow" animate />
        <blockquote className="font-serif italic text-cream text-2xl sm:text-3xl md:text-4xl leading-snug mb-10">
          "We don't have a knowledge problem. We have a follow-through problem. Mindcast is the
          room that finally closes that gap — together, every week."
        </blockquote>
        <div className="flex items-center justify-center gap-4">
          <img src={founderPortrait} alt="Ashleigh Carlson, founder of Mindcast" className="w-14 h-14 rounded-full object-cover" width={112} height={112} loading="lazy" />
          <p className="font-body text-cream/60 text-sm text-left">
            Ashleigh Carlson
            <span className="block text-cream/35 text-xs">Founder</span>
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── FINAL CTA ──────────────────────────────────────────────────────────── */

const FinalCTA = () => (
  <section className="surface-dark-1 border-t border-cream/10 py-28 md:py-36 relative overflow-hidden">
    <div className="absolute inset-0 gradient-hero pointer-events-none" aria-hidden />
    <div className="container mx-auto px-6 max-w-3xl text-center relative">
      <Reveal>
        <p className="font-body text-[11px] font-bold tracking-[0.5em] text-glow uppercase mb-6">Taupō · Sundays</p>
        <h2 className="font-display text-cream leading-[0.92] tracking-tight text-6xl sm:text-7xl md:text-8xl mb-8">
          STOP CONSUMING.
          <br />
          START DOING.
        </h2>
        <p className="font-body text-cream/65 text-base leading-relaxed max-w-xl mx-auto mb-12">
          One room, the same people, every week, for a year. Come and sit in it once, free, and
          see what it is — no card, no chase, no countdown.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlowButton to="/try">GET A FREE SESSION PASS</GlowButton>
          <GlowButton to="/membership" variant="outline">SEE MEMBERSHIP</GlowButton>
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
    <div className="surface-dark">
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
      <FinalCTA />
      <Footer variant="dark" />
    </div>
  );
};

export default Home;
