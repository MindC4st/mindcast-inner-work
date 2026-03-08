import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="section-navy min-h-screen flex items-center justify-center pt-16">
    <div className="container mx-auto px-6 text-center">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-silver/40 text-xs tracking-[0.3em] font-medium"
      >
        INNER WORK FOR REAL LIFE
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="heading-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl max-w-5xl mx-auto leading-[0.9] mt-6"
      >
        A WORLD WHERE PEOPLE HEAL THEMSELVES
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-8 text-silver/70 font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
      >
        MINDCAST is a community, a platform, and a weekly practice built around one idea — that healing is a skill anyone can learn.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/membership" className="btn-filled">JOIN THE COMMUNITY</Link>
        <a href="#ecosystem" className="btn-outlined">EXPLORE WHAT WE DO</a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
      >
        {["WEEKLY LIVE EVENTS", "4 DIGITAL TOOLS", "FOUNDING COMMUNITY OPEN"].map((stat) => (
          <span key={stat} className="text-silver/30 text-xs tracking-[0.2em] font-medium">{stat}</span>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Hero;
