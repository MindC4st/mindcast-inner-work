import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Wifi, WifiOff, AlertCircle } from "lucide-react";

const SECTIONS = [
  { key: "goal_update_from_last_week", title: "Before we start — how did last week's goal go?", type: "textarea", subtitle: "If this is your first session, skip this one." },
  { key: "arriving_word", title: "One word for how you arrived today.", type: "short" },
  { key: "first_impression", title: "What caught your attention? What made you sit up?", type: "textarea" },
  { key: "key_idea", title: "The one idea from today that I keep thinking about.", type: "textarea", promptKey: "key_idea_prompt" },
  { key: "question_1_response", title: "", type: "question", questionKey: "question_1", questionTextKey: "question_1_text" },
  { key: "question_2_response", title: "", type: "question", questionKey: "question_2", questionTextKey: "question_2_text" },
  { key: "question_3_response", title: "", type: "question", questionKey: "question_3", questionTextKey: "question_3_text" },
  { key: "personal_application", title: "In my life this week, I could...", type: "textarea", promptKey: "application_prompt" },
  { key: "goal", title: "This week's goal", type: "goal" },
  { key: "leaving_word", title: "One word for how I'm leaving today.", type: "leaving" },
  { key: "free_notes", title: "Free space", type: "freenotes" },
];

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

type SaveStatus = "idle" | "saving" | "saved" | "local" | "error";

const Workbook = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [entry, setEntry] = useState<any>({});
  const [entryId, setEntryId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [done, setDone] = useState(false);
  const [customQ, setCustomQ] = useState<Record<string, boolean>>({});
  const saveTimer = useRef<any>(null);
  const touchStart = useRef<number | null>(null);

  const lsKey = session ? `mindcast_wb_${session.id}_${user?.id}` : null;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setSession(data);
        supabase.from("workbook_entries").select("*").eq("session_id", data.id).eq("profile_id", user.id).maybeSingle().then(({ data: e }) => {
          if (e) { setEntry(e); setEntryId(e.id); }
          else {
            const key = `mindcast_wb_${data.id}_${user.id}`;
            const local = localStorage.getItem(key);
            if (local) { try { setEntry(JSON.parse(local)); } catch {} }
          }
        });
      }
    });
  }, [user, authLoading]);

  const autoSave = useCallback((updates: any) => {
    if (!session || !user) return;
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    if (lsKey) {
      try { localStorage.setItem(lsKey, JSON.stringify({ ...entry, ...updates })); } catch {}
    }
    saveTimer.current = setTimeout(async () => {
      try {
        const payload = { ...updates, profile_id: user.id, session_id: session.id };
        if (entryId) {
          const { error } = await supabase.from("workbook_entries").update(payload).eq("id", entryId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("workbook_entries").upsert(payload, { onConflict: "profile_id,session_id" }).select().single();
          if (error) throw error;
          if (data) setEntryId(data.id);
        }
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("local");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 1500);
  }, [session, user, entryId, entry, lsKey]);

  const updateField = (key: string, value: string) => {
    const updated = { ...entry, [key]: value };
    setEntry(updated);
    autoSave({ [key]: value });
  };

  const finish = async () => {
    if (entryId) {
      await supabase.from("workbook_entries").update({ completed_at: new Date().toISOString() }).eq("id", entryId);
    }
    if (lsKey) localStorage.removeItem(lsKey);
    setDone(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && step < SECTIONS.length - 1) setStep(step + 1);
      if (diff > 0 && step > 0) setStep(step - 1);
    }
    touchStart.current = null;
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-foreground/20 text-xs animate-pulse font-body">Loading...</span></div>;

  if (!session) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-foreground/40 font-body text-sm mb-2">There's no active session right now.</p>
        <p className="text-foreground/20 font-body text-xs">Check back on session night.</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <Check size={32} className="text-emerald-400/60 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">You're done.</h2>
        <p className="text-foreground/30 font-body text-sm mb-8">Your workbook is saved.</p>
        <div className="flex flex-col gap-3">
          <a href={`/display/wordcloud?session=${session.id}`} className="text-foreground/30 text-xs font-body hover:text-foreground/50 transition-colors">View this week's word cloud →</a>
          <button onClick={() => navigate("/dashboard")} className="text-foreground/20 text-xs font-body hover:text-foreground/40 transition-colors">Back to dashboard</button>
        </div>
      </div>
    </div>
  );

  const ai = session.ai_questions || {};
  const videoId = session.video_url ? extractVideoId(session.video_url) : (session.youtube_id || null);
  const currentSection = SECTIONS[step];

  const SaveIndicator = () => {
    if (saveStatus === "saving") return <span className="text-foreground/30 text-[9px] font-body">Saving...</span>;
    if (saveStatus === "saved") return <span className="text-emerald-400/50 text-[9px] font-body flex items-center gap-1"><Wifi size={10} /> Saved</span>;
    if (saveStatus === "local") return <span className="text-amber-400/50 text-[9px] font-body flex items-center gap-1"><WifiOff size={10} /> Saved locally</span>;
    if (saveStatus === "error") return <span className="text-red-400/50 text-[9px] font-body flex items-center gap-1"><AlertCircle size={10} /> Error</span>;
    return null;
  };

  const renderInput = () => {
    if (!currentSection) return null;

    if (currentSection.type === "short") {
      return <input value={entry[currentSection.key] || ""} onChange={(e) => updateField(currentSection.key, e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-lg py-3 text-center focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="one word" autoFocus />;
    }

    if (currentSection.type === "textarea") {
      return (
        <div>
          {currentSection.subtitle && (
            <p className="text-foreground/20 text-xs font-body italic mb-3 text-center">{currentSection.subtitle}</p>
          )}
          {currentSection.promptKey && ai[currentSection.promptKey] && (
            <p className="text-foreground/30 text-sm font-body italic mb-4 text-center">{ai[currentSection.promptKey]}</p>
          )}
          <textarea value={entry[currentSection.key] || ""} onChange={(e) => updateField(currentSection.key, e.target.value)} rows={5} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="Write here..." autoFocus />
        </div>
      );
    }

    if (currentSection.type === "question") {
      const qKey = currentSection.questionKey!;
      const qtKey = currentSection.questionTextKey!;
      const aiQuestion = ai[qKey] || "";
      const isCustom = customQ[qKey];
      return (
        <div>
          <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-3 text-center">WRITE THE QUESTION FROM THE SCREEN, THEN ANSWER</p>
          {!isCustom ? (
            <div className="border-l-2 border-foreground/10 pl-4 mb-4">
              <p className="text-foreground/50 font-body text-sm leading-relaxed">{aiQuestion}</p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-2">YOUR QUESTION</p>
              <input value={entry[qtKey] || ""} onChange={(e) => updateField(qtKey, e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground/60 font-body text-sm py-2 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="Write your own question..." />
            </div>
          )}
          <button onClick={() => setCustomQ((p) => ({ ...p, [qKey]: !p[qKey] }))} className="text-foreground/15 text-[10px] font-body hover:text-foreground/30 transition-colors mb-4">
            {isCustom ? "← Use the AI question" : "Write a different question →"}
          </button>
          <textarea value={entry[currentSection.key] || ""} onChange={(e) => updateField(currentSection.key, e.target.value)} rows={6} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="Your answer..." autoFocus />
        </div>
      );
    }

    if (currentSection.type === "goal") {
      return (
        <div className="space-y-6">
          <p className="text-foreground/20 text-xs font-body text-center italic">One specific thing I will do before next session</p>
          <div>
            <p className="text-foreground/30 text-xs font-body mb-2">This week I will:</p>
            <textarea value={entry.weekly_goal || ""} onChange={(e) => updateField("weekly_goal", e.target.value)} rows={3} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="My goal..." />
          </div>
          <div>
            <p className="text-foreground/30 text-xs font-body mb-2">The one thing I'll do in the next 24 hours:</p>
            <input value={entry.action_step || ""} onChange={(e) => updateField("action_step", e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-sm py-3 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="My first step..." />
          </div>
          <div>
            <p className="text-foreground/20 text-xs font-body mb-2">Who could I tell about this goal? (optional)</p>
            <input value={entry.accountability_person || ""} onChange={(e) => updateField("accountability_person", e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground/60 font-body text-sm py-3 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="A name..." />
          </div>
        </div>
      );
    }

    if (currentSection.type === "leaving") {
      return (
        <div className="space-y-6">
          <input value={entry.leaving_word || ""} onChange={(e) => updateField("leaving_word", e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-lg py-3 text-center focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="one word" autoFocus />
          <p className="text-foreground/20 text-[10px] font-body text-center">Submit this to the word cloud on your phone before you leave</p>
          <label className="flex items-center justify-center gap-3 cursor-pointer">
            <input type="checkbox" checked={entry.share_leaving_word !== false} onChange={(e) => updateField("share_leaving_word", e.target.checked ? "true" : "false")} className="accent-white" />
            <span className="text-foreground/30 text-xs font-body">Add to tonight's group word cloud</span>
          </label>
        </div>
      );
    }

    if (currentSection.type === "freenotes") {
      return (
        <div>
          <p className="text-foreground/20 text-xs font-body italic mb-4 text-center">Notes, sketches, ideas, things I want to remember</p>
          <textarea value={entry.free_notes || ""} onChange={(e) => updateField("free_notes", e.target.value)} rows={10} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="Anything you want to capture..." autoFocus />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="px-5 pt-8 pb-4 border-b border-foreground/[0.06]">
        <p className="font-body text-[10px] text-foreground/25 uppercase tracking-[0.15em] mb-1">
          Week {session.session_number} · {session.session_date}
        </p>
        <h1 className="text-lg font-display font-bold text-foreground">{session.title}</h1>
        {session.theme && <p className="text-foreground/30 text-xs font-body mt-1">{session.theme}</p>}
        {session.podcast_guest && <p className="text-foreground/20 text-[10px] font-body mt-1">{session.podcast_guest}</p>}
      </div>

      {step <= 2 && videoId && (
        <div className="px-5 py-4">
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen />
          </div>
        </div>
      )}

      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          {SECTIONS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-white" : i < step ? "bg-foreground/25" : "bg-foreground/[0.06]"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator />
          <span className="text-foreground/15 text-[9px] font-body">{step + 1} of {SECTIONS.length}</span>
        </div>
      </div>

      <div className="px-5 py-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            <h2 className="text-foreground font-display text-base font-bold mb-6 text-center">
              {currentSection.title || ""}
            </h2>
            {renderInput()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background/95 backdrop-blur border-t border-foreground/[0.04] flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3 border border-foreground/10 text-foreground/40 text-xs font-body hover:border-foreground/20 transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div className="flex-1" />
        {step === 0 && !entry.goal_update_from_last_week && (
          <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-5 py-3 text-foreground/20 text-xs font-body hover:text-foreground/40 transition-colors">
            Skip →
          </button>
        )}
        {step < SECTIONS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-display font-bold hover:bg-primary/90 transition-colors">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={finish} className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 text-xs font-display font-bold hover:bg-emerald-500/30 transition-colors">
            Complete <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Workbook;
