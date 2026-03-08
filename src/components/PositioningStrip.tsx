import { motion } from "framer-motion";

const labels = [
  { text: "NOT THERAPY", bold: false },
  { text: "NOT RELIGION", bold: false },
  { text: "NOT SELF-HELP", bold: false },
  { text: "A STRUCTURED LIFE PRACTICE", bold: true },
];

const PositioningStrip = () => (
  <section className="section-white py-12 border-y-2 border-primary">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-wrap justify-between items-center gap-6"
      >
        {labels.map((label, i) => (
          <span
            key={i}
            className={`font-display text-xl md:text-2xl tracking-widest ${
              label.bold ? "text-primary" : "text-primary/50"
            }`}
          >
            {label.text}
          </span>
        ))}
      </motion.div>
    </div>
  </section>
);

export default PositioningStrip;
