import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, ChevronLeft, Save, Loader2, Lock, Sparkles, PenLine, BookOpen, Lightbulb, Shield } from "lucide-react";
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
  kids_source: string | null; kids_game: string | null;
};

type WorksheetRow = {
  signal_metaphor: string | null;
  ancient_wisdom_reframe: string | null;
  journaling_prompt: string | null;
  experiential_exercise: string | null;
  weekly_practice_mon: string | null;
  weekly_practice_wed: string | null;
  weekly_practice_sun: string | null;
  core_affirmation: string | null;
  video_link: string | null;
  video_description: string | null;
  video_question_1: string | null;
  video_question_2: string | null;
};

const WeekView = ({ weekNum }: { weekNum: number }) => {
  const { profile, role, user } = useAuth();
  const { isMember, track, kidsAddon } = useEntitlement();
  const { isUnlocked, unlockDate, loading: schedLoading } = useProgramSchedule();
  const [row, setRow] = useState<CurriculumRow | null>(null);
  const [pub, setPub] = useState<any>(null);
  const [wsRow, setWsRow] = useState<WorksheetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminFallback, setAdminFallback] = useState(false);

  const isAdmin = role === "admin" || role === "facilitator" || (profile as any)?.is_admin === true || adminFallback;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["facilitator", "admin"]).maybeSingle(),
        supabase.from("profiles").select("is_admin").eq("user_id", user.id).single(),
      ]);
      if (roleRow || (profileRow as any)?.is_admin) setAdminFallback(true);
    })();
  }, [user]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      // Header (title + description) is public; the paid body only returns rows
      // RLS lets this member read (active + unlocked), else null.
      const [{ data: pubRows }, { data: content }, { data: wsData }] = await Promise.all([
        (supabase as any).rpc("curriculum_public", { p_week: weekNum }),
        (supabase as any).from("curriculum_weeks").select("*").eq("week_number", weekNum).maybeSingle(),
        (supabase as any).from("mindcast_live_sessions").select(
          "signal_metaphor, ancient_wisdom_reframe, journaling_prompt, experiential_exercise, weekly_practice_mon, weekly_practice_wed, weekly_practice_sun, core_affirmation, video_link, video_description, video_question_1, video_question_2"
        ).eq("week_number", weekNum).eq("audience", track).maybeSingle(),
      ]);
      if (!active) return;
      setPub(Array.isArray(pubRows) ? pubRows[0] ?? null : null);
      setRow(content as CurriculumRow | null);
      setWsRow(wsData as WorksheetRow | null);
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
  const unlocked = isAdmin || isUnlocked(weekNum);
  const effectiveMember = isAdmin || isMember;
  const opensOn = unlockDate(weekNum);
  const vid = wsRow?.video_link ? extractVideoId(wsRow.video_link) : (row?.youtube_url ? extractVideoId(row.youtube_url) : null);

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

        {!effectiveMember ? (
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
          <UnlockedContent weekNum={weekNum} track={track} row={row} vid={vid} kidsAddon={kidsAddon} profileId={(profile as any)?.id ?? null} wsRow={wsRow} />
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

const UnlockedContent = ({ weekNum, track, row, vid, kidsAddon, profileId, wsRow }: {
  weekNum: number; track: string; row: CurriculumRow | null; vid: string | null; kidsAddon: boolean; profileId: string | null; wsRow: WorksheetRow | null;
}) => {
  // Prefer mindcast_live_sessions content over curriculum_weeks where available
  const wisdomText = wsRow?.ancient_wisdom_reframe || row?.inner_wisdom_alignment;
  const metaphor = track === "Teen" ? row?.teen_signal_metaphor
    : track === "Child" ? row?.kids_signal_metaphor
    : wsRow?.signal_metaphor || row?.signal_metaphor;
  return (
  <>
    {vid && (
      <section className="mb-10">
        <div className="aspect-video bg-foreground/5 overflow-hidden rounded-sm">
          <iframe src={`https://www.youtube.com/embed/${vid}?rel=0`} title={wsRow?.video_description || row?.youtube_title || "Session video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="w-full h-full border-0" />
        </div>
        {(wsRow?.video_description || row?.youtube_title) && <p className="text-xs text-muted-foreground font-body mt-2">{wsRow?.video_description || row?.youtube_title}</p>}
      </section>
    )}

    {(wisdomText || metaphor) && (
      <section className="mb-10 portal-card p-5 md:p-6 space-y-4">
        {wisdomText && (
          <div className="flex gap-3">
            <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="portal-label text-foreground/40 mb-1">INNER WISDOM</p>
              <p className="text-sm text-foreground/80 font-body font-light leading-relaxed">{wisdomText}</p>
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

    {(row?.interactive_activity || wsRow?.experiential_exercise) && (
      <section className="mb-10">
        <h2 className="portal-heading text-lg text-foreground mb-2 flex items-center gap-2"><BookOpen size={16} /> This week's activity</h2>
        <p className="text-sm text-foreground/70 font-body font-light leading-relaxed">{wsRow?.experiential_exercise || row?.interactive_activity}</p>
      </section>
    )}

    {/* Child-track extras (for the kids view) */}
    {track === "Child" && (row?.kids_picture_book || row?.kids_colouring_prompt || row?.kids_game) && (
      <section className="mb-10 portal-card p-5 md:p-6">
        {row?.kids_picture_book && (
          <p className="text-sm text-foreground/80 font-body mb-1"><span className="portal-label text-foreground/40 mr-2">PICTURE BOOK</span>{row.kids_picture_book}</p>
        )}
        {row?.kids_picture_book_note && <p className="text-xs text-muted-foreground font-body font-light">{row.kids_picture_book_note}</p>}
        {row?.kids_game && (
          <div className="pt-4 mt-2 border-t border-foreground/[0.06]">
            <p className="portal-label text-foreground/40 mb-1">GROUP GAME</p>
            <p className="text-sm text-foreground/70 font-body font-light leading-relaxed">{row.kids_game}</p>
          </div>
        )}
      </section>
    )}

    {profileId && track !== "Child" && (
      <JournalPanel weekNum={weekNum} track={track} profileId={profileId} wsRow={wsRow} />
    )}
  </>
  );
};

// Private per-week journal (lesson_journal). Owner-only + guardian-read RLS.
const JournalPanel = ({ weekNum, track, profileId, wsRow }: {
  weekNum: number; track: string; profileId: string; wsRow: WorksheetRow | null;
}) => {
  const [j, setJ] = useState({
    video_question_1_response: "", video_question_2_response: "",
    reflection_answer: "", activity_response: "", personal_notes: "", life_group_notes: "", weekly_intention: "",
  });
  const videoQs = { q1: wsRow?.video_question_1 || "", q2: wsRow?.video_question_2 || "" };
  const [lastIntention, setLastIntention] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from("lesson_journal").select("video_question_1_response, video_question_2_response, reflection_answer, activity_response, personal_notes, life_group_notes, weekly_intention")
        .eq("profile_id", profileId).eq("week_number", weekNum).eq("track", track).maybeSingle();
      if (!active) return;
      if (data) setJ({
        video_question_1_response: data.video_question_1_response || "", video_question_2_response: data.video_question_2_response || "",
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

  const reflectionLabel = wsRow?.journaling_prompt
    ? `REFLECTION · ${wsRow.journaling_prompt}`
    : "REFLECTION";
  const activityLabel = wsRow?.experiential_exercise
    ? `ACTIVITY · ${wsRow.experiential_exercise}`
    : "FROM THE ACTIVITY";
  const practiceMon = wsRow?.weekly_practice_mon;
  const practiceWed = wsRow?.weekly_practice_wed;
  const practiceSun = wsRow?.weekly_practice_sun;
  const affirmation = wsRow?.core_affirmation;

  return (
    <section className="mb-12 portal-card p-6 md:p-8 border-2 border-foreground/10">
      <h2 className="portal-heading text-lg text-foreground mb-1 flex items-center gap-2"><PenLine size={16} /> My journal</h2>
      <p className="text-xs text-muted-foreground font-body font-light mb-6">Private to you. Only a linked guardian can read a child's entries.</p>

      {/* The accountability loop: every session opens by returning to the
          intention set seven days ago. */}
      {lastIntention && (
        <div className="mb-6 border border-primary/25 bg-primary/[0.05] rounded-sm p-4">
          <p className="portal-label text-foreground/40 mb-1">LAST WEEK YOU SAID</p>
          <p className="text-sm text-foreground/85 font-body italic">"{lastIntention}"</p>
          <p className="text-xs text-muted-foreground font-body mt-2">Did you do it? What got in the way?</p>
        </div>
      )}

      {/* Journal fields follow the slide order: Video → Reflect & Share →
          Together → notes, then Practice + Affirmation, then the intention
          they carry into the week (the closing commitment slide). */}
      <div className="space-y-6">
        {videoQs.q1 && field("video_question_1_response", `WHILE YOU WATCH · ${videoQs.q1}`, "Your answer while watching the video…", 3)}
        {videoQs.q2 && field("video_question_2_response", `WHILE YOU WATCH · ${videoQs.q2}`, "Your answer while watching the video…", 3)}
        {field("reflection_answer", reflectionLabel, "Your answer to this week's question…", 4)}
        {field("activity_response", activityLabel, "What you took from the interactive activity…")}
        {field("personal_notes", "SUNDAY NOTES", "Anything else from the session…")}
        {field("life_group_notes", "LIFE GROUP NOTES", "Deeper notes from your midweek Life Group…")}
      </div>

      {/* Weekly practice prompts (from worksheet) */}
      {(practiceMon || practiceWed || practiceSun) && (
        <div className="mt-6 p-4 border border-primary/10 bg-primary/[0.03] rounded-sm">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary mb-3">This Week's Practice</p>
          <div className="space-y-2">
            {practiceMon && (
              <div className="flex gap-2 text-xs font-body text-foreground/70">
                <span className="text-primary font-bold shrink-0 w-8">Mon</span>
                <span>{practiceMon}</span>
              </div>
            )}
            {practiceWed && (
              <div className="flex gap-2 text-xs font-body text-foreground/70">
                <span className="text-primary font-bold shrink-0 w-8">Wed</span>
                <span>{practiceWed}</span>
              </div>
            )}
            {practiceSun && (
              <div className="flex gap-2 text-xs font-body text-foreground/70">
                <span className="text-primary font-bold shrink-0 w-8">Sun</span>
                <span>{practiceSun}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {affirmation && (
        <div className="mt-6 p-4 border border-dashed border-primary/20 rounded-sm text-center">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary/60 mb-1">This Week's Affirmation</p>
          <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">"{affirmation}"</p>
        </div>
      )}

      <div className="space-y-6 mt-6">
        {field("weekly_intention", "MY INTENTION THIS WEEK · one specific thing I will do", "e.g. I'll put my phone in another room after 9pm…", 3)}
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
