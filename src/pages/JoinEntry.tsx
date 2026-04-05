import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logoWhite from "@/assets/logo-white.png";

const JoinEntry = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    const clean = code.trim().toUpperCase();
    if (clean.length !== 6) {
      setError("Enter the 6-character code shown on screen");
      return;
    }
    navigate(`/join/${clean}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <img src={logoWhite} alt="Mindcast" className="h-8 mx-auto mb-10" />

        <p className="text-muted-foreground text-sm mb-8">
          Enter the session code shown on screen
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().slice(0, 6));
            setError("");
          }}
          placeholder="_ _ _ _ _ _"
          maxLength={6}
          className="w-full text-center text-3xl font-mono font-bold tracking-[0.4em] bg-card border border-border/20 rounded-xl py-5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent transition-colors"
          autoFocus
        />

        {error && <p className="text-destructive text-xs mt-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={code.length < 6}
          className="w-full mt-6 py-4 bg-foreground text-background font-semibold text-sm rounded-xl disabled:opacity-30 transition-opacity"
        >
          Join tonight's session →
        </button>
      </motion.div>
    </div>
  );
};

export default JoinEntry;
