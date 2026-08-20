import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { LADDER, ladderRung, ladderLabel } from "@/components/session/IntentionLadder";
import { Loader2 } from "lucide-react";

// The member's own self-assessment over time: how far along Notice -> Name -> Do
// they got, week by week.
//
// Deliberately not a score. There is no "12/52", no streak and no percentage,
// because the ladder exists precisely to stop members reading an honest "I
// didn't notice it" as failure. What it shows instead is SHAPE: which rung is
// most common, and whether the recent weeks sit higher than the early ones.
//
// Private by construction — my_intention_history is SECURITY DEFINER scoped to
// current_profile_id(), so this can only ever return the caller's own rows. A
// facilitator has no view of this anywhere.

type Row = { week_number: number; weekly_intention: string | null; intention_outcome: string | null };

const RUNG_COLOUR = [
  "bg-foreground/15",
  "bg-primary/30",
  "bg-primary/60",
  "bg-primary",
];

const IntentionProgress = () => {
  const { user } = useAuth();
  const { track } = useEntitlement();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    (async () => {
      const { data } = await (db as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: Row[] | null }>;
      }).rpc("my_intention_history", { p_track: track });
      if (!active) return;
      setRows((data ?? []).filter((r) => r.intention_outcome));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, track]);

  if (loading) {
    return (
      <div className="portal-card p-8 flex justify-center">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="portal-card p-6 md:p-8">
        <span className="portal-label text-foreground/40 block mb-2">NOTICE · NAME · DO</span>
        <h2 className="heading-display text-lg text-foreground mb-2">Your weekly self-check</h2>
        <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">
          Each Sunday you'll mark how far you got with the intention you set the week before.
          Once you've done that a few times, the pattern shows up here.
        </p>
      </div>
    );
  }

  // Distribution across the four rungs.
  const counts = LADDER.map(
    (r) => rows.filter((x) => x.intention_outcome === r.value).length);
  const peak = Math.max(1, ...counts);
  const mostCommon = LADDER[counts.indexOf(Math.max(...counts))];

  // Shape over time: average rung of the first half vs the most recent weeks.
  const recent = rows.slice(-4);
  const recentAvg = recent.reduce((n, r) => n + ladderRung(r.intention_outcome), 0) / recent.length;
  const earlier = rows.slice(0, -4);
  const earlierAvg = earlier.length
    ? earlier.reduce((n, r) => n + ladderRung(r.intention_outcome), 0) / earlier.length
    : null;

  return (
    <div className="portal-card p-6 md:p-8">
      <span className="portal-label text-foreground/40 block mb-2">NOTICE · NAME · DO</span>
      <h2 className="heading-display text-lg text-foreground mb-1">Your weekly self-check</h2>
      <p className="text-sm text-muted-foreground font-body font-light mb-6">
        {rows.length} {rows.length === 1 ? "week" : "weeks"} recorded · most often:{" "}
        <span className="text-foreground">{mostCommon.label.toLowerCase()}</span>
      </p>

      {/* Week-by-week strip. Each block is one week, height = rung reached. */}
      <div className="flex items-end gap-1 h-24 mb-2" role="img"
        aria-label={`Self-check by week: ${rows.map((r) => `week ${r.week_number}, ${ladderLabel(r.intention_outcome)}`).join("; ")}`}>
        {rows.map((r) => {
          const rung = ladderRung(r.intention_outcome);
          return (
            <div key={r.week_number} className="flex-1 min-w-[6px] flex flex-col justify-end h-full"
              title={`Week ${r.week_number} — ${ladderLabel(r.intention_outcome)}`}>
              <div className={`w-full rounded-sm ${RUNG_COLOUR[rung]}`}
                style={{ height: `${((rung + 1) / 4) * 100}%` }} />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-body text-muted-foreground/60 mb-8">
        <span>Week {rows[0].week_number}</span>
        <span>Week {rows[rows.length - 1].week_number}</span>
      </div>

      {/* Distribution — where the weeks actually landed. */}
      <div className="space-y-2.5">
        {LADDER.map((rung, i) => (
          <div key={rung.value} className="flex items-center gap-3">
            <span className="flex-1 text-xs font-body text-foreground/70 leading-snug">{rung.label}</span>
            <div className="w-28 h-2 rounded-sm bg-foreground/[0.06] overflow-hidden">
              <div className={`h-full ${RUNG_COLOUR[i]}`} style={{ width: `${(counts[i] / peak) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-xs font-body text-foreground/50">{counts[i]}</span>
          </div>
        ))}
      </div>

      {earlierAvg !== null && (
        <p className="mt-6 text-sm font-body text-muted-foreground leading-relaxed">
          {recentAvg > earlierAvg + 0.25
            ? "Your recent weeks are landing further along the ladder than your earlier ones."
            : recentAvg < earlierAvg - 0.25
              ? "Your recent weeks are sitting earlier on the ladder than they were. That is worth noticing, not fixing today."
              : "Your recent weeks are sitting about where they have been."}
        </p>
      )}

      <p className="mt-4 text-xs font-body text-muted-foreground/60 leading-relaxed">
        This is yours alone. Facilitators cannot see it, and it is never shown in the room.
      </p>
    </div>
  );
};

export default IntentionProgress;
