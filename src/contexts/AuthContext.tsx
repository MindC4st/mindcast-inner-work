import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Tables<"profiles"> | null;
  role: "member" | "facilitator" | "admin" | null;
  /** True for a full admin (payments, member management, journals-policy owner). */
  isAdmin: boolean;
  /** True for admin OR facilitator — i.e. anyone who can run the session-admin UI. */
  isStaff: boolean;
  /** Coarse membership gate mirrored from Stripe: active/trialing/past_due/lapsed/paused/none. */
  membershipStatus: string;
  cohortId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [role, setRole] = useState<"member" | "facilitator" | "admin" | null>(null);
  const [cohortId, setCohortId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [profileRes, roleRes, cohortRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("cohort_members").select("cohort_id").eq("user_id", userId).limit(1).maybeSingle(),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (roleRes.data && roleRes.data.length) {
      // A user can hold several roles (member + facilitator + admin). Pick the
      // highest privilege so an admin with a leftover 'member' row isn't
      // downgraded to a plain member by an unordered .limit(1).
      const roles = roleRes.data.map(r => r.role as string);
      const highest = roles.includes("admin") ? "admin"
        : roles.includes("facilitator") ? "facilitator"
        : (roles[0] ?? null);
      setRole(highest as "member" | "facilitator" | "admin" | null);
    }
    if (cohortRes.data) setCohortId(cohortRes.data.cohort_id);
  };

  useEffect(() => {
    // A bracelet unlock with "stay signed in" unticked marks the visit
    // ephemeral: the next app open starts signed-out so tapping the bracelet
    // asks for the password again (the device is not remembered).
    if (localStorage.getItem("mindcast_ephemeral_session") === "1") {
      localStorage.removeItem("mindcast_ephemeral_session");
      supabase.auth.signOut();
    }
    // IMPORTANT: do NOT `await` supabase queries directly inside
    // onAuthStateChange — it deadlocks the auth client and `loading`
    // never flips to false. Defer with setTimeout(0).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Recovery links can land on any URL (email templates drop the token in
      // the hash at the site root) — wherever the session arrives with a
      // recovery event, route the member to the reset screen.
      if (event === "PASSWORD_RECOVERY") {
        setTimeout(() => navigate("/reset-password"), 0);
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id).finally(() => setLoading(false));
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
        setCohortId(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setCohortId(null);
  };

  const isAdmin = role === "admin" || profile?.is_admin === true;
  const isStaff = isAdmin || role === "facilitator";
  const membershipStatus = profile?.membership_status ?? "none";

  return (
    <AuthContext.Provider
      value={{
        session, user, profile, role, isAdmin, isStaff, membershipStatus,
        cohortId, loading, signIn, signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
