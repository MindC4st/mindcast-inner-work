import { useState } from "react";
import { Lock, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface CommitmentCardProps {
  stem: string;
  storageKey: string;
  onSave: (value: { commitment: string; name: string; locked: boolean }) => void;
  initialValue?: { commitment: string; name: string; locked: boolean };
}

const CommitmentCard = ({ stem, storageKey, onSave, initialValue }: CommitmentCardProps) => {
  const [commitment, setCommitment] = useState(initialValue?.commitment || "");
  const [name, setName] = useState(initialValue?.name || "");
  const [locked, setLocked] = useState(initialValue?.locked || false);
  const [shared, setShared] = useState(false);

  const lockIn = () => {
    if (!commitment || !name) return;
    setLocked(true);
    onSave({ commitment, name, locked: true });
  };

  const shareCommitment = () => {
    const text = `MY COMMITMENT\n\n"${stem} ${commitment}"\n\n— ${name}\n\nMINDCAST`;
    if (navigator.share) {
      navigator.share({ title: "My MINDCAST Commitment", text });
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (locked) {
    return (
      <div className="mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-cream text-primary p-8 md:p-12 text-center"
        >
          <Lock size={32} className="mx-auto mb-4 text-primary/30" />
          <p className="text-xs tracking-[0.3em] text-primary/50 mb-4">YOUR COMMITMENT IS LOCKED IN</p>
          <p className="font-display text-2xl md:text-3xl tracking-wider mb-2">{stem}</p>
          <p className="font-body text-lg text-primary/80 mb-6">"{commitment}"</p>
          <p className="text-xs tracking-widest text-primary/40">— {name}</p>
          <div className="mt-8 pt-6 border-t border-primary/10">
            <p className="font-display text-xl tracking-widest text-primary/60 mb-1">MINDCAST</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary border-2 border-cream/20 p-6 text-center mt-4"
        >
          <p className="font-display text-xl tracking-widest text-cream mb-4">SEE YOU NEXT WEEK.</p>
          <button onClick={shareCommitment} className="btn-outlined text-xs py-3 px-6 flex items-center gap-2 mx-auto">
            <Share2 size={12} /> {shared ? "COPIED!" : "SHARE THIS"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-primary border-2 border-cream/20 p-8 md:p-12 mb-4">
      <p className="text-cream/50 text-xs tracking-[0.2em] mb-6">YOUR COMMITMENT</p>
      <p className="font-display text-2xl md:text-3xl tracking-wider text-cream mb-6">{stem}</p>
      <textarea
        value={commitment}
        onChange={(e) => { setCommitment(e.target.value); onSave({ commitment: e.target.value, name, locked: false }); }}
        rows={2}
        className="w-full bg-transparent border-2 border-cream/30 text-cream p-4 text-sm font-body focus:border-cream focus:outline-none resize-none mb-4"
        placeholder="Type your commitment..."
      />
      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); onSave({ commitment, name: e.target.value, locked: false }); }}
        className="w-full bg-transparent border-2 border-cream/30 text-cream p-4 text-sm tracking-widest placeholder:text-cream/30 focus:border-cream focus:outline-none mb-6"
        placeholder="YOUR NAME"
      />
      <button onClick={lockIn} disabled={!commitment || !name} className="btn-filled text-xs w-full py-4 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <Lock size={14} /> LOCK IN MY COMMITMENT
      </button>
    </div>
  );
};

export default CommitmentCard;
