// /curriculum — "Look inside Mindcast."
//
// The job of this page is comprehension, not conversion. A visitor should
// leave knowing that Mindcast is one structured 52-week year in four blocks,
// that the week continues past Sunday, and that adults, teens and children
// work the same idea in three genuinely different rooms. The membership CTA
// does not appear until the final section, on purpose.
//
// Everything the page says about the curriculum comes from one of two places:
// the anon-safe `curriculum_public` RPC (via useCurriculumWeeks, already used
// by the member portal), or the curated constants in lib/curriculumPublic.ts.
// Nothing reads `mindcast_live_sessions`, which is where the facilitator
// notes, watch-fors and source trails live.

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Ripple from "@/components/brand/Ripple";
import { Reveal, SectionHeading, GlowButton, ScrollProgress } from "@/components/glow";
import JourneyMap from "@/components/curriculum/JourneyMap";
import WeekOnePreview from "@/components/curriculum/WeekOnePreview";
import WorkbookPage, { INK, RULE, SIGNAL_DEEP, WritingLines } from "@/components/curriculum/WorkbookPage";
import { useCurriculumWeeks } from "@/hooks/useCurriculumWeeks";
import {
  BLOCKS,
  NOTICE_NAME_DO,
  RHYTHM,
  WEEK1_THEME,
} from "@/lib/curriculumPublic";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import trackAdult from "@/assets/track-adult.jpg";
import trackTeen from "@/assets/track-teen.jpg";
import trackKids from "@/assets/track-kids.jpg";
import flatlayRoadmap from "@/assets/flatlay-roadmap.jpg";

const scrollTo = (id: string) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** SEE CLEARLY → UNLEARN → REBUILD → LIVE IT. Used twice, top and bottom. */
const BlockSpine = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-3 ${className}`}>
    {BLOCKS.map((b, i) => (
      <span key={b.number} className="flex items-center gap-4">
        <span className="font-display text-lg sm:text-2xl tracking-[0.14em] text-foreground/80">
          {b.name.toUpperCase()}
        </span>
        {i < BLOCKS.length - 1 && <span className="text-primary" aria-hidden>→</span>}
      </span>
    ))}
  </div>
);

/* ── 1 · HERO ─────────────────────────────────────────────────────────────*/

const Hero = () => (
  <section className="section-white pt-32 pb-24 md:pt-40 md:pb-32">
    <div className="container mx-auto px-6 max-w-4xl text-center">
      <Reveal>
        <p className="font-body text-[11px] font-bold tracking-[0.4em] uppercase text-primary mb-6">
          The Mindcast Curriculum
        </p>
        <h1 className="font-display text-foreground leading-[0.92] tracking-tight text-6xl sm:text-7xl md:text-8xl mb-8">
          LOOK INSIDE
          <br />
          MINDCAST.
        </h1>
        <p className="font-body text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12">
          52 weeks of learning to notice more clearly, question what no longer fits, rebuild
          deliberately and put it into practice — with experiences created separately for adults,
          teens and children.
        </p>
      </Reveal>

      <Reveal delay={0.12}>
        <BlockSpine className="mb-12" />
      </Reveal>

      <Reveal delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <GlowButton href="#week-one" onClick={scrollTo("week-one")}>
            EXPLORE WEEK 1 ↓
          </GlowButton>
          <button
            onClick={scrollTo("journey")}
            className="font-body text-xs font-bold tracking-[0.2em] uppercase text-primary hover:underline"
          >
            See the 52-week journey
          </button>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── 2 · THE 52-WEEK JOURNEY ──────────────────────────────────────────────*/

const Journey = ({
  weeks,
  loading,
}: {
  weeks: ReturnType<typeof useCurriculumWeeks>["weeks"];
  loading: boolean;
}) => (
  <section id="journey" className="section-cream py-28 md:py-36 scroll-mt-16">
    <div className="container mx-auto px-6 max-w-5xl">
      <div className="text-center mb-16">
        <SectionHeading label="The shape of the year" title={<>ONE YEAR.<br />FOUR DELIBERATE BLOCKS.</>} />
        <Reveal delay={0.1}>
          <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
            Mindcast does not treat personal development as 52 unrelated topics. The year moves
            through four connected blocks, and each one depends on the one before it.
          </p>
        </Reveal>
      </div>

      <JourneyMap weeks={weeks} loading={loading} onPreviewWeekOne={scrollTo("week-one")} />
    </div>
  </section>
);

/* ── 3 · ONE IDEA, THREE EXPERIENCES ──────────────────────────────────────*/

const THREE = [
  {
    label: "ADULT",
    image: trackAdult,
    body: "Reflective, evidence-informed, and connected to real decisions, patterns and behaviour.",
  },
  {
    label: "TEEN",
    image: trackTeen,
    body: "Relevant to teenage life — relationships, social influence, identity, school, online environments and growing independence.",
  },
  {
    label: "CHILD",
    image: trackKids,
    body: "Movement, pictures, stories, games, simple language, and safe opportunities to notice and practise.",
  },
];

const ThreeExperiences = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  return (
    <section ref={ref} className="section-white py-28 md:py-36 overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <SectionHeading label="Three rooms, one week" title={<>ONE IDEA.<br />THREE EXPERIENCES.<br />ONE CONVERSATION.</>} />
          <Reveal delay={0.1}>
            <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Adults, teens and children do not sit through the same lesson. Each track explores the
              week's shared idea through language, examples and activities designed for that stage of
              life. Underneath, the family is building a shared language.
            </p>
          </Reveal>
        </div>

        {/* No cards. A plate, a rule, and the words underneath — the way a
            book sets three figures across a spread. */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-10">
          {THREE.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.08}>
              <div className="aspect-[4/3] overflow-hidden mb-6">
                <img src={t.image} alt="" className="w-full h-full object-cover object-center" loading="lazy" width={1200} height={900} />
              </div>
              <p className="font-display text-[26px] tracking-[0.16em] text-foreground pb-4 mb-4 border-b border-border">
                {t.label}
              </p>
              <p className="font-body text-[15px] text-muted-foreground leading-[1.75]">{t.body}</p>
            </Reveal>
          ))}
        </div>

        {/* The convergence. Three lines meeting is the whole differentiator,
            so it is drawn rather than described. */}
        <div className="mt-4 flex justify-center" aria-hidden>
          <svg viewBox="0 0 600 90" className="w-full max-w-3xl h-[90px]" fill="none">
            {[100, 300, 500].map((x, i) => (
              <motion.path
                key={x}
                d={`M ${x} 0 C ${x} 45, 300 45, 300 90`}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeOpacity="0.5"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </svg>
        </div>

        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-4 border border-primary/40 px-8 py-5">
              <Ripple size={24} />
              <span className="font-display text-2xl md:text-3xl tracking-[0.14em] text-foreground">
                SHARED LANGUAGE AT HOME
              </span>
            </span>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto mt-8">
              A nine-year-old and a forty-year-old leave the building with words for the same thing.
              That is what makes the conversation in the car on the way home possible.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── 4 · HOW A MINDCAST WEEK WORKS ────────────────────────────────────────*/

const WeekRhythm = () => (
  <section id="rhythm" className="section-cream py-28 md:py-36 scroll-mt-16">
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="text-center mb-16">
        <SectionHeading label="The week, not the hour" title="SUNDAY IS ONLY THE BEGINNING." />
        <Reveal delay={0.1}>
          <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
            A Mindcast week does not end when the live session does. You take one small idea into
            real life, notice what actually happens, check back in, and return to the next session
            with something real to reflect on.
          </p>
        </Reveal>
      </div>

      {/* Horizontal on desktop, vertical on mobile — the connector flips with
          the axis, so the arrow always points the way the eye is travelling. */}
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {RHYTHM.map((step, i) => (
          <Reveal
            key={step.day + step.title}
            delay={i * 0.07}
            className="flex-1 flex flex-col lg:flex-row lg:items-stretch"
          >
            {i > 0 && (
              <span
                aria-hidden
                className="flex items-center justify-center text-primary text-xl py-3 lg:py-0 lg:px-4"
              >
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>
            )}
            <div
              className={`flex-1 bg-card border p-7 ${
                step.returns ? "border-primary" : "border-border"
              }`}
            >
              <p className="font-display text-xl tracking-[0.15em] text-primary mb-1">{step.day}</p>
              <p className="font-body text-sm font-bold text-foreground mb-3">{step.title}</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              {step.returns && (
                <p className="font-body text-[10px] font-bold tracking-[0.2em] uppercase text-primary mt-5">
                  ↻ and round again
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="text-center mt-16">
          <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground mb-5">
            For adults, the week runs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {NOTICE_NAME_DO.map((s, i) => (
              <span key={s} className="flex items-center gap-4">
                <span className="font-display text-2xl md:text-4xl tracking-[0.12em] text-foreground">{s}</span>
                {i < NOTICE_NAME_DO.length - 1 && <span className="text-primary" aria-hidden>→</span>}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── 5 / 7 / 8 · WEEK 1 PREVIEW ───────────────────────────────────────────*/

// Ivory band on purpose: the sheet inside is white, so it reads as paper
// lying on the page rather than as a panel welded to the background.
const WeekOneSection = ({ theme }: { theme: string }) => (
  <section id="week-one" className="section-cream py-28 md:py-40 scroll-mt-16">
    <div className="container mx-auto px-6 max-w-4xl">
      <WeekOnePreview weekOneTheme={theme} />
    </div>
  </section>
);

/* ── 6 · THE INTERACTIVE ADULT JOURNAL ────────────────────────────────────*/

const JOURNAL_FLOW = [
  "LIVE SESSION",
  "QUESTION APPEARS",
  "PRIVATE RESPONSE",
  "SAVED TO MY JOURNAL",
  "RETURN MIDWEEK",
  "FRIDAY CHECK-IN",
  "NEXT SUNDAY",
];

const SHARE_FLOW = ["WRITE PRIVATELY", "OPTIONAL: SHARE WITH ROOM", "MODERATOR REVIEW", "APPEARS IN THE LIVE SESSION"];

/** Two demo weeks. Invented, obviously so, and about nobody. */
const JOURNAL_WEEKS = [
  {
    n: "01",
    theme: WEEK1_THEME,
    reflection: "Kept checking my phone during dinner without deciding to.",
    intention: "When I notice I've picked up my phone at the table, I'll put it face down.",
    midweek: "Noticed it three times. Twice I put it down.",
    friday: "Noticed it and named it, but didn't change anything on Thursday.",
  },
  {
    // Blank on purpose. An unwritten week shows ruled lines waiting, not a
    // placeholder character — a lone em-dash set in display type reads as a
    // rendering fault rather than as an empty page.
    n: "02",
    theme: "",
    reflection: "",
    intention: "",
    midweek: "",
    friday: "",
  },
];

const AdultJournal = () => (
  <section className="section-cream py-28 md:py-36">
    <div className="container mx-auto px-6 max-w-5xl">
      <div className="text-center mb-16">
        <SectionHeading label="Adult members" title={<>YOUR LESSON DOESN'T DISAPPEAR<br />WHEN YOU LEAVE THE ROOM.</>} />
        <Reveal delay={0.1}>
          <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
            For adult members, the live session and the digital journal work together. During a
            session you can privately respond to prompts in real time. Your weekly reflections,
            intentions and completed lesson work become part of your own Mindcast journal.
          </p>
        </Reveal>
      </div>

      {/* Set as a running line of type, not a row of bordered chips. */}
      <Reveal>
        <ol className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 mb-20 max-w-3xl mx-auto">
          {JOURNAL_FLOW.map((s, i) => (
            <li key={s} className="flex items-center gap-5">
              <span className="font-display text-lg md:text-xl tracking-[0.14em] text-foreground/85">{s}</span>
              {i < JOURNAL_FLOW.length - 1 && <span className="text-primary/70" aria-hidden>→</span>}
            </li>
          ))}
        </ol>
      </Reveal>

      {/* The journal accumulating — as pages, because that is what it is.
          Week 2 is deliberately blank: the claim is that it fills up over a
          year, not that it arrives full. The second sheet sits slightly
          behind the first, the way the next page in a book does. */}
      {/* `isolate` creates a stacking context so the sheets layer against each
          other rather than against the section background — a negative
          z-index here would drop the second page behind the ivory entirely. */}
      <div className="max-w-2xl mx-auto isolate">
        {JOURNAL_WEEKS.map((w, i) => (
          <div
            key={w.n}
            className={i > 0 ? "-mt-8 md:-mt-12 mx-4 md:mx-8 relative z-0" : "relative z-10"}
          >
            <WorkbookPage week={Number(w.n)} track="Adult" phase="My journal">
              {w.theme && (
                <p
                  className="font-display text-[30px] md:text-4xl tracking-tight leading-none"
                  style={{ color: INK }}
                >
                  {w.theme}
                </p>
              )}
              <div className="mt-9">
                {([
                  ["My reflection", w.reflection],
                  ["My intention", w.intention],
                  ["Midweek", w.midweek],
                  ["Friday check-in", w.friday],
                ] as const).map(([label, value]) => (
                  <div key={label} className="mb-7 last:mb-0">
                    <p
                      className="font-body text-[9px] font-bold tracking-[0.28em] uppercase mb-2"
                      style={{ color: SIGNAL_DEEP }}
                    >
                      {label}
                    </p>
                    {value ? (
                      <p
                        className="text-[19px] md:text-[21px] italic leading-[1.6] pb-1.5 border-b"
                        style={{ fontFamily: "var(--font-serif)", color: INK, borderColor: RULE }}
                      >
                        {value}
                      </p>
                    ) : (
                      <WritingLines n={1} className="mt-0" />
                    )}
                  </div>
                ))}
              </div>
            </WorkbookPage>
          </div>
        ))}
      </div>

      <Reveal delay={0.15}>
        <p className="font-display text-3xl md:text-5xl tracking-tight text-foreground leading-tight text-center max-w-3xl mx-auto mt-16">
          52 WEEKS. ONE JOURNAL OF WHAT YOU ACTUALLY NOTICED ALONG THE WAY.
        </p>
        <p className="font-body text-sm text-primary text-center mt-8">
          Your journal is private to you.
        </p>
      </Reveal>

      {/* Sharing is a separate, opt-in path. Keeping it in its own bordered
          block is the point: nothing written privately reaches a screen unless
          the member deliberately submits it and a moderator passes it. */}
      <Reveal delay={0.2}>
        <div className="max-w-3xl mx-auto mt-24 pt-14 border-t border-border">
          <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-5">
            Some exercises invite sharing
          </p>
          <p className="font-body text-[15px] text-muted-foreground leading-[1.75] mb-10 max-w-[58ch]">
            A few activities offer the room a chance to hear from each other. That is always a
            separate, deliberate step — a member writes privately first, and chooses afterwards
            whether to submit anything at all.
          </p>
          <ol className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {SHARE_FLOW.map((s, i) => (
              <li key={s} className="flex items-center gap-5">
                <span className="font-display text-lg md:text-xl tracking-[0.14em] text-foreground/85">{s}</span>
                {i < SHARE_FLOW.length - 1 && <span className="text-primary/70" aria-hidden>→</span>}
              </li>
            ))}
          </ol>
          <p
            className="text-[21px] md:text-[25px] italic leading-[1.5] mt-12 max-w-[52ch]"
            style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--foreground))" }}
          >
            Journal entries never appear on a screen on their own. Only something a member has
            deliberately submitted, and a moderator has reviewed, is ever shown to the room.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── 9 · THE WORKSHEET ────────────────────────────────────────────────────*/

const WORKSHEET_CONTAINS = [
  "The key idea",
  "A reflection",
  "The activity",
  "Your intention",
  "The weekly practice",
  "Space to come back to it",
];

const Worksheet = () => (
  <section className="section-white py-28 md:py-36">
    <div className="container mx-auto px-6 max-w-5xl">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <Reveal>
          <div className="aspect-[4/3] overflow-hidden bg-card border border-border">
            <img
              src={threeWorkbooks}
              alt="The adult, teen and children's Mindcast worksheets side by side"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              width={1200}
              height={900}
            />
          </div>
        </Reveal>

        <div>
          <SectionHeading
            label="Paper, for everyone"
            title={<>EVERYONE HAS SOMETHING TO TAKE BACK INTO REAL LIFE.</>}
          />
          <Reveal delay={0.1}>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mt-6 mb-8">
              The worksheet mirrors the week's live experience, so what happened in the room can be
              picked up again on a Wednesday night at the kitchen table.
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-10">
              {WORKSHEET_CONTAINS.map((c) => (
                <li key={c} className="font-body text-sm text-foreground flex gap-2.5">
                  <span className="text-primary/60" aria-hidden>·</span>
                  {c}
                </li>
              ))}
            </ul>
            <div className="border-l-2 border-primary pl-6 py-1">
              <p className="font-body text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-2">
                Visiting Mindcast?
              </p>
              <p className="font-body text-sm text-foreground leading-relaxed">
                Your session worksheet is included. Every visitor gets the printed worksheet for the
                session they attend — including a first, free session.
              </p>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mt-8">
              Nobody needs the app to take part in the room. Adult members can use the digital
              journal if they want to. The teen and children's tracks are paper, always.
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

/* ── 10 · HOW THE CURRICULUM BUILDS ───────────────────────────────────────*/

const BUILD_LOOP = ["LEARN", "TRY IT", "NOTICE WHAT HAPPENS", "RETURN", "BUILD ON IT"];

const HowItBuilds = () => (
  <section className="section-cream py-28 md:py-36">
    <div className="container mx-auto px-6 max-w-4xl">
      <div className="text-center mb-16">
        <SectionHeading label="The callback structure" title={<>WE DON'T JUST MOVE ON.<br />WE COME BACK.</>} />
        <Reveal delay={0.1}>
          <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
            Each week is connected to the ones before it. The curriculum deliberately returns you to
            your previous intention instead of presenting a new idea and forgetting the last one.
          </p>
        </Reveal>
      </div>

      <Reveal>
        <ol className="flex flex-col items-center gap-3 mb-16">
          {BUILD_LOOP.map((s, i) => (
            <li key={s} className="flex flex-col items-center gap-3">
              <span className="font-display text-2xl md:text-3xl tracking-[0.14em] text-foreground">{s}</span>
              {i < BUILD_LOOP.length - 1 && <span className="text-primary" aria-hidden>↓</span>}
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="text-center mb-12">
          <p className="font-display text-3xl md:text-5xl tracking-tight text-foreground leading-tight">
            NOTICE IT. NAME IT. DO IT.
          </p>
        </div>
      </Reveal>

      {/* No score, no streak, no percentage. Three honest outcomes, given
          equal visual weight on purpose — a page that ranked them would
          undo the thing the ladder was built to fix. */}
      <div className="grid md:grid-cols-3 gap-10 md:gap-12">
        {[
          "Sometimes progress is simply noticing something that previously happened automatically.",
          "Sometimes someone notices it and names it, and doesn't change anything at all.",
          "Sometimes they notice early enough to choose differently.",
        ].map((c) => (
          <div key={c}>
            <span className="block w-10 border-t-2 border-primary mb-6" aria-hidden />
            <p
              className="text-[20px] md:text-[22px] italic leading-[1.5] text-foreground"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {c}
            </p>
          </div>
        ))}
      </div>

      <Reveal delay={0.15}>
        <p className="font-body text-sm text-muted-foreground leading-relaxed text-center max-w-xl mx-auto mt-10">
          All three are results. There is no failure state here, nothing to keep unbroken, and
          nothing that turns a year of your own life into a score.
        </p>
      </Reveal>
    </div>
  </section>
);

/* ── 11 · 52 WEEKS IN YOUR JOURNAL ────────────────────────────────────────*/

const YearInJournal = ({ weeks }: { weeks: ReturnType<typeof useCurriculumWeeks>["weeks"] }) => {
  const reduce = useReducedMotion();
  // 52 ticks, coloured by block. If the RPC has not answered we still draw the
  // year from the block constants rather than showing an empty rail.
  const ticks = Array.from({ length: 52 }, (_, i) => {
    const n = i + 1;
    const fromDb = weeks.find((w) => w.week_number === n)?.block_number;
    const fallback = BLOCKS.find((b) => n >= b.weeks[0] && n <= b.weeks[1])?.number ?? 1;
    return { n, block: fromDb ?? fallback };
  });

  return (
    <section className="section-white py-28 md:py-36">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-16">
          <div>
            <SectionHeading
              label="Adult members"
              title={<>IMAGINE LOOKING BACK AT WHAT YOU WERE NOTICING 40 WEEKS AGO.</>}
            />
            <Reveal delay={0.1}>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mt-6">
                The journal is not a history of content you consumed. It is your own record of
                reflections, intentions, observations, weekly check-ins, the lessons you came back
                to, and the patterns you noticed across a year.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="aspect-[4/3] overflow-hidden bg-card border border-border">
              <img
                src={flatlayRoadmap}
                alt="A Mindcast workbook open with a year of weekly notes"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                width={1200}
                height={900}
              />
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="flex gap-[3px] h-24 items-end" aria-hidden>
            {ticks.map((t, i) => (
              <motion.div
                key={t.n}
                className="flex-1 bg-primary"
                // Origin at the base so the year fills upward rather than
                // growing out of its own middle.
                style={{ opacity: 0.25 + t.block * 0.18, transformOrigin: "bottom" }}
                initial={reduce ? false : { scaleY: 0.08 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.012, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {BLOCKS.map((b) => (
              <span key={b.number} className="font-body text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                {b.name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── 12 · FINAL MESSAGE ───────────────────────────────────────────────────*/

const FinalMessage = () => (
  <section className="section-cream border-t border-border py-28 md:py-36">
    <div className="container mx-auto px-6 max-w-3xl text-center">
      <Reveal>
        <h2 className="font-display text-foreground leading-[0.92] tracking-tight text-5xl sm:text-6xl md:text-7xl mb-8">
          52 WEEKS.
          <br />
          ONE SMALL PRACTICE AT A TIME.
        </h2>
        <p className="font-body text-muted-foreground text-base leading-relaxed max-w-xl mx-auto mb-12">
          Mindcast is not about collecting more information. It is about taking one idea into the
          week, noticing what actually happens, and coming back with something real to work with.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <BlockSpine className="mb-14" />
      </Reveal>

      <Reveal delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <GlowButton to="/membership">JOIN THE FOUNDING MEMBER LIST →</GlowButton>
          <button
            onClick={scrollTo("journey")}
            className="font-body text-xs font-bold tracking-[0.2em] uppercase text-primary hover:underline"
          >
            Back to the 52-week journey ↑
          </button>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── PAGE ─────────────────────────────────────────────────────────────────*/

const Curriculum = () => {
  // The adult track's titles; the page shows the shared weekly theme in the
  // grid, so any track would do — adult is the one whose Week 1 opens first.
  const { weeks, loading } = useCurriculumWeeks("adult");

  // Prefer the live theme over the constant, so a curriculum edit reaches the
  // marketing page without a deploy.
  const weekOneTheme = weeks.find((w) => w.week_number === 1)?.weekly_theme || WEEK1_THEME;

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Journey weeks={weeks} loading={loading} />
        <ThreeExperiences />
        <WeekRhythm />
        <WeekOneSection theme={weekOneTheme} />
        <AdultJournal />
        <Worksheet />
        <HowItBuilds />
        <YearInJournal weeks={weeks} />
        <FinalMessage />
      </main>
      <Footer />
    </div>
  );
};

export default Curriculum;
