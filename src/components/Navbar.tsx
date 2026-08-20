import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoBlue from "@/assets/logo-blue-wordmark.png";

// Site navbar for every non-home page: ivory surface, blue wordmark, blue
// accent. (The homepage carries its own dark CinematicNav.)

const navLinks = [
  { label: "ABOUT", to: "/about" },
  { label: "CURRICULUM", to: "/curriculum" },
  { label: "MEMBERSHIP", to: "/membership" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" aria-label="Mindcast home">
          <img src={logoBlue} alt="Mindcast" className="h-7" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-xs font-extrabold tracking-widest transition-colors font-body ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/portal/login"
            className="text-xs font-body font-extrabold tracking-widest text-primary border border-primary/30 hover:border-primary transition-colors py-2 px-6"
          >
            MEMBER LOGIN
          </Link>
          <Link
            to="/membership"
            className="text-xs font-body font-extrabold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-2 px-6"
          >
            BECOME A MEMBER
          </Link>
        </div>

        <button
          className="lg:hidden text-foreground w-11 h-11 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden px-6 pb-6 bg-background border-t border-border"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`block py-3 text-xs tracking-widest font-body font-extrabold ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground/70 hover:text-foreground"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Link to="/portal/login" className="text-xs font-body font-extrabold tracking-widest text-primary border border-primary/30 py-2 px-6" onClick={() => setMobileOpen(false)}>
              MEMBER LOGIN
            </Link>
            <Link to="/membership" className="text-xs font-body font-extrabold tracking-widest bg-primary text-primary-foreground py-2 px-6" onClick={() => setMobileOpen(false)}>
              BECOME A MEMBER
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
