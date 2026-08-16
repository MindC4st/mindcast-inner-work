import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  GATE_LABEL, dueDateFor, evaluateCheckpoint, evaluateModule, expiresFrom,
  isAnswered, type Checkpoint, type ResponseValue,
} from "@/lib/training";
import { stt } from "@/lib/stt";
import { ArrowLeft, BookOpen, Check, CheckCircle2, Loader2, RefreshCw, X, XCircle } from "lucide-react";
import controlledDocs from "@/data/controlledDocs.json";
import type { ModuleRow } from "./TrainingHome";

type LessonRow = { id: string; position: number; title: string; body: string };
type CheckpointRow = Checkpoint & { lesson_id: string | null; module_id: string | null; position: number };
type ProgressRow = {
  id: string; module_id: string; module_version: number; status: string;
  score: number | null; attempts: number; completed_at: string | null;
  due_at: string | null; expires_at: string | null; superseded: boolean;
};
type ResponseRow = { checkpoint_id: string; response: ResponseValue; attempt: number };

const Body = ({ text }: { text: string }) => (
  <div className="space-y-3">
    {text.split("\n\n").map((para, i) => {
      const lines = para.split("\n");
      if (lines.every((l) => l.startsWith("- "))) {
        return (
          <ul key={i} className="space-y-1.5">
            {lines.map((l, j) => (
              <li key={j} className="flex gap-2 text-sm font-body text-foreground/80 leading-relaxed">
                <span className="text-primary mt-0.5">·</span>{l.slice(2)}
              </li>
            ))}
          </ul>
        );
      }
      return <p key={i} className="text-sm font-body text-foreground/80 leading-relaxed whitespace-pre-line">{para}</p>;
    })}
  </div>
);

const ModuleRunner = () => {
  const { moduleId = "" } = useParams();
  const { user } = useAuth();
  const [module, setModule] = useState<ModuleRow | null>(null);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [checkpoints, setCheckpoints] = useState<CheckpointRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow | null>(null);
  const [values, setValues] = useState<Record<string, ResponseValue>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<"passed" | "failed" | null>(null);
  const [docOpen, setDocOpen] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Documents referenced by this module (policy acknowledgements + any
  // MC-XXX codes cited in lesson copy) — shown as clickable "read" links.
  const referencedCodes = useMemo(() => {
    const codes = new Set<string>();
    checkpoints.forEach((c) => { if (c.policy_code) codes.add(c.policy_code); });
    lessons.forEach((l) => {
      for (const m of l.body.matchAll(/MC-[A-Z]{2,3}-\d{3,4}/g)) codes.add(m[0]);
    });
    return [...codes];
  }, [checkpoints, lessons]);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: m }, { data: ls }] = await Promise.all([
      supabase.from("staff_training_modules" as never).select("*").eq("id", moduleId).maybeSingle(),
      supabase.from("staff_training_lessons" as never).select("*").eq("module_id", moduleId).order("position"),
    ]);
    const mod = (m ?? null) as ModuleRow | null;
    const lessonRows = (ls ?? []) as unknown as LessonRow[];
    setModule(mod);
    setLessons(lessonRows);
    if (!mod) { setLoading(false); return; }

    const lessonIds = lessonRows.map((l) => l.id);
    const [{ data: cpLesson }, { data: cpModule }, { data: start }, { data: prof }] = await Promise.all([
      lessonIds.length
        ? supabase.from("staff_training_checkpoints" as never).select("*").in("lesson_id", lessonIds).order("position")
        : Promise.resolve({ data: [] }),
      supabase.from("staff_training_checkpoints" as never).select("*").eq("module_id", moduleId).order("position"),
      supabase.from("staff_compliance_records" as never).select("valid_from")
        .eq("user_id", user.id).eq("category", "staff_start").limit(1),
      supabase.from("profiles").select("created_at").eq("user_id", user.id).maybeSingle(),
    ]);
    const cps = [...(cpLesson ?? []), ...(cpModule ?? [])] as unknown as CheckpointRow[];
    const lessonPos = new Map(lessonRows.map((l) => [l.id, l.position]));
    cps.sort((a, b) => {
      const la = a.lesson_id ? lessonPos.get(a.lesson_id) ?? 0 : 99;
      const lb = b.lesson_id ? lessonPos.get(b.lesson_id) ?? 0 : 99;
      return la - lb || a.position - b.position;
    });
    setCheckpoints(cps);

    // Current progress row; create on first open so save/resume works everywhere.
    let prog = null as ProgressRow | null;
    const { data: pRows } = await supabase.from("staff_training_progress" as never)
      .select("*").eq("user_id", user.id).eq("module_id", moduleId).eq("superseded", false);
    prog = ((pRows ?? []) as unknown as ProgressRow[])[0] ?? null;
    if (!prog) {
      const anchorIso = ((start ?? []) as { valid_from: string | null }[])[0]?.valid_from
        || (prof as { created_at?: string } | null)?.created_at || null;
      const due = dueDateFor(mod.gate, anchorIso ? new Date(anchorIso) : null);
      const { data: inserted } = await stt("staff_training_progress")
        .insert({
          user_id: user.id, module_id: mod.id, module_code: mod.code,
          module_version: mod.version, due_at: due ? due.toISOString().slice(0, 10) : null,
        })
        .select("*").single();
      prog = (inserted ?? null) as unknown as ProgressRow | null;
    }
    setProgress(prog);

    if (prog && !["passed", "acknowledged"].includes(prog.status)) {
      const attempt = prog.attempts + 1;
      const { data: rs } = await supabase.from("staff_training_responses" as never)
        .select("checkpoint_id, response").eq("progress_id", prog.id).eq("attempt", attempt);
      const map: Record<string, ResponseValue> = {};
      ((rs ?? []) as unknown as ResponseRow[]).forEach((r) => { map[r.checkpoint_id] = r.response; });
      setValues(map);
    }
    setLoading(false);
  }, [user, moduleId]);

  useEffect(() => { void load(); }, [load]);

  const activeAttempt = progress ? progress.attempts + 1 : 1;
  const done = progress !== null && ["passed", "acknowledged"].includes(progress.status);
  const versionChanged = progress !== null && module !== null && progress.module_version < module.version;

  const setValue = (cpId: string, v: ResponseValue) => {
    setValues((s) => ({ ...s, [cpId]: v }));
    setResults((s) => { const n = { ...s }; delete n[cpId]; return n; });
    if (!progress || done) return;
    clearTimeout(saveTimers.current[cpId]);
    saveTimers.current[cpId] = setTimeout(async () => {
      await (supabase.from("staff_training_responses" as never) as unknown as {
        upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: unknown }>
      }).upsert(
        { progress_id: progress.id, checkpoint_id: cpId, attempt: activeAttempt, response: v, saved_at: new Date().toISOString() },
        { onConflict: "progress_id,checkpoint_id,attempt" },
      );
    }, 500);
  };

  const evaluation = useMemo(
    () => evaluateModule(checkpoints, values, module?.pass_mark ?? null),
    [checkpoints, values, module],
  );

  const submit = async () => {
    if (!progress || !module || submitting) return;
    setSubmitting(true);
    const attempts = progress.attempts + 1;
    for (const cp of checkpoints) {
      const v = values[cp.id] ?? null;
      const correct = evaluateCheckpoint(cp, v);
      await (supabase.from("staff_training_responses" as never) as unknown as {
        upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: unknown }>
      }).upsert(
        {
          progress_id: progress.id, checkpoint_id: cp.id, attempt: attempts,
          response: v, is_correct: correct, saved_at: new Date().toISOString(),
        },
        { onConflict: "progress_id,checkpoint_id,attempt" },
      );
      if (correct !== null) setResults((s) => ({ ...s, [cp.id]: correct }));
    }
    const passed = evaluation.passed;
    const now = new Date();
    const patch: Record<string, unknown> = {
      attempts,
      score: evaluation.score,
      status: passed ? (module.pass_mark === null ? "acknowledged" : "passed") : "failed",
    };
    if (passed) {
      patch.completed_at = now.toISOString();
      patch.expires_at = expiresFrom(now).toISOString().slice(0, 10);
      // Immutable acknowledgement evidence for policy checkpoints.
      for (const cp of checkpoints.filter((c) => c.kind === "acknowledge" && c.policy_code)) {
        await stt("staff_policy_acknowledgements").insert({
          user_id: user?.id, policy_code: cp.policy_code, policy_version: cp.policy_version || "1.0",
          title: cp.prompt.slice(0, 120), evidence_progress_id: progress.id,
        });
      }
    }
    await (supabase.from("staff_training_progress" as never) as unknown as {
      update: (p: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> }
    }).update(patch).eq("id", progress.id);
    setFeedback(passed ? "passed" : "failed");
    setSubmitting(false);
    if (passed) setProgress({ ...progress, ...patch, attempts } as ProgressRow);
    else setProgress({ ...progress, attempts, status: "failed", score: evaluation.score } as ProgressRow);
  };

  const startNewVersion = async () => {
    if (!progress || !module || !user) return;
    await (supabase.from("staff_training_progress" as never) as unknown as {
      update: (p: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: unknown }> }
    }).update({ superseded: true }).eq("id", progress.id);
    setProgress(null);
    setValues({});
    setFeedback(null);
    await load();
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  if (!module) {
    return <p className="py-24 text-center text-muted-foreground text-sm font-body">Module not found.</p>;
  }

  const ackOnly = module.pass_mark === null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/admin/staff-training" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-[11px] font-body tracking-widest uppercase transition-colors mb-6">
        <ArrowLeft size={12} /> Training
      </Link>

      <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">
        Module {String(module.position).padStart(2, "0")} · {GATE_LABEL[module.gate]} ·{" "}
        {ackOnly ? "Acknowledgement" : `${Math.round((module.pass_mark ?? 0) * 100)}% pass`} · v{module.version}
      </p>
      <h2 className="font-display text-3xl text-foreground tracking-wider mb-6">{module.title}</h2>

      {referencedCodes.length > 0 && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">Referenced documents</p>
          <div className="flex flex-wrap gap-2">
            {referencedCodes.map((code) => {
              const doc = controlledDocs.find((d) => d.code === code);
              return (
                <button key={code} onClick={() => setDocOpen(code)}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-body text-foreground hover:border-primary hover:text-primary transition-colors">
                  <BookOpen size={13} /> {code} — {doc?.title || "document"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {versionChanged && !done && (
        <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-[12px] font-body text-primary flex items-center justify-between gap-3">
          This module was updated to v{module.version}. Your in-progress attempt is on v{progress?.module_version}.
          <button onClick={startNewVersion} className="shrink-0 px-3 py-1.5 rounded-sm bg-primary text-primary-foreground text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-colors">
            Start v{module.version}
          </button>
        </div>
      )}

      {done && !versionChanged && (
        <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-4 text-sm font-body text-primary flex items-center gap-3">
          <CheckCircle2 size={16} />
          <span>
            Completed {progress?.completed_at ? new Date(progress.completed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" }) : ""} (v{progress?.module_version})
            {progress?.expires_at && <> · due again {new Date(progress.expires_at).toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}</>}.
          </span>
        </div>
      )}

      {versionChanged && done && (
        <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-[12px] font-body text-primary flex items-center justify-between gap-3">
          A new version of this module is live. Your completion of v{progress?.module_version} stays on record.
          <button onClick={startNewVersion} className="shrink-0 px-3 py-1.5 rounded-sm bg-primary text-primary-foreground text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-colors">
            Acknowledge v{module.version}
          </button>
        </div>
      )}

      <div className="space-y-8">
        {lessons.map((lesson) => {
          const lCps = checkpoints.filter((c) => c.lesson_id === lesson.id);
          return (
            <section key={lesson.id} className="rounded-lg border border-border bg-card p-5 md:p-6">
              <h3 className="font-display text-xl text-foreground tracking-wider mb-3">{lesson.title}</h3>
              <Body text={lesson.body} />
              {lCps.length > 0 && (
                <div className="mt-5 space-y-5">
                  {lCps.map((cp) => (
                    <CheckpointInput key={cp.id} cp={cp} value={values[cp.id] ?? null}
                      result={results[cp.id]} disabled={done}
                      onChange={(v) => setValue(cp.id, v)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {checkpoints.filter((c) => c.module_id === module.id).map((cp) => (
          <section key={cp.id} className="rounded-lg border border-border bg-card p-5 md:p-6">
            <CheckpointInput cp={cp} value={values[cp.id] ?? null} result={results[cp.id]}
              disabled={done} onChange={(v) => setValue(cp.id, v)} />
          </section>
        ))}
      </div>

      {!done && (
        <div className="sticky bottom-0 mt-8 -mx-6 px-6 py-4 backdrop-blur-xl bg-foreground/40 border-t border-border flex items-center gap-4">
          <p className="text-[11px] font-body text-muted-foreground">
            {evaluation.missingCount === 0
              ? ackOnly ? "Everything is answered." : `Score so far is not shown until you submit.`
              : `${evaluation.missingCount} checkpoint${evaluation.missingCount > 1 ? "s" : ""} to go — progress saves as you write.`}
          </p>
          <button onClick={submit} disabled={submitting || !evaluation.complete}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-xs font-body tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-40">
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {ackOnly ? "Acknowledge and complete" : "Submit answers"}
          </button>
        </div>
      )}

      {feedback === "passed" && (
        <div className="mt-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-body text-primary flex items-center gap-2">
          <CheckCircle2 size={15} /> {ackOnly ? "Acknowledged — thank you. It is on record with the version and date." : "Passed — recorded with this module version."}
        </div>
      )}
      {feedback === "failed" && (
        <div className="mt-6 rounded-md border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm font-body text-red-200 flex items-center gap-2">
          <XCircle size={15} />
          Not passed this time ({Math.round((evaluation.score ?? 0) * 100)}% of {Math.round((module.pass_mark ?? 0) * 100)}% required). Review the marked answers and submit again when ready.
        </div>
      )}

      {docOpen && (() => {
        const doc = controlledDocs.find((d) => d.code === docOpen);
        if (!doc) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDocOpen(null)}>
            <div className="bg-background border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-display text-xl text-foreground">{doc.code} — {doc.title}</h3>
                <button onClick={() => setDocOpen(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-2">
                {doc.body.split("\n").map((line, i) => {
                  if (/^#+\s/.test(line)) return <h4 key={i} className="font-display text-lg text-foreground mt-4">{line.replace(/^#+\s*/, "")}</h4>;
                  if (/^-\s/.test(line)) return <p key={i} className="text-sm font-body text-foreground/80 pl-3">· {line.slice(2)}</p>;
                  if (/^>\s?/.test(line)) return <p key={i} className="text-sm font-body italic text-muted-foreground border-l-2 border-primary/30 pl-3">{line.replace(/^>\s?/, "")}</p>;
                  if (line.trim() === "") return null;
                  return <p key={i} className="text-sm font-body text-foreground/80 leading-relaxed">{line}</p>;
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const CheckpointInput = ({ cp, value, result, disabled, onChange }: {
  cp: CheckpointRow; value: ResponseValue; result: boolean | undefined;
  disabled: boolean; onChange: (v: ResponseValue) => void;
}) => {
  const ring = result === undefined ? "" : result ? "border-primary/50" : "border-red-400/40";

  if (cp.kind === "freetext") {
    return (
      <label className="block">
        <span className="block text-[13px] font-body text-foreground mb-2 leading-relaxed">{cp.prompt}</span>
        <textarea value={(value as string) || ""} disabled={disabled} rows={4}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your answer — it stays private to you and the compliance view sees only that you completed it."
          className={`w-full bg-transparent border rounded-md px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary resize-y ${ring || "border-border"}`} />
      </label>
    );
  }

  if (cp.kind === "acknowledge") {
    return (
      <label className={`flex items-start gap-3 rounded-md border px-4 py-3.5 cursor-pointer transition-colors ${ring || "border-border"} ${disabled ? "opacity-60" : ""}`}>
        <input type="checkbox" checked={value === true} disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#3585AF]" />
        <span className="text-[13px] font-body text-foreground leading-relaxed">{cp.prompt}</span>
      </label>
    );
  }

  if (cp.kind === "single") {
    return (
      <fieldset>
        <legend className="text-[13px] font-body text-foreground mb-2 leading-relaxed">{cp.prompt}</legend>
        <div className="space-y-1.5">
          {cp.options.map((opt, i) => (
            <label key={i} className={`flex items-start gap-3 rounded-md border px-4 py-2.5 cursor-pointer transition-colors ${value === i ? "border-primary/60 bg-primary/10" : "border-border hover:border-primary/40"} ${disabled ? "opacity-60" : ""}`}>
              <input type="radio" name={cp.id} checked={value === i} disabled={disabled}
                onChange={() => onChange(i)} className="mt-0.5 w-4 h-4 accent-[#3585AF]" />
              <span className="text-[13px] font-body text-foreground/80 leading-relaxed">{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (cp.kind === "order") {
    const current = Array.isArray(value) ? (value as number[]) : [];
    const remaining = cp.options.map((_, i) => i).filter((i) => !current.includes(i));
    return (
      <div>
        <p className="text-[13px] font-body text-foreground mb-2 leading-relaxed">{cp.prompt}</p>
        <div className="space-y-1.5 mb-2">
          {current.map((optIdx, pos) => (
            <div key={optIdx} className="flex items-center gap-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-2">
              <span className="font-display text-primary">{pos + 1}</span>
              <span className="flex-1 text-[13px] font-body text-foreground">{cp.options[optIdx]}</span>
              {!disabled && (
                <button onClick={() => onChange(current.filter((x) => x !== optIdx))}
                  className="text-muted-foreground hover:text-foreground text-[10px] font-body uppercase tracking-widest">Undo</button>
              )}
            </div>
          ))}
        </div>
        {remaining.length > 0 && !disabled && (
          <div className="flex flex-wrap gap-2">
            {remaining.map((i) => (
              <button key={i} onClick={() => onChange([...current, i])}
                className="px-3 py-1.5 rounded-md border border-border text-[12px] font-body text-foreground/80 hover:border-primary/50 transition-colors">
                {cp.options[i]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // multi / checklist
  const current = Array.isArray(value) ? (value as number[]) : [];
  return (
    <fieldset>
      <legend className="text-[13px] font-body text-foreground mb-2 leading-relaxed">{cp.prompt}</legend>
      <div className="space-y-1.5">
        {cp.options.map((opt, i) => {
          const on = current.includes(i);
          return (
            <label key={i} className={`flex items-start gap-3 rounded-md border px-4 py-2.5 cursor-pointer transition-colors ${on ? "border-primary/60 bg-primary/10" : "border-border hover:border-primary/40"} ${disabled ? "opacity-60" : ""}`}>
              <input type="checkbox" checked={on} disabled={disabled}
                onChange={(e) => onChange(e.target.checked ? [...current, i] : current.filter((x) => x !== i))}
                className="mt-0.5 w-4 h-4 accent-[#3585AF]" />
              <span className="text-[13px] font-body text-foreground/80 leading-relaxed">{opt}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default ModuleRunner;
