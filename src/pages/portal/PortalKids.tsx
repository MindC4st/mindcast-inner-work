import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Baby, Palette, BookOpen, Clock, Play } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { useEntitlement } from "@/hooks/useEntitlement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Fetch a signed URL for a week's colouring PDF from the private bucket and open
// it. Returns false if it isn't uploaded yet (so we can show "coming soon").
const openColouringPdf = async (week: number): Promise<boolean> => {
  const path = `week-${String(week).padStart(2, "0")}.pdf`;
  const { data, error } = await (supabase as any).storage.from("colouring").createSignedUrl(path, 120);
  if (error || !data?.signedUrl) return false;
  window.open(data.signedUrl, "_blank", "noopener");
  return true;
};

// Kids view for a paying adult with the kids add-on. Kids never log in — the
// adult accesses the Child-track lessons and downloadable colouring pages here.
// Content is read-only (no journal). Gated on isMember + kidsAddon + unlock.

type KidWeek = {
  week_number: number; block_theme: string | null; weekly_theme: string | null;
  kids_title: string | null;
};
type KidContent = { kids_picture_book: string | null; kids_picture_book_note: string | null; kids_colouring_prompt: string | null; kids_source: string | null; kids_game: string | null };

const PortalKids = () => {
  const { isMember, kidsAddon } = useEntitlement();
  const { isUnlocked, unlockDate } = useProgramSchedule();
  const [weeks, setWeeks] = useState<KidWeek[]>([]);
  const [content, setContent] = useState<Record<number, KidContent>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // Public titles for all weeks + the paid kids body (RLS returns only the
      // weeks this member may read: active + unlocked).
      const [{ data: titles }, { data: body }] = await Promise.all([
        (supabase as any).rpc("curriculum_public"),
        (supabase as any).from("curriculum_weeks")
          .select("week_number, kids_picture_book, kids_picture_book_note, kids_colouring_prompt, kids_source, kids_game"),
      ]);
      if (!active) return;
      setWeeks((titles || []).map((r: any) => ({
        week_number: r.week_number, block_theme: r.block_theme, weekly_theme: r.weekly_theme, kids_title: r.kids_title,
      })) as KidWeek[]);
      const map: Record<number, KidContent> = {};
      (body || []).forEach((r: any) => { map[r.week_number] = r; });
      setContent(map);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const gated = !isMember || !kidsAddon;

  return (
    <PortalLayout>
      <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2 flex items-center gap-1.5"><Baby size={13} /> Kids</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-2">KID SESSIONS</h1>
      <p className="text-sm text-muted-foreground mb-8 font-body">The children's track — lessons and colouring pages to do together at home.</p>

      {gated ? (
        <div className="portal-card p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-foreground/[0.05] grid place-items-center mx-auto mb-4 text-foreground/40"><Lock size={22} /></div>
          <h2 className="heading-display text-lg text-foreground mb-2">Add a kids membership</h2>
          <p className="text-sm text-muted-foreground font-body font-light max-w-sm mx-auto leading-relaxed">
            {isMember
              ? "Add a kids membership to your plan to unlock the children's lessons and colouring pages."
              : "Become a member and add a kids membership to unlock the children's track."}
          </p>
          <Link to="/portal/billing" className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors">
            MANAGE MEMBERSHIP
          </Link>
        </div>
      ) : loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-foreground/40 animate-pulse">Loading…</p>
      ) : (
        <div className="space-y-3">
          {weeks.map((w, i) => {
            const unlocked = isUnlocked(w.week_number);
            const opensOn = unlockDate(w.week_number);
            const title = w.kids_title || w.weekly_theme || "Coming soon";
            return (
              <motion.div key={w.week_number}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`border rounded-sm p-4 md:p-6 ${unlocked ? "border-primary/15 bg-foreground/[0.02]" : "border-foreground/[0.06] bg-foreground/[0.01]"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-body uppercase tracking-widest text-primary/70 mb-1">Week {w.week_number}{w.block_theme ? ` · ${w.block_theme}` : ""}</p>
                    <h2 className={`font-display text-base md:text-lg tracking-wider ${unlocked ? "text-foreground" : "text-foreground/50"}`}>{title.toUpperCase()}</h2>
                  </div>
                  {!unlocked && (
                    <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-body tracking-widest uppercase text-foreground/40">
                      <Clock size={13} />{opensOn ? opensOn.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "Soon"}
                    </span>
                  )}
                </div>

                {unlocked && (() => { const c = content[w.week_number]; return (
                  <div className="mt-4 space-y-3">
                    {c?.kids_picture_book && (
                      <p className="text-sm text-foreground/80 font-body flex items-start gap-2">
                        <BookOpen size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">PICTURE BOOK</span>{c.kids_picture_book}{c.kids_picture_book_note ? ` — ${c.kids_picture_book_note}` : ""}</span>
                      </p>
                    )}
                    {c?.kids_colouring_prompt && (
                      <div className="text-sm text-foreground/70 font-body font-light flex items-start gap-2">
                        <Palette size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">COLOURING PAGE</span>{c.kids_colouring_prompt}</span>
                      </div>
                    )}
                    {c?.kids_source && (
                      <a href={c.kids_source} target="_blank" rel="noreferrer noopener"
                         className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase font-body text-primary hover:underline">
                        <Play size={12} /> Watch this week's video
                      </a>
                    )}
                    {c?.kids_game && (
                      <div className="text-sm text-foreground/70 font-body font-light flex items-start gap-2">
                        <Clock size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">GROUP GAME</span>{c.kids_game}</span>
                      </div>
                    )}
                    <button
                      onClick={async () => { const ok = await openColouringPdf(w.week_number); if (!ok) toast({ title: "Colouring page coming soon", description: "This week's PDF hasn't been uploaded yet." }); }}
                      className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase font-body text-primary hover:underline">
                      <Palette size={12} /> Download colouring page
                    </button>
                  </div>
                ); })()}
              </motion.div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalKids;
