import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Camera, Check, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import PodcastPlayer from "@/components/portal/PodcastPlayer";
import type { PodcastPlayerHandle } from "@/components/portal/PodcastPlayer";
import BookmarkReflection from "@/components/portal/BookmarkReflection";
import ImplementationCheckin from "@/components/portal/ImplementationCheckin";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS, BELIEF_QUESTIONS, REFLECTION_QUESTIONS, DOMAINS, SELF_AUDIT_QUESTIONS } from "@/data/weekData";
import type { Bookmark } from "@/data/weekData";
import { toast } from "@/hooks/use-toast";

const PortalWeek = () => {
  const { weekNumber } = useParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber || "1", 10);
  const week = WEEKS[weekNum - 1];
  const { user, cohortId } = useAuth();

  const [entries, setEntries] = useState<Record<string, { text: string; shared: boolean; locked: boolean; photoUrl: string }>>({});
  const [domainScores, setDomainScores] = useState<Record<string, number>>({});
  const [commitment, setCommitment] = useState({ commitment_text: "", why_text: "", measure_text: "", obstacle_text: "", checkin_sentence: "", is_locked: false });
  const [bookmarkResponses, setBookmarkResponses] = useState<Record<string, { text: string; voiceUrl: string; shared: boolean }>>({});
  const [triggeredBookmarks, setTriggeredBookmarks] = useState<Set<string>>(new Set());
  const [activeBookmark, setActiveBookmark] = useState<Bookmark | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const podcastRef = useRef<PodcastPlayerHandle>(null);

  // Load data
  useEffect(() => {
    if (!user || !cohortId) return;
    const load = async () => {
      const [entriesRes, scoresRes, commitRes, bmRes] = await Promise.all([
        supabase.from("entries").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
        supabase.from("domain_scores").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
        supabase.from("commitments").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum).single(),
        supabase.from("bookmark_responses").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
      ]);

      const entryMap: typeof entries = {};
      (entriesRes.data || []).forEach(e => {
        entryMap[e.question_key] = { text: e.answer_text || "", shared: e.is_shared, locked: e.is_locked, photoUrl: e.photo_url || "" };
      });
      setEntries(entryMap);

      const scoreMap: typeof domainScores = {};
      (scoresRes.data || []).forEach(s => { scoreMap[s.domain_name] = s.score; });
      setDomainScores(scoreMap);

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

  const saveDomainScore = useCallback(async (domain: string, score: number) => {
    if (!user || !cohortId) return;
    await supabase.from("domain_scores").upsert({
      user_id: user.id, cohort_id: cohortId, week_number: weekNum, domain_name: domain, score,
    }, { onConflict: "user_id,cohort_id,week_number,domain_name" });
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

  const handlePhotoUpload = async (key: string, file: File) => {
    if (!user) return;
    const path = `${user.id}/${weekNum}/${key}_${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("worksheet-photos").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("worksheet-photos").getPublicUrl(path);
    updateEntry(key, "photoUrl", urlData.publicUrl);
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
    // Auto-resume playback after saving
    setTimeout(() => podcastRef.current?.resume(), 300);
  };

  const sharedCount = Object.values(entries).filter(e => e.shared).length + Object.values(bookmarkResponses).filter(r => r.shared).length;
  const allBookmarksCompleted = week?.bookmarks.every(bm => triggeredBookmarks.has(bm.id)) ?? false;

  const sections = ["Listen", "Beliefs", "Reflections", "Self Audit", "Commitment"];

  if (!week) return <PortalLayout><p className="text-muted-foreground font-body">Week not found</p></PortalLayout>;

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-8">
        <Link to="/portal/dashboard" className="text-[11px] text-muted-foreground tracking-[0.1em] hover:text-foreground mb-5 inline-flex items-center gap-1 font-body transition-colors">
          ← Back to dashboard
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="portal-label block mb-2">Session {weekNum}</span>
            <h1 className="portal-heading text-2xl md:text-3xl">{week.title}</h1>
            <p className="text-sm text-muted-foreground mt-2 font-body font-light leading-relaxed max-w-lg">{week.focus}</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1 font-body"><Check size={12} /> Saved</span>}
          </div>
        </div>
      </div>

      {/* Implementation Check-in from previous week */}
      <ImplementationCheckin weekNumber={weekNum} />

      {/* Section nav */}
      <div className="flex gap-0 mb-10 overflow-x-auto border-b border-foreground/[0.06]">
        {sections.map((s, i) => (
          <button key={s} onClick={() => setActiveSection(i)}
            className={`text-[11px] tracking-[0.12em] px-5 py-3 whitespace-nowrap font-body transition-all duration-200 ${
              activeSection === i
                ? "text-foreground border-b-2 border-foreground -mb-px"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >{s}</button>
        ))}
      </div>

      {/* LISTEN SECTION */}
      {activeSection === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="heading-display text-xl text-primary mb-4">LISTEN & REFLECT</h2>
          <p className="text-sm text-muted-foreground mb-4 font-body">
            Press play. When you hit a bookmark moment, the player will pause and a reflection question will appear.
            Record a voice note or type your response.
          </p>

          <PodcastPlayer
            ref={podcastRef}
            youtubeId={week.youtubeId}
            bookmarks={week.bookmarks}
            onBookmarkHit={handleBookmarkHit}
            triggeredBookmarks={triggeredBookmarks}
          />

          {/* Active bookmark reflection */}
          <AnimatePresence>
            {activeBookmark && (
              <BookmarkReflection
                bookmark={activeBookmark}
                response={bookmarkResponses[activeBookmark.id] || { text: "", voiceUrl: "", shared: false }}
                onSave={(data) => handleBookmarkSave(activeBookmark.id, data)}
                onDismiss={() => setActiveBookmark(null)}
              />
            )}
          </AnimatePresence>

          {/* Completed responses */}
          {Object.keys(bookmarkResponses).length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-[10px] tracking-widest text-primary/40">YOUR BOOKMARK RESPONSES</h3>
              {week.bookmarks.filter(bm => bookmarkResponses[bm.id]).map(bm => {
                const resp = bookmarkResponses[bm.id];
                return (
                  <div key={bm.id} className="border-2 border-primary/10 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] tracking-widest text-primary/40">{bm.label.toUpperCase()}</span>
                      {resp.shared ? <Eye size={12} className="text-primary/40" /> : <EyeOff size={12} className="text-primary/20" />}
                    </div>
                    <p className="text-xs text-primary font-body italic">{bm.question}</p>
                    {resp.text && <p className="text-sm text-primary font-body mt-2">{resp.text}</p>}
                    {resp.voiceUrl && <span className="text-[10px] text-primary/40 tracking-widest mt-1 block">🎙 VOICE NOTE ATTACHED</span>}
                    <button onClick={() => setActiveBookmark(bm)} className="text-[10px] tracking-widest text-primary/40 hover:text-primary mt-2">EDIT →</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Final reflection — shown after all bookmarks completed */}
          {allBookmarksCompleted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="portal-card p-6 md:p-8 mt-8">
              <h3 className="portal-heading text-xl mb-2">Final Reflection</h3>
              <p className="text-sm text-muted-foreground mb-6 font-body font-light">You've completed all bookmark reflections. Capture your key takeaway.</p>
              {[
                { key: "final_insight", label: "What is the one insight that most challenged or excited you?", placeholder: "The insight that stands out..." },
              ].map(field => {
                const entry = entries[field.key] || { text: "", shared: false, locked: false, photoUrl: "" };
                return (
                  <div key={field.key} className="mb-4">
                    <label className="portal-label block mb-1.5">{field.label}</label>
                    <textarea
                      value={entry.text}
                      onChange={(e) => updateEntry(field.key, "text", e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-foreground/[0.02] text-foreground p-3 text-sm font-body font-light border border-foreground/[0.07] focus:border-foreground/20 focus:outline-none resize-none min-h-[80px] leading-relaxed placeholder:text-muted-foreground/30"
                    />
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground font-body font-light">
                Now head to the <button onClick={() => setActiveSection(4)} className="underline hover:text-foreground transition-colors">Commitment</button> tab to set your implementation for the week.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* BELIEFS SECTION */}
      {activeSection === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="heading-display text-xl text-primary mb-4">BELIEF AUDIT</h2>
          <p className="text-sm text-muted-foreground mb-6 font-body">Rate each belief before and after listening to this week's episode.</p>
          {BELIEF_QUESTIONS.map((q, i) => {
            const beforeKey = `belief_${i}_before`;
            const afterKey = `belief_${i}_after`;
            const before = entries[beforeKey] || { text: "", shared: false, locked: false, photoUrl: "" };
            const after = entries[afterKey] || { text: "", shared: false, locked: false, photoUrl: "" };
            return (
              <div key={i} className="border-2 border-primary/10 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm tracking-wider text-primary">"{q.toUpperCase()}"</h3>
                  <button onClick={() => { updateEntry(beforeKey, "shared", !before.shared); updateEntry(afterKey, "shared", !before.shared); }}
                    className="text-muted-foreground hover:text-primary" title={before.shared ? "Shared with group" : "Private"}>
                    {before.shared ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">BEFORE LISTENING</label>
                    <textarea value={before.text} onChange={(e) => updateEntry(beforeKey, "text", e.target.value)}
                      disabled={before.locked} placeholder="Your initial belief..."
                      className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px] disabled:opacity-60" />
                    {before.locked && <Lock size={12} className="absolute top-7 right-3 text-muted-foreground" />}
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">AFTER LISTENING</label>
                    <textarea value={after.text} onChange={(e) => updateEntry(afterKey, "text", e.target.value)}
                      placeholder="How has it changed?"
                      className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px]" />
                  </div>
                </div>
              </div>
            );
          })}
          {!Object.keys(entries).some(k => k.startsWith("belief_") && k.endsWith("_before") && entries[k]?.locked) && (
            <button onClick={() => {
              BELIEF_QUESTIONS.forEach((_, i) => {
                const key = `belief_${i}_before`;
                const current = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
                const updated = { ...current, locked: true };
                setEntries(prev => ({ ...prev, [key]: updated }));
                saveEntry(key, updated);
              });
              toast({ title: "Before responses locked", description: "Your initial beliefs are now preserved." });
            }} className="btn-navy text-xs py-2 px-6">LOCK MY BEFORE RESPONSES</button>
          )}
        </motion.div>
      )}

      {/* REFLECTIONS SECTION */}
      {activeSection === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="heading-display text-xl text-primary mb-4">REFLECTION QUESTIONS</h2>
          {REFLECTION_QUESTIONS.map((q, i) => {
            const key = `reflection_${i}`;
            const entry = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
            return (
              <div key={i} className="border-2 border-primary/10 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-body text-primary">{q}</h3>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer" title="Upload photo">
                      <Camera size={14} className="text-muted-foreground hover:text-primary" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(key, e.target.files[0])} />
                    </label>
                    <button onClick={() => updateEntry(key, "shared", !entry.shared)} className="text-muted-foreground hover:text-primary">
                      {entry.shared ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>
                <textarea value={entry.text} onChange={(e) => updateEntry(key, "text", e.target.value)}
                  placeholder="Your reflection..."
                  className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[80px]" />
                {entry.photoUrl && (
                  <div className="mt-2"><img src={entry.photoUrl} alt="Uploaded note" className="h-24 object-cover border-2 border-primary/10" /></div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* SELF AUDIT SECTION */}
      {activeSection === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="heading-display text-xl text-primary mb-4">SELF AUDIT</h2>
          <p className="text-sm text-muted-foreground mb-6 font-body">Rate yourself across 9 domains on a scale of 1–5.</p>
          <div className="grid gap-4">
            {DOMAINS.map((d) => (
              <div key={d} className="border-2 border-primary/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-xs tracking-wider text-primary">{d.toUpperCase()}</h3>
                  <span className="text-lg font-display text-primary">{domainScores[d] || "-"}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => {
                      setDomainScores(prev => ({ ...prev, [d]: n }));
                      saveDomainScore(d, n);
                      setSaved(true); setTimeout(() => setSaved(false), 2000);
                    }} className={`flex-1 py-2 border-2 text-xs font-display tracking-wider transition-colors ${
                      domainScores[d] === n ? "bg-primary text-secondary border-primary" : "border-primary/20 text-primary/60 hover:border-primary"
                    }`}>{n}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 mt-6">
            {SELF_AUDIT_QUESTIONS.map((q, i) => {
              const key = `audit_${i}`;
              const entry = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
              return (
                <div key={i} className="border-2 border-primary/10 p-4">
                  <h3 className="text-sm font-body text-primary mb-2">{q}</h3>
                  <textarea value={entry.text} onChange={(e) => updateEntry(key, "text", e.target.value)}
                    placeholder="Your response..."
                    className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px]" />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* COMMITMENT SECTION */}
      {activeSection === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="portal-heading text-xl mb-1">This Week's Commitment</h2>
          <p className="text-sm text-muted-foreground mb-6 font-body font-light">Your single implementation for the week. Be specific.</p>
          <div className="portal-card p-6 md:p-8 space-y-5">
            {[
              { key: "commitment_text", label: "What will you implement this week?", placeholder: "My commitment this week..." },
              { key: "why_text", label: "Why does this matter to you?", placeholder: "Why this matters to me..." },
              { key: "measure_text", label: "How will you know you've succeeded?", placeholder: "I'll know I succeeded when..." },
              { key: "obstacle_text", label: "What might get in the way?", placeholder: "The biggest obstacle is..." },
            ].map((field) => (
              <div key={field.key}>
                <label className="portal-label block mb-1.5">{field.label}</label>
                <textarea
                  value={(commitment as any)[field.key] || ""}
                  onChange={(e) => {
                    const updated = { ...commitment, [field.key]: e.target.value };
                    setCommitment(updated);
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = setTimeout(() => {
                      saveCommitment(updated); setSaved(true); setTimeout(() => setSaved(false), 2000);
                    }, 1000);
                  }}
                  disabled={commitment.is_locked}
                  placeholder={field.placeholder}
                  className="w-full bg-foreground/[0.02] text-foreground p-3 text-sm font-body font-light border border-foreground/[0.07] focus:border-foreground/20 focus:outline-none resize-none min-h-[70px] leading-relaxed placeholder:text-muted-foreground/30 disabled:opacity-50" />
              </div>
            ))}
            <div>
              <label className="portal-label block mb-1.5">Check-in sentence (private)</label>
              <textarea
                value={commitment.checkin_sentence}
                onChange={(e) => {
                  const updated = { ...commitment, checkin_sentence: e.target.value };
                  setCommitment(updated);
                  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                  saveTimerRef.current = setTimeout(() => { saveCommitment(updated); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1000);
                }}
                placeholder="How will you check in with yourself?"
                className="w-full bg-foreground/[0.02] text-foreground p-3 text-sm font-body font-light border border-foreground/[0.07] focus:border-foreground/20 focus:outline-none resize-none min-h-[70px] leading-relaxed placeholder:text-muted-foreground/30" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Sharing summary + navigation */}
      <div className="mt-8 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-muted-foreground font-body">
          You're sharing <strong className="text-primary">{sharedCount}</strong> responses with the group this week.
        </p>
        <div className="flex gap-2">
          {weekNum > 1 && (
            <Link to={`/portal/week/${weekNum - 1}`} className="border-2 border-primary/20 text-primary/60 text-[10px] tracking-widest px-4 py-2 hover:border-primary transition-colors flex items-center gap-1">
              <ChevronLeft size={12} /> WEEK {weekNum - 1}
            </Link>
          )}
          {weekNum < 10 && (
            <Link to={`/portal/week/${weekNum + 1}`} className="border-2 border-primary/20 text-primary/60 text-[10px] tracking-widest px-4 py-2 hover:border-primary transition-colors flex items-center gap-1">
              WEEK {weekNum + 1} <ChevronRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalWeek;
