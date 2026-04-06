import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ChevronDown, Headphones, ClipboardList, MessageCircle, CalendarDays, MapPin } from "lucide-react";
import heroCouple from "@/assets/hero-couple.jpg";
import heroPortrait from "@/assets/hero-portrait.jpg";
import founderPortrait from "@/assets/founder-portrait.jpg";
import flatlayRoadmap from "@/assets/flatlay-roadmap.jpg";
import logoLight from "@/assets/logo-cream.png";
import logoDark from "@/assets/logo-dark-tagline.png";
import logoNav from "@/assets/logo-dark-notagline.png";
import logoNavLight from "@/assets/logo-cream.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

gsap.registerPlugin(ScrollTrigger);

/* ─── NAV ─── */
const CinematicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "THE PRACTICE", href: "#practice" },
    { label: "PILOT GROUP", href: "#pilot" },
    { label: "ABOUT", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl border-b"
          : "bg-transparent border-b border-transparent"
      }`}
      style={
        scrolled
          ? { background: "rgba(15,30,53,0.85)", borderColor: "rgba(53,133,175,0.2)" }
          : {}
      }
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/">
          <img
            src={scrolled ? logoNavLight : logoNavLight}
            alt="Mindcast"
            className="h-7"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] font-bold tracking-[0.12em] text-cream/60 hover:text-cream transition-colors font-body"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.href}
                className="text-[11px] font-bold tracking-[0.12em] text-cream/60 hover:text-cream transition-colors font-body"
              >
                {l.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {session ? (
            <Link to="/portal/dashboard" className="text-[11px] font-bold tracking-[0.12em] text-cream/60 hover:text-cream transition-colors font-body">
              DASHBOARD
            </Link>
          ) : (
            <Link
              to="/pilot"
              className="px-5 py-2 border border-cream/30 text-cream text-[11px] font-bold tracking-[0.12em] font-body hover:bg-cream hover:text-[#0f1e35] transition-all"
            >
              JOIN THE PILOT
            </Link>
          )}
        </div>

        <button
          className="lg:hidden text-cream"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 top-16 z-40"
          style={{ background: "hsl(210 56% 14%)" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {links.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {l.href.startsWith("#") ? (
                  <a
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-cream text-2xl font-display tracking-widest"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    to={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-cream text-2xl font-display tracking-widest"
                  >
                    {l.label}
                  </Link>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/membership"
                onClick={() => setMobileOpen(false)}
                className="mt-4 px-8 py-3 border border-cream/40 text-cream text-sm tracking-widest font-body"
              >
                JOIN WAITLIST
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

/* ─── HERO ─── */
const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const handler = () => setShowScroll(window.scrollY < 100);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        y: 60,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
      });
      gsap.from(".hero-sub", { y: 20, opacity: 0, delay: 1.2, duration: 0.8 });
      gsap.from(".hero-cta", { y: 20, opacity: 0, delay: 1.5, duration: 0.8 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-end justify-center pb-24 md:pb-32 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={heroCouple}
      >
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(15,30,53,0.3) 0%, rgba(15,30,53,0.55) 60%, rgba(15,30,53,0.85) 100%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block text-[13px] tracking-[0.2em] mb-6"
          style={{ color: "#c5e3f3", fontFamily: "var(--font-display)" }}
        >
          TUNE INTO YOUR INNER SELF
        </motion.span>

        <h1 className="font-body font-black text-cream text-[52px] sm:text-[72px] md:text-[96px] lg:text-[120px] uppercase leading-[0.95] tracking-[-0.03em]">
          {"INNER WORK".split(" ").map((w, i) => (
            <span key={i} className="hero-word inline-block mr-[0.25em]">{w}</span>
          ))}
          <br />
          {"FOR REAL LIFE".split(" ").map((w, i) => (
            <span key={i} className="hero-word inline-block mr-[0.25em]">{w}</span>
          ))}
        </h1>

        <p className="hero-sub mt-6 text-[15px] tracking-[0.08em] font-body" style={{ color: "#c5e3f3" }}>
          NOT THERAPY. NOT RELIGION. A STRUCTURED LIFE PRACTICE.
        </p>

        <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/membership"
            className="px-8 py-4 bg-cream text-[#0f1e35] text-[12px] font-body font-bold tracking-[0.1em] uppercase hover:bg-[#3585af] hover:text-cream transition-all"
          >
            JOIN THE FOUNDING COMMUNITY →
          </Link>
          <a
            href="#practice"
            className="px-8 py-4 border border-cream/40 text-cream text-[12px] font-body font-bold tracking-[0.1em] uppercase hover:border-cream hover:bg-cream/[0.08] transition-all"
          >
            EXPLORE THE PRACTICE
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: showScroll ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-[10px] tracking-[0.2em] text-cream/50" style={{ fontFamily: "var(--font-display)" }}>
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} className="text-cream/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ─── MANIFESTO (word-by-word reveal) ─── */
const ManifestoSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLSpanElement>(".manifesto-word").forEach((word, i) => {
        gsap.to(word, {
          opacity: 1,
          color: "#0f1e35",
          scrollTrigger: {
            trigger: word,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const lines = [
    "Most people spend their 30s consuming ideas.",
    "Podcasts. Books. Courses. Content.",
    "But consuming is not the same as applying.",
    "Mindcast is where ideas become practice.",
  ];

  return (
    <section ref={sectionRef} className="section-cream grain-overlay relative min-h-screen flex items-center py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="text-[36px] sm:text-[48px] md:text-[60px] font-body font-black leading-[1.15] tracking-[-0.02em]">
          {lines.map((line, li) => (
            <p key={li} className="mb-4">
              {line.split(" ").map((word, wi) => (
                <span
                  key={wi}
                  className="manifesto-word inline-block mr-[0.3em]"
                  style={{ opacity: 0.15, color: "#8e9299", transition: "color 0.1s" }}
                >
                  {word}
                </span>
              ))}
            </p>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="w-20 h-[2px]" style={{ background: "#3585af" }} />
          <span
            className="text-[13px] tracking-[0.25em]"
            style={{ fontFamily: "var(--font-display)", color: "#3585af" }}
          >
            TUNE INTO YOUR INNER SELF
          </span>
        </div>
      </div>
    </section>
  );
};

/* ─── WHAT IS MINDCAST (Horizontal scroll panels on desktop, stacked on mobile) ─── */
const HorizontalPanels = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return; // skip on mobile

    const ctx = gsap.context(() => {
      const panels = panelsRef.current;
      if (!panels) return;
      const totalWidth = panels.scrollWidth - window.innerWidth;

      gsap.to(panels, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const panels = [
    {
      num: "01",
      title: "THE PROBLEM",
      headline: "YOU'VE TRIED THE GYM CULT.",
      body: "You've done book clubs. Online courses. Morning routines. None of it stuck — because consuming ideas without structure, reflection, or community doesn't change how you actually live.",
      image: heroCouple,
    },
    {
      num: "02",
      title: "THE PRACTICE",
      headline: "INNER WORK HAS A STRUCTURE.",
      body: null,
      cards: [
        { icon: "headphones", title: "LISTEN", desc: "A curated podcast episode each week" },
        { icon: "clipboard", title: "REFLECT", desc: "Your worksheet. Your insights. Before you arrive." },
        { icon: "message", title: "DISCUSS", desc: "Real conversation. Real depth. Every Tuesday." },
      ],
    },
    {
      num: "03",
      title: "THE SPACE",
      headline: "TAUPO'S MOST INTENTIONAL TUESDAY NIGHT.",
      body: null,
      image: heroPortrait,
      overlay: true,
      details: "Tuesdays 5:30\u20137:30pm \u00b7 111 Jarden Mile, Taupo",
    },
    {
      num: "04",
      title: "THE VISION",
      headline: "THIS IS THE PILOT.",
      body: "Mindcast is building something bigger — a platform for the ideas that shape how you live. The pilot group is where it starts. Founding members shape what it becomes.",
      image: flatlayRoadmap,
      cta: true,
    },
  ];

  return (
    <div ref={containerRef} id="practice" className="section-navy relative overflow-hidden">
      <div
        ref={panelsRef}
        className="flex md:flex-row flex-col"
        style={{ width: "fit-content" }}
      >
        {panels.map((p, i) => (
          <div
            key={i}
            className="w-screen min-h-screen flex items-center relative px-8 md:px-16 py-20"
          >
            {/* Big decorative numeral */}
            <span
              className="absolute top-8 left-8 font-body font-black text-[180px] md:text-[200px] leading-none select-none"
              style={{ color: "rgba(53,133,175,0.1)" }}
            >
              {p.num}
            </span>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
              <div>
                <span className="text-[11px] tracking-[0.15em] font-body font-bold mb-3 block" style={{ color: "#3585af" }}>
                  {p.title}
                </span>
                <h3 className="font-body font-black text-cream text-[36px] md:text-[48px] leading-[1.05] tracking-[-0.02em] mb-6">
                  {p.headline}
                </h3>
                {p.body && (
                  <p className="font-body text-[17px] leading-relaxed" style={{ color: "rgba(197,227,243,0.8)" }}>
                    {p.body}
                  </p>
                )}
                {p.cards && (
                  <div className="grid gap-4 mt-4">
                    {p.cards.map((c) => (
                      <div key={c.title} className="flex items-start gap-4 p-4 border border-cream/10">
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                          <h4 className="font-body font-bold text-cream text-sm tracking-wider">{c.title}</h4>
                          <p className="text-cream/60 text-sm font-body">{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {p.details && (
                  <p className="mt-6 text-[14px] tracking-wide" style={{ fontFamily: "var(--font-display)", color: "#c5e3f3" }}>
                    {p.details}
                  </p>
                )}
                {p.cta && (
                  <Link
                    to="/pilot"
                    className="inline-block mt-8 px-8 py-4 text-cream text-[12px] font-body font-bold tracking-[0.1em] uppercase transition-all hover:brightness-110"
                    style={{ background: "#3585af" }}
                  >
                    BECOME A FOUNDING MEMBER
                  </Link>
                )}
              </div>

              {p.image && (
                <div className={`relative overflow-hidden ${p.overlay ? "h-[500px]" : "h-[400px]"}`}>
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {p.overlay && (
                    <div className="absolute inset-0" style={{ background: "rgba(53,133,175,0.15)" }} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── PILOT GROUP (Split Screen) ─── */
const PilotGroupSection = () => {
  const [spots, setSpots] = useState(12);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Optionally fetch real count from Supabase
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count !== null) setSpots(Math.max(0, 15 - count));
    });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pilot-image", {
        x: -60,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.from(".pilot-content", {
        x: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pilot" className="section-cream grain-overlay relative">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left — Image */}
        <div className="pilot-image relative overflow-hidden h-[400px] md:h-auto">
          <img
            src={founderPortrait}
            alt="Mindcast founder"
            className="w-full h-full object-cover animate-kenburns"
          />
        </div>
        {/* Right — Content */}
        <div className="pilot-content flex items-center p-10 md:p-20">
          <div>
            <span
              className="text-[12px] tracking-[0.2em] mb-4 block"
              style={{ fontFamily: "var(--font-display)", color: "#3585af" }}
            >
              PILOT GROUP · TAUPO · 2025
            </span>
            <h2 className="font-body font-black text-[40px] md:text-[56px] leading-[1.05] tracking-[-0.02em] mb-6" style={{ color: "#0f1e35" }}>
              15 SEATS.<br />FOUNDING MEMBERS ONLY.
            </h2>
            <p className="font-body text-[16px] leading-relaxed mb-8" style={{ color: "#0f1e35cc" }}>
              Each week you'll listen to a curated podcast, complete a structured worksheet, and join a real conversation with a small group of curious adults. One night. Every Tuesday. No fluff.
            </p>

            <div
              className="text-[48px] font-body font-black mb-2"
              style={{ color: "#3585af" }}
            >
              {spots} OF 15
            </div>
            <p className="text-[12px] tracking-[0.15em] font-body font-bold mb-8" style={{ color: "#0f1e35aa" }}>
              SPOTS REMAINING
            </p>

            <div className="flex flex-wrap gap-6 text-[13px] mb-8" style={{ fontFamily: "var(--font-display)", color: "#0f1e35cc" }}>
              <span>📅 Tuesdays 5:30–7:30pm</span>
              <span>📍 111 Jarden Mile, Taupo</span>
              <span>💳 $150 / 10-week term</span>
            </div>

            <Link
              to="/membership"
              className="block text-center px-8 py-4 text-cream text-[12px] font-body font-bold tracking-[0.1em] uppercase hover:shadow-lg transition-all"
              style={{ background: "#3585af" }}
            >
              SECURE MY SPOT →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── HOW IT WORKS (Sticky scroll) ─── */
const StickyTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".timeline-step").forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveStep(i + 1),
          onEnterBack: () => setActiveStep(i + 1),
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: "01",
      title: "LISTEN BEFORE YOU ARRIVE",
      body: "Each week I curate one self-development podcast episode for the group. You listen in your own time — on your commute, at the gym, cooking dinner.",
      image: flatlayRoadmap,
    },
    {
      num: "02",
      title: "WORK THROUGH THE WORKSHEET",
      body: "Before Tuesday, you complete a structured reflection. What landed? What challenged you? What do you want to explore further? You arrive prepared.",
      image: founderPortrait,
    },
    {
      num: "03",
      title: "DISCUSS WITH DEPTH",
      body: "Tuesday night is where the magic happens. A small group of curious adults — no surface level, no small talk. Real ideas, real application, real conversation.",
      image: heroCouple,
    },
    {
      num: "04",
      title: "YOUR VOICE SHAPES THE ROOM",
      body: "Once a month you nominate the podcast. Your recommendation, your topic, your night to lead. And as a founding member, your feedback shapes what Mindcast becomes.",
      image: heroPortrait,
      badge: true,
    },
  ];

  return (
    <div ref={containerRef} className="section-navy relative">
      <div className="grid md:grid-cols-[200px_1fr]">
        {/* Left sticky */}
        <div className="hidden md:flex sticky top-0 h-screen items-center justify-center">
          <div className="text-center">
            <span
              className="block font-body font-black text-[80px] leading-none"
              style={{ color: "#3585af" }}
            >
              {String(activeStep).padStart(2, "0")}
            </span>
            <span
              className="block text-[11px] tracking-[0.2em] mt-4 text-cream/20 rotate-[-90deg] origin-center font-display"
            >
              THE PRACTICE
            </span>
          </div>
        </div>

        {/* Right scrolling steps */}
        <div>
          {steps.map((s, i) => (
            <div key={i} className="timeline-step min-h-screen flex items-center py-20 px-8 md:px-16">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl">
                <div className="border-l-2 pl-8" style={{ borderColor: "#3585af" }}>
                  <span className="text-cream/20 font-body font-black text-5xl md:hidden mb-4 block">{s.num}</span>
                  <h3 className="font-body font-bold text-cream text-[24px] md:text-[32px] leading-tight mb-4">
                    {s.title}
                  </h3>
                  <p className="font-body text-[16px] leading-relaxed" style={{ color: "rgba(197,227,243,0.75)" }}>
                    {s.body}
                  </p>
                  {s.badge && (
                    <span
                      className="inline-block mt-6 px-4 py-1 text-[10px] font-body font-bold tracking-[0.12em] uppercase"
                      style={{ background: "rgba(201,137,42,0.15)", color: "#c9892a", border: "1px solid rgba(201,137,42,0.3)" }}
                    >
                      FOUNDING MEMBER
                    </span>
                  )}
                </div>
                <div className="overflow-hidden h-[300px] md:h-[400px]">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── SIGNAL TEASER ─── */
const SignalTeaser = () => {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!headlineRef.current) return;
      gsap.from(headlineRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: headlineRef.current, start: "top 80%" },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-32 grain-overlay overflow-hidden" style={{ background: "linear-gradient(to bottom, #0f1e35, #1a3a5c)" }}>
      <div className="container mx-auto px-6 text-center relative z-10">
        <span
          className="text-[12px] tracking-[0.3em] mb-6 block"
          style={{ fontFamily: "var(--font-display)", color: "#c9892a" }}
        >
          COMING SOON
        </span>
        <h2
          ref={headlineRef}
          className="font-body font-black text-cream text-[80px] md:text-[120px] tracking-[-0.03em] leading-none mb-6"
        >
          SIGNAL.
        </h2>
        <p className="font-body font-light text-[18px] md:text-[20px] max-w-2xl mx-auto leading-relaxed" style={{ color: "#c5e3f3" }}>
          A cycle-syncing wellness app built on community intelligence.
          Somatic practices. AI-generated plans. Inner work, digitised.
        </p>
        <Link
          to="/signal"
          className="inline-block mt-10 px-8 py-4 border border-cream/40 text-cream text-[12px] font-body font-bold tracking-[0.1em] uppercase hover:bg-cream hover:text-[#0f1e35] transition-all"
        >
          JOIN THE WAITLIST
        </Link>
        <p className="mt-6 text-cream/30 text-[11px] tracking-[0.1em] font-body">
          Part of the Mindcast ecosystem
        </p>
      </div>
    </section>
  );
};

/* ─── VISION QUOTE ─── */
const VisionQuote = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLSpanElement>(".quote-word").forEach((word) => {
        gsap.to(word, {
          opacity: 1,
          color: "#0f1e35",
          scrollTrigger: { trigger: word, start: "top 85%", end: "top 55%", scrub: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const quote = "The things that shaped who we are used to happen in community. Mindcast is bringing that back.";

  return (
    <section ref={sectionRef} className="section-cream grain-overlay relative min-h-screen flex items-center py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <p className="font-body font-black italic text-[32px] sm:text-[44px] md:text-[56px] leading-[1.2] tracking-[-0.02em]">
          {quote.split(" ").map((w, i) => (
            <span
              key={i}
              className="quote-word inline-block mr-[0.3em]"
              style={{ opacity: 0.15, color: "#8e9299" }}
            >
              {w}
            </span>
          ))}
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <img src={founderPortrait} alt="Ashleigh" className="w-16 h-16 rounded-full object-cover" />
          <span className="font-body text-[15px]" style={{ color: "#3585af" }}>
            — Ashleigh, Founder of Mindcast
          </span>
        </div>
      </div>
    </section>
  );
};

/* ─── IMAGE GALLERY (Masonry) ─── */
const ImageGallery = () => {
  const images = [
    { src: heroCouple, label: "THE PRACTICE", aspect: "landscape" },
    { src: heroPortrait, label: "THE SPACE", aspect: "portrait" },
    { src: founderPortrait, label: "THE FOUNDER", aspect: "portrait" },
    { src: flatlayRoadmap, label: "THE VISION", aspect: "square" },
  ];

  return (
    <section className="section-navy py-24">
      <div className="container mx-auto px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative group overflow-hidden break-inside-avoid"
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-cream text-[13px] tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {img.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── FINAL CTA ─── */
const FinalCTA = () => {
  const [spots, setSpots] = useState(12);

  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count !== null) setSpots(Math.max(0, 15 - count));
    });
  }, []);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={heroCouple}
      >
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: "rgba(15,30,53,0.75)" }} />

      <div className="relative z-10 text-center px-6">
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-body font-black text-cream text-[64px] md:text-[96px] tracking-[-0.03em] leading-none mb-4"
        >
          READY?
        </motion.h2>
        <p className="font-body font-light text-[20px] md:text-[24px] mb-8" style={{ color: "#c5e3f3" }}>
          The founding group is forming now.
        </p>
        <p className="font-body font-black text-[36px] md:text-[48px] mb-10" style={{ color: "#3585af" }}>
          {spots} SPOTS REMAINING
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/membership"
            className="px-8 py-4 bg-cream text-[#0f1e35] text-[12px] font-body font-bold tracking-[0.1em] uppercase hover:bg-[#3585af] hover:text-cream transition-all"
          >
            REGISTER FOR PILOT GROUP →
          </Link>
          <Link
            to="/signal"
            className="px-8 py-4 border border-cream/40 text-cream text-[12px] font-body font-bold tracking-[0.1em] uppercase hover:bg-cream/10 transition-all"
          >
            JOIN THE SIGNAL WAITLIST
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ─── HOME PAGE ─── */
const Home = () => {
  return (
    <div className="min-h-screen">
      <CustomCursor />
      <CinematicNav />
      <HeroSection />
      <ManifestoSection />
      <HorizontalPanels />
      <PilotGroupSection />
      <StickyTimeline />
      <SignalTeaser />
      <VisionQuote />
      <ImageGallery />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Home;
