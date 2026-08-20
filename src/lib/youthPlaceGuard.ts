/**
 * youthPlaceGuard — UI layer of the youth-requires-adult rule (layer 1 of 3).
 * PROPOSAL (MC-MEM-106 v2.1 rule 2).
 *
 * The add-a-young-person flow does not exist without an active adult
 * membership on the household. This helper is the single check the
 * Membership page and any future "add a young person" surface must use —
 * the server and webhook enforce the same rule independently.
 */

export type HouseholdMembershipState = {
  hasActiveAdultMembership: boolean;
  adultSeats: number;
  youthPlaces: number;
};

export function canAddYoungPerson(state: HouseholdMembershipState): {
  allowed: boolean;
  reason?: string;
} {
  if (!state.hasActiveAdultMembership) {
    return {
      allowed: false,
      reason:
        "Young people attend with an adult from their household. Start an adult membership first — then add young person places to it.",
    };
  }
  return { allowed: true };
}

/**
 * Removing the last adult membership must never silently orphan youth places.
 * Call this before confirming an adult-seat removal that would take the
 * household to zero adult seats; the UI must surface the consequence and
 * require explicit confirmation.
 */
export function removalOrphansYouthPlaces(
  current: HouseholdMembershipState,
  adultsAfterRemoval: number,
): boolean {
  return adultsAfterRemoval <= 0 && current.youthPlaces > 0;
}
