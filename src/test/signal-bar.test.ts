import { describe, expect, it } from "vitest";
import { SIGNAL_BAR } from "@/lib/signalBar";

// Guards the parse of MC-BRD-001 §4. If the controlled document is reworded
// so the spec no longer parses — or the canonical geometry changes without
// anyone noticing — this fails loudly instead of silently drawing the wrong
// mark on every worksheet, slide and email.

describe("signal bar spec (MC-BRD-001 §4)", () => {
  it("parses the canonical geometry from the controlled document", () => {
    expect(SIGNAL_BAR.segmentCount).toBe(18);
    expect(SIGNAL_BAR.blueCount).toBe(7);
    expect(SIGNAL_BAR.gapPx).toBe(3);
  });

  it("has the rising signal then the flat tail", () => {
    expect(SIGNAL_BAR.heights).toHaveLength(18);
    expect(SIGNAL_BAR.heights.slice(0, 7)).toEqual([30, 44, 58, 72, 86, 100, 86]);
    expect(SIGNAL_BAR.heights.slice(7)).toEqual(Array.from({ length: 11 }, () => 34));
  });
});
