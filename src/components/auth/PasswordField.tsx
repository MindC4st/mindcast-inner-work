import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authFieldClass } from "@/components/auth/AuthShell";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
  disabled?: boolean;
};

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  hint,
  disabled,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="font-body text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          disabled={disabled}
          aria-describedby={hintId}
          className={`${authFieldClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          className="absolute right-2 top-[calc(50%+0.25rem)] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/[0.06] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {hint && <p id={hintId} className="mt-2 font-body text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
};

export default PasswordField;
