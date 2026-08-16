import { useState } from "react";
import { Link } from "react-router-dom";
import ExportReports from "@/components/admin/ExportReports";
import { supabase } from "@/integrations/supabase/client";
import { resolveColouringUrl } from "@/lib/colouringUrl";
import { toast } from "sonner";
import { FileSpreadsheet, Printer, Download, Palette, Loader2 } from "lucide-react";

const AdminDownloadsTab = () => {
  const [weekNum, setWeekNum] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ png: string; pdf: string } | null>(null);

  const generate = async () => {
    setBusy(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-coloring-page", {
        body: { week_number: weekNum },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: { body?: unknown } }).context;
          if (ctx?.body) {
            const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body as ReadableStream).text();
            const parsed = JSON.parse(text);
            if (parsed?.error) detail = parsed.error;
          }
        } catch { /* keep generic */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setResult({ png: data.coloring_page_url, pdf: data.coloring_pdf_url });
      toast.success("Colouring page ready", { description: "A4 PDF generated — download it below." });
    } catch (e) {
      toast.error("Colouring generation failed", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const openSigned = async (path: string) => {
    const url = await resolveColouringUrl(path);
    if (url) window.open(url, "_blank", "noopener");
    else toast.error("Couldn't open the file");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl text-foreground tracking-wider">Downloads</h2>
        <p className="text-muted-foreground text-sm font-body mt-1">Reports, printable material and the member download library.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={14} className="text-primary" />
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">Colouring page (A4 PDF)</p>
        </div>
        <p className="text-[11px] font-body text-muted-foreground mb-4">
          One click generates the week's colouring page as a branded A4 PDF — MINDCAST logo, session date, title and a "Your Name" line. No Canva, no manual layout.
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-body text-foreground">
            Week
            <input
              type="number" min={1} max={52} value={weekNum}
              onChange={(e) => setWeekNum(Math.min(52, Math.max(1, parseInt(e.target.value || "1", 10) || 1)))}
              className="w-20 bg-transparent border border-border rounded-md px-3 py-2 text-foreground font-body focus:outline-none focus:border-primary"
            />
          </label>
          <button onClick={generate} disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-[11px] font-body tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Palette size={13} />}
            {busy ? "Generating…" : "Generate A4 PDF"}
          </button>
          {result && (
            <>
              <button onClick={() => openSigned(result.pdf)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary text-primary text-[11px] font-body tracking-widest uppercase hover:bg-primary/10 transition-colors">
                <Download size={13} /> Download PDF
              </button>
              <button onClick={() => openSigned(result.png)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-muted-foreground text-[11px] font-body tracking-widest uppercase hover:text-foreground transition-colors">
                Preview image
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/mindcast-live/coursebook"
          className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 hover:border-border transition-colors">
          <Printer size={16} className="text-primary" />
          <span className="text-sm font-body text-foreground">Coursebook (print)</span>
          <span className="text-[11px] font-body text-muted-foreground">All 52 weeks with workbook activities — print-ready.</span>
        </Link>
        <Link to="/portal/downloads"
          className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 hover:border-border transition-colors">
          <Download size={16} className="text-primary" />
          <span className="text-sm font-body text-foreground">Worksheets & colouring pages</span>
          <span className="text-[11px] font-body text-muted-foreground">Member download library — admins see every week unlocked.</span>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={14} className="text-primary" />
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">CSV reports</p>
        </div>
        <ExportReports />
      </div>
    </div>
  );
};

export default AdminDownloadsTab;
