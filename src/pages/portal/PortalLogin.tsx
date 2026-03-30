import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const PortalLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <section className="section-navy min-h-screen flex items-center">
      <div className="container mx-auto px-6 max-w-md text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="heading-display text-5xl mb-2 text-secondary">MINDCAST</h1>
          <p className="text-secondary/40 text-xs tracking-widest mb-12">MEMBER PORTAL</p>

          <h2 className="font-display text-2xl tracking-widest text-secondary mb-8">WELCOME BACK</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-secondary/30 text-secondary px-6 py-4 text-sm tracking-widest placeholder:text-secondary/30 focus:border-secondary focus:outline-none"
            />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-secondary/30 text-secondary px-6 py-4 text-sm tracking-widest placeholder:text-secondary/30 focus:border-secondary focus:outline-none"
            />
            <button type="submit" disabled={loading} className="btn-filled w-full text-xs disabled:opacity-50">
              {loading ? "SIGNING IN..." : "ENTER YOUR PORTAL"}
            </button>
          </form>

          <p className="text-secondary/30 text-xs mt-8 tracking-wider">
            First time? Your facilitator will send you an invite.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PortalLogin;
