import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Lock } from "lucide-react";
import PortalLayout from "@/components/portal/PortalLayout";

const PortalInsights = () => (
  <PortalLayout>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto text-center py-12 sm:py-20">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Brain size={20} className="text-foreground/30" strokeWidth={1.5} />
      </div>
      <p className="portal-label mb-3">Personal reflection</p>
      <h1 className="font-serif text-4xl text-foreground mb-4">Your Insights</h1>
      <p className="text-sm text-muted-foreground font-body leading-7 mb-6">
        Your personal AI reflection and domain trends will unlock after you've completed a few sessions.
      </p>
      <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card px-4 py-2 text-[10px] tracking-[0.16em] text-muted-foreground font-body">
        <Lock size={12} strokeWidth={1.5} />
        COMING SOON
      </div>
      <div className="mt-8">
        <Link to="/portal/progress" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-body text-sm font-semibold text-primary-foreground focus:outline-none focus:ring-4 focus:ring-primary/20">
          View your progress <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.div>
  </PortalLayout>
);

export default PortalInsights;
