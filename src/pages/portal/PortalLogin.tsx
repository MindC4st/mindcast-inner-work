import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "@/hooks/use-toast";

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
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl tracking-[0.2em] text-primary-foreground">MINDCAST</h1>
            <div className="w-8 h-px bg-primary-foreground/20 mx-auto mt-4" />
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

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-foreground/10 text-primary-foreground py-4 text-[11px] tracking-[0.2em] font-body hover:bg-primary-foreground/15 transition-colors disabled:opacity-40"
              >
                {loading ? "Signing in..." : "Enter"}
              </button>
            </div>
          </form>

          <p className="text-primary-foreground/20 text-[11px] mt-10 text-center font-body font-light leading-relaxed">
            First time? Your facilitator will send you an invite.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PortalLogin;
