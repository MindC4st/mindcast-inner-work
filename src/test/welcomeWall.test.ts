import { describe, it, expect } from "vitest";
import {
  BADGE_ZONE, TIERS, assignSlots, buildSlots, inZone,
  fontScaleForName, formatWallName, pickTier, tierCapacity,
} from "@/lib/welcomeWall";

describe("buildSlots", () => {
  it("never places a slot in its tier's title safe zone", () => {
    for (const t of TIERS) {
      for (const s of buildSlots(t.cols, t.rows, t.safe)) {
        expect(inZone(s.x, s.y, t.safe), `${t.cols}x${t.rows} @ ${s.x},${s.y}`).toBe(false);
      }
    }
  });

  it("never places a slot under the join-code badge", () => {
    for (const t of TIERS) {
      for (const s of buildSlots(t.cols, t.rows, t.safe)) {
        expect(inZone(s.x, s.y, BADGE_ZONE), `${t.cols}x${t.rows} @ ${s.x},${s.y}`).toBe(false);
      }
    }
  });

  // The bug this layout exists to fix: two names occupying the same space.
  it("produces slots that are all distinct and never coincident", () => {
    for (const t of TIERS) {
      const slots = buildSlots(t.cols, t.rows, t.safe);
      const keys = new Set(slots.map((s) => `${s.x.toFixed(4)},${s.y.toFixed(4)}`));
      expect(keys.size).toBe(slots.length);
    }
  });

  it("keeps every pair of slots at least one cell apart on an axis", () => {
    for (const t of TIERS) {
      const slots = buildSlots(t.cols, t.rows, t.safe);
      const cellW = 100 / t.cols;
      const cellH = 100 / t.rows;
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const dx = Math.abs(slots[i].x - slots[j].x);
          const dy = Math.abs(slots[i].y - slots[j].y);
          // Distinct grid cells differ by a full cell on at least one axis.
          expect(dx > cellW - 0.001 || dy > cellH - 0.001).toBe(true);
        }
      }
    }
  });

  it("orders slots nearest the centre first", () => {
    const t = TIERS[2];
    const slots = buildSlots(t.cols, t.rows, t.safe);
    const d = (s: { x: number; y: number }) => Math.hypot((s.x - 50) * (16 / 9), s.y - 50);
    for (let i = 1; i < slots.length; i++) {
      expect(d(slots[i])).toBeGreaterThanOrEqual(d(slots[i - 1]) - 0.0001);
    }
  });

  it("is deterministic across calls", () => {
    const t = TIERS[1];
    expect(buildSlots(t.cols, t.rows, t.safe)).toEqual(buildSlots(t.cols, t.rows, t.safe));
  });

  it("keeps every slot on screen", () => {
    for (const t of TIERS) {
      for (const s of buildSlots(t.cols, t.rows, t.safe)) {
        expect(s.x).toBeGreaterThan(0);
        expect(s.x).toBeLessThan(100);
        expect(s.y).toBeGreaterThan(0);
        expect(s.y).toBeLessThan(100);
      }
    }
  });
});

describe("tier capacity", () => {
  it("holds a realistically full room at the densest tier", () => {
    // A Sunday session should not push arrivals off the wall.
    expect(tierCapacity(TIERS[TIERS.length - 1])).toBeGreaterThanOrEqual(50);
  });

  it("gains capacity at every step", () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(tierCapacity(TIERS[i]), `tier ${i}`).toBeGreaterThan(tierCapacity(TIERS[i - 1]));
    }
  });

  it("shrinks the title only as density increases", () => {
    for (let i = 1; i < TIERS.length; i++) {
      expect(TIERS[i].titleScale).toBeLessThanOrEqual(TIERS[i - 1].titleScale);
      expect(TIERS[i].fontRem).toBeLessThan(TIERS[i - 1].fontRem);
    }
  });

  it("keeps the title legible even at maximum density", () => {
    expect(TIERS[TIERS.length - 1].titleScale).toBeGreaterThanOrEqual(0.5);
  });
});

describe("pickTier", () => {
  it("uses the loosest tier that fits the room", () => {
    expect(pickTier(0).cols).toBe(TIERS[0].cols);
    expect(pickTier(1).cols).toBe(TIERS[0].cols);
  });

  it("returns a tier with capacity for the count, until the densest is reached", () => {
    const maxCapacity = tierCapacity(TIERS[TIERS.length - 1]);
    for (let n = 0; n <= maxCapacity; n++) {
      expect(tierCapacity(pickTier(n)), `count=${n}`).toBeGreaterThanOrEqual(n);
    }
  });

  it("falls back to the densest tier when the room overflows", () => {
    expect(pickTier(100_000)).toEqual(TIERS[TIERS.length - 1]);
  });

  it("gets denser, never looser, as the room grows", () => {
    let prev = 0;
    for (let n = 0; n < 80; n++) {
      const cols = pickTier(n).cols;
      expect(cols).toBeGreaterThanOrEqual(prev);
      prev = cols;
    }
  });
});

describe("assignSlots", () => {
  it("places each arrival in its own slot while capacity lasts", () => {
    const out = assignSlots(["a", "b", "c"], 5);
    expect(out).toEqual(["a", "b", "c", null, null]);
  });

  it("returns an empty wall for no arrivals", () => {
    expect(assignSlots([], 3)).toEqual([null, null, null]);
  });

  it("never returns duplicates", () => {
    const ids = Array.from({ length: 40 }, (_, i) => `id-${i}`);
    const out = assignSlots(ids, 12).filter(Boolean);
    expect(new Set(out).size).toBe(out.length);
  });

  it("lets the newest arrival displace exactly one older name when full", () => {
    const capacity = 4;
    const before = assignSlots(["a", "b", "c", "d"], capacity);
    const after = assignSlots(["a", "b", "c", "d", "e"], capacity);
    const changed = before.filter((v, i) => v !== after[i]);
    expect(changed).toEqual(["a"]);
    expect(after).toContain("e");
  });

  it("survives a zero or negative capacity without throwing", () => {
    expect(assignSlots(["a"], 0)).toEqual([]);
    expect(assignSlots(["a"], -3)).toEqual([]);
  });
});

describe("formatWallName", () => {
  it("leaves a well-formed name alone", () => {
    expect(formatWallName("Ashleigh Carlson")).toBe("Ashleigh Carlson");
  });

  it("fixes shouty and lowercase entries", () => {
    expect(formatWallName("ASHLEIGH CARLSON")).toBe("Ashleigh Carlson");
    expect(formatWallName("ashleigh carlson")).toBe("Ashleigh Carlson");
  });

  it("collapses stray whitespace", () => {
    expect(formatWallName("  Ashleigh   Carlson \n")).toBe("Ashleigh Carlson");
  });

  it("handles hyphens and apostrophes", () => {
    expect(formatWallName("mary-jane o'brien")).toBe("Mary-Jane O'Brien");
    expect(formatWallName("MARY-JANE O’BRIEN")).toBe("Mary-Jane O’Brien");
  });

  it("preserves deliberate inner capitals", () => {
    expect(formatWallName("Angus McDonald")).toBe("Angus McDonald");
  });

  it("lowercases name particles", () => {
    expect(formatWallName("JOHAN VAN DER BERG")).toBe("Johan van der Berg");
  });

  it("shortens an over-long name to First L. rather than truncating", () => {
    expect(formatWallName("Bartholomew Fotheringay")).toBe("Bartholomew F.");
  });

  it("keeps a long single word intact — there is no initial to fall back to", () => {
    expect(formatWallName("Bartholomewfotheringay")).toBe("Bartholomewfotheringay");
  });

  it("returns empty string for blank input", () => {
    expect(formatWallName("")).toBe("");
    expect(formatWallName("   ")).toBe("");
    expect(formatWallName(null)).toBe("");
    expect(formatWallName(undefined)).toBe("");
  });

  it("already-short 'First L.' output passes through unchanged", () => {
    expect(formatWallName("Ashleigh C.")).toBe("Ashleigh C.");
  });
});

describe("fontScaleForName", () => {
  it("leaves short names at full size", () => {
    expect(fontScaleForName("Ashleigh")).toBe(1);
  });

  it("shrinks longer names monotonically", () => {
    const a = fontScaleForName("Ashleigh");
    const b = fontScaleForName("Ashleigh Ca");
    const c = fontScaleForName("Ashleigh Carls");
    const d = fontScaleForName("Ashleigh Carlson XX");
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(c);
    expect(c).toBeGreaterThanOrEqual(d);
    expect(d).toBeGreaterThan(0);
  });

  it("never scales a formatted name below the readable floor", () => {
    const worst = fontScaleForName(formatWallName("Bartholomew Fotheringay"));
    expect(worst).toBeGreaterThanOrEqual(0.7);
  });
});
