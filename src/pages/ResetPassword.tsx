import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert, Loader2, LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AuthShell, { authPrimaryButtonClass } from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";

type RecoveryStatus = "checking" | "ready" | "invalid";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const navigate = useNavigate();

  useEffect(() => {
    // Recovery may arrive in the hash, as a PASSWORD_RECOVERY event, or as a
    // session already established by AuthContext after it consumed the hash.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    if (window.location.hash.includes("type=recovery")) {
      setStatus("ready");
    } else {
      supabase.auth.getSession().then(({ data }) => {
        setStatus(data.session ? "ready" : "invalid");
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please check both entries and try again.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Password not updated", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password."
      description="Create a password you donâ€™t use elsewhere. Once itâ€™s saved, you can return to your member space."
      asideTitle="A simple way back into your Mindcast space."
      asideCopy="Reset links are temporary and can only be used to update the account they were sent to."
    >
      {status === "checking" && (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-foreground/[0.08] bg-white" role="status">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span className="ml-3 font-body text-sm text-muted-foreground">Verifying your reset linkâ€¦</span>
        </div>
      )}

      {status === "invalid" && (
        <div className="rounded-2xl border border-destructive/15 bg-destructive/[0.04] p-5 sm:p-6" role="alert">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <CircleAlert className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-body text-sm font-semibold text-primary">This reset link is no longer active</h2>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">
                It may have expired or already been used. Return to sign in and request a fresh link.
              </p>
              <Link
                to="/auth"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg font-body text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                Return to sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-7 flex items-start gap-4 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="pt-1 font-body text-xs leading-6 text-muted-foreground">
              Use at least 6 characters. A longer, unique passphrase gives your account better protection.
            </p>
          </div>
          <PasswordField
            id="recovery-password"
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={6}
            disabled={loading}
          />
          <PasswordField
            id="recovery-password-confirm"
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={6}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className={`${authPrimaryButtonClass} mt-2`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {loading ? "Updating passwordâ€¦" : "Update password"}
            {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPassword;