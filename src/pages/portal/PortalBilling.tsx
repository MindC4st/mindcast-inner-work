import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Loader2, Check } from "lucide-react";
import { track } from "@/lib/observability";
import { normalizeEmail, isValidEmail, FOUNDING_CAP } from "@/lib/foundingBracelets";

// Authenticated membership management. Logged-in members build a household
// bundle (adults / teens / children), name the additional adults and teens in
// their household, pick a billing cadence, and are sent to Stripe Checkout
// (mode: subscription); existing members manage/cancel via the Stripe billing
// portal. Status mirrors profile.membership_status, which the stripe-webhook
// keeps in sync.
//
// Contract with create-subscription-checkout (Jul 2026 family-bundle model):
//   body = { plan, adults, teens, children,
//            members: [{ tier: "adult"|"teen", first_name, email }],
//            bracelets: [email, ...] }
// FAMILY15 discount is applied server-side when 2+ adults and ≥1 teen/child.
//
// NFC bracelet add-on (Founding 100): each NAMED individual (payer + extra
// adults + teens with logins) is eligible for one free bracelet while the
// first-100 cap holds. Children don't have logins and never count. Display
// eligibility comes from founding-bracelet-status; the authoritative
// reservation happens server-side at checkout start.

type Plan = "monthly" | "annual";

const PLANS: { id: Plan; name: string; blurb: string; note: string }[] = [
  { id: "monthly", name: "MONTHLY", blurb: "Rolling monthly membership.", note: "Cancel anytime." },
  { id: "annual", name: "ANNUAL", blurb: "Pay for the year — best value for regular attendance.", note: "Renews yearly." },
];

const ACTIVE = new Set(["active", "trialing"]);

type MemberDraft = { first_name: string; email: string };
type EligibilityState = "free" | "reserved" | "allocated" | "claimed" | "exhausted" | "invalid" | "unknown";

const resize = (rows: MemberDraft[], n: number): MemberDraft[] =>
  n <= rows.length
    ? rows.slice(0, n)
    : [...rows, ...Array.from({ length: n - rows.length }, () => ({ first_name: "", email: "" }))];

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

  // Named members beyond the payer. The payer occupies one adult seat (unless
  // the payer is a teen). Children are never named — no login, no email.
  const extraAdultCount = Math.max(0, adults - (isTeen ? 0 : 1));
  const [extraAdults, setExtraAdults] = useState<MemberDraft[]>([]);
  const [teenDetails, setTeenDetails] = useState<MemberDraft[]>([]);
  useEffect(() => { setExtraAdults((rows) => resize(rows, extraAdultCount)); }, [extraAdultCount]);
  useEffect(() => { setTeenDetails((rows) => resize(rows, teens)); }, [teens]);

  // Founding-100 eligibility per email (display only — the server re-checks).
  const payerEmail = normalizeEmail(profile?.email || user?.email || "");
  const [eligibility, setEligibility] = useState<Record<string, { state: EligibilityState; seat_number: number | null }>>({});
  const [selectedBracelets, setSelectedBracelets] = useState<Set<string>>(new Set());
  const offerTracked = useRef(false);

  const namedMembers = useMemo(() => [
    ...extraAdults.map((m, i) => ({ key: `adult-${i}`, tier: "adult" as const, ...m })),
    ...teenDetails.map((m, i) => ({ key: `teen-${i}`, tier: "teen" as const, ...m })),
  ], [extraAdults, teenDetails]);

  const checkEmails = useMemo(() => {
    const valid = namedMembers
      .map((m) => normalizeEmail(m.email))
      .filter((e) => isValidEmail(e));
    return [...new Set(payerEmail && isValidEmail(payerEmail) ? [payerEmail, ...valid] : valid)];
  }, [namedMembers, payerEmail]);

  useEffect(() => {
    if (isMember || checkEmails.length === 0) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke("founding-bracelet-status", {
          body: { emails: checkEmails },
        });
        const results = (data?.results ?? []) as { email: string; state: EligibilityState; seat_number: number | null }[];
        setEligibility((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.email] = { state: r.state, seat_number: r.seat_number };
          return next;
        });
      } catch {
        /* eligibility display is best-effort; server re-validates at checkout */
      }
    }, 500);
    return () => clearTimeout(t);
    // checkEmails is memoised on the member drafts + payer email, so this
    // effect re-runs only when the actual email list changes (debounced above).
  }, [checkEmails, isMember]);

  useEffect(() => {
    if (!isMember && !authLoading && !offerTracked.current) {
      offerTracked.current = true;
      track("nfc_bracelet_offer_viewed", { surface: "membership_checkout" });
    }
  }, [isMember, authLoading]);

  const peopleForBracelets = useMemo(() => [
    ...(payerEmail ? [{ key: "payer", name: profile?.first_name || profile?.name || "You", email: payerEmail, isPayer: true }] : []),
    ...namedMembers.map((m) => ({ key: m.key, name: m.first_name || (m.tier === "teen" ? "Teen" : "Adult"), email: normalizeEmail(m.email), isPayer: false })),
  ], [payerEmail, namedMembers, profile]);

  const stateFor = (email: string): EligibilityState =>
    eligibility[email]?.state ?? "unknown";

  const isFreeState = (s: EligibilityState) => s === "free" || s === "allocated" || s === "reserved";

  const toggleBracelet = (email: string) => {
    setSelectedBracelets((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
        track("nfc_bracelet_removed", { surface: "membership_checkout" });
      } else {
        next.add(email);
        track("nfc_bracelet_selected", { surface: "membership_checkout" });
      }
      return next;
    });
  };

  const startCheckout = async (plan: Plan) => {
    if (!user) { navigate("/portal/login"); return; }
    if (totalSeats < 1) { setError("Select at least one membership."); return; }
    // Named members need valid emails — they are each person's founding identity.
    for (const m of namedMembers) {
      if (!isValidEmail(m.email)) {
        setError("Every additional adult and teen needs their own valid email.");
        return;
      }
    }
    setBusy(plan); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {
          plan, adults, teens, children,
          members: namedMembers.map((m) => ({ tier: m.tier, first_name: m.first_name, email: normalizeEmail(m.email) })),
          bracelets: [...selectedBracelets],
        },
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

            {namedMembers.length > 0 && (
              <div className="mt-5 border-t border-foreground/10 pt-4">
                <p className="text-[10px] font-body font-semibold tracking-widest text-foreground/60 mb-1">WHO'S JOINING YOU?</p>
                <p className="text-xs text-foreground/50 font-body mb-3">
                  Each additional adult and teen gets their own login — add their name and email so we can set them up after checkout.
                </p>
                <div className="grid gap-3">
                  {namedMembers.map((m, i) => (
                    <div key={m.key} className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
                      <input
                        type="text"
                        value={m.first_name}
                        placeholder={m.tier === "teen" ? `Teen ${i + 1} — first name` : `Adult ${i + 1} — first name`}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (m.tier === "teen") {
                            setTeenDetails((rows) => rows.map((r, ri) => ri === i ? { ...r, first_name: v } : r));
                          } else {
                            setExtraAdults((rows) => rows.map((r, ri) => ri === i ? { ...r, first_name: v } : r));
                          }
                        }}
                        className="border border-foreground/15 rounded-sm px-3 py-2 text-sm font-body bg-background focus:outline-none focus:border-primary/60"
                      />
                      <input
                        type="email"
                        value={m.email}
                        placeholder="their@email.com"
                        onChange={(e) => {
                          const v = e.target.value;
                          if (m.tier === "teen") {
                            setTeenDetails((rows) => rows.map((r, ri) => ri === i ? { ...r, email: v } : r));
                          } else {
                            setExtraAdults((rows) => rows.map((r, ri) => ri === i ? { ...r, email: v } : r));
                          }
                        }}
                        className="border border-foreground/15 rounded-sm px-3 py-2 text-sm font-body bg-background focus:outline-none focus:border-primary/60"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isMember && peopleForBracelets.length > 0 && (
          <div className="border border-foreground/10 rounded-sm p-5 mb-6 bg-foreground/[0.02]">
            <p className="font-display text-base tracking-wider text-foreground mb-1">TAKE MINDCAST WITH YOU</p>
            <p className="text-xs text-foreground/50 font-body mb-4">
              Add an NFC bracelet for quick access to your MINDCAST experience. Bracelets belong to individual members — choose who gets one.
            </p>
            <div className="grid gap-2">
              {peopleForBracelets.map((p) => {
                const email = normalizeEmail(p.email);
                if (!isValidEmail(email)) {
                  return (
                    <div key={p.key} className="border border-foreground/10 rounded-sm px-4 py-3 flex items-center justify-between gap-3 opacity-60">
                      <span className="text-sm font-body text-foreground/70 truncate">{p.name}</span>
                      <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-foreground/40">Not required</span>
                    </div>
                  );
                }
                const state = stateFor(email);
                const free = isFreeState(state);
                const claimed = state === "claimed";
                const selected = selectedBracelets.has(email);
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={!free}
                    onClick={() => toggleBracelet(email)}
                    className={`border rounded-sm px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${
                      selected
                        ? "border-primary/60 bg-primary/5"
                        : free
                          ? "border-foreground/10 hover:border-primary/40"
                          : "border-foreground/10 opacity-80"
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${selected ? "bg-primary border-primary" : "border-foreground/25"}`}>
                        {selected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />}
                      </span>
                      <span className="text-sm font-body text-foreground truncate">{p.name}</span>
                    </span>
                    {free ? (
                      <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-primary shrink-0">
                        {selected ? "Free — added" : `Free — first ${FOUNDING_CAP} members`}
                      </span>
                    ) : claimed ? (
                      <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-foreground/40 shrink-0">Bracelet arranged</span>
                    ) : (
                      <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-foreground/50 shrink-0">
                        $5.00 — add after activation
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {peopleForBracelets.some((p) => isFreeState(stateFor(normalizeEmail(p.email)))) && (
              <p className="text-[11px] font-body text-primary mt-3">
                You're among our first {FOUNDING_CAP} members — your bracelet is on us.
              </p>
            )}
            <p className="text-[11px] text-foreground/40 font-body mt-3">
              Free founding bracelets are confirmed when your membership payment completes. Children without logins don't need one.
            </p>
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
