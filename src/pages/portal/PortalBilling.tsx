import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check, ArrowLeft } from "lucide-react";

// Authenticated membership management. Logged-in members pick a plan and are
// sent to Stripe Checkout (mode: subscription); existing members manage/cancel
// via the Stripe billing portal. Status mirrors profile.membership_status,
// which the stripe-webhook keeps in sync.
//
// Brand-aligned to `/` and `/demo`: ivory background, Bebas plan names,
// Montserrat body, single primary CTA per card.

type Plan = "monthly" | "termly";

const PLANS: { id: Plan; name: string; blurb: string; note: string }[] = [
  { id: "monthly", name: "MONTHLY", blurb: "Rolling monthly membership.", note: "Cancel anytime." },
  { id: "termly", name: "TERMLY", blurb: "Pay per term — best value for regular attendance.", note: "Renews each term." },
];

const ACTIVE = new Set(["active", "trialing"]);

const PortalBilling = () => {
  const { user, membershipStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMember = ACTIVE.has(membershipStatus);

  const startCheckout = async (plan: Plan) => {
    if (!user) { navigate("/portal/login"); return; }
    setBusy(plan); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", { body: { plan } });
      if (error) throw error;
      if ((data as any)?.url) { window.location.href = (data as any).url; return; }
      throw new Error((data as any)?.error || "Could not start checkout");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setBusy(null);
    }
  };

  const manageBilling = async () => {
    setBusy("portal"); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-billing-portal", { body: {} });
      if (error) throw error;
      if ((data as any)?.url) { window.location.href = (data as any).url; return; }
      throw new Error((data as any)?.error || "Could not open billing portal");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/portal/dashboard" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body text-foreground/40 hover:text-foreground/70">
          <ArrowLeft size={12} /> DASHBOARD
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Membership</p>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-3">YOUR PLAN</h1>
        <p className="text-foreground/60 text-sm font-body leading-relaxed mb-10 max-w-md">
          Recurring membership covers weekly live sessions for you and your household.
        </p>

        {isMember && (
          <div className="border border-primary/25 bg-primary/5 rounded-sm p-5 mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-lg tracking-wider text-foreground leading-none">MEMBERSHIP {membershipStatus.toUpperCase()}</p>
                <p className="text-xs text-foreground/50 font-body mt-1">Thanks for being part of the pilot.</p>
              </div>
            </div>
            <button
              onClick={manageBilling}
              disabled={busy === "portal"}
              className="text-[10px] font-body font-semibold tracking-widest uppercase border border-foreground/20 hover:border-primary/60 hover:text-primary rounded-sm px-4 py-2.5 shrink-0 flex items-center gap-2"
            >
              {busy === "portal" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Manage"}
            </button>
          </div>
        )}

        {membershipStatus === "past_due" && (
          <div className="border border-destructive/30 bg-destructive/5 rounded-sm p-5 mb-8">
            <p className="font-display text-base tracking-wider text-destructive mb-2">PAYMENT FAILED</p>
            <p className="text-sm text-foreground/70 font-body leading-relaxed mb-4">
              Your last payment didn't go through. Update your card to keep your membership active.
            </p>
            <button
              onClick={manageBilling}
              disabled={busy === "portal"}
              className="text-[10px] font-body font-semibold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm px-4 py-2.5 flex items-center gap-2"
            >
              {busy === "portal" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update payment method"}
            </button>
          </div>
        )}

        {!isMember && (
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.map((p) => (
              <div key={p.id} className="border border-foreground/10 rounded-sm p-6 bg-foreground/[0.02] flex flex-col hover:border-primary/40 transition-colors">
                <h2 className="font-display text-2xl tracking-wider text-foreground mb-2">{p.name}</h2>
                <p className="text-sm text-foreground/70 font-body leading-relaxed flex-1">{p.blurb}</p>
                <p className="text-[10px] font-body uppercase tracking-widest text-foreground/40 mt-2 mb-5">{p.note}</p>
                <button
                  onClick={() => startCheckout(p.id)}
                  disabled={busy === p.id}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-body font-semibold tracking-widest uppercase py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Choose ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive font-body mt-6">{error}</p>}
        {authLoading && <p className="text-xs font-body uppercase tracking-widest text-foreground/40 mt-6">Loading…</p>}
      </div>
    </div>
  );
};

export default PortalBilling;
