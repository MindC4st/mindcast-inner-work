import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, Brain, Download, Settings, LogOut, Menu, X, TrendingUp, Users, User, CreditCard, Clapperboard, GraduationCap, Ticket, ShieldCheck } from "lucide-react";
import logoBlue from "@/assets/logo-blue-wordmark.png";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Sessions", to: "/portal/weeks", icon: BookOpen },
  { label: "Progress", to: "/portal/progress", icon: TrendingUp },
  { label: "Profile", to: "/portal/settings", icon: User },
  { label: "Insights", to: "/portal/insights", icon: Brain },
  { label: "Door pass", to: "/portal/pass", icon: Ticket },
  { label: "Family & safety", to: "/portal/family", icon: ShieldCheck },
  { label: "Membership", to: "/portal/billing", icon: CreditCard },
];

const BOTTOM_TAB_ITEMS = [
  { label: "Home", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Sessions", to: "/portal/weeks", icon: BookOpen },
  { label: "Progress", to: "/portal/progress", icon: TrendingUp },
  { label: "Insights", to: "/portal/insights", icon: Brain },
  { label: "Profile", to: "/portal/settings", icon: User },
];

const TEEN_BOTTOM_TAB_ITEMS = [
  { label: "Home", to: "/portal/dashboard", icon: LayoutDashboard },
  { label: "Sessions", to: "/portal/weeks", icon: BookOpen },
  { label: "Downloads", to: "/portal/downloads", icon: Download },
  { label: "Profile", to: "/portal/settings", icon: User },
];

const PortalLayout = ({ children, wide = false }: { children: ReactNode; wide?: boolean }) => {
  const { profile, signOut, isStaff, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isTeen = profile?.age_group?.toLowerCase() === "teen";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const isActive = (to: string) => location.pathname.startsWith(to);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [sidebarOpen]);

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-6">
        <Link to="/" onClick={() => setSidebarOpen(false)}>
          <img src={logoBlue} alt="Mindcast" className="h-8" />
        </Link>
        <p className="text-primary/60 text-[10px] tracking-[0.25em] mt-1.5 font-body">MEMBER PORTAL</p>
      </div>

      <div className="px-6 mb-4">
        <div className="border-t border-border" />
      </div>

      <nav className="flex-1 px-4" aria-label="Member portal">
        {NAV_ITEMS.filter((item) => {
          if (isTeen) return ["Dashboard", "Sessions", "Profile", "Door pass"].includes(item.label);
          return !(isStaff && item.label === "Progress");
        }).map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
              }`}
            >
              {active && <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-[hsl(var(--blue-light))]" />}
              <item.icon size={15} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-3 mx-4 border-t border-border" />

        <Link
          to="/portal/downloads"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
            isActive("/portal/downloads")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
          }`}
        >
          <Download size={15} strokeWidth={1.5} />
          Downloads
        </Link>

        {!isTeen && (
          <Link
            to="/portal/group"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              isActive("/portal/group")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <Users size={15} strokeWidth={1.5} />
            Group View
          </Link>
        )}

        {isStaff && (
          <Link
            to="/mindcast-live/library"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              isActive("/mindcast-live")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <Clapperboard size={15} strokeWidth={1.5} />
            Facilitate
          </Link>
        )}

        {/* Staff Training Hub. The page and its routes existed, but nothing in
            the app linked to them — no facilitator could reach their own
            required training without typing the URL. */}
        {isStaff && (
          <Link
            to="/admin/staff-training"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              isActive("/admin/staff-training")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <GraduationCap size={15} strokeWidth={1.5} />
            Staff Training
          </Link>
        )}

        {isStaff && (
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 mb-0.5 rounded-md text-[11px] tracking-[0.15em] font-body transition-all duration-200 ${
              isActive("/admin")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
            }`}
          >
            <Settings size={15} strokeWidth={1.5} />
            Admin Console
          </Link>
        )}
      </nav>

      <div className="p-6 pt-4">
        <div className="border-t border-border mb-4" />
        <p className="text-muted-foreground text-[11px] font-body mb-2">{profile?.display_name || profile?.name || "Member"}</p>
        {role && role !== "member" && (
          <p className="text-primary text-[9px] font-body tracking-[0.2em] uppercase mb-2">{role}</p>
        )}
        <button onClick={handleSignOut} className="flex items-center gap-2 text-muted-foreground/60 hover:text-foreground text-[10px] tracking-[0.15em] font-body transition-colors">
          <LogOut size={12} strokeWidth={1.5} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex portal-bg">
      <a href="#portal-content" className="sr-only z-[100] rounded bg-card px-4 py-3 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to portal content
      </a>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card text-foreground border-r border-border flex-col transition-transform duration-300 hidden lg:flex" aria-label="Portal sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <aside
          className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card text-foreground shadow-2xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Portal navigation"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Close navigation"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
          <SidebarContent />
        </aside>
      )}

      {/* Main content */}
      <main id="portal-content" className="flex-1 min-h-screen min-w-0 pb-20 lg:pb-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-card/95 backdrop-blur-md text-foreground border-b border-border sticky top-0 z-30">
          <Link to="/"><img src={logoBlue} alt="Mindcast" className="h-6" /></Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Open portal navigation"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className={`p-4 md:p-10 lg:p-14 mx-auto ${wide ? "max-w-7xl" : "max-w-4xl"}`}>
          {children}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom" aria-label="Portal tabs">
        <div className="flex items-stretch">
          {(isTeen ? TEEN_BOTTOM_TAB_ITEMS : BOTTOM_TAB_ITEMS)
            .filter((item) => !(isStaff && item.label === "Progress"))
            .map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground/50"
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
