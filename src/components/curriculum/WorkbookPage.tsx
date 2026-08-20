// A Mindcast worksheet page, on screen.
//
// Not a card, not a panel — a sheet of paper. The proportions, margins, ruled
// lines, corner badges and footer are the same ones generateWorksheetPdf.ts
// prints, so what a visitor sees here is the artefact they would be handed at
// the door rather than a marketing impression of it.
//
// Everything is derived from the print constants:
//   A4          595.28 × 841.89pt
//   margin      40pt          → 6.72% of page width
//   footer      24pt tall, hairline rule above it
//   writing     24pt pitch between ruled lines
//   INK         #102438       body text
//   SIGNAL_DEEP #307191       all coloured text under 24pt
//   RULE        #C9D3DE       photocopy-safe ruled lines
//
// curriculum-workbook.test.ts reads generateWorksheetPdf.ts and asserts these
// still agree. If somebody re-tunes the printed page, the screen facsimile
// fails the build rather than quietly becoming a lie.

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export const INK = "#102438";
export const SIGNAL_DEEP = "#307191";
export const RULE = "#C9D3DE";

/** margin ÷ page width, as a percentage — keeps the gutter proportional. */
const MARGIN = "6.72%";

/**
 * Ruled response lines, at the printed 24pt pitch.
 *
 * These are the single most recognisable thing about the worksheet: the space
 * left for a person to write. Rendering them empty is the point — the page is
 * waiting for someone.
 */
export const WritingLines = ({ n = 3, className = "" }: { n?: number; className?: string }) => (
  <div className={`mt-5 ${className}`} aria-hidden>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="h-[26px] border-b" style={{ borderColor: RULE }} />
    ))}
  </div>
);

/** The outlined WEEK 01 / ADULT badges the printed page carries top-right. */
const Badge = ({ children }: { children: ReactNode }) => (
  <span
    className="inline-block border px-2.5 py-1 font-body text-[9px] font-semibold tracking-[0.18em] leading-none"
    style={{ borderColor: SIGNAL_DEEP, color: SIGNAL_DEEP }}
  >
    {children}
  </span>
);

/** A section label as the worksheet sets it: small, spaced, Signal Deep. */
export const PageLabel = ({ children }: { children: ReactNode }) => (
  <p
    className="font-body text-[10px] font-bold tracking-[0.28em] uppercase mb-3"
    style={{ color: SIGNAL_DEEP }}
  >
    {children}
  </p>
);

/**
 * The worksheet's "voice" — Cormorant italic in print, used for the questions
 * and the ideas a person is meant to sit with rather than skim.
 */
export const PageVoice = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p
    className={`text-[22px] md:text-[27px] leading-[1.35] italic ${className}`}
    style={{ fontFamily: "var(--font-serif)", color: INK }}
  >
    {children}
  </p>
);

/** Body copy at the printed measure: generous, never small. */
export const PageBody = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p
    className={`font-body text-[15px] md:text-base leading-[1.75] max-w-[62ch] ${className}`}
    style={{ color: INK, opacity: 0.78 }}
  >
    {children}
  </p>
);

/** A hairline division, as the printed page uses between movements. */
export const PageRule = ({ className = "" }: { className?: string }) => (
  <div className={`border-t ${className}`} style={{ borderColor: RULE }} aria-hidden />
);

/**
 * Expandable content, set as a page rule with a label on it — not an
 * accordion. The brief asks for expandable content rather than endless text,
 * and a bordered accordion panel is the exact LMS furniture this page is
 * trying not to be. This reads as a line on a page that opens.
 */
export const Fold = ({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="group w-full flex items-center gap-5 text-left"
      >
        <span
          className="font-body text-[10px] font-bold tracking-[0.28em] uppercase shrink-0 transition-opacity group-hover:opacity-70"
          style={{ color: SIGNAL_DEEP }}
        >
          {label}
        </span>
        <span className="flex-1 border-t" style={{ borderColor: RULE }} aria-hidden />
        <span
          className="font-body text-lg leading-none shrink-0 transition-transform duration-300"
          style={{ color: SIGNAL_DEEP, transform: open ? "rotate(45deg)" : "none" }}
          aria-hidden
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-7">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkbookPage = ({
  week,
  track,
  phase,
  page,
  pages,
  children,
  className = "",
}: {
  week: number;
  track: string;
  phase?: string;
  page?: number;
  pages?: number;
  children: ReactNode;
  className?: string;
}) => {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className={`relative bg-white mx-auto w-full ${className}`}
      style={{
        // Paper, lit from above. No border — a border makes it a card again;
        // a shadow makes it a sheet lying on the ivory page beneath.
        boxShadow: "0 2px 4px rgba(16,36,56,0.04), 0 40px 80px -32px rgba(16,36,56,0.22)",
      }}
      initial={reduce ? false : { opacity: 0, y: 26, rotateX: 3 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ paddingLeft: MARGIN, paddingRight: MARGIN, paddingTop: "5.5%", paddingBottom: "3%" }}>
        {/* Masthead: phase on the left, week and track badges on the right,
            exactly as the printed sheet sets them. */}
        <header className="flex items-start justify-between gap-6 mb-10">
          {phase ? (
            <p
              className="font-body text-[9px] font-semibold tracking-[0.3em] uppercase pt-1"
              style={{ color: SIGNAL_DEEP, opacity: 0.75 }}
            >
              {phase}
            </p>
          ) : (
            <span />
          )}
          <div className="flex gap-2 shrink-0">
            <Badge>{track.toUpperCase()}</Badge>
            <Badge>WEEK {String(week).padStart(2, "0")}</Badge>
          </div>
        </header>

        {children}

        {/* Footer: hairline rule, the line that appears on every printed page,
            and the page number. */}
        <footer className="mt-14">
          <PageRule />
          <div className="flex items-center justify-between pt-3">
            <span className="font-body text-[9px] tracking-[0.1em]" style={{ color: INK, opacity: 0.45 }}>
              mindcast.co.nz
            </span>
            <span
              className="font-display text-[11px] tracking-[0.22em]"
              style={{ color: SIGNAL_DEEP }}
            >
              NOTICE IT, NAME IT, DO IT
            </span>
            <span className="font-body text-[9px] tracking-[0.1em]" style={{ color: INK, opacity: 0.45 }}>
              {page && pages ? `${page} / ${pages}` : ""}
            </span>
          </div>
        </footer>
      </div>
    </motion.article>
  );
};

export default WorkbookPage;
