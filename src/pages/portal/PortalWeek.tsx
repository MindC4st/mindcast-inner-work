import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, Mic, Pen, ChevronDown } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import PodcastPlayer from "@/components/portal/PodcastPlayer";
import type { PodcastPlayerHandle } from "@/components/portal/PodcastPlayer";
import MobileBottomSheet from "@/components/portal/MobileBottomSheet";
import ImplementationCheckin from "@/components/portal/ImplementationCheckin";
import VoiceRecorder from "@/components/portal/VoiceRecorder";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS, BELIEF_QUESTIONS, REFLECTION_QUESTIONS } from "@/data/weekData";
import type { Bookmark } from "@/data/weekData";
import { toast } from "@/hooks/use-toast";

/* ─── Bookmark Drawer ─── */
const BookmarkDrawer = ({
  bookmark,
  response,
  onSave,
  onDismiss,
}: {
  bookmark: Bookmark;
  response: { text: string; voiceUrl: string; shared: boolean };
  onSave: (data: { text: string; voiceUrl: string; shared: boolean }) => void;
  onDismiss: () => void;
}) => {
  const [text, setText] = useState(response.text);
  const [voiceUrl, setVoiceUrl] = useState(response.voiceUrl);
  const [mode, setMode] = useState<"voice" | "text">(response.voiceUrl ? "voice" : "text");

  const handleSave = () => {
    onSave({ text, voiceUrl, shared: true });
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="portal-label text-electric">{bookmark.label}</span>
        <h3 className="portal-heading text-lg mt-1.5 leading-snug">{bookmark.question}</h3>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("voice")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === "voice"
              ? "bg-electric text-accent-foreground shadow-sm"
              : "bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]"
          }`}
        >
          <Mic size={16} /> Voice Note
        </button>
        <button
          onClick={() => setMode("text")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === "text"
              ? "bg-electric text-accent-foreground shadow-sm"
              : "bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]"
          }`}
        >
          <Pen size={16} /> Type
        </button>
      </div>

      {/* Input */}
      {mode === "voice" ? (
        <VoiceRecorder
          existingUrl={voiceUrl}
          onRecordingComplete={(url) => setVoiceUrl(url)}
          onDelete={() => setVoiceUrl("")}
        />
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What comes to mind..."
          className="input-underline min-h-[100px]"
          autoFocus
        />
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-xl bg-electric text-accent-foreground font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity"
      >
        Done — keep listening
      </button>
    </div>
  );
};

/* ─── Belief Card (flip style) ─── */
const BeliefCard = ({
  question,
  beforeEntry,
  afterEntry,
  onUpdate,
}: {
  question: string;
  beforeEntry: { text: string; shared: boolean };
  afterEntry: { text: string; shared: boolean };
  onUpdate: (phase: "before" | "after", value: string) => void;
}) => {
  const [showAfter, setShowAfter] = useState(!!afterEntry.text);

  return (
    <div className="portal-card p-5 md:p-6">
      <p className="text-sm font-semibold text-foreground leading-relaxed mb-4">"{question}"</p>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowAfter(false)}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            !showAfter ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Before
        </button>
        <button
          onClick={() => setShowAfter(true)}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            showAfter ? "bg-bronze/20 text-bronze" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          After
        </button>
      </div>
      <textarea
        value={showAfter ? afterEntry.text : beforeEntry.text}
        onChange={(e) => onUpdate(showAfter ? "after" : "before", e.target.value)}
        placeholder={showAfter ? "Has your view shifted?" : "What do you believe right now?"}
        className="input-underline min-h-[60px]"
      />
    </div>
  );
};

/* ─── Main Page ─── */
const PortalWeek = () => {
  const isMobile = useIsMobile();
  const { weekNumber } = useParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber || "1", 10);
  const week = WEEKS[weekNum - 1];
  const { user, cohortId } = useAuth();

  const [entries, setEntries] = useState<Record<string, { text: string; shared: boolean; locked: boolean; photoUrl: string }>>({});
  const [commitment, setCommitment] = useState({ commitment_text: "", why_text: "", measure_text: "", obstacle_text: "", checkin_sentence: "", is_locked: false });
  const [bookmarkResponses, setBookmarkResponses] = useState<Record<string, { text: string; voiceUrl: string; shared: boolean }>>({});
  const [triggeredBookmarks, setTriggeredBookmarks] = useState<Set<string>>(new Set());
  const [activeBookmark, setActiveBookmark] = useState<Bookmark | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDeeper, setShowDeeper] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const podcastRef = useRef<PodcastPlayerHandle>(null);

  // Load data
  useEffect(() => {
    if (!user || !cohortId) return;
    const load = async () => {
      const [entriesRes, commitRes, bmRes] = await Promise.all([
        supabase.from("entries").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
        supabase.from("commitments").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum).single(),
        supabase.from("bookmark_responses").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
      ]);

      const entryMap: typeof entries = {};
      (entriesRes.data || []).forEach(e => {
        entryMap[e.question_key] = { text: e.answer_text || "", shared: e.is_shared, locked: e.is_locked, photoUrl: e.photo_url || "" };
      });
      setEntries(entryMap);

      if (commitRes.data) {
        setCommitment({
          commitment_text: commitRes.data.commitment_text || "",
          why_text: commitRes.data.why_text || "",
          measure_text: commitRes.data.measure_text || "",
          obstacle_text: commitRes.data.obstacle_text || "",
          checkin_sentence: commitRes.data.checkin_sentence || "",
          is_locked: commitRes.data.is_locked,
        });
      }

      const bmMap: typeof bookmarkResponses = {};
      const triggered = new Set<string>();
      (bmRes.data || []).forEach(r => {
        bmMap[r.bookmark_id] = { text: r.response_text || "", voiceUrl: r.voice_url || "", shared: r.is_shared };
        if (r.response_text || r.voice_url) triggered.add(r.bookmark_id);
      });
      setBookmarkResponses(bmMap);
      setTriggeredBookmarks(triggered);
    };
    load();
  }, [user, cohortId, weekNum]);

  // Save helpers
  const saveEntry = useCallback(async (key: string, value: { text: string; shared: boolean; locked: boolean; photoUrl: string }) => {
    if (!user || !cohortId) return;
    await supabase.from("entries").upsert({
      user_id: user.id, cohort_id: cohortId, week_number: weekNum,
      question_key: key, answer_text: value.text, is_shared: value.shared, is_locked: value.locked, photo_url: value.photoUrl || null,
    }, { onConflict: "user_id,cohort_id,week_number,question_key" });
  }, [user, cohortId, weekNum]);

  const saveCommitment = useCallback(async (data: typeof commitment) => {
    if (!user || !cohortId) return;
    await supabase.from("commitments").upsert({
      user_id: user.id, cohort_id: cohortId, week_number: weekNum, ...data,
    }, { onConflict: "user_id,cohort_id,week_number" });
  }, [user, cohortId, weekNum]);

  const saveBookmarkResponse = useCallback(async (bookmarkId: string, data: { text: string; voiceUrl: string; shared: boolean }) => {
    if (!user || !cohortId) return;
    await supabase.from("bookmark_responses").upsert({
      user_id: user.id, cohort_id: cohortId, week_number: weekNum,
      bookmark_id: bookmarkId, response_text: data.text, voice_url: data.voiceUrl || null, is_shared: data.shared,
    }, { onConflict: "user_id,cohort_id,week_number,bookmark_id" });
  }, [user, cohortId, weekNum]);

  const updateEntry = (key: string, field: "text" | "shared" | "photoUrl", value: string | boolean) => {
    const current = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
    if (current.locked && field === "text") return;
    const updated = { ...current, [field]: value };
    setEntries(prev => ({ ...prev, [key]: updated }));
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveEntry(key, updated);
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const handleBookmarkHit = (bookmark: Bookmark) => {
    setActiveBookmark(bookmark);
  };

  const handleBookmarkSave = (bookmarkId: string, data: { text: string; voiceUrl: string; shared: boolean }) => {
    setBookmarkResponses(prev => ({ ...prev, [bookmarkId]: data }));
    setTriggeredBookmarks(prev => new Set([...prev, bookmarkId]));
    saveBookmarkResponse(bookmarkId, data);
    setActiveBookmark(null);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setTimeout(() => podcastRef.current?.resume(), 300);
  };

  const completedCount = week ? week.bookmarks.filter(bm => triggeredBookmarks.has(bm.id)).length : 0;
  const totalBookmarks = week?.bookmarks.length || 0;

  if (!week) return <PortalLayout><p className="text-muted-foreground">Session not found</p></PortalLayout>;

  return (
    <PortalLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link to="/portal/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>

        {/* Implementation Check-in from previous week */}
        <ImplementationCheckin weekNumber={weekNum} />

        {/* ── 1. SESSION HEADER ── */}
        <section className="mb-8">
          <span className="portal-label text-electric block mb-2">Session {weekNum}</span>
          <h1 className="heading-display text-2xl md:text-3xl text-foreground mb-3">{week.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{week.focus}</p>
        </section>

        {/* ── 2. LISTEN & CAPTURE ── */}
        <section className="mb-12">
          <PodcastPlayer
            ref={podcastRef}
            youtubeId={week.youtubeId}
            bookmarks={week.bookmarks}
            onBookmarkHit={handleBookmarkHit}
            triggeredBookmarks={triggeredBookmarks}
          />

          {/* Progress indicator */}
          {totalBookmarks > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{completedCount}</span> of {totalBookmarks} bookmarks captured
              </p>
              {saved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check size={12} className="text-electric" /> Saved
                </span>
              )}
            </div>
          )}

          {/* Bookmark chips (manual access) */}
          <div className="flex flex-wrap gap-2 mt-4">
            {week.bookmarks.map(bm => {
              const done = triggeredBookmarks.has(bm.id);
              return (
                <button
                  key={bm.id}
                  onClick={() => setActiveBookmark(bm)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg transition-all ${
                    done
                      ? "bg-electric/10 text-electric border border-electric/20"
                      : "bg-foreground/[0.03] text-muted-foreground border border-foreground/[0.06] hover:border-foreground/20"
                  }`}
                >
                  {done && "✓ "}{bm.label}
                </button>
              );
            })}
          </div>

          {/* Bottom sheet for bookmark reflection */}
          {isMobile ? (
            <MobileBottomSheet open={!!activeBookmark} onClose={() => setActiveBookmark(null)}>
              {activeBookmark && (
                <BookmarkDrawer
                  bookmark={activeBookmark}
                  response={bookmarkResponses[activeBookmark.id] || { text: "", voiceUrl: "", shared: false }}
                  onSave={(data) => handleBookmarkSave(activeBookmark.id, data)}
                  onDismiss={() => setActiveBookmark(null)}
                />
              )}
            </MobileBottomSheet>
          ) : (
            <AnimatePresence>
              {activeBookmark && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="portal-card p-6 md:p-8 mt-6"
                >
                  <BookmarkDrawer
                    bookmark={activeBookmark}
                    response={bookmarkResponses[activeBookmark.id] || { text: "", voiceUrl: "", shared: false }}
                    onSave={(data) => handleBookmarkSave(activeBookmark.id, data)}
                    onDismiss={() => setActiveBookmark(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>

        {/* ── 3. BELIEF CHECK ── */}
        <section className="mb-12">
          <h2 className="heading-display text-xl text-foreground mb-2">Belief Check</h2>
          <p className="text-sm text-muted-foreground mb-6">Quick pulse — how do you feel about these ideas?</p>
          <div className="space-y-4">
            {BELIEF_QUESTIONS.slice(0, 3).map((q, i) => {
              const beforeKey = `belief_${i}_before`;
              const afterKey = `belief_${i}_after`;
              const before = entries[beforeKey] || { text: "", shared: false, locked: false, photoUrl: "" };
              const after = entries[afterKey] || { text: "", shared: false, locked: false, photoUrl: "" };
              return (
                <BeliefCard
                  key={i}
                  question={q}
                  beforeEntry={before}
                  afterEntry={after}
                  onUpdate={(phase, value) => updateEntry(phase === "before" ? beforeKey : afterKey, "text", value)}
                />
              );
            })}
          </div>
        </section>

        {/* ── 4. REFLECTION ── */}
        <section className="mb-12">
          <h2 className="heading-display text-xl text-foreground mb-2">Reflection</h2>
          <p className="text-sm text-muted-foreground mb-6">Two questions to sit with.</p>
          <div className="space-y-6">
            {REFLECTION_QUESTIONS.slice(0, 2).map((q, i) => {
              const key = `reflection_${i}`;
              const entry = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
              return (
                <div key={i} className="portal-card p-5 md:p-6">
                  <p className="text-sm font-semibold text-foreground mb-4">{q}</p>
                  <textarea
                    value={entry.text}
                    onChange={(e) => updateEntry(key, "text", e.target.value)}
                    placeholder="What comes to mind..."
                    className="input-underline min-h-[80px]"
                  />
                </div>
              );
            })}
          </div>

          {/* Go deeper */}
          {REFLECTION_QUESTIONS.length > 2 && (
            <div className="mt-4">
              <button
                onClick={() => setShowDeeper(!showDeeper)}
                className="text-sm font-medium text-electric hover:opacity-80 transition-opacity flex items-center gap-1"
              >
                Go deeper <ChevronDown size={14} className={`transition-transform ${showDeeper ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showDeeper && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 mt-4"
                  >
                    {REFLECTION_QUESTIONS.slice(2).map((q, i) => {
                      const key = `reflection_${i + 2}`;
                      const entry = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
                      return (
                        <div key={i + 2} className="portal-card p-5 md:p-6">
                          <p className="text-sm font-semibold text-foreground mb-4">{q}</p>
                          <textarea
                            value={entry.text}
                            onChange={(e) => updateEntry(key, "text", e.target.value)}
                            placeholder="What comes to mind..."
                            className="input-underline min-h-[80px]"
                          />
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── 5. THIS WEEK'S ONE THING ── */}
        <section className="mb-12">
          <div className="portal-card p-6 md:p-10 text-center">
            <span className="portal-label text-bronze block mb-3">This week's commitment</span>
            <h2 className="heading-display text-2xl text-foreground mb-6">What's the one thing?</h2>
            <textarea
              value={commitment.commitment_text}
              onChange={(e) => {
                const updated = { ...commitment, commitment_text: e.target.value };
                setCommitment(updated);
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                saveTimerRef.current = setTimeout(() => {
                  saveCommitment(updated);
                  setSaved(true); setTimeout(() => setSaved(false), 2000);
                }, 1000);
              }}
              disabled={commitment.is_locked}
              placeholder="I will..."
              className="input-underline text-center text-lg font-medium min-h-[60px] disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground mt-6">
              This is your signed commitment for the week. Be specific. Be honest.
            </p>
          </div>
        </section>

        {/* ── SOCIAL LAYER ── */}
        <section className="mb-8 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{completedCount > 0 ? "You" : "No one"}</span> {completedCount > 0 ? "and other members have" : "has"} completed this session
          </p>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pb-8">
          {weekNum > 1 ? (
            <Link to={`/portal/week/${weekNum - 1}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <ChevronLeft size={14} /> Session {weekNum - 1}
            </Link>
          ) : <div />}
          {weekNum < 10 && (
            <Link to={`/portal/week/${weekNum + 1}`} className="text-sm text-electric font-medium hover:opacity-80 transition-opacity">
              Session {weekNum + 1} →
            </Link>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalWeek;