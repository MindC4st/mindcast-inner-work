import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, Brain, Download, Settings, LogOut, Menu, X, TrendingUp, Users, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "DASHBOARD", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "SESSIONS", to: "/portal/weeks", icon: BookOpen },
  { label: "MY PROGRESS", to: "/portal/progress", icon: TrendingUp },
  { label: "MY PROFILE", to: "/portal/settings", icon: User },
  { label: "AI INSIGHTS", to: "/portal/insights", icon: Brain },
  { label: "MY DOWNLOADS", to: "/portal/downloads", icon: Download },
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
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-secondary flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-secondary/10">
          <Link to="/" className="font-display text-2xl tracking-widest text-secondary">MINDCAST</Link>
          <p className="text-secondary/40 text-[10px] tracking-widest mt-1">MEMBER PORTAL</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-xs tracking-widest transition-colors ${
                  active ? "bg-secondary/10 text-secondary border-l-2 border-secondary" : "text-secondary/40 hover:text-secondary hover:bg-secondary/5"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/portal/group"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-6 py-3 text-xs tracking-widest transition-colors ${
              location.pathname === "/portal/group" ? "bg-secondary/10 text-secondary border-l-2 border-secondary" : "text-secondary/40 hover:text-secondary hover:bg-secondary/5"
            }`}
          >
            <Users size={16} />
            GROUP VIEW
          </Link>
          {role === "facilitator" && (
            <Link
              to="/portal/admin"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-xs tracking-widest transition-colors ${
                location.pathname === "/portal/admin" ? "bg-secondary/10 text-secondary border-l-2 border-secondary" : "text-secondary/40 hover:text-secondary hover:bg-secondary/5"
              }`}
            >
              <Settings size={16} />
              ADMIN PANEL
            </Link>
          )}
        </nav>

        <div className="p-6 border-t border-secondary/10">
          <p className="text-secondary/60 text-xs mb-1">{profile?.name || "Member"}</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-secondary/30 hover:text-secondary text-[10px] tracking-widest transition-colors">
            <LogOut size={12} /> LOG OUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-primary text-secondary border-b border-secondary/10">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="font-display text-lg tracking-widest">MINDCAST</span>
          <div className="w-6" />
        </div>
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
