import { lazy, Suspense, ComponentType } from "react";

// Slide 5 ("Go Deeper + Together") is the fixed home of the interactive
// activity. WHICH interactive surface appears there varies week to week, so
// this registry is the one place that decides.
//
// Adding a new activity is one entry here plus one option in the Lesson Editor
// dropdown and the activity_type CHECK constraint. Nothing in FacilitatorView
// needs to change.
//
// Two families of surface exist and they are deliberately different:
//
//   TALLY surfaces   (wordcloud, choice, scale, phrase) aggregate what members
//                    submitted from their phones. They live in FacilitatorView
//                    because they read the shared `responses` feed.
//
//   CANVAS surfaces  (whiteboard, and anything else driven by the facilitator's
//                     own stylus/tablet) take over the slide area and own their
//                     own persistence. They are registered here.
//
// Canvas surfaces are lazy so their weight — tldraw is the single largest chunk
// in the bundle — never loads for a week that does not use them.

const ExerciseWhiteboard = lazy(() => import("@/components/whiteboard/ExerciseWhiteboard"));

/** Props every canvas surface receives. Kept minimal on purpose: a canvas owns
 *  its own state, so it needs identity (which week, which room) and nothing
 *  else. */
export type CanvasSurfaceProps = {
  week: number;
  audience: string;
};

/**
 * Canvas activity surfaces, keyed by `activity_type`.
 *
 * A type listed here takes over the activity area of slide 5. A type NOT listed
 * here falls through to the tally surfaces in FacilitatorView.
 */
export const CANVAS_SURFACES: Record<string, ComponentType<CanvasSurfaceProps>> = {
  // Week 1's two-column T-chart: inputs on the left, likely origin on the right,
  // drawn live on the facilitator's tablet.
  whiteboard: ExerciseWhiteboard,
};

export const isCanvasSurface = (activityType: string) =>
  Object.prototype.hasOwnProperty.call(CANVAS_SURFACES, activityType);

/**
 * Render the canvas surface for an activity type.
 *
 * The wrapper supplies the sized, positioned box these components expect —
 * ExerciseWhiteboard is `absolute inset-0` and fills its container, so without
 * an explicit height it collapses to nothing.
 */
export const CanvasSurface = ({
  activityType, week, audience,
}: { activityType: string } & CanvasSurfaceProps) => {
  const Surface = CANVAS_SURFACES[activityType];
  if (!Surface) return null;
  return (
    <div className="relative w-full h-[52vh] rounded-sm overflow-hidden border border-[hsl(var(--ivory))]/15">
      <Suspense
        fallback={
          <div className="absolute inset-0 grid place-items-center bg-[hsl(var(--ivory))]/5">
            <span className="text-[hsl(var(--ivory))]/50 text-xs font-body tracking-widest uppercase">
              Loading canvas…
            </span>
          </div>
        }
      >
        <Surface week={week} audience={audience} />
      </Suspense>
    </div>
  );
};
