import { motion } from "framer-motion";

const Hero = () => (
  <section className="section-navy min-h-screen flex items-center justify-center pt-16">
    <div className="container mx-auto px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="heading-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl max-w-5xl mx-auto leading-[0.9]"
      >
        A WORLD WHERE PEOPLE DO THE INNER WORK
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-8 text-silver/70 font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
      >
        MINDCAST is a community, a practice, and a set of tools built around one idea — that healing is a skill you can learn.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <a href="#waitlist" className="btn-filled">JOIN THE COMMUNITY</a>
        <a href="#ecosystem" className="btn-outlined">EXPLORE THE ECOSYSTEM</a>
      </motion.div>
    </div>
  </section>
);

export default Hero;
