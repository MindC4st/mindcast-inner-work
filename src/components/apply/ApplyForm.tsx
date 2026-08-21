import { useRef, useState } from "react";
import { DobInput } from "./DobInput";
import { GenderRadios } from "./GenderRadios";
import { useApplyForm } from "@/hooks/useApplyForm";
import { formatDateNZ, parseDob } from "@/lib/applyValidation";

const QUESTIONS = [
  {
    key: "q1",
    label: "1.",
    text: "If money were no barrier, what would you actually be doing with your life?",
    hint: "Don't tell us what sounds impressive. Describe what your days would look like — what you'd spend your time doing, and who with.",
  },
  {
    key: "q2",
    label: "2.",
    text: "What would the version of you from ten years ago be most surprised to hear about your life now?",
    hint: "What happened in between?",
  },
  {
    key: "q3",
    label: "3.",
    text: "Tell us about something you once believed you weren't the kind of person who could do — until you did it.",
    hint: "",
  },
] as const;

export function ApplyForm({
  onSubmitSuccess,
  onShowInterest,
}: {
  onSubmitSuccess: (email: string) => void;
  onShowInterest: (ageBand: "under_30" | "over_45") => void;
}) {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    submitError,
    isClosed,
    handleChange,
    handleDobChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useApplyForm();

  const formRef = useRef<HTMLFormElement>(null);
  const dobRef = useRef<any>(null);

  // Check if DOB puts them outside age band
  const dob = parseDob(formData.dob);
  const age = dob ? (() => {
    const start = new Date("2026-10-13");
    let a = start.getFullYear() - dob.getFullYear();
    const m = start.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && start.getDate() < dob.getDate())) a--;
    return a;
  })() : null;

  const ageBand = age !== null && age < 30 ? "under_30" : age !== null && age > 45 ? "over_45" : null;

  if (isClosed) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
          Applications for the first pilot group have closed.
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Nine people have been chosen and the group starts 13 October.
          Other groups will follow once Mindcast is up and running — leave your email
          and we'll let you know when the next one opens.
        </p>
        <InterestForm onSubmit={onShowInterest} />
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8" noValidate>
      {/* Age band notice - before any field */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <p className="font-medium text-blue-900 mb-2">
          This first pilot group is for people aged 30 to 45.
        </p>
        <p className="text-blue-800 text-sm">
          Other groups will follow once Mindcast is up and running.
          <strong> Want us to let you know when yours opens?</strong>
        </p>
      </div>

      {/* Intro text */}
      <div className="space-y-3 text-left">
        <p className="font-medium text-foreground">
          Ten Tuesday nights, 5.30–7.30pm, from 13 October 2026. 111 Jarden Mile, Taupō.
        </p>
        <p className="text-muted-foreground">
          Nine places. No cost — what I'm asking for is your commitment and your honesty.
        </p>
        <p className="text-muted-foreground">
          This first group is for people aged 30 to 45.
        </p>
        <p className="text-sm text-foreground">
          Applications close <strong>9am, Tuesday 29 September</strong>. You'll hear back before then.
        </p>
      </div>

      {/* Name row - single column on mobile */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="first_name" className="block text-sm font-medium text-foreground">
            First name
          </label>
          <input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            onBlur={() => handleBlur("first_name")}
            disabled={isSubmitting}
            maxLength={60}
            className={`input-underline w-full ${errors.first_name && touched.first_name ? "border-red-500 focus:border-red-500" : ""}`}
            aria-invalid={errors.first_name && touched.first_name ? "true" : "false"}
            aria-describedby={errors.first_name && touched.first_name ? "first-name-error" : undefined}
            autoComplete="given-name"
          />
          {errors.first_name && touched.first_name && (
            <p id="first-name-error" className="text-sm text-red-600" role="alert">{errors.first_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="last_name" className="block text-sm font-medium text-foreground">
            Last name
          </label>
          <input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            onBlur={() => handleBlur("last_name")}
            disabled={isSubmitting}
            maxLength={60}
            className={`input-underline w-full ${errors.last_name && touched.last_name ? "border-red-500 focus:border-red-500" : ""}`}
            aria-invalid={errors.last_name && touched.last_name ? "true" : "false"}
            aria-describedby={errors.last_name && touched.last_name ? "last-name-error" : undefined}
            autoComplete="family-name"
          />
          {errors.last_name && touched.last_name && (
            <p id="last-name-error" className="text-sm text-red-600" role="alert">{errors.last_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value.toLowerCase())}
            onBlur={() => handleBlur("email")}
            disabled={isSubmitting}
            className={`input-underline w-full ${errors.email && touched.email ? "border-red-500 focus:border-red-500" : ""}`}
            aria-invalid={errors.email && touched.email ? "true" : "false"}
            aria-describedby={errors.email && touched.email ? "email-error" : undefined}
            autoComplete="email"
          />
          {errors.email && touched.email && (
            <p id="email-error" className="text-sm text-red-600" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            disabled={isSubmitting}
            className={`input-underline w-full ${errors.phone && touched.phone ? "border-red-500 focus:border-red-500" : ""}`}
            aria-invalid={errors.phone && touched.phone ? "true" : "false"}
            aria-describedby={errors.phone && touched.phone ? "phone-error" : undefined}
            autoComplete="tel"
            placeholder="027 123 4567 or +64 27 123 4567"
          />
          {errors.phone && touched.phone && (
            <p id="phone-error" className="text-sm text-red-600" role="alert">{errors.phone}</p>
          )}
        </div>

        {/* Date of birth - three inputs */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Date of birth
          </label>
          <DobInput
            ref={dobRef}
            value={formData.dob}
            onChange={handleDobChange}
            onBlur={() => handleBlur("dob")}
            error={errors.dob && touched.dob ? errors.dob : undefined}
            disabled={isSubmitting}
          />
          {age !== null && !errors.dob && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              You'll be {age} on 13 October 2026.
              {age < 30 && " (under 30 — not eligible for this group)"}
              {age > 45 && " (over 45 — not eligible for this group)"}
            </p>
          )}
        </div>

        {/* Gender - optional, with explanation */}
        <div className="space-y-2">
          <GenderRadios
            value={formData.gender}
            selfDescribed={formData.gender_self_described}
            onChange={(v) => handleChange("gender", v)}
            onSelfDescribedChange={(v) => handleChange("gender_self_described", v)}
            onBlur={() => handleBlur("gender")}
            error={errors.gender && touched.gender ? errors.gender : undefined}
            selfDescribedError={errors.gender_self_described && touched.gender_self_described ? errors.gender_self_described : undefined}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Three questions - Cormorant italic */}
      <div className="space-y-8 border-t border-border pt-8">
        <h3 className="font-display text-2xl text-foreground">Your answers</h3>
        <p className="text-sm text-muted-foreground">
          These are the poster's promise — the application really doesn't ask for a CV.
        </p>

        {QUESTIONS.map(({ key, label, text, hint }) => (
          <div key={key} className="space-y-2">
            <label
              htmlFor={key}
              className="block font-serif italic text-lg md:text-xl text-foreground leading-relaxed"
            >
              <span className="font-display font-medium mr-2">{label}</span>
              {text}
            </label>
            {hint && (
              <p className="text-sm text-muted-foreground ml-6">{hint}</p>
            )}
            <textarea
              id={key}
              name={key}
              value={formData[key as keyof typeof formData] as string}
              onChange={(e) => handleChange(key as keyof typeof formData, e.target.value)}
              onBlur={() => handleBlur(key as keyof typeof formData)}
              disabled={isSubmitting}
              rows={4}
              className={`input-underline w-full resize-y min-h-[100px] font-body ${
                errors[key as keyof typeof errors] && touched[key as keyof typeof touched]
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              aria-invalid={errors[key as keyof typeof errors] && touched[key as keyof typeof touched] ? "true" : "false"}
              aria-describedby={errors[key as keyof typeof errors] && touched[key as keyof typeof touched] ? `${key}-error` : undefined}
              style={{ minHeight: "100px" }}
            />
            {errors[key as keyof typeof errors] && touched[key as keyof typeof touched] && (
              <p id={`${key}-error`} className="text-sm text-red-600" role="alert">
                {errors[key as keyof typeof errors]}
              </p>
            )}
          </div>
        ))}

        {/* Anything else - optional */}
        <div className="space-y-2">
          <label
            htmlFor="anything_else"
            className="block font-serif italic text-lg md:text-xl text-foreground leading-relaxed"
          >
            <span className="font-display font-medium mr-2">Anything else you'd like Ash to know?</span>
            <span className="font-body font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="anything_else"
            name="anything_else"
            value={formData.anything_else}
            onChange={(e) => handleChange("anything_else", e.target.value)}
            onBlur={() => handleBlur("anything_else")}
            disabled={isSubmitting}
            rows={3}
            className="input-underline w-full resize-y min-h-[80px] font-body"
            style={{ minHeight: "80px" }}
          />
        </div>
      </div>

      {/* Privacy line + submit */}
      <div className="space-y-4 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground text-center">
          Your answers go to Ashleigh and nobody else. If you're not selected we'll delete your
          application within three months.
          <br />
          <a href="/privacy" className="underline hover:text-foreground" target="_blank" rel="noopener">
            Privacy Policy
          </a>
        </p>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm text-center" role="alert">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-filled w-full min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}

// Interest form for after close or outside age band
function InterestForm({ onSubmit }: { onSubmit: (ageBand: "under_30" | "over_45" | "after_close") => void }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-pilot-interest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email: email.toLowerCase() }),
        }
      );
      if (res.ok) {
        setMessage({ type: "success", text: "Thanks — we'll let you know when the next group opens." });
        setEmail("");
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Something went wrong" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="space-y-2">
        <label htmlFor="interest-email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="interest-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          disabled={submitting}
          className="input-underline w-full"
          autoComplete="email"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="btn-filled w-full min-h-[56px] disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Notify me"}
      </button>
      {message && (
        <p className={`text-sm text-center ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}