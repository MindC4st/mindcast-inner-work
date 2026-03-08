import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = ["LIVE", "RELATIONSHIPS", "LITTLE MINDS", "WELLNESS", "MEMBERSHIP"];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 section-navy border-b-2 border-silver/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <a href="#" className="font-display text-2xl tracking-widest text-silver">MINDCAST</a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
              className="text-xs font-medium tracking-widest text-silver/70 hover:text-silver transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        <a href="#waitlist" className="hidden md:block btn-outlined text-xs py-2 px-6">
          JOIN WAITLIST
        </a>

        <button
          className="md:hidden text-silver"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden section-navy border-t border-silver/10 px-6 pb-6"
        >
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
              className="block py-3 text-xs tracking-widest text-silver/70 hover:text-silver"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
          <a href="#waitlist" className="btn-outlined text-xs py-2 px-6 inline-block mt-4">
            JOIN WAITLIST
          </a>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
