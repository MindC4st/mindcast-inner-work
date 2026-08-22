// The block explorer — the nested UI inside the Phases tab of the master
// Life Binder on /curriculum.
//
// Owns block + track state and the in-place page turn between them. The
// surrounding canvas, cover header and top-level tabs belong to the master
// shell in Curriculum.tsx; this component deliberately renders bare so it can
// sit on the shell's paper without a binder-inside-a-binder effect.
//
// `blockExtra` lets the shell fold extra material into a block's page — the
// Week 1 preview lives there, so selecting Block 1 surfaces the full preview
// in place instead of sending the visitor scrolling for it.
//
// Data discipline is unchanged: week numbers, themes and track titles come
// from the anon-safe `curriculum_public` RPC (via useCurriculumWeeks), and
// the block framing comes from the curated constants in lib/curriculumPublic.
// Nothing from the session tables.

import { useState, type ReactNode } from "react";
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
}: {
  blockNumber: number;
  track: Track;
  onTrackChange: (t: Track) => void;
  weeks: CurriculumWeek[];
  loading: boolean;
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
    <div className="paper-page p-6 sm:p-8 lg:p-10">
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
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

/* ── The explorer ─────────────────────────────────────────────────────────*/

const LifeBinder = ({
  weeks,
  loading,
  blockExtra,
}: {
  weeks: CurriculumWeek[];
  loading: boolean;
  /** Folded into a block's page when it returns something — the Week 1 preview. */
  blockExtra?: (blockNumber: number) => ReactNode;
}) => {
  const [blockNumber, setBlockNumber] = useState(1);
  const [track, setTrack] = useState<Track>("adult");
  const reduce = useReducedMotion();

  // A flip carries the block AND the track — either one turning the page.
  const flipKey = `${blockNumber}-${track}`;
  const extra = blockExtra?.(blockNumber) ?? null;

  return (
    <div>
      {/* Block tabs: paper tabs along a rule, at every size — the master
          shell already carries the sticky tab row for its five sections. */}
      <div
        role="tablist"
        aria-label="Curriculum blocks"
        className="flex gap-1.5 overflow-x-auto scrollbar-none mb-6"
      >
        {BLOCKS.map((b) => (
          <button
            key={b.number}
            role="tab"
            id={`block-tab-${b.number}`}
            aria-selected={blockNumber === b.number}
            aria-controls="block-page"
            onClick={() => setBlockNumber(b.number)}
            className="binder-tab-top shrink-0 px-4 py-3 text-[11px] font-body font-bold tracking-[0.14em] uppercase min-h-[44px]"
          >
            {pad(b.number)} {b.name}
          </button>
        ))}
      </div>

      <div id="block-page" role="tabpanel" aria-live="polite">
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
            />
            {extra && <div className="mt-12">{extra}</div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LifeBinder;
