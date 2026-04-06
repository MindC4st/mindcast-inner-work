import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const pageContent: Record<string, { title: string; message: string }> = {
  "/live": {
    title: "LIVE SESSIONS",
    message: "Live sessions and recordings are coming in Term 2. Join the pilot to be first in.",
  },
  "/resources": {
    title: "RESOURCE LIBRARY",
    message: "The resource library is being built. Pilot members get early access.",
  },
  "/ecosystem": {
    title: "THE ECOSYSTEM",
    message: "The full Mindcast ecosystem launches after our founding pilot.",
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
      <Navbar />
      <section className="section-navy min-h-[80vh] flex items-center pt-16">
        <div className="container mx-auto px-6 text-center py-24">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-cream/40 text-xs tracking-[0.3em] mb-6 block"
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
            className="mt-8 text-cream/60 font-body text-base max-w-xl mx-auto"
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
              to="/pilot"
              className="text-xs font-display font-extrabold tracking-[0.2em] bg-cream text-navy py-3 px-8 hover:bg-cream/90 transition-colors"
              style={{ color: "hsl(210,56%,14%)" }}
            >
              JOIN THE PILOT
            </Link>
            <Link
              to="/"
              className="text-xs font-display font-extrabold tracking-[0.2em] border border-cream/20 text-cream/60 py-3 px-8 hover:text-cream hover:border-cream/40 transition-colors"
            >
              BACK HOME
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ComingSoon;
