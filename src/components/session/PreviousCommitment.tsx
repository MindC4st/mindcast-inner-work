import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface PreviousCommitmentProps {
  sessionId: string;
  label: string;
}

const PreviousCommitment = ({ sessionId, label }: PreviousCommitmentProps) => {
  let commitment = "";
  let name = "";
  try {
    const saved = localStorage.getItem(`mindcast_session_${sessionId}_progress`);
    if (saved) {
      const data = JSON.parse(saved);
      // Find commitment key
      const commitmentKey = Object.keys(data).find((k) => data[k]?.locked && data[k]?.commitment);
      if (commitmentKey) {
        commitment = data[commitmentKey].commitment;
        name = data[commitmentKey].name;
      }
    }
  } catch {}

  if (!commitment) {
    return (
      <div className="border-2 border-cream/10 p-6 mb-4">
        <span className="text-cream/30 text-[10px] tracking-widest">{label}</span>
        <p className="text-cream/20 text-sm font-body mt-2">No commitment found. <Link to={`/session/${sessionId}`} className="underline">Complete that session first</Link></p>
      </div>
    );
  }

  return (
    <div className="border-2 border-cream/20 bg-cream/5 p-6 mb-4">
      <span className="text-cream/40 text-[10px] tracking-[0.2em]">{label}</span>
      <p className="text-cream/70 font-body text-sm mt-2 italic">"{commitment}"</p>
      <p className="text-cream/30 text-xs mt-1">— {name}</p>
    </div>
  );
};

export default PreviousCommitment;
