import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const pageContent: Record<string, { title: string; message: string }> = {
  "/live": {
    title: "LIVE SESSIONS",
    message: "Your Sunday live session opens here each week. Become a member to join.",
  },
  "/resources": {
    title: "RESOURCE LIBRARY",
    message: "The resource library is being built. Members get access as lessons unlock.",
  },
  "/ecosystem": {
    title: "THE ECOSYSTEM",
    message: "The full 52-week Mindcast curriculum is rolling out. Become a member to begin.",
  },
};

const ComingSoon = () => {
  const location = useLocation();
  const content = pageContent[location.pathname] || {
    title: "COMING SOON",
    message: "This part of MINDCAST is still being built.",
  };

  return (
    <>
      <SiteHeader />
      <section className="section-cream min-h-[80vh] flex items-center pt-16">
        <div className="container mx-auto px-6 text-center py-24">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground/70 text-xs tracking-[0.3em] mb-6 block"
          >
            COMING SOON
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="heading-display text-5xl sm:text-6xl md:text-8xl max-w-4xl mx-auto leading-[0.9]"
          >
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-muted-foreground font-body text-base max-w-xl mx-auto"
          >
            {content.message}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex gap-4 justify-center"
          >
            <Link
              to="/membership"
              className="text-xs font-display font-extrabold tracking-[0.2em] bg-primary text-primary-foreground py-3 px-8 hover:bg-primary/90 transition-colors"
              style={{ color: "hsl(210,56%,14%)" }}
            >
              BECOME A MEMBER
            </Link>
            <Link
              to="/"
              className="text-xs font-display font-extrabold tracking-[0.2em] border border-border text-muted-foreground py-3 px-8 hover:text-foreground hover:border-primary transition-colors"
            >
              BACK HOME
            </Link>
          </motion.div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
};

export default ComingSoon;
