import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ClipboardCopy, List, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import ReflectionTextBox from "@/components/session/ReflectionTextBox";
import DragDropSorting from "@/components/session/DragDropSorting";
import ConnectPairs from "@/components/session/ConnectPairs";
import RateScale from "@/components/session/RateScale";
import MultipleChoiceReflection from "@/components/session/MultipleChoiceReflection";
import WordPhraseBuilder from "@/components/session/WordPhraseBuilder";
import CommitmentCard from "@/components/session/CommitmentCard";
import IcebergReveal from "@/components/session/IcebergReveal";
import TrustThermometer from "@/components/session/TrustThermometer";
import SeriesNav from "@/components/session/SeriesNav";
import PreviousCommitment from "@/components/session/PreviousCommitment";
import SeriesFinale from "@/components/session/SeriesFinale";
import { SessionData, SessionActivity } from "@/data/sessionTypes";
import { trust1, trust2, trust3 } from "@/data/trustSessions";

// Communication Reset session
const communicationReset: SessionData = {
  id: "communication-reset",
  title: "COMMUNICATION RESET",
  subtitle: "NOTICE. NAME. REWIRE.",
  duration: "90 MINUTES",
  sessionNumber: "SESSION 01",
  sections: [
    {
      id: "arrive", header: "ARRIVE", sub: "Before we begin — a moment to land.", duration: "5 MIN",
      activities: [
        { type: "scale", key: "arrive-present", statement: "How present do I feel right now?", minLabel: "SCATTERED", maxLabel: "FULLY HERE" },
        { type: "scale", key: "arrive-safe", statement: "How safe do I feel in this space?", minLabel: "GUARDED", maxLabel: "OPEN" },
      ],
    },
    {
      id: "notice", header: "NOTICE", sub: "The facilitator will guide you through this section.", duration: "20 MIN",
      activities: [
        { type: "reflection", key: "notice-conversation", prompt: "Think of a recent conversation that didn't go the way you hoped. What happened?" },
        { type: "reflection", key: "notice-emotion", prompt: "What emotion showed up for you in that moment?" },
        { type: "multipleChoice", key: "notice-conflict", question: "In conflict, I tend to:", options: ["GO QUIET", "GET LOUD", "PEOPLE-PLEASE", "INTELLECTUALISE", "LEAVE THE ROOM"] },
      ],
    },
    {
      id: "name", header: "NAME", sub: "Giving language to what's underneath.", duration: "25 MIN",
      activities: [
        { type: "connectPairs", key: "name-pairs", instruction: "Match each emotion to what it might be telling you", left: ["Anger", "Sadness", "Fear", "Shame", "Overwhelm"], right: ["A boundary was crossed", "A loss occurred", "Something feels threatening", "I believe I'm not enough", "Too much is being asked"], correct: [["Anger", "A boundary was crossed"], ["Sadness", "A loss occurred"], ["Fear", "Something feels threatening"], ["Shame", "I believe I'm not enough"], ["Overwhelm", "Too much is being asked"]] },
        { type: "phraseBuilder", key: "name-feeling", template: "The feeling underneath my reaction was ________." },
        { type: "phraseBuilder", key: "name-need", template: "What I actually needed in that moment was ________." },
        { type: "phraseBuilder", key: "name-wish", template: "What I wish I had said was ________." },
      ],
    },
    {
      id: "sort", header: "WHAT CONNECTS AND WHAT CREATES DISTANCE?", duration: "15 MIN",
      activities: [
        { type: "dragDrop", key: "sort-communication", instruction: "Sort these communication styles into the correct column", cards: ["Blame", "Curiosity", "Listening to respond", "Listening to understand", "Stonewalling", "Naming your feeling", "Criticism", "Saying I need...", "Shutting down", "Staying in your body"], columns: [{ id: "connects", label: "BUILDS CONNECTION", correct: ["Curiosity", "Listening to understand", "Naming your feeling", "Saying I need...", "Staying in your body"] }, { id: "distance", label: "CREATES DISTANCE", correct: ["Blame", "Listening to respond", "Stonewalling", "Criticism", "Shutting down"] }] },
      ],
    },
    {
      id: "rewire", header: "REWIRE", sub: "One deliberate choice this week.", duration: "15 MIN",
      activities: [
        { type: "reflection", key: "rewire-different", prompt: "Based on tonight, what is one thing you want to do differently in a conversation this week?" },
        { type: "reflection", key: "rewire-who", prompt: "Who is this conversation with, and when will you have it?" },
        { type: "scale", key: "rewire-ready", statement: "How ready do I feel to have this conversation?", minLabel: "NOT READY", maxLabel: "READY" },
      ],
    },
    {
      id: "commit", header: "YOUR COMMITMENT", duration: "5 MIN",
      activities: [{ type: "commitment", key: "commitment", stem: "Before next Sunday, I will..." }],
    },
  ],
};

const sessions: Record<string, SessionData> = {
  "communication-reset": communicationReset,
  "trust-1": trust1,
  "trust-2": trust2,
  "trust-3": trust3,
};

// Check if a trust series session is complete
const isSessionComplete = (sessionId: string): boolean => {
  try {
    const saved = localStorage.getItem(`mindcast_session_${sessionId}_progress`);
    if (!saved) return false;
    const data = JSON.parse(saved);
    return Object.values(data).some((v: any) => v?.locked || v?.sealed);
  } catch { return false; }
};

const renderActivity = (activity: SessionActivity, progress: Record<string, any>, saveField: (key: string, value: any) => void) => {
  switch (activity.type) {
    case "reflection":
      return <ReflectionTextBox key={activity.key} prompt={activity.prompt} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key] || ""} />;
    case "scale":
      return <RateScale key={activity.key} statement={activity.statement} minLabel={activity.minLabel} maxLabel={activity.maxLabel} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "multipleChoice":
      return <MultipleChoiceReflection key={activity.key} question={activity.question} options={activity.options} multiSelect={activity.multiSelect} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "connectPairs":
      return <ConnectPairs key={activity.key} instruction={activity.instruction} leftItems={activity.left} rightItems={activity.right} correctPairs={activity.correct} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "dragDrop":
      return <DragDropSorting key={activity.key} instruction={activity.instruction} cards={activity.cards} columns={activity.columns} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "phraseBuilder":
      return <WordPhraseBuilder key={activity.key} template={activity.template} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "commitment":
      return <CommitmentCard key={activity.key} stem={activity.stem} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "iceberg":
      return <IcebergReveal key={activity.key} aboveLabel={activity.aboveLabel} belowLabel={activity.belowLabel} cards={activity.cards} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "thermometer":
      return <TrustThermometer key={activity.key} title={activity.title} thermometers={activity.thermometers} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    case "previousCommitment":
      return <PreviousCommitment key={activity.key} sessionId={activity.sessionId} label={activity.label} />;
    case "seriesFinale":
      return <SeriesFinale key={activity.key} lines={activity.lines} storageKey={activity.key} onSave={(v) => saveField(activity.key, v)} initialValue={progress[activity.key]} />;
    default:
      return null;
  }
};

const Session = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = sessions[sessionId || ""];
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [showProgress, setShowProgress] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [completed, setCompleted] = useState(false);

  const storageKey = `mindcast_session_${sessionId}_progress`;

  useEffect(() => {
    setCurrentSection(0);
    setCompleted(false);
    setProgress({});
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress(parsed);
        setShowWelcomeBack(true);
        setTimeout(() => setShowWelcomeBack(false), 3000);
      } catch {}
    }
  }, [storageKey]);

  const saveField = (key: string, value: any) => {
    setProgress((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="section-navy min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="heading-display text-5xl text-cream mb-4">SESSION NOT FOUND</h1>
            <Link to="/" className="btn-outlined text-xs">RETURN HOME</Link>
          </div>
        </div>
      </>
    );
  }

  const sect = session.sections[currentSection];
  const isLast = currentSection === session.sections.length - 1;

  // Check trust series completion
  const trustSeriesComplete = isSessionComplete("trust-1") && isSessionComplete("trust-2") && isSessionComplete("trust-3");

  const downloadNotes = () => {
    let notes = `${session.title}\n${session.subtitle}\n${"=".repeat(40)}\n\n`;
    session.sections.forEach((section) => {
      notes += `\n--- ${section.header} ---\n\n`;
      section.activities.forEach((activity) => {
        const val = progress[activity.key];
        if (!val) return;
        if (activity.type === "reflection") notes += `${activity.prompt}\n→ ${val}\n\n`;
        else if (activity.type === "scale") notes += `${activity.statement}\n→ ${val}/10\n\n`;
        else if (activity.type === "multipleChoice") notes += `${activity.question}\n→ ${val.selected?.join(", ")}\n${val.reason ? `Why: ${val.reason}\n` : ""}\n`;
        else if (activity.type === "phraseBuilder") notes += `→ ${(val as string[]).join(", ")}\n\n`;
        else if (activity.type === "commitment") notes += `${activity.stem}\n→ ${val.commitment}\n— ${val.name}\n\n`;
        else if (activity.type === "seriesFinale" && val.sealed) notes += `Declaration:\n${val.values.join("\n")}\n— ${val.name}\n\n`;
      });
    });
    navigator.clipboard.writeText(notes);
  };

  if (completed) {
    return (
      <>
        <Navbar />
        <div className="section-navy min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <h1 className="heading-display text-4xl md:text-6xl mb-4">YOU'VE COMPLETED TONIGHT'S SESSION</h1>
              <p className="text-cream/50 text-sm">{session.title} — {session.subtitle}</p>
            </motion.div>

            <div className="space-y-4 mb-12">
              {session.sections.map((section) => (
                <div key={section.id} className="border-2 border-cream/10 p-6">
                  <h3 className="font-display text-lg tracking-widest text-cream mb-4">{section.header}</h3>
                  {section.activities.map((activity) => {
                    const val = progress[activity.key];
                    if (!val) return null;
                    return (
                      <div key={activity.key} className="mb-3 text-cream/50 text-sm font-body">
                        {activity.type === "reflection" && <><p className="text-cream/30 text-xs mb-1">{activity.prompt}</p><p>"{val}"</p></>}
                        {activity.type === "scale" && <><p className="text-cream/30 text-xs mb-1">{activity.statement}</p><p>{val}/10</p></>}
                        {activity.type === "multipleChoice" && <><p className="text-cream/30 text-xs mb-1">{activity.question}</p><p>{val.selected?.join(", ")}</p></>}
                        {activity.type === "commitment" && val.locked && <p className="text-cream font-display text-lg">"{val.commitment}" — {val.name}</p>}
                        {activity.type === "seriesFinale" && val.sealed && <p className="text-cream font-display text-lg">Declaration sealed ✓</p>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={downloadNotes} className="btn-filled text-xs w-full py-4 flex items-center justify-center gap-2">
                <ClipboardCopy size={14} /> COPY MY NOTES
              </button>

              {session.nextSession && (
                <Link to={session.nextSession.path} className="btn-outlined text-xs w-full py-4 text-center">
                  {session.nextSession.label}
                </Link>
              )}

              {session.id === "trust-3" && (
                <>
                  {trustSeriesComplete && (
                    <div className="border-2 border-cream/20 bg-cream/5 p-6 text-center">
                      <span className="text-cream/50 text-[10px] tracking-[0.3em]">🛡 TRUST SERIES COMPLETE</span>
                    </div>
                  )}
                  <Link to="/portal" className="btn-outlined text-xs w-full py-4 text-center">RETURN TO PORTAL</Link>
                  <div className="border border-cream/10 p-6 text-center">
                    <span className="text-cream/30 text-[10px] tracking-[0.3em]">NEXT SERIES: BOUNDARIES — COMING SOON</span>
                  </div>
                </>
              )}

              {!session.nextSession && session.id !== "trust-3" && (
                <Link to="/portal" className="btn-outlined text-xs w-full py-4 text-center">RETURN TO PORTAL</Link>
              )}
            </div>

            <p className="text-center text-cream/30 text-xs tracking-widest mt-12">
              {session.id === "trust-3" ? "SERIES COMPLETE — EXPLORE WHAT'S NEXT" : "SEE YOU NEXT SUNDAY"}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b-2 border-cream/10" style={{ background: "hsl(210,56%,14%)" }}>
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="font-display text-lg tracking-widest text-cream">MINDCAST</Link>
          <div className="hidden md:block text-center">
            <span className="text-cream/40 text-[10px] tracking-widest">
              SECTION {currentSection + 1} OF {session.sections.length} — {sect.header}
            </span>
          </div>
          <button onClick={() => setShowProgress(true)} className="text-[10px] py-1 px-3 flex items-center gap-1 border border-cream/20 text-cream/60 hover:text-cream transition-colors tracking-widest">
            <List size={12} /> PROGRESS
          </button>
        </div>
      </div>

      {/* Section progress bar */}
      <div className="fixed top-14 left-0 right-0 z-40 border-b border-cream/5 px-4 py-2" style={{ background: "hsla(210,56%,14%,0.95)" }}>
        <div className="container mx-auto flex gap-2 overflow-x-auto">
          {session.sections.map((s, i) => (
            <button key={s.id} onClick={() => setCurrentSection(i)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[10px] tracking-widest whitespace-nowrap border transition-colors ${i === currentSection ? "border-cream bg-cream/10 text-cream" : i < currentSection ? "border-cream/20 text-cream/40" : "border-cream/10 text-cream/20"}`}>
              {i < currentSection && <Check size={10} />}
              {s.header.length > 15 ? s.header.slice(0, 15) + "…" : s.header}
            </button>
          ))}
        </div>
      </div>

      {/* Welcome back banner */}
      <AnimatePresence>
        {showWelcomeBack && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-cream text-navy px-6 py-3 text-xs tracking-widest">
            WELCOME BACK — YOUR PROGRESS IS SAVED
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="section-navy min-h-screen pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Series nav */}
          {session.series && currentSection === 0 && (
            <SeriesNav seriesTitle={session.series.title} sessions={session.series.sessions} currentSessionId={session.id} />
          )}

          {/* Session info on first section */}
          {currentSection === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
              <span className="text-cream/30 text-[10px] tracking-widest">{session.sessionNumber} — {session.duration}</span>
              <h1 className="heading-display text-4xl md:text-6xl mt-2 mb-2">{session.title}</h1>
              <p className="text-cream/40 text-xs tracking-widest">{session.subtitle}</p>
            </motion.div>
          )}

          {/* Section content */}
          <AnimatePresence mode="wait">
            <motion.div key={sect.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="heading-display text-3xl md:text-5xl">{sect.header}</h2>
                  {sect.duration && <span className="text-cream/20 text-[10px] tracking-widest border border-cream/10 px-2 py-1">{sect.duration}</span>}
                </div>
                {sect.sub && <p className="text-cream/50 text-sm font-body">{sect.sub}</p>}
              </div>

              <div className="space-y-6">
                {sect.activities.map((activity) => renderActivity(activity, progress, saveField))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-12 pt-6 border-t border-cream/10">
                <button onClick={() => setCurrentSection((p) => Math.max(0, p - 1))} disabled={currentSection === 0}
                  className="btn-outlined text-xs py-3 px-6 flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ArrowLeft size={14} /> BACK
                </button>
                {isLast ? (
                  <button onClick={() => setCompleted(true)} className="btn-filled text-xs py-3 px-6 flex items-center gap-2">
                    COMPLETE SESSION <Check size={14} />
                  </button>
                ) : (
                  <button onClick={() => setCurrentSection((p) => Math.min(session.sections.length - 1, p + 1))}
                    className="btn-filled text-xs py-3 px-6 flex items-center gap-2">
                    NEXT SECTION <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress panel */}
      {showProgress && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-primary/60" onClick={() => setShowProgress(false)} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} className="relative w-full max-w-md bg-primary border-l-2 border-cream/20 h-full overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl tracking-widest">MY PROGRESS</h2>
              <button onClick={() => setShowProgress(false)}><X size={24} className="text-cream" /></button>
            </div>
            {session.sections.map((section) => (
              <div key={section.id} className="mb-6">
                <h3 className="font-display text-sm tracking-widest text-cream/40 mb-3">{section.header}</h3>
                {section.activities.map((activity) => {
                  const val = progress[activity.key];
                  if (!val || activity.type === "previousCommitment") return <p key={activity.key} className="text-cream/20 text-xs mb-2">—</p>;
                  return (
                    <div key={activity.key} className="text-cream/60 text-xs font-body mb-2 pl-3 border-l border-cream/10">
                      {activity.type === "reflection" && <p>"{String(val).slice(0, 80)}{String(val).length > 80 ? "..." : ""}"</p>}
                      {activity.type === "scale" && <p>{val}/10</p>}
                      {activity.type === "multipleChoice" && <p>{val.selected?.join(", ")}</p>}
                      {activity.type === "commitment" && <p>{val.commitment ? `"${val.commitment}"` : "—"}</p>}
                      {activity.type === "phraseBuilder" && <p>{(val as string[]).filter(Boolean).join(", ") || "—"}</p>}
                      {activity.type === "iceberg" && <p>{Object.values(val).filter(Boolean).length} cards revealed</p>}
                      {activity.type === "thermometer" && <p>Thermometers set</p>}
                      {activity.type === "seriesFinale" && <p>{val.sealed ? "Declaration sealed ✓" : "In progress..."}</p>}
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Session;
