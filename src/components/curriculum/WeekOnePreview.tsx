// Week 1, the same idea in three rooms â€” set on the worksheet page itself.
//
// Changing the tab turns the page rather than navigating, because the point
// being made is that these are three translations of ONE week. A route change
// would frame them as three separate products.
//
// The three sheets are deliberately not symmetrical. The adult sheet carries a
// digital journal, the teen sheet is paper, and the child sheet is a colouring
// page with no screen anywhere near it. Making them look like three equal
// feature columns would misrepresent the product, which is the single most
// important thing this page has to get right.
//
// Long content sits behind Folds. A visitor should be able to take in a whole
// track at a glance and then open the parts they want, rather than scroll past
// a wall of everything.

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LADDER } from "@/components/session/IntentionLadder";
import JournalDemo from "./JournalDemo";
import WorkbookPage, {
  Fold,
  INK,
  PageBody,
  PageLabel,
  PageRule,
  PageVoice,
  RULE,
  SIGNAL_DEEP,
  WritingLines,
} from "./WorkbookPage";
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
import teenWorkbook from "@/assets/home-teen-workbook.jpg";
import childColouring from "@/assets/home-child-colouring.jpg";

/* â”€â”€ page furniture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/

/** The sheet's own title block. */
const PageTitle = ({ track }: { track: TrackKey }) => (
  <>
    <h3
      className="font-display text-[38px] sm:text-5xl md:text-[56px] leading-[0.95] tracking-tight"
      style={{ color: INK }}
    >
      {WEEK1_TRACKS[track].title.toUpperCase()}
    </h3>
    <p
      className="font-body text-[15px] leading-[1.7] mt-6 max-w-[58ch]"
      style={{ color: INK, opacity: 0.78 }}
    >
      {WEEK1_TRACKS[track].translation}
    </p>
  </>
);

/**
 * Words set on the page as the worksheet sets them â€” spaced out on a rule,
 * not as pills. Pills read as tags in a CMS; this reads as printed matter.
 */
const WordRow = ({ words }: { words: readonly string[] }) => (
  <div className="flex flex-wrap gap-x-8 gap-y-3 mt-5">
    {words.map((w) => (
      <span
        key={w}
        className="font-body text-[15px] pb-1 border-b"
        style={{ color: INK, opacity: 0.8, borderColor: RULE }}
      >
        {w}
      </span>
    ))}
  </div>
);

/** A â†’ B â†’ C, set large. */
const Steps = ({ steps }: { steps: readonly string[] }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5">
    {steps.map((s, i) => (
      <span key={s} className="flex items-center gap-4">
        <span className="font-display text-2xl md:text-[28px] tracking-[0.1em]" style={{ color: INK }}>
          {s}
        </span>
        {i < steps.length - 1 && (
          <span style={{ color: SIGNAL_DEEP }} aria-hidden>â†’</span>
        )}
      </span>
    ))}
  </div>
);

/** A photograph laid onto the page, captioned as a plate. */
const Plate = ({ src, alt, caption }: { src: string; alt: string; caption: string }) => (
  <figure>
    <div className="aspect-[4/3] overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover object-center" loading="lazy" width={1200} height={900} />
    </div>
    <figcaption
      className="font-body text-[13px] leading-[1.7] mt-4 pt-4 border-t"
      style={{ color: INK, opacity: 0.7, borderColor: RULE }}
    >
      {caption}
    </figcaption>
  </figure>
);

/* â”€â”€ ADULT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/

const AdultSheet = () => (
  <WorkbookPage week={1} track="Adult" phase="Block 1 Â· See Clearly" page={3} pages={8}>
    <PageTitle track="adult" />

    <div className="mt-14">
      <PageLabel>The question</PageLabel>
      <PageVoice>{WEEK1_ADULT.question}</PageVoice>
      <WritingLines n={3} />
    </div>

    <Fold label="The idea" defaultOpen>
      <PageVoice className="mb-6">{WEEK1_ADULT.ideaLead}</PageVoice>
      <PageBody>{WEEK1_ADULT.ideaBody}</PageBody>
    </Fold>

    <Fold label="This week's practice" defaultOpen>
      <Steps steps={WEEK1_ADULT.practice} />
      <p
        className="text-[22px] md:text-[26px] italic mt-8 mb-3"
        style={{ fontFamily: "var(--font-serif)", color: SIGNAL_DEEP }}
      >
        {WEEK1_ADULT.practiceShift}
      </p>
      <PageBody>{WEEK1_ADULT.practiceShiftWhy}</PageBody>
    </Fold>

    <Fold label="Your intention">
      <JournalDemo />
    </Fold>

    <Fold label="How your week runs">
      <ol className="space-y-9">
        {RHYTHM.map((step) => (
          <li key={step.day + step.title}>
            <div className="flex flex-col sm:flex-row sm:gap-8">
              <span
                className="font-display text-lg tracking-[0.16em] shrink-0 sm:w-[8.5rem] pt-0.5"
                style={{ color: SIGNAL_DEEP }}
              >
                {step.day}
              </span>
              <div className="mt-1 sm:mt-0">
                <p className="font-body text-[15px] font-bold" style={{ color: INK }}>
                  {step.title}
                </p>
                <PageBody className="mt-1.5">{step.body}</PageBody>

                {/* The Friday check-in is where the four rungs live. Labels
                    only â€” a public visitor has nothing to record against, and
                    nothing they touch here is stored. */}
                {step.day === "FRI" && (
                  <ul className="mt-5">
                    {LADDER.map((rung) => (
                      <li
                        key={rung.value}
                        className="font-body text-[14px] py-2.5 border-b"
                        style={{ color: INK, opacity: 0.75, borderColor: RULE }}
                      >
                        {rung.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Fold>
  </WorkbookPage>
);

/* â”€â”€ TEEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/

const TeenSheet = () => (
  <WorkbookPage week={1} track="Teen" phase="Block 1 Â· See Clearly" page={3} pages={8}>
    <PageTitle track="teen" />

    <div className="mt-14">
      <PageVoice className="not-italic">
        <span className="font-display text-[40px] sm:text-6xl tracking-tight block leading-[0.95]" style={{ color: INK }}>
          FAMILIAR IS NOT THE SAME AS TRUE.
        </span>
      </PageVoice>
      <PageBody className="mt-7">{WEEK1_TEEN.nuance}</PageBody>
    </div>

    <Fold label="Where it might have come from" defaultOpen>
      <WordRow words={WEEK1_TEEN.examples} />
    </Fold>

    <Fold label="Part of the Week 1 exercise" defaultOpen>
      <PageBody>
        Take one opinion, label, preference or expectation. Ask where it actually came from.
      </PageBody>
      <Steps steps={WEEK1_TEEN.sources} />

      <PageBody className="mt-10">
        Then decide what to do with it. All four are real answers â€” including the last one.
      </PageBody>
      <div className="mt-5">
        {WEEK1_TEEN.outcomes.map((o) => (
          <div
            key={o}
            className="flex items-center gap-4 py-4 border-b"
            style={{ borderColor: RULE }}
          >
            {/* The printed sheet uses an 8pt outlined box. Empty, unranked. */}
            <span
              className="w-4 h-4 border shrink-0"
              style={{ borderColor: SIGNAL_DEEP }}
              aria-hidden
            />
            <span className="font-display text-xl tracking-[0.12em]" style={{ color: INK }}>
              {o}
            </span>
          </div>
        ))}
      </div>
    </Fold>

    <Fold label="Their thinking stays in their hands">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <Plate
          src={teenWorkbook}
          alt="A teen worksheet open on a table during a Mindcast session"
          caption="Teen members get a printed worksheet for the session and take it home."
        />
        <div>
          <PageBody>
            Teen Mindcast is deliberately device-free. The room, the conversation and the paper â€”
            no app, no login, no digital journal. Nothing a teenager writes is typed, submitted or
            stored.
          </PageBody>
          {/* Asset slot. The link appears when an approved public sample
              worksheet exists; there is deliberately no placeholder PDF,
              because a fake worksheet is worse than no worksheet. */}
        </div>
      </div>
    </Fold>
  </WorkbookPage>
);

/* â”€â”€ CHILD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/

const ChildSheet = () => (
  <WorkbookPage week={1} track="Child" phase="Block 1 Â· See Clearly" page={3} pages={6}>
    <PageTitle track="child" />

    <div className="mt-14">
      <PageLabel>{WEEK1_CHILD.activity}</PageLabel>
      <PageBody>
        Children practise noticing what their body is telling them, out loud and on their feet.
      </PageBody>
      <WordRow words={WEEK1_CHILD.signals} />
    </div>

    <div className="mt-14">
      <PageVoice>{WEEK1_CHILD.coreIdea}</PageVoice>
      <PageBody className="mt-5">
        A rumbling tummy might be hunger, or nerves, or nothing much at all. Children are never
        told what a feeling in their body means â€” only that it is worth noticing.
      </PageBody>
    </div>

    <Fold label="The Week 1 colouring page" defaultOpen>
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <Plate
          src={childColouring}
          alt="A child colouring during a Mindcast children's session"
          caption="A lighthouse shining through wind and waves â€” the light that keeps going in a storm is the child's version of the signal."
        />
        <div>
          <PageBody>{WEEK1_CHILD.colouring.thenWhat}</PageBody>
          {/* The approved Week 1 colouring page lives in the private
              `colouring` storage bucket behind membership RLS, so it cannot be
              shown here. This is the room photograph instead. Publishing the
              real page publicly is a paywall decision, not a design one. */}
        </div>
      </div>
    </Fold>

    <div className="mt-16">
      <PageRule className="mb-10" />
      <p
        className="font-display text-[34px] sm:text-5xl tracking-tight leading-[0.95] mb-8"
        style={{ color: INK }}
      >
        BUILT FOR THE ROOM, NOT THE SCREEN.
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-7">
        {WEEK1_CHILD.learnsThrough.map((w, i) => (
          <span key={w} className="flex items-center gap-5">
            <span className="font-display text-xl md:text-2xl tracking-[0.1em]" style={{ color: INK }}>
              {w}
            </span>
            {i < WEEK1_CHILD.learnsThrough.length - 1 && (
              <span style={{ color: SIGNAL_DEEP, opacity: 0.6 }} aria-hidden>Â·</span>
            )}
          </span>
        ))}
      </div>
      <PageBody>
        There is no children's app and no children's digital journal. Their responses are spoken,
        drawn and played â€” never typed, submitted or stored.
      </PageBody>
    </div>
  </WorkbookPage>
);

/* â”€â”€ the tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€*/

const SHEETS: Record<TrackKey, () => JSX.Element> = {
  adult: AdultSheet,
  teen: TeenSheet,
  child: ChildSheet,
};

const WeekOnePreview = ({
  weekOneTheme,
  initialTrack = "adult",
}: {
  weekOneTheme: string;
  /** Which sheet is open first â€” the binder passes the lens being browsed. */
  initialTrack?: TrackKey;
}) => {
  const [track, setTrack] = useState<TrackKey>(initialTrack);
  const reduce = useReducedMotion();
  const Sheet = SHEETS[track];

  return (
    <div>
      <div className="max-w-3xl">
        <p
          className="font-body text-[10px] font-bold tracking-[0.32em] uppercase mb-5"
          style={{ color: SIGNAL_DEEP }}
        >
          Block 1 Â· See Clearly
        </p>
        <h2 className="font-display text-[48px] sm:text-7xl md:text-[84px] tracking-tight text-primary leading-[0.9]">
          WEEK 1
        </h2>
        <p className="font-display text-[28px] sm:text-4xl md:text-5xl tracking-tight text-foreground/45 leading-[1] mt-2">
          {weekOneTheme.toUpperCase()}
        </p>
        <p
          className="text-[22px] md:text-[28px] leading-[1.4] mt-10 max-w-[46ch]"
          style={{ fontFamily: "var(--font-serif)", color: INK }}
        >
          {WEEK1_SHARED_CONCEPT}
        </p>
        <p className="font-body text-sm text-muted-foreground mt-7">
          The same core idea, experienced three different ways. Turn the page.
        </p>
      </div>

      {/* Tabs sit on a rule above the sheet â€” a tabbed divider in a binder,
          not a segmented control. */}
      <div
        className="flex mt-16 border-b"
        style={{ borderColor: RULE }}
        role="tablist"
        aria-label="Week 1 by track"
      >
        {TRACK_ORDER.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={track === t}
            onClick={() => setTrack(t)}
            className="relative flex-1 sm:flex-none sm:min-w-[9rem] font-display tracking-[0.22em] text-base sm:text-lg py-4 transition-colors"
            style={{ color: track === t ? SIGNAL_DEEP : undefined }}
          >
            <span className={track === t ? "" : "text-foreground/35 hover:text-foreground/60 transition-colors"}>
              {WEEK1_TRACKS[t].label}
            </span>
            {track === t && (
              <motion.span
                layoutId="week-one-tab"
                className="absolute left-0 right-0 -bottom-px h-[2px]"
                style={{ backgroundColor: SIGNAL_DEEP }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-12 md:mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={track}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sheet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeekOnePreview;