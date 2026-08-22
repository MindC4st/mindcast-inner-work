import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import AuthShell, { authPrimaryButtonClass } from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";

// A newly invited member lands here after their magic link. The invite session
// must be active before Supabase will accept the new password.
const SetPassword = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, session, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please re-enter your password.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast({ title: "Couldn't set your password", description: error.message, variant: "destructive" });
      return;
    }
    navigate("/portal/dashboard", { replace: true });
  };

  return (
    <AuthShell
      eyebrow="Account invitation"
      title="Create your password."
      description="Choose a password for your new Mindcast account. We’ll take you straight to your member space when it’s ready."
      asideTitle="A private space for your own Mindcast journey."
      asideCopy="Your invitation connects this account to the right membership and session track."
    >
      {authLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-foreground/[0.08] bg-white" role="status">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          <span className="ml-3 font-body text-sm text-muted-foreground">Checking your invitation…</span>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="mb-7 flex items-start gap-4 rounded-2xl border border-primary/15 bg-primary/[0.05] p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="pt-1 font-body text-xs leading-6 text-muted-foreground">
              Use at least 8 characters. A longer, unique passphrase is easiest to remember and safest for your account.
            </p>
          </div>

          <PasswordField
            id="new-password"
            label="New password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
          />
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
          />

          <button type="submit" disabled={busy || !session} className={`${authPrimaryButtonClass} mt-2`}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {busy ? "Creating your account…" : "Set password"}
            {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default SetPassword;
