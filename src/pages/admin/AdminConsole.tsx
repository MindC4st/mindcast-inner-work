import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoBlue from "@/assets/logo-blue-wordmark.png";
import {
  LayoutDashboard, Clapperboard, CalendarDays, TrendingUp, CreditCard,
  Users, Download, LineChart, UserCircle, Layers, GraduationCap, Megaphone, ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminScheduling = lazy(() => import("./AdminScheduling"));
const AdminProgram = lazy(() => import("./AdminProgram"));
const AdminKids = lazy(() => import("./AdminKids"));
const AdminModeration = lazy(() => import("./AdminModeration"));
const AdminEmailReminders = lazy(() => import("./AdminEmailReminders"));
const AdminHistory = lazy(() => import("./AdminHistory"));
const AdminMembership = lazy(() => import("./AdminMembership"));
const AdminApplicationsPage = lazy(() => import("./AdminApplicationsPage"));
const AdminMembers = lazy(() => import("./AdminMembers"));
const AdminHouseholds = lazy(() => import("./AdminHouseholds"));
const AdminLifeGroups = lazy(() => import("./AdminLifeGroups"));
const AdminRoster = lazy(() => import("./AdminRoster"));
const AdminConcessions = lazy(() => import("./AdminConcessions"));
const AdminProgress = lazy(() => import("@/components/admin/console/AdminProgress"));
const AdminInsights = lazy(() => import("@/components/admin/console/AdminInsights"));
const AdminProfile = lazy(() => import("@/components/admin/console/AdminProfile"));
const AdminDownloadsTab = lazy(() => import("@/components/admin/console/AdminDownloadsTab"));
const FacilitateTab = lazy(() => import("@/components/admin/console/FacilitateTab"));
const BraceletStudio = lazy(() => import("@/components/admin/console/BraceletStudio"));
const TrainingHome = lazy(() => import("@/components/staff-training/TrainingHome"));
const MarketingTab = lazy(() => import("@/pages/Marketing"));
const AdminOrdersTab = lazy(() => import("@/components/admin/console/AdminOrdersTab"));

type TabId =
  | "dashboard" | "sessions" | "progress" | "profile" | "insights"
  | "membership" | "downloads" | "groups" | "facilitate" | "training" | "marketing" | "orders";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "facilitate", label: "Facilitate", icon: Clapperboard },
  { id: "sessions", label: "Sessions", icon: CalendarDays },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "training", label: "Training", icon: GraduationCap },
  { id: "insights", label: "Insights", icon: LineChart },
  { id: "membership", label: "Membership", icon: CreditCard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "groups", label: "Group View", icon: Users },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const SESSION_SUBTABS = [
  { id: "schedule", label: "Schedule" },
  { id: "roster", label: "Roster" },
  { id: "program", label: "Program & Unlocks" },
  { id: "kids", label: "Kids Sessions" },
  { id: "moderation", label: "Moderation" },
  { id: "emails", label: "Reminders" },
  { id: "history", label: "History" },
] as const;

const MEMBERSHIP_SUBTABS = [
  { id: "overview", label: "Subscriptions" },
  { id: "applications", label: "Applications" },
  { id: "members", label: "Members" },
  { id: "concessions", label: "Concessions" },
  { id: "households", label: "Households" },
  { id: "bracelets", label: "Bracelets" },
] as const;

const Fallback = () => (
  <div className="py-24 flex justify-center">
    <span className="text-muted-foreground text-xs font-body tracking-widest uppercase animate-pulse">Loading…</span>
  </div>
);

const SubTabBar = ({ tabs, active, onChange }: {
  tabs: readonly { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) => (
  <div className="flex gap-1 rounded-md border border-border bg-card p-1 w-fit mb-6 overflow-x-auto max-w-full">
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`px-3.5 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm whitespace-nowrap transition-colors ${active === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
        {t.label}
      </button>
    ))}
  </div>
);

const AdminConsole = () => {
  const { role, isAdmin } = useAuth();
  const [search] = useSearchParams();
  const tabParam = search.get("tab") as TabId | null;
  const subParam = search.get("sub");
  const [tab, setTab] = useState<TabId>(
    tabParam && TABS.some((t) => t.id === tabParam) && (tabParam !== "membership" || isAdmin)
      ? tabParam
      : "dashboard",
  );
  const [sessionSub, setSessionSub] = useState<string>(
    subParam && SESSION_SUBTABS.some((s) => s.id === subParam) ? subParam : "schedule",
  );
  const [membershipSub, setMembershipSub] = useState<string>(
    subParam && MEMBERSHIP_SUBTABS.some((s) => s.id === subParam) ? subParam : "overview",
  );

  const visibleTabs = TABS.filter((t) => t.id !== "membership" || isAdmin);

  const renderTab = () => {
    switch (tab) {
      case "dashboard": return <AdminDashboard embedded />;
      case "facilitate": return <FacilitateTab />;
      case "progress": return <AdminProgress />;
      case "training": return <TrainingHome embedded />;
      case "insights": return <AdminInsights />;
      case "profile": return <AdminProfile />;
      case "downloads": return <AdminDownloadsTab />;
      case "orders": return <AdminOrdersTab />;
      case "marketing": return <MarketingTab />;
      case "groups": return <AdminLifeGroups embedded />;
      case "sessions": return (
        <div>
          <SubTabBar tabs={SESSION_SUBTABS} active={sessionSub} onChange={setSessionSub} />
          {sessionSub === "schedule" && <AdminScheduling embedded />}
          {sessionSub === "roster" && <AdminRoster embedded />}
          {sessionSub === "program" && <AdminProgram embedded />}
          {sessionSub === "kids" && <AdminKids embedded />}
          {sessionSub === "moderation" && <AdminModeration embedded />}
          {sessionSub === "emails" && <AdminEmailReminders embedded />}
          {sessionSub === "history" && <AdminHistory embedded />}
        </div>
      );
      case "membership": return (
        <div>
          <SubTabBar tabs={MEMBERSHIP_SUBTABS} active={membershipSub} onChange={setMembershipSub} />
          {membershipSub === "overview" && <AdminMembership embedded />}
          {membershipSub === "applications" && <AdminApplicationsPage embedded />}
          {membershipSub === "members" && <AdminMembers embedded />}
          {membershipSub === "concessions" && <AdminConcessions embedded />}
          {membershipSub === "households" && <AdminHouseholds embedded />}
          {membershipSub === "bracelets" && <BraceletStudio />}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen portal-bg text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/85 border-b border-border">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <Link to="/"><img src={logoBlue} alt="Mindcast" className="h-6" /></Link>
            <span className="px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-body tracking-[0.2em] uppercase">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground">{role}</span>
            <Link to="/portal/dashboard" className="text-[11px] font-body tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              Member portal →
            </Link>
          </div>
        </div>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2">
          {visibleTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm whitespace-nowrap transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col gap-1 w-56 shrink-0 p-4 border-r border-border min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
          {visibleTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${tab === t.id ? "bg-foreground/[0.05] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}>
              {tab === t.id && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary" />}
              <t.icon size={15} strokeWidth={1.75} className={tab === t.id ? "text-primary" : ""} />
              <span className="text-xs font-body tracking-[0.15em] uppercase">{t.label}</span>
            </button>
          ))}
          <div className="mt-auto pt-6 px-3">
            <p className="text-[9px] font-body tracking-[0.2em] uppercase text-muted-foreground/60 flex items-center gap-1.5">
              <Layers size={10} /> Notice it. Name it. Do it.
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-8">
          <Suspense fallback={<Fallback />}>
            {renderTab()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminConsole;
