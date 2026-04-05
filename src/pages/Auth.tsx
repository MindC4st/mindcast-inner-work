import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import logoDark from "@/assets/logo-dark-tagline.png";

const Auth = () => {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || email.split("@")[0] } },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We've sent you a verification link." });
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) {
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={logoDark} alt="Mindcast" className="h-12 mx-auto mb-2" />
          <p className="text-foreground/40 text-sm font-body">A weekly gathering for the curious</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 border-b border-foreground/10">
          <button
            onClick={() => setTab("signin")}
            className={`flex-1 pb-3 text-xs tracking-[0.15em] font-body transition-colors ${
              tab === "signin" ? "text-foreground border-b-2 border-white" : "text-foreground/30"
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 pb-3 text-xs tracking-[0.15em] font-body transition-colors ${
              tab === "signup" ? "text-foreground border-b-2 border-white" : "text-foreground/30"
            }`}
          >
            JOIN MINDCAST
          </button>
        </div>

        <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="space-y-5">
          {tab === "signup" && (
            <div>
              <label className="block text-foreground/50 text-[11px] tracking-[0.1em] font-body mb-2">
                WHAT SHOULD WE CALL YOU ON SCREEN?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="w-full bg-transparent border-b border-foreground/15 text-foreground font-body text-sm py-3 px-1 focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-foreground/20"
              />
            </div>
          )}

          <div>
            <label className="block text-foreground/50 text-[11px] tracking-[0.1em] font-body mb-2">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-foreground/15 text-foreground font-body text-sm py-3 px-1 focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-foreground/20"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-foreground/50 text-[11px] tracking-[0.1em] font-body mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-transparent border-b border-foreground/15 text-foreground font-body text-sm py-3 px-1 pr-10 focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-foreground/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/50"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground text-xs tracking-[0.15em] font-display font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : tab === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-foreground/10" />
          <span className="text-foreground/20 text-[10px] tracking-[0.15em] font-body">OR</span>
          <div className="flex-1 h-px bg-foreground/10" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3.5 border border-foreground/10 text-foreground/60 text-xs tracking-[0.1em] font-body hover:border-foreground/25 hover:text-foreground/80 transition-colors flex items-center justify-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center mt-8 text-foreground/15 text-[10px] tracking-[0.1em] font-body">
          <a href="/" className="hover:text-foreground/30 transition-colors">← Back to Mindcast</a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
