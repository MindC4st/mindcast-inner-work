import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

// Create households and link guardians + children. Guardian read-access to a
// child's journal is driven entirely by the household_members rows created here.

type Profile = { id: string; display_name: string | null; name: string | null; email: string | null };
type Household = { id: string; name: string };
type Member = { id: string; household_id: string; profile_id: string; role_in_household: string };

const ROLES = ["guardian", "adult", "teen", "child"] as const;

const AdminHouseholds = ({ embedded = false }: { embedded?: boolean }) => {
  const { toast } = useToast();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newName, setNewName] = useState("");
  const [add, setAdd] = useState<{ household: string; profile: string; role: string }>({ household: "", profile: "", role: "guardian" });

  const load = async () => {
    const [h, m, p] = await Promise.all([
      db.from("households").select("id, name").order("name"),
      db.from("household_members").select("id, household_id, profile_id, role_in_household"),
      db.from("profiles").select("id, display_name, name, email").order("display_name"),
    ]);
    setHouseholds(h.data || []);
    setMembers(m.data || []);
    setProfiles(p.data || []);
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
          Link guardians and children so parents can view their child's journal.
        </p>

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
