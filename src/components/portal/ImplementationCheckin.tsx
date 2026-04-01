import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ImplementationCheckinProps {
  weekNumber: number; // the CURRENT week — will pull commitment from weekNumber - 1
}

const STATUS_OPTIONS = [
  { value: "achieved", label: "ACHIEVED", color: "bg-green-600 text-white" },
  { value: "in_progress", label: "IN PROGRESS", color: "bg-amber-500 text-white" },
  { value: "carried_forward", label: "CARRIED FORWARD", color: "bg-blue-500 text-white" },
  { value: "not_started", label: "NOT STARTED", color: "bg-muted text-muted-foreground" },
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
      // Fetch previous week's commitment
      const { data: prevCommit } = await supabase
        .from("commitments")
        .select("commitment_text")
        .eq("user_id", user.id)
        .eq("cohort_id", cohortId)
        .eq("week_number", weekNumber - 1)
        .single();
      if (prevCommit?.commitment_text) setPrevCommitment(prevCommit.commitment_text);

      // Fetch existing checkin
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
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="border-[3px] border-amber-500/40 bg-amber-500/5 mb-6">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 md:p-6">
        <div className="text-left">
          <span className="text-[10px] tracking-widest text-amber-600">LAST WEEK'S IMPLEMENTATION CHECK-IN</span>
          <p className="text-sm text-primary font-body mt-1 italic">"{prevCommitment}"</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <Check size={12} className="text-green-600" />}
          {expanded ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-4">
          {/* Status selector */}
          <div>
            <span className="text-[10px] tracking-widest text-primary/40 block mb-2">STATUS</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update("status", opt.value)}
                  className={`text-[10px] tracking-widest px-3 py-1.5 border-2 transition-colors ${
                    checkin.status === opt.value ? opt.color + " border-transparent" : "border-primary/20 text-primary/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: "what_happened", label: "WHAT HAPPENED?", placeholder: "Describe how it went..." },
            { key: "did_achieve", label: "DID YOU ACHIEVE IT?", placeholder: "Be honest — no judgement..." },
            { key: "what_learned", label: "WHAT DID YOU LEARN?", placeholder: "What would you do differently?" },
          ].map(field => (
            <div key={field.key}>
              <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">{field.label}</label>
              <textarea
                value={(checkin as any)[field.key]}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[60px]"
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ImplementationCheckin;
