import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Printer, Pencil } from "lucide-react";
import {
  beatLabel, formatSlideDuration, slidesForTrack, totalDurationMinutes,
  type LessonSlide, type TrackName,
} from "@/lib/lessonSlides";

// Session Framework — the live deck structure, read dynamically from
// lesson_slides (the same table Facilitate Live renders from). Titles, order,
// beats, durations and track applicability all come from the database: change
// a slide title there and this page updates on next load — no code change.
//
// The old six-step framework_steps editor is retired: Facilitate Live ignores
// it, so editing it here would be false configuration. Structure edits belong
// in the lesson editor / DB, and this page links there.

const TRACKS: TrackName[] = ["Adult", "Teen", "Child"];

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
  const [slides, setSlides] = useState<LessonSlide[]>([]);
  const [track, setTrack] = useState<TrackName>("Adult");
  const [week, setWeek] = useState<WeekRow | null>(null);
  const [sessionDate, setSessionDate] = useState<string | null>(null);
  const [arc, setArc] = useState<{ block: string; weeks: WeekRow[] }[]>([]);
  const [arcOpen, setArcOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // The authoritative deck metadata.
    supabase
      .from("lesson_slides" as never)
      .select("id, slide_key, position, beat, title, component_key, is_active, default_duration_seconds, applies_to_tracks")
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Couldn't load session structure", description: error.message, variant: "destructive" });
          return;
        }
        setSlides(((data ?? []) as unknown as LessonSlide[]));
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
  }, [toast]);

  const deck = slidesForTrack(slides, track);
  const totalMinutes = totalDurationMinutes(deck);

  const printRunSheet = () => { window.print(); };

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      {/* Print-only run sheet — the CURRENT deck for the selected track */}
      <div className="hidden print:block print:bg-white print:text-black p-8">
        <h1 className="text-2xl font-bold mb-1">MINDCAST SESSION RUN SHEET — {track.toUpperCase()}</h1>
        {week ? (
          <p className="text-sm text-gray-600 mb-6">
            Week {week.week_number} Â· {sessionDate} Â· {week.block_theme} — {week.weekly_theme}
          </p>
        ) : (
          <p className="text-sm text-gray-600 mb-6">No session scheduled for today yet.</p>
        )}
        <div className="border-t-2 border-black pt-4 space-y-4">
          {deck.map((s, i) => (
            <div key={s.id} className="flex gap-4">
              <span className="font-bold w-6 text-right">{i + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-bold uppercase">{s.title}</span>
                  <span className="text-gray-500">{formatSlideDuration(s.default_duration_seconds)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{beatLabel(s.beat)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-black mt-6 pt-4">
          <p className="font-bold">
            Total runtime: {totalMinutes} minutes Â· {deck.length} projected slides
          </p>
          {week?.adult_video_title && track === "Adult" && <p className="text-sm mt-2">Video: {week.adult_video_title}</p>}
          {week?.teen_video_title && track === "Teen" && <p className="text-sm mt-2">Video: {week.teen_video_title}</p>}
          {week?.kids_title && track === "Child" && <p className="text-sm mt-2">Kids: {week.kids_title}</p>}
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
          <h1 className="font-display text-2xl font-bold text-primary mb-1">Session Framework</h1>
          <p className="text-xs text-muted-foreground font-body mb-6">
            The live deck structure, read from lesson_slides — the same source Facilitate Live uses.
            Titles, order and durations update automatically when the database changes.
          </p>

          {week && (
            <div className="border border-primary/25 bg-primary/5 rounded-sm p-4 mb-8">
              <p className="text-[10px] font-body tracking-[0.25em] uppercase text-primary mb-1">
                Today Â· Week {week.week_number} Â· {week.block_theme}
              </p>
              <p className="font-display text-lg tracking-wide text-foreground">{(week.weekly_theme ?? "").toUpperCase()}</p>
              {week.week_number && (
                <Link
                  to={`/mindcast-live/edit/${week.week_number}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-body tracking-widest uppercase text-primary hover:text-primary/70 transition-colors"
                >
                  <Pencil size={11} /> Edit session structure
                </Link>
              )}
            </div>
          )}

          {/* Track selector */}
          <div className="flex gap-1 rounded-md border border-border bg-card p-1 w-fit mb-6 max-w-full overflow-x-auto">
            {TRACKS.map((t) => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className={`px-4 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm whitespace-nowrap transition-colors ${
                  track === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground font-body mb-4">
            {track} Â· <span className="text-foreground">{deck.length} projected slides</span> Â· about {totalMinutes} minutes
          </p>

          <div className="space-y-3">
            {deck.map((s, i) => (
              <div key={s.id} className="border border-border bg-card rounded-sm p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-display text-primary text-lg w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base tracking-wide text-foreground break-words">{s.title.toUpperCase()}</p>
                    <p className="text-[10px] font-body tracking-widest uppercase text-muted-foreground mt-0.5">
                      {beatLabel(s.beat) || "—"} Â· {s.slide_key}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs font-body shrink-0">{formatSlideDuration(s.default_duration_seconds)}</span>
                </div>
              </div>
            ))}
            {deck.length === 0 && (
              <p className="text-sm text-muted-foreground font-body border border-border bg-card rounded-sm p-6 text-center">
                No active slides found for {track}. Check lesson_slides.
              </p>
            )}
          </div>

          {/* The journey arc — read from the live curriculum */}
          {arc.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <button
                onClick={() => setArcOpen(!arcOpen)}
                className="w-full flex items-center justify-between text-left"
                aria-expanded={arcOpen}
              >
                <div>
                  <h2 className="font-display text-xl tracking-wide text-primary">THE YEAR — FOUR MOVEMENTS</h2>
                  <p className="text-xs text-muted-foreground font-body mt-1">
                    See Clearly → Unlearn → Rebuild → Live It Â· 52 weeks
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">{arcOpen ? "−" : "+"}</span>
              </button>

              {arcOpen && (
                <div className="mt-6 space-y-6">
                  {arc.map((b, i) => (
                    <div key={b.block} className="border border-border bg-card rounded-sm p-5">
                      <p className="text-[10px] font-body tracking-[0.25em] uppercase text-primary mb-1">
                        Movement {["I", "II", "III", "IV"][i] ?? i + 1} Â· Weeks {b.weeks[0]?.week_number}–{b.weeks[b.weeks.length - 1]?.week_number}
                      </p>
                      <h3 className="font-display text-lg tracking-wide text-primary mb-3">{b.block.toUpperCase()}</h3>
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