import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "LIVE", to: "/live" },
  { label: "RESOURCES", to: "/resources" },
  { label: "MEMBERSHIP", to: "/membership" },
  { label: "ECOSYSTEM", to: "/ecosystem" },
  { label: "ABOUT", to: "/about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 section-navy border-b-2 border-silver/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="font-display text-2xl tracking-widest text-silver">MINDCAST</Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-xs font-medium tracking-widest transition-colors ${
                location.pathname === link.to ? "text-silver" : "text-silver/50 hover:text-silver"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/portal" className="btn-outlined text-xs py-2 px-6">MEMBER LOGIN</Link>
          <Link to="/membership" className="btn-filled text-xs py-2 px-6">JOIN NOW</Link>
        </div>

        <button
          className="lg:hidden text-silver"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden section-navy border-t border-silver/10 px-6 pb-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`block py-3 text-xs tracking-widest ${
                location.pathname === link.to ? "text-silver" : "text-silver/50 hover:text-silver"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Link to="/portal" className="btn-outlined text-xs py-2 px-6" onClick={() => setMobileOpen(false)}>MEMBER LOGIN</Link>
            <Link to="/membership" className="btn-filled text-xs py-2 px-6" onClick={() => setMobileOpen(false)}>JOIN NOW</Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
