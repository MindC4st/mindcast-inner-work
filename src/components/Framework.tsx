import { motion } from "framer-motion";

const steps = [
  { title: "NOTICE", desc: "Become aware of what is happening inside — without judgement." },
  { title: "NAME", desc: "Give precise language to your experience — feeling, need, and request." },
  { title: "REWIRE", desc: "Take one deliberate action toward lasting change." },
];

const Framework = () => (
  <section className="section-navy py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="block text-center text-cream/40 text-xs tracking-[0.3em] mb-4"
      >
        HOW IT WORKS
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-20"
      >
        NOTICE. NAME. REWIRE.
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="border-2 border-cream/20 p-8 text-center"
          >
            <h3 className="heading-display text-3xl md:text-4xl mb-4">{step.title}</h3>
            <p className="text-cream/60 font-body text-sm leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Framework;
