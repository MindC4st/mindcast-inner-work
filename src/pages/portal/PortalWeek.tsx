import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, ChevronLeft, Save, Loader2, Lock, Sparkles, PenLine, BookOpen, Lightbulb } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { useEntitlement } from "@/hooks/useEntitlement";

const PortalWeek = () => {
  const { weekNumber } = useParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber || "1", 10);
  // Every week (incl. Week 1) goes through the same schedule + membership gate.
  return <WeekView weekNum={weekNum} />;
};

type CurriculumRow = {
  week_number: number; block_theme: string | null; weekly_theme: string | null;
  core_learning: string | null; youtube_url: string | null; youtube_title: string | null;
  reflective_question: string | null; interactive_activity: string | null;
  inner_wisdom_alignment: string | null;
  signal_metaphor: string | null; teen_signal_metaphor: string | null; kids_signal_metaphor: string | null;
  adult_video_title: string | null;
  teen_video_title: string | null; kids_title: string | null;
  kids_picture_book: string | null; kids_picture_book_note: string | null;
  kids_colouring_prompt: string | null;
};

const WeekView = ({ weekNum }: { weekNum: number }) => {
  const { profile } = useAuth();
  const { isMember, track, kidsAddon } = useEntitlement();
  const { isUnlocked, unlockDate, loading: schedLoading } = useProgramSchedule();
  const [row, setRow] = useState<CurriculumRow | null>(null);   // paid body (RLS-gated)
  const [pub, setPub] = useState<any>(null);                    // public header (title/desc)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      // Header (title + description) is public; the paid body only returns rows
      // RLS lets this member read (active + unlocked), else null.
      const [{ data: pubRows }, { data: content }] = await Promise.all([
        (supabase as any).rpc("curriculum_public", { p_week: weekNum }),
        (supabase as any).from("curriculum_weeks").select("*").eq("week_number", weekNum).maybeSingle(),
      ]);
      if (!active) return;
      setPub(Array.isArray(pubRows) ? pubRows[0] ?? null : null);
      setRow(content as CurriculumRow | null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [weekNum]);

  if (loading || schedLoading) {
    return (
      <PortalLayout>
        <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  const title = track === "Teen" ? pub?.teen_video_title
    : track === "Child" ? pub?.kids_title : pub?.adult_video_title;
  const heading = title || pub?.weekly_theme || "Session coming soon";
  const blockTheme = pub?.block_theme as string | undefined;
  const coreLearning = pub?.core_learning as string | undefined;
  const unlocked = isUnlocked(weekNum);
  const opensOn = unlockDate(weekNum);
  const vid = row?.youtube_url ? extractVideoId(row.youtube_url) : null;

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto">
        <Link to="/portal/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>

        {/* Header — always visible (title + description are free to browse) */}
        <section className="mb-6">
          <span className="portal-label text-foreground/40 block mb-2">
            WEEK {String(weekNum).padStart(2, "0")}{blockTheme ? ` · ${blockTheme}` : ""}
          </span>
          <h1 className="heading-display text-2xl md:text-3xl text-foreground mb-3 leading-snug">{heading}</h1>
          {coreLearning && (
            <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{coreLearning}</p>
          )}
        </section>

        {!isMember ? (
          <LockedPanel
            icon={<Lock size={22} />}
            title="Members only"
            body="Become a Mindcast member to unlock the video, reflections and your private journal for this week."
            cta
          />
        ) : !unlocked ? (
          <LockedPanel
            icon={<Lock size={22} />}
            title="Opens on its Sunday"
            body={opensOn
              ? `This week unlocks ${opensOn.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} at 9:30am, then stays open.`
              : "This week unlocks once the program start date is set."}
          />
        ) : (
          <UnlockedContent weekNum={weekNum} track={track} row={row} vid={vid} kidsAddon={kidsAddon} profileId={(profile as any)?.id ?? null} />
        )}
      </div>
    </PortalLayout>
  );
};

const LockedPanel = ({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta?: boolean }) => (
  <div className="portal-card p-8 md:p-10 text-center">
    <div className="w-14 h-14 rounded-full bg-foreground/[0.05] grid place-items-center mx-auto mb-4 text-foreground/40">{icon}</div>
    <h2 className="heading-display text-lg text-foreground mb-2">{title}</h2>
    <p className="text-sm text-muted-foreground font-body font-light max-w-sm mx-auto leading-relaxed">{body}</p>
    {cta && (
      <Link to="/pilot" className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors">
        BECOME A MEMBER
      </Link>
    )}
  </div>
);

const UnlockedContent = ({ weekNum, track, row, vid, kidsAddon, profileId }: {
  weekNum: number; track: string; row: CurriculumRow | null; vid: string | null; kidsAddon: boolean; profileId: string | null;
}) => {
  // Show the metaphor for the member's track (child content shows via the kids view).
  const metaphor = track === "Teen" ? row?.teen_signal_metaphor
    : track === "Child" ? row?.kids_signal_metaphor : row?.signal_metaphor;
  return (
  <>
    {vid && (
      <section className="mb-10">
        <div className="aspect-video bg-foreground/5 overflow-hidden rounded-sm">
          <iframe src={`https://www.youtube.com/embed/${vid}?rel=0`} title={row?.youtube_title || "Session video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="w-full h-full border-0" />
        </div>
        {row?.youtube_title && <p className="text-xs text-muted-foreground font-body mt-2">{row.youtube_title}</p>}
      </section>
    )}

    {(row?.inner_wisdom_alignment || metaphor) && (
      <section className="mb-10 portal-card p-5 md:p-6 space-y-4">
        {row?.inner_wisdom_alignment && (
          <div className="flex gap-3">
            <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="portal-label text-foreground/40 mb-1">INNER WISDOM</p>
              <p className="text-sm text-foreground/80 font-body font-light leading-relaxed">{row.inner_wisdom_alignment}</p>
            </div>
          </div>
        )}
        {metaphor && (
          <div className="flex gap-3 pt-4 border-t border-foreground/[0.06]">
            <Lightbulb size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="portal-label text-foreground/40 mb-1">IN TODAY'S WORLD</p>
              <p className="text-sm text-foreground/80 font-body font-light leading-relaxed">{metaphor}</p>
            </div>
          </div>
        )}
      </section>
    )}

    {row?.interactive_activity && (
      <section className="mb-10">
        <h2 className="portal-heading text-lg text-foreground mb-2 flex items-center gap-2"><BookOpen size={16} /> This week's activity</h2>
        <p className="text-sm text-foreground/70 font-body font-light leading-relaxed">{row.interactive_activity}</p>
      </section>
    )}

    {/* Child-track extras (for the kids view) */}
    {track === "Child" && (row?.kids_picture_book || row?.kids_colouring_prompt) && (
      <section className="mb-10 portal-card p-5 md:p-6">
        {row?.kids_picture_book && (
          <p className="text-sm text-foreground/80 font-body mb-1"><span className="portal-label text-foreground/40 mr-2">PICTURE BOOK</span>{row.kids_picture_book}</p>
        )}
        {row?.kids_picture_book_note && <p className="text-xs text-muted-foreground font-body font-light">{row.kids_picture_book_note}</p>}
      </section>
    )}

    {profileId && track !== "Child" && (
      <JournalPanel weekNum={weekNum} track={track} profileId={profileId} reflectiveQuestion={row?.reflective_question || ""} />
    )}
  </>
  );
};

// Private per-week journal (lesson_journal). Owner-only + guardian-read RLS.
const JournalPanel = ({ weekNum, track, profileId, reflectiveQuestion }: {
  weekNum: number; track: string; profileId: string; reflectiveQuestion: string;
}) => {
  const [j, setJ] = useState({ reflection_answer: "", activity_response: "", personal_notes: "", life_group_notes: "", weekly_intention: "" });
  const [lastIntention, setLastIntention] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("lesson_journal").select("reflection_answer, activity_response, personal_notes, life_group_notes, weekly_intention")
        .eq("profile_id", profileId).eq("week_number", weekNum).eq("track", track).maybeSingle();
      if (!active) return;
      if (data) setJ({
        reflection_answer: data.reflection_answer || "", activity_response: data.activity_response || "",
        personal_notes: data.personal_notes || "", life_group_notes: data.life_group_notes || "",
        weekly_intention: data.weekly_intention || "",
      });
      // Loop-back: what they committed to last week.
      if (weekNum > 1) {
        const { data: prev } = await (supabase as any)
          .rpc("my_intention_for_week", { p_week: weekNum - 1, p_track: track });
        const row = Array.isArray(prev) ? prev[0] : prev;
        if (active) setLastIntention((row?.weekly_intention || "").trim() || null);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profileId, weekNum, track]);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any).from("lesson_journal").upsert(
      { profile_id: profileId, week_number: weekNum, track, ...j },
      { onConflict: "profile_id,week_number,track" },
    );
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
    toast({ title: "Journal saved" });
  };

  const field = (key: keyof typeof j, label: string, placeholder: string, rows = 3) => (
    <div>
      <label className="text-[10px] tracking-[0.2em] text-muted-foreground/60 font-body block mb-2">{label}</label>
      <textarea value={j[key]} onChange={(e) => setJ((s) => ({ ...s, [key]: e.target.value }))}
        placeholder={placeholder} rows={rows}
        className="w-full bg-transparent border-b border-foreground/10 text-foreground text-sm font-body font-light px-0 py-2 focus:border-foreground/30 focus:outline-none transition-colors resize-y placeholder:text-muted-foreground/40" />
    </div>
  );

  if (loading) return <div className="py-8 flex justify-center"><Loader2 size={18} className="animate-spin text-muted-foreground" /></div>;

  return (
    <section className="mb-12 portal-card p-6 md:p-8 border-2 border-foreground/10">
      <h2 className="portal-heading text-lg text-foreground mb-1 flex items-center gap-2"><PenLine size={16} /> My journal</h2>
      <p className="text-xs text-muted-foreground font-body font-light mb-6">Private to you. Only a linked guardian can read a child's entries.</p>
      {lastIntention && (
        <div className="mb-6 border border-primary/25 bg-primary/[0.05] rounded-sm p-4">
          <p className="portal-label text-foreground/40 mb-1">LAST WEEK YOU SAID</p>
          <p className="text-sm text-foreground/85 font-body italic">"{lastIntention}"</p>
          <p className="text-xs text-muted-foreground font-body mt-2">Did you do it? What got in the way?</p>
        </div>
      )}

      <div className="space-y-6">
        {field("weekly_intention", "MY INTENTION THIS WEEK · one specific thing I will do", "e.g. I'll put my phone in another room after 9pm…", 3)}
        {field("reflection_answer", reflectiveQuestion ? `REFLECTION · ${reflectiveQuestion}` : "REFLECTION", "Your answer to this week's question…", 4)}
        {field("activity_response", "FROM THE ACTIVITY", "What you took from the interactive activity…")}
        {field("personal_notes", "SUNDAY NOTES", "Anything else from the session…")}
        {field("life_group_notes", "LIFE GROUP NOTES", "Deeper notes from your midweek Life Group…")}
      </div>
      <button onClick={save} disabled={saving}
        className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-60">
        {saving ? <><Loader2 size={14} className="animate-spin" /> SAVING…</> : saved ? <><Check size={14} /> SAVED</> : <><Save size={14} /> SAVE JOURNAL</>}
      </button>
    </section>
  );
};

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

export default PortalWeek;
