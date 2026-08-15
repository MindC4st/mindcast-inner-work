import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize } from "lucide-react";
import Ripple from "@/components/brand/Ripple";

// The welcome wall — one per room, projected. Arrival, not a dashboard.
//
// Rules this surface must never break (safeguarding, not styling):
//   - kids/teens walls show a first name or chosen display name ONLY —
//     never a surname, never a photo, never an age.
//   - a name appears only when check_ins.wall_hidden is false, which the
//     check-in paths resolve from guardian consent + opt-out at write time.
//     Revoking consent hides the child from the very next scan.
//   - nothing on any wall reveals membership tier, concession status,
//     trial status or attendance history. A trial guest looks like a member.
//   - no counters, no leaderboards, nothing competitive. Names and a ripple.
//
// /display/wall?room=adult|teen|kids

type Row = { id: string; display_name: string | null; checked_in_at: string };

const ROOM_TO_TRACK: Record<string, "Adult" | "Teen" | "Child"> = {
  adult: "Adult",
  teen: "Teen",
  teens: "Teen",
  kids: "Child",
  child: "Child",
};

const ROOM_LABEL: Record<string, string> = {
  Adult: "THE ROOM",
  Teen: "THE TEEN ROOM",
  Child: "THE KIDS' ROOM",
};

const nzDayStartISO = () => {
  // Midnight today in Pacific/Auckland, expressed as an ISO instant.
  const nzDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());
  const probe = new Date(`${nzDate}T00:00:00+12:00`);
  const probe13 = new Date(`${nzDate}T00:00:00+13:00`);
  // Pick whichever offset lands on the right NZ calendar day (DST-safe).
  const fmt = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(d);
  return (fmt(probe13) === nzDate ? probe13 : probe).toISOString();
};

const WelcomeWall = () => {
  const [searchParams] = useSearchParams();
  const track = ROOM_TO_TRACK[(searchParams.get("room") ?? "adult").toLowerCase()] ?? "Adult";
  const minorRoom = track !== "Adult";
  const [rows, setRows] = useState<Row[]>([]);

  const firstNameOnly = useCallback(
    (name: string | null) => {
      const n = (name ?? "").trim();
      if (!n) return "Welcome";
      // Kids/teens walls: first name or chosen display name only — if the
      // stored display name carries more words, only the first is projected.
      return minorRoom ? n.split(/\s+/)[0] : n;
    },
    [minorRoom],
  );

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("check_ins")
      .select("id, display_name, checked_in_at")
      .eq("track", track)
      .eq("is_anonymous", false)
      .eq("wall_hidden", false)
      .gte("checked_in_at", nzDayStartISO())
      .order("checked_in_at", { ascending: false })
      .limit(60);
    setRows((data ?? []) as Row[]);
  }, [track]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 5000);
    const channel = supabase
      .channel(`wall-${track}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "check_ins" }, () => void load())
      .subscribe();
    return () => {
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [load, track]);

  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 section-navy grain-overlay flex flex-col overflow-hidden">
      {/* Quiet header — the room, not a scoreboard. */}
      <header className="px-12 pt-10 flex items-start justify-between">
        <div>
          <p className="font-body text-[11px] tracking-[0.5em] text-cream/40 uppercase">Mindcast</p>
          <h1 className="font-display text-2xl tracking-[0.2em] text-cream/70 mt-1">
            WELCOME TO {ROOM_LABEL[track]}
          </h1>
        </div>
        <button
          onClick={goFullscreen}
          className="text-cream/20 hover:text-cream/50 transition-colors p-2"
          title="Fullscreen"
          aria-label="Fullscreen"
        >
          <Maximize size={18} />
        </button>
      </header>

      {/* Names arrive with the ripple: a point, then its consequences. */}
      <div className="flex-1 px-12 py-10 overflow-hidden">
        {rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Ripple size={72} animate className="text-cream/40 mb-8" />
            <p className="font-serif italic text-2xl text-cream/50">The room is ready.</p>
          </div>
        ) : (
          <div className="flex flex-wrap content-start gap-x-14 gap-y-8">
            <AnimatePresence>
              {rows.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, delay: Math.min(i * 0.04, 0.5) }}
                  className="flex items-center gap-4"
                >
                  {i === 0 && <Ripple size={34} animate className="text-cream/60 shrink-0" />}
                  <p
                    className={`font-display text-cream leading-none tracking-wide ${
                      i === 0 ? "text-7xl" : "text-5xl text-cream/85"
                    }`}
                  >
                    {firstNameOnly(c.display_name).toUpperCase()}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <footer className="px-12 pb-8">
        <p className="font-body text-[11px] tracking-[0.4em] text-cream/30 uppercase">
          NOTICE IT, NAME IT, DO IT
        </p>
      </footer>
    </div>
  );
};

export default WelcomeWall;
