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
  <div className="inline-flex border border-border bg-card" role="tablist" aria-label="How to explore the curriculum">
    {([
      ["journey", "EXPLORE BY JOURNEY"],
      ["week", "EXPLORE BY WEEK"],
    ] as const).map(([value, label]) => (
      <button
        key={value}
        role="tab"
        aria-selected={view === value}
        onClick={() => setView(value)}
        className={`font-body text-[11px] font-bold tracking-[0.2em] px-5 py-3 transition-colors ${
          view === value
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
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
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full text-left border p-7 md:p-9 transition-colors ${
          open ? "border-primary bg-card" : "border-border bg-card hover:border-primary/40"
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-body text-[10px] font-bold tracking-[0.3em] text-primary uppercase mb-3">
              Block {block.number} · Weeks {from}–{to}
            </p>
            <h3 className="font-display text-4xl md:text-5xl tracking-tight text-foreground leading-none">
              {block.name.toUpperCase()}
            </h3>
          </div>
          <span
            aria-hidden
            className={`font-display text-5xl md:text-6xl leading-none transition-colors ${
              open ? "text-primary" : "text-foreground/15"
            }`}
          >
            {String(block.number).padStart(2, "0")}
          </span>
        </div>

        <p className="font-serif text-lg md:text-xl text-foreground/90 leading-snug mt-5 max-w-2xl">
          {block.premise}
        </p>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-5 max-w-2xl">
                {block.detail}
              </p>
              {block.number === 1 && (
                <p className="font-body text-[11px] tracking-[0.2em] text-primary uppercase mt-6">
                  Week 1 starts here ↓
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border border border-border">
      {weeks.map((w) => {
        const block = BLOCKS.find((b) => b.number === w.block_number);
        const isOne = w.week_number === 1;
        return (
          <div
            key={w.week_number}
            className={`bg-card p-5 min-h-[7.5rem] flex flex-col ${isOne ? "ring-1 ring-inset ring-primary" : ""}`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <span className="font-display text-2xl text-foreground/30 leading-none">
                {String(w.week_number).padStart(2, "0")}
              </span>
              {block && (
                <span className="font-body text-[9px] font-bold tracking-[0.15em] uppercase text-primary/70">
                  {block.name}
                </span>
              )}
            </div>
            {/* weekly_theme is the shared idea across all three rooms; it is
                what `curriculum_public` returns and what a visitor can see. */}
            <p className="font-body text-xs text-foreground leading-snug">
              {w.weekly_theme || <span className="text-muted-foreground/50">—</span>}
            </p>
            {isOne && (
              <button
                onClick={onPreviewWeekOne}
                className="font-body text-[10px] font-bold tracking-[0.2em] text-primary uppercase mt-auto pt-3 text-left hover:underline"
              >
                Preview ↓
              </button>
            )}
          </div>
        );
      })}
    </div>
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
            <div className="space-y-4">
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
