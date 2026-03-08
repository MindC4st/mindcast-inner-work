import { motion } from "framer-motion";

const Mission = () => (
  <section className="section-navy py-24 md:py-32">
    <div className="container mx-auto px-6 max-w-3xl text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-4xl md:text-6xl mb-10 leading-[1.1]"
      >
        WE WANT TO RECREATE WHAT CHURCH DID WELL — WITHOUT THE RELIGION
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-silver/60 font-body text-lg leading-relaxed"
      >
        A place to go each week. A community that holds you. Frameworks for the hard stuff. Tools you carry into real life.
      </motion.p>
    </div>
  </section>
);

export default Mission;
