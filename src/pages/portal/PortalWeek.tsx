import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronLeft, Save, Loader2 } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCurriculumWeeks, trackForAgeGroup, type CurriculumWeek } from "@/hooks/useCurriculumWeeks";

/* ─── Session 1 fallback content (rich reflection deck for pilot opener) ─── */
const SESSION_1 = {
  title: "Everything You Think You Know About Meaning and Happiness Is Wrong",
  guest: "Johann Hari",
  show: "Diary of a CEO with Steven Bartlett",
  youtubeId: "0V5GeP87eaY",
  bookmarks: [
    {
      id: "s1_bm1",
      timestamp: "~18 min",
      question: "Johann identifies 9 causes of depression and anxiety, most rooted in disconnection. Which of these felt most personally familiar — and why?",
    },
    {
      id: "s1_bm2",
      timestamp: "~38 min",
      question: "Johann describes 'junk values' — external goals pushed by advertising and social media. Where do you notice junk values quietly running your daily decisions?",
    },
    {
      id: "s1_bm3",
      timestamp: "~58 min",
      question: "Johann says most people are deeply disengaged from their work. On a scale of 1–10, how connected do you feel to meaning in your daily work? What would a 10 look like?",
    },
    {
      id: "s1_bm4",
      timestamp: "~75 min",
      question: "Johann talks about genuine human connection vs shallow digital connection. Which relationships in your life genuinely nourish you — and are you investing enough in them?",
    },
  ],
};

const PortalWeek = () => {
  const { weekNumber } = useParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber || "1", 10);
  const { user, cohortId, profile } = useAuth();
  const track = trackForAgeGroup((profile as any)?.age_group);
  const { weeks, loading: weeksLoading } = useCurriculumWeeks(track);
  const curriculumWeek = useMemo(
    () => weeks.find((w) => w.week_number === weekNum) ?? null,
    [weeks, weekNum]
  );

  // Session 1 keeps its hand-authored reflection deck; every other week reads
  // from curriculum_weeks so facilitators can publish new sessions without a
  // code change.
  if (weekNum === 1) {
    return <Session1Content userId={user?.id || null} cohortId={cohortId} />;
  }

  return (
    <DynamicWeekContent
      weekNum={weekNum}
      curriculumWeek={curriculumWeek}
      loading={weeksLoading}
    />
  );
};

const DynamicWeekContent = ({
  weekNum,
  curriculumWeek,
  loading,
}: {
  weekNum: number;
  curriculumWeek: CurriculumWeek | null;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <PortalLayout>
        <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/portal/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </Link>

        <section className="mb-8">
          <span className="portal-label text-foreground/40 block mb-2">
            WEEK {String(weekNum).padStart(2, "0")}
            {curriculumWeek?.block_theme ? ` · ${curriculumWeek.block_theme}` : ""}
          </span>
          <h1 className="heading-display text-2xl md:text-3xl text-foreground mb-3 leading-snug">
            {curriculumWeek?.title || curriculumWeek?.weekly_theme || "Session coming soon"}
          </h1>
          {curriculumWeek?.source && (
            <p className="text-sm text-muted-foreground font-body font-light">
              {curriculumWeek.source}
            </p>
          )}
        </section>

        {curriculumWeek?.notes ? (
          <div className="portal-card p-6 md:p-8 mb-12">
            <p className="text-sm text-foreground/80 font-body font-light leading-relaxed whitespace-pre-wrap">
              {curriculumWeek.notes}
            </p>
          </div>
        ) : (
          <div className="portal-card p-8 text-center">
            <p className="text-sm text-muted-foreground font-body font-light">
              This session opens on its scheduled Sunday. Check back soon.
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

/* ─── Session 1 Full Content ─── */
const Session1Content = ({ userId, cohortId }: { userId: string | null; cohortId: string | null }) => {
  const [bookmarkResponses, setBookmarkResponses] = useState<Record<string, string>>({});
  const [finalReflection, setFinalReflection] = useState("");
  const [commitment, setCommitment] = useState({ what: "", why: "", how: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commitmentSaving, setCommitmentSaving] = useState(false);
  const [commitmentSaved, setCommitmentSaved] = useState(false);
  const [familyTracks, setFamilyTracks] = useState<{ littleOnes: any | null; teens: any | null }>({ littleOnes: null, teens: null });

  // Load existing saved data on mount
  useEffect(() => {
    if (!userId || !cohortId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const [entriesRes, goalRes] = await Promise.all([
        supabase
          .from("entries")
          .select("question_key, answer_text")
          .eq("user_id", userId)
          .eq("cohort_id", cohortId)
          .eq("week_number", 1),
        supabase
          .from("implementation_goals")
          .select("what_i_will_implement, why_it_matters, how_i_will_know")
          .eq("member_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (entriesRes.data && entriesRes.data.length > 0) {
        const responses: Record<string, string> = {};
        entriesRes.data.forEach((e) => {
          if (e.question_key === "final_reflection") {
            setFinalReflection(e.answer_text || "");
          } else {
            responses[e.question_key] = e.answer_text || "";
          }
        });
        setBookmarkResponses(responses);
      }

      if (goalRes.data) {
        setCommitment({
          what: goalRes.data.what_i_will_implement || "",
          why: goalRes.data.why_it_matters || "",
          how: goalRes.data.how_i_will_know || "",
        });
        setCommitmentSaved(true);
      }

      setLoading(false);
    };

    load();
  }, [userId, cohortId]);

  useEffect(() => {
    supabase
      .from("sessions")
      .select("id")
      .eq("session_number", 1)
      .single()
      .then(({ data: sess }) => {
        if (!sess) return;
        supabase
          .from("kids_sessions")
          .select("*")
          .eq("parent_session_id", sess.id)
          .then(({ data }) => {
            const lo = (data || []).find((d: any) => d.age_group === "little_ones") || null;
            const te = (data || []).find((d: any) => d.age_group === "teens") || null;
            setFamilyTracks({ littleOnes: lo, teens: te });
          });
      });
  }, []);

  const handleBookmarkChange = (id: string, value: string) => {
    setBookmarkResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveReflections = async () => {
    if (!userId || !cohortId) {
      toast({ title: "Not signed in", variant: "destructive" });
      return;
    }

    const entriesToSave = [
      ...SESSION_1.bookmarks
        .filter((bm) => bookmarkResponses[bm.id])
        .map((bm) => ({
          user_id: userId,
          cohort_id: cohortId,
          week_number: 1,
          question_key: bm.id,
          answer_text: bookmarkResponses[bm.id],
          is_shared: false,
          is_locked: false,
        })),
      ...(finalReflection
        ? [{
            user_id: userId,
            cohort_id: cohortId,
            week_number: 1,
            question_key: "final_reflection",
            answer_text: finalReflection,
            is_shared: false,
            is_locked: false,
          }]
        : []),
    ];

    if (entriesToSave.length === 0) {
      toast({ title: "Nothing to save", description: "Write something first." });
      return;
    }

    setSaving(true);

    // Delete then re-insert so we don't need to know the row IDs
    const { error: delError } = await supabase
      .from("entries")
      .delete()
      .eq("user_id", userId)
      .eq("cohort_id", cohortId)
      .eq("week_number", 1);

    if (delError) {
      setSaving(false);
      toast({ title: "Save failed", description: delError.message, variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("entries").insert(entriesToSave);
    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "Reflections saved" });
    }
  };

  const handleSaveCommitment = async () => {
    if (!userId) return;
    setCommitmentSaving(true);
    try {
      const { error } = await supabase.from("implementation_goals").insert({
        member_id: userId,
        what_i_will_implement: commitment.what,
        why_it_matters: commitment.why,
        how_i_will_know: commitment.how,
        shared_with_group: false,
        status: "committed",
      });
      if (error) throw error;
      setCommitmentSaved(true);
      toast({ title: "Commitment saved" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setCommitmentSaving(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link to="/portal/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>

        {/* ── Session Header ── */}
        <section className="mb-8">
          <span className="portal-label text-foreground/40 block mb-2">SESSION 1 — 21 APRIL</span>
          <h1 className="heading-display text-2xl md:text-3xl text-foreground mb-3 leading-snug">
            {SESSION_1.title}
          </h1>
          <p className="text-sm text-muted-foreground font-body font-light">
            {SESSION_1.guest} · {SESSION_1.show}
          </p>
        </section>

        {/* ── YouTube Player ── */}
        <section className="mb-12">
          <div className="aspect-video bg-foreground/5 overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${SESSION_1.youtubeId}?rel=0`}
              title={SESSION_1.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </section>

        {/* ── Bookmark Questions ── */}
        <section className="mb-12">
          <h2 className="portal-heading text-xl text-foreground mb-2">Reflection Questions</h2>
          <p className="text-sm text-muted-foreground mb-6 font-body font-light">
            Pause at each timestamp and sit with the question before writing.
          </p>
          <div className="space-y-5">
            {SESSION_1.bookmarks.map((bm, i) => (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="portal-card p-5 md:p-6"
              >
                <span className="text-[10px] tracking-[0.2em] text-muted-foreground/60 font-body block mb-2">
                  {bm.timestamp}
                </span>
                <p className="text-sm font-medium text-foreground leading-relaxed mb-4">
                  {bm.question}
                </p>
                <textarea
                  value={bookmarkResponses[bm.id] || ""}
                  onChange={(e) => handleBookmarkChange(bm.id, e.target.value)}
                  placeholder="What comes to mind..."
                  rows={3}
                  className="w-full bg-transparent border-b border-foreground/10 text-foreground text-sm font-body font-light px-0 py-2 focus:border-foreground/30 focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/40"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Final Reflection ── */}
        <section className="mb-12">
          <div className="portal-card p-6 md:p-8 border-2 border-foreground/10">
            <h2 className="portal-heading text-lg text-foreground mb-2">Final Reflection</h2>
            <p className="text-sm text-foreground/70 font-body font-light leading-relaxed mb-5">
              Having sat with these ideas, what is the ONE insight that most challenges or excites you — and what would your life look like if you actually acted on it?
            </p>
            <textarea
              value={finalReflection}
              onChange={(e) => setFinalReflection(e.target.value)}
              placeholder="Take your time with this one..."
              rows={5}
              className="w-full bg-transparent border-b border-foreground/10 text-foreground text-sm font-body font-light px-0 py-2 focus:border-foreground/30 focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/40"
            />
            <button
              onClick={handleSaveReflections}
              disabled={saving}
              className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> SAVING...</>
              ) : saved ? (
                <><Check size={14} /> SAVED</>
              ) : (
                <><Save size={14} /> SAVE REFLECTIONS</>
              )}
            </button>
          </div>
        </section>

        {/* ── Implementation Commitment ── */}
        <section className="mb-12">
          <div className="bg-primary p-6 md:p-8 text-primary-foreground">
            <h2 className="font-display text-2xl tracking-wider mb-2">IMPLEMENTATION COMMITMENT</h2>
            <p className="text-primary-foreground/40 text-sm font-body font-light mb-6">
              What will you carry from this session into your week?
            </p>

            <div className="space-y-5">
              {[
                { key: "what", label: "WHAT WILL YOU IMPLEMENT THIS WEEK?", placeholder: "One specific action..." },
                { key: "why", label: "WHY DOES THIS MATTER TO YOU?", placeholder: "Connect it to something real..." },
                { key: "how", label: "HOW WILL YOU KNOW YOU'VE SUCCEEDED?", placeholder: "What does success look like?" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body block mb-2">
                    {field.label}
                  </label>
                  <textarea
                    value={commitment[field.key as keyof typeof commitment]}
                    onChange={(e) => setCommitment((c) => ({ ...c, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={2}
                    disabled={commitmentSaved}
                    className="w-full bg-transparent border-b border-primary-foreground/15 text-primary-foreground text-sm font-body font-light px-0 py-2 focus:border-primary-foreground/40 focus:outline-none transition-colors resize-none placeholder:text-primary-foreground/15 disabled:opacity-60"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveCommitment}
              disabled={commitmentSaved || commitmentSaving || !commitment.what}
              className="mt-6 w-full bg-primary-foreground/10 text-primary-foreground py-4 text-[11px] tracking-[0.2em] font-body hover:bg-primary-foreground/15 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {commitmentSaving ? (
                <><Loader2 size={14} className="animate-spin" /> SAVING...</>
              ) : commitmentSaved ? (
                <><Check size={14} /> COMMITMENT SAVED</>
              ) : (
                "SAVE MY COMMITMENT"
              )}
            </button>
          </div>
        </section>

        {/* ── Family Tracks ── */}
        {(familyTracks.littleOnes || familyTracks.teens) && (
          <section className="mb-12">
            <h2 className="portal-heading text-xl text-foreground mb-2">For Families</h2>
            <p className="text-sm text-muted-foreground mb-6 font-body font-light">
              While the adults gather for The Source, children and teens run their own parallel session.
            </p>
            <div className="space-y-4">
              {familyTracks.littleOnes && (
                <div className="portal-card p-6">
                  <span className="text-[10px] tracking-[0.2em] text-muted-foreground/60 font-body block mb-3">LITTLE ONES · AGES 4–11</span>
                  <h3 className="font-display text-lg text-foreground mb-3">{familyTracks.littleOnes.lesson_theme}</h3>
                  {familyTracks.littleOnes.activity_description && (
                    <p className="text-sm text-foreground/70 font-body font-light leading-relaxed mb-4">
                      {familyTracks.littleOnes.activity_description}
                    </p>
                  )}
                  {familyTracks.littleOnes.materials_needed && (
                    <p className="text-[11px] text-muted-foreground font-body">
                      <span className="tracking-[0.1em] uppercase text-muted-foreground/40 mr-1">Bring:</span>
                      {familyTracks.littleOnes.materials_needed}
                    </p>
                  )}
                </div>
              )}
              {familyTracks.teens && (
                <div className="portal-card p-6">
                  <span className="text-[10px] tracking-[0.2em] text-muted-foreground/60 font-body block mb-3">TEENS · AGES 12–24</span>
                  <h3 className="font-display text-lg text-foreground mb-3">{familyTracks.teens.lesson_theme}</h3>
                  {familyTracks.teens.video_url && extractVideoId(familyTracks.teens.video_url) && (
                    <div className="aspect-video bg-foreground/5 overflow-hidden mb-4">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractVideoId(familyTracks.teens.video_url)}?rel=0`}
                        title={familyTracks.teens.video_title || "Teen session video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}
                  {familyTracks.teens.video_title && !familyTracks.teens.video_url && (
                    <p className="text-sm text-muted-foreground/60 font-body italic mb-4">{familyTracks.teens.video_title}</p>
                  )}
                  {familyTracks.teens.activity_description && (
                    <p className="text-sm text-foreground/70 font-body font-light leading-relaxed mb-4">
                      {familyTracks.teens.activity_description}
                    </p>
                  )}
                  {familyTracks.teens.materials_needed && (
                    <p className="text-[11px] text-muted-foreground font-body">
                      <span className="tracking-[0.1em] uppercase text-muted-foreground/40 mr-1">Bring:</span>
                      {familyTracks.teens.materials_needed}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalWeek;
