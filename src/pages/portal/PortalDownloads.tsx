import { motion } from "framer-motion";
import { Download, Lock } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";

const PortalDownloads = () => (
  <PortalLayout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center py-20">
      <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center mx-auto mb-6">
        <Download size={20} className="text-foreground/30" strokeWidth={1.5} />
      </div>
      <h1 className="portal-heading text-2xl text-foreground mb-3">MY DOWNLOADS</h1>
      <p className="text-sm text-muted-foreground font-body font-light leading-relaxed mb-4">
        Your full journal export will unlock after Week 8 to encourage completion. Keep going.
      </p>
      <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground/60 font-body">
        <Lock size={12} strokeWidth={1.5} />
        COMING SOON
      </div>
    </motion.div>
  </PortalLayout>
);

export default PortalDownloads;
