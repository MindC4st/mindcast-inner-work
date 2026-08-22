import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Baby,
  BookOpenText,
  CalendarDays,
  Check,
  GraduationCap,
  Home as HomeIcon,
  Info,
  LogIn,
  MapPin,
  ShoppingBag,
  Users,
} from "lucide-react";

import logoBlue from "@/assets/logo-blue-wordmark.png";
import Footer from "@/components/Footer";
import Ripple from "@/components/brand/Ripple";
import { GlowButton, Reveal } from "@/components/glow";

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
    to: "/portal/login",
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

  return (
    <section className="bg-white pt-16 lg:pt-[72px]">
      <div className="grid min-h-[calc(100svh-4rem)] lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)]">
        <div className="order-2 flex items-center lg:order-1">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 md:py-16 lg:px-12 xl:px-16"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-[11px]">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>

              Founding programme · Taupō
            </div>

            <h1 className="font-display text-[clamp(3.9rem,11vw,8.5rem)] leading-[0.82] tracking-[-0.025em] text-primary">
              STOP
              <br />
              CONSUMING.
              <br />
              START DOING.
            </h1>

            <p className="mt-7 max-w-xl font-body text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
              MINDCAST is a weekly live practice for people who already know a
              lot—and want a room that helps them follow through. One theme. One
              honest intention. The same people coming back each week.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <GlowButton to="/curriculum">
                LOOK INSIDE THE CURRICULUM
              </GlowButton>

              <Link
                to="/try"
                className="inline-flex min-h-12 items-center justify-center gap-2 px-5 font-body text-xs font-bold tracking-[0.14em] text-primary transition-colors hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                GET A FREE SESSION PASS
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 divide-x divide-border border-y border-border py-5">
              {[
                ["52", "weekly themes"],
                ["3", "age tracks"],
                ["1", "intention"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="px-2 text-center first:pl-0 last:pr-0 sm:text-left"
                >
                  <dt className="font-display text-3xl leading-none text-primary sm:text-4xl">
                    {value}
                  </dt>

                  <dd className="mt-1 font-body text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative order-1 min-h-[44svh] overflow-hidden bg-muted lg:order-2 lg:min-h-full"
        >
          <img
            src={GLC_FRONT_ENTRANCE}
            alt="Families and members arriving at the Great Lake Centre for MINDCAST"
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1920}
            height={1280}
            loading="eager"
            fetchPriority="high"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#102438]/50 via-transparent to-transparent" />

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl border border-white/25 bg-white/10 p-4 text-white shadow-xl backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                Great Lake Centre
              </p>

              <p className="mt-1 font-display text-2xl tracking-wide">
                TAUPŌ · SUNDAYS
              </p>
            </div>

            <MapPin
              className="shrink-0"
              size={24}
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

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
  <section className="section-cream border-y border-border py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal>
        <SectionIntro
          eyebrow="The MINDCAST practice"
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

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
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

const WEEKLY_RHYTHM = [
  {
    day: "SUN · TODAY",
    title: "THE GATHERING",
    body: "Return to last week, explore one new theme, and leave with a small if-then intention that can survive a real week.",
    image: HOME_THE_GATHERING,
    alt: "MINDCAST members gathering on Sunday",
  },
  {
    day: "MIDWEEK",
    title: "LIFE GROUPS",
    body: "Pause with other members. Notice what is happening, name it honestly, and decide what your next small action is.",
    image: HOME_IN_THE_ROOMS,
    alt: "A MINDCAST Life Group reflecting together",
  },
  {
    day: "FRI",
    title: "THE CHECK-IN",
    body: "Capture what happened while it is still fresh. Your reflection is saved, ready to meet you when Sunday comes around again.",
    image: HOME_BEFORE_YOU_LEAVE,
    alt: "A MINDCAST member writing a weekly reflection",
  },
];

const RhythmSection = () => (
  <section className="bg-white py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>
          <SectionIntro
            eyebrow="How it works"
            title="A RHYTHM BUILT FOR REAL LIFE."
            body={
              <p className="max-w-2xl">
                The live Sunday session matters—but the practice is designed to
                travel with you through the rest of the week.
              </p>
            }
          />
        </Reveal>

        <Reveal delay={0.1}>
          <Link
            to="/curriculum"
            className="inline-flex min-h-12 items-center gap-2 font-body text-xs font-bold tracking-[0.14em] text-primary underline decoration-primary/25 underline-offset-8 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            EXPLORE HOW IT WORKS
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
        {WEEKLY_RHYTHM.map((step, index) => (
          <Reveal
            key={step.day}
            delay={index * 0.08}
            className="w-[84vw] max-w-sm shrink-0 snap-center sm:w-[58vw] lg:w-auto lg:max-w-none"
          >
            <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_12px_35px_rgba(16,36,56,0.07)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={step.image}
                  alt={step.alt}
                  className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]"
                  width={1200}
                  height={900}
                  loading="lazy"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 font-body text-[10px] font-bold tracking-[0.18em] text-primary shadow-sm backdrop-blur">
                  {step.day}
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="font-display text-3xl tracking-wide text-primary sm:text-4xl">
                    {step.title}
                  </h3>

                  <span className="font-display text-3xl text-primary/20">
                    0{index + 1}
                  </span>
                </div>

                <p className="font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {step.body}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const TRACKS = [
  {
    name: "ADULTS",
    href: "/curriculum#adult",
    icon: Users,
    image: GLC_ADULTS_ROOM,
    alt: "Adults in the main MINDCAST room",
    body: "Live facilitation, private reflection, honest conversation, and one practical intention for the week.",
  },
  {
    name: "TEENS",
    href: "/curriculum#teen",
    icon: GraduationCap,
    image: GLC_TEENS_ROOM,
    alt: "Teenagers in their MINDCAST room",
    body: "The same weekly theme in relevant language, with their own room, worksheet, and privacy-respecting reflection.",
  },
  {
    name: "CHILDREN",
    href: "/curriculum#child",
    icon: Baby,
    image: GLC_KIDS_ROOM,
    alt: "Children taking part in a MINDCAST activity",
    body: "Age-appropriate stories, movement, colouring, and play that help younger minds practise the same shared language.",
  },
];

const TracksSection = () => (
  <section className="section-cream border-y border-border py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
      <Reveal>
        <SectionIntro
          eyebrow="Every age. The same work."
          title="ONE THEME. THREE ROOMS."
          body={
            <p className="max-w-2xl">
              Adults, teens, and children explore the same idea in spaces
              designed for them—so the conversation can continue naturally at
              home.
            </p>
          }
          align="center"
        />
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {TRACKS.map((track, index) => {
          const Icon = track.icon;

          return (
            <Reveal key={track.name} delay={index * 0.08}>
              <Link
                to={track.href}
                aria-label={`Explore the ${track.name.toLowerCase()} curriculum`}
                className="group block h-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_35px_rgba(16,36,56,0.06)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_45px_rgba(16,36,56,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              >
                <div className="aspect-[16/11] overflow-hidden bg-muted">
                  <img
                    src={track.image}
                    alt={track.alt}
                    className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]"
                    width={1400}
                    height={1050}
                    loading="lazy"
                  />
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <Icon
                      className="text-primary"
                      size={28}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <ArrowRight
                      className="text-primary transition-transform duration-200 group-hover:translate-x-1"
                      size={20}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-8 font-display text-4xl tracking-wide text-primary sm:text-5xl">
                    {track.name}
                  </h3>

                  <p className="mt-4 font-body text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {track.body}
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

const VenueSection = () => (
  <section className="bg-white py-20 sm:py-24 lg:py-32">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
      <Reveal className="relative overflow-hidden rounded-2xl bg-muted shadow-[0_18px_55px_rgba(16,36,56,0.12)]">
        <img
          src={GLC_FRONT_ENTRANCE}
          alt="The entrance to the Great Lake Centre in Taupō"
          className="aspect-[4/3] h-full w-full object-cover"
          width={1600}
          height={1200}
          loading="lazy"
        />

        <div className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-[#102438]/80 px-4 py-2 font-body text-[10px] font-bold tracking-[0.18em] text-white backdrop-blur-md sm:bottom-5 sm:left-5">
          5 STORY PLACE · TAUPŌ
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <SectionIntro
          eyebrow="A real room, not another feed"
          title="WHERE WE MEET."
          body={
            <>
              <p>
                MINDCAST gathers at the Great Lake Centre in the heart of Taupō.
                Three rooms run at the same time, making it possible for a whole
                household to take part without everyone having the same
                experience.
              </p>

              <ul
                className="mt-7 space-y-3"
                aria-label="Venue benefits"
              >
                {[
                  "Adults, teens, and children meet in dedicated spaces",
                  "Central Taupō location with nearby parking and amenities",
                  "A consistent weekly room designed for belonging and follow-through",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm sm:text-base">
                    <Check
                      className="mt-0.5 shrink-0 text-primary"
                      size={19}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          }
        />

        <Link
          to="/about#where-we-meet"
          className="mt-8 inline-flex min-h-12 items-center gap-2 font-body text-xs font-bold tracking-[0.14em] text-primary underline decoration-primary/25 underline-offset-8 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
        >
          ABOUT MINDCAST
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </Reveal>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="section-cream border-t border-border py-20 sm:py-24 lg:py-32">
    <div className="mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
      <Reveal>
        <CalendarDays
          className="mx-auto mb-6 text-primary"
          size={30}
          strokeWidth={1.7}
          aria-hidden="true"
        />

        <p className="font-body text-[11px] font-bold uppercase tracking-[0.34em] text-primary">
          Before you commit to anything
        </p>

        <h2 className="mt-5 font-display text-[clamp(3.2rem,9vw,7.5rem)] leading-[0.88] tracking-tight text-primary">
          COME AND SIT IN
          <br />
          THE ROOM FIRST.
        </h2>

        <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Try one full Sunday session. No card details, no obligation, and no
          awkward follow-up if it is not for you.
        </p>

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <GlowButton to="/try">
            GET A FREE SESSION PASS
          </GlowButton>

          <GlowButton to="/membership" variant="outline">
            VIEW MEMBERSHIP OPTIONS
          </GlowButton>
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
      <PracticeSection />
      <RhythmSection />
      <TracksSection />
      <VenueSection />
      <FinalCTA />
    </main>

    <Footer variant="light" />
  </div>
);

export default Home;
