// useCommerceRoles — the signed-in user's commerce capabilities.
// Server-side enforcement lives in the edge functions; this only shapes the UI.
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/db";

export type CommerceRoles = {
  isAdmin: boolean;
  isCommerceAdmin: boolean;
  isFulfilment: boolean;
  isSupport: boolean;
  canRefund: boolean;
  canManageProducts: boolean;
  canAdjustStock: boolean;
  loading: boolean;
};

export const useCommerceRoles = (): CommerceRoles => {
  const { user, role } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    db.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      if (!active) return;
      setRoles((data ?? []).map((r: { role: string }) => r.role));
      setLoading(false);
    });
    return () => { active = false; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = role === "admin";
  const isCommerceAdmin = isAdmin || roles.includes("commerce_admin");
  const isFulfilment = isCommerceAdmin || roles.includes("fulfilment");
  const isSupport = isCommerceAdmin || roles.includes("support");

  return {
    isAdmin,
    isCommerceAdmin,
    isFulfilment,
    isSupport,
    canRefund: isCommerceAdmin,
    canManageProducts: isCommerceAdmin,
    canAdjustStock: isCommerceAdmin,
    loading,
  };
};
