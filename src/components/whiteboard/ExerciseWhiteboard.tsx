// ExerciseWhiteboard — a tldraw canvas for the Experiential Exercise slide.
// The facilitator's drawing is saved to Supabase (debounced) per live session
// so it survives devices and appears in the member's session history. Local
// IndexedDB (persistenceKey) remains as the responsive first-resort; the
// Supabase snapshot is the durable record.

import { Tldraw, getSnapshot, loadSnapshot, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

type Props = {
  week: number;
  audience: string;
  sessionCode: string;
};

const ExerciseWhiteboard = ({ week, audience, sessionCode }: Props) => {
  const key = `mindcast-live-${sessionCode.toLowerCase()}-exercise`;
  const licenseKey = import.meta.env.VITE_TLDRAW_LICENSE_KEY || undefined;

  const handleMount = (editor: Editor) => {
    // Restore the durable snapshot if one exists (different device / new session).
    supabase
      .from("whiteboard_snapshots")
      .select("snapshot")
      .eq("session_code", sessionCode)
      .eq("slide_key", "deeper")
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
          {
            week_number: week,
            audience_type: audience,
            session_code: sessionCode,
            slide_key: "deeper",
            // tldraw snapshots are JSON-serialisable; this cast names the
            // database boundary without weakening the editor type itself.
            snapshot: snapshot as unknown as Json,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "session_code,slide_key" },
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
      <Tldraw persistenceKey={key} licenseKey={licenseKey} onMount={handleMount} />
    </div>
  );
};

export default ExerciseWhiteboard;
