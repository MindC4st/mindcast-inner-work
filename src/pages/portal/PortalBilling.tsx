import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "@/components/portal/PortalLayout";
import { Loader2, Check } from "lucide-react";
import { track } from "@/lib/observability";
import { FOUNDING_CAP, isValidEmail, normalizeEmail } from "@/lib/foundingBracelets";
import {
  blankChild, blankMember, buildCheckoutMembers, buildNamedMembers, braceletEligiblePeople,
  expectedExtraAdults, resizeRows, updateRow, validateHousehold,
  type ChildDraft, type FieldErrors, type MemberDraft,
} from "@/lib/householdCheckout";

// Authenticated membership management. Logged-in members build a household
// bundle (adults / teens / children), name every additional person, pick a
// billing cadence, and are sent to Stripe Checkout (mode: subscription);
// existing members manage/cancel via the Stripe billing portal.
//
// Contract with create-subscription-checkout:
//   body = { plan, adults, teens, children,
//            members: [{ tier: "adult"|"teen", first_name, email },
//                      { tier: "child", first_name }],
//            bracelets: [email, ...],          // free founding selections
//            paid_bracelets: [email, ...] }    // $15 one-time add-ons
// FAMILY15 discount is applied server-side when 2+ adults and ≥1 teen/child.
//
// Household rules:
//   * the payer occupies one adult seat (unless the payer is a teen)
//   * every additional adult and teen needs a first name + their own valid
//     email — they get their own login after checkout
//   * children need a first name only (no email, no login) — the name becomes
//     their household profile for check-in, room roll and the Welcome Wall
//
// Bracelets (Founding 100): the first 100 unique adult/teen member emails get
// one free NFC bracelet each. Children never count. Display eligibility comes
// from founding-bracelet-status; the authoritative reservation happens
// server-side at checkout start. Anyone past the cap can add a bracelet for
// $15 — a one-time charge on the same checkout, never recurring.

type Plan = "monthly" | "annual";

const PLANS: { id: Plan; name: string; blurb: string; note: string }[] = [
  { id: "monthly", name: "MONTHLY", blurb: "Rolling monthly membership.", note: "Cancel anytime." },
  { id: "annual", name: "ANNUAL", blurb: "Pay for the year — best value for regular attendance.", note: "Renews yearly." },
];

const ACTIVE = new Set(["active", "trialing"]);
const BRACELET_PRICE_LABEL = "$15";

type EligibilityState = "free" | "reserved" | "allocated" | "claimed" | "exhausted" | "unknown";

/** Extract a useful message from an edge-function failure without leaking internals. */
const describeCheckoutError = async (e: unknown): Promise<string> => {
  try {
    const ctx = (e as { context?: { body?: unknown } })?.context;
    if (ctx?.body) {
      const text = typeof ctx.body === "string" ? ctx.body : await new Response(ctx.body as ReadableStream).text();
      const parsed = JSON.parse(text) as { error?: string; message?: string };
      if (parsed?.error) return parsed.error;
      if (parsed?.message) return parsed.message;
    }
  } catch { /* fall through */ }
  const msg = (e as { message?: string })?.message ?? "";
  if (msg && !/edge function|failed to send|fetch/i.test(msg)) return msg;
  return "We couldn't start checkout. Please try again.";
};

const PortalBilling = () => {
  const { user, profile, membershipStatus, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isMember = ACTIVE.has(membershipStatus);
  const isTeen = (profile?.age_group || "").toLowerCase() === "teen";

  // Household bundle. Default to one membership matching the signed-in member.
  const [adults, setAdults] = useState(isTeen ? 0 : 1);
  const [teens, setTeens] = useState(isTeen ? 1 : 0);
  const [children, setChildren] = useState(0);

  const totalSeats = adults + teens + children;
  const familyDiscount = adults >= 2 && (teens >= 1 || children >= 1);

  // Named members beyond the payer. Every row keeps its tier-specific source
  // index — updates go through sourceIndex, never the combined render index.
  const extraAdultCount = expectedExtraAdults({ adults, teens, children }, isTeen);
  const [extraAdults, setExtraAdults] = useState<MemberDraft[]>([]);
  const [teenDetails, setTeenDetails] = useState<MemberDraft[]>([]);
  const [childDetails, setChildDetails] = useState<ChildDraft[]>([]);
  useEffect(() => { setExtraAdults((rows) => resizeRows(rows, extraAdultCount, blankMember)); }, [extraAdultCount]);
  useEffect(() => { setTeenDetails((rows) => resizeRows(rows, teens, blankMember)); }, [teens]);
  useEffect(() => { setChildDetails((rows) => resizeRows(rows, children, blankChild)); }, [children]);

  const namedMembers = useMemo(
    () => buildNamedMembers(extraAdults, teenDetails),
    [extraAdults, teenDetails],
  );

  // Founding-100 eligibility per email (display only — the server re-checks).
  const payerEmail = normalizeEmail(profile?.email || user?.email || "");
  const [eligibility, setEligibility] = useState<Record<string, { state: EligibilityState; seat_number: number | null }>>({});
  const [remainingSeats, setRemainingSeats] = useState<number | null>(null);
  const [selectedFree, setSelectedFree] = useState<Set<string>>(new Set());
  const [selectedPaid, setSelectedPaid] = useState<Set<string>>(new Set());
  const offerTracked = useRef(false);

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
        if (typeof data?.remaining === "number") setRemainingSeats(data.remaining);
        setEligibility((prev) => {
          const next = { ...prev };
          for (const r of results) next[r.email] = { state: r.state, seat_number: r.seat_number };
          return next;
        });
      } catch {
        /* eligibility display is best-effort; the server re-validates at checkout */
      }
    }, 500);
    return () => clearTimeout(t);
  }, [checkEmails, isMember]);

  useEffect(() => {
    if (!isMember && !authLoading && !offerTracked.current) {
      offerTracked.current = true;
      track("nfc_bracelet_offer_viewed", { surface: "membership_checkout" });
    }
  }, [isMember, authLoading]);

  const peopleForBracelets = useMemo(
    () => braceletEligiblePeople(
      payerEmail ? { name: profile?.first_name || profile?.name || "You", email: payerEmail } : null,
      namedMembers,
    ),
    [payerEmail, namedMembers, profile],
  );

  const stateFor = (email: string): EligibilityState => eligibility[email]?.state ?? "unknown";
  const isFreeState = (s: EligibilityState) => s === "free" || s === "allocated" || s === "reserved" || (s === "unknown" && (remainingSeats === null || remainingSeats > 0));

  const toggleFree = (email: string) => {
    setSelectedFree((prev) => {
      const next = new Set(prev);
      if (next.has(email)) { next.delete(email); track("nfc_bracelet_removed", { surface: "membership_checkout", price: "free" }); }
      else { next.add(email); setSelectedPaid((p) => { const q = new Set(p); q.delete(email); return q; }); track("nfc_bracelet_selected", { surface: "membership_checkout", price: "free" }); }
      return next;
    });
  };

  const togglePaid = (email: string) => {
    setSelectedPaid((prev) => {
      const next = new Set(prev);
      if (next.has(email)) { next.delete(email); track("nfc_bracelet_removed", { surface: "membership_checkout", price: "paid" }); }
      else { next.add(email); setSelectedFree((p) => { const q = new Set(p); q.delete(email); return q; }); track("nfc_bracelet_selected", { surface: "membership_checkout", price: "paid" }); }
      return next;
    });
  };

  const focusField = (key: string) => {
    const el = document.getElementById(`field-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      (el as HTMLInputElement).focus({ preventScroll: true });
    }
  };

  const startCheckout = async (plan: Plan) => {
    if (!user) { navigate("/portal/login"); return; }
    if (busy) return; // one checkout at a time — double-tap guard
    if (totalSeats < 1) { setCheckoutError("Select at least one membership."); return; }

    // Field-level validation keeps all entered data intact and points at the
    // exact field instead of failing with one generic line at the bottom.
    const validation = validateHousehold({
      counts: { adults, teens, children },
      payerIsTeen: isTeen,
      payerEmail,
      extraAdults, teenDetails, childDetails,
    });
    if (!validation.ok) {
      setFieldErrors(validation.errors);
      setCheckoutError(null);
      if (validation.firstErrorKey) focusField(validation.firstErrorKey);
      return;
    }
    setFieldErrors({});
    setBusy(plan);
    setCheckoutError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: {
          plan, adults, teens, children,
          members: buildCheckoutMembers(extraAdults, teenDetails, childDetails),
          bracelets: [...selectedFree],
          paid_bracelets: [...selectedPaid],
        },
      });
      if (error) throw error;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not start checkout");
    } catch (e) {
      console.error("create-subscription-checkout failed:", e);
      setCheckoutError(await describeCheckoutError(e));
      setBusy(null);
    }
  };

  const manageBilling = async () => {
    setBusy("portal"); setCheckoutError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-billing-portal", { body: {} });
      if (error) throw error;
      if (data?.url) { window.location.href = data.url; return; }
      throw new Error(data?.error || "Could not open billing portal");
    } catch (e) {
      setCheckoutError(await describeCheckoutError(e));
      setBusy(null);
    }
  };

  const fieldError = (key: string) => fieldErrors[key] ? (
    <p className="text-[11px] text-destructive font-body mt-1">{fieldErrors[key]}</p>
  ) : null;

  const inputClass = (key: string) =>
    `border rounded-sm px-3 py-2 text-sm font-body bg-background focus:outline-none focus:border-primary/60 ${fieldErrors[key] ? "border-destructive/60" : "border-foreground/15"}`;

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

            {(namedMembers.length > 0 || children > 0) && (
              <div className="mt-5 border-t border-foreground/10 pt-4">
                <p className="text-[10px] font-body font-semibold tracking-widest text-foreground/60 mb-1">WHO'S JOINING YOU?</p>
                <p className="text-xs text-foreground/50 font-body mb-3">
                  Each additional adult and teen gets their own login, so they need their own email.
                  Children don't need a login, but we need their name for your household and session check-in.
                </p>
                <div className="grid gap-4">
                  {namedMembers.map((m) => (
                    <div key={m.key}>
                      <p className="text-[10px] font-body font-semibold tracking-widest text-foreground/40 mb-1.5">
                        {m.tier === "teen" ? "TEEN" : "ADDITIONAL ADULT"}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr]">
                        <div>
                          <input
                            id={`field-${m.key}-name`}
                            type="text"
                            value={m.first_name}
                            placeholder="First name"
                            autoComplete="off"
                            onChange={(e) => {
                              const v = e.target.value;
                              if (m.tier === "teen") setTeenDetails((rows) => updateRow(rows, m.sourceIndex, { first_name: v }));
                              else setExtraAdults((rows) => updateRow(rows, m.sourceIndex, { first_name: v }));
                            }}
                            className={`w-full ${inputClass(`${m.key}-name`)}`}
                          />
                          {fieldError(`${m.key}-name`)}
                        </div>
                        <div>
                          <input
                            id={`field-${m.key}-email`}
                            type="email"
                            value={m.email}
                            placeholder="their@email.com"
                            autoComplete="off"
                            onChange={(e) => {
                              const v = e.target.value;
                              if (m.tier === "teen") setTeenDetails((rows) => updateRow(rows, m.sourceIndex, { email: v }));
                              else setExtraAdults((rows) => updateRow(rows, m.sourceIndex, { email: v }));
                            }}
                            className={`w-full ${inputClass(`${m.key}-email`)}`}
                          />
                          {fieldError(`${m.key}-email`)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {childDetails.map((c, i) => (
                    <div key={`child-${i}`}>
                      <p className="text-[10px] font-body font-semibold tracking-widest text-foreground/40 mb-1.5">
                        CHILD {i + 1} <span className="normal-case tracking-normal font-normal">— no login needed</span>
                      </p>
                      <div className="sm:w-[42%]">
                        <input
                          id={`field-child-${i}-name`}
                          type="text"
                          value={c.first_name}
                          placeholder="Child's first name"
                          autoComplete="off"
                          onChange={(e) => {
                            const v = e.target.value;
                            setChildDetails((rows) => updateRow(rows, i, { first_name: v }));
                          }}
                          className={`w-full ${inputClass(`child-${i}-name`)}`}
                        />
                        {fieldError(`child-${i}-name`)}
                      </div>
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
            <p className="text-xs text-foreground/50 font-body mb-1">
              Add an NFC bracelet for quick Mindcast check-in. Bracelets belong to individual adult and teen members.
            </p>
            <p className="text-xs text-foreground/50 font-body mb-4">
              Bracelets are for adults and teens with their own member login.
            </p>
            <div className="grid gap-2">
              {peopleForBracelets.map((p) => {
                const state = stateFor(p.email);
                const free = isFreeState(state);
                const claimed = state === "claimed";
                const freeSelected = selectedFree.has(p.email);
                const paidSelected = selectedPaid.has(p.email);
                return (
                  <div
                    key={p.key}
                    className={`border rounded-sm px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${
                      freeSelected || paidSelected
                        ? "border-primary/60 bg-primary/5"
                        : "border-foreground/10"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-body text-foreground truncate">{p.name}</span>
                      {claimed ? (
                        <span className="block text-[10px] font-body font-semibold tracking-widest uppercase text-foreground/40 mt-0.5">Bracelet arranged</span>
                      ) : free ? (
                        <span className="block text-[10px] font-body font-semibold tracking-widest uppercase text-primary mt-0.5">
                          Free — first {FOUNDING_CAP} members
                        </span>
                      ) : (
                        <span className="block text-[10px] font-body font-semibold tracking-widest uppercase text-foreground/50 mt-0.5">
                          MINDCAST NFC Bracelet — {BRACELET_PRICE_LABEL}
                        </span>
                      )}
                    </span>
                    {claimed ? (
                      <Check className="h-4 w-4 text-foreground/40 shrink-0" strokeWidth={1.5} />
                    ) : free ? (
                      <button
                        type="button"
                        onClick={() => toggleFree(p.email)}
                        aria-pressed={freeSelected}
                        className="shrink-0 flex items-center gap-2 text-[10px] font-body font-semibold tracking-widest uppercase border border-foreground/20 hover:border-primary/60 hover:text-primary rounded-sm px-3 py-2"
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${freeSelected ? "bg-primary border-primary" : "border-foreground/25"}`}>
                          {freeSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                        </span>
                        {freeSelected ? "Added — free" : "Add — free"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => togglePaid(p.email)}
                        aria-pressed={paidSelected}
                        className="shrink-0 flex items-center gap-2 text-[10px] font-body font-semibold tracking-widest uppercase border border-foreground/20 hover:border-primary/60 hover:text-primary rounded-sm px-3 py-2"
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${paidSelected ? "bg-primary border-primary" : "border-foreground/25"}`}>
                          {paidSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                        </span>
                        {paidSelected ? `Added — ${BRACELET_PRICE_LABEL}` : `Add bracelet — ${BRACELET_PRICE_LABEL}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {peopleForBracelets.some((p) => isFreeState(stateFor(p.email))) && (
              <p className="text-[11px] font-body text-primary mt-3">
                You're among our first {FOUNDING_CAP} members — your bracelet is included.
              </p>
            )}
            {(selectedPaid.size > 0) && (
              <p className="text-[11px] font-body text-foreground/50 mt-3">
                {selectedPaid.size} bracelet{selectedPaid.size > 1 ? "s" : ""} ({BRACELET_PRICE_LABEL} each) are added to this checkout as a one-time charge — they never recur.
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
                  disabled={busy !== null || totalSeats < 1}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-body font-semibold tracking-widest uppercase py-3 rounded-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy === p.id
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout…</>
                    : `Choose ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {!isMember && checkoutError && (
          <div role="alert" className="border border-destructive/40 bg-destructive/5 rounded-sm p-4 mt-4">
            <p className="text-sm text-destructive font-body">{checkoutError}</p>
            <p className="text-[11px] text-foreground/50 font-body mt-1">
              Nothing was charged. If this keeps happening, contact hello@mindcast.co.nz.
            </p>
          </div>
        )}

        {!isMember && (
          <p className="text-[11px] text-foreground/40 font-body mt-4">
            You'll see the exact price for your household before confirming at checkout. Cancel anytime.
          </p>
        )}

        {authLoading && <p className="text-xs font-body uppercase tracking-widest text-foreground/40 mt-6">Loading…</p>}
      </div>
    </PortalLayout>
  );
};

export default PortalBilling;
