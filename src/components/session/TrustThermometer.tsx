import { useState, useEffect } from "react";

interface ThermometerData {
  label: string;
  value: number;
  nameValue?: string;
}

interface TrustThermometerProps {
  title?: string;
  thermometers: { key: string; defaultLabel: string; showNameInput?: boolean }[];
  storageKey: string;
  onSave: (value: Record<string, ThermometerData>) => void;
  initialValue?: Record<string, ThermometerData>;
}

const getColor = (value: number): string => {
  if (value < 25) return "rgb(239, 68, 68)";
  if (value < 50) return "rgb(245, 158, 11)";
  if (value < 75) return "rgb(234, 179, 8)";
  return "rgb(134, 197, 128)";
};

const getLabel = (value: number): string => {
  if (value <= 0) return "NO TRUST";
  if (value <= 25) return "GUARDED";
  if (value <= 50) return "CAUTIOUS";
  if (value <= 75) return "GROWING";
  return "SECURE";
};

const SingleThermometer = ({
  data,
  showNameInput,
  defaultLabel,
  onChange,
}: {
  data: ThermometerData;
  showNameInput?: boolean;
  defaultLabel: string;
  onChange: (d: ThermometerData) => void;
}) => {
  const color = getColor(data.value);
  const label = getLabel(data.value);

  return (
    <div className="flex flex-col items-center gap-4 flex-1">
      {/* Name input or label */}
      {showNameInput ? (
        <input
          type="text"
          value={data.nameValue || ""}
          onChange={(e) => onChange({ ...data, nameValue: e.target.value, label: e.target.value || defaultLabel })}
          placeholder={defaultLabel}
          className="bg-transparent border-b border-silver/20 text-silver text-xs tracking-widest text-center py-1 w-full max-w-[160px] focus:border-silver focus:outline-none placeholder:text-silver/20"
        />
      ) : (
        <span className="text-silver/50 text-[10px] tracking-widest text-center">{data.label || defaultLabel}</span>
      )}

      {/* Value display */}
      <div className="text-center">
        <span className="font-display text-4xl text-silver block">{data.value}</span>
        <span className="text-[10px] tracking-widest" style={{ color }}>{label}</span>
      </div>

      {/* Thermometer body */}
      <div className="relative w-10 h-52 flex flex-col items-center">
        {/* Tube */}
        <div className="relative w-6 h-44 border-2 border-silver/20 overflow-hidden bg-primary">
          {/* Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-300"
            style={{
              height: `${data.value}%`,
              background: `linear-gradient(to top, rgb(239, 68, 68), rgb(245, 158, 11), rgb(234, 179, 8), rgb(134, 197, 128))`,
              backgroundSize: "100% 400%",
              backgroundPosition: `0 ${100 - data.value}%`,
            }}
          />

          {/* Scale marks */}
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute left-0 right-0 border-t border-silver/10"
              style={{ bottom: `${mark}%` }}
            />
          ))}
        </div>

        {/* Bulb */}
        <div
          className="w-10 h-10 rounded-full border-2 border-silver/20 -mt-1 transition-colors duration-300"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Slider input */}
      <input
        type="range"
        min={0}
        max={100}
        value={data.value}
        onChange={(e) => onChange({ ...data, value: Number(e.target.value) })}
        className="w-full max-w-[120px] h-1 appearance-none cursor-pointer bg-silver/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-silver [&::-webkit-slider-thumb]:border-0 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-silver [&::-moz-range-thumb]:border-0"
      />
    </div>
  );
};

const TrustThermometer = ({ title, thermometers, storageKey, onSave, initialValue }: TrustThermometerProps) => {
  const [data, setData] = useState<Record<string, ThermometerData>>(() => {
    const init: Record<string, ThermometerData> = {};
    thermometers.forEach((t) => {
      init[t.key] = initialValue?.[t.key] || { label: t.defaultLabel, value: 50, nameValue: "" };
    });
    return init;
  });

  const handleChange = (key: string, d: ThermometerData) => {
    const updated = { ...data, [key]: d };
    setData(updated);
    onSave(updated);
  };

  return (
    <div className="bg-primary p-6 md:p-8 mb-4">
      {title && <p className="text-silver/70 text-xs tracking-[0.2em] mb-8 uppercase text-center">{title}</p>}
      <div className="flex justify-center gap-8 md:gap-12">
        {thermometers.map((t) => (
          <SingleThermometer
            key={t.key}
            data={data[t.key]}
            showNameInput={t.showNameInput}
            defaultLabel={t.defaultLabel}
            onChange={(d) => handleChange(t.key, d)}
          />
        ))}
      </div>
    </div>
  );
};

export default TrustThermometer;
