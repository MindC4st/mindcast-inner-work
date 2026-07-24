import { useAuth } from "@/contexts/AuthContext";
import { trackForAgeGroup } from "@/hooks/useCurriculumWeeks";

// Coarse membership gate for the member's own track. The portal only ever
// serves a member their own track's content (resolved from age_group), so
// "teen tier = teen only" is enforced naturally — a teen never sees adult
// weeks. Access to a member's own lessons therefore = paid + active.
// Kids content is a separate view gated by the kids_addon flag.

export type TrackLabel = "Adult" | "Teen" | "Child";

export type Entitlement = {
  isMember: boolean;          // active or trialing
  track: TrackLabel;          // this member's own track
  kidsAddon: boolean;         // paid adult who bought a kids membership
  tier: string;               // 'none' | 'adult' | 'teen' (Stripe-owned)
  membershipStatus: string;
};

export function useEntitlement(): Entitlement {
  const { profile, membershipStatus } = useAuth();
  const p: any = profile || {};
  const isMember = membershipStatus === "active" || membershipStatus === "trialing";
  const age = trackForAgeGroup(p.age_group); // 'adult' | 'teen' | 'child'
  const track: TrackLabel = age === "teen" ? "Teen" : age === "child" ? "Child" : "Adult";
  return {
    isMember,
    track,
    kidsAddon: !!p.kids_addon,
    tier: p.membership_tier || "none",
    membershipStatus: membershipStatus || "none",
  };
}
