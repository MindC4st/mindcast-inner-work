// Week 1, the same idea in three rooms.
//
// Changing the tab transforms this section rather than navigating, because the
// point being made is that these are three translations of ONE week — a route
// change would frame them as three separate products.
//
// The three panels are deliberately not symmetrical. The adult panel has a
// digital journal, the teen panel has paper, and the child panel has a
// colouring page and no screen at all. Making them look like three equal
// feature columns would misrepresent the product, which is the single most
// important thing this page has to get right.

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/glow";
import { LADDER } from "@/components/session/IntentionLadder";
import JournalDemo from "./JournalDemo";
import {
  RHYTHM,
  TRACK_ORDER,
  WEEK1_ADULT,
  WEEK1_CHILD,
  WEEK1_SHARED_CONCEPT,
  WEEK1_TEEN,
  WEEK1_TRACKS,
  type TrackKey,
} from "@/lib/curriculumPublic";
import adultWorkbook from "@/assets/home-adult-workbook.jpg";
import teenWorkbook from "@/assets/home-teen-workbook.jpg";
import childColouring from "@/assets/home-child-colouring.jpg";

/* ── shared bits ──────────────────────────────────────────────────────────*/

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-3">
    {children}
  </p>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block border border-border bg-card font-body text-xs text-foreground px-3 py-1.5">
    {children}
  </span>
);

/** NOTICE IT → LOCATE IT → CHOOSE, and friends. */
const Steps = ({ steps }: { steps: readonly string[] }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
    {steps.map((s, i) => (
      <span key={s} className="flex items-center gap-3">
        <span className="font-display text-lg md:text-xl tracking-[0.12em] text-foreground">{s}</span>
        {i < steps.length - 1 && <span className="text-primary" aria-hidden>→</span>}
      </span>
    ))}
  </div>
);

const Translation = ({ track }: { track: TrackKey }) => (
  <div className="border-l-2 border-primary pl-5 py-1">
    <Eyebrow>{WEEK1_TRACKS[track].label} translation</Eyebrow>
    <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-2xl">
      {WEEK1_TRACKS[track].translation}
    </p>
  </div>
);

/** A photograph of the physical material, captioned honestly. */
const PaperVisual = ({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) => (
  <figure className="bg-card border border-border">
    <div className="aspect-[4/3] overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover object-center" loading="lazy" width={1200} height={900} />
    </div>
    <figcaption className="font-body text-xs text-muted-foreground p-5 leading-relaxed">
      {caption}
    </figcaption>
  </figure>
);

/* ── ADULT ────────────────────────────────────────────────────────────────*/

const AdultPanel = () => (
  <div className="space-y-14">
    <Translation track="adult" />

    <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
      <div>
        <Eyebrow>The question</Eyebrow>
        <p className="font-serif text-2xl md:text-3xl text-foreground leading-snug">
          {WEEK1_ADULT.question}
        </p>
      </div>
      <div>
        <Eyebrow>The idea</Eyebrow>
        <p className="font-serif text-xl md:text-2xl text-foreground leading-snug mb-4">
          {WEEK1_ADULT.ideaLead}
        </p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          {WEEK1_ADULT.ideaBody}
        </p>
      </div>
    </div>

    <div className="border-t border-border pt-10">
      <Eyebrow>This week's practice</Eyebrow>
      <Steps steps={WEEK1_ADULT.practice} />
      <p className="font-serif text-xl text-primary mt-6">{WEEK1_ADULT.practiceShift}</p>
      <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2 max-w-2xl">
        {WEEK1_ADULT.practiceShiftWhy}
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-10 items-start">
      <JournalDemo />
      <div>
        <Eyebrow>Your Week 1</Eyebrow>
        <ol className="space-y-6">
          {RHYTHM.map((step) => (
            <li key={step.day + step.title} className="flex gap-5">
              <span className="font-display text-sm tracking-[0.15em] text-primary shrink-0 w-[7.5rem] pt-1">
                {step.day}
              </span>
              <div>
                <p className="font-body text-sm font-bold text-foreground">{step.title}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1">
                  {step.body}
                </p>
                {/* The Friday check-in is where the four rungs live. Shown
                    here as labels only — a public visitor has nothing to
                    record against, and nothing they touch is stored. */}
                {step.day === "FRI" && (
                  <ul className="mt-3 space-y-1.5">
                    {LADDER.map((rung) => (
                      <li key={rung.value} className="font-body text-xs text-muted-foreground flex gap-2.5">
                        <span className="text-primary/50" aria-hidden>—</span>
                        {rung.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

/* ── TEEN ─────────────────────────────────────────────────────────────────*/

const TeenPanel = () => (
  <div className="space-y-14">
    <Translation track="teen" />

    <div>
      <p className="font-display text-4xl md:text-6xl tracking-tight text-foreground leading-none mb-6">
        FAMILIAR IS NOT THE SAME AS TRUE.
      </p>
      <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {WEEK1_TEEN.nuance}
      </p>
    </div>

    <div>
      <Eyebrow>Where it might have come from</Eyebrow>
      <div className="flex flex-wrap gap-2">
        {WEEK1_TEEN.examples.map((e) => (
          <Chip key={e}>{e}</Chip>
        ))}
      </div>
    </div>

    <div className="border-t border-border pt-10 grid md:grid-cols-2 gap-10 md:gap-14 items-start">
      <div>
        <Eyebrow>Part of the Week 1 exercise</Eyebrow>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
          Take one opinion, label, preference or expectation. Ask where it actually came from.
        </p>
        <Steps steps={WEEK1_TEEN.sources} />

        <p className="font-body text-sm text-muted-foreground leading-relaxed mt-8 mb-4 max-w-md">
          Then decide what to do with it. All four are real answers — including the last one.
        </p>
        <div className="grid grid-cols-2 gap-px bg-border border border-border">
          {WEEK1_TEEN.outcomes.map((o) => (
            <div key={o} className="bg-card p-5 font-display text-lg tracking-[0.1em] text-foreground text-center">
              {o}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <PaperVisual
          src={teenWorkbook}
          alt="A teen worksheet open on a table during a Mindcast session"
          caption="Teen members get a printed worksheet for the session and take it home. Nothing is typed, submitted or stored."
        />
        <div>
          <p className="font-display text-2xl md:text-3xl tracking-tight text-foreground leading-tight mb-3">
            THEIR THINKING STAYS IN THEIR HANDS.
          </p>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Teen Mindcast is deliberately device-free. The room, the conversation and the paper —
            no app, no login, no digital journal.
          </p>
          {/* Asset slot. The link appears when an approved public sample
              worksheet exists; there is deliberately no placeholder PDF,
              because a fake worksheet is worse than no worksheet. */}
        </div>
      </div>
    </div>
  </div>
);

/* ── CHILD ────────────────────────────────────────────────────────────────*/

const ChildPanel = () => (
  <div className="space-y-14">
    <Translation track="child" />

    <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
      <div>
        <Eyebrow>{WEEK1_CHILD.activity}</Eyebrow>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
          Children practise noticing what their body is telling them, out loud and on their feet.
        </p>
        <div className="flex flex-wrap gap-2">
          {WEEK1_CHILD.signals.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
        <p className="font-serif text-xl md:text-2xl text-primary leading-snug mt-8">
          {WEEK1_CHILD.coreIdea}
        </p>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3 max-w-md">
          A rumbling tummy might be hunger, or nerves, or nothing much at all. Children are never
          told what a feeling in their body means — only that it is worth noticing.
        </p>
      </div>

      <div className="space-y-6">
        <PaperVisual
          src={childColouring}
          alt="A child colouring during a Mindcast children's session"
          caption="The Week 1 colouring page: a lighthouse shining through wind and waves. Children colour it, then add one small body signal somewhere in the picture — their own idea counts."
        />
        {/* The approved Week 1 colouring page lives in the private `colouring`
            storage bucket behind membership RLS, so it cannot be shown here.
            This is the room photograph instead. Publishing the real page
            publicly is a paywall decision, not a design one. */}
      </div>
    </div>

    <div className="border-t border-border pt-10">
      <p className="font-display text-3xl md:text-5xl tracking-tight text-foreground leading-none mb-6">
        BUILT FOR THE ROOM, NOT THE SCREEN.
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
        {WEEK1_CHILD.learnsThrough.map((w, i) => (
          <span key={w} className="flex items-center gap-3">
            <span className="font-display text-lg md:text-xl tracking-[0.12em] text-foreground">{w}</span>
            {i < WEEK1_CHILD.learnsThrough.length - 1 && <span className="text-primary/60" aria-hidden>·</span>}
          </span>
        ))}
      </div>
      <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-2xl">
        There is no children's app and no children's digital journal. Their responses are spoken,
        drawn and played — never typed, submitted or stored.
      </p>
    </div>
  </div>
);

/* ── the tabs ─────────────────────────────────────────────────────────────*/

const PANELS: Record<TrackKey, () => JSX.Element> = {
  adult: AdultPanel,
  teen: TeenPanel,
  child: ChildPanel,
};

const WeekOnePreview = ({ weekOneTheme }: { weekOneTheme: string }) => {
  const [track, setTrack] = useState<TrackKey>("adult");
  const reduce = useReducedMotion();
  const Panel = PANELS[track];

  return (
    <div>
      <Reveal>
        <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-4">
          Block 1 · See Clearly
        </p>
        <h2 className="font-display text-[44px] sm:text-6xl md:text-7xl tracking-tight text-foreground leading-[0.95]">
          WEEK 1 — {weekOneTheme.toUpperCase()}
        </h2>
        <p className="font-body text-muted-foreground text-base mt-5 max-w-2xl">
          The same core idea, experienced three different ways.
        </p>
        <p className="font-serif text-lg md:text-xl text-foreground/90 leading-snug mt-6 max-w-3xl">
          {WEEK1_SHARED_CONCEPT}
        </p>
      </Reveal>

      <div className="flex flex-wrap gap-px bg-border border border-border mt-12 mb-12" role="tablist" aria-label="Week 1 by track">
        {TRACK_ORDER.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={track === t}
            onClick={() => setTrack(t)}
            className={`flex-1 min-w-[7rem] font-display tracking-[0.2em] text-base py-5 transition-colors ${
              track === t
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {WEEK1_TRACKS[t].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={track}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-display text-3xl md:text-4xl tracking-tight text-foreground leading-none mb-10">
            {WEEK1_TRACKS[track].title.toUpperCase()}
          </p>
          <Panel />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WeekOnePreview;
