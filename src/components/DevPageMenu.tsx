import { useState } from "react";
import { Link } from "react-router-dom";
import { Map, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Developer / staff page index — the "jump to any page while editing" menu.
//
// Replaces Lovable's page navigator for local dev and Vercel preview builds.
// GATED: only renders in dev mode OR for signed-in staff (facilitator/admin),
// so real members never see internal/admin routes. Uses <Link> for instant
// client-side navigation. Param routes use a sample value so links are live.

type Group = { label: string; links: [string, string][] };

const GROUPS: Group[] = [
  { label: "Public / Marketing", links: [
    ["/", "Home"], ["/about", "About"], ["/membership", "Membership"],
    ["/auth", "Sign in"], ["/onboarding", "Onboarding"],
  ]},
  { label: "Portal (member)", links: [
    ["/portal/dashboard", "Dashboard"], ["/portal/weeks", "Weeks"], ["/portal/week/1", "Week (1)"],
    ["/portal/group", "Group"], ["/portal/insights", "Insights"], ["/portal/downloads", "Downloads"],
    ["/portal/settings", "Settings"], ["/portal/progress", "Progress"], ["/portal/billing", "Billing"],
    ["/portal/admin", "Portal admin"], ["/portal/login", "Login"],
  ]},
  { label: "Sunday Live", links: [
    ["/live", "Live (coming soon)"], ["/live/DEMO01", "Live join (DEMO01)"],
    ["/mindcast-live/library", "Coursebook library"], ["/mindcast-live/lesson/1", "Lesson (1)"],
    ["/mindcast-live/facilitate/1", "Facilitate (1)"], ["/b/SAMPLE", "Bracelet tap (sample)"],
  ]},
  { label: "Admin", links: [
    ["/admin", "Admin console"], ["/admin/kiosk", "Kiosk"], ["/admin/framework", "Framework"],
  ]},
  { label: "Displays / Legal", links: [
    ["/display", "Welcome wall"],
    ["/terms", "Terms"], ["/privacy", "Privacy"], ["/refund", "Refund"], ["/safeguarding", "Safeguarding"],
  ]},
];

const DevPageMenu = () => {
  const { isStaff } = useAuth();
  const [open, setOpen] = useState(false);

  // Dev builds always; production only for staff.
  if (!(import.meta.env.DEV || isStaff)) return null;

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Page menu"
        className="fixed bottom-3 left-3 z-[60] flex items-center gap-1.5 rounded-full bg-foreground text-background shadow-lg px-3 py-2 text-[11px] font-semibold tracking-wide"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Map size={14} /> Pages
      </button>

      {open && (
        <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-14 left-3 max-h-[70vh] w-[19rem] overflow-y-auto rounded-lg border border-foreground/10 bg-background shadow-2xl p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-foreground/60">Page index</span>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={15} className="text-foreground/40" /></button>
            </div>
            {GROUPS.map((g) => (
              <div key={g.label} className="mb-3">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-1">{g.label}</p>
                <div className="flex flex-wrap gap-1">
                  {g.links.map(([to, label]) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className="text-[11px] rounded border border-foreground/10 hover:border-primary/50 hover:text-primary px-2 py-1 text-foreground/70"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[10px] text-foreground/30 mt-1">Dev/staff only · not shown to members</p>
          </div>
        </div>
      )}
    </>
  );
};

export default DevPageMenu;
