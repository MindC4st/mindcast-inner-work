import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";
import logoLight from "@/assets/logo-cream.png";

const PortalLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/portal/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setGoogleLoading(false);
    if (error) {
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <section className="bg-primary min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Brand mark */}
          <div className="text-center mb-12">
            <img src={logoLight} alt="Mindcast" className="h-12 mx-auto" />
            <div className="w-8 h-px bg-primary-foreground/20 mx-auto mt-4" />
            <h1 className="font-display text-lg tracking-[0.3em] text-primary-foreground/80 mt-5">MEMBER PORTAL</h1>
            <p className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body mt-1.5">PILOT — TERM 1 2026</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body block mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-b border-primary-foreground/15 text-primary-foreground px-0 py-3 text-sm font-body font-light placeholder:text-primary-foreground/15 focus:border-primary-foreground/40 focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.2em] text-primary-foreground/30 font-body block mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-b border-primary-foreground/15 text-primary-foreground px-0 py-3 text-sm font-body font-light placeholder:text-primary-foreground/15 focus:border-primary-foreground/40 focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-foreground/10 text-primary-foreground py-4 text-[11px] tracking-[0.2em] font-body hover:bg-primary-foreground/15 transition-colors disabled:opacity-40"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </div>
          </form>

          {/* Forgot password */}
          <div className="text-center mt-4">
            <button className="text-[10px] tracking-[0.15em] text-primary-foreground/25 hover:text-primary-foreground/50 font-body transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-primary-foreground/10" />
            <span className="text-[10px] tracking-[0.2em] text-primary-foreground/20 font-body">OR</span>
            <div className="flex-1 h-px bg-primary-foreground/10" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-primary-foreground/5 text-primary-foreground py-4 text-[11px] tracking-[0.15em] font-body hover:bg-primary-foreground/10 transition-colors disabled:opacity-40 border border-primary-foreground/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Access note */}
          <div className="mt-10 text-center">
            <p className="text-primary-foreground/20 text-[10px] font-body font-light leading-relaxed">
              Portal access is available to registered pilot members only.
            </p>
            <Link to="/pilot" className="text-[10px] tracking-[0.1em] text-primary-foreground/35 hover:text-primary-foreground/60 font-body transition-colors mt-1 inline-block">
              To join the pilot, visit mindcast.co.nz/pilot →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PortalLogin;
