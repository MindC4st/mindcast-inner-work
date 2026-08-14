import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoNavLight from "@/assets/logo-cream.png";

const navLinks = [
  { label: "ABOUT", to: "/about" },
  { label: "MEMBERSHIP", to: "/pilot" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b" style={{ background: "rgba(15,30,53,0.92)", borderColor: "rgba(53,133,175,0.15)" }}>
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/">
          <img src={logoNavLight} alt="Mindcast" className="h-8" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-xs font-extrabold tracking-widest transition-colors font-body ${
                location.pathname === link.to ? "text-cream" : "text-cream/50 hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/portal/login" className="text-xs font-body font-extrabold tracking-widest text-cream/50 hover:text-cream transition-colors py-2 px-6 border border-cream/20 hover:border-cream/40">MEMBER LOGIN</Link>
          <Link to="/membership" className="text-xs font-body font-extrabold tracking-widest text-navy bg-cream hover:bg-cream/90 transition-colors py-2 px-6" style={{ color: "hsl(210,56%,14%)" }}>BECOME A MEMBER</Link>
        </div>

        <button
          className="lg:hidden text-cream"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden px-6 pb-6"
          style={{ background: "rgba(15,30,53,0.95)", borderTop: "1px solid rgba(53,133,175,0.1)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`block py-3 text-xs tracking-widest font-body font-extrabold ${
                location.pathname === link.to ? "text-cream" : "text-cream/50 hover:text-cream"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Link to="/portal/login" className="text-xs font-body font-extrabold tracking-widest text-cream/50 border border-cream/20 py-2 px-6" onClick={() => setMobileOpen(false)}>MEMBER LOGIN</Link>
            <Link to="/membership" className="text-xs font-body font-extrabold tracking-widest bg-cream py-2 px-6" style={{ color: "hsl(210,56%,14%)" }} onClick={() => setMobileOpen(false)}>BECOME A MEMBER</Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
