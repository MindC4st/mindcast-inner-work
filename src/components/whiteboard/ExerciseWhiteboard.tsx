// ExerciseWhiteboard — a tldraw canvas surface dropped onto the Experiential
// Exercise slide. State is keyed per (week, audience) via tldraw's
// persistenceKey, so closing and reopening the slide brings back the same
// drawing. Persistence is local (IndexedDB on the facilitator's machine) —
// no Supabase round-trip, which keeps the live session responsive.
//
// Default export is required so React.lazy can pick it up.

import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

type Props = {
  week: number;
  audience: string;
};

const ExerciseWhiteboard = ({ week, audience }: Props) => {
  const key = `mindcast-live-week${week}-${audience.toLowerCase()}-exercise`;
  return (
    <div className="absolute inset-0 bg-white" data-testid="exercise-whiteboard">
      {/* tldraw fills its container — give it an explicit 100% surface. */}
      <Tldraw persistenceKey={key} />
    </div>
  );
};

export default ExerciseWhiteboard;
