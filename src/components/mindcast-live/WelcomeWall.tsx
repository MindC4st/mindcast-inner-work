// WelcomeWall — the pre-session welcome slide. Subscribes to the
// public.check_ins realtime feed; as members tap their NFC bracelet at the
// door their name takes a place on the wall.
//
// Layout, not scatter. Names sit in a slot grid that reserves the centre for
// the theme title and the bottom-left for the join code, so a name can never
// land across the title or on top of another name. Density steps down as the
// room fills (see src/lib/welcomeWall.ts) — eight names are large and
// legible, fifty still fit without touching.
//
// One family, one size per tier, no rotation: the old random serif/display
// mix read as a different brand on every name. Movement is a small bounded
// drift, well inside each slot, so it never reintroduces a collision.
//
// Anonymous check-ins still count toward attendance but stay off the wall.

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import Ripple from "@/components/brand/Ripple";
import {
  assignSlots, buildSlots, fontScaleForName, formatWallName, pickTier,
} from "@/lib/welcomeWall";

type CheckIn = {
  id: string;
  profile_id: string | null;
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

const isWallVisible = (c: Pick<CheckIn, "is_anonymous" | "display_name">) =>
  !c.is_anonymous && !!c.display_name && c.display_name !== "Anonymous";

/** Stable pseudo-random in [0,1) from a row id, for drift phase only. */
const seededFloat = (id: string, salt: number): number => {
  let h = 5381 ^ salt;
  for (let i = 0; i < id.length; i++) h = (h * 33) ^ id.charCodeAt(i);
  return ((h >>> 0) % 100000) / 100000;
};

const WallName = ({
  checkIn, x, y, fontRem,
}: { checkIn: CheckIn; x: number; y: number; fontRem: number }) => {
  const name = useMemo(() => formatWallName(checkIn.display_name), [checkIn.display_name]);

  // Drift phase and duration only — never position, size, font or rotation.
  const drift = useMemo(() => ({
    duration: 26 + seededFloat(checkIn.id, 9) * 22,
    delay: -seededFloat(checkIn.id, 10) * 40,
  }), [checkIn.id]);

  return (
    <motion.div
      className="absolute select-none pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1, left: `${x}%`, top: `${y}%` }}
      exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.6 } }}
      transition={{
        opacity: { duration: 1.1, ease: "easeOut" },
        scale: { type: "spring", stiffness: 200, damping: 22 },
        left: { type: "spring", stiffness: 90, damping: 20 },
        top: { type: "spring", stiffness: 90, damping: 20 },
      }}
      style={{
        // Centre the name on its slot; the drift keyframe adds to this.
        "--mc-drift": `${6 + seededFloat(checkIn.id, 7) * 5}px`,
        animation: `mc-drift ${drift.duration}s ease-in-out ${drift.delay}s infinite`,
      } as CSSProperties}
    >
      <span
        className="font-display tracking-wide text-[hsl(var(--ivory))]/90 whitespace-nowrap -translate-x-1/2 -translate-y-1/2"
        style={{ fontSize: `${fontRem * fontScaleForName(name)}rem` }}
      >
        {name}
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
        .select("id, profile_id, display_name, is_anonymous, checked_in_at")
        .gt("checked_in_at", fourHoursAgo)
        .order("checked_in_at", { ascending: true });
      if (!active) return;
      setCheckIns((data || []).filter(isWallVisible) as CheckIn[]);
    })();

    const ch = supabase
      .channel("welcome-wall")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "check_ins" },
        (p) => {
          const row = p.new as CheckIn;
          if (!isWallVisible(row)) return;
          setCheckIns(prev => prev.some(c => c.id === row.id) ? prev : [...prev, row]);
        })
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, []);

  // One tile per person. A member who taps again later in the evening (or
  // whose first tap fell outside the edge function's dedupe window) must not
  // appear twice — keep their first arrival so the name doesn't jump slots.
  const people = useMemo(() => {
    const seen = new Set<string>();
    return checkIns.filter((c) => {
      const key = c.profile_id ?? `row:${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [checkIns]);

  const tier = useMemo(() => pickTier(people.length), [people.length]);
  const slots = useMemo(() => buildSlots(tier.cols, tier.rows, tier.safe), [tier]);

  // Slot index → the check-in occupying it (newest wins when we run out).
  const placed = useMemo(() => {
    const byId = new Map(people.map((p) => [p.id, p]));
    return assignSlots(people.map((p) => p.id), slots.length)
      .map((id, i) => (id ? { checkIn: byId.get(id)!, slot: slots[i] } : null))
      .filter((v): v is { checkIn: CheckIn; slot: { x: number; y: number } } => v !== null);
  }, [people, slots]);

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

      {/* Centre title — sits in the reserved safe zone, so nothing covers it. */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-8">
        <p className="text-[hsl(var(--bronze))]/70 text-[10px] tracking-[0.6em] font-body uppercase mb-4">
          Week {weekNumber} · {phaseName}
        </p>
        {/* Title scales back as the room fills so names keep their space —
            the reserved zone shrinks with it (see TIERS in lib/welcomeWall). */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ scale: tier.titleScale }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{ transformOrigin: "center" }}
        >
          <h1 className="font-display text-6xl md:text-8xl tracking-wide text-[hsl(var(--ivory))]/25 text-center leading-none">
            {(themeTitle || "").toUpperCase()}
          </h1>
          <p className="text-[hsl(var(--ivory))]/40 font-serif italic text-xl md:text-2xl mt-4 text-center">
            {sessionTitle}
          </p>
        </motion.div>

        {/* Signal — the room breathing. More visible while empty, quieter once
            names arrive, but never louder than the people on the wall. */}
        <div className="mt-8" aria-hidden="true">
          <Ripple
            size={people.length === 0 ? 84 : 56}
            animate
            className={people.length === 0 ? "text-[hsl(var(--ivory))]/40" : "text-[hsl(var(--ivory))]/15"}
          />
        </div>

        <p className="text-[hsl(var(--ivory))]/45 text-[10px] tracking-[0.5em] font-body uppercase mt-8">
          {people.length === 0
            ? "The room is ready."
            : `${people.length} in the room`}
        </p>
      </div>

      {/* Join code badge — bottom-left, in its own reserved zone. */}
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

      {/* Names — one per slot. */}
      <div className="absolute inset-0 z-20">
        <AnimatePresence>
          {placed.map(({ checkIn, slot }) => (
            <WallName
              key={checkIn.id}
              checkIn={checkIn}
              x={slot.x}
              y={slot.y}
              fontRem={tier.fontRem}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Bounded drift. Amplitude is a handful of pixels — small enough that a
          name always stays inside its own slot, so movement can never
          reintroduce the overlap this layout exists to prevent. */}
      <style>{`
        @keyframes mc-drift {
          0%   { transform: translate(0, 0); }
          33%  { transform: translate(var(--mc-drift), calc(var(--mc-drift) * -0.6)); }
          66%  { transform: translate(calc(var(--mc-drift) * -0.7), calc(var(--mc-drift) * 0.5)); }
          100% { transform: translate(0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes mc-drift {
            0%, 100% { transform: translate(0, 0); }
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeWall;
