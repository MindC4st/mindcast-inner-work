import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Checkpoint, evaluateCheckpoint, evaluateModule, moduleStatus,
  memberContactCurrent, expiresFrom, GATE_LABEL, STATUS_LABEL, type ResponseValue,
} from "@/lib/training";
import { Check, ChevronDown, ChevronUp, Loader2, ShieldCheck, ArrowLeft, Clock } from "lucide-react";

type DBModule = { id: string; code: string; title: string; summary: string; position: number; gate: string; pass_mark: number | null; ack_required: boolean; version: number; est_minutes: number };
type DBLesson = { id: string; module_id: string; position: number; title: string; body: string };
type DBCheckpoint = { id: string; lesson_id: string | null; module_id: string | null; position: number; kind: string; prompt: string; options: unknown; correct: unknown; scoreable: boolean; policy_code: string | null; policy_version: string | null; required: boolean };
type DBProgress = { id: string; module_id: string; status: string; score: number | null; attempts: number; expires_at: string | null };

const toCheckpoint = (c: DBCheckpoint): Checkpoint => ({
  id: c.id,
  kind: c.kind as Checkpoint["kind"],
  prompt: c.prompt,
  options: Array.isArray(c.options) ? (c.options as string[]) : [],
  correct: Array.isArray(c.correct) ? (c.correct as number[]) : null,
  scoreable: c.scoreable,
  required: c.required,
  policy_code: c.policy_code,
  policy_version: c.policy_version,
});

const TrainingPage = () => {
  const { user, isStaff } = useAuth();
  const [modules, setModules] = useState<DBModule[]>([]);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [checkpoints, setCheckpoints] = useState<DBCheckpoint[]>([]);
  const [progress, setProgress] = useState<DBProgress[]>([]);
  const [answers, setAnswers] = useState<Record<string, ResponseValue>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean | null>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [m, l, c, p] = await Promise.all([
        (supabase as any).from("staff_training_modules").select("*").order("position"),
        (supabase as any).from("staff_training_lessons").select("*").order("position"),
        (supabase as any).from("staff_training_checkpoints").select("*").order("position"),
        (supabase as any).from("staff_training_progress").select("id,module_id,status,score,attempts,expires_at").eq("user_id", user.id).eq("superseded", false),
      ]);
      setModules(m.data || []);
      setLessons(l.data || []);
      setCheckpoints(c.data || []);
      setProgress(p.data || []);
      setLoading(false);
    })();
  }, [user]);

  const progressFor = useCallback((moduleId: string) => progress.find((p) => p.module_id === moduleId), [progress]);
  const checkpointsFor = useCallback((moduleId: string) => checkpoints.filter((c) => c.module_id === moduleId), [checkpoints]);

  const setAnswer = (cpId: string, value: ResponseValue) => {
    setAnswers((prev) => ({ ...prev, [cpId]: value }));
    setFeedback((prev) => ({ ...prev, [cpId]: undefined }));
  };

  const submitModule = async (module: DBModule) => {
    if (!user) return;
    setSubmitting(module.id);
    try {
      const cps = checkpointsFor(module.id);
      const mapped = cps.map(toCheckpoint);
      const responses: Record<string, ResponseValue> = {};
      for (const cp of mapped) responses[cp.id] = answers[cp.id] ?? null;
      const ev = evaluateModule(mapped, responses, module.pass_mark);

      let status = "in_progress";
      if (ev.complete) status = module.ack_required ? "acknowledged" : ev.passed ? "passed" : "failed";

      // Upsert progress.
      let prog = progressFor(module.id);
      const now = new Date();
      const payload = {
        user_id: user.id,
        module_id: module.id,
        module_code: module.code,
        module_version: module.version,
        status,
        score: ev.score,
        attempts: (prog?.attempts ?? 0) + 1,
        completed_at: ev.complete ? now.toISOString() : null,
        expires_at: (status === "passed" || status === "acknowledged") ? expiresFrom(now).toISOString() : null,
      };
      if (prog) {
        await (supabase as any).from("staff_training_progress").update(payload).eq("id", prog.id);
      } else {
        const { data } = await (supabase as any).from("staff_training_progress").insert({ ...payload, started_at: now.toISOString() }).select("id").single();
        prog = data;
      }

      // Upsert responses.
      if (prog) {
        for (const cp of mapped) {
          const value = responses[cp.id] ?? null;
          const isCorrect = evaluateCheckpoint(cp, value);
          const { data: existing } = await (supabase as any).from("staff_training_responses").select("id").eq("progress_id", prog.id).eq("checkpoint_id", cp.id).eq("attempt", 1).maybeSingle();
          const row = { progress_id: prog.id, checkpoint_id: cp.id, response: value, is_correct: isCorrect, attempt: 1 };
          if (existing) await (supabase as any).from("staff_training_responses").update(row).eq("id", existing.id);
          else await (supabase as any).from("staff_training_responses").insert(row);
        }

        // Immutable policy acknowledgements for ack checkpoints.
        for (const cp of mapped) {
          if (cp.kind === "acknowledge" && answers[cp.id] === true && cp.policy_code) {
            await (supabase as any).from("staff_policy_acknowledgements").insert({
              user_id: user.id, policy_code: cp.policy_code, policy_version: cp.policy_version || "1.0",
              title: cp.prompt, declaration: "Acknowledged via the interactive training portal",
            });
          }
        }
      }

      // Show per-checkpoint feedback for scored questions.
      const fb: Record<string, boolean | null> = {};
      for (const cp of mapped) fb[cp.id] = evaluateCheckpoint(cp, responses[cp.id] ?? null);
      setFeedback(fb);

      setProgress((prev) => {
        const rest = prev.filter((p) => p.module_id !== module.id);
        return [...rest, { id: prog?.id ?? "", module_id: module.id, status, score: ev.score, attempts: (prog?.attempts ?? 0) + 1, expires_at: (status === "passed" || status === "acknowledged") ? expiresFrom(now).toISOString() : null }];
      });

      toast({ title: STATUS_LABEL[status as keyof typeof STATUS_LABEL], description: ev.score !== null ? `${Math.round(ev.score * 100)}% scored` : "Recorded" });
    } catch (e: any) {
      toast({ title: "Submit failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  const memberGate = useMemo(() => memberContactCurrent(modules.map((m) => ({ gate: m.gate as any, status: moduleStatus({ progress: progressFor(m.id) ?? null, dueAt: null, now: new Date() }) }))), [modules, progress, progressFor]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <ShieldCheck className="text-foreground/30" size={32} />
        <h1 className="font-display text-2xl text-foreground">Staff only</h1>
        <p className="text-muted-foreground text-sm max-w-sm">The Staff Training Portal is available to facilitators and admins.</p>
        <Link to="/" className="text-primary text-sm underline underline-offset-4">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <Link to="/mindcast-live/library" className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"><ArrowLeft size={15} /> Library</Link>
        <span className={`text-[10px] font-body uppercase tracking-widest ${memberGate ? "text-green-600" : "text-amber-600"}`}>{memberGate ? "Member-contact current" : "Member-contact gate incomplete"}</span>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10 pb-20">
        <div className="mb-2 text-primary text-[10px] font-body uppercase tracking-[0.3em]">MC-TRN-001</div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">STAFF TRAINING</h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
          Ten modules you complete before standing in a Mindcast room. Modules 1, 3, 4, 5 and 6 must be complete and passed
          before member-facing work; 7 and 10 are due in Week 1; 8 and 9 within Month 1. Everyone repeats the manual annually.
        </p>

        <div className="space-y-3">
          {modules.map((m) => {
            const isOpen = open === m.id;
            const st = moduleStatus({ progress: progressFor(m.id) ?? null, dueAt: null, now: new Date() });
            const cps = checkpointsFor(m.id).map(toCheckpoint);
            const lessonsFor = lessons.filter((l) => l.module_id === m.id);
            return (
              <div key={m.id} className="border border-border rounded-lg overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : m.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-foreground/[0.02]">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center font-display text-sm shrink-0">{m.position}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-foreground leading-tight">{m.title}</p>
                    <p className="text-[11px] text-muted-foreground font-body">{GATE_LABEL[m.gate as keyof typeof GATE_LABEL] || m.gate} · {m.est_minutes} min · {STATUS_LABEL[st]}</p>
                  </div>
                  {(st === "passed" || st === "acknowledged") && <Check size={16} className="text-green-600" />}
                  {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-6 pt-1 border-t border-border">
                        <p className="text-sm font-body text-muted-foreground mb-4">{m.summary}</p>
                        {lessonsFor.map((l) => (
                          <div key={l.id} className="mb-4">
                            <p className="font-display text-sm text-foreground mb-1">{l.title}</p>
                            <p className="text-sm text-muted-foreground font-body whitespace-pre-line leading-relaxed">{l.body}</p>
                          </div>
                        ))}

                        {cps.map((cp) => <CheckpointField key={cp.id} cp={cp} value={answers[cp.id]} feedback={feedback[cp.id]} onChange={(v) => setAnswer(cp.id, v)} />)}

                        <button onClick={() => submitModule(m)} disabled={submitting === m.id}
                          className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-xs font-body tracking-widest uppercase hover:bg-primary/90 disabled:opacity-50">
                          {submitting === m.id ? <><Loader2 size={13} className="animate-spin" /> Submitting…</> : "Submit module"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function CheckpointField({ cp, value, feedback, onChange }: { cp: Checkpoint; value: ResponseValue; feedback: boolean | null | undefined; onChange: (v: ResponseValue) => void }) {
  if (cp.kind === "freetext") {
    return (
      <div className="mb-5">
        <p className="text-sm font-body text-foreground mb-2">{cp.prompt}</p>
        <textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full bg-foreground/5 border border-foreground/10 rounded-md px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground/30" />
      </div>
    );
  }
  if (cp.kind === "single") {
    const sel = value as number | undefined;
    return (
      <div className="mb-5">
        <p className="text-sm font-body text-foreground mb-2">{cp.prompt}</p>
        <div className="space-y-2">
          {cp.options.map((o, i) => (
            <label key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground cursor-pointer">
              <input type="radio" name={cp.id} checked={sel === i} onChange={() => onChange(i)} className="mt-0.5" /> {o}
            </label>
          ))}
        </div>
        {feedback !== undefined && <FeedbackBadge correct={feedback} />}
      </div>
    );
  }
  if (cp.kind === "multi" || cp.kind === "checklist") {
    const sel = (value as number[]) || [];
    const toggle = (i: number) => onChange(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]);
    return (
      <div className="mb-5">
        <p className="text-sm font-body text-foreground mb-2">{cp.prompt}</p>
        <div className="space-y-2">
          {cp.options.map((o, i) => (
            <label key={i} className="flex items-start gap-2 text-sm font-body text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={sel.includes(i)} onChange={() => toggle(i)} className="mt-0.5" /> {o}
            </label>
          ))}
        </div>
        {feedback !== undefined && <FeedbackBadge correct={feedback} />}
      </div>
    );
  }
  if (cp.kind === "order") {
    const order = (value as number[]) || cp.options.map((_, i) => i);
    return (
      <div className="mb-5">
        <p className="text-sm font-body text-foreground mb-2">{cp.prompt}</p>
        <div className="space-y-1.5">
          {cp.options.map((item, i) => {
            const pos = order[i] ?? i;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs w-6 text-right">{i + 1}</span>
                <span className="flex-1 text-sm font-body text-foreground bg-foreground/5 border border-foreground/10 rounded px-3 py-2">{cp.options[pos]}</span>
                <button onClick={() => { const next = [...order]; [next[i], next[Math.min(i + 1, next.length - 1)]] = [next[Math.min(i + 1, next.length - 1)], next[i]]; onChange(next); }} className="text-muted-foreground hover:text-foreground px-2">↓</button>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Tap ↓ to swap an item down. Top to bottom = the order members experience it.</p>
        {feedback !== undefined && <FeedbackBadge correct={feedback} />}
      </div>
    );
  }
  // acknowledge
  return (
    <div className="mb-5">
      <p className="text-sm font-body text-foreground mb-2">{cp.prompt}</p>
      <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} /> I acknowledge
      </label>
      {cp.policy_code && <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Clock size={11} /> {cp.policy_code} v{cp.policy_version}</p>}
    </div>
  );
}

function FeedbackBadge({ correct }: { correct: boolean | null }) {
  if (correct === null) return null;
  return <p className={`text-xs font-body mt-1 ${correct ? "text-green-600" : "text-amber-600"}`}>{correct ? "Correct" : "Incorrect"}</p>;
}

export default TrainingPage;
