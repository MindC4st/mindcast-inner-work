import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CameraOff, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { currentProgrammeYear, isYouthConsentCurrent } from "@/lib/youthConsent";
import { useToast } from "@/hooks/use-toast";

// Create households, link guardians + young people, and operate the annual
// participation / no-promotional-photo register.

type Profile = { id: string; display_name: string | null; name: string | null; email: string | null };
type Household = { id: string; name: string };
type Member = { id: string; household_id: string; profile_id: string; role_in_household: string };
type Consent = Database["public"]["Tables"]["youth_participation_consents"]["Row"];

const ROLES = ["guardian", "adult", "teen", "child"] as const;

const AdminHouseholds = ({ embedded = false }: { embedded?: boolean }) => {
  const { toast } = useToast();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [referenceUrls, setReferenceUrls] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState("");
  const [add, setAdd] = useState<{ household: string; profile: string; role: string }>({ household: "", profile: "", role: "guardian" });

  const load = async () => {
    const [h, m, p, c] = await Promise.all([
      db.from("households").select("id, name").order("name"),
      db.from("household_members").select("id, household_id, profile_id, role_in_household"),
      db.from("profiles").select("id, display_name, name, email").order("display_name"),
      db.from("youth_participation_consents").select("*").eq("programme_year", currentProgrammeYear()),
    ]);
    setHouseholds(h.data || []);
    setMembers(m.data || []);
    setProfiles(p.data || []);
    const consentRows = c.data || [];
    setConsents(consentRows);
    const noPhotoRows = consentRows.filter((row) => !row.promotional_photo_consent && row.photo_reference_path);
    const signed = await Promise.all(noPhotoRows.map(async (row) => {
      const { data } = await supabase.storage.from("youth-photo-references").createSignedUrl(row.photo_reference_path!, 300);
      return [row.subject_profile_id, data?.signedUrl || ""] as const;
    }));
    setReferenceUrls(Object.fromEntries(signed.filter(([, url]) => Boolean(url))));
  };
  useEffect(() => { load(); }, []);

  const nameFor = (pid: string) => {
    const p = profiles.find((x) => x.id === pid);
    return p?.display_name || p?.name || p?.email || pid.slice(0, 8);
  };

  const createHousehold = async () => {
    if (!newName.trim()) return;
    const { error } = await db.from("households").insert({ name: newName.trim() });
    if (error) { toast({ title: "Could not create", description: error.message, variant: "destructive" }); return; }
    setNewName("");
    load();
  };

  const addMember = async () => {
    if (!add.household || !add.profile) { toast({ title: "Pick a household and a person" }); return; }
    const { error } = await db.from("household_members").upsert(
      { household_id: add.household, profile_id: add.profile, role_in_household: add.role },
      { onConflict: "household_id,profile_id" },
    );
    if (error) { toast({ title: "Could not link", description: error.message, variant: "destructive" }); return; }
    setAdd({ ...add, profile: "" });
    load();
  };

  const removeMember = async (id: string) => {
    await db.from("household_members").delete().eq("id", id);
    load();
  };

  const inputCls = "w-full bg-background border border-foreground/10 rounded-sm px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-primary/60";
  const youthRows = members.filter((member) => ["teen", "child"].includes(member.role_in_household));

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

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-2">HOUSEHOLDS</h1>
        <p className="text-foreground/50 text-sm font-body mb-10">
          Link guardians and young people, then monitor annual participation consent and the restricted no-promotional-photo register.
        </p>

        <section className="mb-8 rounded-sm border border-foreground/10 bg-foreground/[0.02] p-5">
          <div className="mb-4 flex items-start gap-3">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60">Youth consent register · {currentProgrammeYear()}</p>
              <p className="mt-1 font-body text-xs leading-5 text-foreground/50">Reference images are private safeguarding aids, not promotional assets. Signed links expire after five minutes.</p>
            </div>
          </div>
          {youthRows.length === 0 ? (
            <p className="font-body text-sm text-foreground/40">No linked children or teens.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {youthRows.map((member) => {
                const consent = consents.find((row) => row.subject_profile_id === member.profile_id) ?? null;
                const current = isYouthConsentCurrent(consent);
                const noPhoto = current && consent?.promotional_photo_consent === false;
                return (
                  <article key={member.id} className={`rounded-sm border p-4 ${current ? "border-border bg-background" : "border-destructive/30 bg-destructive/[0.03]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">{nameFor(member.profile_id)}</p>
                        <p className="mt-0.5 font-body text-[10px] uppercase tracking-widest text-foreground/45">{member.role_in_household}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 font-body text-[9px] font-semibold uppercase tracking-widest ${current ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {current ? "Current" : "Missing / expired"}
                      </span>
                    </div>
                    {current && consent && (
                      <div className="mt-3 space-y-1.5 border-t border-border pt-3 font-body text-xs text-foreground/60">
                        <p>Emergency: <strong className="text-foreground/80">{consent.emergency_contact_name} · {consent.emergency_contact_phone}</strong></p>
                        <p>NFC bracelet: <strong className="text-foreground/80">{consent.nfc_bracelet_consent ? "consented" : "not consented"}</strong></p>
                        {consent.safe_participation_notes && <p>Safety note: <strong className="text-foreground/80">{consent.safe_participation_notes}</strong></p>}
                      </div>
                    )}
                    {noPhoto && (
                      <div className="mt-3 rounded-sm border border-destructive/20 bg-destructive/[0.04] p-3">
                        <p className="flex items-center gap-1.5 font-body text-[10px] font-semibold uppercase tracking-widest text-destructive"><CameraOff size={13} /> No promotional photos or video</p>
                        {referenceUrls[member.profile_id] ? (
                          <img src={referenceUrls[member.profile_id]} alt={`Private staff reference for ${nameFor(member.profile_id)}`} className="mt-2 h-28 w-28 rounded-sm object-cover" />
                        ) : (
                          <p className="mt-2 font-body text-xs text-destructive">Reference image unavailable. Ask the guardian to update the form.</p>
                        )}
                        <p className="mt-2 font-body text-[10px] leading-4 text-foreground/50">Avoid capture. If incidental, exclude, crop, blur or cover before promotional use.</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="border border-foreground/10 rounded-sm p-5 mb-8 bg-foreground/[0.02]">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-foreground/40 mb-3">Create household</p>
          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. The Smiths" className={inputCls} />
            <button onClick={createHousehold} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-body font-semibold tracking-widest uppercase px-5 rounded-sm shrink-0">
              <Plus size={14} strokeWidth={1.5} /> Create
            </button>
          </div>
        </div>

        <div className="border border-foreground/10 rounded-sm p-5 mb-10 bg-foreground/[0.02]">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-foreground/40 mb-3">Link person to household</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select value={add.household} onChange={(e) => setAdd({ ...add, household: e.target.value })} className={inputCls}>
              <option value="">Household…</option>
              {households.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            <select value={add.profile} onChange={(e) => setAdd({ ...add, profile: e.target.value })} className={inputCls}>
              <option value="">Person…</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name || p.name || p.email}</option>)}
            </select>
            <select value={add.role} onChange={(e) => setAdd({ ...add, role: e.target.value })} className={inputCls}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <button onClick={addMember} className="bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-body font-semibold tracking-widest uppercase py-2 rounded-sm">
              Link
            </button>
          </div>
        </div>

        {households.length === 0 ? (
          <p className="text-foreground/40 text-sm font-body text-center py-12">No households yet. Create one above.</p>
        ) : households.map((h) => {
          const rows = members.filter((m) => m.household_id === h.id);
          return (
            <div key={h.id} className="mb-6 border border-foreground/[0.06] rounded-sm">
              <div className="px-4 py-3 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                <h2 className="font-display text-base tracking-wider">{h.name.toUpperCase()}</h2>
              </div>
              <ul>
                {rows.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/[0.04] last:border-0 text-sm font-body">
                    <span className="text-foreground">
                      {nameFor(m.profile_id)}
                      <span className="text-foreground/40 ml-2 text-xs">· {m.role_in_household}</span>
                    </span>
                    <button onClick={() => removeMember(m.id)} className="text-foreground/30 hover:text-destructive transition-colors">
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
                {rows.length === 0 && <li className="text-foreground/40 text-sm font-body px-4 py-3">No members linked.</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHouseholds;
