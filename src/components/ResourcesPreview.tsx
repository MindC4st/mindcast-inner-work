import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ImagePlaceholder from "./ImagePlaceholder";

const resources = [
  { title: "THE WEEKLY REFLECTION KIT", price: "$12" },
  { title: "HARD CONVERSATION GUIDE", price: "$18" },
  { title: "NERVOUS SYSTEM RESET", price: "$12" },
];

const ResourcesPreview = () => (
  <section className="section-white py-24 md:py-32">
    <div className="container mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="heading-display text-5xl md:text-7xl text-center mb-4 text-primary"
      >
        TOOLS YOU KEEP
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center text-muted-foreground text-sm mb-16 max-w-xl mx-auto"
      >
        Every live session comes with a companion worksheet. Each one is a standalone inner work practice.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        {resources.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="border-[3px] border-primary p-6"
          >
            <ImagePlaceholder label="Worksheet mockup A4 format" className="w-full h-48 mb-6" />
            <h3 className="font-display text-lg tracking-wider mb-2 text-primary">{r.title}</h3>
            <p className="font-display text-2xl text-primary mb-4">{r.price}</p>
            <button className="btn-navy text-xs w-full py-3">ADD TO CART</button>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/resources" className="btn-navy text-xs">BROWSE ALL RESOURCES</Link>
      </div>
    </div>
  </section>
);

export default ResourcesPreview;
