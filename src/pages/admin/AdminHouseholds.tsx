import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Create households and link guardians + children. Guardian read-access to a
// child's journal (Phase 0/1) is driven entirely by the household_members
// rows created here.

type Profile = { id: string; display_name: string | null; name: string | null; email: string | null };
type Household = { id: string; name: string };
type Member = { id: string; household_id: string; profile_id: string; role_in_household: string };

const ROLES = ["guardian", "adult", "teen", "child"] as const;

const AdminHouseholds = () => {
  const { toast } = useToast();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newName, setNewName] = useState("");
  const [add, setAdd] = useState<{ household: string; profile: string; role: string }>({ household: "", profile: "", role: "guardian" });

  const load = async () => {
    const [h, m, p] = await Promise.all([
      (supabase as any).from("households").select("id, name").order("name"),
      (supabase as any).from("household_members").select("id, household_id, profile_id, role_in_household"),
      (supabase as any).from("profiles").select("id, display_name, name, email").order("display_name"),
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
    const { error } = await (supabase as any).from("households").insert({ name: newName.trim() });
    if (error) { toast({ title: "Could not create", description: error.message, variant: "destructive" }); return; }
    setNewName("");
    load();
  };

  const addMember = async () => {
    if (!add.household || !add.profile) { toast({ title: "Pick a household and a person" }); return; }
    const { error } = await (supabase as any).from("household_members").upsert(
      { household_id: add.household, profile_id: add.profile, role_in_household: add.role },
      { onConflict: "household_id,profile_id" },
    );
    if (error) { toast({ title: "Could not link", description: error.message, variant: "destructive" }); return; }
    setAdd({ ...add, profile: "" });
    load();
  };

  const removeMember = async (id: string) => {
    await (supabase as any).from("household_members").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/admin" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="text-sm text-foreground/50 hover:text-foreground">← Admin</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <h1 className="font-display text-2xl font-bold mb-6">Households</h1>

        <div className="flex gap-2 mb-8">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New household name (e.g. The Smiths)"
            className="flex-1 border rounded px-3 py-2 bg-background text-sm" />
          <button onClick={createHousehold} className="bg-primary text-primary-foreground rounded px-4 text-sm">Create</button>
        </div>

        <div className="border rounded p-4 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          <label className="text-xs">Household
            <select value={add.household} onChange={(e) => setAdd({ ...add, household: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background">
              <option value="">Select…</option>
              {households.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </label>
          <label className="text-xs">Person
            <select value={add.profile} onChange={(e) => setAdd({ ...add, profile: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background">
              <option value="">Select…</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name || p.name || p.email}</option>)}
            </select>
          </label>
          <label className="text-xs">Role
            <select value={add.role} onChange={(e) => setAdd({ ...add, role: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <button onClick={addMember} className="bg-primary text-primary-foreground rounded py-2 text-sm">Link</button>
        </div>

        {households.map((h) => (
          <div key={h.id} className="mb-6">
            <h2 className="font-semibold text-sm mb-2">{h.name}</h2>
            <ul className="text-sm">
              {members.filter((m) => m.household_id === h.id).map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b border-foreground/[0.06] py-1.5">
                  <span>{nameFor(m.profile_id)} <span className="text-foreground/40">· {m.role_in_household}</span></span>
                  <button onClick={() => removeMember(m.id)} className="text-xs text-red-500">Remove</button>
                </li>
              ))}
              {members.filter((m) => m.household_id === h.id).length === 0 &&
                <li className="text-foreground/40 py-1.5">No members linked.</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHouseholds;
