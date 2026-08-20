import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus, X, Monitor, DoorOpen, GraduationCap } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// /portal/family — the guardian's control room for everything safeguarding:
//   - authorised collectors per child (the ONLY people a child can leave with)
//   - welcome-wall display consent per child/teen (revocable, honoured next scan)
//   - teen self-sign-out permission per teen
//   - your own wall opt-out
//
// All four are fail-closed in the database; this page is how a guardian opens
// them deliberately.

type Child = {
  profile_id: string;
  display_name: string;
  role_in_household: string;
};

type Collector = {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  revoked_at: string | null;
};

const PortalFamily = () => {
  const { user, profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [collectors, setCollectors] = useState<Record<string, Collector[]>>({});
  const [wallConsent, setWallConsent] = useState<Record<string, boolean>>({});
  const [selfSignout, setSelfSignout] = useState<Record<string, boolean>>({});
  const [ownWallOptOut, setOwnWallOptOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCollector, setNewCollector] = useState<Record<string, { name: string; phone: string }>>({});
  const [teenEmail, setTeenEmail] = useState("");
  const [teenName, setTeenName] = useState("");
  const [inviting, setInviting] = useState(false);

  const myProfileId = (profile?.id as string | undefined) ?? null;

  const load = useCallback(async () => {
    if (!myProfileId) return;

    // Children/teens in households where I am a guardian — names resolved
    // server-side (members can't read other profiles directly).
    const { data: kidsRows } = await supabase.rpc("household_children_for");
    const kids: Child[] = (kidsRows ?? []).map((m) => ({
      profile_id: m.profile_id,
      display_name: m.display_name,
      role_in_household: m.role_in_household,
    }));

    if (kids.length > 0) {
      const ids = kids.map((k) => k.profile_id);

      const [collRes, consentRes] = await Promise.all([
        supabase.from("authorised_collectors").select("id, child_profile_id, name, phone, created_at, revoked_at").in("child_profile_id", ids),
        supabase.from("guardian_consents").select("subject_profile_id, consent_type, revoked_at").in("subject_profile_id", ids).eq("consent_type", "wall_display"),
      ]);

      const byChild: Record<string, Collector[]> = {};
      (collRes.data ?? []).forEach((c) => {
        const row = { id: c.id, name: c.name, phone: c.phone, created_at: c.created_at, revoked_at: c.revoked_at } as Collector;
        (byChild[c.child_profile_id] ??= []).push(row);
      });
      setCollectors(byChild);

      const consent: Record<string, boolean> = {};
      (consentRes.data ?? []).forEach((c) => {
        if (c.revoked_at === null) consent[c.subject_profile_id] = true;
      });
      setWallConsent(consent);

      const sso: Record<string, boolean> = {};
      (kidsRows ?? []).forEach((m) => { sso[m.profile_id] = Boolean(m.teen_self_signout); });
      setSelfSignout(sso);
    } else {
      setCollectors({});
      setWallConsent({});
      setSelfSignout({});
    }

    // My own wall preference.
    const { data: me } = await supabase
      .from("profiles")
      .select("wall_opt_out")
      .eq("id", myProfileId)
      .maybeSingle();
    setOwnWallOptOut(Boolean(me?.wall_opt_out));

    setChildren(kids);
    setLoading(false);
  }, [myProfileId]);

  useEffect(() => { void load(); }, [load]);

  /* ── actions ── */

  const addCollector = async (child: Child) => {
    const draft = newCollector[child.profile_id];
    if (!draft?.name.trim() || !myProfileId) return;
    const { error } = await supabase.from("authorised_collectors").insert({
      child_profile_id: child.profile_id,
      name: draft.name.trim(),
      phone: draft.phone.trim() || null,
      added_by: myProfileId,
    });
    if (error) {
      toast({ title: "Couldn't add collector", description: error.message, variant: "destructive" });
      return;
    }
    setNewCollector((s) => ({ ...s, [child.profile_id]: { name: "", phone: "" } }));
    void load();
  };

  const revokeCollector = async (id: string) => {
    const { error } = await supabase
      .from("authorised_collectors")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) void load();
  };

  const updateWallConsent = async (child: Child, enabled: boolean) => {
    if (!user) return;
    if (enabled) {
      const { error } = await supabase.from("guardian_consents").insert({
        subject_profile_id: child.profile_id,
        consent_type: "wall_display",
        guardian_name: profile?.name || profile?.display_name || "Guardian",
        recorded_by: user.id,
      });
      if (error) {
        toast({ title: "Couldn't record consent", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      // Revoke every live consent for this child — honoured from the next scan.
      const { error } = await supabase
        .from("guardian_consents")
        .update({ revoked_at: new Date().toISOString() })
        .eq("subject_profile_id", child.profile_id)
        .eq("consent_type", "wall_display")
        .is("revoked_at", null);
      if (error) {
        toast({ title: "Couldn't revoke consent", description: error.message, variant: "destructive" });
        return;
      }
    }
    setWallConsent((s) => ({ ...s, [child.profile_id]: enabled }));
  };

  const updateSelfSignout = async (child: Child, enabled: boolean) => {
    const { error } = await supabase.rpc("set_teen_self_signout", {
      p_teen_profile: child.profile_id,
      p_enabled: enabled,
    });
    if (error) {
      toast({ title: "Couldn't update the setting", description: error.message, variant: "destructive" });
      return;
    }
    setSelfSignout((s) => ({ ...s, [child.profile_id]: enabled }));
  };

  const toggleOwnWall = async () => {
    if (!myProfileId) return;
    const next = !ownWallOptOut;
    const { error } = await supabase
      .from("profiles")
      .update({ wall_opt_out: next })
      .eq("id", myProfileId);
    if (!error) setOwnWallOptOut(next);
  };

  const inviteTeen = async () => {
    const email = teenEmail.trim();
    if (!email || inviting) return;
    setInviting(true);
    const { error } = await supabase.functions.invoke("invite-teen", {
      body: { email, first_name: teenName.trim() || null },
    });
    setInviting(false);
    if (error) {
      toast({ title: "Couldn't invite teen", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invite sent", description: `${email} will get a magic link to set up their account.` });
    setTeenEmail("");
    setTeenName("");
  };

  /* ── render ── */

  const Toggle = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-primary" : "bg-foreground/15"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );

  return (
    <PortalLayout>
      <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2 flex items-center gap-1.5">
        <ShieldCheck size={13} /> Family &amp; safety
      </p>
      <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground mb-2">YOUR FAMILY AT MINDCAST</h1>
      <p className="text-sm text-muted-foreground mb-8 font-body max-w-2xl leading-relaxed">
        Who your children can leave with, whether their names appear on the room's welcome wall,
        and whether a teen may sign themselves out. Everything here can be changed at any time —
        changes take effect from the next check-in.
      </p>

      {loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-foreground/40 animate-pulse">Loading…</p>
      ) : (
        <div className="space-y-6">
          {/* Your own wall preference */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="portal-card p-6 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Monitor size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-body font-semibold text-foreground">Your name on the welcome wall</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  When you check in, your display name appears in the adult room. Switch off to attend quietly.
                </p>
              </div>
            </div>
            <Toggle on={!ownWallOptOut} onChange={() => void toggleOwnWall()} label="Show my name on the welcome wall" />
          </motion.div>

          {/* Add a teen by email — sends them a magic link to set up their account */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="portal-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <GraduationCap size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-body font-semibold text-foreground">Add a teen (13–17)</p>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  Enter their email and we'll send a magic link so they can set up their own account —
                  a read-only dashboard with their weekly lessons.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={teenName}
                onChange={(e) => setTeenName(e.target.value)}
                placeholder="Their name"
                className="sm:w-44 bg-transparent border border-border rounded-sm px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              <input
                value={teenEmail}
                onChange={(e) => setTeenEmail(e.target.value)}
                type="email"
                placeholder="Their email address"
                className="flex-1 bg-transparent border border-border rounded-sm px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
              <button
                onClick={() => void inviteTeen()}
                disabled={!teenEmail.trim() || inviting}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 text-[11px] tracking-widest uppercase font-body disabled:opacity-40"
              >
                <UserPlus size={13} /> {inviting ? "Sending…" : "Invite teen"}
              </button>
            </div>
          </motion.div>

          {children.length === 0 && (
            <div className="portal-card p-8 text-center">
              <p className="text-sm text-muted-foreground font-body">
                No children or teens are linked to your household yet. The desk can link them, or
                add them under Households if you're an admin.
              </p>
            </div>
          )}

          {children.map((child, i) => {
            const active = (collectors[child.profile_id] ?? []).filter((c) => !c.revoked_at);
            const isTeen = child.role_in_household === "teen";
            return (
              <motion.div
                key={child.profile_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="portal-card p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <h2 className="font-display text-xl tracking-wider text-foreground">
                    {child.display_name.toUpperCase()}
                    <span className="ml-3 text-[10px] font-body tracking-[0.2em] uppercase text-primary/70 align-middle">
                      {isTeen ? "Teen" : "Child"}
                    </span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-body text-muted-foreground">Name on welcome wall</span>
                    <Toggle
                      on={Boolean(wallConsent[child.profile_id])}
                      onChange={(v) => void updateWallConsent(child, v)}
                      label={`Welcome wall consent for ${child.display_name}`}
                    />
                  </div>
                </div>

                {isTeen && (
                  <div className="flex items-center justify-between gap-4 border border-border rounded-sm px-4 py-3 mb-5">
                    <div className="flex items-start gap-3">
                      <DoorOpen size={16} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-body font-semibold text-foreground">May sign themselves out</p>
                        <p className="text-xs text-muted-foreground font-body mt-0.5">
                          Without this, {child.display_name} leaves only with you or an authorised collector.
                          You still get the notification either way.
                        </p>
                      </div>
                    </div>
                    <Toggle
                      on={Boolean(selfSignout[child.profile_id])}
                      onChange={(v) => void updateSelfSignout(child, v)}
                      label={`Self-sign-out for ${child.display_name}`}
                    />
                  </div>
                )}

                {/* Authorised collectors */}
                <p className="text-[10px] font-body tracking-[0.25em] uppercase text-foreground/50 mb-3">
                  Authorised collectors — the only people {child.display_name} can leave with
                </p>
                {active.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-body mb-3">
                    Nobody yet. Until you add someone, only you (the guardian who signed them in)
                    can collect them.
                  </p>
                ) : (
                  <ul className="space-y-2 mb-3">
                    {active.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3 border border-border rounded-sm px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-body text-foreground truncate">{c.name}</p>
                          {c.phone && <p className="text-xs text-muted-foreground font-body">{c.phone}</p>}
                        </div>
                        <button
                          onClick={() => void revokeCollector(c.id)}
                          className="flex items-center gap-1 text-[10px] font-body tracking-widest uppercase text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Remove ${c.name} as collector`}
                        >
                          <X size={13} /> Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={newCollector[child.profile_id]?.name ?? ""}
                    onChange={(e) => setNewCollector((s) => ({ ...s, [child.profile_id]: { name: e.target.value, phone: s[child.profile_id]?.phone ?? "" } }))}
                    placeholder="Their full name"
                    className="flex-1 bg-transparent border border-border rounded-sm px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                  <input
                    value={newCollector[child.profile_id]?.phone ?? ""}
                    onChange={(e) => setNewCollector((s) => ({ ...s, [child.profile_id]: { name: s[child.profile_id]?.name ?? "", phone: e.target.value } }))}
                    placeholder="Phone (optional)"
                    className="sm:w-44 bg-transparent border border-border rounded-sm px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={() => void addCollector(child)}
                    disabled={!newCollector[child.profile_id]?.name.trim()}
                    className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 text-[11px] tracking-widest uppercase font-body disabled:opacity-40"
                  >
                    <UserPlus size={13} /> Add
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
};

export default PortalFamily;
