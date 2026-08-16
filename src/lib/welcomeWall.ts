// Welcome Wall layout — the maths behind the names on the big screen.
//
// The wall used to scatter names at random positions with random rotation,
// size and font family. On a real room that produced collisions: names landed
// on top of each other and across the centre title, and the random serif read
// as a different brand entirely.
//
// This replaces the scatter with a slot grid:
//
//   * the screen is divided into cols × rows slots
//   * slots overlapping the centre title (and the join-code badge) are removed
//   * remaining slots are ordered nearest-the-centre-first, so early arrivals
//     wreathe the title and the wall grows outward as the room fills
//   * one name per slot, so two names can never overlap
//   * drift is bounded well inside a slot, so movement can't cause a collision
//
// Density steps down through tiers as more people check in, so 8 names are
// large and legible and 50 names still fit without touching.
//
// Kept pure and DOM-free so the geometry can be unit tested — "do any two
// names overlap" is a property worth asserting rather than eyeballing on a
// projector five minutes before a session.

export interface WallSlot {
  /** Slot centre, as a percentage of the wall's width. */
  x: number;
  /** Slot centre, as a percentage of the wall's height. */
  y: number;
}

export interface Zone { x0: number; x1: number; y0: number; y1: number }

export interface WallTier {
  cols: number;
  rows: number;
  /** Base font size in rem for a name in this tier. */
  fontRem: number;
  /**
   * Centre rectangle reserved for the theme title. Nothing is ever placed
   * here — this is the fix for names landing across the title.
   */
  safe: Zone;
  /**
   * How much of its full size the centre title renders at. A full room is
   * mostly names, so the title yields space rather than pushing arrivals off
   * the wall entirely.
   */
  titleScale: number;
}

// Bottom-left corner reserved for the join-code badge.
export const BADGE_ZONE: Zone = { x0: 0, x1: 24, y0: 80, y1: 100 };

// Wide screens make one horizontal percent physically wider than one vertical
// percent; weight x so "nearest the centre" means nearest on screen, not
// nearest in percentage space.
const ASPECT = 16 / 9;

export const inZone = (x: number, y: number, z: Zone) =>
  x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1;

/**
 * Usable slot centres for a cols × rows grid, nearest the centre first.
 * Ordering is deterministic so a given room size always lays out the same way.
 */
export const buildSlots = (cols: number, rows: number, safe: Zone): WallSlot[] => {
  const slots: WallSlot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5) / cols) * 100;
      const y = ((r + 0.5) / rows) * 100;
      if (inZone(x, y, safe)) continue;
      if (inZone(x, y, BADGE_ZONE)) continue;
      slots.push({ x, y });
    }
  }
  const dist = (s: WallSlot) => Math.hypot((s.x - 50) * ASPECT, s.y - 50);
  return slots.sort((a, b) => {
    const d = dist(a) - dist(b);
    if (Math.abs(d) > 0.0001) return d;
    // Stable tiebreak so equidistant slots never swap between renders.
    return a.y - b.y || a.x - b.x;
  });
};

// Density steps down and the title steps back as the room fills.
export const TIERS: WallTier[] = [
  { cols: 4, rows: 4, fontRem: 2.5,  safe: { x0: 18, x1: 82, y0: 27, y1: 73 }, titleScale: 1 },
  { cols: 5, rows: 5, fontRem: 2.0,  safe: { x0: 18, x1: 82, y0: 27, y1: 73 }, titleScale: 1 },
  { cols: 6, rows: 6, fontRem: 1.65, safe: { x0: 20, x1: 80, y0: 30, y1: 70 }, titleScale: 0.85 },
  { cols: 7, rows: 7, fontRem: 1.35, safe: { x0: 24, x1: 76, y0: 34, y1: 66 }, titleScale: 0.7 },
  { cols: 8, rows: 8, fontRem: 1.15, safe: { x0: 26, x1: 74, y0: 38, y1: 62 }, titleScale: 0.55 },
];

/** Usable slot count for a tier. */
export const tierCapacity = (t: WallTier): number => buildSlots(t.cols, t.rows, t.safe).length;

/** The loosest tier that still fits `count` names, or the densest we have. */
export const pickTier = (count: number): WallTier => {
  for (const t of TIERS) {
    if (tierCapacity(t) >= count) return t;
  }
  return TIERS[TIERS.length - 1];
};

/**
 * Map check-ins to slots in arrival order, newest winning on collision.
 *
 * `slotIndex = arrivalIndex % capacity` keeps this pure and stable: when the
 * room outgrows the densest tier, each new arrival displaces exactly one old
 * name instead of reshuffling the whole wall.
 *
 * Returns an array of length `capacity`; `null` means the slot is empty.
 */
export const assignSlots = (ids: string[], capacity: number): (string | null)[] => {
  // Guard before allocating — new Array(-1) throws RangeError.
  if (!Number.isInteger(capacity) || capacity <= 0) return [];
  const slots: (string | null)[] = new Array(capacity).fill(null);
  ids.forEach((id, i) => { slots[i % capacity] = id; });
  return slots;
};

const smallWords = new Set(["van", "von", "de", "del", "der", "da", "di", "la", "le", "of"]);

/** Title-case one word, respecting hyphens, apostrophes and Mc/Mac. */
const caseWord = (word: string): string => {
  if (!word) return word;
  // Recurse through hyphen and apostrophe joins: mary-jane → Mary-Jane.
  for (const sep of ["-", "'", "’"]) {
    if (word.includes(sep)) return word.split(sep).map(caseWord).join(sep);
  }
  const lower = word.toLowerCase();
  if (smallWords.has(lower)) return lower;
  // Leave deliberate inner capitals alone (McDonald, DeSilva) rather than
  // flattening a name someone typed correctly.
  if (/[a-z][A-Z]/.test(word)) return word;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * Tidy a stored display_name for the big screen: collapse whitespace, fix
 * ALL-CAPS and all-lowercase entries, and shorten anything too long to fit a
 * slot down to "First L." rather than truncating mid-word.
 */
export const formatWallName = (raw: string | null | undefined): string => {
  const cleaned = (raw || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const parts = cleaned.split(" ").map(caseWord);
  const full = parts.join(" ");
  if (full.length <= 22 || parts.length < 2) return full;
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
};

/**
 * Shrink long names so they stay inside their slot. Cheaper and steadier than
 * measuring the DOM, and deterministic for tests.
 */
export const fontScaleForName = (name: string): number => {
  const n = name.length;
  if (n > 18) return 0.7;
  if (n > 14) return 0.82;
  if (n > 11) return 0.92;
  return 1;
};
