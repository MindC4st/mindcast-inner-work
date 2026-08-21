import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { describeFunctionError } from "@/lib/functionError";
import { Loader2, Plus, X } from "lucide-react";
import { MinorDraft, ageGroupForDob, maskEmail } from "@/lib/familyTrial";

// /try — the one way into a members-only room without a membership.
//
// The free trial is ADULT-LED. An adult registers and may bring their own
// children/teens to the SAME session. Under-18s never register or attend
// independently. There is no Sunday to pick: the pass is emailed, and the
// session is recorded when the pass is used at check-in.

type State = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  minors: MinorDraft[];
  guardian_consent: boolean;
};

const TryASession = () => {
  const [form, setForm] = useState<State>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    minors: [],
    guardian_consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; minors: number } | null>(null);

  const set = (k: keyof State, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const setMinor = (i: number, patch: Partial<MinorDraft>) =>
    setForm((f) => ({
      ...f,
      minors: f.minors.map((m, j) => (j === i ? { ...m, ...patch } : m)),
    }));
  const addMinor = () =>
    setForm((f) => ({
      ...f,
      minors: [...f.minors, { first_name: "", last_name: "", dob: "", email: "" }],
    }));
  const removeMinor = (i: number) =>
    setForm((f) => ({ ...f, minors: f.minors.filter((_, j) => j !== i) }));

  const hasMinors = form.minors.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const minors = form.minors
        .filter((m) => m.first_name.trim() && m.dob)
        .map((m) => ({
          first_name: m.first_name.trim(),
          last_name: m.last_name.trim(),
          dob: m.dob,
          email: ageGroupForDob(m.dob) === "teen" ? m.email.trim() : null,
        }));

      const { data, error: fnErr } = await supabase.functions.invoke("issue-trial-ticket", {
        body: {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          minors,
          guardian_consent: form.guardian_consent,
        },
      });
      if (fnErr) throw fnErr;
      const r = data as { ok?: boolean; reason?: string; message?: string };
      if (!r?.ok) {
        setError(r?.message ?? "Could not create your ticket.");
        return;
      }
      setDone({ email: form.email, minors: minors.length });
    } catch (e) {
      const f = await describeFunctionError(e, {
        409: "This booking has already used its free session. Join as a member to come back.",
      }, "Could not create your ticket. Please try again.");
      setError(f.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <p className="text-primary text-xs tracking-[0.5em] font-body uppercase mb-3">Mindcast</p>
          <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">CHECK YOUR EMAIL</h1>
          <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6 leading-relaxed">
            {done.minors > 0 ? "Your free Mindcast passes are on their way to" : "Your free Mindcast pass is on its way to"} <strong className="text-[hsl(var(--navy))]">{maskEmail(done.email)}</strong>. Bring the QR code with you when you come along.
          </p>
          {done.minors > 0 && (
            <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-6 leading-relaxed">
              Each teen with an email address will receive their own pass too. Children remain linked to your family booking.
            </p>
          )}
          <p className="text-xs font-body text-[hsl(var(--navy-mid))]/70 mb-8">
            Come along to a Mindcast Sunday that works for you. Children and teens must arrive and check in with their parent or guardian.
          </p>
          <Link to="/" className="inline-block text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] px-6 py-14">
      <div className="max-w-md mx-auto">
        <p className="text-primary text-xs tracking-[0.5em] font-body uppercase mb-3">Mindcast</p>
        <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">TRY A SESSION</h1>
        <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-8 leading-relaxed">
          Sunday sessions are for members. Come to one as our guest first — no payment,
          no account, and nothing to cancel. One session, then decide.
        </p>

        <form onSubmit={submit} className="space-y-6">
          {/* Your details */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-3">Your details</p>
            <div className="space-y-4">
              {[
                { k: "first_name" as const, label: "First name", type: "text", required: true },
                { k: "last_name" as const, label: "Last name", type: "text", required: true },
                { k: "email" as const, label: "Email", type: "email", required: true },
                { k: "phone" as const, label: "Phone (optional)", type: "tel", required: false },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="block text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">{f.label}</span>
                  <input
                    type={f.type} required={f.required}
                    value={form[f.k] as string}
                    onChange={(e) => set(f.k, e.target.value)}
                    className="w-full bg-white border border-[hsl(var(--warm-border))] rounded-sm px-4 py-3 font-body text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Minors */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-1">Bringing a child or teen?</p>
            <p className="text-xs font-body text-[hsl(var(--navy-mid))]/70 mb-3">
              Children and teens can attend their first Mindcast session free when they attend with their parent or guardian.
            </p>

            {form.minors.map((m, i) => {
              const group = ageGroupForDob(m.dob);
              const needsEmail = group === "teen";
              return (
                <div key={i} className="border border-[hsl(var(--warm-border))] bg-white rounded-sm p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))]">
                      {group === "teen" ? "Teen" : group === "child" ? "Child" : "Child or teen"}
                    </span>
                    <button type="button" onClick={() => removeMinor(i)} className="px-2 text-[hsl(var(--navy-mid))]" aria-label="Remove">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      value={m.first_name}
                      onChange={(e) => setMinor(i, { first_name: e.target.value })}
                      placeholder="First name"
                      className="bg-[hsl(var(--ivory))] border border-[hsl(var(--warm-border))] rounded-sm px-3 py-2.5 font-body text-sm text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]"
                    />
                    <input
                      value={m.last_name}
                      onChange={(e) => setMinor(i, { last_name: e.target.value })}
                      placeholder="Last name"
                      className="bg-[hsl(var(--ivory))] border border-[hsl(var(--warm-border))] rounded-sm px-3 py-2.5 font-body text-sm text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]"
                    />
                  </div>
                  <input
                    type="date"
                    value={m.dob}
                    onChange={(e) => setMinor(i, { dob: e.target.value })}
                    className="w-full bg-[hsl(var(--ivory))] border border-[hsl(var(--warm-border))] rounded-sm px-3 py-2.5 font-body text-sm text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))] mb-2"
                  />
                  {needsEmail && (
                    <>
                      <input
                        type="email"
                        required
                        value={m.email}
                        onChange={(e) => setMinor(i, { email: e.target.value })}
                        placeholder="Teen's email address"
                        className="w-full bg-[hsl(var(--ivory))] border border-[hsl(var(--warm-border))] rounded-sm px-3 py-2.5 font-body text-sm text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]"
                      />
                      <p className="text-[11px] font-body text-[hsl(var(--navy-mid))]/70 mt-1.5">
                        Teens need their own email address so their Mindcast trial pass and attendance can be recorded separately.
                      </p>
                    </>
                  )}
                </div>
              );
            })}

            {form.minors.length < 6 && (
              <button type="button" onClick={addMinor}
                className="inline-flex items-center gap-1.5 text-primary text-xs font-body tracking-widest uppercase">
                <Plus size={14} /> Add a child or teen
              </button>
            )}
          </div>

          {/* Consent */}
          {hasMinors && (
            <div className="border border-[hsl(var(--warm-border))] bg-white rounded-sm p-4">
              <p className="text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">
                Parent / guardian consent
              </p>
              <p className="text-xs font-body text-[hsl(var(--navy-mid))] mb-3 leading-relaxed">
                Children and teens must attend Mindcast with their parent or guardian. Their check-in will only work when the accompanying adult is also checked into the same session.
              </p>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.guardian_consent}
                  onChange={(e) => set("guardian_consent", e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="font-body text-xs text-[hsl(var(--navy-mid))] leading-relaxed">
                  I am the parent or legal guardian of the children or teens listed above. I consent to them attending Mindcast with me and understand that they cannot check in or attend without me.
                </span>
              </label>
            </div>
          )}

          {error && <p className="text-sm font-body text-destructive">{error}</p>}

          <button type="submit" disabled={busy}
            className="w-full bg-[hsl(var(--blue))] text-white py-4 rounded-sm text-xs font-body font-semibold tracking-widest uppercase min-h-[56px] disabled:opacity-50 flex items-center justify-center gap-2">
            {busy ? <><Loader2 size={15} className="animate-spin" /> Sending your pass…</> : hasMinors ? "Get our free passes" : "Get my free pass"}
          </button>

          <p className="text-[11px] font-body text-[hsl(var(--navy-mid))]/70 leading-relaxed">
            We'll hold your details to manage your visit and to contact you about it.
            See our <Link to="/privacy" className="underline">privacy policy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default TryASession;
