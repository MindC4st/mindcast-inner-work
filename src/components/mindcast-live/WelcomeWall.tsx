// WelcomeWall — the pre-session welcome slide. Subscribes to the
// public.check_ins realtime feed; as members tap their NFC bracelet at the
// door, names drift onto the screen at different sizes, orientations,
// drift directions, and serif/display fonts.
//
// Design: navy → bronze ambient gradient, theme + week name softly behind
// the floating field. Anonymous check-ins still count attendance but stay
// off the wall to keep the visual interesting.
//
// Performance: positions/sizes/drift parameters are deterministically
// derived from each row id so the wall doesn't jitter on re-render. We use
// CSS keyframe transforms (GPU) rather than animating React state.

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";

type CheckIn = {
  id: string;
  display_name: string;
  is_anonymous: boolean;
  checked_in_at: string;
};

type Props = {
  weekNumber: number;
  themeTitle: string;
  sessionTitle: string;
  phaseName: string;
  joinCode?: string;
  joinUrl?: string;
};

/** Pluck a stable float in [0,1) from a string id via a small DJB2-style hash. */
const seededFloat = (id: string, salt: number): number => {
  let h = 5381 ^ salt;
  for (let i = 0; i < id.length; i++) h = (h * 33) ^ id.charCodeAt(i);
  // map to 0..1
  return ((h >>> 0) % 100000) / 100000;
};

const FONT_CLASSES = [
  "font-serif italic",
  "font-display tracking-wider",
  "font-serif",
  "font-display tracking-wider",
];

const COLOUR_CLASSES = [
  "text-[hsl(var(--ivory))]/90",
  "text-[hsl(var(--ivory))]/80",
  "text-[hsl(var(--bronze))]/90",
  "text-[hsl(var(--blue-light))]/85",
  "text-[hsl(var(--ivory))]/70",
];

const FloatingName = ({ checkIn }: { checkIn: CheckIn }) => {
  const { id, display_name } = checkIn;

  // Deterministic params per row id.
  const params = useMemo(() => {
    const left = 4 + seededFloat(id, 1) * 88;       // % from left, padded from edges
    const top  = 6 + seededFloat(id, 2) * 80;       // % from top
    const size = 1.4 + seededFloat(id, 3) * 2.6;    // rem (1.4 → 4.0)
    const rot  = -10 + seededFloat(id, 4) * 20;     // degrees (-10 → +10)
    const fontIdx = Math.floor(seededFloat(id, 5) * FONT_CLASSES.length);
    const colourIdx = Math.floor(seededFloat(id, 6) * COLOUR_CLASSES.length);
    const driftX = -40 + seededFloat(id, 7) * 80;   // px drift on X
    const driftY = -30 + seededFloat(id, 8) * 60;   // px drift on Y
    const duration = 38 + seededFloat(id, 9) * 36;  // seconds (38 → 74)
    const delay = -seededFloat(id, 10) * duration;  // negative so each starts at random phase
    return { left, top, size, rot, fontIdx, colourIdx, driftX, driftY, duration, delay };
  }, [id]);

  return (
    <motion.div
      // Fade + scale in on first appearance.
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute select-none pointer-events-none"
      style={{
        left: `${params.left}%`,
        top: `${params.top}%`,
        // Use CSS custom properties for the keyframe to read.
        "--drift-x": `${params.driftX}px`,
        "--drift-y": `${params.driftY}px`,
        "--rot": `${params.rot}deg`,
        animation: `mc-float ${params.duration}s ease-in-out ${params.delay}s infinite`,
      } as CSSProperties}
    >
      <span
        className={`${FONT_CLASSES[params.fontIdx]} ${COLOUR_CLASSES[params.colourIdx]} whitespace-nowrap drop-shadow-[0_0_30px_rgba(53,133,175,0.15)]`}
        style={{ fontSize: `${params.size}rem`, transform: `rotate(${params.rot}deg)`, display: "inline-block" }}
      >
        {display_name}
      </span>
    </motion.div>
  );
};

export const WelcomeWall = ({ weekNumber, themeTitle, sessionTitle, phaseName, joinCode, joinUrl }: Props) => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  // Load recent (last 4h) + subscribe to new inserts.
  useEffect(() => {
    let active = true;
    (async () => {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
      const { data } = await db
        .from("check_ins")
        .select("id, display_name, is_anonymous, checked_in_at")
        .gt("checked_in_at", fourHoursAgo)
        .order("checked_in_at", { ascending: true });
      if (!active) return;
      setCheckIns((data || []).filter((c: CheckIn) => !c.is_anonymous && c.display_name && c.display_name !== "Anonymous"));
    })();

    const ch = supabase
      .channel("welcome-wall")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "check_ins" },
        (p) => {
          const row = p.new as CheckIn;
          if (row.is_anonymous || !row.display_name || row.display_name === "Anonymous") return;
          setCheckIns(prev => prev.some(c => c.id === row.id) ? prev : [...prev, row]);
        })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Ambient background — slow pulsing gradient picks up the brand. */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, hsl(var(--blue) / 0.18) 0%, transparent 55%), " +
            "radial-gradient(circle at 80% 70%, hsl(var(--bronze) / 0.18) 0%, transparent 55%)",
          animationDuration: "9s",
        }}
      />

      {/* Centre title — soft, sits behind names. */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[hsl(var(--bronze))]/70 text-[10px] tracking-[0.6em] font-body uppercase mb-4">
          Week {weekNumber} · {phaseName}
        </p>
        <h1 className="font-display text-6xl md:text-8xl tracking-wide text-[hsl(var(--ivory))]/15 text-center px-8 leading-none">
          {(themeTitle || "").toUpperCase()}
        </h1>
        <p className="text-[hsl(var(--ivory))]/30 font-serif italic text-xl md:text-2xl mt-4 text-center px-8">
          {sessionTitle}
        </p>
        <p className="text-[hsl(var(--ivory))]/40 text-[10px] tracking-[0.5em] font-body uppercase mt-10">
          {checkIns.length === 0
            ? "Tap your bracelet to join the room"
            : `${checkIns.length} in the room`}
        </p>
      </div>

      {/* Join code badge — bottom-left, always visible */}
      {joinCode && (
        <div className="absolute bottom-8 left-8 z-30 flex flex-col items-start gap-1">
          <p className="text-[hsl(var(--bronze))] text-[9px] tracking-[0.4em] font-body uppercase">Join Code</p>
          <p className="font-display text-4xl md:text-5xl tracking-[0.3em] text-[hsl(var(--ivory))]/90">{joinCode}</p>
          {joinUrl && (
            <p className="text-[hsl(var(--ivory))]/40 text-[10px] font-body mt-1">
              {joinUrl.replace(/^https?:\/\//, "")}
            </p>
          )}
        </div>
      )}

      {/* Floating names — above the title layer. */}
      <div className="absolute inset-0 z-20">
        <AnimatePresence>
          {checkIns.map(c => (
            <FloatingName key={c.id} checkIn={c} />
          ))}
        </AnimatePresence>
      </div>

      {/* Keyframes for the drift. Defined inline so we don't need a global
          CSS edit. Reads --drift-x / --drift-y / --rot from each name's style. */}
      <style>{`
        @keyframes mc-float {
          0%   { transform: translate(0, 0) rotate(var(--rot)); }
          25%  { transform: translate(calc(var(--drift-x) * 0.5),  calc(var(--drift-y) * -1)) rotate(var(--rot)); }
          50%  { transform: translate(var(--drift-x), calc(var(--drift-y) * 0.4)) rotate(var(--rot)); }
          75%  { transform: translate(calc(var(--drift-x) * -0.4), calc(var(--drift-y) * 0.8)) rotate(var(--rot)); }
          100% { transform: translate(0, 0) rotate(var(--rot)); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeWall;
