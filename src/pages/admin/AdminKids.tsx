import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles } from "lucide-react";

const ACTIVITY_TYPES = [
  "Colouring page", "Drawing challenge", "Wordsearch", "Maze",
  "Feelings map", "Sentence starters", "Free art", "Craft activity", "Discussion circles",
];

const FIFTY_TWO_WEEK_PLAN: Record<number, { kids_title: string; kids_activity: string; teen_title: string }> = {
  1: { kids_title: "What Makes Me Happy?", kids_activity: "Draw 5 things that make you smile", teen_title: "Meaning & Happiness" },
  2: { kids_title: "Being Brave", kids_activity: "Colour a bravery shield", teen_title: "Courage & Fear" },
  3: { kids_title: "Kindness Matters", kids_activity: "Kindness chain craft", teen_title: "Empathy & Connection" },
  4: { kids_title: "My Feelings", kids_activity: "Feelings map drawing", teen_title: "Emotional Intelligence" },
  5: { kids_title: "Being Different", kids_activity: "Draw what makes you unique", teen_title: "Identity & Belonging" },
};

function extractVideoId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

const AdminKids = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [session, setSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [littleOnes, setLittleOnes] = useState<any>({});
  const [teens, setTeens] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [analysingTeen, setAnalysingTeen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("sessions").select("*").order("session_number").then(({ data }) => {
      setSessions(data || []);
      if (sessionId) {
        const s = (data || []).find((s: any) => s.id === sessionId);
        if (s) setSession(s);
      } else if (data && data.length > 0) {
        const active = data.find((s: any) => s.status === "active") || data[0];
        setSession(active);
      }
    });
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    supabase.from("kids_sessions").select("*").eq("parent_session_id", session.id).then(({ data }) => {
      const lo = (data || []).find((d: any) => d.age_group === "little_ones");
      const te = (data || []).find((d: any) => d.age_group === "teens");
      if (lo) setLittleOnes(lo);
      if (te) setTeens(te);
    });
  }, [session]);

  const weekSuggestion = session ? FIFTY_TWO_WEEK_PLAN[session.session_number] : null;

  const savePanel = async (ageGroup: string, data: any) => {
    setSaving(true);
    const payload = { ...data, age_group: ageGroup, parent_session_id: session.id };
    if (data.id && !data.id.startsWith("new")) {
      await supabase.from("kids_sessions").update(payload).eq("id", data.id);
    } else {
      const { id, ...rest } = payload;
      await supabase.from("kids_sessions").insert(rest);
    }
    setSaving(false);
    toast({ title: `${ageGroup === "little_ones" ? "Little Ones" : "Teens"} saved` });
  };

  const analyseTeen = async () => {
    if (!teens.video_url) return;
    setAnalysingTeen(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyse-video", {
        body: { session_id: session.id, video_url: teens.video_url, age_group: "teen" },
      });
      if (error) throw error;
      toast({ title: "Teen AI analysis complete" });
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    }
    setAnalysingTeen(false);
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-body placeholder-white/15 focus:outline-none focus:border-white/20";
  const labelClass = "text-[10px] font-body text-white/30 uppercase tracking-[0.1em] block mb-2";

  return (
    <div className="min-h-screen" className="bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-white/30 text-[10px] tracking-[0.12em] font-body hover:text-white/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
        {session && (
          <select
            value={session.id}
            onChange={(e) => setSession(sessions.find((s) => s.id === e.target.value))}
            className="bg-white/5 border border-white/10 text-white text-xs font-body px-3 py-2 rounded-lg focus:outline-none"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="bg-background">
                Week {s.session_number} — {s.title}
              </option>
            ))}
          </select>
        )}
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
        <h1 className="font-display text-2xl font-bold text-white mb-8">Kids Session Planning</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Little Ones Panel */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">✦</span>
              <div>
                <h3 className="font-semibold text-white font-display">Little Ones</h3>
                <p className="text-white/40 text-xs font-body">Ages 4–11</p>
              </div>
            </div>

            {weekSuggestion && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-body text-white/30 uppercase tracking-wide mb-1">Suggested this week</p>
                <p className="text-sm text-white/70 font-body">{weekSuggestion.kids_title}</p>
                <p className="text-white/40 text-xs font-body mt-1">{weekSuggestion.kids_activity}</p>
                <button
                  className="text-xs text-white/50 mt-2 underline font-body hover:text-white/70"
                  onClick={() => setLittleOnes((p: any) => ({ ...p, lesson_theme: weekSuggestion.kids_title, activity_description: weekSuggestion.kids_activity }))}
                >
                  Use this suggestion
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Story / Film URL (YouTube)</label>
                <input className={inputClass} type="url" value={littleOnes.video_url || ""} onChange={(e) => setLittleOnes((p: any) => ({ ...p, video_url: e.target.value }))} placeholder="Paste YouTube URL — Pixar short, storybook..." />
                {littleOnes.video_url && extractVideoId(littleOnes.video_url) && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden">
                    <iframe src={`https://www.youtube.com/embed/${extractVideoId(littleOnes.video_url)}`} className="w-full h-full" allowFullScreen />
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>This week's theme</label>
                <input className={inputClass} value={littleOnes.lesson_theme || ""} onChange={(e) => setLittleOnes((p: any) => ({ ...p, lesson_theme: e.target.value }))} placeholder="e.g. Bravery, Kindness..." />
              </div>
              <div>
                <label className={labelClass}>Activity type</label>
                <select className={inputClass} value={littleOnes.activity_type || ""} onChange={(e) => setLittleOnes((p: any) => ({ ...p, activity_type: e.target.value }))}>
                  <option value="">Select...</option>
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Activity description</label>
                <textarea className={inputClass + " resize-none"} rows={3} value={littleOnes.activity_description || ""} onChange={(e) => setLittleOnes((p: any) => ({ ...p, activity_description: e.target.value }))} placeholder="What will the children do?" />
              </div>
              <div>
                <label className={labelClass}>Materials needed</label>
                <input className={inputClass} value={littleOnes.materials_needed || ""} onChange={(e) => setLittleOnes((p: any) => ({ ...p, materials_needed: e.target.value }))} placeholder="Crayons, glue, scissors..." />
              </div>
              <div>
                <label className={labelClass}>Facilitator notes (private)</label>
                <textarea className={inputClass + " resize-none"} rows={2} value={littleOnes.facilitator_notes || ""} onChange={(e) => setLittleOnes((p: any) => ({ ...p, facilitator_notes: e.target.value }))} />
              </div>
              <button onClick={() => savePanel("little_ones", littleOnes)} disabled={saving} className="w-full bg-white text-background font-display font-bold py-3 text-xs hover:bg-white/90 transition-colors disabled:opacity-30 rounded-lg">
                {saving ? "Saving..." : "Save Little Ones"}
              </button>
            </div>
          </div>

          {/* Teens Panel */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">◎</span>
              <div>
                <h3 className="font-semibold text-white font-display">Teens</h3>
                <p className="text-white/40 text-xs font-body">Ages 12–24</p>
              </div>
            </div>

            {weekSuggestion && (
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-body text-white/30 uppercase tracking-wide mb-1">Suggested this week</p>
                <p className="text-sm text-white/70 font-body">{weekSuggestion.teen_title}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelClass}>Video URL (YouTube)</label>
                <input className={inputClass} type="url" value={teens.video_url || ""} onChange={(e) => setTeens((p: any) => ({ ...p, video_url: e.target.value }))} placeholder="Paste YouTube URL..." />
                {teens.video_url && extractVideoId(teens.video_url) && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden">
                    <iframe src={`https://www.youtube.com/embed/${extractVideoId(teens.video_url)}`} className="w-full h-full" allowFullScreen />
                  </div>
                )}
              </div>
              <button onClick={analyseTeen} disabled={analysingTeen || !teens.video_url} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-xs font-body rounded-lg hover:bg-white/15 disabled:opacity-30 transition-colors">
                <Sparkles size={14} /> {analysingTeen ? "Analysing..." : "Analyse with AI — teen mode"}
              </button>
              <div>
                <label className={labelClass}>This week's theme</label>
                <input className={inputClass} value={teens.lesson_theme || ""} onChange={(e) => setTeens((p: any) => ({ ...p, lesson_theme: e.target.value }))} placeholder="e.g. Identity, Purpose..." />
              </div>
              <div>
                <label className={labelClass}>Activity type</label>
                <select className={inputClass} value={teens.activity_type || ""} onChange={(e) => setTeens((p: any) => ({ ...p, activity_type: e.target.value }))}>
                  <option value="">Select...</option>
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  <option value="Group discussion">Group discussion</option>
                  <option value="Journal prompt">Journal prompt</option>
                  <option value="Debate">Debate</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Activity description</label>
                <textarea className={inputClass + " resize-none"} rows={3} value={teens.activity_description || ""} onChange={(e) => setTeens((p: any) => ({ ...p, activity_description: e.target.value }))} placeholder="What will the teens do?" />
              </div>
              <div>
                <label className={labelClass}>Materials needed</label>
                <input className={inputClass} value={teens.materials_needed || ""} onChange={(e) => setTeens((p: any) => ({ ...p, materials_needed: e.target.value }))} placeholder="Notebooks, markers..." />
              </div>
              <div>
                <label className={labelClass}>Facilitator notes (private)</label>
                <textarea className={inputClass + " resize-none"} rows={2} value={teens.facilitator_notes || ""} onChange={(e) => setTeens((p: any) => ({ ...p, facilitator_notes: e.target.value }))} />
              </div>
              <button onClick={() => savePanel("teens", teens)} disabled={saving} className="w-full bg-white text-background font-display font-bold py-3 text-xs hover:bg-white/90 transition-colors disabled:opacity-30 rounded-lg">
                {saving ? "Saving..." : "Save Teens"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminKids;
