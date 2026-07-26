import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock, FileText, Palette, Clock, Shield, Unlock, AlertCircle } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { supabase } from "@/integrations/supabase/client";
import { downloadWorksheetPdf, WorksheetSession } from "@/lib/generateWorksheetPdf";

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
  signal_metaphor: string | null;
  journaling_prompt: string | null;
  experiential_exercise: string | null;
  weekly_practice_mon: string | null;
  weekly_practice_wed: string | null;
  weekly_practice_sun: string | null;
  core_affirmation: string | null;
};

const AUDIENCES = ["Adult", "Teen", "Child"] as const;

// ── Component ──────────────────────────────────────────────────────────────

const PortalDownloads = () => {
  const { role, profile } = useAuth();
  const { isUnlocked, unlockDate } = useProgramSchedule();
  const [audience, setAudience] = useState<"Adult" | "Teen" | "Child">("Adult");
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin" || role === "facilitator" || (profile as any)?.is_admin === true;

  // Fetch all sessions for the selected audience
  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("mindcast_live_sessions")
        .select(
          "week_number, audience, phase_name, theme_title, session_title, " +
          "signal_metaphor, journaling_prompt, experiential_exercise, " +
          "weekly_practice_mon, weekly_practice_wed, weekly_practice_sun, " +
          "core_affirmation, coloring_page_url, coloring_pdf_url"
        )
        .eq("audience", audience)
        .order("week_number", { ascending: true });

      if (!active) return;
      const rows: DownloadItem[] = (data || []).map((r: any) => ({
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
    signal_metaphor: item.signal_metaphor || undefined,
    journaling_prompt: item.journaling_prompt || undefined,
    experiential_exercise: item.experiential_exercise || undefined,
    weekly_practice_mon: item.weekly_practice_mon || undefined,
    weekly_practice_wed: item.weekly_practice_wed || undefined,
    weekly_practice_sun: item.weekly_practice_sun || undefined,
    core_affirmation: item.core_affirmation || undefined,
  });

  // Handle worksheet download
  const handleDownloadWorksheet = (item: DownloadItem) => {
    const session = toWorksheetSession(item);
    downloadWorksheetPdf(session);
  };

  // Open coloring page PDF
  const handleOpenColoring = (url: string) => {
    window.open(url, "_blank", "noopener");
  };

  // Is a given week unlocked for this audience?
  const weekIsUnlocked = (week: number) => isAdmin || isUnlocked(week);

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
                    const hasColoring = !!item.coloring_pdf_url;
                    const hasWorksheet = true; // Always available via client-side generation

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
                            {audience === "Child" && (
                              hasColoring ? (
                                <button
                                  onClick={() => unlocked && handleOpenColoring(item.coloring_pdf_url!)}
                                  disabled={!unlocked}
                                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-body tracking-widest uppercase rounded-sm transition-colors ${
                                    unlocked
                                      ? "border border-primary/30 text-primary hover:bg-primary/[0.06]"
                                      : "border border-foreground/[0.06] text-muted-foreground/30 cursor-not-allowed"
                                  }`}
                                  title={unlocked ? "Download colouring page (PDF)" : "Locked until session"}
                                >
                                  <Palette size={12} strokeWidth={1.5} />
                                  Colouring Page
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-body tracking-widest uppercase rounded-sm border border-dashed border-foreground/[0.06] text-muted-foreground/30">
                                  <Palette size={12} strokeWidth={1.5} />
                                  No Colouring
                                </span>
                              )
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
