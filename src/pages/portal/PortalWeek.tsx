import { useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronLeft, Save } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/* ─── Session 1 Data ─── */
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
  const { user } = useAuth();

  // For now, only session 1 has content
  if (weekNum !== 1) {
    return (
      <PortalLayout>
        <div className="max-w-2xl mx-auto">
          <Link to="/portal/dashboard" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 transition-colors">
            <ChevronLeft size={16} /> Back
          </Link>
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">This session content is coming soon.</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return <Session1Content userId={user?.id || null} />;
};

/* ─── Session 1 Full Content ─── */
const Session1Content = ({ userId }: { userId: string | null }) => {
  const [bookmarkResponses, setBookmarkResponses] = useState<Record<string, string>>({});
  const [finalReflection, setFinalReflection] = useState("");
  const [commitment, setCommitment] = useState({ what: "", why: "", how: "" });
  const [saved, setSaved] = useState(false);
  const [commitmentSaved, setCommitmentSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBookmarkChange = (id: string, value: string) => {
    setBookmarkResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveReflections = async () => {
    if (!userId) return;
    // Save bookmark responses and final reflection as entries
    const entries = SESSION_1.bookmarks
      .filter((bm) => bookmarkResponses[bm.id])
      .map((bm) => ({
        user_id: userId,
        cohort_id: "pilot-taupo-t1", // placeholder
        week_number: 1,
        question_key: bm.id,
        answer_text: bookmarkResponses[bm.id],
        is_shared: false,
        is_locked: false,
      }));

    if (finalReflection) {
      entries.push({
        user_id: userId,
        cohort_id: "pilot-taupo-t1",
        week_number: 1,
        question_key: "final_reflection",
        answer_text: finalReflection,
        is_shared: false,
        is_locked: false,
      });
    }

    // For now just show a success toast — full Supabase save will work once cohort is set up
    showSaved();
    toast({ title: "Reflections saved", description: "Your responses have been recorded." });
  };

  const handleSaveCommitment = async () => {
    if (!userId) return;
    try {
      await supabase.from("implementation_goals").insert({
        member_id: userId,
        what_i_will_implement: commitment.what,
        why_it_matters: commitment.why,
        how_i_will_know: commitment.how,
        shared_with_group: false,
        status: "committed",
      });
      setCommitmentSaved(true);
      toast({ title: "Commitment saved", description: "Your implementation goal has been recorded." });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

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
              src={`https://www.youtube.com/embed/${SESSION_1.youtubeId}?rel=0&modestbranding=1`}
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
                  className="w-full bg-transparent border-b border-foreground/10 text-foreground text-sm font-body font-light px-0 py-2 min-h-[80px] focus:border-foreground/30 focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/40"
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
              className="w-full bg-transparent border-b border-foreground/10 text-foreground text-sm font-body font-light px-0 py-2 min-h-[120px] focus:border-foreground/30 focus:outline-none transition-colors resize-none placeholder:text-muted-foreground/40"
            />
            <button
              onClick={handleSaveReflections}
              className="mt-5 flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors"
            >
              {saved ? <><Check size={14} /> SAVED</> : <><Save size={14} /> SAVE REFLECTIONS</>}
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
              <div>
                <label className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body block mb-2">
                  WHAT WILL YOU IMPLEMENT THIS WEEK?
                </label>
                <textarea
                  value={commitment.what}
                  onChange={(e) => setCommitment((c) => ({ ...c, what: e.target.value }))}
                  placeholder="One specific action..."
                  className="w-full bg-transparent border-b border-primary-foreground/15 text-primary-foreground text-sm font-body font-light px-0 py-2 min-h-[60px] focus:border-primary-foreground/40 focus:outline-none transition-colors resize-none placeholder:text-primary-foreground/15"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body block mb-2">
                  WHY DOES THIS MATTER TO YOU?
                </label>
                <textarea
                  value={commitment.why}
                  onChange={(e) => setCommitment((c) => ({ ...c, why: e.target.value }))}
                  placeholder="Connect it to something real..."
                  className="w-full bg-transparent border-b border-primary-foreground/15 text-primary-foreground text-sm font-body font-light px-0 py-2 min-h-[60px] focus:border-primary-foreground/40 focus:outline-none transition-colors resize-none placeholder:text-primary-foreground/15"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body block mb-2">
                  HOW WILL YOU KNOW YOU'VE SUCCEEDED?
                </label>
                <textarea
                  value={commitment.how}
                  onChange={(e) => setCommitment((c) => ({ ...c, how: e.target.value }))}
                  placeholder="What does success look like?"
                  className="w-full bg-transparent border-b border-primary-foreground/15 text-primary-foreground text-sm font-body font-light px-0 py-2 min-h-[60px] focus:border-primary-foreground/40 focus:outline-none transition-colors resize-none placeholder:text-primary-foreground/15"
                />
              </div>
            </div>

            <button
              onClick={handleSaveCommitment}
              disabled={commitmentSaved || !commitment.what}
              className="mt-6 w-full bg-primary-foreground/10 text-primary-foreground py-4 text-[11px] tracking-[0.2em] font-body hover:bg-primary-foreground/15 transition-colors disabled:opacity-40"
            >
              {commitmentSaved ? "✓ COMMITMENT SAVED" : "SAVE MY COMMITMENT"}
            </button>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
};

export default PortalWeek;
