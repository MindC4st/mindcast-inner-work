import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";

interface PhraseBuilderProps {
  template: string; // Use ________ as blanks
  storageKey: string;
  onSave: (value: string[]) => void;
  initialValue?: string[];
}

const WordPhraseBuilder = ({ template, storageKey, onSave, initialValue }: PhraseBuilderProps) => {
  const parts = template.split("________");
  const blankCount = parts.length - 1;
  const [values, setValues] = useState<string[]>(initialValue || Array(blankCount).fill(""));
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (index: number, text: string) => {
    const updated = [...values];
    updated[index] = text;
    setValues(updated);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <div className="bg-primary p-6 md:p-8 mb-4">
      <div className="font-body text-cream/80 text-sm md:text-base leading-loose">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < blankCount && (
              <input
                type="text"
                value={values[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                className="inline-block bg-transparent border-b-2 border-cream/40 text-cream px-2 py-1 text-sm md:text-base font-body min-w-[120px] md:min-w-[180px] focus:border-cream focus:outline-none mx-1"
                placeholder="..."
              />
            )}
          </span>
        ))}
      </div>
      {saved && (
        <span className="text-cream/50 text-xs flex items-center gap-1 mt-3 animate-fade-in">
          <Check size={12} /> SAVED
        </span>
      )}
    </div>
  );
};

export default WordPhraseBuilder;
