import { useEffect, useRef, useState } from "react";

// Reusable session timer. A plain numeral countdown (no animated sweep), with
// reduced-motion safe behaviour: it never animates, just updates the numeral.
//
// `projected` renders the large on-screen countdown; otherwise it is a small
// facilitator-only indicator. Announcements are throttled via a separate
// aria-live element that only speaks at 60 / 30 / 10 / 0 seconds.
const SlideTimer = ({ seconds, running, projected = false, onComplete, label = "Countdown" }: {
  seconds: number;
  running: boolean;
  projected?: boolean;
  onComplete?: () => void;
  label?: string;
}) => {
  const [remaining, setRemaining] = useState(seconds);
  const [announce, setAnnounce] = useState("");
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!running) { setRemaining(seconds); doneRef.current = false; return; }
    startRef.current = Date.now();
    doneRef.current = false;
    let raf = 0;
    const tick = () => {
      const rem = Math.max(0, Math.ceil(seconds - (Date.now() - (startRef.current ?? Date.now())) / 1000));
      setRemaining(rem);
      if ([60, 30, 10, 0].includes(rem) && rem !== remaining) setAnnounce(`${rem} seconds`);
      if (rem <= 0) {
        if (!doneRef.current) { doneRef.current = true; onComplete?.(); }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, seconds]);

  const last10 = running && remaining <= 10 && remaining > 0;

  return (
    <div className={`flex items-center justify-center gap-2 ${projected ? "" : "text-foreground/60"}`}>
      <span
        role="timer"
        aria-label={label}
        className={`font-display tabular-nums tracking-wider ${projected ? "text-7xl md:text-9xl text-foreground" : "text-lg"} ${last10 ? "text-primary" : ""}`}
      >
        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
      </span>
      <span aria-live="polite" className="sr-only">{announce}</span>
    </div>
  );
};

export default SlideTimer;
