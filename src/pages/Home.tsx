import { useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  BookOpenText,
  Home as HomeIcon,
  Info,
  LogIn,
  ShoppingBag,
} from "lucide-react";

import logoBlue from "@/assets/logo-blue-wordmark.png";
import Footer from "@/components/Footer";
import Ripple from "@/components/brand/Ripple";
import { GlowButton, Reveal } from "@/components/glow";

const HOME_HOW_IT_WORKS =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/home-howitworks.jpg";
const GLC_FRONT_ENTRANCE =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-frontentrance.png";
const GLC_ADULTS_ROOM =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-adultsroom.png";
const GLC_TEENS_ROOM =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-teensroom.png";
const GLC_KIDS_ROOM =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/glc-kidsroom.png";

const HOME_THE_GATHERING =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/homepage-thegathering.png";
const HOME_IN_THE_ROOMS =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/homepage-intherooms.png";
const HOME_BEFORE_YOU_LEAVE =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/homepage-beforeyouleave.png";

const NAV_ITEMS = [
  { label: "HOME", mobileLabel: "Home", to: "/", icon: HomeIcon },
  { label: "ABOUT", mobileLabel: "About", to: "/about", icon: Info },
  {
    label: "HOW IT WORKS",
    mobileLabel: "How",
    to: "/curriculum",
    icon: BookOpenText,
  },
  { label: "SHOP", mobileLabel: "Shop", to: "/shop", icon: ShoppingBag },
  {
    label: "SIGN IN",
    mobileLabel: "Sign in",
    to: "/auth",
    icon: LogIn,
  },
] as const;

const isActiveRoute = (pathname: string, to: string) => {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
};

const SiteNavigation = () => {
  const { pathname } = useLocation();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-white/95 shadow-[0_1px_0_rgba(16,36,56,0.03)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link
            to="/"
            aria-label="MINDCAST home"
            className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <img
              src={logoBlue}
              alt="MINDCAST"
              className="h-8 w-auto sm:h-9"
              width={286}
              height={48}
            />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActiveRoute(pathname, item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`group relative inline-flex min-h-11 items-center px-4 font-body text-[11px] font-bold tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.label}

                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 bottom-1 h-0.5 origin-left bg-primary transition-transform duration-200 ${
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="lg:hidden">
            <span className="inline-flex min-h-9 items-center rounded-full border border-primary/20 bg-primary/5 px-3 font-body text-[10px] font-bold tracking-[0.14em] text-primary">
              TAUPŌ · SUNDAYS
            </span>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(16,36,56,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 font-body text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span>{item.mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

type SectionIntroProps = {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
};

const SectionIntro = ({
  eyebrow,
  title,
  body,
  align = "left",
}: SectionIntroProps) => (
  <div
    className={
      align === "center"
        ? "mx-auto max-w-3xl text-center"
        : "max-w-3xl"
    }
  >
    <p className="mb-4 font-body text-[11px] font-bold uppercase tracking-[0.34em] text-primary">
      {eyebrow}
    </p>

    <h2 className="font-display text-[clamp(2.6rem,7vw,5.8rem)] leading-[0.94] tracking-tight text-primary">
      {title}
    </h2>

    {body ? (
      <div className="mt-6 font-body text-base leading-7 text-muted-foreground md:text-lg">
        {body}
      </div>
    ) : null}
  </div>
);

const HeroSection = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-fade: as the visitor scrolls through the hero, the full-bleed
  // background image dissolves toward the solid ivory beneath it, so the photo
  // never bleeds into (or distracts from) the content block that follows.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[hsl(var(--ivory))]"
    >
      {/* Full-bleed background image (fades to ivory on scroll). */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={reduceMotion ? { opacity: 1 } : { opacity: imageOpacity }}
      >
        <img
          src={GLC_FRONT_ENTRANCE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1920}
          height={1280}
          loading="eager"
          fetchPriority="high"
        />
        {/* Dark scrim so the centered white type stays legible on the photo. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#102438]/62 via-[#102438]/38 to-[#102438]/66" />
      </motion.div>

      {/* Centered content. */}
      <div className="relative z-10 flex h-full items-center justify-center px-5 sm:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto w-full max-w-3xl pt-16 text-center lg:pt-[72px]"
        >
          <p
            className="mb-6 font-body text-[11px] font-bold uppercase tracking-[0.32em] text-white/85 sm:text-xs"
            style={{ textShadow: "0 1px 12px rgba(16,36,56,0.55)" }}
          >
            COMING SOON · TAUPŌ, AOTEAROA NEW ZEALAND
          </p>

          <h1
            className="font-display leading-[0.85] tracking-[-0.02em] text-white text-[clamp(3.4rem,10vw,7.5rem)]"
            style={{ textShadow: "0 2px 24px rgba(16,36,56,0.45)" }}
          >
            STOP CONSUMING.
            <br />
            START DOING.
          </h1>

          <p
            className="mx-auto mt-7 max-w-2xl font-body text-base leading-7 text-white/90 sm:text-lg sm:leading-8"
            style={{ textShadow: "0 1px 16px rgba(16,36,56,0.55)" }}
          >
            We consume more self-development than any generation before
            us—and apply almost none of it. MINDCAST is a weekly live practice
            for people who want a room that actually helps them follow through.
            One theme. One honest intention. The same people coming back each
            week.
          </p>

          <div className="mt-9 flex justify-center">
            <GlowButton to="/membership">JOIN THE FOUNDING WAITLIST</GlowButton>
          </div>

          <p
            className="mx-auto mt-5 max-w-xl text-sm italic leading-6 text-white/85 sm:text-[15px]"
            style={{
              fontFamily: "var(--font-serif)",
              textShadow: "0 1px 14px rgba(16,36,56,0.55)",
            }}
          >
            The first 100 to register receive a complimentary NFC
            smart-bracelet—your physical key for tap-and-go room entry and
            instant session access.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const MANIFESTO_LINES = [
  "You are unaware, so you don't change.",
  "You are aware, but you still don't change.",
  "You are aware, you take action, and you come back next week.",
];

/** One manifesto line: massive display type, scrubbed from low opacity to
 *  full as it reaches reading position — the scroll sets the reading pace,
 *  highlighting one line at a time. */
const ManifestoLine = ({ children }: { children: string }) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 45%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    <motion.p
      ref={ref}
      style={reduceMotion ? undefined : { opacity }}
      className="mb-10 font-display text-4xl leading-[1.05] tracking-[-0.01em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
    >
      {children}
    </motion.p>
  );
};

const ManifestoSection = () => (
  <section className="section-cream border-y border-border py-28 sm:py-36 md:py-44">
    <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
      <p className="mb-14 font-body text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
        THREE KINDS OF PEOPLE
      </p>

      {MANIFESTO_LINES.map((line) => (
        <ManifestoLine key={line}>{line}</ManifestoLine>
      ))}

      <Reveal delay={0.1}>
        <p className="mt-16 font-serif text-2xl italic leading-snug text-primary md:text-3xl">
          Mindcast is the room built for the third.
        </p>
      </Reveal>
    </div>
  </section>
);

/* ── How It Works — 50/50 split: image left, vertically centered copy right ── */

const HowItWorksSection = () => (
  <section className="bg-white">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-border">
          <img
            src={HOME_HOW_IT_WORKS}
            alt="A woman sitting with the open Mindcast binder"
            className="aspect-[4/3] h-full w-full object-cover object-center"
            width={1400}
            height={1050}
            loading="lazy"
          />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="max-w-xl">
          <SectionIntro
            eyebrow="How it works"
            title={
              <>
                WE ALL KNOW WHAT TO DO.
                <br />
                WHY AREN&apos;T WE DOING IT?
              </>
            }
          />

          <p className="mt-6 font-body text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            We&apos;ve listened to the podcast. Read the book. Saved the quote.
            Then Monday arrives, and nothing actually changes. Mindcast is the
            missing step. We are a weekly live room designed to bring the
            unconscious to the conscious, help you set one honest intention, and
            ensure you come back next week to be held to it.
          </p>

          <div className="mt-8">
            <GlowButton to="/about" variant="outline">
              READ THE STORY
            </GlowButton>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── The Practice — methodology cards, directly below How It Works ───────── */

const PRACTICE_STEPS = [
  {
    number: "01",
    title: "NOTICE IT.",
    body: "Slow down long enough to see what is actually shaping your attention, reactions, and choices.",
  },
  {
    number: "02",
    title: "NAME IT.",
    body: "Put honest language around what you notice—without judgement, fixing, or being preached at.",
  },
  {
    number: "03",
    title: "DO IT.",
    body: "Turn insight into one small, specific intention, then return next week and see what happened.",
  },
];

const PracticeSection = () => (
  <section className="bg-white pb-20 pt-8 sm:pb-24 sm:pt-10 lg:pb-32 lg:pt-14">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal>
        <SectionIntro
          eyebrow="The Mindcast practice"
          title={
            <>
              THE GAP ISN&apos;T KNOWLEDGE.
              <br />
              IT&apos;S FOLLOW-THROUGH.
            </>
          }
          body={
            <p className="max-w-2xl">
              You do not need another feed full of advice. You need enough space
              to hear yourself, a practical next step, and a reason to come back
              to it.
            </p>
          }
        />
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
        {PRACTICE_STEPS.map((step, index) => (
          <Reveal key={step.number} delay={index * 0.08}>
            <article className="h-full bg-white p-6 sm:p-8 lg:p-9">
              <div className="mb-10 flex items-center justify-between">
                <span className="font-display text-4xl text-primary/25">
                  {step.number}
                </span>

                <Ripple
                  size={28}
                  className="text-primary"
                  animate={index === 0}
                />
              </div>

              <h3 className="font-display text-4xl tracking-wide text-primary sm:text-5xl">
                {step.title}
              </h3>

              <p className="mt-4 font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {step.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const RHYTHM_STEPS = [
  {
    day: "SUNDAY",
    title: "THE GATHERING",
    body: "Return to last week, explore one new theme, and leave with a small if-then intention that can survive a real week.",
    image: HOME_THE_GATHERING,
    alt: "MINDCAST members gathering in the foyer on Sunday",
  },
  {
    day: "MIDWEEK",
    title: "LIFE GROUPS",
    body: "Pause with other members. Notice what is happening, name it honestly, and decide what your next small action is.",
    image: HOME_IN_THE_ROOMS,
    alt: "Teens sitting in a circle at a MINDCAST Life Group",
  },
  {
    day: "FRIDAY",
    title: "THE CHECK-IN",
    body: "Capture what happened while it is still fresh. Your reflection is saved, ready to meet you when Sunday comes around.",
    image: HOME_BEFORE_YOU_LEAVE,
    alt: "A woman writing her weekly reflection in the auditorium",
  },
];

/** Circular node on the tracking line — fills as its step scrolls into view. */
const RhythmNode = () => {
  const reduceMotion = useReducedMotion();
  return (
    <span
      aria-hidden="true"
      className="absolute left-4 top-1 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary/30 bg-white md:left-1/2 md:top-1/2 md:-translate-y-1/2"
    >
      <motion.span
        initial={reduceMotion ? { scale: 1 } : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="h-3.5 w-3.5 rounded-full bg-primary"
      />
    </span>
  );
};

const RhythmSection = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // The central line draws itself as the visitor moves through the week.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 55%"],
  });
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-24 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto mb-20 max-w-3xl text-center lg:mb-28">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.34em] text-primary">
            NOTICE IT. NAME IT. DO IT.
          </p>

          <h2 className="mt-4 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-tight text-primary">
            THE RHYTHM
          </h2>

          <p className="mx-auto mt-6 max-w-2xl font-body text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            A structure built around the only thing that actually changes
            behaviour: coming back next week and being asked if you did it.
          </p>
        </div>

        <div className="relative">
          {/* Central tracking line — left rail on mobile, centred on desktop. */}
          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-4 top-0 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/60 via-primary/35 to-primary/10 md:left-1/2"
            style={reduceMotion ? undefined : { scaleY: spineScale }}
          />

          {RHYTHM_STEPS.map((step, index) => {
            const imageLeft = index % 2 === 0;

            return (
              <div
                key={step.title}
                className="relative pb-20 last:pb-0 lg:pb-28"
              >
                <RhythmNode />

                <div className="grid items-center gap-8 pl-12 md:grid-cols-2 md:gap-x-24 md:pl-0">
                  <Reveal className={imageLeft ? "" : "md:order-2"}>
                    <div className="overflow-hidden rounded-2xl border border-border shadow-[0_12px_35px_rgba(16,36,56,0.07)]">
                      <img
                        src={step.image}
                        alt={step.alt}
                        className="aspect-[4/3] w-full object-cover object-center"
                        width={1200}
                        height={900}
                        loading="lazy"
                      />
                    </div>
                  </Reveal>

                  <div className={imageLeft ? "" : "md:order-1"}>
                    <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                      Step 0{index + 1} · {step.day}
                    </p>

                    <h3 className="mt-3 font-display text-4xl leading-none tracking-wide text-primary sm:text-5xl">
                      {step.title}
                    </h3>

                    <p className="mt-5 max-w-md font-body text-base leading-7 text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const TRACK_SLIDES = [
  {
    title: "ADULTS",
    body: "A guided digital course book featuring live prompts, Q&A, and dedicated space to unpack what the weekly theme surfaces for you.",
    image: GLC_ADULTS_ROOM,
    alt: "Adults in the main MINDCAST room",
  },
  {
    title: "TEENS",
    body: "Relevant prompts and reflections in a private room. Real language, real questions, and absolutely no talking down. (Phones away).",
    image: GLC_TEENS_ROOM,
    alt: "Teenagers in their MINDCAST room",
  },
  {
    title: "CHILDREN",
    body: "Gentle activities, movement, and guided play built around the weekly theme, allowing younger minds to safely grow into the practice.",
    image: GLC_KIDS_ROOM,
    alt: "Children taking part in a MINDCAST activity",
  },
];

/** One room: large image left, text box right. */
const TrackSlide = ({
  slide,
  index,
}: {
  slide: (typeof TRACK_SLIDES)[number];
  index: number;
}) => (
  <div className="flex w-full shrink-0 items-center px-5 sm:px-8 lg:px-16">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className="overflow-hidden rounded-2xl border border-border shadow-[0_18px_55px_rgba(16,36,56,0.12)]">
        <img
          src={slide.image}
          alt={slide.alt}
          className="aspect-[4/3] h-full w-full object-cover object-center"
          width={1400}
          height={1050}
          loading="lazy"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white p-7 sm:p-9">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
          Room 0{index + 1} of 03
        </p>

        <h3 className="mt-3 font-display text-5xl tracking-wide text-primary sm:text-6xl">
          {slide.title}
        </h3>

        <p className="mt-5 font-body text-base leading-7 text-muted-foreground">
          {slide.body}
        </p>
      </div>
    </div>
  </div>
);

/** Sticky-scroll slider: the section pins while the rooms slide across. */
const TracksSection = () => {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.6667%"]);

  // Track which room is in view so the dashes follow the scroll.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(Math.min(TRACK_SLIDES.length - 1, Math.floor(value * TRACK_SLIDES.length)));
  });

  const header = (
    <div className="mx-auto max-w-3xl text-center">
      <SectionIntro
        eyebrow="Every age. The same work."
        title="ONE THEME. THREE ROOMS."
        body={
          <p className="max-w-2xl mx-auto">
            Real behavioural change starts with a shared language at home.
            Adults, teens, and children each have their own dedicated space,
            tailored workbook, and expert facilitation—all exploring the exact
            same weekly theme.
          </p>
        }
        align="center"
      />

      <div
        className="mt-8 flex items-center justify-center gap-3"
        aria-hidden="true"
      >
        {TRACK_SLIDES.map((slide, index) => (
          <span
            key={slide.title}
            className={`h-1 rounded-full transition-all duration-300 ${
              active === index
                ? "w-10 bg-primary"
                : "w-4 bg-primary/20"
            }`}
          />
        ))}
      </div>
    </div>
  );

  // Reduced motion: no pinning or sliding — the rooms simply stack.
  if (reduceMotion) {
    return (
      <section className="section-cream border-y border-border py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {header}

          <div className="mt-14 space-y-14">
            {TRACK_SLIDES.map((slide, index) => (
              <TrackSlide key={slide.title} slide={slide} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="section-cream relative h-[300vh] border-y border-border"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-10">
        {header}

        <motion.div
          className="mt-12 flex h-[52vh] w-[300%] min-h-[380px]"
          style={{ x }}
        >
          {TRACK_SLIDES.map((slide, index) => (
            <TrackSlide key={slide.title} slide={slide} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const VENUE_POINTS = [
  {
    label: "ADULTS",
    desc: "The main hall. An expansive, focused space for the adult community to gather, learn, and do the work.",
  },
  {
    label: "TEENS",
    desc: "Their own private meeting room. Phones away, real conversations, and no adults wandering through.",
  },
  {
    label: "CHILDREN",
    desc: "A dedicated, secure space of their own with plenty of room to move, play, and engage.",
  },
  {
    label: "THE CONNECTION",
    desc: "Steps away from the CBD. Grab a coffee beforehand, or arrange to meet up with other members afterward to keep the conversation going.",
  },
];

const VenueSection = () => (
  <section className="bg-white py-20 sm:py-24 lg:py-32">
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
      {/* Left: intro + the 2x2 room grid. */}
      <div>
        <Reveal>
          <SectionIntro
            eyebrow="Taupō"
            title="WHERE WE MEET"
            body={
              <p>
                We gather at the Great Lake Centre, 5 Story Place—a
                600-person venue in the heart of town. Three dedicated rooms
                run simultaneously, allowing your whole household to attend.
                And because we are right in the CBD, the experience doesn&apos;t
                have to end when the session does.
              </p>
            }
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {VENUE_POINTS.map((point, index) => (
            <Reveal key={point.label} delay={0.05 * index}>
              <div className="h-full rounded-xl border border-border bg-card p-5 sm:p-6">
                <p className="font-display text-2xl tracking-wide text-primary">
                  {point.label}
                </p>

                <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                  {point.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Right: the venue. */}
      <Reveal delay={0.1}>
        <div className="overflow-hidden rounded-2xl shadow-[0_18px_55px_rgba(16,36,56,0.12)]">
          <img
            src={GLC_FRONT_ENTRANCE}
            alt="The entrance to the Great Lake Centre in Taupō"
            className="aspect-[4/3] h-full w-full object-cover object-center"
            width={1600}
            height={1200}
            loading="lazy"
          />
        </div>
      </Reveal>
    </div>
  </section>
);

const FOUNDER_PORTRAIT =
  "https://pjyelgogdsuiugaudecc.supabase.co/storage/v1/object/public/assets/founder-portrait.jpg";

const FounderQuote = () => (
  <section className="section-cream border-y border-border py-24 sm:py-28 lg:py-36">
    <div className="mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
      <Reveal>
        <blockquote className="mx-auto max-w-3xl font-display text-3xl leading-[1.15] tracking-tight text-[hsl(var(--navy))] sm:text-4xl md:text-5xl">
          &ldquo;We don&apos;t have a knowledge problem. We have a
          follow-through problem. Mindcast is the room that finally closes
          that gap — together, every week.&rdquo;
        </blockquote>

        <div className="mt-10 flex items-center justify-center gap-4">
          <img
            src={FOUNDER_PORTRAIT}
            alt="Ashleigh Carlson, founder of Mindcast"
            className="h-14 w-14 rounded-full object-cover"
            width={112}
            height={112}
            loading="lazy"
          />

          <p className="text-left font-body text-sm text-muted-foreground">
            Ashleigh Carlson
            <span className="block text-xs text-muted-foreground/60">
              Founder
            </span>
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="section-cream py-24 sm:py-32 lg:py-40">
    <div className="mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.34em] text-primary">
          Secure your place
        </p>

        <h2 className="mt-5 font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.88] tracking-tight text-primary">
          BE THE FIRST IN THE ROOM.
        </h2>

        <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          The pilot cohort is forming now. Join the waitlist to secure your
          spot before the doors open to the public. The first 100 founding
          members receive a complimentary NFC smart-bracelet—your physical key
          for instant session access.
        </p>

        <div className="mt-10 flex justify-center">
          <GlowButton to="/membership">JOIN THE FOUNDING WAITLIST</GlowButton>
        </div>
      </Reveal>
    </div>
  </section>
);

const Home = () => (
  <div className="min-h-screen bg-white pb-[76px] lg:pb-0">
    <SiteNavigation />

    <main>
      <HeroSection />
      <ManifestoSection />
      <HowItWorksSection />
      <PracticeSection />
      <RhythmSection />
      <TracksSection />
      <VenueSection />
      <FounderQuote />
      <FinalCTA />
    </main>

    <Footer variant="light" />
  </div>
);

export default Home;
