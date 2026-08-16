import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, GripVertical, Trash2, Plus, Printer } from "lucide-react";

// Session Framework — the v2.0 session shape (FRAMEWORK.md §VII) plus the
// 52-week journey arc. The run sheet prints from the CURRENT curriculum
// (scheduled_sessions → curriculum_weeks), not the retired sessions table.

const DEFAULT_FRAMEWORK = [
  { name: "The Landing", duration: 10, description: "Arrival. Bracelets tap at the door, names land on the welcome wall. No formal start — this is time to come out of the day and into the room." },
  { name: "Looking Back — the hook", duration: 5, description: "Return to last week's intention. Did it happen? What got in the way? A few honest words — no commentary, no praise, no redirection. Let them land." },
  { name: "The Source", duration: 10, description: "The video plays. Workbooks open, no interruptions. The facilitator watches with the group. (Hook + video ≈ 15 minutes together.)" },
  { name: "The Dig — reflective questions", duration: 25, description: "Two questions, on screen, one at a time. Quiet writing first, then conversation. Silence gets sixty seconds before anyone rescues it." },
  { name: "The Activity", duration: 15, description: "The week's exercise or discussion, as written. If the room is deep in real talk, the activity is optional — follow the room." },
  { name: "The Edge — weekly practice", duration: 10, description: "One specific thing to do this week, written in the workbook. The week's affirmation lands it. Then the close: a leaving word, one brief thought — and in the kids' and teens' rooms, every child signed in is signed out to a named person before the door opens." },
];

type FrameworkStep = Pick<Tables<"framework_steps">, "id" | "step_order" | "name" | "duration" | "description">;

type WeekRow = {
  week_number: number;
  block_theme: string | null;
  weekly_theme: string | null;
  adult_video_title?: string | null;
  teen_video_title?: string | null;
  kids_title?: string | null;
};

const nzToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

const AdminFramework = ({ embedded = false }: { embedded?: boolean }) => {
  const [steps, setSteps] = useState<FrameworkStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [week, setWeek] = useState<WeekRow | null>(null);
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [arc, setArc] = useState<{ block: string; weeks: WeekRow[] }[]>([]);
  const [arcOpen, setArcOpen] = useState(false);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("framework_steps").select("*").order("step_order").then(({ data }) => {
      if (data && data.length > 0) setSteps(data);
      else setSteps(DEFAULT_FRAMEWORK.map((s, i) => ({ ...s, step_order: i + 1, id: `new-${i}` })));
    });

    // Today's session → its week in the curriculum.
    (async () => {
      const { data: sched } = await supabase
        .from("scheduled_sessions")
        .select("session_date, week_number")
        .eq("session_date", nzToday())
        .in("status", ["live", "scheduled"])
        .order("session_date", { ascending: true })
        .limit(1);
      const row = (sched ?? [])[0];
      if (!row) return;
      setSessionDate(row.session_date);
      const { data: wk } = await supabase
        .from("curriculum_weeks")
        .select("week_number, block_theme, weekly_theme, adult_video_title, teen_video_title, kids_title")
        .eq("week_number", row.week_number)
        .maybeSingle();
      if (wk) setWeek(wk as WeekRow);
    })();

    // The full arc, for the journey panel.
    db.rpc("curriculum_public").then(({ data }) => {
      const rows = (data ?? []) as WeekRow[];
      const blocks: { block: string; weeks: WeekRow[] }[] = [];
      rows.forEach((r) => {
        const name = r.block_theme ?? "Journey";
        const last = blocks[blocks.length - 1];
        if (last && last.block === name) last.weeks.push(r);
        else blocks.push({ block: name, weeks: [r] });
      });
      setArc(blocks);
    });
  }, []);

  const updateStep = (idx: number, field: string, value: string | number) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };
  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 })));
  };
  const addStep = () => {
    setSteps((prev) => [...prev, { id: `new-${Date.now()}`, step_order: prev.length + 1, name: "", duration: 5, description: "" }]);
  };
  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const arr = [...steps];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setSteps(arr.map((s, i) => ({ ...s, step_order: i + 1 })));
  };

  const save = async () => {
    setSaving(true);
    await supabase.from("framework_steps").delete().gte("step_order", 0);
    const { error } = await supabase.from("framework_steps").insert(
      steps.map((s, i) => ({ step_order: i + 1, name: s.name, duration: s.duration, description: s.description }))
    );
    setSaving(false);
    if (error) toast({ title: "Error saving", description: error.message, variant: "destructive" });
    else toast({ title: "Framework saved" });
  };

  const printRunSheet = () => { window.print(); };

  const totalMinutes = steps.reduce((sum, s) => sum + (s.duration || 0), 0);
  const inputClass = "bg-transparent border-b border-border text-foreground font-body text-sm py-2 px-1 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40";

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      {/* Print-only run sheet */}
      <div className="hidden print:block print:bg-white print:text-black p-8" ref={printRef}>
        <h1 className="text-2xl font-bold mb-1">MINDCAST SESSION RUN SHEET</h1>
        {week ? (
          <p className="text-sm text-gray-600 mb-6">
            Week {week.week_number} · {sessionDate} · {week.block_theme} — {week.weekly_theme}
          </p>
        ) : (
          <p className="text-sm text-gray-600 mb-6">No session scheduled for today yet.</p>
        )}
        <div className="border-t-2 border-black pt-4 space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <span className="font-bold w-6 text-right">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-bold uppercase">{s.name}</span>
                  <span className="text-gray-500">{s.duration} min</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-black mt-6 pt-4">
          <p className="font-bold">Total runtime: {totalMinutes} minutes</p>
          {week?.adult_video_title && <p className="text-sm mt-2">Adults: {week.adult_video_title}</p>}
          {week?.teen_video_title && <p className="text-sm mt-1">Teens: {week.teen_video_title}</p>}
          {week?.kids_title && <p className="text-sm mt-1">Kids: {week.kids_title}</p>}
          <p className="text-xs text-gray-500 mt-4">
            Close the room properly: every child signed in is signed out to a named person before the door opens.
          </p>
        </div>
      </div>

      {/* Screen UI */}
      <div className="print:hidden">
        {!embedded && (
        <nav className="flex items-center justify-between px-6 md:px-12 py-5">
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground text-[10px] tracking-[0.12em] font-body hover:text-foreground">
            <ArrowLeft size={12} /> ADMIN
          </Link>
          <button onClick={printRunSheet} className="flex items-center gap-2 text-muted-foreground text-xs font-body hover:text-foreground transition-colors">
            <Printer size={14} /> Print run sheet
          </button>
        </nav>
        )}

        <div className="max-w-2xl mx-auto px-6 pt-8 pb-20">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Session Framework</h1>
          <p className="text-xs text-muted-foreground font-body mb-8">
            The v2.0 session shape — FRAMEWORK.md §VII. Edit freely; the print run sheet follows.
          </p>

          {week && (
            <div className="border border-primary/25 bg-primary/5 rounded-sm p-4 mb-8">
              <p className="text-[10px] font-body tracking-[0.25em] uppercase text-primary mb-1">
                Today · Week {week.week_number} · {week.block_theme}
              </p>
              <p className="font-display text-lg tracking-wide text-foreground">{(week.weekly_theme ?? "").toUpperCase()}</p>
            </div>
          )}

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="border border-border bg-card rounded-sm p-4 group hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <button onClick={() => moveStep(idx, idx - 1)} className="text-muted-foreground/40 hover:text-foreground text-xs" aria-label="Move step up">▲</button>
                    <GripVertical size={14} className="text-muted-foreground/40" />
                    <button onClick={() => moveStep(idx, idx + 1)} className="text-muted-foreground/40 hover:text-foreground text-xs" aria-label="Move step down">▼</button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground/60 text-xs font-body w-6">{idx + 1}.</span>
                      <input value={step.name} onChange={(e) => updateStep(idx, "name", e.target.value)} placeholder="Step name" className={`flex-1 ${inputClass}`} />
                      <input type="number" min={0} value={step.duration} onChange={(e) => updateStep(idx, "duration", +e.target.value)} className={`w-16 text-center ${inputClass}`} aria-label="Duration in minutes" />
                      <span className="text-muted-foreground/60 text-[9px] font-body">min</span>
                    </div>
                    <textarea value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)} placeholder="Description..." className={`w-full min-h-[40px] resize-none ${inputClass} ml-9`} />
                  </div>
                  <button onClick={() => removeStep(idx)} className="text-muted-foreground/40 hover:text-destructive transition-colors pt-2" aria-label="Remove step">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addStep} className="mt-4 flex items-center gap-2 text-muted-foreground text-xs font-body hover:text-foreground transition-colors">
            <Plus size={14} /> Add step
          </button>

          <div className="mt-8 flex items-center justify-between">
            <p className="text-muted-foreground text-xs font-body">Total runtime: <span className="text-foreground">{totalMinutes} minutes</span></p>
            <button onClick={save} disabled={saving} className="px-6 py-3 bg-primary text-primary-foreground text-xs tracking-[0.15em] font-display font-bold hover:bg-primary/90 transition-colors disabled:opacity-30">
              {saving ? "..." : "SAVE FRAMEWORK"}
            </button>
          </div>

          {/* The journey arc — v2.0, read from the live curriculum */}
          {arc.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <button
                onClick={() => setArcOpen(!arcOpen)}
                className="w-full flex items-center justify-between text-left"
                aria-expanded={arcOpen}
              >
                <div>
                  <h2 className="font-display text-xl tracking-wide text-foreground">THE YEAR — FOUR MOVEMENTS</h2>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    See Clearly → Unlearn → Rebuild → Live It · 52 weeks
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">{arcOpen ? "−" : "+"}</span>
              </button>

              {arcOpen && (
                <div className="mt-6 space-y-6">
                  {arc.map((b, i) => (
                    <div key={b.block} className="border border-border bg-card rounded-sm p-5">
                      <p className="text-[10px] font-body tracking-[0.25em] uppercase text-primary mb-1">
                        Movement {["I", "II", "III", "IV"][i] ?? i + 1} · Weeks {b.weeks[0]?.week_number}–{b.weeks[b.weeks.length - 1]?.week_number}
                      </p>
                      <h3 className="font-display text-lg tracking-wide text-foreground mb-3">{b.block.toUpperCase()}</h3>
                      <ul className="space-y-1.5">
                        {b.weeks.map((w) => (
                          <li key={w.week_number} className="flex gap-3 text-sm font-body">
                            <span className="text-primary/70 w-8 shrink-0">W{w.week_number}</span>
                            <span className="text-foreground">{w.weekly_theme}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFramework;
