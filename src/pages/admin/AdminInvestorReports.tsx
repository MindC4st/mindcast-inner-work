import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Clipboard, Download, Eye,
  FileText, History, Mail, RefreshCw, RotateCcw, Save, Send, Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  buildInvestorMetricSnapshot,
  createEmptyInvestorReport,
  EMPTY_PRIORITIES,
  formatMetricChange,
  formatMetricValue,
  formatReportMonth,
  type InvestorMetricSnapshot,
  type InvestorPriority,
  type InvestorReport,
  type InvestorReportStatus,
  monthKey,
  monthStart,
  previousMonthKey,
  renderInvestorEmail,
  suggestedInvestorHeadline,
} from "@/lib/investorReports";

type PreviewMode = "desktop" | "mobile" | "text";

const inputClass = "min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";

const reportFields = [
  "subject", "preheader", "headline", "good", "bad", "ugly", "learned_headline",
  "learned_body", "customer_quote", "customer_quote_attribution",
  "behaviour_change_numerator", "behaviour_change_denominator",
  "behaviour_change_period", "behaviour_change_notes", "family_signal_label",
  "family_signal_numerator", "family_signal_denominator", "family_signal_notes",
  "one_ask", "selected_metric_ids", "metric_definition_version",
] as const;

const getReportPatch = (report: InvestorReport, userId: string | undefined) => Object.fromEntries([
  ...reportFields.map((field) => [field, report[field]]),
  ["updated_by", userId ?? null],
]);

const hasSnapshot = (value: InvestorReport["metrics_snapshot"]): value is InvestorMetricSnapshot =>
  Boolean(value && "metrics" in value && Array.isArray(value.metrics));

const isImmutable = (status: InvestorReportStatus) => status === "sent" || status === "archived";

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    {children}
    {hint && <span className="mt-1.5 block font-body text-[11px] leading-relaxed text-muted-foreground">{hint}</span>}
  </label>
);

const TextArea = ({ value, onChange, disabled, rows = 3, placeholder, maxLength }: {
  value: string; onChange: (value: string) => void; disabled: boolean; rows?: number;
  placeholder?: string; maxLength?: number;
}) => (
  <textarea
    className={`${inputClass} resize-y`}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    disabled={disabled}
    rows={rows}
    placeholder={placeholder}
    maxLength={maxLength}
  />
);

const EditorSection = ({ number, title, copy, children }: {
  number: string; title: string; copy?: string; children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-5 flex gap-3">
      <span className="font-display text-2xl text-primary">{number}</span>
      <div>
        <h2 className="font-display text-xl tracking-wide text-foreground">{title}</h2>
        {copy && <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">{copy}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const SuggestionList = ({ title, items }: { title: string; items: string[] }) => items.length ? (
  <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
    <p className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">{title}</p>
    <ul className="mt-2 space-y-1.5 font-body text-xs leading-relaxed text-muted-foreground">
      {items.map((item) => <li key={item}>• {item}</li>)}
    </ul>
  </div>
) : null;

const StatusPill = ({ status }: { status: InvestorReportStatus }) => (
  <span className={`rounded-full px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.14em] ${
    status === "sent" ? "bg-primary/15 text-primary"
      : status === "ready" ? "bg-mist/60 text-foreground"
        : status === "archived" ? "bg-muted text-muted-foreground"
          : "bg-secondary text-secondary-foreground"
  }`}>{status}</span>
);

const currentMonth = () => {
  const parts = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? String(new Date().getFullYear());
  const month = parts.find((part) => part.type === "month")?.value ?? String(new Date().getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const nextMonthKey = (month: string) => {
  const [year, monthNumber] = monthKey(month).split("-").map(Number);
  return monthKey(new Date(year, monthNumber, 1));
};

const AdminInvestorReports = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [report, setReport] = useState<InvestorReport | null>(null);
  const [snapshot, setSnapshot] = useState<InvestorMetricSnapshot | null>(null);
  const [priorities, setPriorities] = useState<InvestorPriority[]>(EMPTY_PRIORITIES);
  const [previousPriorities, setPreviousPriorities] = useState<InvestorPriority[]>([]);
  const [history, setHistory] = useState<InvestorReport[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState(user?.email ?? "");
  const [sendingTest, setSendingTest] = useState(false);
  const loadingRef = useRef(false);
  const savingRef = useRef(false);
  const editVersionRef = useRef(0);

  const queryHistory = useCallback(async () => {
    const response = await supabase
      .from("investor_reports" as never)
      .select("*")
      .order("report_month", { ascending: false })
      .order("version", { ascending: false });
    if (response.error) throw response.error;
    setHistory((response.data ?? []) as unknown as InvestorReport[]);
  }, []);

  const fetchMetrics = useCallback(async (month: string) => {
    const response = await supabase.rpc("admin_investor_report_metrics" as never, {
      p_report_month: monthStart(month),
    } as never);
    if (response.error) throw response.error;
    return buildInvestorMetricSnapshot(response.data);
  }, []);

  const fetchPriorities = useCallback(async (reportId: string) => {
    const response = await supabase
      .from("investor_report_priorities" as never)
      .select("*")
      .eq("report_id", reportId)
      .order("position");
    if (response.error) throw response.error;
    const rows = (response.data ?? []) as unknown as InvestorPriority[];
    return rows.length ? rows : EMPTY_PRIORITIES.map((item) => ({ ...item, report_id: reportId }));
  }, []);

  const loadPreviousPriorities = useCallback(async (month: string) => {
    const previous = monthStart(previousMonthKey(month));
    const reportResponse = await supabase
      .from("investor_reports" as never)
      .select("id")
      .eq("report_month", previous)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (reportResponse.error) throw reportResponse.error;
    const row = reportResponse.data as unknown as { id: string } | null;
    if (!row) return [];
    return fetchPriorities(row.id);
  }, [fetchPriorities]);

  const loadMonth = useCallback(async (month: string, reportId: string | null = null) => {
    loadingRef.current = true;
    editVersionRef.current = 0;
    setLoading(true);
    setDirty(false);
    try {
      const response = reportId
        ? await supabase.from("investor_reports" as never).select("*").eq("id", reportId).maybeSingle()
        : await supabase.from("investor_reports" as never).select("*").eq("report_month", monthStart(month)).order("version", { ascending: false }).limit(1).maybeSingle();
      if (response.error) throw response.error;

      let nextReport = response.data as unknown as InvestorReport | null;
      let nextSnapshot: InvestorMetricSnapshot | null = null;
      if (!nextReport) {
        const draft = {
          ...createEmptyInvestorReport(month),
          created_by: user?.id ?? null,
          updated_by: user?.id ?? null,
        };
        const inserted = await supabase
          .from("investor_reports" as never)
          .insert(draft as never)
          .select("*")
          .single();
        if (inserted.error) throw inserted.error;
        nextReport = inserted.data as unknown as InvestorReport;
        nextSnapshot = await fetchMetrics(month);
        const metricsUpdate = await supabase
          .from("investor_reports" as never)
          .update({
            metrics_snapshot: nextSnapshot,
            metrics_refreshed_at: nextSnapshot.capturedAt,
            metric_definition_version: nextSnapshot.definitionVersion,
            updated_by: user?.id ?? null,
          } as never)
          .eq("id", nextReport.id)
          .select("*")
          .single();
        if (metricsUpdate.error) throw metricsUpdate.error;
        nextReport = metricsUpdate.data as unknown as InvestorReport;
      } else if (hasSnapshot(nextReport.metrics_snapshot)) {
        nextSnapshot = nextReport.metrics_snapshot;
      } else if (!isImmutable(nextReport.status)) {
        nextSnapshot = await fetchMetrics(month);
        const metricsUpdate = await supabase
          .from("investor_reports" as never)
          .update({
            metrics_snapshot: nextSnapshot,
            metrics_refreshed_at: nextSnapshot.capturedAt,
            metric_definition_version: nextSnapshot.definitionVersion,
            updated_by: user?.id ?? null,
          } as never)
          .eq("id", nextReport.id)
          .select("*")
          .single();
        if (metricsUpdate.error) throw metricsUpdate.error;
        nextReport = metricsUpdate.data as unknown as InvestorReport;
      }

      const [nextPriorities, lastPriorities] = await Promise.all([
        fetchPriorities(nextReport.id),
        loadPreviousPriorities(month),
      ]);
      setReport(nextReport);
      setSnapshot(nextSnapshot);
      setPriorities(nextPriorities);
      setPreviousPriorities(lastPriorities);
      setSavedAt(nextReport.updated_at);
      await queryHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load this investor report.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setDirty(false);
    }
  }, [fetchMetrics, fetchPriorities, loadPreviousPriorities, queryHistory, user?.id]);

  useEffect(() => { void loadMonth(selectedMonth, selectedReportId); }, [loadMonth, selectedMonth, selectedReportId]);

  const changeReport = useCallback(<K extends keyof InvestorReport>(key: K, value: InvestorReport[K]) => {
    setReport((current) => current ? { ...current, [key]: value } : current);
    if (!loadingRef.current) {
      editVersionRef.current += 1;
      setDirty(true);
    }
  }, []);

  const changePriority = (index: number, patch: Partial<InvestorPriority>) => {
    setPriorities((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
    editVersionRef.current += 1;
    setDirty(true);
  };

  const movePriority = (index: number, delta: number) => {
    const destination = index + delta;
    if (destination < 0 || destination >= priorities.length) return;
    setPriorities((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next.map((item, itemIndex) => ({ ...item, position: itemIndex + 1 }));
    });
    editVersionRef.current += 1;
    setDirty(true);
  };

  const saveDraft = useCallback(async (silent = false) => {
    if (!report || isImmutable(report.status) || loadingRef.current || savingRef.current) return;
    const versionAtSave = editVersionRef.current;
    savingRef.current = true;
    setSaving(true);
    try {
      const reportResponse = await supabase
        .from("investor_reports" as never)
        .update(getReportPatch(report, user?.id) as never)
        .eq("id", report.id)
        .select("*")
        .single();
      if (reportResponse.error) throw reportResponse.error;

      const priorityRows = priorities.map((item, index) => ({
        report_id: report.id,
        position: index + 1,
        objective: item.objective,
        target: item.target,
        status: item.status,
        outcome: item.outcome,
      }));
      const priorityResponse = await supabase
        .from("investor_report_priorities" as never)
        .upsert(priorityRows as never, { onConflict: "report_id,position" });
      if (priorityResponse.error) throw priorityResponse.error;

      const saved = reportResponse.data as unknown as InvestorReport;
      if (editVersionRef.current === versionAtSave) {
        setReport(saved);
        setPriorities(priorityRows);
        setDirty(false);
      } else {
        setReport((current) => current ? { ...current, updated_at: saved.updated_at } : saved);
        setDirty(true);
      }
      setSavedAt(saved.updated_at);
      if (!silent) toast.success("Investor update saved.");
      await queryHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the investor update.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [priorities, queryHistory, report, user?.id]);

  useEffect(() => {
    if (!dirty || !report || isImmutable(report.status)) return;
    const timer = window.setTimeout(() => { void saveDraft(true); }, 900);
    return () => window.clearTimeout(timer);
  }, [dirty, report, saveDraft]);

  const refreshMetrics = async () => {
    if (!report || isImmutable(report.status)) return;
    setRefreshing(true);
    try {
      const nextSnapshot = await fetchMetrics(selectedMonth);
      const response = await supabase
        .from("investor_reports" as never)
        .update({
          metrics_snapshot: nextSnapshot,
          metrics_refreshed_at: nextSnapshot.capturedAt,
          metric_definition_version: nextSnapshot.definitionVersion,
          updated_by: user?.id ?? null,
        } as never)
        .eq("id", report.id)
        .select("*")
        .single();
      if (response.error) throw response.error;
      setReport(response.data as unknown as InvestorReport);
      setSnapshot(nextSnapshot);
      setSavedAt(nextSnapshot.capturedAt);
      toast.success("Metrics refreshed from the shared reporting layer.");
      await queryHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not refresh metrics.");
    } finally {
      setRefreshing(false);
    }
  };

  const output = useMemo(() => {
    if (!report || !snapshot) return null;
    if (isImmutable(report.status) && report.generated_html && report.generated_text) {
      return {
        subject: report.subject,
        preheader: report.preheader || report.headline,
        html: report.generated_html,
        text: report.generated_text,
      };
    }
    return renderInvestorEmail({ report, snapshot, priorities, previousPriorities });
  }, [previousPriorities, priorities, report, snapshot]);

  const moveMonth = (delta: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const next = monthKey(new Date(year, month - 1 + delta, 1));
    if (next <= currentMonth()) {
      setSelectedReportId(null);
      setSelectedMonth(next);
    }
  };

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  };

  const downloadHtml = () => {
    if (!output) return;
    const blob = new Blob([output.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mindcast-investor-update-${selectedMonth}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const changeStatus = async (status: InvestorReportStatus) => {
    if (!report) return;
    if (dirty) await saveDraft(true);
    try {
      const response = await supabase
        .from("investor_reports" as never)
        .update({ status, updated_by: user?.id ?? null } as never)
        .eq("id", report.id)
        .select("*")
        .single();
      if (response.error) throw response.error;
      setReport(response.data as unknown as InvestorReport);
      toast.success(status === "ready" ? "Report marked Ready." : "Report archived.");
      await queryHistory();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update report status.");
    }
  };

  const markSent = async () => {
    if (!report || !snapshot || !output) return;
    if (!report.headline.trim() || !report.good.trim() || !report.bad.trim() || !report.ugly.trim() || !report.learned_headline.trim()) {
      toast.error("Complete the headline, Good, Bad, Ugly and What We Learned before marking this report Sent.");
      return;
    }
    if (!window.confirm("Mark this investor update Sent? Its metrics, HTML and text will become immutable.")) return;
    if (dirty) await saveDraft(true);
    const response = await supabase.rpc("admin_mark_investor_report_sent" as never, {
      p_report_id: report.id,
      p_metrics_snapshot: snapshot,
      p_generated_html: output.html,
      p_generated_text: output.text,
    } as never);
    if (response.error) {
      toast.error(response.error.message);
      return;
    }
    setReport(response.data as unknown as InvestorReport);
    toast.success("Sent snapshot locked. Future edits require a revision.");
    await queryHistory();
  };

  const createRevision = async () => {
    if (!report) return;
    const response = await supabase.rpc("admin_create_investor_report_revision" as never, {
      p_report_id: report.id,
    } as never);
    if (response.error) {
      toast.error(response.error.message);
      return;
    }
    toast.success("Draft revision created.");
    setSelectedReportId(null);
    await loadMonth(selectedMonth, null);
  };

  const sendTest = async () => {
    if (!report || !output || !testEmail.trim()) return;
    setSendingTest(true);
    try {
      const response = await supabase.functions.invoke("send-investor-report-test", {
        body: {
          report_id: report.id,
          to: testEmail.trim(),
          subject: output.subject,
          html: output.html,
          text: output.text,
        },
      });
      if (response.error) throw response.error;
      toast.success(`Test sent to ${testEmail.trim()}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the test email.");
    } finally {
      setSendingTest(false);
    }
  };

  const duplicateStructure = async (source: InvestorReport) => {
    const targetMonth = nextMonthKey(source.report_month);
    if (targetMonth > currentMonth()) {
      toast.error("Future draft months are not enabled.");
      return;
    }
    try {
      const existing = await supabase
        .from("investor_reports" as never)
        .select("id")
        .eq("report_month", monthStart(targetMonth))
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing.error) throw existing.error;
      const existingRow = existing.data as unknown as { id: string } | null;
      if (existingRow) {
        setSelectedReportId(existingRow.id);
        setSelectedMonth(targetMonth);
        toast.message(`${formatReportMonth(targetMonth)} already exists; opening it instead.`);
        return;
      }
      const draft = {
        ...createEmptyInvestorReport(targetMonth),
        selected_metric_ids: source.selected_metric_ids,
        created_by: user?.id ?? null,
        updated_by: user?.id ?? null,
      };
      const inserted = await supabase
        .from("investor_reports" as never)
        .insert(draft as never)
        .select("id")
        .single();
      if (inserted.error) throw inserted.error;
      const row = inserted.data as unknown as { id: string };
      setSelectedReportId(row.id);
      setSelectedMonth(targetMonth);
      toast.success(`Created the ${formatReportMonth(targetMonth)} structure.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not duplicate the report structure.");
    }
  };

  if (loading || !report) {
    return <div className="flex min-h-[55vh] items-center justify-center font-body text-sm text-muted-foreground">Loading Investor Updates…</div>;
  }

  const immutable = isImmutable(report.status);
  const suggestion = snapshot ? suggestedInvestorHeadline(snapshot) : "";
  const metrics = snapshot?.metrics ?? [];
  const chosenMetrics = new Set(report.selected_metric_ids);
  return (
    <div className="mx-auto max-w-[1600px] pb-16">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Monthly investor update</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">Investor Updates</h1>
            <StatusPill status={report.status} />
            {report.version > 1 && <span className="font-body text-xs text-muted-foreground">Version {report.version}</span>}
          </div>
          <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">Review shared reporting metrics, add the founder's judgement, then export one immutable email snapshot.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month"><ArrowLeft size={16} /></Button>
          <label className="sr-only" htmlFor="investor-month">Report month</label>
          <input id="investor-month" type="month" max={currentMonth()} value={selectedMonth} onChange={(event) => { setSelectedReportId(null); setSelectedMonth(event.target.value); }} className={`${inputClass} w-auto`} />
          <Button variant="outline" size="icon" onClick={() => moveMonth(1)} disabled={selectedMonth >= currentMonth()} aria-label="Next month"><ArrowRight size={16} /></Button>
          <Button variant="outline" onClick={() => { setSelectedReportId(null); setSelectedMonth(currentMonth()); }}>Current month</Button>
        </div>
      </div>

      {snapshot?.incomplete && <div className="mb-5 rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-3 font-body text-xs text-foreground"><strong>Draft — incomplete month.</strong> Metrics use the New Zealand cutoff through {snapshot.periodEnd}.</div>}
      {snapshot?.coverageMessage && <div className="mb-5 rounded-xl border border-border bg-secondary/60 px-4 py-3 font-body text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Partial reporting coverage.</strong> {snapshot.coverageMessage}</div>}
      {immutable && <div className="mb-5 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-body text-xs text-foreground">This is the immutable version investors received. Create a revision to change it.</p><Button variant="outline" size="sm" onClick={createRevision}><RotateCcw size={14} /> Create revision</Button></div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(420px,0.86fr)_minmax(560px,1.14fr)]">
        <div className="space-y-4">
          <EditorSection number="01" title="REPORT">
            <Field label="Email subject"><input className={inputClass} value={report.subject} disabled={immutable} onChange={(event) => changeReport("subject", event.target.value)} /></Field>
            <Field label="Preheader" hint="If blank, the headline becomes the email preheader."><input className={inputClass} value={report.preheader} disabled={immutable} onChange={(event) => changeReport("preheader", event.target.value)} /></Field>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!immutable && <Button onClick={() => void saveDraft()} disabled={saving || !dirty}><Save size={14} /> {saving ? "Saving…" : "Save now"}</Button>}
              {!immutable && <Button variant="outline" onClick={refreshMetrics} disabled={refreshing}><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh metrics</Button>}
              <span className="font-body text-[11px] text-muted-foreground">{saving ? "Saving…" : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit" })}` : "Not saved"}</span>
            </div>
          </EditorSection>

          <EditorSection number="02" title="THE HEADLINE" copy="One honest sentence; approximately 180 characters.">
            <Field label="Headline">
              <TextArea value={report.headline} onChange={(value) => changeReport("headline", value)} disabled={immutable} rows={3} maxLength={240} placeholder="What moved this month?" />
              <span className="mt-1 block text-right font-body text-[10px] text-muted-foreground">{report.headline.length}/180 recommended</span>
            </Field>
            {suggestion && !immutable && <div className="rounded-xl border border-border bg-secondary/50 p-3"><p className="font-body text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Data-based suggestion</p><p className="mt-2 font-body text-xs leading-relaxed text-foreground">{suggestion}</p><Button variant="ghost" size="sm" className="mt-1 px-0" onClick={() => changeReport("headline", suggestion)}>Use suggestion</Button></div>}
          </EditorSection>

          <EditorSection number="03" title="THE NUMBERS" copy="Choose up to eight defensible metrics. Unavailable metrics never render as zero.">
            <div className="grid gap-2 sm:grid-cols-2">
              {metrics.map((item) => {
                const checked = chosenMetrics.has(item.id);
                const capReached = report.selected_metric_ids.length >= 8 && !checked;
                return <label key={item.id} title={`${item.definition}\nSource: ${item.source}\nPeriod: ${item.selectedPeriod}${item.denominator !== null ? `\nDenominator: ${item.denominator}` : ""}`} className={`flex min-h-16 gap-3 rounded-xl border p-3 ${item.available ? "border-border bg-background" : "border-border/60 bg-muted/30 opacity-70"}`}>
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={checked} disabled={immutable || (!item.available && !checked) || capReached} onChange={(event) => changeReport("selected_metric_ids", event.target.checked ? [...report.selected_metric_ids, item.id] : report.selected_metric_ids.filter((id) => id !== item.id))} />
                  <span className="min-w-0"><span className="block font-body text-xs font-semibold text-foreground">{item.label} · {formatMetricValue(item)} <span className="font-normal text-muted-foreground">{item.primary ? "Primary" : "Secondary"}</span></span><span className="mt-1 block font-body text-[10px] leading-relaxed text-muted-foreground">{item.available ? formatMetricChange(item, previousMonthKey(selectedMonth)) : item.reason}</span></span>
                </label>;
              })}
            </div>
          </EditorSection>

          <EditorSection number="04" title="GOOD / BAD / UGLY" copy="Intellectual honesty, in two or three sentences each.">
            <Field label="Good" hint="What was the strongest genuine result this month?"><TextArea value={report.good} onChange={(value) => changeReport("good", value)} disabled={immutable} /></Field>
            <SuggestionList title="Possible Good signals" items={snapshot?.dataSuggestions.good ?? []} />
            <Field label="Bad" hint="What underperformed or was harder than expected?"><TextArea value={report.bad} onChange={(value) => changeReport("bad", value)} disabled={immutable} /></Field>
            <SuggestionList title="Possible Bad signals" items={snapshot?.dataSuggestions.bad ?? []} />
            <Field label="Ugly" hint="What uncomfortable learning should investors know?"><TextArea value={report.ugly} onChange={(value) => changeReport("ugly", value)} disabled={immutable} /></Field>
            <SuggestionList title="Possible Ugly signals" items={snapshot?.dataSuggestions.ugly ?? []} />
          </EditorSection>

          <EditorSection number="05" title="WHAT WE LEARNED" copy="The customer insight that changed how you understand the product or market.">
            <Field label="Insight headline"><TextArea value={report.learned_headline} onChange={(value) => changeReport("learned_headline", value)} disabled={immutable} rows={2} /></Field>
            <Field label="Optional explanation"><TextArea value={report.learned_body} onChange={(value) => changeReport("learned_body", value)} disabled={immutable} /></Field>
          </EditorSection>

          <EditorSection number="06" title="IN THEIR WORDS" copy="Optional. Enter only an intentionally anonymised quote.">
            <Field label="Customer quote"><TextArea value={report.customer_quote} onChange={(value) => changeReport("customer_quote", value)} disabled={immutable} rows={3} /></Field>
            <Field label="Attribution"><input className={inputClass} value={report.customer_quote_attribution} disabled={immutable} onChange={(event) => changeReport("customer_quote_attribution", event.target.value)} placeholder="Adult pilot member, Taupō" /></Field>
          </EditorSection>

          <EditorSection number="07" title="BEHAVIOUR CHANGE" copy="Structured survey/interview evidence only. Never inferred from journal usage.">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meeting criterion"><input type="number" min="0" className={inputClass} value={report.behaviour_change_numerator ?? ""} disabled={immutable} onChange={(event) => changeReport("behaviour_change_numerator", event.target.value === "" ? null : Number(event.target.value))} /></Field>
              <Field label="Number surveyed"><input type="number" min="1" className={inputClass} value={report.behaviour_change_denominator ?? ""} disabled={immutable} onChange={(event) => changeReport("behaviour_change_denominator", event.target.value === "" ? null : Number(event.target.value))} /></Field>
            </div>
            <Field label="Measurement period"><input className={inputClass} value={report.behaviour_change_period} disabled={immutable} onChange={(event) => changeReport("behaviour_change_period", event.target.value)} placeholder="August 2026 retained-member interviews" /></Field>
            <Field label="Method / notes"><TextArea value={report.behaviour_change_notes} onChange={(value) => changeReport("behaviour_change_notes", value)} disabled={immutable} rows={2} /></Field>
          </EditorSection>

          <EditorSection number="08" title="AT HOME" copy="Optional family signal, with a visible denominator.">
            <Field label="Indicator"><input className={inputClass} value={report.family_signal_label} disabled={immutable} onChange={(event) => changeReport("family_signal_label", event.target.value)} placeholder="of families reported a Mindcast-related conversation at home" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meeting criterion"><input type="number" min="0" className={inputClass} value={report.family_signal_numerator ?? ""} disabled={immutable} onChange={(event) => changeReport("family_signal_numerator", event.target.value === "" ? null : Number(event.target.value))} /></Field>
              <Field label="Number surveyed"><input type="number" min="1" className={inputClass} value={report.family_signal_denominator ?? ""} disabled={immutable} onChange={(event) => changeReport("family_signal_denominator", event.target.value === "" ? null : Number(event.target.value))} /></Field>
            </div>
            <Field label="Notes"><TextArea value={report.family_signal_notes} onChange={(value) => changeReport("family_signal_notes", value)} disabled={immutable} rows={2} /></Field>
          </EditorSection>

          <EditorSection number="09" title="NEXT MONTH" copy="Exactly three priorities by default, each with a measurable target.">
            {priorities.slice(0, 3).map((item, index) => <div key={`${item.id ?? "new"}-${index}`} className="rounded-xl border border-border p-3">
              <div className="mb-3 flex items-center justify-between"><p className="font-display text-xl text-primary">{String(index + 1).padStart(2, "0")}</p>{!immutable && <div className="flex gap-1"><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => movePriority(index, -1)} aria-label={`Move priority ${index + 1} up`}><ArrowUp size={13} /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 2} onClick={() => movePriority(index, 1)} aria-label={`Move priority ${index + 1} down`}><ArrowDown size={13} /></Button></div>}</div>
              <div className="space-y-3">
                <Field label="Objective"><input className={inputClass} value={item.objective} disabled={immutable} onChange={(event) => changePriority(index, { objective: event.target.value })} /></Field>
                <Field label="Measurable target"><input className={inputClass} value={item.target} disabled={immutable} onChange={(event) => changePriority(index, { target: event.target.value })} /></Field>
                <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                  <Field label="Outcome status"><select className={inputClass} value={item.status} disabled={immutable} onChange={(event) => changePriority(index, { status: event.target.value as InvestorPriority["status"] })}><option value="planned">Planned</option><option value="complete">Complete</option><option value="moved">Moved</option><option value="not_met">Not met</option></select></Field>
                  <Field label="Outcome / carried-forward note"><input className={inputClass} value={item.outcome} disabled={immutable} onChange={(event) => changePriority(index, { outcome: event.target.value })} placeholder="Completed result or reason it moved" /></Field>
                </div>
              </div>
            </div>)}
          </EditorSection>

          {previousPriorities.length > 0 && <EditorSection number="10" title="LAST MONTH" copy="Record outcomes to create the recurring accountability block.">
            {previousPriorities.slice(0, 3).map((item) => <div key={item.position} className="rounded-xl border border-border p-3"><p className="font-body text-xs font-semibold text-foreground">{item.objective || `Priority ${item.position}`}</p><p className="mt-1 font-body text-[11px] text-muted-foreground">Edit this in last month's report to change its carried-forward status.</p></div>)}
          </EditorSection>}

          <EditorSection number="11" title="ONE ASK" copy="Optional. If blank, this section disappears from the outgoing email.">
            <Field label="One useful introduction, expertise or resource"><TextArea value={report.one_ask} onChange={(value) => changeReport("one_ask", value)} disabled={immutable} /></Field>
          </EditorSection>
        </div>

        <div className="min-w-0">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border pb-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Preview mode">
                  <Button variant={previewMode === "desktop" ? "default" : "ghost"} size="sm" onClick={() => setPreviewMode("desktop")}><Eye size={14} /> Desktop</Button>
                  <Button variant={previewMode === "mobile" ? "default" : "ghost"} size="sm" onClick={() => setPreviewMode("mobile")}><Smartphone size={14} /> Mobile</Button>
                  <Button variant={previewMode === "text" ? "default" : "ghost"} size="sm" onClick={() => setPreviewMode("text")}><FileText size={14} /> Plain text</Button>
                </div>
                <span className="font-body text-[10px] text-muted-foreground">{formatReportMonth(selectedMonth)} · v{report.version}</span>
              </div>
              <div className="mt-3 flex min-h-[620px] justify-center overflow-auto rounded-xl bg-[#dfe3e6] p-3">
                {output && previewMode !== "text" && <iframe title={`${formatReportMonth(selectedMonth)} investor email preview`} sandbox="" referrerPolicy="no-referrer" srcDoc={output.html} className="min-h-[860px] border-0 bg-white shadow-xl" style={{ width: previewMode === "mobile" ? 390 : "100%", maxWidth: previewMode === "mobile" ? 390 : 680 }} />}
                {output && previewMode === "text" && <pre className="m-0 w-full whitespace-pre-wrap rounded-lg bg-white p-5 font-mono text-xs leading-relaxed text-[#303947]">{output.text}</pre>}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled={!output} onClick={() => output && void copy(output.html, "Email HTML")}><Clipboard size={14} /> Copy email HTML</Button>
                <Button variant="outline" size="sm" disabled={!output} onClick={() => output && void copy(output.text, "Plain text")}><FileText size={14} /> Copy plain text</Button>
                <Button variant="outline" size="sm" disabled={!output} onClick={downloadHtml}><Download size={14} /> Download HTML</Button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="sr-only" htmlFor="test-investor-email">Test email address</label>
                <input id="test-investor-email" type="email" className={inputClass} value={testEmail} onChange={(event) => setTestEmail(event.target.value)} placeholder="founder@example.com" />
                <Button variant="outline" onClick={sendTest} disabled={sendingTest || !testEmail.trim()}><Mail size={14} /> {sendingTest ? "Sending…" : "Send test"}</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {!immutable && report.status === "draft" && <Button variant="outline" disabled={saving} onClick={() => void changeStatus("ready")}><Check size={14} /> Mark Ready</Button>}
                {!immutable && <Button disabled={saving} onClick={markSent}><Send size={14} /> Mark Sent & lock</Button>}
                {report.status === "sent" && <Button variant="outline" disabled={saving} onClick={() => void changeStatus("archived")}><Archive size={14} /> Archive</Button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10 border-t border-border pt-8">
        <div className="mb-4 flex items-center gap-3"><History className="text-primary" size={20} /><div><h2 className="font-display text-2xl tracking-wide">Previous Updates</h2><p className="font-body text-xs text-muted-foreground">Sent figures are read from the saved snapshot, never recalculated silently.</p></div></div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-left font-body text-sm">
            <thead><tr className="border-b border-border text-[9px] uppercase tracking-[0.15em] text-muted-foreground"><th className="px-4 py-3">Month</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Paying members</th><th className="px-4 py-3">MRR</th><th className="px-4 py-3">Sent</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>{history.map((item) => {
              const savedSnapshot = hasSnapshot(item.metrics_snapshot) ? item.metrics_snapshot : null;
              const savedPaying = savedSnapshot?.metrics.find((metricItem) => metricItem.id === "active_paying_members");
              const savedMrr = savedSnapshot?.metrics.find((metricItem) => metricItem.id === "mrr");
              return <tr key={item.id} className="border-b border-border/70 last:border-0"><td className="px-4 py-3 font-semibold">{formatReportMonth(item.report_month)}{item.version > 1 ? ` · v${item.version}` : ""}</td><td className="px-4 py-3"><StatusPill status={item.status} /></td><td className="px-4 py-3">{savedPaying ? formatMetricValue(savedPaying) : "—"}</td><td className="px-4 py-3">{savedMrr ? formatMetricValue(savedMrr) : "—"}</td><td className="px-4 py-3 text-muted-foreground">{item.sent_at ? new Date(item.sent_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1"><Button variant="ghost" size="sm" onClick={() => { setSelectedReportId(item.id); setSelectedMonth(monthKey(item.report_month)); }}>Open</Button>{isImmutable(item.status) && <Button variant="ghost" size="sm" onClick={() => void duplicateStructure(item)}>Duplicate</Button>}{item.generated_html && <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Copy ${formatReportMonth(item.report_month)} HTML`} onClick={() => void copy(item.generated_html!, "Saved HTML")}><Clipboard size={13} /></Button>}{item.generated_text && <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Copy ${formatReportMonth(item.report_month)} plain text`} onClick={() => void copy(item.generated_text!, "Saved plain text")}><FileText size={13} /></Button>}{savedSnapshot && <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Copy ${formatReportMonth(item.report_month)} metric snapshot`} onClick={() => void copy(JSON.stringify(savedSnapshot, null, 2), "Metric snapshot")}><Download size={13} /></Button>}</div></td></tr>;
            })}</tbody>
          </table>
          {!history.length && <p className="p-8 text-center font-body text-sm text-muted-foreground">No investor updates yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminInvestorReports;
