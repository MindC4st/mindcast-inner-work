import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ImplementationCheckinProps {
  weekNumber: number;
}

const STATUS_OPTIONS = [
  { value: "achieved", label: "Achieved", style: "bg-foreground text-primary-foreground" },
  { value: "in_progress", label: "In Progress", style: "bg-foreground/60 text-primary-foreground" },
  { value: "carried_forward", label: "Carried Forward", style: "bg-foreground/30 text-primary-foreground" },
  { value: "not_started", label: "Not Started", style: "bg-foreground/[0.06] text-muted-foreground" },
];

const ImplementationCheckin = ({ weekNumber }: ImplementationCheckinProps) => {
  const { user, cohortId } = useAuth();
  const [prevCommitment, setPrevCommitment] = useState<string>("");
  const [checkin, setCheckin] = useState({ what_happened: "", did_achieve: "", what_learned: "", status: "not_started" });
  const [expanded, setExpanded] = useState(true);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !cohortId || weekNumber <= 1) return;
    const load = async () => {
      const { data: prevCommit } = await supabase
        .from("commitments")
        .select("commitment_text")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId)
        .eq("week_number", weekNumber - 1)
        .single();
      if (prevCommit?.commitment_text) setPrevCommitment(prevCommit.commitment_text);

      const { data: existing } = await supabase
        .from("implementation_checkins")
        .select("*")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId)
        .eq("week_number", weekNumber)
        .single();
      if (existing) {
        setCheckin({
          what_happened: existing.what_happened || "",
          did_achieve: existing.did_achieve || "",
          what_learned: existing.what_learned || "",
          status: existing.status || "not_started",
        });
      }
    };
    load();
  }, [user, cohortId, weekNumber]);

  const saveCheckin = useCallback(async (data: typeof checkin) => {
    if (!user || !cohortId) return;
    await supabase.from("implementation_checkins").upsert({
      user_id: user.id,
      cohort_id: cohortId,
      week_number: weekNumber,
      ...data,
    }, { onConflict: "user_id,cohort_id,week_number" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [user, cohortId, weekNumber]);

  const update = (field: string, value: string) => {
    const updated = { ...checkin, [field]: value };
    setCheckin(updated);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveCheckin(updated), 1000);
  };

  if (weekNumber <= 1 || !prevCommitment) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="portal-card mb-8">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-5 md:p-6">
        <div className="text-left">
          <span className="portal-label text-[9px]">Check in first — last week's commitment</span>
          <p className="font-serif text-sm text-foreground/70 mt-1.5 italic leading-relaxed">"{prevCommitment}"</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Check size={12} className="text-foreground/40" />}
          {expanded ? <ChevronUp size={16} className="text-foreground/30" /> : <ChevronDown size={16} className="text-foreground/30" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-5 border-t border-foreground/[0.04] pt-5">
          {/* Status selector */}
          <div>
            <span className="portal-label block mb-2.5">How did it go?</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update("status", opt.value)}
                  className={`text-[10px] tracking-[0.12em] px-4 py-2 font-body transition-all duration-200 ${
                    checkin.status === opt.value ? opt.style : "bg-foreground/[0.03] text-muted-foreground/50 hover:bg-foreground/[0.06]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {([
            { key: "what_happened", label: "What happened?", placeholder: "Describe how it went..." },
            { key: "did_achieve", label: "Did you achieve it?", placeholder: "Be honest — no judgement..." },
            { key: "what_learned", label: "What did you learn?", placeholder: "What would you do differently?" },
          ] as const).map(field => (
            <div key={field.key}>
              <label className="portal-label block mb-1.5">{field.label}</label>
              <textarea
                value={checkin[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-foreground/[0.02] text-foreground p-3 text-sm font-body font-light border border-foreground/[0.07] focus:border-foreground/20 focus:outline-none resize-none min-h-[70px] leading-relaxed placeholder:text-muted-foreground/30"
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ImplementationCheckin;
