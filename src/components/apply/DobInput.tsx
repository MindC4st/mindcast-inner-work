import { useRef, useImperativeHandle, useState, forwardRef } from "react";
import { formatDateNZ, parseDob, type DobParts } from "@/lib/applyValidation";

interface DobInputProps {
  value: DobParts;
  onChange: (part: keyof DobParts, value: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

interface DobInputRef {
  focus: () => void;
}

export const DobInput = forwardRef<DobInputRef, DobInputProps>(
  ({ value, onChange, onBlur, error, disabled }, ref) => {
    const [displayDate, setDisplayDate] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstInput = containerRef.current?.querySelector('[data-dob-part="day"]') as HTMLInputElement;
        firstInput?.focus();
      },
    }));

    const handleChange = (part: keyof DobParts, e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange(part, v);

      // Auto-advance
      if (part === "day" && v.length === 2) {
        const next = e.target.nextElementSibling as HTMLInputElement;
        next?.focus();
      } else if (part === "month" && v.length === 2) {
        const next = e.target.nextElementSibling as HTMLInputElement;
        next?.focus();
      }

      // Update display date
      const dob = parseDob({ ...value, [part]: v });
      if (dob) setDisplayDate(formatDateNZ(dob));
      else setDisplayDate("");
    };

    const handleKeyDown = (part: keyof DobParts, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !e.currentTarget.value) {
        const prev = e.currentTarget.previousElementSibling as HTMLInputElement;
        prev?.focus();
      }
    };

    return (
      <div ref={containerRef} className="w-full">
        <div className="flex gap-3" role="group" aria-label="Date of birth">
          <div className="flex-1">
            <label htmlFor="dob-day" className="sr-only">Day</label>
            <input
              id="dob-day"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="DD"
              value={value.day}
              onChange={(e) => handleChange("day", e)}
              onBlur={onBlur}
              onKeyDown={(e) => handleKeyDown("day", e)}
              data-dob-part="day"
              disabled={disabled}
              className={`input-underline w-full text-center ${error ? "border-red-500 focus:border-red-500" : ""}`}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "dob-error" : undefined}
            />
            <span className="text-[11px] text-muted-foreground tracking-wider">DD</span>
          </div>
          <div className="flex-1">
            <label htmlFor="dob-month" className="sr-only">Month</label>
            <input
              id="dob-month"
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="MM"
              value={value.month}
              onChange={(e) => handleChange("month", e)}
              onBlur={onBlur}
              onKeyDown={(e) => handleKeyDown("month", e)}
              data-dob-part="month"
              disabled={disabled}
              className={`input-underline w-full text-center ${error ? "border-red-500 focus:border-red-500" : ""}`}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "dob-error" : undefined}
            />
            <span className="text-[11px] text-muted-foreground tracking-wider">MM</span>
          </div>
          <div className="flex-1">
            <label htmlFor="dob-year" className="sr-only">Year</label>
            <input
              id="dob-year"
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY"
              value={value.year}
              onChange={(e) => handleChange("year", e)}
              onBlur={onBlur}
              onKeyDown={(e) => handleKeyDown("year", e)}
              data-dob-part="year"
              disabled={disabled}
              className={`input-underline w-full text-center ${error ? "border-red-500 focus:border-red-500" : ""}`}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "dob-error" : undefined}
            />
            <span className="text-[11px] text-muted-foreground tracking-wider">YYYY</span>
          </div>
        </div>
        {displayDate && (
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {displayDate}
          </p>
        )}
        {error && (
          <p id="dob-error" className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

DobInput.displayName = "DobInput";