import { Link } from "react-router-dom";
import ExportReports from "@/components/admin/ExportReports";
import { FileSpreadsheet, Printer, Download } from "lucide-react";

const AdminDownloadsTab = () => (
  <div className="space-y-6 max-w-4xl">
    <div>
      <h2 className="font-display text-2xl text-foreground tracking-wider">Downloads</h2>
      <p className="text-muted-foreground text-sm font-body mt-1">Reports, printable material and the member download library.</p>
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

export default AdminDownloadsTab;
