import { describe, it, expect } from "vitest";
import {
  beatLabel, formatSlideDuration, isProjectedSlide, slidesForTrack, totalDurationMinutes,
  type LessonSlide,
} from "@/lib/lessonSlides";

// Mirrors the lesson_slides shape (migration 20260820120001). Intended
// configuration per the live-deck spec: Adult/Teen project 8 slides, Child
// projects 9 (Child keeps Go Deeper AND adds Colouring Activity), and
// Facilitator Notes is active but never projected.
//
// The later workbook-parity migration restores `deeper` to Child after the
// safeguarded colouring page, so the fixture encodes the current 9-slide Child
// configuration from the timestamp-ordered migration chain.
const LIVE_SLIDES: LessonSlide[] = [
  { id: "1", slide_key: "welcome", position: 1, beat: "notice", title: "Welcome + Opening Question", component_key: "WelcomeWall", is_active: true, default_duration_seconds: 180, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "2", slide_key: "voices", position: 2, beat: "notice", title: "Return to Your Intention", component_key: "Voices", is_active: true, default_duration_seconds: 300, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "3", slide_key: "ancient", position: 3, beat: "notice", title: "Inner Wisdom + In Today's World", component_key: "WisdomWorld", is_active: true, default_duration_seconds: 360, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "4a", slide_key: "todays_world", position: 4, beat: "notice", title: "In Today's World", component_key: "GeneratedVideo", is_active: false, default_duration_seconds: 180, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "4", slide_key: "video", position: 4, beat: "name", title: "This Week's Listen", component_key: "Video", is_active: true, default_duration_seconds: 1200, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "5a", slide_key: "theme", position: 5, beat: "name", title: "Today's Theme", component_key: "TodaysTheme", is_active: false, default_duration_seconds: 180, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "5", slide_key: "coloring", position: 5, beat: "name", title: "Colouring Activity", component_key: "Coloring", is_active: true, default_duration_seconds: 600, applies_to_tracks: ["Child"] },
  { id: "6", slide_key: "deeper", position: 6, beat: "name", title: "Go Deeper + Together", component_key: "Deeper", is_active: true, default_duration_seconds: 900, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "7a", slide_key: "exercise", position: 7, beat: "name", title: "Experiential Exercise", component_key: "Exercise", is_active: false, default_duration_seconds: 900, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "7", slide_key: "reflection", position: 7, beat: "name", title: "Reflect & Share", component_key: "Reflection", is_active: true, default_duration_seconds: 480, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "8", slide_key: "intention", position: 8, beat: "do", title: "Before You Leave", component_key: "Intention", is_active: true, default_duration_seconds: 420, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "9", slide_key: "affirmation", position: 9, beat: "do", title: "Closing Affirmation", component_key: "Affirmation", is_active: true, default_duration_seconds: 60, applies_to_tracks: ["Adult", "Teen", "Child"] },
  { id: "99", slide_key: "notes", position: 99, beat: "do", title: "Facilitator Notes", component_key: "FacilitatorNotes", is_active: true, default_duration_seconds: 60, applies_to_tracks: ["Adult", "Teen", "Child"] },
];

describe("session framework derives from lesson_slides data", () => {
  it("15. Adult derives 8 projected slides from current data", () => {
    expect(slidesForTrack(LIVE_SLIDES, "Adult")).toHaveLength(8);
  });

  it("16. Teen derives 8 projected slides", () => {
    expect(slidesForTrack(LIVE_SLIDES, "Teen")).toHaveLength(8);
  });

  it("17. Child derives 9 projected slides (keeps Go Deeper, adds Colouring Activity)", () => {
    const child = slidesForTrack(LIVE_SLIDES, "Child");
    expect(child).toHaveLength(9);
    expect(child.map((s) => s.slide_key)).toContain("coloring");
    expect(child.map((s) => s.slide_key)).toContain("deeper");
  });

  it("18. Facilitator Notes is excluded from the projected count", () => {
    for (const track of ["Adult", "Teen", "Child"] as const) {
      const keys = slidesForTrack(LIVE_SLIDES, track).map((s) => s.slide_key);
      expect(keys).not.toContain("notes");
    }
    expect(isProjectedSlide({ is_active: true, component_key: "FacilitatorNotes" })).toBe(false);
  });

  it("19. inactive slides are excluded", () => {
    const keys = slidesForTrack(LIVE_SLIDES, "Adult").map((s) => s.slide_key);
    expect(keys).not.toContain("todays_world");
    expect(keys).not.toContain("theme");
    expect(keys).not.toContain("exercise");
  });

  it("20. ordering comes from position", () => {
    const shuffled = [...LIVE_SLIDES].reverse();
    const deck = slidesForTrack(shuffled, "Adult");
    const positions = deck.map((s) => s.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(deck[0].slide_key).toBe("welcome");
    expect(deck[deck.length - 1].slide_key).toBe("affirmation");
  });

  it("21. titles render from DB data, not constants", () => {
    const deck = slidesForTrack(LIVE_SLIDES, "Adult");
    expect(deck[0].title).toBe("Welcome + Opening Question");
    expect(deck[1].title).toBe("Return to Your Intention");
  });

  it("22. changing a DB title changes the rendered title without code changes", () => {
    const renamed = LIVE_SLIDES.map((s) =>
      s.slide_key === "welcome" ? { ...s, title: "A Brand New Opening" } : s);
    const deck = slidesForTrack(renamed, "Adult");
    expect(deck[0].title).toBe("A Brand New Opening");
  });

  it("23. duration total is derived dynamically", () => {
    const deck = slidesForTrack(LIVE_SLIDES, "Adult");
    const manual = Math.round(
      deck.reduce((sum, s) => sum + (s.default_duration_seconds ?? 0), 0) / 60);
    expect(totalDurationMinutes(deck)).toBe(manual);
    // 3 + 5 + 6 + 20 + 15 + 8 + 7 + 1 = 65 minutes for the current Adult deck.
    expect(totalDurationMinutes(deck)).toBe(65);
  });

  it("a future teen-only slide flows through automatically", () => {
    const future = [...LIVE_SLIDES, {
      id: "10", slide_key: "teen_only", position: 6, beat: "name",
      title: "Teen Check", component_key: "Deeper", is_active: true,
      default_duration_seconds: 300, applies_to_tracks: ["Teen"],
    }];
    expect(slidesForTrack(future, "Teen")).toHaveLength(9);
    expect(slidesForTrack(future, "Adult")).toHaveLength(8);
    expect(slidesForTrack(future, "Child")).toHaveLength(9);
  });

  it("formats durations and beats for display", () => {
    expect(formatSlideDuration(180)).toBe("3 min");
    expect(formatSlideDuration(1200)).toBe("20 min");
    expect(formatSlideDuration(null)).toBe("—");
    expect(beatLabel("notice")).toBe("Notice");
    expect(beatLabel("do")).toBe("Do");
  });
});
