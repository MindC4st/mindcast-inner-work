import { motion } from "framer-motion";
import { useState } from "react";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) setSubmitted(true);
  };

  return (
    <section id="waitlist" className="section-navy py-24 md:py-32">
      <div className="container mx-auto px-6 max-w-xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="heading-display text-5xl md:text-6xl mb-4"
        >
          BE A FOUNDING MEMBER
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-cream/50 text-sm mb-12 tracking-wide"
        >
          The first 100 members shape the community, the format, and the culture.
        </motion.p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-cream"
          >
            <p className="font-display text-3xl mb-2">YOU'RE IN.</p>
            <p className="text-cream/60 text-sm">We'll be in touch soon.</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="FIRST NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-cream/30 text-cream px-6 py-4 text-sm tracking-widest placeholder:text-cream/30 focus:border-cream focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-cream/30 text-cream px-6 py-4 text-sm tracking-widest placeholder:text-cream/30 focus:border-cream focus:outline-none transition-colors"
            />
            <button type="submit" className="btn-filled w-full text-xs">
              JOIN THE FOUNDING COMMUNITY
            </button>
            <p className="text-cream/30 text-xs tracking-wide">No spam. Just MINDCAST.</p>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default Waitlist;
