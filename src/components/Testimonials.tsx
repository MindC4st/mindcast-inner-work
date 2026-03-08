import { motion } from "framer-motion";
import { ImagePlaceholderDark } from "./ImagePlaceholder";

const testimonials = [
  {
    quote: "MINDCAST gave me the language I never had for what I was feeling. It changed how I show up for my family.",
    name: "FOUNDING MEMBER, AUCKLAND",
  },
  {
    quote: "I've done therapy for years. This is the first thing that gave me a daily practice I actually stuck with.",
    name: "FOUNDING MEMBER, AUCKLAND",
  },
  {
    quote: "The community alone is worth it. Knowing other people are doing the work too — it makes all the difference.",
    name: "FOUNDING MEMBER, AUCKLAND",
  },
];

const Testimonials = () => (
  <section className="section-navy py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-20"
      >
        FROM THE COMMUNITY
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border-2 border-silver/20 p-8"
          >
            <p className="text-silver/70 font-body text-sm leading-relaxed mb-8 italic">"{t.quote}"</p>
            <div className="flex items-center gap-4">
              <ImagePlaceholderDark label="Portrait" className="w-12 h-12 flex-shrink-0" />
              <span className="text-silver/40 text-xs tracking-widest">{t.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
