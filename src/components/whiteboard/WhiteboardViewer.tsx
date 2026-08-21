// WhiteboardViewer — a read-only tldraw surface for a saved snapshot, shown in
// the member's session history. Lazy-loaded so the heavy tldraw bundle only
// ships when a member actually opens it.

import { useMemo } from "react";
import { Tldraw, createTLStore, loadSnapshot } from "tldraw";
import "tldraw/tldraw.css";

type Props = {
  snapshot: unknown;
};

const WhiteboardViewer = ({ snapshot }: Props) => {
  const store = useMemo(() => {
    const s = createTLStore();
    try {
      loadSnapshot(s, snapshot as Parameters<typeof loadSnapshot>[1]);
    } catch {
      /* empty board */
    }
    return s;
  }, [snapshot]);

  return (
    <div className="absolute inset-0 bg-white" data-testid="whiteboard-viewer">
      <Tldraw store={store} onMount={(editor) => { editor.updateInstanceState({ isReadonly: true }); }} />
    </div>
  );
};

export default WhiteboardViewer;
