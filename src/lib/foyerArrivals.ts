// foyerArrivals.ts — presentation-safe foyer grouping rules, mirrored 1:1 from
// the foyer_arrivals_today() RPC (migration 20260825140000_foyer_arrivals).
// The database is authoritative; this pure copy exists so the safeguarding
// rules are unit-tested on every run.
//
// Rules:
//   * input is ONLY visible check-ins (wall_hidden=false, is_anonymous=false)
//     — a hidden minor never contributes to grouping
//   * one visible person            -> their name (minors: first name only)
//   * 2+ visible, same household   -> THE <SURNAME> FAMILY
//   * surname: payer adult's last name, else an adult member's last name —
//     never parsed from a child's name
//   * no reliable adult surname     -> first visible adult's display name as
//     the single household label
//   * household with no visible adult (minors only) -> each minor by first name

export type FoyerPerson = {
  profileId: string;
  householdId: string | null;
  isMinor: boolean;
  isPayer: boolean;
  /** Full display name (first + last or chosen display name). */
  fullName: string;
  /** First name or chosen display name only. */
  firstName: string;
  /** Last name — adults only; null/empty for minors. */
  lastName: string | null;
  checkedInAt: string;
};

export type FoyerLabel = {
  displayKey: string;
  displayLabel: string;
  latestCheckedInAt: string;
  arrivalType: "individual" | "family";
};

const clean = (s: string | null | undefined) => (s ?? "").trim();

export function groupFoyerArrivals(people: FoyerPerson[]): FoyerLabel[] {
  if (people.length === 0) return [];

  // One row per person: latest visible check-in wins (repeated scans don't
  // duplicate).
  const byProfile = new Map<string, FoyerPerson>();
  for (const p of people) {
    const existing = byProfile.get(p.profileId);
    if (!existing || p.checkedInAt > existing.checkedInAt) byProfile.set(p.profileId, p);
  }
  const distinct = [...byProfile.values()];

  const byHousehold = new Map<string, FoyerPerson[]>();
  for (const p of distinct) {
    if (!p.householdId) continue;
    byHousehold.set(p.householdId, [...(byHousehold.get(p.householdId) ?? []), p]);
  }

  const labels: FoyerLabel[] = [];
  const familyResolved = new Set<string>(); // household ids that got a label

  for (const [householdId, members] of byHousehold) {
    if (members.length < 2) continue;
    const latest = members.reduce((a, b) => (a.checkedInAt > b.checkedInAt ? a : b)).checkedInAt;

    // Surname source order — adults only, never a child's name.
    const payer = members.find((m) => m.isPayer && !m.isMinor);
    const adults = members
      .filter((m) => !m.isMinor)
      .sort((a, b) => (a.checkedInAt < b.checkedInAt ? -1 : 1));
    const adultWithSurname = adults.find((m) => clean(m.lastName) !== "");

    let labelBase: string | null = null;
    let reliableSurname = false;
    if (payer && clean(payer.lastName) !== "") {
      labelBase = clean(payer.lastName);
      reliableSurname = true;
    } else if (adultWithSurname) {
      labelBase = clean(adultWithSurname.lastName);
      reliableSurname = true;
    } else if (adults.length > 0) {
      labelBase = clean(adults[0].fullName) || clean(adults[0].firstName) || null;
      reliableSurname = false;
    }

    if (!labelBase) continue; // minors-only household — handled individually
    familyResolved.add(householdId);
    labels.push({
      displayKey: `hh:${householdId}`,
      displayLabel: reliableSurname ? `THE ${labelBase.toUpperCase()} FAMILY` : labelBase.toUpperCase(),
      latestCheckedInAt: latest,
      arrivalType: "family",
    });
  }

  for (const p of distinct) {
    if (p.householdId && familyResolved.has(p.householdId)) continue;
    const members = p.householdId ? byHousehold.get(p.householdId) ?? [] : [];
    if (p.householdId && members.length >= 2) {
      // Multi-member household with no family label (minors only): each minor
      // appears by first name.
      if (!p.isMinor) continue; // adults here would already have produced a label
    }
    labels.push({
      displayKey: `p:${p.profileId}`,
      displayLabel: (p.isMinor ? clean(p.firstName) || "Welcome" : clean(p.fullName) || clean(p.firstName) || "Member").toUpperCase(),
      latestCheckedInAt: p.checkedInAt,
      arrivalType: "individual",
    });
  }

  return labels.sort((a, b) => (a.latestCheckedInAt < b.latestCheckedInAt ? 1 : -1));
}
