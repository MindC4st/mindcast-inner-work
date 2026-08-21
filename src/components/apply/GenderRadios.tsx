import { forwardRef } from "react";

interface GenderRadiosProps {
  value: string;
  selfDescribed: string;
  onChange: (value: string) => void;
  onSelfDescribedChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  selfDescribedError?: string;
  disabled?: boolean;
}

export const GenderRadios = forwardRef<HTMLFieldSetElement, GenderRadiosProps>(
  ({ value, selfDescribed, onChange, onSelfDescribedChange, onBlur, error, selfDescribedError, disabled }, ref) => {
    const options = [
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
      { value: "another", label: "Another gender" },
      { value: "undisclosed", label: "Prefer not to say" },
    ] as const;

    return (
      <fieldset
        ref={ref}
        className="w-full"
        aria-describedby={error ? "gender-error" : undefined}
        disabled={disabled}
      >
        <legend className="text-sm font-medium text-foreground mb-3">
          Gender <span className="text-muted-foreground font-normal">(optional)</span>
        </legend>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          I'm asking because I'd like the group to be a reasonable mix rather than nine
          of the same. It's one thing I'll consider, not a rule.
        </p>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Gender">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer min-h-[44px] transition-colors"
            >
              <input
                type="radio"
                name="gender"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                onBlur={onBlur}
                disabled={disabled}
                className="h-5 w-5 accent-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-describedby={error ? "gender-error" : undefined}
              />
              <span className="text-base text-foreground">{opt.label}</span>
              {opt.value === "another" && (
                <input
                  type="text"
                  value={selfDescribed}
                  onChange={(e) => onSelfDescribedChange(e.target.value)}
                  onBlur={onBlur}
                  disabled={disabled || value !== "another"}
                  placeholder="Please specify"
                  className={`ml-2 flex-1 max-w-xs input-underline py-2 text-sm ${
                    selfDescribedError ? "border-red-500 focus:border-red-500" : ""
                  } ${value !== "another" ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label="Please specify your gender"
                  aria-invalid={selfDescribedError ? "true" : "false"}
                  aria-describedby={selfDescribedError ? "gender-self-described-error" : undefined}
                />
              )}
            </label>
          ))}
        </div>
        {error && (
          <p id="gender-error" className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {selfDescribedError && (
          <p id="gender-self-described-error" className="mt-1.5 text-sm text-red-600" role="alert">
            {selfDescribedError}
          </p>
        )}
      </fieldset>
    );
  }
);

GenderRadios.displayName = "GenderRadios";