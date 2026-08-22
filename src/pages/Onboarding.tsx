import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import logoLight from "@/assets/logo-blue-wordmark.png";

// Onboarding keeps the age gate required by Mindcast safeguarding:
//   - Under-13s cannot self-register. A guardian adds them to a household.
//   - 13–17s need a guardian consent record before onboarding completes.
//   - Age is derived from a date of birth, never a self-selected label.

type ParsedDob = {
  age: number;
  iso: string;
};

const formatDobInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
};

const parseDob = (value: string): ParsedDob | null => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDelta = today.getMonth() - (month - 1);
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < day)) age -= 1;
  if (age < 0 || age >= 120) return null;

  return {
    age,
    iso: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-foreground/10 bg-white px-4 py-3.5 font-body text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/45 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

const panelMotion = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [dobTouched, setDobTouched] = useState(false);
  const [guardianConsentRecorded, setGuardianConsentRecorded] = useState<boolean | null>(null);
  const [optIn, setOptIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const parsedDob = useMemo(() => parseDob(dobInput), [dobInput]);
  const age = parsedDob?.age ?? null;
  const isTeen = age !== null && age >= 13 && age < 18;
  const isChild = age !== null && age < 13;
  const totalSteps = isTeen ? 4 : 3;
  const currentStep = Math.min(step, totalSteps);

  useEffect(() => {
    if (!isTeen || !user) {
      setGuardianConsentRecorded(null);
      return;
    }
    let active = true;
    void (async () => {
      let profileId = profile?.id as string | undefined;
      if (!profileId) {
        const { data } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
        profileId = data?.id;
      }
      if (!profileId) {
        if (active) setGuardianConsentRecorded(false);
        return;
      }
      const { data } = await supabase
        .from("guardian_consents")
        .select("id")
        .eq("subject_profile_id", profileId)
        .eq("consent_type", "teen_membership")
        .is("revoked_at", null)
        .limit(1)
        .maybeSingle();
      if (active) setGuardianConsentRecorded(Boolean(data));
    })();
    return () => { active = false; };
  }, [isTeen, profile?.id, user]);

  const finish = async () => {
    if (!user || !parsedDob || isChild) return;
    if (isTeen && guardianConsentRecorded !== true) {
      toast({
        title: "Guardian approval is required",
        description: "A parent or legal guardian must invite you through their Family & Safety setup.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || undefined,
          age_group: isTeen ? "teen" : "adult",
          date_of_birth: parsedDob.iso,
          opt_in_public_goals: isTeen ? false : (optIn ?? false),
          onboarding_complete: true,
        })
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();
      if (profileError) throw profileError;
      if (!updatedProfile) throw new Error("Profile not found");

      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("onboarding save failed:", error);
      toast({
        title: "Couldn't finish setup",
        description: "Nothing was marked complete. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => setStep((value) => Math.max(1, value - 1));

  return (
    <main className="min-h-screen bg-ivory lg:grid lg:grid-cols-[minmax(320px,0.8fr)_minmax(560px,1.2fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-navy px-10 py-12 text-cream lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 15% 10%, hsl(var(--blue) / .42), transparent 40%), radial-gradient(circle at 90% 85%, hsl(var(--primary) / .24), transparent 42%)",
          }}
        />
        <Link to="/" className="relative inline-flex w-fit rounded-sm focus:outline-none focus:ring-2 focus:ring-cream/70">
          <img src={logoLight} alt="Mindcast home" className="h-9 brightness-0 invert" />
        </Link>

        <div className="relative max-w-md pb-10">
          <p className="mb-5 font-body text-xs font-semibold uppercase tracking-[0.22em] text-blue-light/70">
            Your member space
          </p>
          <h1 className="font-serif text-5xl leading-[1.02] text-cream xl:text-6xl">
            A few details, then the space is yours.
          </h1>
          <p className="mt-6 max-w-sm font-body text-sm leading-7 text-cream/60">
            We’ll personalise your weekly experience and make sure everyone joins the right room,
            safely.
          </p>
        </div>

        <div className="relative flex items-center gap-3 border-t border-cream/10 pt-6 font-body text-xs leading-5 text-cream/45">
          <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
          Your date of birth is private and never shown to other members.
        </div>
      </aside>

      <section className="flex min-h-screen flex-col px-5 pb-8 pt-6 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
        <header className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <Link
            to="/"
            className="rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden"
          >
            <img src={logoLight} alt="Mindcast home" className="h-7 sm:h-8" />
          </Link>
          <p className="ml-auto font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:tracking-[0.18em]">
            Step {currentStep} of {totalSteps}
          </p>
        </header>

        <div className="mx-auto mt-6 w-full max-w-2xl sm:mt-10 lg:mt-12">
          <div className="flex gap-2" aria-label={`Onboarding progress: step ${currentStep} of ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => (
              <div
                key={item}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  item <= currentStep ? "bg-primary" : "bg-foreground/10"
                }`}
                aria-current={item === currentStep ? "step" : undefined}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center py-8 sm:py-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="name"
                {...panelMotion}
                className="w-full"
                onSubmit={(event) => {
                  event.preventDefault();
                  setStep(2);
                }}
              >
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="portal-label mb-3">First, an introduction</p>
                <h2 className="max-w-xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                  What should we call you?
                </h2>
                <p className="mt-4 max-w-lg font-body text-sm leading-7 text-muted-foreground">
                  This is the name people will see at check-in. A first name or nickname is perfect.
                </p>

                <div className="mt-9 max-w-lg">
                  <label htmlFor="display-name" className="font-body text-sm font-semibold text-foreground">
                    Display name <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="e.g. Sam"
                    autoComplete="nickname"
                    autoFocus
                    className={fieldClass}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 sm:w-auto"
                >
                  Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="dob"
                {...panelMotion}
                className="w-full"
                onSubmit={(event) => {
                  event.preventDefault();
                  setDobTouched(true);
                  if (parsedDob && !isChild) setStep(3);
                }}
              >
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-lg pr-3 font-body text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
                <p className="portal-label mb-3">Your experience</p>
                <h2 className="max-w-xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                  When were you born?
                </h2>
                <p className="mt-4 max-w-lg font-body text-sm leading-7 text-muted-foreground">
                  We use this to place you in the right session. Your birth date never appears on
                  group screens.
                </p>

                <div className="mt-9 max-w-lg">
                  <label htmlFor="date-of-birth" className="font-body text-sm font-semibold text-foreground">
                    Date of birth
                  </label>
                  <input
                    id="date-of-birth"
                    type="text"
                    value={dobInput}
                    onChange={(event) => {
                      setDobInput(formatDobInput(event.target.value));
                      if (dobTouched) setDobTouched(false);
                    }}
                    onBlur={() => setDobTouched(true)}
                    placeholder="DD/MM/YYYY"
                    inputMode="numeric"
                    autoComplete="bday"
                    maxLength={10}
                    aria-describedby="dob-help dob-feedback"
                    aria-invalid={dobTouched && !parsedDob ? "true" : undefined}
                    autoFocus
                    className={`${fieldClass} font-mono tracking-[0.12em] ${
                      dobTouched && !parsedDob ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""
                    }`}
                  />
                  <div id="dob-help" className="mt-3 flex items-center gap-2 font-body text-xs text-muted-foreground">
                    <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Private to your profile
                  </div>
                  <div id="dob-feedback" aria-live="polite">
                    {dobTouched && !parsedDob && (
                      <p className="mt-3 font-body text-sm text-destructive" role="alert">
                        Enter a valid date in DD/MM/YYYY format.
                      </p>
                    )}
                  </div>
                </div>

                {isChild && (
                  <div className="mt-8 max-w-lg rounded-2xl border border-primary/15 bg-primary/[0.06] p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UsersRound className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-body text-sm font-semibold text-foreground">Kids join with a parent or guardian</h3>
                        <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                          Under-13s don’t create their own account. Ask a parent or guardian to add
                          you to their family membership instead.
                        </p>
                        <Link
                          to="/membership"
                          className="mt-4 inline-flex min-h-10 items-center font-body text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
                        >
                          Show them family membership
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {!isChild && (
                  <button
                    type="submit"
                    disabled={!parsedDob}
                    className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  >
                    Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </motion.form>
            )}

            {step === 3 && isTeen && (
              <motion.form
                key="guardian"
                {...panelMotion}
                className="w-full"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (guardianConsentRecorded) setStep(4);
                }}
              >
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-lg pr-3 font-body text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="portal-label mb-3">Guardian consent</p>
                <h2 className="max-w-xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                  One thing first.
                </h2>
                <p className="mt-4 max-w-xl font-body text-sm leading-7 text-muted-foreground">
                  Because you’re under 18, a parent or legal guardian must create or approve your
                  account from their Family &amp; Safety setup. You cannot record that consent on their behalf.
                </p>

                <div className={`mt-8 max-w-xl rounded-2xl border p-5 ${guardianConsentRecorded ? "border-primary/20 bg-primary/[0.05]" : "border-foreground/10 bg-white"}`}>
                  <p className="font-body text-sm font-semibold text-foreground">
                    {guardianConsentRecorded === null ? "Checking guardian approval…" : guardianConsentRecorded ? "Guardian approval recorded" : "Guardian approval not found"}
                  </p>
                  <p className="mt-2 font-body text-xs leading-5 text-muted-foreground">
                    {guardianConsentRecorded
                      ? "You can continue. Your teen account provides read-only lesson history, worksheet downloads and NFC check-in where your guardian has consented."
                      : "Ask your parent or legal guardian to sign in, open Family & Safety, and add your teen account. The annual participation form is completed there too."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={guardianConsentRecorded !== true}
                  className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.form>
            )}

            {step === totalSteps && (
              <motion.div key="sharing" {...panelMotion} className="w-full">
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-7 inline-flex min-h-10 items-center gap-2 rounded-lg pr-3 font-body text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
                <p className="portal-label mb-3">Your privacy</p>
                <h2 className="max-w-xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                  {isTeen ? "Your teen account is read-only." : "Would you like to share your weekly progress?"}
                </h2>
                <p className="mt-4 max-w-xl font-body text-sm leading-7 text-muted-foreground">
                  {isTeen
                    ? "You can use your login to see teen session history, download teen worksheets and use an NFC bracelet for check-in where your guardian has consented. Teen and child work is paper-based, so there is no digital journal and no submission tools."
                    : "This is completely optional. You can change your choice any time in settings."}
                </p>

                {!isTeen && <fieldset className="mt-8 grid max-w-xl gap-3">
                  <legend className="sr-only">Weekly progress sharing preference</legend>
                  {[
                    { value: true, title: "Yes, I’m happy to share", detail: "My group can celebrate how my weekly goal went." },
                    { value: false, title: "No, keep my progress private", detail: "My check-ins and progress stay visible only to me." },
                  ].map((option) => {
                    const selected = optIn === option.value;
                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setOptIn(option.value)}
                        className={`flex min-h-[84px] items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition focus:outline-none focus:ring-4 focus:ring-primary/10 sm:p-5 ${
                          selected ? "border-primary ring-1 ring-primary" : "border-foreground/10 hover:border-primary/35"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20"
                          }`}
                          aria-hidden="true"
                        >
                          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span>
                          <span className="block font-body text-sm font-semibold text-foreground">{option.title}</span>
                          <span className="mt-1 block font-body text-xs leading-5 text-muted-foreground">{option.detail}</span>
                        </span>
                      </button>
                    );
                  })}
                </fieldset>}

                {isTeen && (
                  <div className="mt-8 max-w-xl rounded-2xl border border-primary/15 bg-primary/[0.05] p-5 font-body text-sm leading-7 text-muted-foreground">
                    Your reflections stay on your printed worksheet. They are not uploaded to Mindcast and cannot be read by facilitators or admins through the app.
                  </div>
                )}

                <button
                  type="button"
                  onClick={finish}
                  disabled={(!isTeen && optIn === null) || saving || !user}
                  className="mt-10 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  {saving ? "Setting up your space…" : "Enter my member space"}
                  {!saving && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mx-auto w-full max-w-2xl border-t border-foreground/[0.07] pt-5 font-body text-xs leading-5 text-muted-foreground">
          Need a hand? <Link to="/contact" className="font-semibold text-foreground underline underline-offset-4">Contact us</Link>
        </footer>
      </section>
    </main>
  );
};

export default Onboarding;
