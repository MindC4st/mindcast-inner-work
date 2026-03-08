import { motion } from "framer-motion";

const steps = [
  { title: "NOTICE", desc: "Become aware of what's happening inside" },
  { title: "NAME", desc: "Give language to your experience" },
  { title: "REWIRE", desc: "Take one deliberate action toward change" },
];

const Framework = () => (
  <section className="section-navy py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-20"
      >
        NOTICE. NAME. REWIRE.
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-12 md:gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center"
          >
            <span className="font-display text-8xl md:text-9xl text-silver/10 block leading-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="heading-display text-3xl md:text-4xl mt-4 mb-4">{step.title}</h3>
            <p className="text-silver/60 font-body text-base leading-relaxed max-w-xs mx-auto">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Framework;
