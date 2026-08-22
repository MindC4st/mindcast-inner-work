import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Lock } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";

const PortalGroup = () => (
  <PortalLayout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-12 sm:py-20">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Users size={20} className="text-foreground/30" strokeWidth={1.5} />
      </div>
      <p className="portal-label mb-3">Your community</p>
      <h1 className="font-serif text-4xl text-primary mb-4">Life Group</h1>
      <p className="text-sm text-muted-foreground font-body leading-7 mb-6">
        Shared reflections from your Life Group will appear here once sessions begin.
      </p>
      <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-[10px] tracking-[0.16em] text-muted-foreground font-body">
        <Lock size={12} strokeWidth={1.5} />
        COMING SOON
      </div>
      <div className="mt-8">
        <Link to="/portal/weeks" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-semibold text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20">
          Explore your sessions <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  </PortalLayout>
);

export default PortalGroup;