import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface IcebergRevealProps {
  aboveLabel: string;
  belowLabel: string;
  cards: string[];
  storageKey: string;
  onSave: (value: Record<string, string>) => void;
  initialValue?: Record<string, string>;
}

const IcebergReveal = ({ aboveLabel, belowLabel, cards, storageKey, onSave, initialValue }: IcebergRevealProps) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    cards.forEach((c, i) => { init[`card-${i}`] = !!initialValue?.[`card-${i}`]; });
    return init;
  });
  const [values, setValues] = useState<Record<string, string>>(initialValue || {});

  const handleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: true }));
  };

  const handleChange = (key: string, text: string) => {
    const updated = { ...values, [key]: text };
    setValues(updated);
    onSave(updated);
  };

  return (
    <div className="mb-4">
      {/* Iceberg visual */}
      <div className="relative w-full max-w-lg mx-auto">
        {/* Sky / above water */}
        <div className="bg-primary/30 border-2 border-cream/10 p-6 text-center relative">
          <span className="text-cream/40 text-[10px] tracking-[0.3em] block mb-3">{aboveLabel}</span>
          {/* Ice tip */}
          <div className="mx-auto w-0 h-0 border-l-[60px] border-r-[60px] border-b-[40px] border-l-transparent border-r-transparent border-b-silver/30" />
        </div>

        {/* Waterline */}
        <div className="h-1 bg-cream/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-silver/40 to-transparent animate-pulse" />
        </div>

        {/* Below water */}
        <div className="bg-primary border-2 border-t-0 border-cream/10 p-6 relative">
          <span className="text-cream/30 text-[10px] tracking-[0.3em] block text-center mb-6">{belowLabel}</span>

          {/* Large ice mass shape hint */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <polygon points="100,0 300,0 350,100 370,200 320,280 80,280 30,200 50,100" fill="currentColor" className="text-cream" />
            </svg>
          </div>

          {/* Hidden cards */}
          <div className="space-y-3 relative z-10">
            {cards.map((card, i) => {
              const key = `card-${i}`;
              const isRevealed = revealed[key];

              return (
                <div key={key} className="perspective-500">
                  {!isRevealed ? (
                    <button
                      onClick={() => handleReveal(key)}
                      className="w-full p-4 border-2 border-cream/10 bg-cream/5 hover:bg-cream/10 hover:border-cream/20 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-cream/20 text-xs tracking-widest group-hover:text-cream/40 transition-colors">
                          TAP TO REVEAL
                        </span>
                        <div className="w-6 h-6 border border-cream/10 flex items-center justify-center group-hover:border-cream/20">
                          <span className="text-cream/20 text-xs">?</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full p-4 border-2 border-cream/20 bg-cream/5 animate-fade-in">
                      <label className="text-cream/50 text-[10px] tracking-widest block mb-2">{card}</label>
                      <textarea
                        value={values[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-b border-cream/20 text-cream text-sm font-body focus:border-cream focus:outline-none resize-none py-1"
                        placeholder="Write what's beneath..."
                      />
                      {values[key] && (
                        <Check size={12} className="text-cream/30 mt-1" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IcebergReveal;
