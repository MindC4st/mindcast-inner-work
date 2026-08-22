import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import AuthShell, {
  authFieldClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import { AUTH_PATH, safeAuthDestination } from "@/lib/authRoutes";

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = safeAuthDestination(searchParams.get("redirect"));

  // OAuth returns through this canonical page. Once AuthContext has restored
  // the session, complete the same safe return journey as email sign-in.
  useEffect(() => {
    if (!authLoading && session) navigate(redirectTo, { replace: true });
  }, [authLoading, session, navigate, redirectTo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      const friendly = /invalid login credentials/i.test(error.message)
        ? "Hmm, that email or password doesn't look right — try again."
        : /email not confirmed/i.test(error.message)
          ? "Please confirm your email first — check your inbox for the confirmation link."
          : "We couldn't sign you in just now. Check your details and try again.";
      toast({ title: "Sign in failed", description: friendly, variant: "destructive" });
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const authReturnUrl = new URL(AUTH_PATH, window.location.origin);
    authReturnUrl.searchParams.set("redirect", redirectTo);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: authReturnUrl.toString(),
    });
    setGoogleLoading(false);
    if (error) {
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Enter your email",
        description: "Type your email address above, then choose forgot password.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Reset link not sent", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent a password reset link to your inbox." });
    }
  };

  return (
    <AuthShell
      eyebrow="Mindcast member portal"
      title="Welcome back."
      description="Sign in to continue your weekly sessions, revisit your progress and manage your membership."
      footer={
        <>
          Not a member yet?{" "}
          <Link to="/membership" className="font-semibold text-foreground underline underline-offset-4">
            Explore membership
          </Link>
          <span className="mx-2 text-foreground/20" aria-hidden="true">•</span>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <span className="mx-2 text-foreground/20" aria-hidden="true">•</span>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        </>
      }
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="font-body text-sm font-semibold text-foreground">
              Email address
            </label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
                className={`${authFieldClass} pr-12`}
                placeholder="you@example.com"
              />
              <Mail className="pointer-events-none absolute right-5 top-[calc(50%+0.25rem)] h-4 w-4 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
            </div>
          </div>

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={loading}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="inline-flex min-h-10 items-center rounded-lg px-1 font-body text-xs font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition hover:decoration-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40"
            >
              Forgot your password?
            </button>
          </div>

          <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-foreground/[0.08]" />
          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-foreground/[0.08]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-white px-6 py-3 font-body text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03] focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-45"
        >
          {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <GoogleMark />}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>
      </motion.div>
    </AuthShell>
  );
};

export default Auth;
