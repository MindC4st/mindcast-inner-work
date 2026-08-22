import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Admin control for program-wide unlock schedule. Writes to public.app_settings
// keys: program_start_date (YYYY-MM-DD, week 1 anchor — Sunday recommended)
// and program_timezone (IANA tz, defaults to Pacific/Auckland). Consumed by
// the lesson_unlocked(week) SQL helper and the member-side lesson gate.

const TZ_OPTIONS = [
  "Pacific/Auckland",
  "Pacific/Chatham",
  "Australia/Sydney",
  "UTC",
];

const AdminProgram = ({ embedded = false }: { embedded?: boolean }) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [tz, setTz] = useState("Pacific/Auckland");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["program_start_date", "program_timezone"]);
      const map = Object.fromEntries((data || []).map(r => [r.key, r.value]));
      setStartDate(map.program_start_date || "");
      setTz(map.program_timezone || "Pacific/Auckland");
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!startDate) {
      toast({ title: "Pick a start date", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("app_settings").upsert(
      [
        { key: "program_start_date", value: startDate },
        { key: "program_timezone", value: tz },
      ],
      { onConflict: "key" },
    );
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Schedule saved", description: `Week 1 anchored to ${startDate} (${tz}).` });
  };

  const previewUnlocks = () => {
    if (!startDate) return [] as { week: number; date: string }[];
    const base = new Date(startDate + "T00:00:00");
    if (Number.isNaN(base.getTime())) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i * 7);
      return {
        week: i + 1,
        date: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      };
    });
  };

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      {!embedded && (
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body text-foreground/40 hover:text-foreground/70">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>
      )}

      <div className="max-w-2xl mx-auto px-6 pt-10 pb-16">
        <p className="portal-label text-primary mb-2">Admin · program</p>
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Program schedule</h1>
        <p className="text-foreground/50 text-sm font-body mb-10">
          Anchor Week 1. Lessons unlock at 9:30am in the chosen timezone, one per week thereafter.
        </p>

        {loading ? (
          <p className="text-foreground/40 text-sm" role="status">Loading schedule…</p>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              <label className="block">
                <span className="text-[10px] font-body uppercase tracking-widest text-foreground/50">Week 1 start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full min-h-11 border border-foreground/15 rounded-xl px-4 py-3 bg-background font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-body uppercase tracking-widest text-foreground/50">Timezone</span>
                <select
                  value={tz}
                  onChange={(e) => setTz(e.target.value)}
                  className="mt-2 w-full min-h-11 border border-foreground/15 rounded-xl px-4 py-3 bg-background font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  {TZ_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex min-h-11 items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-body font-semibold disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                <Check size={14} /> {saving ? "Saving…" : "Save schedule"}
              </button>
            </div>

            {previewUnlocks().length > 0 && (
              <div className="border border-foreground/10 rounded-2xl p-5 bg-foreground/[0.02]">
                <p className="text-[10px] font-body uppercase tracking-widest text-foreground/50 mb-3">Next unlocks (preview)</p>
                <ul className="space-y-1.5 text-sm font-body">
                  {previewUnlocks().map((r) => (
                    <li key={r.week} className="flex flex-col gap-1 sm:flex-row sm:justify-between text-foreground/80">
                      <span className="text-foreground/50">Week {r.week}</span>
                      <span>{r.date} · 9:30am</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProgram;
