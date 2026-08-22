// The canonical signal bar, parsed from MC-BRD-001 §4 (controlledDocs.json)
// so the brand document stays the single source of truth. Nothing here
// hardcodes segment geometry: if the controlled document changes, this module
// follows it, and src/test/signal-bar.test.ts fails loudly if the document
// stops parsing.

import controlledDocs from "@/data/controlledDocs.json";

type ControlledDoc = { code?: string; title?: string; body: string };

export type SignalBarSpec = {
  /** Total number of vertical segments. */
  segmentCount: number;
  /** How many leading segments are Signal Blue; the rest are Mist. */
  blueCount: number;
  /** Relative segment heights (0–100), one per segment. */
  heights: number[];
  /** Gap between segments, px, at reference scale. */
  gapPx: number;
};

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

const parseSpec = (): SignalBarSpec => {
  const docs = controlledDocs as ControlledDoc[];
  const brand = docs.find((doc) => doc.body.includes("MC-BRD-001"));
  if (!brand) throw new Error("signalBar: MC-BRD-001 not found in controlledDocs.json");

  const section = brand.body.match(/## 4 · The signal bar[\s\S]*?(?=## \d)/);
  if (!section) throw new Error("signalBar: MC-BRD-001 §4 not found");
  const text = section[0];

  const countMatch = text.match(/\*\*(\d+) vertical segments\*\*/);
  if (!countMatch) throw new Error("signalBar: segment count not found in §4");
  const segmentCount = Number(countMatch[1]);

  const blueMatch = text.match(/first (\w+) are Signal Blue/i);
  if (!blueMatch) throw new Error("signalBar: blue segment count not found in §4");
  const blueCount = WORD_NUMBERS[blueMatch[1].toLowerCase()] ?? Number(blueMatch[1]);
  if (!Number.isFinite(blueCount)) throw new Error("signalBar: could not read blue count");

  const riseMatch = text.match(/Segment heights: \*\*([\d\s·]+)\*\*, then a flat \*\*(\d+)\*\*/);
  if (!riseMatch) throw new Error("signalBar: segment heights not found in §4");
  const rise = riseMatch[1].split("·").map((part) => Number(part.trim()));
  const tail = Number(riseMatch[2]);
  if (rise.some((height) => !Number.isFinite(height))) {
    throw new Error("signalBar: unparseable rise heights");
  }

  const heights = [
    ...rise,
    ...Array.from({ length: segmentCount - rise.length }, () => tail),
  ];

  const gapMatch = text.match(/(\d+)px gaps/);

  return {
    segmentCount,
    blueCount,
    heights,
    gapPx: gapMatch ? Number(gapMatch[1]) : 3,
  };
};

export const SIGNAL_BAR: SignalBarSpec = parseSpec();
