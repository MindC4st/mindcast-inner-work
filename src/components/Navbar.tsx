import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/">
          <img src={logoWhite} alt="Mindcast" className="h-6" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-xs font-medium tracking-widest transition-colors ${
                location.pathname === link.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-background border-t border-border/10 px-6 pb-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`block py-3 text-xs tracking-widest ${
                location.pathname === link.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
