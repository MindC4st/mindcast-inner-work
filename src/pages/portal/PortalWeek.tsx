import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Camera, Check, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WEEKS, BELIEF_QUESTIONS, REFLECTION_QUESTIONS, DOMAINS, SELF_AUDIT_QUESTIONS } from "@/data/weekData";
import { toast } from "@/hooks/use-toast";

const PortalWeek = () => {
  const { weekNumber } = useParams<{ weekNumber: string }>();
  const weekNum = parseInt(weekNumber || "1", 10);
  const week = WEEKS[weekNum - 1];
  const { user, cohortId } = useAuth();

  const [entries, setEntries] = useState<Record<string, { text: string; shared: boolean; locked: boolean; photoUrl: string }>>({});
  const [domainScores, setDomainScores] = useState<Record<string, number>>({});
  const [commitment, setCommitment] = useState({ commitment_text: "", why_text: "", measure_text: "", obstacle_text: "", checkin_sentence: "", is_locked: false });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load data
  useEffect(() => {
    if (!user || !cohortId) return;
    const load = async () => {
      const [entriesRes, scoresRes, commitRes] = await Promise.all([
        supabase.from("entries").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
        supabase.from("domain_scores").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum),
        supabase.from("commitments").select("*").eq("user_id", user.id).eq("cohort_id", cohortId).eq("week_number", weekNum).single(),
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
    };
    load();
  }, [user, cohortId, weekNum]);

  // Auto-save entries
  const saveEntry = useCallback(async (key: string, value: { text: string; shared: boolean; locked: boolean; photoUrl: string }) => {
    if (!user || !cohortId) return;
    await supabase.from("entries").upsert({
      user_id: user.id,
      cohort_id: cohortId,
      week_number: weekNum,
      question_key: key,
      answer_text: value.text,
      is_shared: value.shared,
      is_locked: value.locked,
      photo_url: value.photoUrl || null,
    }, { onConflict: "user_id,cohort_id,week_number,question_key" });
  }, [user, cohortId, weekNum]);

  const saveDomainScore = useCallback(async (domain: string, score: number) => {
    if (!user || !cohortId) return;
    await supabase.from("domain_scores").upsert({
      user_id: user.id,
      cohort_id: cohortId,
      week_number: weekNum,
      domain_name: domain,
      score,
    }, { onConflict: "user_id,cohort_id,week_number,domain_name" });
  }, [user, cohortId, weekNum]);

  const saveCommitment = useCallback(async (data: typeof commitment) => {
    if (!user || !cohortId) return;
    await supabase.from("commitments").upsert({
      user_id: user.id,
      cohort_id: cohortId,
      week_number: weekNum,
      ...data,
    }, { onConflict: "user_id,cohort_id,week_number" });
  }, [user, cohortId, weekNum]);

  const updateEntry = (key: string, field: "text" | "shared" | "photoUrl", value: string | boolean) => {
    const current = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
    if (current.locked && field === "text") return;
    const updated = { ...current, [field]: value };
    setEntries(prev => ({ ...prev, [key]: updated }));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveEntry(key, updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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

  const sharedCount = Object.values(entries).filter(e => e.shared).length;
  const totalQuestions = BELIEF_QUESTIONS.length + REFLECTION_QUESTIONS.length;

  const sections = ["BELIEFS", "REFLECTIONS", "SELF AUDIT", "COMMITMENT"];

  if (!week) return <PortalLayout><p>Week not found</p></PortalLayout>;

  return (
    <PortalLayout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/portal/dashboard" className="text-xs text-muted-foreground tracking-widest hover:text-primary mb-4 inline-block">← BACK TO DASHBOARD</Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="heading-display text-2xl md:text-3xl text-primary">WEEK {weekNum}: {week.title.toUpperCase()}</h1>
            <p className="text-xs text-muted-foreground mt-1 font-body">{week.episode}</p>
            <p className="text-xs text-primary/60 mt-2 italic font-body">{week.focus}</p>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-muted-foreground flex items-center gap-1"><Check size={12} /> SAVED</span>}
            <span className="border-2 border-primary/20 text-[10px] tracking-widest px-3 py-1 text-primary/60">
              TERM 2 — WIRED
            </span>
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1 mb-8 overflow-x-auto">
        {sections.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveSection(i)}
            className={`text-[10px] tracking-widest px-4 py-2 border-2 whitespace-nowrap transition-colors ${
              activeSection === i ? "bg-primary text-secondary border-primary" : "border-primary/20 text-primary/60 hover:border-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* SECTION: BELIEFS */}
      {activeSection === 0 && (
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
                  <button
                    onClick={() => {
                      updateEntry(beforeKey, "shared", !before.shared);
                      updateEntry(afterKey, "shared", !before.shared);
                    }}
                    className="text-muted-foreground hover:text-primary"
                    title={before.shared ? "Shared with group" : "Private"}
                  >
                    {before.shared ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">BEFORE LISTENING</label>
                    <textarea
                      value={before.text}
                      onChange={(e) => updateEntry(beforeKey, "text", e.target.value)}
                      disabled={before.locked}
                      placeholder="Your initial belief..."
                      className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px] disabled:opacity-60"
                    />
                    {before.locked && <Lock size={12} className="absolute top-7 right-3 text-muted-foreground" />}
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">AFTER LISTENING</label>
                    <textarea
                      value={after.text}
                      onChange={(e) => updateEntry(afterKey, "text", e.target.value)}
                      placeholder="How has it changed?"
                      className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {/* Lock before fields button */}
          {!Object.keys(entries).some(k => k.startsWith("belief_") && k.endsWith("_before") && entries[k]?.locked) && (
            <button
              onClick={() => {
                BELIEF_QUESTIONS.forEach((_, i) => {
                  const key = `belief_${i}_before`;
                  updateEntry(key, "text", entries[key]?.text || ""); // trigger save
                  const current = entries[key] || { text: "", shared: false, locked: false, photoUrl: "" };
                  const updated = { ...current, locked: true };
                  setEntries(prev => ({ ...prev, [key]: updated }));
                  saveEntry(key, updated);
                });
                toast({ title: "Before responses locked", description: "Your initial beliefs are now preserved." });
              }}
              className="btn-navy text-xs py-2 px-6"
            >
              LOCK MY BEFORE RESPONSES
            </button>
          )}
        </motion.div>
      )}

      {/* SECTION: REFLECTIONS */}
      {activeSection === 1 && (
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
                <textarea
                  value={entry.text}
                  onChange={(e) => updateEntry(key, "text", e.target.value)}
                  placeholder="Your reflection..."
                  className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[80px]"
                />
                {entry.photoUrl && (
                  <div className="mt-2">
                    <img src={entry.photoUrl} alt="Uploaded note" className="h-24 object-cover border-2 border-primary/10" />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* SECTION: SELF AUDIT */}
      {activeSection === 2 && (
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
                    <button
                      key={n}
                      onClick={() => {
                        setDomainScores(prev => ({ ...prev, [d]: n }));
                        saveDomainScore(d, n);
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      }}
                      className={`flex-1 py-2 border-2 text-xs font-display tracking-wider transition-colors ${
                        domainScores[d] === n ? "bg-primary text-secondary border-primary" : "border-primary/20 text-primary/60 hover:border-primary"
                      }`}
                    >
                      {n}
                    </button>
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
                  <textarea
                    value={entry.text}
                    onChange={(e) => updateEntry(key, "text", e.target.value)}
                    placeholder="Your response..."
                    className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px]"
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* SECTION: COMMITMENT */}
      {activeSection === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="heading-display text-xl text-primary mb-4">THE ONE THING</h2>
          <p className="text-sm text-muted-foreground mb-6 font-body">Your single commitment for this week.</p>

          <div className="border-[3px] border-primary p-6 space-y-4">
            {[
              { key: "commitment_text", label: "WHAT I'M DOING", placeholder: "My commitment this week..." },
              { key: "why_text", label: "WHY IT MATTERS", placeholder: "Why this matters to me..." },
              { key: "measure_text", label: "HOW I'LL MEASURE IT", placeholder: "I'll know I succeeded when..." },
              { key: "obstacle_text", label: "WHAT MIGHT GET IN THE WAY", placeholder: "The biggest obstacle is..." },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">{field.label}</label>
                <textarea
                  value={(commitment as any)[field.key] || ""}
                  onChange={(e) => {
                    const updated = { ...commitment, [field.key]: e.target.value };
                    setCommitment(updated);
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = setTimeout(() => {
                      saveCommitment(updated);
                      setSaved(true);
                      setTimeout(() => setSaved(false), 2000);
                    }, 1000);
                  }}
                  disabled={commitment.is_locked}
                  placeholder={field.placeholder}
                  className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px] disabled:opacity-60"
                />
              </div>
            ))}

            <div>
              <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">CHECK-IN SENTENCE (PRIVATE)</label>
              <textarea
                value={commitment.checkin_sentence}
                onChange={(e) => {
                  const updated = { ...commitment, checkin_sentence: e.target.value };
                  setCommitment(updated);
                  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                  saveTimerRef.current = setTimeout(() => {
                    saveCommitment(updated);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  }, 1000);
                }}
                placeholder="How did it go? (editable until next week)"
                className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px]"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-primary/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="btn-outlined text-xs py-2 px-4 disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft size={14} /> BACK
          </button>
        </div>

        <p className="text-xs text-muted-foreground tracking-widest">
          SHARING {sharedCount} OF {totalQuestions} WITH GROUP
        </p>

        <div className="flex items-center gap-2">
          {activeSection < sections.length - 1 ? (
            <button onClick={() => setActiveSection(activeSection + 1)} className="btn-navy text-xs py-2 px-4 flex items-center gap-1">
              NEXT <ChevronRight size={14} />
            </button>
          ) : (
            <div className="flex gap-2">
              {weekNum < 10 && (
                <Link to={`/portal/week/${weekNum + 1}`} className="btn-outlined text-xs py-2 px-4">
                  WEEK {weekNum + 1} →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default PortalWeek;
