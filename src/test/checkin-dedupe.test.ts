import { describe, expect, it } from "vitest";
import { CHECKIN_DEDUPE_WINDOW_MS, shouldDedupe } from "../../supabase/functions/_shared/checkin-dedupe";

const NOW = Date.parse("2026-08-16T10:00:00Z");

describe("check-in dedupe", () => {
  it("dedupes a second tap inside the 5 minute window", () => {
    const prev = new Date(NOW - 4 * 60_000).toISOString();
    expect(shouldDedupe(prev, NOW)).toBe(true);
  });

  it("lets a fresh check-in through after the window", () => {
    const prev = new Date(NOW - CHECKIN_DEDUPE_WINDOW_MS - 1000).toISOString();
    expect(shouldDedupe(prev, NOW)).toBe(false);
  });

  it("never dedupes on a corrupt timestamp", () => {
    expect(shouldDedupe("garbage", NOW)).toBe(false);
  });
});
