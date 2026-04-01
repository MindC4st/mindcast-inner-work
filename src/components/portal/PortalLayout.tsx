import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, Brain, Download, Settings, LogOut, Menu, X, TrendingUp, Users, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Sessions", to: "/portal/weeks", icon: BookOpen },
  { label: "My Progress", to: "/portal/progress", icon: TrendingUp },
  { label: "My Profile", to: "/portal/settings", icon: User },
  { label: "Insights", to: "/portal/insights", icon: Brain },
  { label: "Downloads", to: "/portal/downloads", icon: Download },
];

const PortalLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  return (
    <div className="min-h-screen flex portal-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-primary text-primary-foreground flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-8 pb-6">
          <Link to="/" className="font-display text-2xl tracking-[0.15em] text-primary-foreground">MINDCAST</Link>
          <p className="text-primary-foreground/25 text-[10px] tracking-[0.25em] mt-1.5 font-body">MEMBER PORTAL</p>
        </div>

        <div className="px-6 mb-4">
          <div className="border-t border-primary-foreground/[0.06]" />
        </div>

        <nav className="flex-1 px-4">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mb-0.5 text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
                  active
                    ? "bg-primary-foreground/[0.08] text-primary-foreground"
                    : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
                }`}
              >
                <item.icon size={15} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}

          <div className="my-3 mx-4 border-t border-primary-foreground/[0.06]" />

          <Link
            to="/portal/group"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              location.pathname === "/portal/group"
                ? "bg-primary-foreground/[0.08] text-primary-foreground"
                : "text-primary-foreground/30 hover:text-primary-foreground/60 hover:bg-primary-foreground/[0.03]"
            }`}
          >
            <Users size={15} strokeWidth={1.5} />
            Group View
          </Link>

          {role === "facilitator" && (
            <Link
              to="/portal/admin"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 mb-0.5 text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
                location.pathname.startsWith("/portal/admin")
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
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-primary text-primary-foreground">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <span className="font-display text-lg tracking-[0.15em]">MINDCAST</span>
          <div className="w-6" />
        </div>

        <div className="p-5 md:p-10 lg:p-14 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
