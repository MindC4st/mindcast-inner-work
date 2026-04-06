import { useState, useEffect, useRef, useCallback } from "react";
import { Check, X, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ConnectPairsProps {
  instruction: string;
  leftItems: string[];
  rightItems: string[];
  correctPairs: [string, string][];
  storageKey: string;
  onSave: (value: [string, string][]) => void;
  initialValue?: [string, string][];
}

const ConnectPairs = ({ instruction, leftItems, rightItems, correctPairs, storageKey, onSave, initialValue }: ConnectPairsProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [matches, setMatches] = useState<[string, string][]>(initialValue || []);
  const [flashWrong, setFlashWrong] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; correct: boolean }[]>([]);

  const isMatched = (item: string) => matches.some(([l, r]) => l === item || r === item);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = matches.map(([l, r]) => {
      const leftEl = containerRef.current?.querySelector(`[data-left="${l}"]`);
      const rightEl = containerRef.current?.querySelector(`[data-right="${r}"]`);
      if (!leftEl || !rightEl) return null;
      const lRect = leftEl.getBoundingClientRect();
      const rRect = rightEl.getBoundingClientRect();
      const isCorrect = correctPairs.some(([cl, cr]) => cl === l && cr === r);
      return {
        x1: lRect.right - containerRect.left,
        y1: lRect.top + lRect.height / 2 - containerRect.top,
        x2: rRect.left - containerRect.left,
        y2: rRect.top + rRect.height / 2 - containerRect.top,
        correct: isCorrect,
      };
    }).filter(Boolean) as typeof lines;
    setLines(newLines);
  }, [matches, correctPairs]);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [updateLines]);

  const handleClick = (item: string, side: "left" | "right") => {
    if (isMatched(item) || revealed) return;

    if (!selected) {
      setSelected(item);
      setSelectedSide(side);
      return;
    }

    if (side === selectedSide) {
      setSelected(item);
      return;
    }

    const pair: [string, string] = side === "right" ? [selected, item] : [item, selected];
    const isCorrect = correctPairs.some(([l, r]) => l === pair[0] && r === pair[1]);

    if (isCorrect) {
      const newMatches = [...matches, pair];
      setMatches(newMatches);
      onSave(newMatches);
    } else {
      setFlashWrong(item);
      setTimeout(() => setFlashWrong(null), 600);
    }
    setSelected(null);
    setSelectedSide(null);
  };

  const revealAll = () => {
    setMatches(correctPairs);
    onSave(correctPairs);
    setRevealed(true);
  };

  return (
    <div className="mb-4">
      <p className="text-cream/70 text-xs tracking-[0.2em] mb-6 uppercase">{instruction}</p>

      <div ref={containerRef} className="relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.correct ? "rgba(74, 222, 128, 0.6)" : "rgba(248, 113, 113, 0.6)"}
              strokeWidth="2"
              strokeDasharray={line.correct ? "none" : "6,4"}
            />
          ))}
        </svg>

        <div className="grid grid-cols-2 gap-8 md:gap-16">
          <div className="space-y-3">
            {leftItems.map((item) => (
              <motion.button
                key={item}
                data-left={item}
                onClick={() => handleClick(item, "left")}
                animate={flashWrong === item ? { x: [0, -4, 4, -4, 0] } : {}}
                className={`w-full text-left px-4 py-3 text-xs tracking-widest border-2 transition-all ${
                  isMatched(item)
                    ? "border-green-500/50 bg-green-900/20 text-green-300"
                    : selected === item
                    ? "border-cream bg-cream/10 text-cream"
                    : "border-cream/20 text-cream/70 hover:border-cream/40"
                }`}
                disabled={isMatched(item)}
              >
                {item}
                {isMatched(item) && <Check size={12} className="inline ml-2" />}
              </motion.button>
            ))}
          </div>
          <div className="space-y-3">
            {rightItems.map((item) => (
              <motion.button
                key={item}
                data-right={item}
                onClick={() => handleClick(item, "right")}
                animate={flashWrong === item ? { x: [0, -4, 4, -4, 0] } : {}}
                className={`w-full text-left px-4 py-3 text-xs tracking-widest border-2 transition-all ${
                  isMatched(item)
                    ? "border-green-500/50 bg-green-900/20 text-green-300"
                    : selected === item
                    ? "border-cream bg-cream/10 text-cream"
                    : "border-cream/20 text-cream/70 hover:border-cream/40"
                }`}
                disabled={isMatched(item)}
              >
                {item}
                {isMatched(item) && <Check size={12} className="inline ml-2" />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {!revealed && (
        <button onClick={revealAll} className="btn-outlined text-xs py-3 px-6 mt-6 flex items-center gap-2"><Eye size={12} /> REVEAL ALL</button>
      )}
    </div>
  );
};

export default ConnectPairs;
