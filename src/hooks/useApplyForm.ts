// Form state and submission logic for pilot application

import { useState, useEffect, useCallback } from "react";
import { env } from "@/lib/env";
import { isBeforeCutoff } from "@/lib/timezone";
import { validateForm, type DobParts, type ValidationErrors } from "@/lib/applyValidation";

const STORAGE_KEY = "mindcast_pilot_application";

export interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: DobParts;
  gender: string;
  gender_self_described: string;
  q1: string;
  q2: string;
  q3: string;
  anything_else: string;
}

const initialFormData: FormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  dob: { day: "", month: "", year: "" },
  gender: "",
  gender_self_described: "",
  q1: "",
  q2: "",
  q3: "",
  anything_else: "",
};

export interface SubmittedResult {
  email: string;
  /** Set when the application saved but the confirmation email failed. */
  emailWarning: string | null;
}

export interface UseApplyFormReturn {
  formData: FormData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  submitError: string | null;
  isClosed: boolean;
  /** Set once a submission succeeds; the form swaps to the confirmation. */
  submitted: SubmittedResult | null;
  handleChange: (field: keyof FormData, value: string) => void;
  handleDobChange: (part: keyof DobParts, value: string) => void;
  handleBlur: (field: keyof FormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

export function useApplyForm(): UseApplyFormReturn {
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialFormData, ...parsed };
      }
    } catch {}
    return initialFormData;
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(!isBeforeCutoff());
  const [submitted, setSubmitted] = useState<SubmittedResult | null>(null);

  // Persist to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Check cutoff on mount and periodically
  useEffect(() => {
    const check = () => setIsClosed(!isBeforeCutoff());
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [touched]);

  const handleDobChange = useCallback((part: keyof DobParts, value: string) => {
    const numeric = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    setFormData((prev) => ({ ...prev, dob: { ...prev.dob, [part]: numeric } }));
    if (touched.dob) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.dob;
        return next;
      });
    }
  }, [touched]);

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all as touched
    const allTouched = Object.keys(initialFormData).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<string, boolean>
    );
    setTouched(allTouched);

    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check cutoff again
    if (!isBeforeCutoff()) {
      setIsClosed(true);
      setSubmitError("Applications have closed");
      return;
    }

    setIsSubmitting(true);

    try {
      const dob = formData.dob;
      const response = await fetch(
        `${env.VITE_SUPABASE_URL}/functions/v1/submit-pilot-application`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            dob_day: dob.day,
            dob_month: dob.month,
            dob_year: dob.year,
            gender: formData.gender || undefined,
            gender_self_described: formData.gender_self_described || undefined,
            q1_money_no_barrier: formData.q1,
            q2_ten_years_ago: formData.q2,
            q3_didnt_think_could: formData.q3,
            anything_else: formData.anything_else || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.closed) {
          setIsClosed(true);
          setSubmitError("Applications have closed");
        } else if (result.errors) {
          setErrors(result.errors);
          setSubmitError("Please fix the errors above");
        } else {
          setSubmitError(result.error || "Something went wrong. Please try again.");
        }
        return;
      }

      // Success - clear the draft and swap the form for the confirmation.
      // The application is saved even if the confirmation email failed; the
      // warning tells the applicant to get in touch instead of waiting.
      const emailWarning =
        result?.emails?.applicant?.sent === false
          ? "Your application is in, but we couldn't send your confirmation email. Please email hello@mindcast.co.nz so we know you applied."
          : null;
      sessionStorage.removeItem(STORAGE_KEY);
      setFormData(initialFormData);
      setTouched({});
      setErrors({});
      setSubmitError(null);
      setSubmitted({ email: formData.email.trim().toLowerCase(), emailWarning });
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormData(initialFormData);
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setSubmitted(null);
  }, []);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    submitError,
    isClosed,
    submitted,
    handleChange,
    handleDobChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}