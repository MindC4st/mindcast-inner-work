import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

const AdminMembership = () => {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    (async () => {
      const [s, p] = await Promise.all([
        (supabase as any).from("subscriptions").select("*").order("updated_at", { ascending: false }).limit(500),
        (supabase as any).from("profiles").select("id, display_name, name, email, membership_status"),
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
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/admin" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="text-sm text-foreground/50 hover:text-foreground">← Admin</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <h1 className="font-display text-2xl font-bold mb-6">Membership & payments</h1>

        <div className="flex flex-wrap gap-3 mb-8">
          {["active", "trialing", "past_due", "paused", "lapsed", "none"].map((k) => (
            <div key={k} className="border rounded px-4 py-3 min-w-[6rem]">
              <div className="text-2xl font-semibold">{counts[k] || 0}</div>
              <div className="text-xs text-foreground/50 capitalize">{k.replace("_", " ")}</div>
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-sm mb-2">Subscriptions</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-foreground/40 border-b">
            <th className="py-2">Member</th><th>Plan</th><th>Status</th><th>Renews</th><th>Cancelling</th>
          </tr></thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-foreground/[0.06]">
                <td className="py-2">{nameFor(s.profile_id)}</td>
                <td>{s.plan || "—"}</td>
                <td>{s.status}</td>
                <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
                <td>{s.cancel_at_period_end ? "Yes" : "—"}</td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-foreground/40">No subscriptions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMembership;
