import { useState, useEffect } from "react";

interface RateScaleProps {
  statement: string;
  minLabel: string;
  maxLabel: string;
  storageKey: string;
  onSave: (value: number) => void;
  initialValue?: number;
}

const RateScale = ({ statement, minLabel, maxLabel, storageKey, onSave, initialValue = 5 }: RateScaleProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (initialValue !== undefined) setValue(initialValue);
  }, [initialValue]);

  const handleChange = (v: number) => {
    setValue(v);
    onSave(v);
  };

  return (
    <div className="bg-primary p-6 md:p-8 mb-4">
      <p className="text-cream/70 text-xs tracking-[0.2em] mb-6 uppercase">{statement}</p>
      <div className="text-center mb-4">
        <span className="font-display text-6xl text-cream">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full h-2 appearance-none cursor-pointer bg-cream/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-cream [&::-webkit-slider-thumb]:border-0 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:bg-cream [&::-moz-range-thumb]:border-0"
      />
      <div className="flex justify-between mt-2">
        <span className="text-cream/30 text-[10px] tracking-widest">{minLabel}</span>
        <span className="text-cream/30 text-[10px] tracking-widest">{maxLabel}</span>
      </div>
    </div>
  );
};

export default RateScale;
