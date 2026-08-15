import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoLight from "@/assets/logo-cream.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // The recovery token can arrive as a hash on any page; AuthContext then
    // routes here, so by mount the session may already exist with the hash
    // consumed. Accept any of: hash token, live recovery event, or an
    // already-established recovery session.
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/portal/login");
    }
  };

  if (!ready) {
    return (
      <section className="bg-navy min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={logoLight} alt="Mindcast" className="h-10 mx-auto mb-6" />
          <p className="text-cream/50 text-sm font-body">Verifying your reset link…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-navy min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-8">
        <div className="text-center mb-10">
          <img src={logoLight} alt="Mindcast" className="h-10 mx-auto mb-6" />
          <h1 className="font-display text-lg tracking-[0.3em] text-cream/80">SET NEW PASSWORD</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] tracking-[0.2em] text-cream/40 font-body block mb-2">NEW PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent border-b border-cream/20 text-cream px-0 py-3 text-sm font-body font-light placeholder:text-cream/25 focus:border-cream/50 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.2em] text-cream/40 font-body block mb-2">CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent border-b border-cream/20 text-cream px-0 py-3 text-sm font-body font-light placeholder:text-cream/25 focus:border-cream/50 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cream/10 text-cream py-4 text-[11px] tracking-[0.2em] font-body hover:bg-cream/20 transition-colors disabled:opacity-40"
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
