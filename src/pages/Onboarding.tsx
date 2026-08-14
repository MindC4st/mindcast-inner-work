import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const AGE_OPTIONS = [
  { value: "adult", label: "Adult sessions (18+)" },
  { value: "teen", label: "Teen sessions (13–24)" },
  { value: "parent", label: "I'm a parent bringing kids" },
  { value: "all", label: "All of the above" },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [ageGroup, setAgeGroup] = useState<string[]>([]);
  const [optIn, setOptIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const toggleAge = (val: string) => {
    setAgeGroup((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const resolvedAge = ageGroup.includes("all") || ageGroup.length > 1 ? "adult" : ageGroup[0] || "adult";
    await supabase
      .from("profiles")
      .update({
        display_name: displayName || undefined,
        age_group: resolvedAge,
        opt_in_public_goals: optIn ?? false,
        onboarding_complete: true,
      })
      .eq("user_id", user.id);
    setSaving(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 section-navy">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-cream" : s < step ? "bg-cream/40" : "bg-cream/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="font-display text-2xl font-bold text-cream mb-2">Welcome to Mindcast.</h2>
              <p className="text-cream/40 text-sm font-body mb-10">
                What should we call you on screen at check-in?
              </p>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="w-full bg-transparent border-b border-cream/15 text-cream font-body text-sm py-3 px-1 text-center focus:outline-none focus:border-cream/40 transition-colors placeholder:text-cream/20"
                autoFocus
              />
              <button
                onClick={() => setStep(2)}
                className="mt-10 w-full py-3.5 bg-cream text-navy text-xs tracking-[0.15em] font-display font-bold hover:bg-cream/90 transition-colors"
              >
                CONTINUE
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="font-display text-xl font-bold text-cream mb-2">
                Which sessions will you be attending?
              </h2>
              <p className="text-cream/30 text-xs font-body mb-8">Tap to select — you can choose more than one</p>

              <div className="space-y-3">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleAge(opt.value)}
                    className={`w-full py-4 px-5 text-left text-sm font-body border transition-all ${
                      ageGroup.includes(opt.value)
                        ? "border-cream/40 text-cream bg-cream/5"
                        : "border-cream/10 text-cream/40 hover:border-cream/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={ageGroup.length === 0}
                className="mt-8 w-full py-3.5 bg-cream text-navy text-xs tracking-[0.15em] font-display font-bold hover:bg-cream/90 transition-colors disabled:opacity-30"
              >
                CONTINUE
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="font-display text-xl font-bold text-cream mb-3">
                When you set a goal each week, would you like to share how it went with the group?
              </h2>
              <p className="text-cream/30 text-xs font-body mb-8">
                Completely optional — you can change this anytime.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setOptIn(true)}
                  className={`w-full py-4 px-5 text-left text-sm font-body border transition-all ${
                    optIn === true
                      ? "border-cream/40 text-cream bg-cream/5"
                      : "border-cream/10 text-cream/40 hover:border-cream/20"
                  }`}
                >
                  Yes — I'm happy to share
                </button>
                <button
                  onClick={() => setOptIn(false)}
                  className={`w-full py-4 px-5 text-left text-sm font-body border transition-all ${
                    optIn === false
                      ? "border-cream/40 text-cream bg-cream/5"
                      : "border-cream/10 text-cream/40 hover:border-cream/20"
                  }`}
                >
                  No — I prefer to keep my progress private
                </button>
              </div>

              <button
                onClick={finish}
                disabled={optIn === null || saving}
                className="mt-8 w-full py-3.5 bg-cream text-navy text-xs tracking-[0.15em] font-display font-bold hover:bg-cream/90 transition-colors disabled:opacity-30"
              >
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
