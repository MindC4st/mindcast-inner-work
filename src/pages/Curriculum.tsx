// /curriculum — the Mindcast Life Binder.
//
// The page IS the binder. One cream linen container sits under the navbar;
// five index tabs on its right edge (stacked along the top on a phone) turn
// the page between everything the visitor used to scroll for:
//
//   NOTES        the headline, subheadline and the shape of the year
//   PHASES       the block/track explorer, with the Week 1 preview folded
//                into Block 1
//   WORKSHEETS   the weekly rhythm, the adult journal, the paper
//   REFLECTIONS  the three tracks, the shared language, how the year builds
//   SHOP         the physical companions, linking through to /shop
//
// The join CTA (FinalMessage) stays beneath the binder — after the year has
// been seen, not before.
//
// Data discipline is unchanged: everything said about the curriculum comes
// from the anon-safe `curriculum_public` RPC (via useCurriculumWeeks) or the
// curated constants in lib/curriculumPublic. Nothing reads the session tables.

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Ripple from "@/components/brand/Ripple";
import { Reveal, GlowButton, ScrollProgress } from "@/components/glow";
import LifeBinder from "@/components/curriculum/LifeBinder";
import WeekOnePreview from "@/components/curriculum/WeekOnePreview";
import WorkbookPage, { INK, RULE, SIGNAL_DEEP, WritingLines } from "@/components/curriculum/WorkbookPage";
import { useCurriculumWeeks } from "@/hooks/useCurriculumWeeks";
import {
  BLOCKS,
  CURRICULUM_OVERVIEW,
  CURRICULUM_SUBHEADLINE,
  NOTICE_NAME_DO,
  RHYTHM,
  SHARED_LANGUAGE_COPY,
  SHARED_LANGUAGE_TAGLINE,
  TRACK_MATRIX,
  WEEK1_THEME,
} from "@/lib/curriculumPublic";
import threeWorkbooks from "@/assets/home-three-workbooks.jpg";
import flatlayRoadmap from "@/assets/flatlay-roadmap.jpg";
import campaignThreeTracks from "@/assets/campaign-08-three-tracks.jpg";

/* ── The five index tabs ──────────────────────────────────────────────────*/

const TABS = [
  { key: "notes", n: "01", label: "Notes" },
  { key: "phases", n: "02", label: "Phases" },
  { key: "worksheets", n: "03", label: "Worksheets" },
  { key: "reflections", n: "04", label: "Reflections" },
  { key: "shop", n: "05", label: "Shop" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ── Shared tab furniture ─────────────────────────────────────────────────*/

/** SEE CLEARLY → UNLEARN → REBUILD → LIVE IT. */
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

const TabTitle = ({ label, title }: { label: string; title: ReactNode }) => (
  <Reveal>
    <p className="text-[11px] font-body font-bold uppercase tracking-[0.35em] text-primary mb-4">
      {label}
    </p>
    <h2 className="font-display leading-[0.95] tracking-tight text-4xl sm:text-5xl md:text-6xl text-foreground">
      {title}
    </h2>
  </Reveal>
);

const SubHeading = ({ label, title }: { label: string; title: ReactNode }) => (
  <Reveal>
    <p className="text-[11px] font-body font-bold uppercase tracking-[0.35em] text-primary mb-4">
      {label}
    </p>
    <h3 className="font-display leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-5xl text-foreground">
      {title}
    </h3>
  </Reveal>
);

/* ══ TAB 1 · NOTES ─────────────────────────────────────────────────────────
   The cover page: what the curriculum is, and the shape of the year. */

const Hero = ({ onExplore, onWorksheets }: { onExplore: () => void; onWorksheets: () => void }) => (
  <div className="text-center max-w-3xl mx-auto">
    <Reveal>
      <p className="font-body text-[11px] font-bold tracking-[0.4em] uppercase text-primary mb-6">
        Interactive Curriculum Explorer
      </p>
      <h1 className="font-display text-foreground leading-[0.92] tracking-tight text-5xl sm:text-6xl md:text-7xl mb-6">
        THE MINDCAST
        <br />
        CURRICULUM.
      </h1>
      <p
        className="text-2xl md:text-3xl italic text-foreground/85 leading-snug max-w-2xl mx-auto mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {CURRICULUM_SUBHEADLINE}
      </p>
      <p className="font-body text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
        {CURRICULUM_OVERVIEW}
      </p>
    </Reveal>

    <Reveal delay={0.1}>
      <BlockSpine className="mb-10" />
    </Reveal>

    <Reveal delay={0.16}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <button
          onClick={onExplore}
          className="font-display tracking-[0.2em] text-sm px-9 py-4 bg-primary text-primary-foreground hover:bg-[hsl(var(--glow))] transition-colors"
        >
          EXPLORE WEEK 1 →
        </button>
        <button
          onClick={onWorksheets}
          className="font-body text-xs font-bold tracking-[0.2em] uppercase text-primary hover:underline"
        >
          How the week works
        </button>
      </div>
    </Reveal>
  </div>
);

const Journey = ({ onExplore }: { onExplore: () => void }) => (
  <div className="mt-20 pt-14 border-t border-[#e8e2d5] max-w-3xl mx-auto text-center">
    <Reveal>
      <p className="font-body text-[11px] font-bold tracking-[0.35em] uppercase text-primary mb-4">
        The shape of the year
      </p>
      <h2 className="font-display leading-[0.95] tracking-tight text-4xl sm:text-5xl md:text-6xl text-foreground">
        ONE YEAR.
        <br />
        FOUR DELIBERATE BLOCKS.
      </h2>
      <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
        Mindcast does not treat personal development as 52 unrelated topics. The year moves through
        four connected blocks, and each one depends on the one before it. Turn to the Phases tab and
        read any week through the adult, teen or child lens.
      </p>
      <button
        onClick={onExplore}
        className="mt-8 font-body text-xs font-bold tracking-[0.2em] uppercase text-primary hover:underline"
      >
        Open the phases →
      </button>
    </Reveal>
  </div>
);

const NotesTab = ({ onExplore, onWorksheets }: { onExplore: () => void; onWorksheets: () => void }) => (
  <div className="py-6 md:py-10">
    <Hero onExplore={onExplore} onWorksheets={onWorksheets} />
    <Journey onExplore={onExplore} />
  </div>
);

/* ══ TAB 2 · PHASES ───────────────────────────────────────────────────────═
   The explorer: blocks, tracks, and the Week 1 preview folded into Block 1. */

const PhasesTab = ({
  weeks,
  loading,
  weekOneTheme,
}: {
  weeks: ReturnType<typeof useCurriculumWeeks>["weeks"];
  loading: boolean;
  weekOneTheme: string;
}) => (
  <div className="py-2 md:py-4">
    <div className="mb-10 max-w-3xl">
      <TabTitle label="The curriculum explorer" title={<>FOUR PHASES.<br />FIFTY-TWO WEEKS.</>} />
      <Reveal delay={0.08}>
        <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed mt-6">
          Each phase is a block of thirteen weeks. Choose a block, then read its weeks through the
          adult, teen or child lens. Block 1 carries the full Week 1 preview.
        </p>
      </Reveal>
    </div>

    <LifeBinder
      weeks={weeks}
      loading={loading}
      blockExtra={(n) => (n === 1 ? <WeekOnePreview weekOneTheme={weekOneTheme} /> : null)}
    />
  </div>
);

/* ══ TAB 3 · WORKSHEETS ─────────────────────────────────────────═══════════
   Practical implementation: the rhythm, the adult journal, the paper. */

const WeekRhythm = () => (
  <div>
    <div className="text-center mb-14">
      <SubHeading label="The week, not the hour" title="SUNDAY IS ONLY THE BEGINNING." />
      <Reveal delay={0.08}>
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
);

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
  <div>
    <div className="text-center mb-14">
      <SubHeading label="Adult members" title={<>YOUR LESSON DOESN'T DISAPPEAR<br />WHEN YOU LEAVE THE ROOM.</>} />
      <Reveal delay={0.08}>
        <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
          For adult members, the live session and the digital journal work together. During a
          session you can privately respond to prompts in real time. Your weekly reflections,
          intentions and completed lesson work become part of your own Mindcast journal.
        </p>
      </Reveal>
    </div>

    {/* Set as a running line of type, not a row of bordered chips. */}
    <Reveal>
      <ol className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 mb-16 max-w-3xl mx-auto">
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
        other rather than against the page background — a negative z-index
        here would drop the second page behind the canvas entirely. */}
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
      <div className="max-w-3xl mx-auto mt-20 pt-12 border-t border-border">
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
);

const WORKSHEET_CONTAINS = [
  "The key idea",
  "A reflection",
  "The activity",
  "Your intention",
  "The weekly practice",
  "Space to come back to it",
];

const Worksheet = () => (
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
      <SubHeading label="Paper, for everyone" title={<>EVERYONE HAS SOMETHING TO TAKE BACK INTO REAL LIFE.</>} />
      <Reveal delay={0.08}>
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
);

const WorksheetsTab = () => (
  <div className="py-2 md:py-4">
    <div className="mb-14 max-w-3xl">
      <TabTitle label="Practical implementation" title={<>TAKE IT HOME<br />ON PAPER.</>} />
      <Reveal delay={0.08}>
        <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed mt-6">
          The session is the spark; the week is the work. This is the rhythm that carries one idea
          from Sunday into real life — and the paper and journal that hold it there.
        </p>
      </Reveal>
    </div>
    <div className="space-y-24 md:space-y-32">
      <WeekRhythm />
      <AdultJournal />
      <Worksheet />
    </div>
  </div>
);

/* ══ TAB 4 · REFLECTIONS ─────────────────────────────────────────══════════
   Pedagogy & framework: three tracks, shared language, how the year builds. */

const THREE = [
  {
    label: "ADULT",
    body: "Reflective, evidence-informed, and connected to real decisions, patterns and behaviour.",
  },
  {
    label: "TEEN",
    body: "Relevant to teenage life — relationships, social influence, identity, school, online environments and growing independence.",
  },
  {
    label: "CHILD",
    body: "Movement, pictures, stories, games, simple language, and safe opportunities to notice and practise.",
  },
];

const ThreeExperiences = () => {
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="text-center mb-14">
        <SubHeading label="Three rooms, one week" title={<>ONE IDEA.<br />THREE EXPERIENCES.<br />ONE CONVERSATION.</>} />
        <Reveal delay={0.08}>
          <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
            Adults, teens and children do not sit through the same lesson. Each track explores the
            week's shared idea through language, examples and activities designed for that stage of
            life. Underneath, the family is building a shared language.
          </p>
        </Reveal>
      </div>

      {/* Three columns of type — the plate and the words, no room photos. */}
      <div className="grid md:grid-cols-3 gap-12 md:gap-10">
        {THREE.map((t, i) => (
          <Reveal key={t.label} delay={i * 0.08}>
            <p className="font-display text-[26px] tracking-[0.16em] text-foreground pb-4 mb-4 border-b border-border">
              {t.label}
            </p>
            <p className="font-body text-[15px] text-muted-foreground leading-[1.75]">{t.body}</p>
          </Reveal>
        ))}
      </div>

      {/* The convergence. Three lines meeting is the whole differentiator,
          so it is drawn rather than described. */}
      <div className="mt-10 flex justify-center" aria-hidden>
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
          <p className="font-display text-2xl md:text-3xl tracking-[0.1em] text-foreground mt-10">
            {SHARED_LANGUAGE_TAGLINE}
          </p>
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto mt-5">
            {SHARED_LANGUAGE_COPY}
          </p>
        </div>
      </Reveal>

      {/* How one concept reads across the three tracks. */}
      <Reveal delay={0.1}>
        <div className="max-w-4xl mx-auto mt-14">
          {/* Desktop: a table set like a contents page. */}
          <div className="hidden md:block border border-border">
            <div className="grid grid-cols-[140px_1fr_1fr_1fr] bg-card border-b border-border">
              {["CONCEPT", "ADULT", "TEEN", "CHILD"].map((h) => (
                <p key={h} className="font-body text-[10px] font-bold tracking-[0.22em] text-primary px-5 py-4">
                  {h}
                </p>
              ))}
            </div>
            {TRACK_MATRIX.map((row) => (
              <div key={row.concept} className="grid grid-cols-[140px_1fr_1fr_1fr] border-b border-border last:border-b-0">
                <p className="font-display text-lg tracking-[0.08em] text-foreground px-5 py-5">
                  {row.concept.toUpperCase()}
                </p>
                {[row.adult, row.teen, row.child].map((cell, i) => (
                  <p key={i} className="font-body text-[13px] text-muted-foreground leading-relaxed px-5 py-5">
                    {cell}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile: one card per concept. */}
          <div className="md:hidden space-y-5">
            {TRACK_MATRIX.map((row) => (
              <div key={row.concept} className="bg-card border border-border p-6">
                <p className="font-display text-xl tracking-[0.08em] text-foreground mb-4">
                  {row.concept.toUpperCase()}
                </p>
                {([["ADULT", row.adult], ["TEEN", row.teen], ["CHILD", row.child]] as const).map(([label, cell]) => (
                  <div key={label} className="mb-3 last:mb-0">
                    <p className="font-body text-[10px] font-bold tracking-[0.22em] text-primary mb-1">{label}</p>
                    <p className="font-body text-[13px] text-muted-foreground leading-relaxed">{cell}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

const BUILD_LOOP = ["LEARN", "TRY IT", "NOTICE WHAT HAPPENS", "RETURN", "BUILD ON IT"];

const HowItBuilds = () => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-14">
      <SubHeading label="The callback structure" title={<>WE DON'T JUST MOVE ON.<br />WE COME BACK.</>} />
      <Reveal delay={0.08}>
        <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl mx-auto mt-6">
          Each week is connected to the ones before it. The curriculum deliberately returns you to
          your previous intention instead of presenting a new idea and forgetting the last one.
        </p>
      </Reveal>
    </div>

    <Reveal>
      <ol className="flex flex-col items-center gap-3 mb-14">
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
);

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
    <div>
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-14">
        <div>
          <SubHeading label="Adult members" title={<>IMAGINE LOOKING BACK AT WHAT YOU WERE NOTICING 40 WEEKS AGO.</>} />
          <Reveal delay={0.08}>
            <p className="font-body text-muted-foreground text-sm leading-relaxed mt-6">
              The journal is not a history of content you consumed. It is your own record of
              reflections, intentions, observations, weekly check-ins, the lessons you came back
              to, and the patterns you noticed across a year.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.08}>
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
  );
};

const ReflectionsTab = ({ weeks }: { weeks: ReturnType<typeof useCurriculumWeeks>["weeks"] }) => (
  <div className="py-2 md:py-4">
    <div className="mb-14 max-w-3xl">
      <TabTitle label="Pedagogy & framework" title={<>WHY IT BUILDS<br />THE WAY IT DOES.</>} />
      <Reveal delay={0.08}>
        <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed mt-6">
          Three tracks on one idea, a shared vocabulary at home, and a year that keeps coming back
          to what you set — this is the thinking under the pages.
        </p>
      </Reveal>
    </div>
    <div className="space-y-24 md:space-y-32">
      <ThreeExperiences />
      <HowItBuilds />
      <YearInJournal weeks={weeks} />
    </div>
  </div>
);

/* ══ TAB 5 · SHOP ─────────────────────────────────────────────────────────═
   The physical companions. Placeholder shelf until the catalogue lands. */

const SHOP_SHELF = [
  {
    name: "The Mindcast Life Binder",
    body: "The cream linen binder this page is modelled on — index tabs, weekly pages, and room for a whole year of noticing.",
    image: threeWorkbooks,
    alt: "Mindcast workbooks laid side by side",
  },
  {
    name: "The Weekly Worksheet Set",
    body: "Printed worksheets for the year, so what happened in the room gets picked up again at the kitchen table.",
    image: flatlayRoadmap,
    alt: "A Mindcast workbook open with a year of weekly notes",
  },
  {
    name: "The Family Track Pack",
    body: "Age-tailored sheets for adults, teens and children — one idea, three lenses, one table conversation.",
    image: campaignThreeTracks,
    alt: "The three Mindcast tracks side by side",
  },
];

const ShopTab = () => (
  <div className="py-2 md:py-4">
    <div className="mb-12 max-w-3xl">
      <TabTitle label="The Mindcast shop" title={<>THE BINDER,<br />IN YOUR HANDS.</>} />
      <Reveal delay={0.08}>
        <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed mt-6">
          Physical companions to the year — printed, bound and made to be written in. The full
          catalogue lives in the shop.
        </p>
      </Reveal>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SHOP_SHELF.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.07}>
          <Link
            to="/shop"
            className="group block h-full bg-white border border-[#e8e2d5] hover:border-primary/50 transition-colors"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={p.image}
                alt={p.alt}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                width={1200}
                height={900}
              />
            </div>
            <div className="p-6">
              <p className="font-body text-[10px] font-bold tracking-[0.24em] uppercase text-primary mb-2">
                Placeholder · arriving soon
              </p>
              <h3 className="font-display text-2xl tracking-[0.06em] text-foreground mb-2">
                {p.name.toUpperCase()}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">{p.body}</p>
              <span className="font-body text-xs font-bold tracking-[0.18em] uppercase text-primary">
                View in the shop →
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  </div>
);

/* ══ THE CTA ───────────────────────────────────────────────────────────────
   Beneath the binder, not inside it — the ask comes after the year has been
   seen, never before. */

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
          <Link
            to="/apply"
            className="font-body text-xs font-bold tracking-[0.2em] uppercase text-primary hover:underline"
          >
            Or apply for the pilot group
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ══ THE BINDER SHELL ────────────────────────────────────────────────────*/

const Curriculum = () => {
  // The adult track's titles; the page shows the shared weekly theme in the
  // grid, so any track would do — adult is the one whose Week 1 opens first.
  const { weeks, loading } = useCurriculumWeeks("adult");

  // Prefer the live theme over the constant, so a curriculum edit reaches the
  // marketing page without a deploy.
  const weekOneTheme = weeks.find((w) => w.week_number === 1)?.weekly_theme || WEEK1_THEME;

  const [tab, setTab] = useState<TabKey>("notes");
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <main className="pt-24 md:pt-32">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl pb-24">
          {/* The binder itself. */}
          <div className="binder-canvas p-5 sm:p-8 lg:p-10">
            {/* The cover: embossed wordmark, then the binder's name. */}
            <header className="text-center border-b border-[#e8e2d5] pb-6 mb-6 lg:mb-8">
              <p className="binder-emboss font-display text-3xl md:text-4xl select-none" aria-hidden>
                MINDCAST
              </p>
              <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground mt-3">
                The Life Binder
              </p>
            </header>

            {/* Mobile / tablet: the five index tabs lie flat along the top as
                paper tabs, sticky under the navbar while pages turn beneath. */}
            <div
              role="tablist"
              aria-label="Life binder sections"
              className="lg:hidden sticky top-16 z-30 -mx-1 px-1 pt-2 pb-3 bg-[#faf8f5]/95 backdrop-blur-sm flex gap-1.5 overflow-x-auto scrollbar-none"
            >
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  id={`binder-tab-m-${t.key}`}
                  aria-selected={tab === t.key}
                  aria-controls="binder-page"
                  onClick={() => setTab(t.key)}
                  className="binder-tab-top shrink-0 px-4 py-3 text-[11px] font-body font-bold tracking-[0.14em] uppercase min-h-[44px]"
                >
                  {t.n} {t.label}
                </button>
              ))}
            </div>

            {/* The spread: the page that turns, and the index tabs on the
                right edge. The wrapper carries the perspective so the page
                flips in 3D. */}
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_150px] lg:gap-10 items-start">
              <div
                id="binder-page"
                role="tabpanel"
                aria-live="polite"
                style={{ perspective: 1200 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: -12 }}
                    transition={{ duration: reduce ? 0.3 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "left center" }}
                  >
                    {tab === "notes" && (
                      <NotesTab
                        onExplore={() => setTab("phases")}
                        onWorksheets={() => setTab("worksheets")}
                      />
                    )}
                    {tab === "phases" && (
                      <PhasesTab weeks={weeks} loading={loading} weekOneTheme={weekOneTheme} />
                    )}
                    {tab === "worksheets" && <WorksheetsTab />}
                    {tab === "reflections" && <ReflectionsTab weeks={weeks} />}
                    {tab === "shop" && <ShopTab />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop: five physical index tabs on the right edge. */}
              <div
                role="tablist"
                aria-label="Life binder sections"
                aria-orientation="vertical"
                className="hidden lg:flex flex-col gap-2.5 lg:sticky lg:top-24"
              >
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    id={`binder-tab-${t.key}`}
                    aria-selected={tab === t.key}
                    aria-controls="binder-page"
                    onClick={() => setTab(t.key)}
                    className="binder-tab text-left px-4 py-4 min-h-[76px] w-full"
                  >
                    <span
                      className={`font-display text-xl leading-none ${
                        tab === t.key ? "text-primary" : "text-foreground/25"
                      }`}
                    >
                      {t.n}
                    </span>
                    <span className="block font-body text-xs font-bold tracking-[0.16em] uppercase mt-1.5">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <FinalMessage />
      </main>
      <Footer />
    </div>
  );
};

export default Curriculum;
