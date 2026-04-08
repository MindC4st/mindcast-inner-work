import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PortalSettings = () => {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync name when profile loads (auth may still be loading at mount)
  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  return (
    <PortalLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="portal-heading text-3xl text-foreground mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body font-light">Manage your account.</p>

        <div className="border border-foreground/[0.08] p-6 md:p-8 space-y-6 max-w-lg">
          <div>
            <label className="portal-label block mb-2">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-foreground/15 text-foreground px-0 py-3 text-sm font-body font-light focus:border-foreground/40 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="portal-label block mb-2">EMAIL</label>
            <p className="text-sm text-foreground/50 font-body font-light py-3">{user?.email}</p>
          </div>

          <div>
            <label className="portal-label block mb-2">MEMBERSHIP</label>
            <p className="text-sm text-foreground/50 font-body font-light py-3">Pilot — Term 1 2026</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="bg-primary text-primary-foreground px-6 py-3 text-[11px] tracking-[0.2em] font-body hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalSettings;
