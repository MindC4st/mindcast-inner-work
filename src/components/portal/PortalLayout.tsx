import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, Brain, Download, Settings, LogOut, Menu, X, TrendingUp, Users, User, CreditCard, Clapperboard } from "lucide-react";
import logoLight from "@/assets/logo-cream.png";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Sessions", to: "/portal/weeks", icon: BookOpen },
  { label: "Progress", to: "/portal/progress", icon: TrendingUp },
  { label: "Profile", to: "/portal/settings", icon: User },
  { label: "Insights", to: "/portal/insights", icon: Brain },
  { label: "Membership", to: "/portal/billing", icon: CreditCard },
];

const BOTTOM_TAB_ITEMS = [
  { label: "Home", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Sessions", to: "/portal/weeks", icon: BookOpen },
  { label: "Progress", to: "/portal/progress", icon: TrendingUp },
  { label: "Insights", to: "/portal/insights", icon: Brain },
  { label: "Profile", to: "/portal/settings", icon: User },
];

const PortalLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  const isActive = (to: string) => location.pathname.startsWith(to);

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-6">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <img src={logoLight} alt="Mindcast" className="h-8" />
        </Link>
        <p className="text-primary-foreground/25 text-[10px] tracking-[0.25em] mt-1.5 font-body">MEMBER PORTAL</p>
      </div>

      <div className="px-6 mb-4">
        <div className="border-t border-primary-foreground/[0.06]" />
      </div>

      <nav className="flex-1 px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
                active
                  ? "bg-primary-foreground/[0.08] text-primary-foreground"
                  : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
              }`}
            >
              {active && <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-[hsl(var(--blue-light))]" />}
              <item.icon size={15} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 mx-4 border-t border-primary-foreground/[0.06]" />

        <Link
          to="/portal/downloads"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
            isActive("/portal/downloads")
              ? "bg-primary-foreground/[0.08] text-primary-foreground"
              : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
          }`}
        >
          <Download size={15} strokeWidth={1.5} />
          Downloads
        </Link>

        <Link
          to="/portal/group"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
            isActive("/portal/group")
              ? "bg-primary-foreground/[0.08] text-primary-foreground"
              : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
          }`}
        >
          <Users size={15} strokeWidth={1.5} />
          Group View
        </Link>

        {isStaff && (
          <Link
            to="/mindcast-live/library"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              isActive("/mindcast-live")
                ? "bg-primary-foreground/[0.08] text-primary-foreground"
                : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
            }`}
          >
            <Clapperboard size={15} strokeWidth={1.5} />
            Facilitate
          </Link>
        )}

        {isStaff && (
          <Link
            to="/portal/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              isActive("/portal/admin")
                ? "bg-primary-foreground/[0.08] text-primary-foreground"
                : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
            }`}
          >
            <Settings size={15} strokeWidth={1.5} />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="p-6 pt-4">
        <div className="border-t border-primary-foreground/[0.06] mb-4" />
        <p className="text-primary-foreground/40 text-[11px] font-body mb-2">{profile?.name || "Member"}</p>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-primary-foreground/20 hover:text-primary-foreground/50 text-[10px] tracking-[0.15em] font-body transition-colors">
          <LogOut size={12} strokeWidth={1.5} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex portal-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[hsl(var(--navy))] text-primary-foreground flex-col transition-transform duration-300 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[hsl(var(--navy))] text-primary-foreground flex flex-col transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-5 text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-[hsl(var(--navy))] text-primary-foreground sticky top-0 z-30">
          <Link to="/"><img src={logoLight} alt="Mindcast" className="h-6" /></Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-4 md:p-10 lg:p-14 max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[hsl(var(--navy))]/95 backdrop-blur-md border-t border-primary-foreground/[0.06] safe-area-bottom">
        <div className="flex items-stretch">
          {BOTTOM_TAB_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                  active ? "text-primary-foreground" : "text-primary-foreground/25"
                }`}
              >
                <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[9px] tracking-[0.08em] font-body">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PortalLayout;
