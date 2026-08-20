import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Loader2, Check } from "lucide-react";

// Authenticated membership management. Logged-in members build a household
// bundle (adults / teens / children), pick a billing cadence, and are sent to
// Stripe Checkout (mode: subscription); existing members manage/cancel via the
// Stripe billing portal. Status mirrors profile.membership_status, which the
// stripe-webhook keeps in sync.
//
// Contract with create-subscription-checkout (Jul 2026 family-bundle model):
//   body = { plan: "monthly" | "annual", adults, teens, children }
// FAMILY15 discount is applied server-side when 2+ adults and ≥1 teen/child.
//
// Brand-aligned to `/` and `/demo`: ivory background, Bebas plan names,
// Montserrat body, single primary CTA per card.

type Plan = "monthly" | "annual";

const PLANS: { id: Plan; name: string; blurb: string; note: string }[] = [
  { id: "monthly", name: "MONTHLY", blurb: "Rolling monthly membership.", note: "Cancel anytime." },
  { id: "annual", name: "ANNUAL", blurb: "Pay for the year — best value for regular attendance.", note: "Renews yearly." },
];

const ACTIVE = new Set(["active", "trialing"]);

const PortalBilling = () => {
  const { user, profile, membershipStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMember = ACTIVE.has(membershipStatus);
  const isTeen = (profile?.age_group || "").toLowerCase() === "teen";

  // Household bundle. Default to one membership matching the signed-in member.
  const [adults, setAdults] = useState(isTeen ? 0 : 1);
  const [teens, setTeens] = useState(isTeen ? 1 : 0);
  const [children, setChildren] = useState(0);

  const totalSeats = adults + teens + children;
  const familyDiscount = adults >= 2 && (teens >= 1 || children >= 1);

  const startCheckout = async (plan: Plan) => {
    if (!user) { navigate("/portal/login"); return; }
    if (totalSeats < 1) { setError("Select at least one membership."); return; }
    setBusy(plan); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { plan, adults, teens, children },
      });
      if (error) throw error;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not start checkout");
    } catch (e) {
      setError(e?.message ?? "Something went wrong");
      setBusy(null);
    }
  };

  const manageBilling = async () => {
    setBusy("portal"); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-billing-portal", { body: {} });
      if (error) throw error;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not open billing portal");
    } catch (e) {
      setError(e?.message ?? "Something went wrong");
      setBusy(null);
    }
  };

  return (
    <PortalLayout>
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
                <p className="text-xs text-foreground/50 font-body mt-1">Thanks for being a Mindcast member.</p>
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
          <div className="border border-foreground/10 rounded-sm p-5 mb-6 bg-foreground/[0.02]">
            <p className="font-display text-base tracking-wider text-foreground mb-1">YOUR HOUSEHOLD</p>
            <p className="text-xs text-foreground/50 font-body mb-4">
              Choose how many memberships you need. Children don't get logins — a child membership unlocks the kids' lessons and colouring pages for your family.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                { label: "ADULTS", value: adults, set: setAdults },
                { label: "TEENS (13–17)", value: teens, set: setTeens },
                { label: "CHILDREN", value: children, set: setChildren },
              ] as const).map((row) => (
                <div key={row.label} className="border border-foreground/10 rounded-sm p-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-body font-semibold tracking-widest text-foreground/60">{row.label}</span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Fewer ${row.label.toLowerCase()}`}
                      onClick={() => row.set(Math.max(0, row.value - 1))}
                      className="w-7 h-7 border border-foreground/20 rounded-sm text-foreground/70 hover:border-primary/60 hover:text-primary"
                    >
                      −
                    </button>
                    <span className="font-display text-lg w-6 text-center">{row.value}</span>
                    <button
                      type="button"
                      aria-label={`More ${row.label.toLowerCase()}`}
                      onClick={() => row.set(Math.min(20, row.value + 1))}
                      className="w-7 h-7 border border-foreground/20 rounded-sm text-foreground/70 hover:border-primary/60 hover:text-primary"
                    >
                      +
                    </button>
                  </span>
                </div>
              ))}
            </div>
            {familyDiscount && (
              <p className="text-[11px] font-body text-primary mt-3">
                Family discount applies — it will show automatically at checkout.
              </p>
            )}
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
                  disabled={busy === p.id || totalSeats < 1}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-body font-semibold tracking-widest uppercase py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Choose ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {!isMember && (
          <p className="text-[11px] text-foreground/40 font-body mt-4">
            You'll see the exact price for your household before confirming at checkout. Cancel anytime.
          </p>
        )}

        {error && <p className="text-sm text-destructive font-body mt-6">{error}</p>}
        {authLoading && <p className="text-xs font-body uppercase tracking-widest text-foreground/40 mt-6">Loading…</p>}
      </div>
    </PortalLayout>
  );
};

export default PortalBilling;
