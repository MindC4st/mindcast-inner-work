import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, GraduationCap, BookOpen, Clock, Play, Sparkles } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { useEntitlement } from "@/hooks/useEntitlement";
import { db } from "@/lib/db";

// Teen track for a guardian whose household includes a teen. Read-only â€” the
// adult views the teen lesson plan so the family can talk about it at home.
// Gated on can_access_track('Teen') server-side + the weekly unlock.

type TeenWeek = {
  week_number: number; block_number: number | null; block_theme: string | null;
  weekly_theme: string | null; core_learning: string | null;
  reflective_question: string | null; interactive_activity: string | null;
  inner_wisdom_alignment: string | null; teen_signal_metaphor: string | null;
  teen_source: string | null; teen_video_title: string | null;
  youtube_url: string | null; youtube_title: string | null;
};

const PortalTeens = () => {
  const { isMember } = useEntitlement();
  const { isUnlocked, unlockDate } = useProgramSchedule();
  const [weeks, setWeeks] = useState<TeenWeek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await db.rpc("curriculum_for_track", { p_audience: "Teen" });
      if (!active) return;
      setWeeks((data || []) as unknown as TeenWeek[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const gated = !isMember;

  return (
    <PortalLayout>
      <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2 flex items-center gap-1.5"><GraduationCap size={13} /> Teens</p>
      <h1 className="font-display text-3xl md:text-4xl tracking-wider text-primary mb-2">TEEN SESSIONS</h1>
      <p className="text-sm text-muted-foreground mb-8 font-body">The teen track â€” the same weekly theme, in words and depth that fit 13â€“17.</p>

      {gated ? (
        <div className="portal-card p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-foreground/[0.05] grid place-items-center mx-auto mb-4 text-foreground/40"><Lock size={22} /></div>
          <h2 className="heading-display text-lg text-primary mb-2">Add a teen membership</h2>
          <p className="text-sm text-muted-foreground font-body font-light max-w-sm mx-auto leading-relaxed">
            Become a member and add a teen to your household to see their lessons here.
          </p>
          <Link to="/portal/billing" className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors">
            MANAGE MEMBERSHIP
          </Link>
        </div>
      ) : loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-foreground/40 animate-pulse">Loadingâ€¦</p>
      ) : weeks.length === 0 ? (
        <div className="portal-card p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-foreground/[0.05] grid place-items-center mx-auto mb-4 text-foreground/40"><GraduationCap size={22} /></div>
          <h2 className="heading-display text-lg text-primary mb-2">No teens in your household yet</h2>
          <p className="text-sm text-muted-foreground font-body font-light max-w-sm mx-auto leading-relaxed">
            Add a teen (13â€“17) to your household and their weekly lessons will appear here.
          </p>
          <Link to="/portal/family" className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors">
            MANAGE FAMILY
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {weeks.map((w, i) => {
            const unlocked = isUnlocked(w.week_number);
            const opensOn = unlockDate(w.week_number);
            const title = w.weekly_theme || "Coming soon";
            return (
              <motion.div key={w.week_number}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`border rounded-sm p-4 md:p-6 ${unlocked ? "border-primary/15 bg-foreground/[0.02]" : "border-foreground/[0.06] bg-foreground/[0.01]"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-body uppercase tracking-widest text-primary/70 mb-1">Week {w.week_number}{w.block_theme ? ` Â· ${w.block_theme}` : ""}</p>
                    <h2 className={`font-display text-base md:text-lg tracking-wider ${unlocked ? "text-primary" : "text-primary/50"}`}>{title.toUpperCase()}</h2>
                  </div>
                  {!unlocked && (
                    <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-body tracking-widest uppercase text-foreground/40">
                      <Clock size={13} />{opensOn ? opensOn.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "Soon"}
                    </span>
                  )}
                </div>

                {unlocked && (
                  <div className="mt-4 space-y-3">
                    {w.core_learning && (
                      <p className="text-sm text-foreground/80 font-body flex items-start gap-2">
                        <BookOpen size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">THIS WEEK</span>{w.core_learning}</span>
                      </p>
                    )}
                    {w.teen_signal_metaphor && (
                      <p className="text-sm text-foreground/70 font-body font-light flex items-start gap-2">
                        <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">SIGNAL</span>{w.teen_signal_metaphor}</span>
                      </p>
                    )}
                    {w.reflective_question && (
                      <p className="text-sm text-foreground/70 font-body font-light flex items-start gap-2">
                        <BookOpen size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">TALK ABOUT</span>{w.reflective_question}</span>
                      </p>
                    )}
                    {w.interactive_activity && (
                      <p className="text-sm text-foreground/70 font-body font-light flex items-start gap-2">
                        <Clock size={14} className="text-primary mt-0.5 shrink-0" />
                        <span><span className="portal-label text-foreground/40 mr-2">TRY TOGETHER</span>{w.interactive_activity}</span>
                      </p>
                    )}
                    {(w.teen_source || w.youtube_url) && (
                      <a href={w.teen_source || w.youtube_url || ""} target="_blank" rel="noreferrer noopener"
                         className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase font-body text-primary hover:underline">
                        <Play size={12} /> {w.teen_video_title || w.youtube_title || "Watch this week's video"}
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalTeens;