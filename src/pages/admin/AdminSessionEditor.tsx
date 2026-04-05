import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, RefreshCw, Plus, Trash2 } from "lucide-react";

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function parseTime(str: string): number {
  const parts = str.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

const AdminSessionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    session_number: 1, session_date: "", age_group: "adult", video_url: "",
    title: "", video_title: "", admin_notes: "", ai_questions: null as any, status: "draft",
  });
  const [analysing, setAnalysing] = useState(false);
  const [analyseStep, setAnalyseStep] = useState("");
  const [saving, setSaving] = useState(false);
  const [kidsToddler, setKidsToddler] = useState<any>({ video_url: "", activity_type: "Colouring", activity_description: "", materials_needed: "", lesson_theme: "", facilitator_notes: "" });
  const [kidsTeen, setKidsTeen] = useState<any>({ video_url: "", activity_description: "", facilitator_notes: "" });
  const [existingKids, setExistingKids] = useState<any[]>([]);
  const [pausePoints, setPausePoints] = useState<{ position: number; timestamp_seconds: number; context_start_seconds: number; question_text: string; id?: string }[]>([]);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from("sessions").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setForm({
            session_number: data.session_number, session_date: data.session_date || "",
            age_group: (data as any).age_group || "adult",
            video_url: (data as any).video_url || data.youtube_id ? `https://youtu.be/${data.youtube_id}` : "",
            title: data.title || "", video_title: (data as any).video_title || "",
            admin_notes: (data as any).admin_notes || "", ai_questions: (data as any).ai_questions || null,
            status: data.status,
          });
        }
      });
      supabase.from("kids_sessions").select("*").eq("parent_session_id", id).then(({ data }) => {
        if (data) {
          setExistingKids(data);
          const toddler = data.find((k: any) => k.age_group === "toddler-tween");
          const teen = data.find((k: any) => k.age_group === "tween-teen");
          if (toddler) setKidsToddler({ video_url: toddler.video_url || "", activity_type: toddler.activity_type || "Colouring", activity_description: toddler.activity_description || "", materials_needed: toddler.materials_needed || "", lesson_theme: toddler.lesson_theme || "", facilitator_notes: toddler.facilitator_notes || "" });
          if (teen) setKidsTeen({ video_url: teen.video_url || "", activity_description: teen.activity_description || "", facilitator_notes: teen.facilitator_notes || "" });
        }
      });
      supabase.from("session_pause_points").select("*").eq("session_id", id).order("position").then(({ data }) => {
        if (data && data.length > 0) setPausePoints(data.map((p: any) => ({ ...p })));
      });
    }
  }, [id]);

  const analyse = async () => {
    if (!form.video_url) return;
    setAnalysing(true);
    setAnalyseStep("Reading the transcript...");
    try {
      setTimeout(() => setAnalyseStep("Generating questions..."), 3000);
      const { data, error } = await supabase.functions.invoke("analyse-video", {
        body: { session_id: isNew ? null : id, video_url: form.video_url, age_group: form.age_group },
      });
      if (error) throw error;
      setForm((f) => ({ ...f, title: data.questions.session_title || f.title, video_title: data.video_title || f.video_title, ai_questions: data.questions }));
      toast({ title: "Analysis complete" });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    }
    setAnalysing(false); setAnalyseStep("");
  };

  const analyseTeenVideo = async () => {
    if (!kidsTeen.video_url) return;
    setAnalysing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyse-video", { body: { video_url: kidsTeen.video_url, age_group: "teen" } });
      if (error) throw error;
      toast({ title: "Teen analysis complete" });
    } catch (err: any) {
      toast({ title: "Teen analysis failed", description: err.message, variant: "destructive" });
    }
    setAnalysing(false);
  };

  const addPausePoint = () => {
    if (pausePoints.length >= 5) return;
    setPausePoints([...pausePoints, { position: pausePoints.length + 1, timestamp_seconds: 0, context_start_seconds: 0, question_text: "" }]);
  };

  const updatePausePoint = (idx: number, field: string, value: any) => {
    setPausePoints(pausePoints.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const removePausePoint = (idx: number) => {
    const updated = pausePoints.filter((_, i) => i !== idx).map((p, i) => ({ ...p, position: i + 1 }));
    setPausePoints(updated);
  };

  const save = async (status?: string) => {
    setSaving(true);
    const videoId = extractVideoId(form.video_url);
    const payload: any = {
      session_number: form.session_number, session_date: form.session_date || null,
      age_group: form.age_group, video_url: form.video_url, youtube_id: videoId || "",
      title: form.title, video_title: form.video_title, admin_notes: form.admin_notes,
      ai_questions: form.ai_questions, status: status || form.status,
    };

    if (status === "active") {
      payload.session_code = payload.session_code || generateSessionCode();
      payload.active_slide = 1;
    }

    let sessionId = id;

    if (isNew) {
      const { data, error } = await supabase.from("sessions").insert(payload).select().single();
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
      sessionId = data.id;
    } else {
      const { error } = await supabase.from("sessions").update(payload).eq("id", id!);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }

    if (sessionId && sessionId !== "new") {
      // Save kids sessions
      const saveKid = async (ageGroup: string, data: any, existing: any) => {
        const kidPayload = { parent_session_id: sessionId, age_group: ageGroup, ...data };
        if (existing) await supabase.from("kids_sessions").update(kidPayload).eq("id", existing.id);
        else if (Object.values(data).some((v: any) => v)) await supabase.from("kids_sessions").insert(kidPayload);
      };
      await saveKid("toddler-tween", kidsToddler, existingKids.find((k) => k.age_group === "toddler-tween"));
      await saveKid("tween-teen", kidsTeen, existingKids.find((k) => k.age_group === "tween-teen"));

      // Save pause points
      await supabase.from("session_pause_points").delete().eq("session_id", sessionId!);
      if (pausePoints.length > 0) {
        const ppPayload = pausePoints.filter(p => p.question_text).map(p => ({
          session_id: sessionId!, position: p.position,
          timestamp_seconds: p.timestamp_seconds, context_start_seconds: p.context_start_seconds,
          question_text: p.question_text,
        }));
        if (ppPayload.length > 0) await supabase.from("session_pause_points").insert(ppPayload);
      }
    }

    if (status === "active") {
      await supabase.from("sessions").update({ status: "completed" } as any).neq("id", sessionId!).eq("status", "active");
    }

    setSaving(false);
    toast({ title: status === "active" ? "Session activated" : "Session saved" });
    navigate("/admin/sessions");
  };

  const videoId = extractVideoId(form.video_url);
  const inputClass = "w-full bg-transparent border-b border-foreground/10 text-foreground font-body text-sm py-3 px-1 focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/15";
  const labelClass = "block text-foreground/40 text-[10px] tracking-[0.12em] font-body mb-2 mt-6";

  return (
    <div className="min-h-screen" className="bg-background text-foreground">
      <nav className="flex items-center px-6 md:px-12 py-5">
        <Link to="/admin/sessions" className="flex items-center gap-2 text-foreground/30 text-[10px] tracking-[0.12em] font-body hover:text-foreground/50">
          <ArrowLeft size={12} /> SESSIONS
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-4 pb-20">
        <h1 className="font-display text-2xl font-bold text-foreground mb-8">{isNew ? "New Session" : "Edit Session"}</h1>

        {/* Basics */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>WEEK NUMBER</label>
            <input type="number" min={1} max={52} value={form.session_number} onChange={(e) => setForm({ ...form, session_number: +e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>DATE</label>
            <input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>AGE GROUP</label>
            <select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} className={`${inputClass} bg-background`}>
              <option value="adult">Adult</option>
              <option value="teen">Teen</option>
              <option value="child">Child</option>
            </select>
          </div>
        </div>

        {/* Video */}
        <label className={labelClass}>VIDEO URL</label>
        <div className="flex gap-3">
          <input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="Paste YouTube URL..." className={`flex-1 ${inputClass}`} />
          <button onClick={analyse} disabled={analysing || !form.video_url} className="flex items-center gap-2 px-4 py-2 border border-foreground/10 text-foreground/60 text-xs font-body hover:border-foreground/25 transition-colors disabled:opacity-30 whitespace-nowrap">
            <Sparkles size={14} /> {analysing ? analyseStep : "Analyse with AI"}
          </button>
        </div>

        {videoId && (
          <div className="mt-4 aspect-video">
            <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen />
          </div>
        )}

        {form.ai_questions && (
          <div className="mt-6 border border-foreground/[0.08] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.12em] text-foreground/40 font-body flex items-center gap-2"><Sparkles size={12} /> AI ANALYSIS</span>
              <button onClick={analyse} className="text-[10px] text-foreground/20 hover:text-foreground/50 font-body flex items-center gap-1"><RefreshCw size={10} /> Regenerate</button>
            </div>
            <label className={labelClass}>SESSION TITLE</label>
            <input value={form.ai_questions.session_title || ""} onChange={(e) => setForm({ ...form, ai_questions: { ...form.ai_questions, session_title: e.target.value }, title: e.target.value })} className={inputClass} />
            {["question_1", "question_2", "question_3"].map((key, i) => (
              <div key={key}>
                <label className={labelClass}>QUESTION {i + 1}</label>
                <textarea value={form.ai_questions[key] || ""} onChange={(e) => setForm({ ...form, ai_questions: { ...form.ai_questions, [key]: e.target.value } })} className={`${inputClass} min-h-[60px] resize-none`} />
              </div>
            ))}
          </div>
        )}

        {/* Pause Points */}
        {videoId && (
          <div className="mt-8 border-t border-foreground/[0.06] pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] tracking-[0.15em] text-foreground/40 font-body">PAUSE POINTS (UP TO 5)</h2>
              {pausePoints.length < 5 && (
                <button onClick={addPausePoint} className="flex items-center gap-1 text-[10px] text-foreground/30 hover:text-foreground/60 font-body">
                  <Plus size={12} /> Add pause point
                </button>
              )}
            </div>
            <p className="text-foreground/20 text-xs font-body mb-4">Pre-set moments where the video pauses for a reflection question.</p>
            {pausePoints.map((pp, idx) => (
              <div key={idx} className="border border-foreground/[0.06] rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-foreground/40 text-[10px] tracking-wider font-body">PAUSE POINT {idx + 1}</span>
                  <button onClick={() => removePausePoint(idx)} className="text-foreground/20 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-foreground/30 text-[9px] tracking-wider font-body mb-1 block">CONTEXT STARTS AT (mm:ss)</label>
                    <input
                      value={formatTime(pp.context_start_seconds)}
                      onChange={(e) => updatePausePoint(idx, "context_start_seconds", parseTime(e.target.value))}
                      placeholder="00:00" className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-foreground/30 text-[9px] tracking-wider font-body mb-1 block">PAUSE AT (mm:ss)</label>
                    <input
                      value={formatTime(pp.timestamp_seconds)}
                      onChange={(e) => updatePausePoint(idx, "timestamp_seconds", parseTime(e.target.value))}
                      placeholder="00:00" className={inputClass}
                    />
                  </div>
                </div>
                <label className="text-foreground/30 text-[9px] tracking-wider font-body mb-1 block">QUESTION</label>
                <textarea
                  value={pp.question_text}
                  onChange={(e) => updatePausePoint(idx, "question_text", e.target.value)}
                  placeholder="The question that appears on screen and members' phones..."
                  className={`${inputClass} min-h-[50px] resize-none`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Title & Notes */}
        <label className={labelClass}>SESSION TITLE</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Session title..." className={inputClass} />

        <label className={labelClass}>ADMIN NOTES (INTERNAL)</label>
        <textarea value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })} placeholder="Notes for facilitators only..." className={`${inputClass} min-h-[80px] resize-none`} />

        {/* Kids Sessions */}
        {!isNew && (
          <div className="mt-10 border-t border-foreground/[0.06] pt-8">
            <h2 className="font-display text-lg font-bold text-foreground mb-6">Kids Sessions</h2>
            <details className="mb-6">
              <summary className="text-foreground/40 text-xs tracking-[0.12em] font-body cursor-pointer hover:text-foreground/60">LITTLE ONES (4–11)</summary>
              <div className="mt-4 pl-4 border-l border-foreground/[0.06]">
                <label className={labelClass}>VIDEO URL</label>
                <input value={kidsToddler.video_url} onChange={(e) => setKidsToddler({ ...kidsToddler, video_url: e.target.value })} className={inputClass} placeholder="YouTube URL..." />
                <label className={labelClass}>ACTIVITY TYPE</label>
                <select value={kidsToddler.activity_type} onChange={(e) => setKidsToddler({ ...kidsToddler, activity_type: e.target.value })} className={`${inputClass} bg-background`}>
                  {["Colouring", "Drawing", "Wordsearch", "Maze", "Discussion", "Free art"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <label className={labelClass}>ACTIVITY DESCRIPTION</label>
                <textarea value={kidsToddler.activity_description} onChange={(e) => setKidsToddler({ ...kidsToddler, activity_description: e.target.value })} className={`${inputClass} min-h-[60px] resize-none`} />
                <label className={labelClass}>MATERIALS NEEDED</label>
                <input value={kidsToddler.materials_needed} onChange={(e) => setKidsToddler({ ...kidsToddler, materials_needed: e.target.value })} className={inputClass} />
                <label className={labelClass}>LESSON THEME</label>
                <input value={kidsToddler.lesson_theme} onChange={(e) => setKidsToddler({ ...kidsToddler, lesson_theme: e.target.value })} className={inputClass} placeholder="e.g. Bravery, Kindness" />
                <label className={labelClass}>FACILITATOR NOTES</label>
                <textarea value={kidsToddler.facilitator_notes} onChange={(e) => setKidsToddler({ ...kidsToddler, facilitator_notes: e.target.value })} className={`${inputClass} min-h-[60px] resize-none`} />
              </div>
            </details>
            <details>
              <summary className="text-foreground/40 text-xs tracking-[0.12em] font-body cursor-pointer hover:text-foreground/60">TEENS (12–24)</summary>
              <div className="mt-4 pl-4 border-l border-foreground/[0.06]">
                <label className={labelClass}>VIDEO URL</label>
                <div className="flex gap-3">
                  <input value={kidsTeen.video_url} onChange={(e) => setKidsTeen({ ...kidsTeen, video_url: e.target.value })} className={`flex-1 ${inputClass}`} placeholder="YouTube URL..." />
                  <button onClick={analyseTeenVideo} disabled={analysing || !kidsTeen.video_url} className="flex items-center gap-2 px-3 py-2 border border-foreground/10 text-foreground/40 text-[10px] font-body hover:border-foreground/20 disabled:opacity-30">
                    <Sparkles size={12} /> Analyse (teen)
                  </button>
                </div>
                <label className={labelClass}>ACTIVITY DESCRIPTION</label>
                <textarea value={kidsTeen.activity_description} onChange={(e) => setKidsTeen({ ...kidsTeen, activity_description: e.target.value })} className={`${inputClass} min-h-[60px] resize-none`} />
                <label className={labelClass}>FACILITATOR NOTES</label>
                <textarea value={kidsTeen.facilitator_notes} onChange={(e) => setKidsTeen({ ...kidsTeen, facilitator_notes: e.target.value })} className={`${inputClass} min-h-[60px] resize-none`} />
              </div>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-10">
          <button onClick={() => save("draft")} disabled={saving} className="px-6 py-3 border border-foreground/10 text-foreground/60 text-xs tracking-[0.12em] font-body hover:border-foreground/25 transition-colors disabled:opacity-30">
            {saving ? "..." : "SAVE AS DRAFT"}
          </button>
          <button onClick={() => save("active")} disabled={saving} className="px-6 py-3 bg-emerald-500/20 text-emerald-400 text-xs tracking-[0.12em] font-body hover:bg-emerald-500/30 transition-colors disabled:opacity-30">
            SET AS ACTIVE SESSION →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSessionEditor;
