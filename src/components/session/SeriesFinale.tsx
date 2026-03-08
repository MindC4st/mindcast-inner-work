import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Share2 } from "lucide-react";

interface SeriesFinaleProps {
  lines: string[];
  storageKey: string;
  onSave: (value: { values: string[]; name: string; sealed: boolean }) => void;
  initialValue?: { values: string[]; name: string; sealed: boolean };
}

const SeriesFinale = ({ lines, storageKey, onSave, initialValue }: SeriesFinaleProps) => {
  const [values, setValues] = useState<string[]>(initialValue?.values || lines.map(() => ""));
  const [name, setName] = useState(initialValue?.name || "");
  const [sealed, setSealed] = useState(initialValue?.sealed || false);
  const [showReveal, setShowReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSeal = () => {
    if (values.some((v) => !v) || !name) return;
    setSealed(true);
    onSave({ values, name, sealed: true });
    setShowReveal(true);
  };

  const handleShare = () => {
    const text = `MY TRUST DECLARATION\n\n${lines.map((l, i) => `${l} ${values[i]}`).join("\n")}\n\n— ${name}\n\nMINDCAST TRUST SERIES\n${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}`;
    if (navigator.share) {
      navigator.share({ title: "My Trust Declaration", text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (showReveal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-lg w-full text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Shield size={40} className="mx-auto mb-6 text-silver/30" />
              <span className="text-silver/30 text-[10px] tracking-[0.4em] block mb-8">TRUST SERIES COMPLETE</span>
            </motion.div>

            <div className="space-y-6 mb-10">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.3 }}
                >
                  <p className="text-silver/40 text-xs tracking-widest mb-1">{line}</p>
                  <p className="font-display text-2xl md:text-3xl text-silver tracking-wider">"{values[i]}"</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <p className="text-silver/30 text-xs tracking-widest mb-1">— {name}</p>
              <p className="text-silver/20 text-[10px] tracking-widest mt-4">
                {new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="mt-2 mb-8">
                <span className="font-display text-lg tracking-widest text-silver/20">MINDCAST</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 }}
              className="flex flex-col gap-3"
            >
              <button onClick={handleShare} className="btn-filled text-xs py-3 px-6 mx-auto flex items-center gap-2">
                <Share2 size={14} /> {copied ? "COPIED!" : "SHARE MY DECLARATION"}
              </button>
              <button onClick={() => setShowReveal(false)} className="btn-outlined text-xs py-3 px-6 mx-auto">
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (sealed) {
    return (
      <div className="mb-4">
        <div className="bg-silver text-primary p-8 md:p-12 text-center">
          <Shield size={32} className="mx-auto mb-4 text-primary/30" />
          <span className="text-primary/40 text-[10px] tracking-[0.3em] block mb-6">YOUR TRUST DECLARATION</span>
          {lines.map((line, i) => (
            <div key={i} className="mb-4">
              <p className="text-primary/40 text-xs tracking-widest">{line}</p>
              <p className="font-display text-xl tracking-wider text-primary">"{values[i]}"</p>
            </div>
          ))}
          <p className="text-primary/30 text-xs tracking-widest mt-6">— {name}</p>
          <div className="mt-6 pt-4 border-t border-primary/10 flex justify-center gap-3">
            <button onClick={() => setShowReveal(true)} className="btn-navy text-xs py-2 px-4">VIEW FULL REVEAL</button>
            <button onClick={handleShare} className="btn-navy text-xs py-2 px-4 flex items-center gap-2">
              <Share2 size={12} /> {copied ? "COPIED!" : "SHARE"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary border-2 border-silver/20 p-8 md:p-12 mb-4">
      <Shield size={32} className="mx-auto mb-4 text-silver/20" />
      <p className="text-silver/40 text-[10px] tracking-[0.3em] text-center mb-8">YOUR TRUST DECLARATION</p>

      <div className="space-y-6">
        {lines.map((line, i) => (
          <div key={i}>
            <p className="text-silver/50 text-xs tracking-widest mb-2">{line}</p>
            <input
              type="text"
              value={values[i]}
              onChange={(e) => {
                const updated = [...values];
                updated[i] = e.target.value;
                setValues(updated);
                onSave({ values: updated, name, sealed: false });
              }}
              className="w-full bg-transparent border-2 border-silver/20 text-silver px-4 py-3 text-sm tracking-widest placeholder:text-silver/20 focus:border-silver focus:outline-none"
              placeholder="..."
            />
          </div>
        ))}
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); onSave({ values, name: e.target.value, sealed: false }); }}
        className="w-full bg-transparent border-2 border-silver/20 text-silver px-4 py-3 text-sm tracking-widest placeholder:text-silver/20 focus:border-silver focus:outline-none mt-6"
        placeholder="YOUR NAME"
      />

      <button
        onClick={handleSeal}
        disabled={values.some((v) => !v) || !name}
        className="btn-filled text-xs w-full py-4 mt-6 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Shield size={14} /> SEAL MY DECLARATION
      </button>
    </div>
  );
};

export default SeriesFinale;
