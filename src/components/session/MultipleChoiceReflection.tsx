import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface MultipleChoiceProps {
  question: string;
  options: string[];
  multiSelect?: boolean;
  storageKey: string;
  onSave: (value: { selected: string[]; reason: string }) => void;
  initialValue?: { selected: string[]; reason: string };
}

const MultipleChoiceReflection = ({ question, options, multiSelect = false, storageKey, onSave, initialValue }: MultipleChoiceProps) => {
  const [selected, setSelected] = useState<string[]>(initialValue?.selected || []);
  const [reason, setReason] = useState(initialValue?.reason || "");
  const [showReason, setShowReason] = useState(!!initialValue?.selected?.length);

  const toggle = (option: string) => {
    let updated: string[];
    if (multiSelect) {
      updated = selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option];
    } else {
      updated = [option];
    }
    setSelected(updated);
    setShowReason(true);
    onSave({ selected: updated, reason });
  };

  const handleReason = (text: string) => {
    setReason(text);
    onSave({ selected, reason: text });
  };

  return (
    <div className="mb-4">
      <p className="text-silver/70 text-xs tracking-[0.2em] mb-6 uppercase">{question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isActive = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`text-left px-6 py-4 text-xs tracking-widest border-2 transition-all flex items-center justify-between ${
                isActive
                  ? "bg-silver text-primary border-silver"
                  : "border-silver/20 text-silver/70 hover:border-silver/40"
              }`}
            >
              {opt}
              {isActive && <Check size={14} />}
            </button>
          );
        })}
      </div>

      {showReason && (
        <div className="mt-4">
          <label className="text-silver/40 text-[10px] tracking-widest block mb-2">WHY I CHOSE THIS (OPTIONAL)</label>
          <textarea
            value={reason}
            onChange={(e) => handleReason(e.target.value)}
            rows={2}
            className="w-full bg-background text-primary p-4 text-sm font-body border-2 border-primary/20 focus:border-primary focus:outline-none resize-none"
            placeholder="Reflect on your choice..."
          />
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceReflection;
