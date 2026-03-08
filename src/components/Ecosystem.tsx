import { motion } from "framer-motion";
import { ArrowRight, Radio, Heart, Sparkles, Moon } from "lucide-react";

const products = [
  {
    icon: Radio,
    title: "MINDCAST LIVE",
    desc: "Weekly gatherings. Inspirational talks. No religion required.",
  },
  {
    icon: Heart,
    title: "MINDCAST RELATIONSHIPS",
    desc: "A consent-first app for couples doing hard conversations.",
  },
  {
    icon: Sparkles,
    title: "LITTLE MINDS BIG QUESTIONS",
    desc: "AI metaphors for the big questions kids ask.",
  },
  {
    icon: Moon,
    title: "MINDCAST WELLNESS",
    desc: "Cycle-synced health tools for women.",
  },
];

const Ecosystem = () => (
  <section id="ecosystem" className="section-white py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-20 text-primary"
      >
        FOUR TOOLS. ONE PRACTICE.
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {products.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border-2 border-primary p-8 group hover:bg-primary hover:text-silver transition-colors duration-300 cursor-pointer"
          >
            <p.icon className="w-8 h-8 mb-6 text-primary group-hover:text-silver transition-colors" />
            <h3 className="font-display text-2xl tracking-wider mb-3">{p.title}</h3>
            <p className="font-body text-sm text-muted-foreground group-hover:text-silver/70 transition-colors leading-relaxed mb-6">
              {p.desc}
            </p>
            <ArrowRight className="w-5 h-5 text-primary group-hover:text-silver transition-all group-hover:translate-x-2" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Ecosystem;
