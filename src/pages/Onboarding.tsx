import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

// Onboarding with the age gate the safeguarding policy requires:
//   - Under-13s cannot self-register. A guardian adds them to a household
//     from their own account; the child never holds the pen here.
//   - 13–17s must record guardian consent (name + contact) before the
//     account completes. The record lands in guardian_consents, revocable.
//   - Age comes from a date of birth, not from a self-selected label.

const inputClass =
  "w-full bg-transparent border-b border-border text-foreground font-body text-sm py-3 px-1 text-center focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50";

const primaryBtn =
  "mt-8 w-full py-3.5 bg-primary text-primary-foreground text-xs tracking-[0.15em] font-display font-bold hover:bg-primary/90 transition-colors disabled:opacity-30";

const ageFrom = (dob: string): number | null => {
  if (!dob) return null;
  const d = new Date(dob + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 && age < 120 ? age : null;
};

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [dob, setDob] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianAgrees, setGuardianAgrees] = useState(false);
  const [optIn, setOptIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const age = useMemo(() => ageFrom(dob), [dob]);
  const isTeen = age !== null && age >= 13 && age < 18;
  const isChild = age !== null && age < 13;

  const finish = async () => {
    if (!user || age === null || isChild) return;
    if (isTeen && (!guardianName.trim() || !guardianContact.trim() || !guardianAgrees)) return;
    setSaving(true);
    try {
      // Teen consent is written first. Only after that succeeds do we mark
      // onboarding complete, so a partial save cannot bypass the age gate.
      if (isTeen) {
        let profileId = profile?.id as string | undefined;
        if (!profileId) {
          const { data, error } = await supabase
            .from("profiles").select("id").eq("user_id", user.id).maybeSingle();
          if (error) throw error;
          profileId = data?.id;
        }
        if (!profileId) throw new Error("Profile not found");

        const { data: existingConsent, error: consentReadError } = await supabase
          .from("guardian_consents")
          .select("id")
          .eq("subject_profile_id", profileId)
          .eq("consent_type", "teen_membership")
          .is("revoked_at", null)
          .limit(1)
          .maybeSingle();
        if (consentReadError) throw consentReadError;

        if (!existingConsent) {
          const contact = guardianContact.trim();
          const { error: consentWriteError } = await supabase.from("guardian_consents").insert({
            subject_profile_id: profileId,
            consent_type: "teen_membership",
            guardian_name: guardianName.trim(),
            guardian_email: contact.includes("@") ? contact : null,
            guardian_phone: contact.includes("@") ? null : contact,
            recorded_by: user.id,
          });
          if (consentWriteError) throw consentWriteError;
        }
      }

      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || undefined,
          age_group: isTeen ? "teen" : "adult",
          date_of_birth: dob,
          opt_in_public_goals: optIn ?? false,
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

  const totalSteps = isTeen ? 4 : 3;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 section-cream">
      <div className="w-full max-w-md">
        <div className="flex justify-center gap-2 mb-12">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-primary" : s < step ? "bg-primary/40" : "bg-primary/15"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Welcome to Mindcast.</h2>
              <p className="text-muted-foreground/70 text-sm font-body mb-10">What should we call you on screen at check-in?</p>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className={inputClass}
                autoFocus
              />
              <button onClick={() => setStep(2)} className={primaryBtn}>CONTINUE</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">When were you born?</h2>
              <p className="text-muted-foreground/60 text-xs font-body mb-8">
                We use this once, to put you in the right room. It never appears on any screen.
              </p>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                aria-label="Date of birth"
                className={inputClass}
              />

              {isChild && (
                <div className="mt-8 border border-border bg-primary/5 p-5 text-left">
                  <p className="text-foreground font-body text-sm font-semibold mb-2">
                    Kids join through a parent.
                  </p>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed">
                    Under-13s can't create their own account — a parent or guardian adds you to
                    their family membership, and you'll be signed in and out of the kids' room by
                    them each week. Show them this page:{" "}
                    <Link to="/membership" className="underline text-foreground">mindcast.co.nz/membership</Link>
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={age === null || isChild}
                className={primaryBtn}
              >
                {isChild ? "ASK A PARENT TO SIGN YOU UP" : "CONTINUE"}
              </button>
            </motion.div>
          )}

          {step === 3 && isTeen && (
            <motion.div key="step3-guardian" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">One thing first — your parent or guardian.</h2>
              <p className="text-muted-foreground/60 text-xs font-body mb-8 leading-relaxed">
                Because you're under 18, we record that a parent or guardian knows you're joining
                and agrees. We may contact them to confirm. Your journal stays private — they
                never see what you write.
              </p>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent or guardian's full name"
                className={inputClass}
              />
              <input
                type="text"
                value={guardianContact}
                onChange={(e) => setGuardianContact(e.target.value)}
                placeholder="Their email or phone"
                className={`${inputClass} mt-4`}
              />
              <label className="flex items-start gap-3 mt-6 text-left cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardianAgrees}
                  onChange={(e) => setGuardianAgrees(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span className="text-muted-foreground font-body text-xs leading-relaxed">
                  My parent or guardian knows I'm creating this account and agrees to me taking
                  part in Mindcast teen sessions.
                </span>
              </label>
              <button
                onClick={() => setStep(4)}
                disabled={!guardianName.trim() || !guardianContact.trim() || !guardianAgrees}
                className={primaryBtn}
              >
                CONTINUE
              </button>
            </motion.div>
          )}

          {step === totalSteps && (
            <motion.div key="step-final" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-3">
                When you set a goal each week, would you like to share how it went with the group?
              </h2>
              <p className="text-muted-foreground/60 text-xs font-body mb-8">Completely optional — you can change this anytime.</p>
              <div className="space-y-3">
                <button
                  onClick={() => setOptIn(true)}
                  className={`w-full py-4 px-5 text-left text-sm font-body border transition-all ${
                    optIn === true ? "border-primary text-foreground bg-primary/5" : "border-border text-muted-foreground/70 hover:border-primary/40"
                  }`}
                >
                  Yes — I'm happy to share
                </button>
                <button
                  onClick={() => setOptIn(false)}
                  className={`w-full py-4 px-5 text-left text-sm font-body border transition-all ${
                    optIn === false ? "border-primary text-foreground bg-primary/5" : "border-border text-muted-foreground/70 hover:border-primary/40"
                  }`}
                >
                  No — I prefer to keep my progress private
                </button>
              </div>
              <button onClick={finish} disabled={optIn === null || saving} className={primaryBtn}>
                {saving ? "..." : "GET STARTED"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
