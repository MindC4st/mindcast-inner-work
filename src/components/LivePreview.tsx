import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ImagePlaceholderDark } from "./ImagePlaceholder";

const LivePreview = () => (
  <section className="section-navy py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="block text-silver/40 text-xs tracking-[0.3em] mb-4"
      >
        EVERY WEEK
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl mb-16"
      >
        THE GATHERING
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <ImagePlaceholderDark label="Community seated in an intimate venue listening to a speaker" className="w-full h-72 md:h-96" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-silver/70 font-body text-base leading-relaxed mb-8">
            A weekly in-person event in Auckland. One talk. One practice. One community. Doors open Sunday evenings.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {["20-MIN TALK", "GUIDED REFLECTION", "COMMUNITY CONNECT"].map((pill) => (
              <span key={pill} className="border-2 border-silver/20 text-silver/60 text-xs tracking-widest px-4 py-2">
                {pill}
              </span>
            ))}
          </div>
          <Link to="/live" className="btn-outlined text-xs">SEE UPCOMING SESSIONS</Link>
        </motion.div>
      </div>
    </div>
  </section>
);

export default LivePreview;
