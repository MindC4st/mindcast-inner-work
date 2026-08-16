// assign-life-groups — admin-triggered algorithm to slot active members into
// Tuesday 5:30-7:30pm life groups. Dual-track: adults (19+, ≤5yr age spread,
// even gender, split households) and teens (10–18, same-age groups, even
// boys/girls, labelled e.g. "Teen 12A", "Teen 12B").
//
// POST body:  { adult_group_size?: number, teen_group_size?: number, track?: "all"|"adult"|"teen" }
// Response:   { ok: true, adult_groups: number, teen_groups: number, assigned_count: number }
//
// Only staff (facilitator/admin) may call this.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const ADULT_ROOMS = [
  "The Greenhouse", "The Study", "The Loft", "The Den", "The Workshop",
  "The Parlour", "The Library", "The Cabin", "The Studio", "The Terrace",
  "The Nook", "The Lighthouse", "The Hearth", "The Oak Room", "The Sunroom",
];

interface Profile {
  id: string;
  name: string;
  display_name: string;
  email: string | null;
  age_group: string | null;
  gender: string | null;
  date_of_birth: string | null;
  membership_status: string;
  household_id: string | null;
  _age: number;
}

interface AssignedGroup {
  name: string;
  meeting_space: string;
  ageMin: number;
  ageMax: number;
  males: number;
  females: number;
  memberIds: string[];
  track: "adult" | "teen";
}

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
  people: Profile[],
  used: Set<string>,
  getHousehold: (pid: string) => string | null,
  groupHouseholds: Set<string>,
  groupSize: number,
  group: Profile[],
): void {
  const males = people.filter(p => p.gender === "male" && !used.has(p.id));
  const females = people.filter(p => p.gender === "female" && !used.has(p.id));
  const others = people.filter(p => (!p.gender || p.gender === "other") && !used.has(p.id));

  const interleaved: Profile[] = [];
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
  teens: Profile[],
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

    const group: Profile[] = [];
    const groupHouseholds = new Set<string>();
    interleaveGenders(candidates, used, getHousehold, groupHouseholds, groupSize, group);

    if (group.length > 0) {
      const ages = group.map(p => p._age);
      const count = namesByAge.get(startAge) || 0;
      const letter = String.fromCharCode(65 + count);
      namesByAge.set(startAge, count + 1);

      groups.push({
        name: `Teen ${startAge}${letter}`,
        meeting_space: `Teen ${startAge}${letter}`,
        ageMin: Math.min(...ages),
        ageMax: Math.max(...ages),
        males: group.filter(p => p.gender === "male").length,
        females: group.filter(p => p.gender === "female").length,
        memberIds: group.map(p => p.id),
        track: "teen",
      });
    }
  }

  return groups;
}

function assignAdults(
  adults: Profile[],
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

    const group: Profile[] = [];
    const groupHouseholds = new Set<string>();
    interleaveGenders(candidates, used, getHousehold, groupHouseholds, groupSize, group);

    if (group.length > 0) {
      const ages = group.map(p => p._age);
      groups.push({
        name: ADULT_ROOMS[groups.length % ADULT_ROOMS.length],
        meeting_space: ADULT_ROOMS[groups.length % ADULT_ROOMS.length],
        ageMin: Math.min(...ages),
        ageMax: Math.max(...ages),
        males: group.filter(p => p.gender === "male").length,
        females: group.filter(p => p.gender === "female").length,
        memberIds: group.map(p => p.id),
        track: "adult",
      });
    }
  }

  return groups;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.slice(7);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const userSupa = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user } } = await userSupa.auth.getUser(token);
    if (!user) return json({ error: "Unauthenticated" }, 401);

    const { data: roleRow } = await supa
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["facilitator", "admin"])
      .limit(1);

    if (!roleRow || roleRow.length === 0) return json({ error: "Staff only" }, 403);

    const body = await req.json();
    const adultGroupSize = typeof body.adult_group_size === "number" && body.adult_group_size >= 5 && body.adult_group_size <= 25
      ? body.adult_group_size : 15;
    const teenGroupSize = typeof body.teen_group_size === "number" && body.teen_group_size >= 5 && body.teen_group_size <= 25
      ? body.teen_group_size : 15;
    const track = ["all", "adult", "teen"].includes(body.track) ? body.track : "all";

    const { data: allProfiles, error: profErr } = await supa
      .from("profiles")
      .select("id, name, display_name, email, age_group, gender, date_of_birth, membership_status")
      .limit(2000);

    if (profErr) throw profErr;

    const { data: hmRows } = await supa
      .from("household_members")
      .select("profile_id, household_id")
      .limit(5000);

    const householdMap = new Map<string, string>();
    if (hmRows) {
      for (const hm of hmRows) {
        householdMap.set(hm.profile_id, hm.household_id);
      }
    }

    const profiles: Profile[] = (allProfiles || []).map((p: any) => ({
      ...p,
      household_id: householdMap.get(p.id) || null,
      _age: calculateAge(p.date_of_birth) ?? 0,
    }));

    const eligible = profiles.filter(p => {
      const s = p.membership_status;
      return s === "active" || s === "trialing";
    });

    const households = new Map<string, Set<string>>();
    eligible.forEach(p => {
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

    let allGroups: AssignedGroup[] = [];

    if (track === "all" || track === "teen") {
      const teens = eligible.filter(p => p._age >= 10 && p._age <= 18);
      allGroups = [...allGroups, ...assignTeens(teens, teenGroupSize, getHousehold)];
    }

    if (track === "all" || track === "adult") {
      const adults = eligible.filter(p => p._age >= 19);
      allGroups = [...allGroups, ...assignAdults(adults, adultGroupSize, getHousehold)];
    }

    if (track === "all") {
      await supa.from("life_group_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      const names = allGroups.map(g => g.name);
      if (names.length > 0) {
        const { data: existing } = await supa.from("life_groups").select("id").in("name", names);
        if (existing?.length) {
          await supa.from("life_group_members")
            .delete()
            .in("life_group_id", existing.map((g: any) => g.id));
        }
      }
    }

    for (const g of allGroups) {
      const capacity = g.track === "teen" ? teenGroupSize : adultGroupSize;
      const { data: created } = await supa
        .from("life_groups")
        .upsert({
          name: g.name,
          meeting_space: g.meeting_space,
          capacity,
          age_min: g.ageMin,
          age_max: g.ageMax,
          target_male_count: g.males,
          target_female_count: g.females,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "name" })
        .select("id")
        .single();

      if (created && g.memberIds.length > 0) {
        await supa.from("life_group_members").insert(
          g.memberIds.map(pid => ({ life_group_id: created.id, profile_id: pid }))
        );
      }
    }

    const teenGroups = allGroups.filter(g => g.track === "teen").length;
    const adultGroups = allGroups.filter(g => g.track === "adult").length;

    return json({
      ok: true,
      adult_groups: adultGroups,
      teen_groups: teenGroups,
      group_count: allGroups.length,
      assigned_count: allGroups.reduce((sum, g) => sum + g.memberIds.length, 0),
    });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
