import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

// Subscription & payment health. Reads the subscriptions table (kept in sync by
// the stripe-webhook) plus membership_status counts from profiles.

type Sub = {
  id: string;
  status: string;
  plan: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  profile_id: string | null;
  stripe_customer_id: string;
};
type Profile = { id: string; display_name: string | null; name: string | null; email: string | null; membership_status: string };

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  trialing: "bg-primary/10 text-primary border-primary/25",
  past_due: "bg-destructive/10 text-destructive border-destructive/30",
  paused: "bg-foreground/10 text-foreground/60 border-foreground/15",
  lapsed: "bg-foreground/5 text-foreground/40 border-foreground/10",
  none: "bg-foreground/5 text-foreground/40 border-foreground/10",
};

const StatusPill = ({ status }: { status: string }) => (
  <span className={`inline-block text-[9px] font-body font-semibold tracking-[0.15em] uppercase px-2 py-1 rounded-sm border ${STATUS_STYLES[status] || STATUS_STYLES.none}`}>
    {status.replace("_", " ")}
  </span>
);

const AdminMembership = ({ embedded = false }: { embedded?: boolean }) => {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    (async () => {
      const [s, p] = await Promise.all([
        db.from("subscriptions").select("*").order("updated_at", { ascending: false }).limit(500),
        db.from("profiles").select("id, display_name, name, email, membership_status"),
      ]);
      setSubs(s.data || []);
      setProfiles(p.data || []);
    })();
  }, []);

  const counts = profiles.reduce<Record<string, number>>((acc, p) => {
    const k = p.membership_status || "none";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const nameFor = (pid: string | null) => {
    const p = profiles.find((x) => x.id === pid);
    return p?.display_name || p?.name || p?.email || (pid ? pid.slice(0, 8) : "—");
  };

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      {!embedded && (
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body text-foreground/40 hover:text-foreground/70">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>
      )}

      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-2">MEMBERSHIP & PAYMENTS</h1>
        <p className="text-foreground/50 text-sm font-body mb-10">Subscription health, mirrored from Stripe via the webhook.</p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-10">
          {["active", "trialing", "past_due", "paused", "lapsed", "none"].map((k) => (
            <div key={k} className="border border-foreground/10 rounded-sm p-4 bg-foreground/[0.02]">
              <div className="font-display text-3xl tracking-wider text-foreground">{counts[k] || 0}</div>
              <div className="text-[10px] font-body uppercase tracking-widest text-foreground/40 mt-1">{k.replace("_", " ")}</div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg tracking-wider mb-3">SUBSCRIPTIONS</h2>
        <div className="border border-foreground/10 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm font-body">
            <thead className="bg-foreground/[0.03]">
              <tr className="text-left text-[10px] font-body uppercase tracking-widest text-foreground/40">
                <th className="py-3 px-4">Member</th><th className="px-2">Plan</th><th className="px-2">Status</th><th className="px-2">Renews</th><th className="px-2">Cancelling</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-foreground/[0.06]">
                  <td className="py-2.5 px-4 text-foreground">{nameFor(s.profile_id)}</td>
                  <td className="px-2 text-foreground/70">{s.plan || "—"}</td>
                  <td className="px-2"><StatusPill status={s.status} /></td>
                  <td className="px-2 text-foreground/60 text-xs">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
                  <td className="px-2 text-foreground/60 text-xs">{s.cancel_at_period_end ? "Yes" : "—"}</td>
                </tr>
              ))}
              {subs.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-foreground/40 text-sm">No subscriptions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMembership;
