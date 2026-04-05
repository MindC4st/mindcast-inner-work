import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, GripVertical, Trash2, Plus } from "lucide-react";

const DEFAULT_FRAMEWORK = [
  { name: "The Landing", duration: 10, description: "Welcome wall live on screen. QR code visible. Members scan to check in and add a welcome note. No formal start — this is arrival time." },
  { name: "Looking Back", duration: 8, description: "Opt-in goal updates from members who chose to share. Facilitator reads 2–3 updates. No commentary — let them land." },
  { name: "The Source", duration: 40, description: "Play the video in full. Members have workbook open. No interruptions. This is the core of the session." },
  { name: "The Dig", duration: 10, description: "Quiet reflection time. Workbook questions displayed on screen. Members write in near-silence. Ambient music." },
  { name: "The Edge", duration: 5, description: "Goal and action step section of the workbook. One thing to do differently this week. Private — no group sharing required." },
  { name: "The Close", duration: 5, description: "Word cloud builds on screen as members submit their leaving word. One brief closing thought from the facilitator. See you next week." },
];

const AdminFramework = () => {
  const [steps, setSteps] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("framework_steps").select("*").order("step_order").then(({ data }) => {
      if (data && data.length > 0) {
        setSteps(data);
      } else {
        setSteps(DEFAULT_FRAMEWORK.map((s, i) => ({ ...s, step_order: i + 1, id: `new-${i}` })));
      }
    });
  }, []);

  const updateStep = (idx: number, field: string, value: any) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 })));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, { id: `new-${Date.now()}`, step_order: prev.length + 1, name: "", duration: 5, description: "" }]);
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const arr = [...steps];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setSteps(arr.map((s, i) => ({ ...s, step_order: i + 1 })));
  };

  const save = async () => {
    setSaving(true);
    // Delete all existing, then insert
    await supabase.from("framework_steps").delete().gte("step_order", 0);
    const { error } = await supabase.from("framework_steps").insert(
      steps.map((s, i) => ({ step_order: i + 1, name: s.name, duration: s.duration, description: s.description }))
    );
    setSaving(false);
    if (error) toast({ title: "Error saving", description: error.message, variant: "destructive" });
    else toast({ title: "Framework saved" });
  };

  const totalMinutes = steps.reduce((sum, s) => sum + (s.duration || 0), 0);
  const inputClass = "bg-transparent border-b border-white/10 text-white font-body text-sm py-2 px-1 focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/15";

  return (
    <div className="min-h-screen" style={{ background: "#0D0B14", color: "#fff" }}>
      <nav className="flex items-center px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-white/30 text-[10px] tracking-[0.12em] font-body hover:text-white/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-20">
        <h1 className="font-display text-2xl font-bold text-white mb-8">Session Framework</h1>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.id} className="border border-white/[0.06] p-4 group hover:border-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-2">
                  <button onClick={() => moveStep(idx, idx - 1)} className="text-white/10 hover:text-white/30 text-xs">▲</button>
                  <GripVertical size={14} className="text-white/10" />
                  <button onClick={() => moveStep(idx, idx + 1)} className="text-white/10 hover:text-white/30 text-xs">▼</button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white/15 text-xs font-body w-6">{idx + 1}.</span>
                    <input value={step.name} onChange={(e) => updateStep(idx, "name", e.target.value)} placeholder="Step name" className={`flex-1 ${inputClass}`} />
                    <input type="number" min={1} value={step.duration} onChange={(e) => updateStep(idx, "duration", +e.target.value)} className={`w-16 text-center ${inputClass}`} />
                    <span className="text-white/15 text-[9px] font-body">min</span>
                  </div>
                  <textarea value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)} placeholder="Description..." className={`w-full min-h-[40px] resize-none ${inputClass} ml-9`} />
                </div>
                <button onClick={() => removeStep(idx)} className="text-white/10 hover:text-red-400/50 transition-colors pt-2">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addStep} className="mt-4 flex items-center gap-2 text-white/20 text-xs font-body hover:text-white/40 transition-colors">
          <Plus size={14} /> Add step
        </button>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-white/20 text-xs font-body">Total runtime: <span className="text-white/50">{totalMinutes} minutes</span></p>
          <button onClick={save} disabled={saving} className="px-6 py-3 bg-white text-[#0D0B14] text-xs tracking-[0.15em] font-display font-bold hover:bg-white/90 transition-colors disabled:opacity-30">
            {saving ? "..." : "SAVE FRAMEWORK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFramework;
