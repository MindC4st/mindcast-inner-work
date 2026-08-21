// ExerciseWhiteboard — a tldraw canvas for the Experiential Exercise slide.
// The facilitator's drawing is saved to Supabase (debounced) per (week, track)
// so it survives devices and appears in the member's session history. Local
// IndexedDB (persistenceKey) remains as the responsive first-resort; the
// Supabase snapshot is the durable record.

import { Tldraw, getSnapshot, loadSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  week: number;
  audience: string;
};

const ExerciseWhiteboard = ({ week, audience }: Props) => {
  const key = `mindcast-live-week${week}-${audience.toLowerCase()}-exercise`;

  const handleMount = (editor: any) => {
    // Restore the durable snapshot if one exists (different device / new session).
    supabase
      .from("whiteboard_snapshots")
      .select("snapshot")
      .eq("week_number", week)
      .eq("audience_type", audience)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.snapshot) {
          try { loadSnapshot(editor.store, data.snapshot as Parameters<typeof loadSnapshot>[1]); } catch { /* ignore corrupt snapshot */ }
        }
      });

    // Debounced save of the whole store snapshot (2s after the last edit).
    let timer: ReturnType<typeof setTimeout> | null = null;
    const save = () => {
      try {
        const snapshot = getSnapshot(editor.store);
        void supabase.from("whiteboard_snapshots").upsert(
          // tldraw snapshot ↔ jsonb: any is the honest boundary here.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { week_number: week, audience_type: audience, snapshot: snapshot as any, updated_at: new Date().toISOString() },
          { onConflict: "week_number,audience_type" },
        );
      } catch { /* ignore */ }
    };
    const unlisten = editor.store.listen(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(save, 2000);
    }, { scope: "document", source: "user" });
    // Persist on unmount (catches the final edit under the debounce window).
    return () => { unlisten?.(); save(); };
  };

  return (
    <div className="absolute inset-0 bg-white" data-testid="exercise-whiteboard">
      <Tldraw persistenceKey={key} onMount={handleMount} />
    </div>
  );
};

export default ExerciseWhiteboard;
