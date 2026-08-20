// The 52-week journey, two ways of looking at it.
//
// Journey view is the default because the point of this section is that the
// year is four connected blocks, not fifty-two topics. Week view exists for
// the visitor who wants to check the whole thing is really there — but it
// shows only what `curriculum_public` returns, and a week with no title yet
// renders as a week with no title rather than something invented to fill it.

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/glow";
import { BLOCKS, blockRange, type CurriculumBlock } from "@/lib/curriculumPublic";
import type { CurriculumWeek } from "@/hooks/useCurriculumWeeks";

type View = "journey" | "week";

const Toggle = ({ view, setView }: { view: View; setView: (v: View) => void }) => (
  <div className="inline-flex items-center gap-7" role="tablist" aria-label="How to explore the curriculum">
    {([
      ["journey", "BY JOURNEY"],
      ["week", "BY WEEK"],
    ] as const).map(([value, label]) => (
      <button
        key={value}
        role="tab"
        aria-selected={view === value}
        onClick={() => setView(value)}
        className={`font-body text-[11px] font-bold tracking-[0.24em] pb-2 border-b-2 transition-colors ${
          view === value
            ? "text-primary border-primary"
            : "text-muted-foreground/60 border-transparent hover:text-foreground"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const BlockCard = ({
  block,
  weeks,
  open,
  onToggle,
  index,
}: {
  block: CurriculumBlock;
  weeks: CurriculumWeek[];
  open: boolean;
  onToggle: () => void;
  index: number;
}) => {
  const [from, to] = blockRange(block, weeks);
  const reduce = useReducedMotion();

  return (
    <Reveal delay={index * 0.06}>
      {/* A chapter opening on a page, not a card: a rule above, the number set
          large in the margin, and the detail folding out beneath. */}
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="group w-full text-left border-t border-border pt-9 pb-10 transition-opacity"
      >
        <div className="flex items-start gap-6 md:gap-10">
          <span
            aria-hidden
            className={`font-display text-5xl md:text-7xl leading-[0.8] shrink-0 w-[2.2ch] transition-colors ${
              open ? "text-primary" : "text-foreground/15 group-hover:text-foreground/30"
            }`}
          >
            {String(block.number).padStart(2, "0")}
          </span>

          <div className="flex-1 min-w-0">
            <p className="font-body text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-3">
              Weeks {from}–{to}
            </p>
            <h3 className="font-display text-[40px] sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[0.92]">
              {block.name.toUpperCase()}
            </h3>
            <p
              className="text-xl md:text-2xl text-foreground/85 leading-[1.4] italic mt-5 max-w-[46ch]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {block.premise}
            </p>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="font-body text-[15px] text-muted-foreground leading-[1.8] mt-7 max-w-[62ch]">
                    {block.detail}
                  </p>
                  {block.number === 1 && (
                    <p className="font-body text-[11px] font-bold tracking-[0.22em] text-primary uppercase mt-7">
                      Week 1 starts here ↓
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span
            className="font-body text-xl leading-none shrink-0 text-primary transition-transform duration-300 mt-2"
            style={{ transform: open ? "rotate(45deg)" : "none" }}
            aria-hidden
          >
            +
          </span>
        </div>
      </button>
    </Reveal>
  );
};

const WeekGrid = ({
  weeks,
  loading,
  onPreviewWeekOne,
}: {
  weeks: CurriculumWeek[];
  loading: boolean;
  onPreviewWeekOne: () => void;
}) => {
  if (loading) {
    return (
      <p className="font-body text-sm text-muted-foreground py-16 text-center" aria-live="polite">
        Loading the year…
      </p>
    );
  }

  if (weeks.length === 0) {
    // Better an honest empty state than a grid of invented titles.
    return (
      <p className="font-body text-sm text-muted-foreground py-16 text-center">
        The week list is unavailable right now. The four blocks above are the shape of the year.
      </p>
    );
  }

  return (
    // A contents page: week number in the margin, the shared idea beside it,
    // one hairline between entries. No grid of tiles.
    <ol className="max-w-3xl mx-auto">
      {weeks.map((w) => {
        const block = BLOCKS.find((b) => b.number === w.block_number);
        const isOne = w.week_number === 1;
        return (
          <li
            key={w.week_number}
            className="flex items-baseline gap-5 md:gap-8 py-4 border-b border-border"
          >
            <span className="font-display text-xl text-foreground/25 leading-none w-[2.2ch] shrink-0 tabular-nums">
              {String(w.week_number).padStart(2, "0")}
            </span>
            {/* weekly_theme is the shared idea across all three rooms; it is
                what `curriculum_public` returns and what a visitor can see. */}
            <span className="font-body text-[15px] text-foreground leading-snug flex-1 min-w-0">
              {w.weekly_theme || <span className="text-muted-foreground/40">—</span>}
              {isOne && (
                <button
                  onClick={onPreviewWeekOne}
                  className="font-body text-[10px] font-bold tracking-[0.22em] text-primary uppercase ml-3 hover:underline align-middle"
                >
                  Preview ↓
                </button>
              )}
            </span>
            {block && (
              <span className="font-body text-[9px] font-bold tracking-[0.18em] uppercase text-primary/60 shrink-0 hidden sm:block">
                {block.name}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};

const JourneyMap = ({
  weeks,
  loading,
  onPreviewWeekOne,
}: {
  weeks: CurriculumWeek[];
  loading: boolean;
  onPreviewWeekOne: () => void;
}) => {
  const [view, setView] = useState<View>("journey");
  // Block 1 opens by default — it is where Week 1 lives, and it is the block
  // this page then goes on to preview in full.
  const [openBlock, setOpenBlock] = useState<number | null>(1);
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="flex justify-center mb-12">
        <Toggle view={view} setView={setView} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === "journey" ? (
            // Blocks run continuously down the page, divided by their own top
            // rules — a chapter list, not a stack of cards.
            <div className="max-w-3xl mx-auto border-b border-border">
              {BLOCKS.map((b, i) => (
                <BlockCard
                  key={b.number}
                  block={b}
                  weeks={weeks}
                  index={i}
                  open={openBlock === b.number}
                  onToggle={() => setOpenBlock(openBlock === b.number ? null : b.number)}
                />
              ))}
            </div>
          ) : (
            <WeekGrid weeks={weeks} loading={loading} onPreviewWeekOne={onPreviewWeekOne} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default JourneyMap;
