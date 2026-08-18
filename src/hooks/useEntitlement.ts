import { useAuth } from "@/contexts/AuthContext";
import { trackForAgeGroup } from "@/hooks/useCurriculumWeeks";

// The UI mirrors the server's can_access_track() check. The database remains
// authoritative; these values only decide which locked state to render.

export type TrackLabel = "Adult" | "Teen" | "Child";

export type Entitlement = {
  isMember: boolean;          // active/trialing seat for this profile's own track
  track: TrackLabel;          // this profile's age-appropriate track
  kidsAddon: boolean;         // active payer with at least one child seat
  tier: string;               // 'none' | 'adult' | 'teen' | 'child' (Stripe-owned)
  membershipStatus: string;
};

export function useEntitlement(): Entitlement {
  const { profile, membershipStatus } = useAuth();
  const p = profile;
  const active = membershipStatus === "active" || membershipStatus === "trialing";
  const age = trackForAgeGroup(p?.age_group); // 'adult' | 'teen' | 'child'
  const track: TrackLabel = age === "teen" ? "Teen" : age === "child" ? "Child" : "Adult";
  const tier = p?.membership_tier || "none";
  const hasOwnSeat =
    (track === "Adult" && tier === "adult") ||
    (track === "Teen" && tier === "teen") ||
    (track === "Child" && tier === "child");

  return {
    isMember: active && hasOwnSeat,
    track,
    kidsAddon: active && !!p?.kids_addon,
    tier,
    membershipStatus: membershipStatus || "none",
  };
}
