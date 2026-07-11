import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ChevronDown, Users, GraduationCap, Baby, Sparkles, BookOpen, Podcast, Home as HomeIcon } from "lucide-react";
import heroFamily from "@/assets/home-family-workbooks.jpg";
import facilitatorRoom from "@/assets/home-facilitator-room.jpg";
import adultWorkbook from "@/assets/home-adult-workbook.jpg";
import teenWorkbook from "@/assets/home-teen-workbook.jpg";
import childColouring from "@/assets/home-child-colouring.jpg";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import lifeGroup from "@/assets/home-life-group.jpg";
import founderPortrait from "@/assets/founder-portrait.jpg";
import logoNavLight from "@/assets/logo-cream.png";
import { useAuth } from "@/contexts/AuthContext";
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
    { label: "THE GATHERING", href: "#gathering" },
    { label: "THREE TRACKS", href: "#tracks" },
    { label: "THE RHYTHM", href: "#rhythm" },
    { label: "ABOUT", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl border-b" : "bg-transparent border-b border-transparent"
      }`}
      style={scrolled ? { background: "rgba(15,30,53,0.85)", borderColor: "rgba(53,133,175,0.2)" } : {}}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/">
          <img src={logoNavLight} alt="Mindcast" className="h-7" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.label} href={l.href} className="text-[11px] font-bold tracking-[0.12em] text-cream/60 hover:text-cream transition-colors font-body">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.href} className="text-[11px] font-bold tracking-[0.12em] text-cream/60 hover:text-cream transition-colors font-body">
                {l.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {session ? (
            <Link to="/portal/dashboard" className="text-[11px] font-bold tracking-[0.12em] text-cream/60 hover:text-cream transition-colors font-body">
              PORTAL
            </Link>
          ) : (
            <Link
              to="/membership"
              className="px-5 py-2 border border-cream/30 text-cream text-[11px] font-bold tracking-[0.12em] font-body hover:bg-cream hover:text-navy transition-all min-h-[44px] flex items-center"
            >
              JOIN THE WAITLIST
            </Link>
          )}
        </div>

        <button
          className="lg:hidden text-cream w-11 h-11 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
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
          className="lg:hidden fixed inset-0 top-16 z-40"
          style={{ background: "hsl(210 56% 14%)" }}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8 safe-area-bottom">
            {links.map((l, i) => (
              <motion.div key={l.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                {l.href.startsWith("#") ? (
                  <a href={l.href} onClick={() => setMobileOpen(false)} className="text-cream text-2xl font-display tracking-widest">
                    {l.label}
                  </a>
                ) : (
                  <Link to={l.href} onClick={() => setMobileOpen(false)} className="text-cream text-2xl font-display tracking-widest">
                    {l.label}
                  </Link>
                )}
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Link
                to="/membership"
                onClick={() => setMobileOpen(false)}
                className="mt-4 px-8 py-4 border border-cream/40 text-cream text-sm tracking-widest font-body min-h-[64px] flex items-center"
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
      gsap.from(".hero-word", { y: 60, opacity: 0, stagger: 0.08, duration: 0.8, delay: 0.5, ease: "power3.out" });
      gsap.from(".hero-sub", { y: 20, opacity: 0, delay: 1.2, duration: 0.8 });
      gsap.from(".hero-cta", { y: 20, opacity: 0, delay: 1.5, duration: 0.8 });
      gsap.to(".hero-image", { scale: 1.05, duration: 12, ease: "power1.inOut", yoyo: true, repeat: -1 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-end justify-center pb-24 md:pb-32 overflow-hidden">
      <img
        src={heroFamily}
        alt="A family gathered together with open workbooks"
        className="hero-image absolute inset-0 w-full h-full object-cover"
        width={1600}
        height={1008}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(10,17,32,0.35) 0%, rgba(10,17,32,0.6) 55%, rgba(10,17,32,0.9) 100%)" }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 text-[13px] tracking-[0.25em] mb-6"
          style={{ color: "#c5e3f3", fontFamily: "var(--font-display)" }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#3585af" }} />
          COMING SOON · NEW ZEALAND
        </motion.span>

        <h1 className="font-display text-cream text-[52px] sm:text-[76px] md:text-[104px] lg:text-[132px] uppercase leading-[0.9] tracking-[0.02em]">
          {"ONE THEME.".split(" ").map((w, i) => (
            <span key={`a${i}`} className="hero-word inline-block mr-[0.2em]">{w}</span>
          ))}
          <br />
          {"THREE GENERATIONS.".split(" ").map((w, i) => (
            <span key={`b${i}`} className="hero-word inline-block mr-[0.2em]">{w}</span>
          ))}
        </h1>

        <p className="hero-sub mt-8 text-[15px] md:text-[17px] font-body max-w-2xl mx-auto leading-relaxed" style={{ color: "#e6f1f8" }}>
          A facilitated live gathering — a modern, secular alternative to Sunday service.
          Adults, teens, and children work through the same weekly theme in parallel,
          then take the practice home together.
        </p>

        <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/membership"
            className="px-8 py-4 min-h-[56px] bg-cream text-navy text-[12px] font-body font-bold tracking-[0.12em] uppercase hover:bg-primary hover:text-cream transition-all flex items-center justify-center"
          >
            JOIN THE WAITLIST →
          </Link>
          <a
            href="#gathering"
            className="px-8 py-4 min-h-[56px] border border-cream/40 text-cream text-[12px] font-body font-bold tracking-[0.12em] uppercase hover:border-cream hover:bg-cream/[0.08] transition-all flex items-center justify-center"
          >
            SEE HOW IT WORKS
          </a>
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 1 }}
        animate={{ opacity: showScroll ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-[10px] tracking-[0.25em] text-cream/50 font-display">SCROLL</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={16} className="text-cream/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ─── MANIFESTO — NOTICE. NAME. REWIRE. ─── */
const ManifestoSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLSpanElement>(".manifesto-word").forEach((word) => {
        gsap.to(word, {
          opacity: 1,
          color: "#0a1120",
          scrollTrigger: { trigger: word, start: "top 80%", end: "top 50%", scrub: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const lines = [
    "Most families consume ideas separately.",
    "Different podcasts. Different feeds. Different rooms.",
    "Mindcast is one shared practice —",
    "a place where parents, teens, and children",
    "learn to notice, name, and rewire together.",
  ];

  return (
    <section ref={sectionRef} className="section-cream grain-overlay relative min-h-screen flex items-center py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="text-[30px] sm:text-[42px] md:text-[56px] font-display leading-[1.15] tracking-[0.01em] uppercase">
          {lines.map((line, li) => (
            <p key={li} className="mb-4">
              {line.split(" ").map((word, wi) => (
                <span
                  key={wi}
                  className="manifesto-word inline-block mr-[0.28em]"
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
          <span className="text-[13px] tracking-[0.3em] font-display" style={{ color: "#3585af" }}>
            NOTICE. NAME. REWIRE.
          </span>
        </div>
      </div>
    </section>
  );
};

/* ─── THE GATHERING (facilitator hero + supporting copy) ─── */
const GatheringSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gathering-image", {
        opacity: 0, y: 40, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.from(".gathering-copy > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="gathering" className="section-navy relative py-24 md:py-32 grain-overlay overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="gathering-image relative overflow-hidden aspect-[4/5] md:aspect-[4/5]">
            <img src={facilitatorRoom} alt="A facilitator leading a warm gathering" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(10,17,32,0.6))" }} />
          </div>

          <div className="gathering-copy">
            <span className="text-[11px] tracking-[0.25em] font-body font-bold text-primary block mb-4">THE GATHERING</span>
            <h2 className="font-display text-cream text-[42px] md:text-[64px] leading-[0.95] tracking-[0.02em] uppercase mb-6">
              A LIVE WEEKLY PRACTICE — FOR EVERY GENERATION UNDER ONE ROOF.
            </h2>
            <p className="font-body text-[16px] md:text-[17px] leading-relaxed text-cream/70 mb-8">
              A facilitated Sunday gathering with parallel sessions for adults,
              teens, and children — all working through the same weekly theme.
              Warm, secular, human. Structured space for the inner work most of
              us never learned how to do.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { k: "Format", v: "Live, in person" },
                { k: "Cadence", v: "Weekly" },
                { k: "Tracks", v: "Three, in parallel" },
                { k: "Status", v: "Coming soon" },
              ].map((s) => (
                <div key={s.k} className="border-l-2 border-primary/40 pl-4">
                  <div className="text-[10px] tracking-[0.2em] font-body text-cream/40 mb-1 uppercase">{s.k}</div>
                  <div className="font-display text-cream text-[18px] tracking-wide">{s.v}</div>
                </div>
              ))}
            </div>
            <Link
              to="/membership"
              className="inline-flex items-center gap-3 px-8 py-4 min-h-[56px] bg-primary text-cream text-[12px] font-body font-bold tracking-[0.12em] uppercase hover:brightness-110 transition-all"
            >
              JOIN THE WAITLIST →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── THREE TRACKS ─── */
const TracksSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".track-card", {
        opacity: 0, y: 60, duration: 0.8, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const tracks = [
    {
      icon: Users,
      label: "ADULTS",
      title: "A REFLECTIVE WORKBOOK",
      desc: "A guided digital course book with live prompts, Q&A, and space to write into what the theme surfaces for you.",
      image: adultWorkbook,
    },
    {
      icon: GraduationCap,
      label: "TEENS",
      title: "A TEEN WORKBOOK",
      desc: "Age-appropriate prompts and reflections in their own room — real language, real questions, no talking down.",
      image: teenWorkbook,
    },
    {
      icon: Baby,
      label: "CHILDREN",
      title: "COLOURING & PICTURE-BOOK",
      desc: "Gentle activities and colouring pages built around the same weekly theme, so the little ones grow into the practice.",
      image: childColouring,
    },
  ];

  return (
    <section ref={sectionRef} id="tracks" className="section-cream grain-overlay relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <span className="text-[11px] tracking-[0.25em] font-body font-bold text-primary block mb-4">THREE TRACKS · ONE THEME</span>
          <h2 className="font-display text-navy text-[42px] md:text-[64px] leading-[0.95] tracking-[0.02em] uppercase mb-6">
            EVERY AGE. THE SAME PRACTICE.
          </h2>
          <p className="font-body text-navy/70 text-[16px] md:text-[17px] leading-relaxed">
            Adults, teens, and children each have their own interactive course book —
            different depth, different language, but always the same weekly theme.
            So what you learn on Sunday can be shared, questioned, and continued at home.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {tracks.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="track-card group bg-card border border-navy/[0.08] overflow-hidden flex flex-col">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={t.image} alt={t.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={18} className="text-primary" strokeWidth={1.5} />
                    <span className="text-[11px] tracking-[0.2em] font-body font-bold text-primary">{t.label}</span>
                  </div>
                  <h3 className="font-display text-navy text-[26px] md:text-[30px] tracking-wide uppercase leading-tight mb-3">
                    {t.title}
                  </h3>
                  <p className="font-body text-navy/70 text-[15px] leading-relaxed">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 md:mt-20 relative aspect-[16/10] md:aspect-[16/7] overflow-hidden">
          <img src={threeWorkbooks} alt="Three open workbooks side by side" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <p className="text-center mt-6 font-body italic text-navy/60 text-[15px] max-w-2xl mx-auto" style={{ fontFamily: "var(--font-serif)" }}>
          "Three workbooks. One conversation the whole family can keep having."
        </p>
      </div>
    </section>
  );
};

/* ─── THE RHYTHM — sticky timeline ─── */
const RhythmSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".rhythm-step").forEach((step, i) => {
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
      day: "SUNDAY",
      title: "THE LESSON",
      body: "Everyone gathers. Adults, teens, and children move into their own rooms and work through the same theme in parallel — through workbooks, prompts, and live facilitation.",
      image: facilitatorRoom,
      icon: Sparkles,
    },
    {
      num: "02",
      day: "TUESDAY",
      title: "LIFE GROUP",
      body: "A smaller adult-only gathering. Revisit the week's course book, re-watch the related podcast or YouTube clip, and add deeper notes together.",
      image: lifeGroup,
      icon: Podcast,
    },
    {
      num: "03",
      day: "AT HOME",
      title: "THE PRACTICE",
      body: "Because every generation worked through the same theme, the conversation continues at the dinner table, on the drive, at bedtime. The practice becomes family life.",
      image: heroFamily,
      icon: HomeIcon,
    },
  ];

  return (
    <div ref={containerRef} id="rhythm" className="section-navy relative">
      <div className="container mx-auto px-6 pt-20 md:pt-24 pb-8 max-w-4xl text-center">
        <span className="text-[11px] tracking-[0.25em] font-body font-bold text-primary block mb-4">THE WEEKLY RHYTHM</span>
        <h2 className="font-display text-cream text-[42px] md:text-[64px] leading-[0.95] tracking-[0.02em] uppercase mb-6">
          SUNDAY. TUESDAY. HOME.
        </h2>
        <p className="font-body text-cream/70 text-[16px] leading-relaxed">
          A cadence built around how change actually happens — noticed in the room,
          named in reflection, rewired in daily life.
        </p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr]">
        <div className="hidden md:flex sticky top-0 h-screen items-center justify-center">
          <div className="text-center">
            <span className="block font-display text-[96px] leading-none text-primary tracking-wide">
              {String(activeStep).padStart(2, "0")}
            </span>
            <span className="block text-[11px] tracking-[0.3em] mt-4 text-cream/30 font-display">
              THE RHYTHM
            </span>
          </div>
        </div>

        <div>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rhythm-step min-h-screen flex items-center py-20 px-6 md:px-16">
                <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center max-w-5xl">
                  <div className="border-l-2 border-primary pl-6 md:pl-8">
                    <span className="text-cream/20 font-display text-5xl md:hidden mb-4 block">{s.num}</span>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon size={16} className="text-primary" strokeWidth={1.5} />
                      <span className="text-[11px] tracking-[0.3em] font-body font-bold text-primary">{s.day}</span>
                    </div>
                    <h3 className="font-display text-cream text-[32px] md:text-[44px] leading-tight uppercase tracking-wide mb-5">
                      {s.title}
                    </h3>
                    <p className="font-body text-[16px] leading-relaxed text-cream/70">
                      {s.body}
                    </p>
                  </div>
                  <div className="overflow-hidden aspect-[4/3] md:aspect-[4/5]">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
          color: "#0a1120",
          scrollTrigger: { trigger: word, start: "top 85%", end: "top 55%", scrub: true },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const quote = "The things that shaped who we are used to happen in community — across generations, in shared rooms. Mindcast is bringing that back.";

  return (
    <section ref={sectionRef} className="section-cream grain-overlay relative min-h-screen flex items-center py-24">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <p
          className="text-[28px] sm:text-[38px] md:text-[48px] leading-[1.25] tracking-[-0.01em] italic"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
        >
          {quote.split(" ").map((w, i) => (
            <span key={i} className="quote-word inline-block mr-[0.25em]" style={{ opacity: 0.15, color: "#8e9299" }}>
              {w}
            </span>
          ))}
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <img src={founderPortrait} alt="Ashleigh" className="w-16 h-16 rounded-full object-cover" loading="lazy" />
          <div className="text-left">
            <div className="font-display text-navy text-[18px] tracking-wide">ASHLEIGH CARLSON</div>
            <div className="font-body text-[12px] tracking-[0.15em] text-primary uppercase">Founder · Mindcast</div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── FINAL CTA ─── */
const FinalCTA = () => (
  <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
    <img src={heroFamily} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    <div className="absolute inset-0" style={{ background: "rgba(10,17,32,0.82)" }} />
    <div className="absolute inset-0 grain-overlay pointer-events-none" />

    <div className="relative z-10 text-center px-6 max-w-3xl">
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-3 text-[13px] tracking-[0.3em] mb-8 font-display"
        style={{ color: "#c5e3f3" }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#3585af" }} />
        COMING SOON
      </motion.span>

      <motion.h2
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="font-display text-cream text-[56px] md:text-[104px] tracking-[0.02em] leading-[0.9] uppercase mb-6"
      >
        BRING THE WHOLE FAMILY.
      </motion.h2>
      <p className="font-body text-[16px] md:text-[19px] mb-10 text-cream/75 leading-relaxed">
        The first Mindcast gatherings are forming now. Join the waitlist to be
        invited when doors open in your area.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/membership"
          className="px-8 py-4 min-h-[56px] bg-cream text-navy text-[12px] font-body font-bold tracking-[0.12em] uppercase hover:bg-primary hover:text-cream transition-all flex items-center justify-center"
        >
          JOIN THE WAITLIST →
        </Link>
        <Link
          to="/about"
          className="px-8 py-4 min-h-[56px] border border-cream/40 text-cream text-[12px] font-body font-bold tracking-[0.12em] uppercase hover:bg-cream/10 transition-all flex items-center justify-center"
        >
          READ THE STORY
        </Link>
      </div>
    </div>
  </section>
);

/* ─── HOME PAGE ─── */
const Home = () => {
  return (
    <div className="min-h-screen">
      <CustomCursor />
      <CinematicNav />
      <HeroSection />
      <ManifestoSection />
      <GatheringSection />
      <TracksSection />
      <RhythmSection />
      <VisionQuote />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Home;
