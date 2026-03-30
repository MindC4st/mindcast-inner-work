import { useState } from "react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PortalSettings = () => {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);

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
        <h1 className="heading-display text-3xl text-primary mb-2">SETTINGS</h1>
        <p className="text-sm text-muted-foreground mb-8 font-body">Manage your account.</p>

        <div className="border-[3px] border-primary p-6 md:p-8 space-y-6 max-w-lg">
          <div>
            <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-2 border-primary/20 text-primary px-4 py-3 text-sm font-body focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">EMAIL</label>
            <p className="text-sm text-primary font-body px-4 py-3 border-2 border-primary/10 bg-muted/20">{user?.email}</p>
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-primary/40 mb-1 block">MEMBERSHIP</label>
            <p className="text-sm text-primary font-body px-4 py-3 border-2 border-primary/10 bg-muted/20">MEMBER</p>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-navy text-xs py-2 px-6 disabled:opacity-50">
            {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </motion.div>
    </PortalLayout>
  );
};

export default PortalSettings;
