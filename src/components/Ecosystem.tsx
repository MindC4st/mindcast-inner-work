import { motion } from "framer-motion";
import { ArrowRight, Radio, Heart, Sparkles, Moon } from "lucide-react";

const products = [
  {
    icon: Radio,
    title: "MINDCAST LIVE",
    desc: "Weekly in-person gatherings. Inspirational talks. Guided reflection. No religion.",
  },
  {
    icon: Heart,
    title: "MINDCAST RELATIONSHIPS",
    desc: "A consent-first app for couples and families doing hard conversations.",
  },
  {
    icon: Sparkles,
    title: "LITTLE MINDS BIG QUESTIONS",
    desc: "AI-generated metaphors for the big questions kids ask parents.",
  },
  {
    icon: Moon,
    title: "MINDCAST WELLNESS",
    desc: "Cycle-synced nutrition, movement, and nervous system tools for women.",
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
        className="heading-display text-5xl md:text-7xl text-center mb-4 text-primary"
      >
        FOUR TOOLS. ONE PRACTICE.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center text-muted-foreground text-sm mb-20 max-w-xl mx-auto"
      >
        Each product works standalone. Together, they form a complete inner work system.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {products.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border-[3px] border-primary p-8 group hover:bg-primary hover:text-cream transition-colors duration-300 cursor-pointer"
          >
            <p.icon className="w-8 h-8 mb-6 text-primary group-hover:text-cream transition-colors" />
            <h3 className="font-display text-2xl tracking-wider mb-3">{p.title}</h3>
            <p className="font-body text-sm text-muted-foreground group-hover:text-cream/70 transition-colors leading-relaxed mb-6">
              {p.desc}
            </p>
            <ArrowRight className="w-5 h-5 text-primary group-hover:text-cream transition-all group-hover:translate-x-2" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Ecosystem;
