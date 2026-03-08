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
          className="text-silver/50 text-sm mb-12 tracking-wide"
        >
          First 100 members shape the community.
        </motion.p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-silver"
          >
            <p className="font-display text-3xl mb-2">YOU'RE IN.</p>
            <p className="text-silver/60 text-sm">We'll be in touch soon.</p>
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
              className="w-full bg-transparent border-2 border-silver/30 text-silver px-6 py-4 text-sm tracking-widest placeholder:text-silver/30 focus:border-silver focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-silver/30 text-silver px-6 py-4 text-sm tracking-widest placeholder:text-silver/30 focus:border-silver focus:outline-none transition-colors"
            />
            <button type="submit" className="btn-filled w-full text-xs">
              JOIN THE WAITLIST
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default Waitlist;
