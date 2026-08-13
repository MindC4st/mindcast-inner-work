import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Printable coursebook export (facilitator/admin). Renders the 52-week content —
// including the workbook_activity (the paper version of each live activity) — in
// a print-optimised layout. Use the browser's Print dialog to "Save as PDF".
// One printed book per track edition (Adult / Teen / Child).

type Track = "Adult" | "Teen" | "Child";

type Row = {
  week_number: number; block_number: number | null; block_theme: string | null;
  weekly_theme: string | null; core_learning: string | null;
  inner_wisdom_alignment: string | null;
  signal_metaphor: string | null; teen_signal_metaphor: string | null; kids_signal_metaphor: string | null;
  reflective_question: string | null; workbook_activity: string | null;
  youtube_title: string | null;
  adult_video_title: string | null; teen_video_title: string | null; kids_title: string | null;
  kids_picture_book: string | null; kids_picture_book_note: string | null; kids_colouring_prompt: string | null;
};

const PHASES = ["All phases", "1 · See Clearly", "2 · Unlearn", "3 · Rebuild", "4 · Live It"];

const Lines = ({ n }: { n: number }) => (
  <div className="cb-lines">{Array.from({ length: n }).map((_, i) => <div key={i} className="cb-line" />)}</div>
);

const CoursebookPrint = () => {
  const [track, setTrack] = useState<Track>("Adult");
  const [phase, setPhase] = useState(0); // 0 = all
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("curriculum_weeks").select("*").order("week_number", { ascending: true });
      if (!active) return;
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const weeks = useMemo(
    () => rows.filter((r) => phase === 0 || r.block_number === phase),
    [rows, phase],
  );

  const title = (r: Row) =>
    (track === "Teen" ? r.teen_video_title : track === "Child" ? r.kids_title : r.adult_video_title)
    || r.weekly_theme || "Untitled";
  const metaphor = (r: Row) =>
    track === "Teen" ? r.teen_signal_metaphor : track === "Child" ? r.kids_signal_metaphor : r.signal_metaphor;

  return (
    <div className="cb-root">
      <style>{`
        .cb-root { background:#f4f4f5; min-height:100vh; color:#14283c; }
        .cb-page { background:#fff; }
        .cb-lines { margin-top:10px; }
        .cb-line { border-bottom:1px solid #cbd5e1; height:26px; }
        @media screen {
          .cb-sheet { max-width:820px; margin:0 auto; padding:24px; }
          .cb-page { box-shadow:0 6px 30px -18px rgba(0,0,0,.4); margin-bottom:24px; padding:56px 64px; border-radius:2px; }
        }
        @media print {
          .no-print { display:none !important; }
          .cb-root { background:#fff; }
          .cb-sheet { max-width:none; margin:0; padding:0; }
          .cb-page { box-shadow:none; margin:0; padding:22mm 20mm; page-break-after:always; }
          @page { size:A4; margin:0; }
        }
        .cb-eyebrow { letter-spacing:.28em; font-size:11px; text-transform:uppercase; color:#5b7288; }
        .cb-title { font-size:30px; font-weight:700; line-height:1.1; margin:6px 0 14px; }
        .cb-label { letter-spacing:.22em; font-size:10px; text-transform:uppercase; color:#8a97a5; margin-bottom:4px; }
        .cb-body { font-size:15px; line-height:1.6; }
        .cb-quote { font-family:Georgia,serif; font-size:18px; line-height:1.5; font-style:italic; }
        .cb-block { margin-top:22px; }
      `}</style>

      <div className="cb-sheet">
        {/* Controls (not printed) */}
        <div className="no-print flex flex-wrap items-center gap-3 mb-6 bg-white rounded-lg p-4 shadow-sm">
          <Link to="/mindcast-live/library" className="flex items-center gap-1.5 text-sm text-[#5b7288] hover:text-[#14283c]"><ArrowLeft size={15} /> Library</Link>
          <span className="text-[#8a97a5]">|</span>
          <label className="text-xs uppercase tracking-widest text-[#5b7288]">Edition
            <select value={track} onChange={(e) => setTrack(e.target.value as Track)} className="ml-2 border rounded px-2 py-1 text-[#14283c]">
              <option>Adult</option><option>Teen</option><option>Child</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest text-[#5b7288]">Phase
            <select value={phase} onChange={(e) => setPhase(Number(e.target.value))} className="ml-2 border rounded px-2 py-1 text-[#14283c]">
              {PHASES.map((p, i) => <option key={i} value={i}>{p}</option>)}
            </select>
          </label>
          <button onClick={() => window.print()} className="ml-auto flex items-center gap-2 bg-[#14283c] text-white text-xs tracking-widest uppercase px-4 py-2 rounded">
            <Printer size={14} /> Print / Save as PDF
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#5b7288]" /></div>
        ) : (
          <>
            {/* Cover */}
            <div className="cb-page" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "60vh" }}>
              <p className="cb-eyebrow">Mindcast</p>
              <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: ".06em", margin: "12px 0" }}>THE 52-WEEK JOURNEY</h1>
              <p className="cb-body" style={{ color: "#5b7288" }}>{track} Coursebook{phase ? ` · Phase ${PHASES[phase]}` : ""}</p>
              <p className="cb-body" style={{ marginTop: 24, color: "#8a97a5" }}>Notice · Name · Rewire</p>
            </div>

            {/* One page per week */}
            {weeks.map((r) => (
              <div key={r.week_number} className="cb-page">
                <p className="cb-eyebrow">Week {String(r.week_number).padStart(2, "0")}{r.block_theme ? ` · ${r.block_theme}` : ""}</p>
                <h2 className="cb-title">{title(r)}</h2>
                {r.core_learning && <p className="cb-body">{r.core_learning}</p>}

                {r.inner_wisdom_alignment && (
                  <div className="cb-block">
                    <p className="cb-label">Inner Wisdom</p>
                    <p className="cb-quote">{r.inner_wisdom_alignment}</p>
                  </div>
                )}

                {metaphor(r) && (
                  <div className="cb-block">
                    <p className="cb-label">In Today's World</p>
                    <p className="cb-body">{metaphor(r)}</p>
                  </div>
                )}

                {(r.youtube_title) && (
                  <div className="cb-block">
                    <p className="cb-label">This Week's Video</p>
                    <p className="cb-body">{r.youtube_title} — watch in the member portal.</p>
                  </div>
                )}

                {track === "Child" ? (
                  <>
                    {r.kids_picture_book && (
                      <div className="cb-block">
                        <p className="cb-label">Picture Book</p>
                        <p className="cb-body">{r.kids_picture_book}{r.kids_picture_book_note ? ` — ${r.kids_picture_book_note}` : ""}</p>
                      </div>
                    )}
                    {r.kids_colouring_prompt && (
                      <div className="cb-block">
                        <p className="cb-label">Colouring Page</p>
                        <p className="cb-body">{r.kids_colouring_prompt}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {r.reflective_question && (
                      <div className="cb-block">
                        <p className="cb-label">Reflect</p>
                        <p className="cb-body" style={{ fontWeight: 600 }}>{r.reflective_question}</p>
                        <Lines n={4} />
                      </div>
                    )}
                    {r.workbook_activity && (
                      <div className="cb-block">
                        <p className="cb-label">Your Activity</p>
                        <p className="cb-body">{r.workbook_activity}</p>
                        <Lines n={5} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursebookPrint;
