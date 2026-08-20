import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// /portal/set-password — a newly invited user (teen) lands here after the
// magic link. They choose a password, then we take them straight to the portal.

const SetPassword = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // updateUser requires an active session. If a user lands here without one
  // (e.g. the invite link wasn't followed), send them to sign-in.
  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/portal/login", { replace: true });
    }
  }, [authLoading, session, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="portal-card p-8 md:p-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 grid place-items-center mx-auto mb-5 text-primary">
            <Lock size={20} />
          </div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wider text-foreground text-center mb-2">SET UP YOUR MINDCAST ACCOUNT</h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-8 leading-relaxed">
            Choose a password for your account. Once you're finished, we'll take you straight to your Mindcast portal.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="password" className="text-[10px] tracking-[0.2em] text-muted-foreground/70 font-body block mb-2">NEW PASSWORD</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="confirm" className="text-[10px] tracking-[0.2em] text-muted-foreground/70 font-body block mb-2">CONFIRM PASSWORD</label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : null}
              {busy ? "SETTING…" : "SET MY PASSWORD →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
