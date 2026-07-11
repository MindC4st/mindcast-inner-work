import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Check } from "lucide-react";

// Authenticated membership management. Logged-in members pick a plan and are
// sent to Stripe Checkout (mode: subscription); existing members manage/cancel
// via the Stripe billing portal. Status mirrors profile.membership_status,
// which the stripe-webhook keeps in sync.

type Plan = "monthly" | "termly";

const PLANS: { id: Plan; name: string; blurb: string }[] = [
  { id: "monthly", name: "Monthly", blurb: "Rolling monthly membership. Cancel anytime." },
  { id: "termly", name: "Termly", blurb: "Pay per term — best value for regular attendance." },
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
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not start checkout");
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
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not open billing portal");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold mb-2">Membership</h1>
        <p className="text-muted-foreground mb-8">
          Your recurring membership covers weekly live sessions for you and your household.
        </p>

        {isMember && (
          <Card className="p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium">Your membership is {membershipStatus}.</span>
            </div>
            <Button variant="outline" onClick={manageBilling} disabled={busy === "portal"}>
              {busy === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage billing"}
            </Button>
          </Card>
        )}

        {membershipStatus === "past_due" && (
          <Card className="p-5 mb-8 border-amber-400">
            <p className="text-sm">
              Your last payment failed. Please update your card to keep your membership active.
            </p>
            <Button className="mt-3" onClick={manageBilling} disabled={busy === "portal"}>
              {busy === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update payment method"}
            </Button>
          </Card>
        )}

        {!isMember && (
          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.map((p) => (
              <Card key={p.id} className="p-6 flex flex-col">
                <h2 className="text-xl font-semibold">{p.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 flex-1">{p.blurb}</p>
                <Button className="mt-4" onClick={() => startCheckout(p.id)} disabled={busy === p.id}>
                  {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Choose ${p.name}`}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-6">{error}</p>}
        {authLoading && <p className="text-sm text-muted-foreground mt-6">Loading…</p>}
      </div>
    </div>
  );
};

export default PortalBilling;
