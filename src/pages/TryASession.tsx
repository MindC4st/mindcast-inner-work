import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  TicketCheck,
  UsersRound,
  X,
} from "lucide-react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Ripple from "@/components/brand/Ripple";
import { supabase } from "@/integrations/supabase/client";
import { MinorDraft, ageGroupForDob, maskEmail } from "@/lib/familyTrial";
import { describeFunctionError } from "@/lib/functionError";
import membershipTrial from "@/assets/membership-trial.jpg";

// /try is an adult-led household trial. Preserve these rules when editing:
// - One adult registers and may bring children/teens to the same session.
// - Under-18s never register or attend independently.
// - There is no payment, account, subscription, or cancellation step.
// - The server remains authoritative for trial eligibility and check-in.

type State = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  minors: MinorDraft[];
  guardian_consent: boolean;
};

type Step = 1 | 2;

const emptyMinor = (): MinorDraft => ({
  first_name: "",
  last_name: "",
  dob: "",
  email: "",
});

const fieldClass =
  "min-h-12 w-full rounded-sm border border-[hsl(var(--warm-border))] bg-white px-4 py-3 font-body text-sm text-[hsl(var(--navy))] outline-none transition placeholder:text-[hsl(var(--navy-mid))]/40 focus:border-[hsl(var(--blue))] focus:ring-2 focus:ring-[hsl(var(--blue))]/10";

const eyebrowClass =
  "font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[hsl(var(--blue))]";

const formatDob = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const dobToIso = (displayDob: string): string | null => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(displayDob.trim());
  if (!match) return null;

  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(`${iso}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day) ||
    date > new Date()
  ) {
    return null;
  }

  return iso;
};

const trialDetails = [
  {
    icon: Clock3,
    title: "One Sunday session",
    copy: "Experience the room before deciding whether membership is for you.",
  },
  {
    icon: UsersRound,
    title: "Bring your household",
    copy: "Children and teens can try their age-tailored room when they come with you.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing to unwind",
    copy: "No payment details, account, subscription, or cancellation required.",
  },
];

const Field = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <label className="block">
    <span className="mb-2 block font-body text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--navy-mid))]">
      {label}
    </span>
    <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />
  </label>
);

const StepMarker = ({ step }: { step: Step }) => (
  <div className="mb-8" aria-label={`Step ${step} of 2`}>
    <div className="mb-3 flex items-center justify-between">
      <span className={eyebrowClass}>Your free pass</span>
      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--navy-mid))]/55">
        Step {step} of 2
      </span>
    </div>
    <div className="grid grid-cols-2 gap-2" aria-hidden="true">
      <span className="h-1 rounded-full bg-[hsl(var(--blue))]" />
      <span
        className={`h-1 rounded-full transition-colors ${
          step === 2 ? "bg-[hsl(var(--blue))]" : "bg-[hsl(var(--warm-border))]"
        }`}
      />
    </div>
  </div>
);

const Success = ({ email, minors }: { email: string; minors: number }) => (
  <div className="min-h-screen bg-[hsl(var(--ivory))]">
    <SiteHeader />
    <main className="px-5 pb-20 pt-32 sm:px-6 sm:pt-36">
      <div className="paper-card mx-auto max-w-2xl overflow-hidden rounded-[2rem]">
        <div className="linen-panel relative overflow-hidden border-x-0 border-t-0 px-7 py-12 text-center sm:px-14 sm:py-16">
          <Ripple className="absolute -right-12 -top-12 h-52 w-52 text-primary/10" />
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
            <TicketCheck size={28} strokeWidth={1.5} />
          </div>
          <p className="relative mb-3 font-body text-[10px] font-bold uppercase tracking-[0.34em] text-[hsl(var(--silver))]">
            Your place is held
          </p>
          <h1 className="relative font-display text-5xl leading-[0.9] tracking-wide text-foreground sm:text-6xl">
            CHECK YOUR EMAIL.
          </h1>
        </div>

        <div className="px-7 py-9 sm:px-14 sm:py-12">
          <p className="font-body text-base leading-7 text-[hsl(var(--navy-mid))]">
            {minors > 0 ? "Your free Mindcast passes are on their way to " : "Your free Mindcast pass is on its way to "}
            <strong className="text-[hsl(var(--navy))]">{maskEmail(email)}</strong>.
          </p>

          <div className="my-8 space-y-4 border-y border-[hsl(var(--warm-border))] py-7">
            {[
              "Open the email and keep the QR code handy.",
              "Come to a Sunday session that works for your household.",
              minors > 0
                ? "Arrive and check in together; under-18 passes only work with their adult."
                : "Show the QR code at the door and we’ll take it from there.",
            ].map((item) => (
              <div key={item} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--blue))]/10 text-[hsl(var(--blue))]">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <p className="font-body text-sm leading-6 text-[hsl(var(--navy-mid))]">{item}</p>
              </div>
            ))}
          </div>

          {minors > 0 && (
            <p className="mb-8 font-body text-xs leading-6 text-[hsl(var(--navy-mid))]/70">
              Teens with an email address receive their own pass. Children remain linked to the adult household booking.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/curriculum"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[hsl(var(--blue))] px-6 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[hsl(var(--navy-mid))]"
            >
              Look inside the curriculum <ArrowRight size={15} />
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center px-6 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--navy-mid))] transition hover:text-[hsl(var(--blue))]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
    <SiteFooter />
  </div>
);

const TryASession = () => {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<State>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    minors: [],
    guardian_consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; minors: number } | null>(null);

  const validAdultDetails = Boolean(
    form.first_name.trim() &&
      form.last_name.trim() &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()),
  );

  const minorRows = useMemo(
    () =>
      form.minors.map((minor) => {
        const isoDob = dobToIso(minor.dob);
        return {
          ...minor,
          isoDob,
          group: ageGroupForDob(isoDob ?? ""),
        };
      }),
    [form.minors],
  );

  const minorsAreValid = minorRows.every(
    (minor) =>
      minor.first_name.trim() &&
      minor.last_name.trim() &&
      minor.isoDob &&
      (minor.group !== "teen" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(minor.email.trim())),
  );

  const canSubmit =
    validAdultDetails &&
    minorsAreValid &&
    (form.minors.length === 0 || form.guardian_consent);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setMinor = (index: number, patch: Partial<MinorDraft>) =>
    setForm((current) => ({
      ...current,
      minors: current.minors.map((minor, row) =>
        row === index ? { ...minor, ...patch } : minor,
      ),
    }));

  const addMinor = () =>
    setForm((current) => ({
      ...current,
      minors: [...current.minors, emptyMinor()],
      guardian_consent: false,
    }));

  const removeMinor = (index: number) =>
    setForm((current) => {
      const minors = current.minors.filter((_, row) => row !== index);
      return {
        ...current,
        minors,
        guardian_consent: minors.length ? current.guardian_consent : false,
      };
    });

  const goToHousehold = () => {
    if (!validAdultDetails) {
      setError("Add your name and a valid email address to continue.");
      return;
    }
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 1) {
      goToHousehold();
      return;
    }

    if (!canSubmit) {
      setError(
        form.minors.length && !form.guardian_consent
          ? "Please confirm parent or guardian consent before requesting the passes."
          : "Check the highlighted household details before continuing.",
      );
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const minors = minorRows.map((minor) => ({
        first_name: minor.first_name.trim(),
        last_name: minor.last_name.trim(),
        dob: minor.isoDob,
        email: minor.group === "teen" ? minor.email.trim() : null,
      }));

      const { data, error: functionError } = await supabase.functions.invoke(
        "issue-trial-ticket",
        {
          body: {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            minors,
            guardian_consent: form.guardian_consent,
          },
        },
      );

      if (functionError) throw functionError;

      const response = data as { ok?: boolean; message?: string };
      if (!response?.ok) {
        setError(response?.message ?? "Could not create your ticket.");
        return;
      }

      setDone({ email: form.email, minors: minors.length });
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (caught) {
      const described = await describeFunctionError(
        caught,
        {
          409: "This household has already used its free session. Join as a member to come back.",
        },
        "Could not create your ticket. Please try again.",
      );
      setError(described.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) return <Success email={done.email} minors={done.minors} />;

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <SiteHeader />

      <main className="pb-24 pt-16">
        <section className="linen-panel relative overflow-hidden border-x-0 border-t-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,hsl(var(--mist)/0.35),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-20">
              <p className={`${eyebrowClass} mb-5`}>One session. No pressure.</p>
              <h1 className="max-w-xl font-display text-[clamp(3.5rem,7vw,6.7rem)] leading-[0.84] tracking-[-0.02em] text-primary">
                COME AND SIT IN THE ROOM.
              </h1>
              <p className="mt-7 max-w-lg font-serif text-xl italic leading-8 text-[hsl(var(--navy-mid))] sm:text-2xl">
                See what a Mindcast Sunday feels like before you decide anything.
              </p>
            </div>

            <div className="relative min-h-[360px] overflow-hidden lg:min-h-[610px]">
              <img
                src={membershipTrial}
                alt="A Mindcast session in Taupō"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))]/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 grid gap-px overflow-hidden rounded-sm bg-white/20 backdrop-blur-md sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {["Free", "Adult-led", "Household welcome"].map((label) => (
                  <span
                    key={label}
                    className="bg-[hsl(var(--navy))]/75 px-4 py-3 text-center font-body text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className={`${eyebrowClass} mb-4`}>What you’re saying yes to</p>
              <h2 className="max-w-sm font-display text-4xl leading-[0.95] tracking-wide text-primary sm:text-5xl">
                JUST ENOUGH TO KNOW IF IT’S FOR YOU.
              </h2>

              <div className="mt-9 divide-y divide-[hsl(var(--warm-border))] border-y border-[hsl(var(--warm-border))]">
                {trialDetails.map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="flex gap-4 py-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--blue))]/10 text-[hsl(var(--blue))]">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="font-body text-sm font-bold text-primary">{title}</h3>
                      <p className="mt-1 font-body text-xs leading-5 text-[hsl(var(--navy-mid))]/75">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 font-body text-xs leading-5 text-[hsl(var(--navy-mid))]/65">
                Under-18s attend and check in with their parent or guardian. Their experience is age-tailored, not a smaller version of the adult room.
              </p>
            </aside>

            <div className="overflow-hidden rounded-[1.5rem] border border-[hsl(var(--warm-border))] bg-[hsl(var(--ivory))] shadow-[0_18px_60px_rgba(16,36,56,0.07)] sm:rounded-[2rem]">
              <form onSubmit={submit} noValidate>
                <div className="bg-white px-6 py-8 sm:px-10 sm:py-10">
                  <StepMarker step={step} />

                  <AnimatePresence mode="wait" initial={false}>
                    {step === 1 ? (
                      <motion.div
                        key="adult-details"
                        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: 16 }}
                        transition={{ duration: 0.24 }}
                      >
                        <h2 className="font-display text-4xl tracking-wide text-primary">
                          FIRST, YOUR DETAILS.
                        </h2>
                        <p className="mt-2 max-w-xl font-body text-sm leading-6 text-[hsl(var(--navy-mid))]/75">
                          The adult attending completes the booking. We’ll send every household pass to this email.
                        </p>

                        <div className="mt-8 grid gap-5 sm:grid-cols-2">
                          <Field
                            label="First name"
                            type="text"
                            autoComplete="given-name"
                            value={form.first_name}
                            onChange={(event) => set("first_name", event.target.value)}
                            required
                          />
                          <Field
                            label="Last name"
                            type="text"
                            autoComplete="family-name"
                            value={form.last_name}
                            onChange={(event) => set("last_name", event.target.value)}
                            required
                          />
                          <Field
                            label="Email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => set("email", event.target.value)}
                            required
                            className="sm:col-span-2"
                          />
                          <Field
                            label="Phone (optional)"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={form.phone}
                            onChange={(event) => set("phone", event.target.value)}
                            className="sm:col-span-2"
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="household-details"
                        initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
                        transition={{ duration: 0.24 }}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <h2 className="font-display text-4xl tracking-wide text-primary">
                              WHO’S COMING WITH YOU?
                            </h2>
                            <p className="mt-2 max-w-xl font-body text-sm leading-6 text-[hsl(var(--navy-mid))]/75">
                              Leave this as “just me”, or add up to six children and teens from your household.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="hidden min-h-11 shrink-0 items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--navy-mid))] transition hover:text-[hsl(var(--blue))] sm:inline-flex"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                        </div>

                        {form.minors.length === 0 ? (
                          <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <div className="flex min-h-28 items-center gap-4 rounded-sm border-2 border-[hsl(var(--blue))] bg-[hsl(var(--blue))]/5 p-5">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--blue))] text-white">
                                <Check size={17} />
                              </span>
                              <div>
                                <p className="font-body text-sm font-bold text-[hsl(var(--navy))]">Just me</p>
                                <p className="mt-1 font-body text-xs text-[hsl(var(--navy-mid))]/65">One adult pass</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={addMinor}
                              className="flex min-h-28 items-center gap-4 rounded-sm border border-dashed border-[hsl(var(--blue))]/45 bg-[hsl(var(--ivory))] p-5 text-left transition hover:border-[hsl(var(--blue))] hover:bg-[hsl(var(--blue))]/5"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--blue))]/30 text-[hsl(var(--blue))]">
                                <Plus size={17} />
                              </span>
                              <div>
                                <p className="font-body text-sm font-bold text-[hsl(var(--navy))]">Add my household</p>
                                <p className="mt-1 font-body text-xs text-[hsl(var(--navy-mid))]/65">Child or teen passes</p>
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div className="mt-8 space-y-4">
                            {minorRows.map((minor, index) => {
                              const invalidDob = Boolean(minor.dob.length === 10 && !minor.isoDob);
                              return (
                                <fieldset
                                  key={index}
                                  className="rounded-sm border border-[hsl(var(--warm-border))] bg-[hsl(var(--ivory))] p-4 sm:p-5"
                                >
                                  <legend className="sr-only">Child or teen {index + 1}</legend>
                                  <div className="mb-4 flex items-center justify-between">
                                    <div>
                                      <p className={eyebrowClass}>
                                        {minor.group === "teen"
                                          ? "Teen"
                                          : minor.group === "child"
                                            ? "Child"
                                            : `Child or teen ${index + 1}`}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeMinor(index)}
                                      className="flex h-11 w-11 items-center justify-center text-[hsl(var(--navy-mid))]/55 transition hover:text-[hsl(var(--navy))]"
                                      aria-label={`Remove child or teen ${index + 1}`}
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>

                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                      label="First name"
                                      type="text"
                                      autoComplete="off"
                                      value={minor.first_name}
                                      onChange={(event) =>
                                        setMinor(index, { first_name: event.target.value })
                                      }
                                      required
                                    />
                                    <Field
                                      label="Last name"
                                      type="text"
                                      autoComplete="off"
                                      value={minor.last_name}
                                      onChange={(event) =>
                                        setMinor(index, { last_name: event.target.value })
                                      }
                                      required
                                    />
                                    <div className="sm:col-span-2">
                                      <Field
                                        label="Date of birth — DD/MM/YYYY"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="bday"
                                        placeholder="DD/MM/YYYY"
                                        value={minor.dob}
                                        onChange={(event) =>
                                          setMinor(index, { dob: formatDob(event.target.value) })
                                        }
                                        aria-invalid={invalidDob}
                                        aria-describedby={`dob-help-${index}`}
                                        required
                                      />
                                      <p
                                        id={`dob-help-${index}`}
                                        className={`mt-2 font-body text-[11px] leading-5 ${
                                          invalidDob
                                            ? "text-destructive"
                                            : "text-[hsl(var(--navy-mid))]/60"
                                        }`}
                                      >
                                        {invalidDob
                                          ? "Enter a real date in DD/MM/YYYY format."
                                          : "This assigns the correct child or teen room."}
                                      </p>
                                    </div>

                                    {minor.group === "teen" && (
                                      <div className="sm:col-span-2">
                                        <Field
                                          label="Teen’s email address"
                                          type="email"
                                          inputMode="email"
                                          autoComplete="off"
                                          value={minor.email}
                                          onChange={(event) =>
                                            setMinor(index, { email: event.target.value })
                                          }
                                          required
                                        />
                                        <p className="mt-2 font-body text-[11px] leading-5 text-[hsl(var(--navy-mid))]/60">
                                          Teens receive a separate pass so their attendance can be recorded privately.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </fieldset>
                              );
                            })}

                            {form.minors.length < 6 && (
                              <button
                                type="button"
                                onClick={addMinor}
                                className="inline-flex min-h-11 items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--blue))]"
                              >
                                <Plus size={15} /> Add another child or teen
                              </button>
                            )}

                            <div className="rounded-sm border border-[hsl(var(--blue))]/20 bg-[hsl(var(--blue))]/5 p-5">
                              <div className="mb-3 flex items-center gap-3">
                                <ShieldCheck size={19} className="text-[hsl(var(--blue))]" />
                                <p className="font-body text-xs font-bold uppercase tracking-[0.15em] text-[hsl(var(--navy))]">
                                  Parent or guardian consent
                                </p>
                              </div>
                              <label className="flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={form.guardian_consent}
                                  onChange={(event) =>
                                    set("guardian_consent", event.target.checked)
                                  }
                                  className="mt-1 h-4 w-4 accent-[hsl(var(--blue))]"
                                />
                                <span className="font-body text-xs leading-5 text-[hsl(var(--navy-mid))]">
                                  I am the parent or legal guardian of the children or teens listed. I consent to them attending with me and understand they cannot check in or attend without me.
                                </span>
                              </label>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <p
                      className="mt-6 rounded-sm border border-destructive/20 bg-destructive/5 px-4 py-3 font-body text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </p>
                  )}
                </div>

                <div className="border-t border-[hsl(var(--warm-border))] bg-[hsl(var(--ivory))] px-6 py-6 sm:px-10">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 font-body text-[11px] leading-5 text-[hsl(var(--navy-mid))]/60">
                      <Mail size={14} /> Passes are delivered by email.
                    </p>

                    {step === 1 ? (
                      <button
                        type="submit"
                        className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-[hsl(var(--blue))] px-7 py-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[hsl(var(--navy-mid))] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continue <ArrowRight size={15} />
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="inline-flex min-h-[52px] items-center justify-center gap-2 px-5 py-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--navy-mid))] sm:hidden"
                        >
                          <ArrowLeft size={15} /> Back
                        </button>
                        <button
                          type="submit"
                          disabled={busy}
                          className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-[hsl(var(--blue))] px-7 py-4 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[hsl(var(--navy-mid))] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {busy ? (
                            <>
                              <Loader2 size={15} className="animate-spin" /> Sending passes…
                            </>
                          ) : form.minors.length ? (
                            <>
                              Get our free passes <ArrowRight size={15} />
                            </>
                          ) : (
                            <>
                              Get my free pass <ArrowRight size={15} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="mt-5 font-body text-[10px] leading-5 text-[hsl(var(--navy-mid))]/55">
                    We hold these details to manage your visit and contact you about it. Read our{" "}
                    <Link to="/privacy" className="underline underline-offset-2 hover:text-[hsl(var(--navy))]">
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default TryASession;