import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Users, Radio, Download } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import SessionManager from "@/components/admin/SessionManager";
import MemberManager from "@/components/admin/MemberManager";
import LiveSessionMode from "@/components/admin/LiveSessionMode";
import ExportReports from "@/components/admin/ExportReports";

const TABS = [
  { key: "sessions", label: "SESSIONS", icon: Settings },
  { key: "members", label: "MEMBERS", icon: Users },
  { key: "live", label: "LIVE MODE", icon: Radio },
  { key: "export", label: "EXPORT", icon: Download },
] as const;

type Tab = typeof TABS[number]["key"];

const PortalAdmin = () => {
  const { role } = useAuth();
  const [tab, setTab] = useState<Tab>("sessions");

  if (role !== "facilitator") {
    return <PortalLayout><p className="text-muted-foreground">Access denied. Facilitators only.</p></PortalLayout>;
  }

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="heading-display text-3xl text-primary mb-6">ADMIN PANEL</h1>

        {/* Tabs */}
        <div className="flex border-b border-primary/10 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-[10px] tracking-widest transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-primary/40 hover:text-primary/60"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sessions" && <SessionManager />}
        {tab === "members" && <MemberManager />}
        {tab === "live" && <LiveSessionMode />}
        {tab === "export" && <ExportReports />}
      </motion.div>
    </PortalLayout>
  );
};

export default PortalAdmin;
