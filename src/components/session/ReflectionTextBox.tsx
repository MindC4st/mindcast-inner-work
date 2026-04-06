import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";

interface ReflectionTextBoxProps {
  prompt: string;
  storageKey: string;
  onSave: (value: string) => void;
  initialValue?: string;
}

const ReflectionTextBox = ({ prompt, storageKey, onSave, initialValue = "" }: ReflectionTextBoxProps) => {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  const handleChange = (text: string) => {
    setValue(text);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave(text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <div className="bg-primary p-6 md:p-8 mb-4">
      <label className="block text-cream/70 text-xs tracking-[0.2em] mb-4 uppercase">{prompt}</label>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={3}
        className="w-full bg-background text-primary p-4 text-sm font-body leading-relaxed border-2 border-primary/20 focus:border-primary focus:outline-none resize-none min-h-[80px]"
        style={{ fieldSizing: "content" } as React.CSSProperties}
        placeholder="Type your response here..."
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-cream/30 text-xs">{value.length} characters</span>
        {saved && (
          <span className="text-cream/50 text-xs flex items-center gap-1 animate-fade-in">
            <Check size={12} /> SAVED
          </span>
        )}
      </div>
    </div>
  );
};

export default ReflectionTextBox;
