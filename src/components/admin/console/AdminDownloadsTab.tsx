import { Link } from "react-router-dom";
import ExportReports from "@/components/admin/ExportReports";
import { FileSpreadsheet, Printer, Download } from "lucide-react";

const AdminDownloadsTab = () => (
  <div className="space-y-6 max-w-4xl">
    <div>
      <h2 className="font-display text-2xl text-white tracking-wider">Downloads</h2>
      <p className="text-[#8E9299] text-sm font-body mt-1">Reports, printable material and the member download library.</p>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <Link to="/mindcast-live/coursebook"
        className="flex flex-col items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/20 transition-colors">
        <Printer size={16} className="text-[#3585AF]" />
        <span className="text-sm font-body text-[#E2E8F0]">Coursebook (print)</span>
        <span className="text-[11px] font-body text-[#8E9299]">All 52 weeks with workbook activities — print-ready.</span>
      </Link>
      <Link to="/portal/downloads"
        className="flex flex-col items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/20 transition-colors">
        <Download size={16} className="text-[#3585AF]" />
        <span className="text-sm font-body text-[#E2E8F0]">Worksheets & colouring pages</span>
        <span className="text-[11px] font-body text-[#8E9299]">Member download library — admins see every week unlocked.</span>
      </Link>
    </div>

    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet size={14} className="text-[#3585AF]" />
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299]">CSV reports</p>
      </div>
      <ExportReports />
    </div>
  </div>
);

export default AdminDownloadsTab;
