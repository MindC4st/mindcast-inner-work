import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import logoWhite from "@/assets/logo-white.png";
import { Check } from "lucide-react";

/* ---------- sub-views ---------- */

function AttendanceCheckIn({ session }: { session: any }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [showOnScreen, setShowOnScreen] = useState(true);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("display_name, show_attendance_on_screen").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setName(data.display_name || "");
            setShowOnScreen(data.show_attendance_on_screen ?? true);
          }
        });
    }
  }, [user]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("check_ins").insert({
      session_id: session.id,
      display_name: name.trim(),
      is_anonymous: !showOnScreen,
      profile_id: user ? undefined : undefined,
      share_goal_publicly: showOnScreen,
    });
    setDone(true);
    setSaving(false);
  };

  if (done) return (
    <div className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
        <Check className="text-accent" size={28} />
      </motion.div>
      <p className="text-foreground font-semibold text-lg">Welcome.</p>
      <p className="text-muted-foreground text-sm mt-1">See you on screen.</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-foreground text-2xl font-bold mb-8">You're here.</h2>
      <label className="block text-muted-foreground text-xs tracking-wider uppercase mb-2">Display name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name or nickname" className="input-underline mb-6" autoFocus />
      <label className="flex items-center gap-3 mb-8 cursor-pointer">
        <input type="checkbox" checked={showOnScreen} onChange={(e) => setShowOnScreen(e.target.checked)} className="w-4 h-4 rounded accent-accent" />
        <span className="text-muted-foreground text-sm">Show my name on the welcome screen</span>
      </label>
      <button onClick={submit} disabled={!name.trim() || saving} className="w-full py-4 bg-foreground text-background font-semibold text-sm rounded-xl disabled:opacity-30">
        {saving ? "..." : "Check in →"}
      </button>
    </div>
  );
}

function SuccessStoryForm({ session }: { session: any }) {
  const { user } = useAuth();
  const [goal, setGoal] = useState("");
  const [story, setStory] = useState("");
  const [showName, setShowName] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => { if (data) setDisplayName(data.display_name || ""); });
    }
  }, [user]);

  const submit = async () => {
    if (!story.trim()) return;
    setSaving(true);
    try {
      const { data: modResult } = await supabase.functions.invoke("moderate-content", {
        body: { text: story, context: "community success story" },
      });

      let status = "pending";
      if (modResult?.approved) status = "approved";
      else if (modResult?.flagged) status = "flagged";

      await supabase.from("story_submissions").insert({
        session_id: session.id,
        display_name: displayName || "Anonymous",
        show_name: showName,
        last_week_goal: goal || null,
        success_story: story,
        status,
        ai_flagged: modResult?.flagged || false,
        ai_flag_reason: modResult?.reason || null,
      });

      setDone(true);
      setMessage(status === "approved" ? "Your story has been submitted. ✓" : "Your story has been submitted for review. It will appear shortly.");
    } catch {
      setMessage("Submitted — it will appear shortly.");
      setDone(true);
    }
    setSaving(false);
  };

  if (done) return (
    <div className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
        <Check className="text-accent" size={28} />
      </motion.div>
      <p className="text-foreground font-semibold">{message}</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-foreground text-xl font-bold mb-2">Last week's goal:</h2>
      <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What goal did you set last week?" className="input-underline mb-6 min-h-[60px]" />
      <h2 className="text-foreground text-xl font-bold mb-2">How did it go?</h2>
      <textarea value={story} onChange={(e) => setStory(e.target.value.slice(0, 280))} placeholder="Share your success, struggle, or what you learned..." className="input-underline mb-1 min-h-[80px]" />
      <p className="text-muted-foreground/50 text-xs text-right mb-6">{story.length}/280</p>
      <label className="flex items-center gap-3 mb-6 cursor-pointer">
        <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="w-4 h-4 rounded accent-accent" />
        <span className="text-muted-foreground text-sm">Show my name with this post</span>
      </label>
      {!displayName && (
        <>
          <label className="block text-muted-foreground text-xs tracking-wider uppercase mb-2">Your name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="First name" className="input-underline mb-6" />
        </>
      )}
      <button onClick={submit} disabled={!story.trim() || saving} className="w-full py-4 bg-foreground text-background font-semibold text-sm rounded-xl disabled:opacity-30">
        {saving ? "Submitting..." : "Share with the group →"}
      </button>
    </div>
  );
}

function VideoQuestionResponse({ session }: { session: any }) {
  const [pausePoints, setPausePoints] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  useEffect(() => {
    supabase.from("session_pause_points").select("*").eq("session_id", session.id).order("position")
      .then(({ data }) => setPausePoints(data || []));
  }, [session.id]);

  const saveResponse = (position: number) => {
    const text = responses[position];
    if (!text) return;
    localStorage.setItem(`mindcast_q${position}_${session.id}`, text);
    setSaved((s) => ({ ...s, [position]: true }));
  };

  if (pausePoints.length === 0) return (
    <div className="text-center">
      <p className="text-muted-foreground text-sm">Waiting for the next reflection moment...</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm space-y-6">
      <h2 className="text-foreground text-xl font-bold">Pause — a question for you:</h2>
      {pausePoints.map((pp) => (
        <div key={pp.id} className="border border-border/10 rounded-xl p-4">
          <p className="text-foreground text-sm font-medium mb-3">{pp.question_text}</p>
          <textarea
            value={responses[pp.position] || ""}
            onChange={(e) => setResponses((r) => ({ ...r, [pp.position]: e.target.value }))}
            placeholder="Your thoughts..."
            className="input-underline min-h-[60px] mb-3"
          />
          <button
            onClick={() => saveResponse(pp.position)}
            disabled={saved[pp.position]}
            className="text-xs text-accent font-medium disabled:text-muted-foreground"
          >
            {saved[pp.position] ? "Saved ✓" : "Save to my workbook"}
          </button>
        </div>
      ))}
    </div>
  );
}

function WorkbookLink() {
  return (
    <div className="text-center">
      <h2 className="text-foreground text-2xl font-bold mb-2">Reflection time.</h2>
      <p className="text-muted-foreground text-sm mb-8">Open your workbook to continue.</p>
      <a href="/workbook" className="inline-block py-4 px-8 bg-foreground text-background font-semibold text-sm rounded-xl">
        Open my workbook →
      </a>
      <p className="text-muted-foreground/50 text-xs mt-6">Not a member?</p>
      <a href="/membership" className="text-accent text-xs">Join Mindcast to save your reflections</a>
    </div>
  );
}

function WordSubmission({ session }: { session: any }) {
  const [word, setWord] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const clean = word.trim();
    if (!clean || clean.includes(" ")) return;
    setSaving(true);
    await supabase.from("word_submissions").insert({
      session_id: session.id,
      word: clean,
    });
    setDone(true);
    setSaving(false);
  };

  if (done) return (
    <div className="text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
        <Check className="text-accent" size={28} />
      </motion.div>
      <p className="text-foreground font-semibold">Your word has been added. ✓</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm text-center">
      <h2 className="text-foreground text-2xl font-bold mb-2">One word.</h2>
      <p className="text-muted-foreground text-sm mb-8">How are you leaving tonight?</p>
      <input
        value={word}
        onChange={(e) => setWord(e.target.value.slice(0, 20))}
        placeholder="One word..."
        className="w-full text-center text-xl font-medium bg-transparent border-b-2 border-border/20 py-4 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent transition-colors"
        autoFocus
      />
      {word.includes(" ") && <p className="text-destructive text-xs mt-2">Just one word!</p>}
      <button
        onClick={submit}
        disabled={!word.trim() || word.includes(" ") || saving}
        className="w-full mt-6 py-4 bg-foreground text-background font-semibold text-sm rounded-xl disabled:opacity-30"
      >
        {saving ? "..." : "Add to the cloud →"}
      </button>
    </div>
  );
}

/* ---------- main hub ---------- */

const JoinSession = () => {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    const fetchSession = async () => {
      const { data } = await supabase.from("sessions").select("*").eq("session_code", code.toUpperCase()).eq("status", "active").maybeSingle();
      if (data) setSession(data);
      else setError("Session not found or has ended.");
      setLoading(false);
    };
    fetchSession();
    const interval = setInterval(async () => {
      const { data } = await supabase.from("sessions").select("active_slide").eq("session_code", code.toUpperCase()).eq("status", "active").maybeSingle();
      if (data) setSession((s: any) => s ? { ...s, active_slide: data.active_slide } : s);
    }, 5000);
    return () => clearInterval(interval);
  }, [code]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="text-muted-foreground text-xs animate-pulse tracking-widest">LOADING...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <img src={logoWhite} alt="Mindcast" className="h-8 mb-6" />
      <p className="text-muted-foreground text-sm">{error}</p>
      <a href="/join" className="text-accent text-xs mt-4">Try another code</a>
    </div>
  );

  const slide = session?.active_slide || 1;

  const renderView = () => {
    switch (slide) {
      case 1: return <AttendanceCheckIn session={session} />;
      case 2: return <SuccessStoryForm session={session} />;
      case 3: return <VideoQuestionResponse session={session} />;
      case 4: return <WorkbookLink />;
      case 5: return <WordSubmission session={session} />;
      default: return <AttendanceCheckIn session={session} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      <img src={logoWhite} alt="Mindcast" className="h-6 mb-8" />
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full flex justify-center"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <p className="text-muted-foreground/30 text-[10px] mt-10 font-mono tracking-widest">
        SESSION {session.session_code}
      </p>
    </div>
  );
};

export default JoinSession;
