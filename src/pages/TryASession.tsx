import { useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { describeFunctionError } from "@/lib/functionError";
import { Loader2, Plus, X } from "lucide-react";

// /try — the one way into a members-only room without a membership.
//
// Register once, get a ticket for ONE session. There is no standing free tier,
// so this is deliberately a ticket and not an account: single use, enforced in
// the database, and it expires. Bring children and they're listed on the same
// ticket so the door knows how many seats and which rooms.

type Guest = { name: string; track: string };

const TryASession = () => {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", track: "Adult", intended_date: "" });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<{ token: string; png: string } | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("issue-trial-ticket", {
        body: { ...form, guests, guardian_name: guardianName, guardian_consent: guardianConsent },
      });
      if (fnErr) throw fnErr;
      const r = data as { ok?: boolean; token?: string; message?: string };
      if (!r?.ok || !r.token) { setError(r?.message ?? "Could not create your ticket."); return; }
      const png = await QRCode.toDataURL(`${window.location.origin}/b/${r.token}`, {
        width: 640, margin: 1, color: { dark: "#102438", light: "#FFFAF5" },
      });
      setTicket({ token: r.token, png });
    } catch (e) {
      const f = await describeFunctionError(e, {
        409: "You've already used your free session. Join as a member to come back.",
      }, "Could not create your ticket. Please try again.");
      setError(f.message);
    } finally {
      setBusy(false);
    }
  };

  if (ticket) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full text-center">
          <p className="text-primary text-xs tracking-[0.5em] font-body uppercase mb-3">Mindcast</p>
          <h1 className="font-display text-4xl tracking-wider text-[hsl(var(--navy))] mb-3">YOU'RE ON THE LIST</h1>
          <p className="font-body text-sm text-[hsl(var(--navy-mid))] mb-8">
            Show this at the door. It's good for one session.
          </p>
          <div className="bg-white border border-[hsl(var(--warm-border))] rounded-sm p-6">
            <img src={ticket.png} alt="Your free session ticket QR code" className="w-56 h-56 mx-auto" />
            <p className="font-mono text-xs tracking-[0.2em] text-[hsl(var(--navy))]/50 mt-4">{ticket.token}</p>
          </div>
          <p className="mt-6 text-xs font-body text-[hsl(var(--navy-mid))]/70">
            Screenshot it, or find this email again nearer the day.
          </p>
          <Link to="/" className="mt-8 inline-block text-primary text-xs tracking-widest uppercase font-body border-b border-primary/40">
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

        <form onSubmit={submit} className="space-y-5">
          {[
            { k: "full_name", label: "Your name", type: "text", required: true },
            { k: "email", label: "Email", type: "email", required: true },
            { k: "phone", label: "Phone (optional)", type: "tel", required: false },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="block text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">{f.label}</span>
              <input
                type={f.type} required={f.required}
                value={form[f.k as keyof typeof form]}
                onChange={(e) => set(f.k, e.target.value)}
                className="w-full bg-white border border-[hsl(var(--warm-border))] rounded-sm px-4 py-3 font-body text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]"
              />
            </label>
          ))}

          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">Which room are you joining?</span>
            <select value={form.track} onChange={(e) => set("track", e.target.value)}
              className="w-full bg-white border border-[hsl(var(--warm-border))] rounded-sm px-4 py-3 font-body text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]">
              <option value="Adult">Adults</option>
              <option value="Teen">Teens</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">Which Sunday? (optional)</span>
            <input type="date" value={form.intended_date} onChange={(e) => set("intended_date", e.target.value)}
              className="w-full bg-white border border-[hsl(var(--warm-border))] rounded-sm px-4 py-3 font-body text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]" />
          </label>

          {/* Children come in on the same ticket — the door needs seat counts
              and which room, not accounts for people who may never return. */}
          <div>
            <span className="block text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">Bringing children or teens?</span>
            {guests.map((g, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={g.name} placeholder="Their first name"
                  onChange={(e) => setGuests((gs) => gs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  className="flex-1 bg-white border border-[hsl(var(--warm-border))] rounded-sm px-3 py-2.5 font-body text-sm text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))]" />
                <select value={g.track}
                  onChange={(e) => setGuests((gs) => gs.map((x, j) => j === i ? { ...x, track: e.target.value } : x))}
                  className="bg-white border border-[hsl(var(--warm-border))] rounded-sm px-2 py-2.5 font-body text-sm text-[hsl(var(--navy))]">
                  <option value="Child">Child</option>
                  <option value="Teen">Teen</option>
                </select>
                <button type="button" onClick={() => setGuests((gs) => gs.filter((_, j) => j !== i))}
                  className="px-3 text-[hsl(var(--navy-mid))]" aria-label="Remove">
                  <X size={16} />
                </button>
              </div>
            ))}
            {guests.length < 6 && (
              <button type="button" onClick={() => setGuests((gs) => [...gs, { name: "", track: "Child" }])}
                className="inline-flex items-center gap-1.5 text-primary text-xs font-body tracking-widest uppercase">
                <Plus size={14} /> Add a child
              </button>
            )}
          </div>

          {/* Under-18 attendance needs recorded guardian consent — the same
              safeguarding gate members pass through. */}
          {(form.track !== "Adult" || guests.length > 0) && (
            <div className="border border-[hsl(var(--warm-border))] bg-white rounded-sm p-4">
              <span className="block text-[10px] tracking-[0.2em] uppercase font-body text-[hsl(var(--navy-mid))] mb-2">
                Parent / guardian consent (needed for under-18s)
              </span>
              <input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent or guardian's full name"
                className="w-full bg-white border border-[hsl(var(--warm-border))] rounded-sm px-3 py-2.5 font-body text-sm text-[hsl(var(--navy))] outline-none focus:border-[hsl(var(--blue))] mb-3"
              />
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardianConsent}
                  onChange={(e) => setGuardianConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="font-body text-xs text-[hsl(var(--navy-mid))] leading-relaxed">
                  I am the parent or guardian and I consent to the under-18s named here attending
                  this session.
                </span>
              </label>
            </div>
          )}

          {error && <p className="text-sm font-body text-destructive">{error}</p>}

          <button type="submit" disabled={busy}
            className="w-full bg-[hsl(var(--blue))] text-white py-4 rounded-sm text-xs font-body font-semibold tracking-widest uppercase min-h-[56px] disabled:opacity-50 flex items-center justify-center gap-2">
            {busy ? <><Loader2 size={15} className="animate-spin" /> Creating your ticket…</> : "Get my ticket"}
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
