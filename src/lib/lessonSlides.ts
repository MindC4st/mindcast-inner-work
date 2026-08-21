// lessonSlides.ts — the live session deck metadata, read from lesson_slides.
//
// The database is the single source of truth for slide titles, order, beats,
// durations and track applicability. Facilitate Live renders from the same
// table; AdminFramework must agree with it. Titles/positions changed in the
// DB flow through on next load — no code change, no second hard-coded deck.

export type TrackName = "Adult" | "Teen" | "Child";

export type LessonSlide = {
  id: string;
  slide_key: string;
  position: number;
  beat: string | null;
  title: string;
  component_key: string | null;
  is_active: boolean;
  default_duration_seconds: number | null;
  applies_to_tracks: string[] | null;
};

/** Facilitator Notes supports delivery but is never a projected slide. */
export const isProjectedSlide = (s: Pick<LessonSlide, "is_active" | "component_key">): boolean =>
  s.is_active && s.component_key !== "FacilitatorNotes";

/** Active projected slides for one audience, ordered by position. */
export function slidesForTrack(slides: LessonSlide[], track: TrackName): LessonSlide[] {
  return slides
    .filter(isProjectedSlide)
    .filter((s) => (s.applies_to_tracks ?? []).includes(track))
    .sort((a, b) => a.position - b.position);
}

/** "3 min", "20 min" — human-friendly default duration. */
export function formatSlideDuration(seconds: number | null): string {
  if (seconds === null || Number.isNaN(seconds)) return "—";
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

/** Total projected runtime in minutes, derived from the data. */
export function totalDurationMinutes(slides: LessonSlide[]): number {
  return Math.round(slides.reduce((sum, s) => sum + (s.default_duration_seconds ?? 0), 0) / 60);
}

const BEAT_LABEL: Record<string, string> = {
  notice: "Notice",
  name: "Name",
  do: "Do",
};

/** Notice / Name / Do, capitalised for display. */
export function beatLabel(beat: string | null): string {
  return BEAT_LABEL[(beat ?? "").toLowerCase()] ?? (beat ?? "").toUpperCase();
}
