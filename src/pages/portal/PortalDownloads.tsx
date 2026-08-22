import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock, FileText, Palette, Clock, Shield, Unlock, AlertCircle } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { supabase } from "@/integrations/supabase/client";
import { downloadWorksheetPdf, WorksheetSession } from "@/lib/generateWorksheetPdf";
import { resolveColouringUrl } from "@/lib/colouringUrl";
import { toast } from "@/hooks/use-toast";
import { db } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────────────────

type DownloadItem = {
  week_number: number;
  audience: string;
  phase_name: string | null;
  theme_title: string;
  session_title: string | null;
  // Worksheet (generated client-side or pre-stored)
  worksheet_url: string | null;
  // Coloring page (from mindcast_live_sessions)
  coloring_page_url: string | null;   // PNG for on-screen preview
  coloring_pdf_url: string | null;    // PDF for download
  // For building the WorksheetSession
  opening_hook: string | null;
  opening_question: string | null;
  previous_week_callback: string | null;
  core_concept: string | null;
  ancient_wisdom_reframe: string | null;
  signal_metaphor: string | null;
  kids_signal_metaphor: string | null;
  video_description: string | null;
  video_question_1: string | null;
  video_question_2: string | null;
  kids_picture_book: string | null;
  kids_picture_book_author: string | null;
  kids_picture_book_question: string | null;
  kids_colouring_prompt: string | null;
  thought_provoking_question: string | null;
  private_write_prompt: string | null;
  journaling_prompt: string | null;
  experiential_exercise: string | null;
  intention_prompt: string | null;
  practice_sun_today: string | null;
  practice_midweek: string | null;
  practice_fri: string | null;
  core_affirmation: string | null;
  closing_quote: string | null;
  closing_quote_attribution: string | null;
  kids_game: string | null;
  kids_game_equipment: string | null;
  kids_game_under5: string | null;
};

const AUDIENCES = ["Adult", "Teen", "Child"] as const;

// ── Component ──────────────────────────────────────────────────────────────

const PortalDownloads = () => {
  const { user, role, profile } = useAuth();
  const { isUnlocked, unlockDate } = useProgramSchedule();
  const [audience, setAudience] = useState<"Adult" | "Teen" | "Child">("Adult");
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminFallback, setAdminFallback] = useState(false);

  const isAdmin = role === "admin" || role === "facilitator" || profile?.is_admin === true || adminFallback;

  // Direct DB fallback — catches cases where AuthContext isn't ready or lacks the flag
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["facilitator", "admin"]).maybeSingle(),
        supabase.from("profiles").select("is_admin").eq("user_id", user.id).single(),
      ]);
      if (roleRow || profileRow?.is_admin) setAdminFallback(true);
    })();
  }, [user]);

  // Fetch all sessions for the selected audience
  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const [{ data }, { data: curriculum }] = await Promise.all([
        db
          .from("mindcast_live_sessions")
          .select("week_number, audience, phase_name, theme_title, session_title, opening_hook, previous_week_callback, core_concept, ancient_wisdom_reframe, signal_metaphor, video_description, video_question_1, video_question_2, thought_provoking_question, private_write_prompt, journaling_prompt, experiential_exercise, intention_prompt, practice_sun_today, practice_midweek, practice_fri, core_affirmation, closing_quote, closing_quote_attribution, coloring_page_url, coloring_pdf_url")
          .eq("audience", audience)
          .order("week_number", { ascending: true }),
        db
          .from("curriculum_weeks")
          .select("week_number, opening_question, kids_signal_metaphor, kids_picture_book, kids_picture_book_author, kids_picture_book_question, kids_colouring_prompt, kids_game, kids_game_equipment, kids_game_under5"),
      ]);

      if (!active) return;
      const curriculumByWeek = new Map<number, Partial<DownloadItem>>(
        ((curriculum || []) as unknown as Array<Partial<DownloadItem> & { week_number: number }>)
          .map((row) => [row.week_number, row]),
      );
      const rows: DownloadItem[] = ((data || []) as unknown as DownloadItem[]).map(r => ({
        ...curriculumByWeek.get(r.week_number),
        ...r,
        worksheet_url: null, // will be filled from worksheets table
      }));
      setItems(rows);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [audience]);

  // Build worksheet session from a row
  const toWorksheetSession = (item: DownloadItem): WorksheetSession => ({
    week_number: item.week_number,
    phase_name: item.phase_name || undefined,
    theme_title: item.theme_title,
    session_title: item.session_title || undefined,
    audience: item.audience,
    opening_hook: item.opening_hook || undefined,
    opening_question: item.opening_question || undefined,
    previous_week_callback: item.previous_week_callback || undefined,
    core_concept: item.core_concept || undefined,
    ancient_wisdom_reframe: item.ancient_wisdom_reframe || undefined,
    signal_metaphor: item.signal_metaphor || undefined,
    kids_signal_metaphor: item.kids_signal_metaphor || undefined,
    video_description: item.video_description || undefined,
    video_question_1: item.video_question_1 || undefined,
    video_question_2: item.video_question_2 || undefined,
    kids_picture_book: item.kids_picture_book || undefined,
    kids_picture_book_author: item.kids_picture_book_author || undefined,
    kids_picture_book_question: item.kids_picture_book_question || undefined,
    kids_colouring_prompt: item.kids_colouring_prompt || undefined,
    thought_provoking_question: item.thought_provoking_question || undefined,
    private_write_prompt: item.private_write_prompt || undefined,
    journaling_prompt: item.journaling_prompt || undefined,
    experiential_exercise: item.experiential_exercise || undefined,
    intention_prompt: item.intention_prompt || undefined,
    practice_sun_today: item.practice_sun_today || undefined,
    practice_midweek: item.practice_midweek || undefined,
    practice_fri: item.practice_fri || undefined,
    core_affirmation: item.core_affirmation || undefined,
    closing_quote: item.closing_quote || undefined,
    closing_quote_attribution: item.closing_quote_attribution || undefined,
    kids_game: item.kids_game || undefined,
    kids_game_equipment: item.kids_game_equipment || undefined,
    kids_game_under5: item.kids_game_under5 || undefined,
  });

  // Handle worksheet download
  const handleDownloadWorksheet = (item: DownloadItem) => {
    const session = toWorksheetSession(item);
    downloadWorksheetPdf(session);
  };

  // Download colouring page PDF.
  //
  // The branded A4 PDF (MINDCAST logo, session date, title, "Your Name" line,
  // footer) is generated server-side by the generate-coloring-page edge
  // function and stored as `coloring_pdf_url` in the private `colouring`
  // bucket. We resolve the stored path to a short-lived signed URL and open
  // it — never build a bare client-side PDF from the PNG.
  const handleDownloadColoringPdf = async (pdfPath: string) => {
    try {
      const url = await resolveColouringUrl(pdfPath);
      if (!url) {
        toast({
          title: "Couldn't open colouring page",
          description: "It may not be available for your membership yet.",
        });
        return;
      }
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast({ title: "Download failed", description: (e as Error)?.message ?? "Could not open PDF", variant: "destructive" });
    }
  };

  // Preview the colouring page image (PNG) in a new tab.
  const handlePreviewColoring = async (pngPath: string) => {
    try {
      const url = await resolveColouringUrl(pngPath);
      if (!url) {
        toast({ title: "Couldn't open colouring page" });
        return;
      }
      window.open(url, "_blank", "noopener");
    } catch {
      toast({ title: "Couldn't open colouring page" });
    }
  };

  // Is a given week unlocked for this audience?
  const weekIsUnlocked = (week: number) => isAdmin || isUnlocked(week);

  // The stored colouring-page values for a week, or null if there aren't any.
  //
  // There is deliberately NO constructed fallback here. Colouring pages live
  // in the private `colouring` bucket and are only reachable through a signed
  // URL, so a week with nothing stored simply has nothing to offer.
  const coloringUrlsFor = (week: number): { png: string | null; pdf: string | null } => {
    const item = items.find(i => i.week_number === week);
    return {
      png: item?.coloring_page_url ?? null,
      pdf: item?.coloring_pdf_url ?? null,
    };
  };

  // Date string for when a week unlocks
  const formatUnlockDate = (week: number) => {
    const d = unlockDate(week);
    if (!d) return null;
    return d.toLocaleDateString("en-NZ", {
      weekday: "short", day: "numeric", month: "short",
    });
  };

  // Group items by phase for visual sections
  const phases = useMemo(() => {
    const map = new Map<string, DownloadItem[]>();
    for (const item of items) {
      const key = item.phase_name || `Weeks ${item.week_number}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-1 flex items-center gap-1.5">
          {isAdmin ? <Shield size={13} /> : <Download size={13} />}
          DOWNLOADS
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-1">
          {isAdmin ? "ALL DOWNLOADS" : "YOUR DOWNLOADS"}
        </h1>
        <p className="text-sm text-muted-foreground font-body">
          {isAdmin
            ? "Admin view — all content is unlocked. Worksheets and colouring pages are available for every week."
            : "Worksheets unlock at 9:30am on each session day. Colour the journey."}
        </p>
      </div>

      {/* Audience filter tabs */}
      <div className="flex gap-1 mb-8 border-b border-foreground/10 pb-1">
        {AUDIENCES.map((a) => (
          <button
            key={a}
            onClick={() => setAudience(a)}
            className={`px-4 py-2 text-[11px] font-body tracking-widest uppercase rounded-t-sm transition-colors ${
              audience === a
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-xs font-body uppercase tracking-widest text-muted-foreground/40 animate-pulse">
            Loading downloads…
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-20 border border-dashed border-foreground/10 rounded-sm">
          <FileText size={28} className="mx-auto text-muted-foreground/30 mb-4" strokeWidth={1.2} />
          <p className="text-sm text-muted-foreground/60 font-body">No downloads available for this audience yet.</p>
        </div>
      )}

      {/* Downloads list by phase */}
      {!loading && items.length > 0 && (
        <div className="space-y-8">
          {phases.map(([phaseName, phaseItems]) => {
            // Sort by week_number
            const sorted = [...phaseItems].sort((a, b) => a.week_number - b.week_number);
            return (
              <div key={phaseName}>
                <h2 className="font-display text-xl tracking-wider text-foreground/80 mb-4 border-b border-foreground/10 pb-2">
                  {phaseName.toUpperCase()}
                </h2>
                <div className="space-y-2">
                  {sorted.map((item) => {
                    const unlocked = weekIsUnlocked(item.week_number);
                    const opensOn = formatUnlockDate(item.week_number);
                    const coloringUrls = audience === "Child" ? coloringUrlsFor(item.week_number) : { png: null, pdf: null };

                    return (
                      <motion.div
                        key={`${item.week_number}-${item.audience}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`border rounded-sm transition-colors ${
                          unlocked
                            ? "border-primary/15 bg-foreground/[0.02] hover:bg-foreground/[0.04]"
                            : "border-foreground/[0.06] bg-foreground/[0.01]"
                        }`}
                      >
                        <div className="p-4 md:p-5">
                          {/* Top row: week + title + lock status */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-body uppercase tracking-widest text-primary/60 shrink-0">
                                  WEEK {item.week_number}
                                </span>
                                {isAdmin && (
                                  <span className="text-[8px] font-body tracking-widest uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <h3 className={`font-display text-base md:text-lg tracking-wider truncate ${
                                unlocked ? "text-foreground" : "text-foreground/50"
                              }`}>
                                {item.theme_title.toUpperCase()}
                              </h3>
                              {item.session_title && (
                                <p className={`font-serif italic text-sm ${
                                  unlocked ? "text-muted-foreground" : "text-muted-foreground/50"
                                }`}>
                                  {item.session_title}
                                </p>
                              )}
                            </div>

                            {/* Lock / unlock indicator — hidden for admins */}
                            {!isAdmin && (
                              <div className="shrink-0">
                                {unlocked ? (
                                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Unlock size={14} className="text-green-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center">
                                    <Lock size={14} className="text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Unlock date (if locked) */}
                          {!unlocked && opensOn && (
                            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-body tracking-widest uppercase text-muted-foreground/60">
                              <Clock size={11} />
                              Unlocks {opensOn} · 9:30am
                            </div>
                          )}

                          {/* Download buttons */}
                          <div className="flex flex-wrap gap-2">
                            {/* Worksheet */}
                            <button
                              onClick={() => unlocked && handleDownloadWorksheet(item)}
                              disabled={!unlocked}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-body tracking-widest uppercase rounded-sm transition-colors ${
                                unlocked
                                  ? "bg-primary text-primary-foreground hover:opacity-90"
                                  : "bg-foreground/[0.04] text-muted-foreground/30 cursor-not-allowed"
                              }`}
                              title={unlocked ? "Download printable worksheet (PDF)" : "Locked until session"}
                            >
                              <FileText size={12} strokeWidth={1.5} />
                              Worksheet PDF
                            </button>

                            {/* Coloring page (Child only) */}
                            {audience === "Child" && (coloringUrls.pdf || coloringUrls.png) && (
                              <>
                                {coloringUrls.pdf && (
                                  <button
                                    onClick={() => unlocked && handleDownloadColoringPdf(coloringUrls.pdf!)}
                                    disabled={!unlocked}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-body tracking-widest uppercase rounded-sm transition-colors ${
                                      unlocked
                                        ? "border border-primary/30 text-primary hover:bg-primary/[0.06]"
                                        : "border border-foreground/[0.06] text-muted-foreground/30 cursor-not-allowed"
                                    }`}
                                    title={unlocked ? "Download branded colouring page (A4 PDF)" : "Locked until session"}
                                  >
                                    <Palette size={12} strokeWidth={1.5} />
                                    Colouring PDF
                                  </button>
                                )}
                                {coloringUrls.png && !coloringUrls.pdf && (
                                  <button
                                    onClick={() => unlocked && handlePreviewColoring(coloringUrls.png!)}
                                    disabled={!unlocked}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-body tracking-widest uppercase rounded-sm transition-colors ${
                                      unlocked
                                        ? "border border-primary/30 text-primary hover:bg-primary/[0.06]"
                                        : "border border-foreground/[0.06] text-muted-foreground/30 cursor-not-allowed"
                                    }`}
                                    title={unlocked ? "Preview colouring page (PNG)" : "Locked until session"}
                                  >
                                    <Palette size={12} strokeWidth={1.5} />
                                    Colouring page
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Non-admin info banner */}
      {!isAdmin && !loading && (
        <div className="mt-10 p-4 border border-amber-500/20 bg-amber-500/[0.04] rounded-sm">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-body text-foreground/70 leading-relaxed">
                Content unlocks automatically at 9:30am on each session day. Already attended a session?
                If a download is still locked, check with your facilitator.
              </p>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalDownloads;
