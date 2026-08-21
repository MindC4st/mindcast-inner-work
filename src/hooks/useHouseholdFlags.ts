import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Household-wide child/teen flags, derived from the household roster rather
// than the payer-only kids_addon column. Both adult guardians see the same
// flags, so the Kid/Teen session tiles are consistent across a household.

export type HouseholdFlags = {
  hasKids: boolean;
  hasTeens: boolean;
  loading: boolean;
};

export function useHouseholdFlags(): HouseholdFlags {
  const [flags, setFlags] = useState<HouseholdFlags>({ hasKids: false, hasTeens: false, loading: true });

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("household_children_for");
      if (!active) return;
      const rows = (data ?? []) as { role_in_household: string }[];
      setFlags({
        hasKids: rows.some((r) => r.role_in_household !== "teen"),
        hasTeens: rows.some((r) => r.role_in_household === "teen"),
        loading: false,
      });
    })();
    return () => { active = false; };
  }, []);

  return flags;
}
