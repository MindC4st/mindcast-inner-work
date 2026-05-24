import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

type LiveState = {
  week: number;
  audience: string;
  slide: number;
  promptType: "journaling" | "reflection" | "idle";
  promptText: string;
  title: string;
};

const LiveJoin = () => {
  const { code } = useParams();
  const sessionCode = (code || "").toUpperCase();
  const [name, setName] = useState(() => localStorage.getItem("mc_live_name") || "");
  const [joined, setJoined] = useState(false);
  const [showName, setShowName] = useState(true);
  const [shareOnScreen, setShareOnScreen] = useState(true);
  const [response, setResponse] = useState("");
  const [state, setState] = useState<LiveState | null>(null);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!joined) return;
    const ch = supabase.channel(`live:${sessionCode}`, { config: { broadcast: { self: true } } });
    ch.on("broadcast", { event: "state" }, ({ payload }) => {
      setState(payload as LiveState);
      // Reset submitted lock if facilitator moves to a different prompt
      setSubmittedFor(prev => prev === `${payload.slide}` ? prev : null);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [joined, sessionCode]);

  const join = () => {
    if (name.trim().length < 1) { toast({ title: "Please enter a name" }); return; }
    localStorage.setItem("mc_live_name", name.trim());
    setJoined(true);
  };

  const submit = async () => {
    if (!state || !response.trim()) return;
    setSubmitting(true);
    const { error } = await (supabase as any).from("session_responses").insert({
      session_code: sessionCode,
      week_number: state.week,
      audience_type: state.audience,
      display_name: showName ? name.trim() : "Anonymous",
      response_text: response.trim().slice(0, 300),
      prompt_type: state.promptType,
      is_public: shareOnScreen,
      show_name: showName,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Couldn't submit", description: error.message }); return; }
    setSubmittedFor(`${state.slide}`);
    setResponse("");
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.5em] font-body uppercase mb-3 text-center">Mindcast LIVE</p>
          <h1 className="font-display text-5xl tracking-wider text-[hsl(var(--navy))] mb-1 text-center">JOIN SESSION</h1>
          <p className="text-center text-[hsl(var(--navy-mid))] font-body text-sm mb-8 tracking-widest">CODE · <span className="text-[hsl(var(--blue))] font-bold">{sessionCode}</span></p>
          <label className="block text-[hsl(var(--navy))] text-xs font-body tracking-widest uppercase mb-2">Your name</label>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && join()}
            placeholder="First name or initials"
            className="w-full px-4 py-3 border border-[hsl(var(--warm-border))] rounded-sm font-body text-[hsl(var(--navy))] focus:outline-none focus:border-[hsl(var(--blue))]" />
          <button onClick={join} className="w-full mt-4 bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] text-white font-body text-sm tracking-widest uppercase py-3 rounded-sm transition-colors">
            Join
          </button>
          <p className="text-center text-[hsl(var(--navy-mid))]/60 text-[10px] mt-6 font-body">You'll see the facilitator's reflection prompts here when they appear.</p>
        </div>
      </div>
    );
  }

  const activePrompt = state && (state.promptType === "journaling" || state.promptType === "reflection");
  const alreadySubmitted = submittedFor === `${state?.slide}`;

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] px-6 py-8" style={{ paddingTop: "max(2rem, env(safe-area-inset-top))", paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase">Mindcast LIVE</p>
            <p className="font-display text-2xl text-[hsl(var(--navy))] tracking-wider">{sessionCode}</p>
          </div>
          <div className="text-right">
            <p className="text-[hsl(var(--navy-mid))]/60 text-[10px] tracking-widest font-body uppercase">You</p>
            <p className="font-body text-sm text-[hsl(var(--navy))]">{name}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!state ? (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <div className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--blue))] animate-pulse mb-4" />
              <p className="text-[hsl(var(--navy-mid))] text-sm font-body">Connected. Waiting for facilitator...</p>
            </motion.div>
          ) : !activePrompt ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16">
              <p className="text-[hsl(var(--navy-mid))]/60 text-[10px] tracking-widest font-body uppercase mb-3">Now showing</p>
              <p className="font-display text-3xl text-[hsl(var(--navy))] tracking-wider mb-2">{state.title}</p>
              <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm">A prompt will appear when it's time to share.</p>
            </motion.div>
          ) : alreadySubmitted ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border border-[hsl(var(--blue))]/30 rounded-sm bg-white">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--blue))]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="text-[hsl(var(--blue))]" size={24} />
              </div>
              <p className="font-display text-xl text-[hsl(var(--navy))] tracking-wider">SUBMITTED</p>
              <p className="text-[hsl(var(--navy-mid))]/70 font-body text-sm mt-1">Thank you.</p>
            </motion.div>
          ) : (
            <motion.div key={`prompt-${state.slide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-[hsl(var(--bronze))] text-[10px] tracking-[0.4em] font-body uppercase mb-3">Reflect</p>
              <p className="font-serif italic text-2xl text-[hsl(var(--navy))] leading-snug mb-6">"{state.promptText}"</p>
              <textarea value={response} onChange={e => setResponse(e.target.value.slice(0, 300))}
                placeholder="Type your response..."
                rows={5}
                className="w-full px-4 py-3 border border-[hsl(var(--warm-border))] rounded-sm font-body text-[hsl(var(--navy))] resize-none focus:outline-none focus:border-[hsl(var(--blue))]" />
              <div className="flex justify-between text-[10px] text-[hsl(var(--navy-mid))]/60 font-body mt-1 mb-4">
                <span>{response.length}/300</span>
              </div>

              <div className="space-y-2 mb-5">
                <Toggle label="Share on screen" value={shareOnScreen} onChange={setShareOnScreen} />
                <Toggle label="Show my name" value={showName} onChange={setShowName} />
              </div>

              <button onClick={submit} disabled={!response.trim() || submitting}
                className="w-full bg-[hsl(var(--blue))] hover:bg-[hsl(var(--navy))] disabled:opacity-40 text-white font-body text-sm tracking-widest uppercase py-3 rounded-sm transition-colors">
                {submitting ? "Sending..." : "Submit"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-[hsl(var(--warm-border))] rounded-sm">
    <span className="text-[hsl(var(--navy))] font-body text-sm">{label}</span>
    <span className={`w-9 h-5 rounded-full relative transition-colors ${value ? "bg-[hsl(var(--blue))]" : "bg-[hsl(var(--warm-border))]"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
    </span>
  </button>
);

export default LiveJoin;
