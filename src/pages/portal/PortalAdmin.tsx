import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Download } from "lucide-react";
import { Link } from "react-router-dom";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import MemberManager from "@/components/admin/MemberManager";
import ExportReports from "@/components/admin/ExportReports";

const TABS = [
  { key: "members", label: "MEMBERS", icon: Users },
  { key: "export", label: "EXPORT", icon: Download },
] as const;

type Tab = typeof TABS[number]["key"];

const PortalAdmin = () => {
  const { isStaff, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("members");

  // isStaff covers facilitator AND admin — an exact role === "facilitator"
  // match locked admins out of their own admin panel (roles resolve to the
  // highest privilege, so an admin's role is "admin", not "facilitator").
  if (loading) {
    return <PortalLayout><p className="text-muted-foreground">Loading…</p></PortalLayout>;
  }
  if (!isStaff) {
    return <PortalLayout><p className="text-muted-foreground">Access denied. Staff only.</p></PortalLayout>;
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

        {tab === "members" && <MemberManager />}
        {tab === "export" && <ExportReports />}

        <div className="mt-10 pt-6 border-t border-primary/10">
          <p className="text-[11px] tracking-widest text-primary/40 mb-2">RUNNING A SESSION?</p>
          <Link to="/mindcast-live/library" className="text-sm text-primary underline underline-offset-4">
            Open the 52-week coursebook to facilitate live →
          </Link>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalAdmin;
