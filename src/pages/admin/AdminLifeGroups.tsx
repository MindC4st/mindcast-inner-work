import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { db } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Trash2, Shuffle, Users, MapPin, Clock,
  UserPlus, UserMinus, Save, Loader2, RefreshCw, ChevronDown, ChevronRight,
} from "lucide-react";

type Profile = {
  id: string;
  name: string;
  display_name: string;
  email: string | null;
  age_group: string | null;
  gender: string | null;
  date_of_birth: string | null;
  membership_status: string;
  household_id: string | null;
};

type LifeGroup = {
  id: string;
  name: string;
  meeting_space: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  capacity: number;
  age_min: number | null;
  age_max: number | null;
  target_male_count: number | null;
  target_female_count: number | null;
  is_active: boolean;
  member_count?: number;
  members?: Profile[];
};

type GroupMember = {
  id: string;
  life_group_id: string;
  profile_id: string;
  joined_at: string;
};

// Shape of the profiles select below: the household join comes back as an
// array aliased onto household_id (the FK isn't in the generated types, so
// the result is cast structurally in fetchData).
type JoinedProfileRow = Omit<Profile, "household_id"> & {
  household_id: { household_id: string }[] | null;
};

type AssignedGroup = {
  name: string;
  track: "adult" | "teen";
  members: (Profile & { _age: number })[];
  ageMin: number;
  ageMax: number;
  males: number;
  females: number;
};

const ADULT_ROOMS = [
  "The Greenhouse", "The Study", "The Loft", "The Den", "The Workshop",
  "The Parlour", "The Library", "The Cabin", "The Studio", "The Terrace",
  "The Nook", "The Lighthouse", "The Hearth", "The Oak Room", "The Sunroom",
];

const TEEN_ROOMS = [
  "The Garage", "The Basement", "The Deck", "The Attic", "The Warehouse",
  "The Hangar", "The Backyard", "The Shed", "The Court", "The Void",
];

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function interleaveGenders(
  people: (Profile & { _age: number })[],
  used: Set<string>,
  getHousehold: (pid: string) => string | null,
  groupHouseholds: Set<string>,
  groupSize: number,
  group: (Profile & { _age: number })[],
): void {
  const males = people.filter(p => p.gender === "male" && !used.has(p.id));
  const females = people.filter(p => p.gender === "female" && !used.has(p.id));
  const others = people.filter(p => (!p.gender || p.gender === "other") && !used.has(p.id));

  const interleaved: (Profile & { _age: number })[] = [];
  const maxLen = Math.max(males.length, females.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < males.length) interleaved.push(males[i]);
    if (i < females.length) interleaved.push(females[i]);
  }
  interleaved.push(...others);

  for (const p of interleaved) {
    if (used.has(p.id)) continue;
    if (group.length >= groupSize) break;
    const hh = getHousehold(p.id);
    if (hh && groupHouseholds.has(hh)) continue;
    group.push(p);
    used.add(p.id);
    if (hh) groupHouseholds.add(hh);
  }
}

function assignTeens(
  teens: (Profile & { _age: number })[],
  groupSize: number,
  getHousehold: (pid: string) => string | null,
): AssignedGroup[] {
  const used = new Set<string>();
  const groups: AssignedGroup[] = [];
  const sorted = [...teens].sort((a, b) => a._age - b._age);

  const namesByAge = new Map<number, number>();

  while (used.size < sorted.length) {
    const remaining = sorted.filter(p => !used.has(p.id));
    if (remaining.length === 0) break;

    const startAge = remaining[0]._age;
    let candidates = remaining.filter(p => p._age === startAge);

    if (candidates.length < 5) {
      const minAge = Math.max(10, startAge - 1);
      const maxAge = Math.min(18, startAge + 1);
      candidates = remaining.filter(p => p._age >= minAge && p._age <= maxAge);
    }

    if (candidates.length === 0) {
      used.add(remaining[0].id);
      continue;
    }

    const group: (Profile & { _age: number })[] = [];
    const groupHouseholds = new Set<string>();

    interleaveGenders(candidates, used, getHousehold, groupHouseholds, groupSize, group);

    if (group.length > 0) {
      const ages = group.map(p => p._age);
      const count = namesByAge.get(startAge) || 0;
      const letter = String.fromCharCode(65 + count);
      namesByAge.set(startAge, count + 1);

      groups.push({
        name: `Teen ${startAge}${letter}`,
        track: "teen",
        members: group,
        ageMin: Math.min(...ages),
        ageMax: Math.max(...ages),
        males: group.filter(p => p.gender === "male").length,
        females: group.filter(p => p.gender === "female").length,
      });
    }
  }

  return groups;
}

function assignAdults(
  adults: (Profile & { _age: number })[],
  groupSize: number,
  getHousehold: (pid: string) => string | null,
): AssignedGroup[] {
  const used = new Set<string>();
  const groups: AssignedGroup[] = [];
  const sorted = [...adults].sort((a, b) => a._age - b._age);

  while (used.size < sorted.length) {
    const remaining = sorted.filter(p => !used.has(p.id));
    if (remaining.length === 0) break;

    const startAge = remaining[0]._age;
    let maxAge = startAge + 4;
    let candidates = remaining.filter(p => p._age <= maxAge);

    if (candidates.length < Math.ceil(groupSize * 0.6)) {
      maxAge = startAge + 9;
      candidates = remaining.filter(p => p._age <= maxAge);
    }

    const group: (Profile & { _age: number })[] = [];
    const groupHouseholds = new Set<string>();

    interleaveGenders(candidates, used, getHousehold, groupHouseholds, groupSize, group);

    if (group.length > 0) {
      const ages = group.map(p => p._age);
      groups.push({
        name: "",
        track: "adult",
        members: group,
        ageMin: Math.min(...ages),
        ageMax: Math.max(...ages),
        males: group.filter(p => p.gender === "male").length,
        females: group.filter(p => p.gender === "female").length,
      });
    }
  }

  return groups.map((g, i) => ({
    ...g,
    name: ADULT_ROOMS[i % ADULT_ROOMS.length],
  }));
}

function assignLifeGroups(
  profiles: Profile[],
  groupSize: number,
): { groups: AssignedGroup[]; unassigned: Profile[]; skipped: Profile[] } {
  const eligible = profiles.filter(p => {
    const status = p.membership_status;
    return status === "active" || status === "trialing";
  });

  if (eligible.length === 0) return { groups: [], unassigned: [], skipped: profiles };

  const withAge = eligible
    .map(p => ({ ...p, _age: calculateAge(p.date_of_birth) }))
    .filter(p => p._age !== null) as (Profile & { _age: number })[];

  const noAge = eligible.filter(p => calculateAge(p.date_of_birth) === null);

  const teens = withAge.filter(p => p._age >= 10 && p._age <= 18);
  const adults = withAge.filter(p => p._age >= 19);
  const youngKids = withAge.filter(p => p._age < 10);

  const households = new Map<string, Set<string>>();
  [...adults, ...teens].forEach(p => {
    if (p.household_id) {
      if (!households.has(p.household_id)) households.set(p.household_id, new Set());
      households.get(p.household_id)!.add(p.id);
    }
  });

  const getHousehold = (pid: string): string | null => {
    for (const [hid, members] of households) {
      if (members.has(pid)) return hid;
    }
    return null;
  };

  const teenGroups = assignTeens(teens, groupSize, getHousehold);
  const adultGroups = assignAdults(adults, groupSize, getHousehold);

  const unassigned = [...youngKids, ...noAge].map(p => p as unknown as Profile);
  const skipped: Profile[] = profiles.filter(p => {
    const status = p.membership_status;
    if (status === "active" || status === "trialing") return false;
    const age = calculateAge(p.date_of_birth);
    if (age !== null && age >= 10) return false;
    return true;
  });

  return { groups: [...teenGroups, ...adultGroups], unassigned, skipped };
}

const AdminLifeGroups = ({ embedded = false }: { embedded?: boolean }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<LifeGroup[]>([]);
  const [allMemberships, setAllMemberships] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adultGroupSize, setAdultGroupSize] = useState(15);
  const [teenGroupSize, setTeenGroupSize] = useState(15);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [assignTrack, setAssignTrack] = useState<"all" | "adult" | "teen">("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
  }, [user, authLoading]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, groupsRes, membersRes] = await Promise.all([
      db.from("profiles").select(
        "id, name, display_name, email, age_group, gender, date_of_birth, membership_status, household_id:household_members(household_id)"
      ).order("created_at", { ascending: false }).limit(2000),
      db.from("life_groups").select("*").order("name"),
      db.from("life_group_members").select("id, life_group_id, profile_id, joined_at"),
    ]);

    const rawProfiles = ((profilesRes.data || []) as unknown as JoinedProfileRow[]).map((p) => ({
      ...p,
      household_id: p.household_id?.[0]?.household_id || null,
    }));

    const memberships: GroupMember[] = membersRes.data || [];

    const groupsWithCounts = (groupsRes.data || []).map((g: LifeGroup) => {
      const groupMembers = memberships.filter((gm: GroupMember) => gm.life_group_id === g.id);
      return {
        ...g,
        member_count: groupMembers.length,
        members: groupMembers
          .map((gm: GroupMember) => rawProfiles.find((p: Profile) => p.id === gm.profile_id))
          .filter(Boolean) as Profile[],
      };
    });

    setProfiles(rawProfiles);
    setGroups(groupsWithCounts);
    setAllMemberships(memberships);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const preview = useMemo(() => {
    if (!showPreview) return null;
    let subset = profiles;
    if (assignTrack === "adult") {
      subset = profiles.map(p => ({ ...p, _pfAge: calculateAge(p.date_of_birth) })).filter((p) => p._pfAge !== null && p._pfAge >= 19) as Profile[];
    } else if (assignTrack === "teen") {
      subset = profiles.map(p => ({ ...p, _pfAge: calculateAge(p.date_of_birth) })).filter((p) => p._pfAge !== null && p._pfAge >= 10 && p._pfAge <= 18) as Profile[];
    }
    return assignLifeGroups(subset, adultGroupSize);
  }, [profiles, adultGroupSize, showPreview, assignTrack]);

  const clearAllGroups = async () => {
    if (!confirm("Remove all members from all life groups? This cannot be undone.")) return;
    setSaving(true);
    await db.from("life_group_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setSaving(false);
    await fetchData();
    toast({ title: "All group assignments cleared" });
  };

  const applyPreview = async () => {
    if (!preview) return;
    setSaving(true);

    if (assignTrack === "all") {
      await db.from("life_group_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      const trackLetter = assignTrack === "adult" ? "adult" : "teen";
      const existingGroupNames = preview.groups.map(g => g.name);
      if (existingGroupNames.length > 0) {
        const { data: existingGroups } = await db.from("life_groups")
          .select("id").in("name", existingGroupNames);
        if (existingGroups?.length) {
          await db.from("life_group_members")
            .delete()
            .in("life_group_id", existingGroups.map((g) => g.id));
        }
      }
    }

    for (const group of preview.groups) {
      const spaceName = group.name;
      const { data: existing } = await db.from("life_groups")
        .select("id").eq("name", spaceName).maybeSingle();
      let groupId: string;
      if (existing) {
        groupId = existing.id;
        await db.from("life_groups").update({
          age_min: group.ageMin,
          age_max: group.ageMax,
          target_male_count: group.males,
          target_female_count: group.females,
          capacity: group.track === "teen" ? teenGroupSize : adultGroupSize,
          meeting_space: group.track === "teen" ? group.name : spaceName,
          is_active: true,
          updated_at: new Date().toISOString(),
        }).eq("id", groupId);
      } else {
        const { data: created } = await db.from("life_groups").insert({
          name: spaceName,
          meeting_space: group.track === "teen" ? group.name : spaceName,
          capacity: group.track === "teen" ? teenGroupSize : adultGroupSize,
          age_min: group.ageMin,
          age_max: group.ageMax,
          target_male_count: group.males,
          target_female_count: group.females,
          is_active: true,
        }).select("id").single();
        groupId = created.id;
      }
      const memberRows = group.members.map((m: Profile) => ({
        life_group_id: groupId,
        profile_id: m.id,
      }));
      if (memberRows.length > 0) {
        await db.from("life_group_members").insert(memberRows);
      }
    }
    setSaving(false);
    setShowPreview(false);
    await fetchData();
    toast({ title: `${preview.groups.length} life groups assigned`, description: `${preview.unassigned.length} unassigned (no age data or under 10).` });
  };

  const removeMember = async (lifeGroupId: string, profileId: string) => {
    await db.from("life_group_members")
      .delete()
      .eq("life_group_id", lifeGroupId)
      .eq("profile_id", profileId);
    await fetchData();
    toast({ title: "Member removed from group" });
  };

  const toggleGroup = (id: string) => setExpandedGroup(prev => prev === id ? null : id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-muted-foreground text-xs tracking-widest animate-pulse">LOADING...</span>
      </div>
    );
  }

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      {!embedded && (
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin/dashboard" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body text-foreground/40 hover:text-foreground/70">
          <ArrowLeft size={12} /> DASHBOARD
        </Link>
      </nav>
      )}

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-2">LIFE GROUPS</h1>
        <p className="text-foreground/50 text-sm font-body mb-1">
          Tuesday evenings 5:30â€“7:30pm. Adults ~{adultGroupSize}/group, Teens ~{teenGroupSize}/group.
        </p>
        <p className="text-foreground/40 text-xs font-body mb-10">
          Adults: â‰¤5yr spread, even gender, households split. Teens: same age together, even boys/girls, labelled by age (12A, 12Bâ€¦).
        </p>

        {/* Assignment controls */}
        <div className="border border-foreground/[0.08] p-6 mb-8">
          <h2 className="font-display text-lg tracking-wider mb-4">ASSIGN GROUPS</h2>

          {/* Track selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-body uppercase tracking-[0.12em] text-foreground/50 mr-2">Track</span>
            {(["all", "adult", "teen"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setAssignTrack(t); setShowPreview(false); }}
                className={`text-[10px] font-body tracking-[0.12em] uppercase px-4 py-2 rounded-sm border transition-colors ${
                  assignTrack === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/10 text-foreground/50 hover:text-foreground/80 hover:border-foreground/25"
                }`}
              >
                {t === "all" ? "All" : t === "adult" ? "Adults (19+)" : "Teens (10â€“18)"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-body uppercase tracking-[0.12em] text-foreground/50">Adults/group</label>
              <input
                type="number"
                value={adultGroupSize}
                onChange={e => { setAdultGroupSize(Math.max(5, Math.min(25, parseInt(e.target.value) || 15))); setShowPreview(false); }}
                className="w-20 bg-foreground/5 border border-foreground/10 rounded px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-foreground/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-body uppercase tracking-[0.12em] text-foreground/50">Teens/group</label>
              <input
                type="number"
                value={teenGroupSize}
                onChange={e => { setTeenGroupSize(Math.max(5, Math.min(25, parseInt(e.target.value) || 15))); setShowPreview(false); }}
                className="w-20 bg-foreground/5 border border-foreground/10 rounded px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:border-foreground/20"
              />
            </div>
            <button
              onClick={() => { setShowPreview(true); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors"
            >
              <Shuffle size={13} /> PREVIEW ASSIGNMENT
            </button>
            <button
              onClick={clearAllGroups}
              disabled={saving || groups.length === 0}
              className="flex items-center gap-2 border border-destructive/30 text-destructive px-4 py-2.5 text-[11px] tracking-[0.2em] font-body hover:bg-destructive/5 transition-colors disabled:opacity-30"
            >
              <Trash2 size={13} /> CLEAR ALL
            </button>
          </div>

          {showPreview && preview && (
            <div className="mt-4 border border-primary/20 bg-primary/[0.03] rounded-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-sm tracking-wider text-primary">
                    PREVIEW: {preview.groups.length} GROUPS, {preview.unassigned.length} UNASSIGNED
                  </h3>
                  {preview.skipped?.length > 0 && (
                    <p className="text-[10px] text-foreground/40 font-body mt-0.5">
                      {preview.skipped.length} members skipped (inactive/lapsed).
                    </p>
                  )}
                </div>
                <button
                  onClick={applyPreview}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {saving ? <><Loader2 size={13} className="animate-spin" /> SAVINGâ€¦</> : <><Save size={13} /> APPLY TO DATABASE</>}
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {preview.groups.map((g, i) => (
                  <div key={i} className="border border-foreground/10 rounded-sm p-4 bg-foreground/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-display text-sm tracking-wider text-primary">
                        {g.name}
                        {g.track === "teen" && (
                          <span className="ml-2 text-[9px] font-body tracking-[0.12em] uppercase text-orange-400/70 bg-orange-400/10 px-1.5 py-0.5 rounded-sm">Teen</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] text-foreground/50 font-body">
                        <span>{g.ageMin}â€“{g.ageMax}y</span>
                        <span>{g.members.length}p</span>
                        <span>M:{g.males} F:{g.females}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {g.members.map(m => (
                        <span key={m.id} className="text-[10px] font-body text-foreground/60 bg-foreground/[0.04] px-2 py-0.5 rounded-full">
                          {m.display_name || m.name}
                          <span className="text-foreground/30"> {m._age}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {preview.unassigned.length > 0 && (
                <div className="mt-3 text-xs text-foreground/40 font-body">
                  Unassigned: {preview.unassigned.map(p => p.display_name || p.name).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Existing groups */}
        <h2 className="font-display text-lg tracking-wider mb-3 mt-10">CURRENT GROUPS</h2>
        {groups.length === 0 ? (
          <div className="border border-foreground/[0.08] p-12 text-center">
            <Users size={28} className="text-foreground/15 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-foreground/30 font-body">No life groups yet. Run the assignment above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.id} className="border border-foreground/[0.08] rounded-sm overflow-hidden">
                <button
                  onClick={() => toggleGroup(g.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-foreground/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <Users size={16} className="text-foreground/30" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-display text-sm tracking-wider text-primary">{g.name}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-foreground/40 font-body mt-0.5">
                        {g.meeting_space && (
                          <span className="flex items-center gap-1"><MapPin size={10} /> {g.meeting_space}</span>
                        )}
                        <span className="flex items-center gap-1"><Clock size={10} /> {g.day_of_week}s {g.start_time?.slice(0, 5)}â€“{g.end_time?.slice(0, 5)}</span>
                        {g.age_min !== null && <span>{g.age_min}â€“{g.age_max}y</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-display text-foreground/60">{g.member_count || 0}/{g.capacity}</span>
                    {expandedGroup === g.id ? <ChevronDown size={14} className="text-foreground/30" /> : <ChevronRight size={14} className="text-foreground/30" />}
                  </div>
                </button>

                {expandedGroup === g.id && g.members && (
                  <div className="border-t border-foreground/[0.06] bg-foreground/[0.01] px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-body tracking-[0.12em] uppercase text-foreground/50">
                        Members ({g.members.length})
                      </span>
                      {g.target_male_count !== null && (
                        <span className="text-[10px] text-foreground/40 font-body">
                          Target M:{g.target_male_count} F:{g.target_female_count}
                        </span>
                      )}
                    </div>
                    {g.members.length === 0 ? (
                      <p className="text-xs text-foreground/30 font-body italic">No members assigned.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {g.members.map((m: Profile) => (
                          <div key={m.id} className="flex items-center justify-between px-3 py-2 border border-foreground/[0.06] rounded-sm hover:bg-foreground/[0.03]">
                            <div>
                              <span className="text-xs font-body text-foreground">{m.display_name || m.name}</span>
                              <span className="text-[10px] text-foreground/30 font-body ml-2">{m.gender || "â€”"}</span>
                            </div>
                            <button
                              onClick={() => removeMember(g.id, m.id)}
                              className="text-foreground/20 hover:text-destructive transition-colors"
                              title="Remove"
                            >
                              <UserMinus size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLifeGroups;