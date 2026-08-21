// The Life Binder — the interactive curriculum explorer.
//
// Replaces the old scroll-through journey map with the thing it was always
// describing: a binder. Four index tabs (one per block) flip the page in
// place instead of sending the visitor down an endless scroll, and each block
// page carries an ADULT / TEEN / CHILD toggle so the same week can be read
// through whichever lens the visitor cares about.
//
// Data discipline is unchanged from the page it lives on: week numbers,
// themes and track titles come from the anon-safe `curriculum_public` RPC
// (via useCurriculumWeeks), and the block framing comes from the curated
// constants in lib/curriculumPublic. Nothing from the session tables.

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BLOCKS, blockRange } from "@/lib/curriculumPublic";
import type { CurriculumWeek, Track } from "@/hooks/useCurriculumWeeks";

const TRACKS: { key: Track; label: string }[] = [
  { key: "adult", label: "ADULT" },
  { key: "teen", label: "TEEN" },
  { key: "child", label: "CHILD" },
];

/** The surface a track works on. Teen and child are paper by design. */
const TRACK_SURFACE: Record<Track, string> = {
  adult: "Live session, worksheet, and an optional digital journal.",
  teen: "A paper track — their own room, their own words.",
  child: "A paper track — movement, pictures, stories and play.",
};

const pad = (n: number) => String(n).padStart(2, "0");

/* ── Track toggle ─────────────────────────────────────────────────────────*/

const TrackToggle = ({ track, onChange }: { track: Track; onChange: (t: Track) => void }) => (
  <div className="flex flex-col items-start lg:items-end gap-2">
    <div
      role="radiogroup"
      aria-label="Which track to read the weeks through"
      className="inline-flex items-center bg-[#f1ece2] p-1 rounded-lg"
    >
      {TRACKS.map((t) => (
        <button
          key={t.key}
          role="radio"
          aria-checked={track === t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-md text-[11px] font-body font-bold tracking-[0.16em] min-h-[38px] transition-colors ${
            track === t.key
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
    <p className="font-body text-[11px] text-muted-foreground/80">{TRACK_SURFACE[track]}</p>
  </div>
);

/* ── One block's page ─────────────────────────────────────────────────────*/

const BlockPage = ({
  blockNumber,
  track,
  onTrackChange,
  weeks,
  loading,
  onPreviewWeekOne,
}: {
  blockNumber: number;
  track: Track;
  onTrackChange: (t: Track) => void;
  weeks: CurriculumWeek[];
  loading: boolean;
  onPreviewWeekOne: () => void;
}) => {
  const block = BLOCKS.find((b) => b.number === blockNumber) ?? BLOCKS[0];
  const [from, to] = blockRange(block, weeks);
  const blockWeeks = weeks.filter((w) => w.block_number === blockNumber);

  // The week's title in the selected track, falling back to the shared idea —
  // a week with no track title yet shows as what it is, not something invented.
  const titleFor = (w: CurriculumWeek): string | null => {
    const t = w.track_titles?.[track];
    return t || w.weekly_theme;
  };

  return (
    <div className="paper-page p-6 sm:p-8 lg:p-10 min-h-[540px]">
      {/* Block heading + track toggle */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-[#efe9dd] pb-6 mb-8">
        <div>
          <p className="font-body text-[11px] font-bold tracking-[0.24em] uppercase text-primary mb-2">
            Block {pad(block.number)} · Weeks {from}–{to}
          </p>
          <h3 className="font-display text-5xl md:text-6xl text-foreground leading-[0.9] tracking-tight">
            {block.name.toUpperCase()}
          </h3>
        </div>
        <TrackToggle track={track} onChange={onTrackChange} />
      </div>

      {/* The block, framed */}
      <div className="max-w-[68ch] mb-10">
        <p className="font-body text-[10px] font-bold tracking-[0.28em] uppercase text-primary mb-2">
          Core focus
        </p>
        <p className="font-body text-[15px] font-semibold text-foreground leading-relaxed mb-4">
          {block.focus}
        </p>
        <p
          className="text-xl md:text-[22px] italic text-foreground/85 leading-[1.45] mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {block.premise}
        </p>
        <p className="font-body text-sm text-muted-foreground leading-[1.8]">{block.detail}</p>
      </div>

      {/* The weeks, as an index page */}
      <p className="font-body text-[10px] font-bold tracking-[0.28em] uppercase text-muted-foreground mb-4">
        The weeks · {TRACKS.find((t) => t.key === track)?.label} lens
      </p>

      {loading ? (
        <p className="font-body text-sm text-muted-foreground py-12 text-center" aria-live="polite">
          Opening the year…
        </p>
      ) : blockWeeks.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground py-12 text-center">
          The week list is unavailable right now. The four tabs still hold the shape of the year.
        </p>
      ) : (
        <ol>
          {blockWeeks.map((w) => {
            const title = titleFor(w);
            const isWeekOne = w.week_number === 1;
            return (
              <li
                key={w.week_number}
                className="flex items-baseline gap-4 md:gap-6 py-3.5 border-b border-[#f1ece2] last:border-b-0"
              >
                <span className="font-display text-lg text-foreground/25 leading-none w-[2.4ch] shrink-0 tabular-nums">
                  {pad(w.week_number)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-body text-[15px] font-semibold text-foreground leading-snug">
                    {title || <span className="text-muted-foreground/40">—</span>}
                  </span>
                  {/* The shared idea under the track's own title — except where
                      they are the same line, which would be a stutter. */}
                  {w.weekly_theme && w.weekly_theme !== title && (
                    <span className="block font-body text-xs text-muted-foreground mt-0.5">
                      Shared idea: {w.weekly_theme}
                    </span>
                  )}
                </span>
                {isWeekOne && (
                  <button
                    onClick={onPreviewWeekOne}
                    className="font-body text-[10px] font-bold tracking-[0.22em] text-primary uppercase shrink-0 hover:underline"
                  >
                    Preview ↓
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

/* ── Desktop index tab ────────────────────────────────────────────────────*/

const IndexTab = ({
  blockNumber,
  active,
  onSelect,
}: {
  blockNumber: number;
  active: boolean;
  onSelect: () => void;
}) => {
  const block = BLOCKS.find((b) => b.number === blockNumber) ?? BLOCKS[0];
  return (
    <button
      role="tab"
      id={`binder-tab-${block.number}`}
      aria-selected={active}
      aria-controls="binder-page"
      onClick={onSelect}
      className="binder-tab text-left px-4 py-4 min-h-[84px] w-full"
    >
      <span className={`font-display text-2xl leading-none ${active ? "text-primary" : "text-foreground/25"}`}>
        {pad(block.number)}
      </span>
      <span className="block font-body text-xs font-bold tracking-[0.16em] uppercase mt-1.5">
        {block.name}
      </span>
      <span className="block font-body text-[10px] text-muted-foreground/80 mt-0.5">
        Weeks {block.weeks[0]}–{block.weeks[1]}
      </span>
    </button>
  );
};

/* ── The binder ───────────────────────────────────────────────────────────*/

const LifeBinder = ({
  weeks,
  loading,
  onPreviewWeekOne,
}: {
  weeks: CurriculumWeek[];
  loading: boolean;
  onPreviewWeekOne: () => void;
}) => {
  const [blockNumber, setBlockNumber] = useState(1);
  const [track, setTrack] = useState<Track>("adult");
  const reduce = useReducedMotion();

  // A flip carries the block AND the track — either one turning the page.
  const flipKey = `${blockNumber}-${track}`;

  return (
    <div className="binder-canvas p-5 sm:p-8 lg:p-12">
      {/* The cover: embossed wordmark, then the explorer's label. */}
      <header className="text-center border-b border-[#e8e2d5] pb-8 mb-8">
        <p className="binder-emboss font-display text-4xl md:text-5xl select-none" aria-hidden>
          MINDCAST
        </p>
        <p className="font-body text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground mt-4">
          Interactive Curriculum Explorer
        </p>
        <p className="font-body text-sm text-muted-foreground mt-2">
          52 weeks · Four blocks · Three tracks
        </p>
      </header>

      {/* Mobile / tablet: the index tabs lie flat along the top as paper
          tabs, sticky under the navbar while the page turns beneath. */}
      <div
        role="tablist"
        aria-label="Curriculum blocks"
        className="lg:hidden sticky top-16 z-30 -mx-1 px-1 pt-3 bg-[#faf8f5]/95 backdrop-blur-sm flex gap-1.5 overflow-x-auto scrollbar-none"
      >
        {BLOCKS.map((b) => (
          <button
            key={b.number}
            role="tab"
            id={`binder-tab-m-${b.number}`}
            aria-selected={blockNumber === b.number}
            aria-controls="binder-page"
            onClick={() => setBlockNumber(b.number)}
            className="binder-tab-top shrink-0 px-4 py-3 text-[11px] font-body font-bold tracking-[0.14em] uppercase min-h-[44px]"
          >
            {pad(b.number)} {b.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-start">
        {/* The page that turns. */}
        <div id="binder-page" role="tabpanel" aria-live="polite" className="lg:col-span-10 lg:pr-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={flipKey}
              initial={reduce ? false : { opacity: 0, rotateY: -7, x: 36 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, rotateY: 5, x: -28 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1400, transformOrigin: "left center" }}
            >
              <BlockPage
                blockNumber={blockNumber}
                track={track}
                onTrackChange={setTrack}
                weeks={weeks}
                loading={loading}
                onPreviewWeekOne={onPreviewWeekOne}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop: the physical index tabs on the right edge. */}
        <div
          role="tablist"
          aria-label="Curriculum blocks"
          aria-orientation="vertical"
          className="hidden lg:flex lg:col-span-2 flex-col gap-2.5 self-stretch justify-center"
        >
          {BLOCKS.map((b) => (
            <IndexTab
              key={b.number}
              blockNumber={b.number}
              active={blockNumber === b.number}
              onSelect={() => setBlockNumber(b.number)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LifeBinder;
