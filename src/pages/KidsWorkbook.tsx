import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Wifi, WifiOff, AlertCircle, Camera, Smile, Frown, Angry, Zap, Moon, ShieldAlert, Heart, HelpCircle, Sun, Star } from "lucide-react";

const MOOD_ICONS: { icon: React.ElementType; label: string }[] = [
  { icon: Smile, label: "happy" },
  { icon: Frown, label: "sad" },
  { icon: Angry, label: "annoyed" },
  { icon: Zap, label: "excited" },
  { icon: Moon, label: "tired" },
  { icon: ShieldAlert, label: "worried" },
  { icon: Heart, label: "calm" },
  { icon: HelpCircle, label: "curious" },
  { icon: Sun, label: "grateful" },
];

const SECTIONS = [
  { key: "mood", title: "How I arrived today", type: "mood" },
  { key: "drawing_description", title: "The story we watched", type: "story" },
  { key: "character_felt", title: "The character in the story", type: "character" },
  { key: "question_1_answer", title: "Big thinking question 1", type: "bigq", questionField: "question_1" },
  { key: "question_2_answer", title: "Big thinking question 2", type: "bigq", questionField: "question_2" },
  { key: "something_to_remember", title: "Something I want to remember", type: "remember" },
  { key: "weekly_goal", title: "My goal this week", type: "goal" },
  { key: "little_minds_question", title: "Little Minds Big Questions", type: "littleminds" },
  { key: "parent_conversation_notes", title: "Talk with a grown-up", type: "parent" },
];

type SaveStatus = "idle" | "saving" | "saved" | "local" | "error";

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

const KidsWorkbook = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [entry, setEntry] = useState<any>({});
  const [entryId, setEntryId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const saveTimer = useRef<any>(null);
  const touchStart = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingFileRef = useRef<HTMLInputElement>(null);

  const lsKey = session ? `mindcast_kids_wb_${session.id}_${user?.id}` : null;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (!profile) return; // journal rows are keyed on profiles.id
    supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle().then(({ data }) => {
      if (data) {
        setSession(data);
        supabase.from("kids_workbook_entries").select("*").eq("session_id", data.id).eq("profile_id", profile.id).maybeSingle().then(({ data: e }) => {
          if (e) { setEntry(e); setEntryId(e.id); }
          else {
            const key = `mindcast_kids_wb_${data.id}_${user.id}`;
            const local = localStorage.getItem(key);
            if (local) { try { setEntry(JSON.parse(local)); } catch {} }
          }
        });
      }
    });
  }, [user, profile, authLoading]);

  const autoSave = useCallback((updates: any) => {
    if (!session || !user || !profile) return;
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    if (lsKey) {
      try { localStorage.setItem(lsKey, JSON.stringify({ ...entry, ...updates })); } catch {}
    }
    saveTimer.current = setTimeout(async () => {
      try {
        const payload = { ...updates, profile_id: profile.id, session_id: session.id };
        if (entryId) {
          const { error } = await supabase.from("kids_workbook_entries").update(payload).eq("id", entryId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("kids_workbook_entries").upsert(payload, { onConflict: "profile_id,session_id" }).select().single();
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
  }, [session, user, profile, entryId, entry, lsKey]);

  const updateField = (key: string, value: string) => {
    const updated = { ...entry, [key]: value };
    setEntry(updated);
    autoSave({ [key]: value });
  };

  const uploadDrawing = async (file: File, field: string) => {
    if (!user || !session) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `kids/${user.id}/${session.id}_${field}.${ext}`;
      const { error } = await supabase.storage.from("worksheet-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("worksheet-photos").getPublicUrl(path);
      updateField(field, urlData.publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const finish = async () => {
    if (entryId) {
      await supabase.from("kids_workbook_entries").update({ completed_at: new Date().toISOString() }).eq("id", entryId);
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
        <Star className="w-12 h-12 text-foreground/60 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Amazing job!</h2>
        <p className="text-foreground/30 font-body text-sm mb-8">Your big thinking book is saved.</p>
        <button onClick={() => navigate("/dashboard")} className="text-foreground/20 text-xs font-body hover:text-foreground/40 transition-colors">Back to home</button>
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

  const DrawingUpload = ({ field, label }: { field: string; label: string }) => (
    <div className="mt-4">
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={field === "favorite_part_drawing_url" ? fileInputRef : drawingFileRef}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDrawing(f, field); }} />
      {entry[field] ? (
        <div className="relative">
          <img src={entry[field]} alt={label} className="w-full rounded-lg border border-foreground/10" />
          <button onClick={() => (field === "favorite_part_drawing_url" ? fileInputRef : drawingFileRef).current?.click()} className="absolute top-2 right-2 bg-black/50 text-foreground/60 text-[10px] px-2 py-1 rounded">Replace</button>
        </div>
      ) : (
        <button onClick={() => (field === "favorite_part_drawing_url" ? fileInputRef : drawingFileRef).current?.click()}
          className="w-full border-2 border-dashed border-foreground/10 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-foreground/20 transition-colors"
          disabled={uploading}>
          <Camera size={24} className="text-foreground/20" />
          <span className="text-foreground/30 text-xs font-body">{uploading ? "Uploading..." : `Take a photo of your ${label}`}</span>
        </button>
      )}
    </div>
  );

  const renderInput = () => {
    if (!currentSection) return null;

    if (currentSection.type === "mood") {
      return (
        <div>
          <p className="text-foreground/30 text-sm font-body mb-6 text-center">Circle the face that shows how you feel:</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {MOOD_ICONS.map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => updateField("mood_emoji", label)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${entry.mood_emoji === label ? "bg-foreground/10 border border-foreground/20 scale-105" : "border border-foreground/[0.04] hover:border-foreground/10"}`}>
                <Icon className="w-8 h-8 text-foreground/60" />
                <span className="text-foreground/40 text-[10px] font-body">{label}</span>
              </button>
            ))}
          </div>
          <div>
            <p className="text-foreground/30 text-xs font-body mb-2 text-center">One word for today:</p>
            <input value={entry.arriving_word || ""} onChange={(e) => updateField("arriving_word", e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-lg py-3 text-center focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="one word" />
          </div>
        </div>
      );
    }

    if (currentSection.type === "story") {
      return (
        <div>
          <p className="text-foreground/30 text-sm font-body mb-4 text-center">Draw your favourite part of the story!</p>
          <DrawingUpload field="favorite_part_drawing_url" label="drawing" />
          <div className="mt-6">
            <p className="text-foreground/30 text-xs font-body mb-2">What is happening in your drawing?</p>
            <textarea value={entry.drawing_description || ""} onChange={(e) => updateField("drawing_description", e.target.value)} rows={3} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="Tell us about your drawing..." />
          </div>
        </div>
      );
    }

    if (currentSection.type === "character") {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-foreground/30 text-xs font-body mb-2">The main character felt:</p>
            <input value={entry.character_felt || ""} onChange={(e) => updateField("character_felt", e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-sm py-2 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="How did they feel?" />
          </div>
          <div>
            <p className="text-foreground/30 text-xs font-body mb-2">If I were that character I would have felt:</p>
            <input value={entry.if_i_were_character || ""} onChange={(e) => updateField("if_i_were_character", e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-sm py-2 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="I would have felt..." />
          </div>
          <div>
            <p className="text-foreground/30 text-xs font-body mb-2">Something the character did that was brave, kind, or clever:</p>
            <textarea value={entry.character_brave_kind || ""} onChange={(e) => updateField("character_brave_kind", e.target.value)} rows={3} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="They were brave/kind/clever when..." />
          </div>
        </div>
      );
    }

    if (currentSection.type === "bigq") {
      const qField = currentSection.questionField!;
      const aiQuestion = ai[qField] || "";
      return (
        <div>
          <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-2 text-center">THERE ARE NO WRONG ANSWERS — JUST THINK AND WRITE OR DRAW</p>
          {aiQuestion && (
            <div className="border-l-2 border-foreground/10 pl-4 mb-4">
              <p className="text-foreground/50 font-body text-sm leading-relaxed">{aiQuestion}</p>
            </div>
          )}
          <div className="mb-3">
            <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-2">QUESTION</p>
            <input value={entry[qField] || ""} onChange={(e) => updateField(qField, e.target.value)} className="w-full bg-transparent border-b border-foreground/10 text-foreground/60 font-body text-sm py-2 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="Write the question here..." />
          </div>
          <textarea value={entry[currentSection.key] || ""} onChange={(e) => updateField(currentSection.key, e.target.value)} rows={4} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="My answer..." />
          <DrawingUpload field="question_1_drawing_url" label="answer drawing" />
        </div>
      );
    }

    if (currentSection.type === "remember") {
      return (
        <div>
          <p className="text-foreground/30 text-sm font-body mb-4 text-center">The most important thing from today was:</p>
          <textarea value={entry.something_to_remember || ""} onChange={(e) => updateField("something_to_remember", e.target.value)} rows={4} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="I want to remember..." autoFocus />
        </div>
      );
    }

    if (currentSection.type === "goal") {
      return (
        <div>
          <p className="text-foreground/30 text-sm font-body mb-4 text-center">One kind or brave thing I will try to do this week:</p>
          <div className="flex items-start gap-2">
            <span className="text-foreground/30 text-sm font-body mt-3">I will</span>
            <textarea value={entry.weekly_goal || ""} onChange={(e) => updateField("weekly_goal", e.target.value)} rows={3} className="flex-1 bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="..." autoFocus />
          </div>
        </div>
      );
    }

    if (currentSection.type === "littleminds") {
      return (
        <div>
          <div className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl p-5 mb-4">
            <div className="flex justify-center mb-2"><Star className="w-5 h-5 text-foreground/40" /></div>
            <p className="text-foreground/40 text-sm font-body text-center leading-relaxed mb-4">A question that came to me during today's session was:</p>
            <textarea value={entry.little_minds_question || ""} onChange={(e) => updateField("little_minds_question", e.target.value)} rows={3} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="My big question..." autoFocus />
          </div>
          <p className="text-foreground/20 text-[10px] font-body text-center leading-relaxed">Ask a grown-up to help you explore this question further using the Little Minds Big Questions app. They will create a story just for you!</p>
          <div className="mt-4">
            <p className="text-foreground/20 text-xs font-body mb-2 text-center">After you read your story together, take a photo of your favourite part:</p>
            <DrawingUpload field="little_minds_drawing_url" label="story drawing" />
          </div>
        </div>
      );
    }

    if (currentSection.type === "parent") {
      return (
        <div>
          <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-3 text-center">THIS SECTION IS FOR YOU AND A PARENT OR CARER TO DO TOGETHER</p>
          <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-lg p-4 mb-4">
            <p className="text-foreground/30 text-xs font-body italic leading-relaxed">"Have you ever felt like the character in today's story? What happened? What did you do?"</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-foreground/30 text-xs font-body mb-2">Notes from your conversation:</p>
              <textarea value={entry.parent_conversation_notes || ""} onChange={(e) => updateField("parent_conversation_notes", e.target.value)} rows={5} className="w-full bg-transparent border border-foreground/[0.06] text-foreground font-body text-sm p-4 focus:outline-none focus:border-foreground/15 resize-none placeholder:text-foreground/10 rounded-lg" placeholder="What we talked about..." />
            </div>
            <div>
              <p className="text-foreground/20 text-xs font-body mb-2">Parent/carer initials:</p>
              <input value={entry.parent_initials || ""} onChange={(e) => updateField("parent_initials", e.target.value)} className="w-24 bg-transparent border-b border-foreground/10 text-foreground font-body text-sm py-2 focus:outline-none focus:border-foreground/25 placeholder:text-foreground/10" placeholder="___" />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="px-5 pt-8 pb-4 border-b border-foreground/[0.06]">
        <p className="font-body text-[10px] text-foreground/25 uppercase tracking-[0.15em] mb-1">
          MINDCAST KIDS · Week {session.session_number} / 52
        </p>
        <h1 className="text-lg font-display font-bold text-foreground">{session.title}</h1>
        {session.theme && <p className="text-foreground/30 text-xs font-body mt-1">Big idea: {session.theme}</p>}
      </div>

      {step <= 1 && videoId && (
        <div className="px-5 py-4">
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen />
          </div>
        </div>
      )}

      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          {SECTIONS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-primary" : i < step ? "bg-foreground/25" : "bg-foreground/[0.06]"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator />
          <span className="text-foreground/15 text-[9px] font-body">{step + 1} of {SECTIONS.length}</span>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto pb-24">
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
        {step < SECTIONS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-display font-bold hover:bg-primary/90 transition-colors">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={finish} className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 text-xs font-display font-bold hover:bg-emerald-500/30 transition-colors">
            Done! <Check size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default KidsWorkbook;
