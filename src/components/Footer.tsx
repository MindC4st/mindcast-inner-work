import { Link } from "react-router-dom";
import logoTagline from "@/assets/logo-dark-tagline.png";

const links = [
  { label: "LIVE", to: "/live" },
  { label: "RESOURCES", to: "/resources" },
  { label: "MEMBERSHIP", to: "/membership" },
  { label: "ECOSYSTEM", to: "/ecosystem" },
  { label: "ABOUT", to: "/about" },
  { label: "PORTAL", to: "/portal" },
];

const Footer = () => (
  <footer className="bg-background border-t border-border/10 py-16">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-12 mb-12">
        <div>
          <img src={logoTagline} alt="Mindcast — Tune Into Your Inner Self" className="h-10 mb-3" />
          <p className="text-muted-foreground text-xs tracking-wider leading-relaxed">
            Not therapy. Not religion.<br />A structured life practice.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs tracking-wider mb-2">AUCKLAND, NZ</p>
          <div className="flex gap-4 justify-end">
            <span className="text-muted-foreground/60 text-xs tracking-wider">INSTAGRAM</span>
            <span className="text-muted-foreground/60 text-xs tracking-wider">PODCAST</span>
          </div>
        </div>
      </div>
      {/* Legal links */}
      <div className="border-t border-border/10 mt-8 pt-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          {[
            { label: "Terms of Use", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Refund Policy", href: "/refund" },
            { label: "Child Safety", href: "/safeguarding" },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-muted-foreground/40 text-xs hover:text-muted-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-muted-foreground/40 text-xs text-center mt-4 tracking-wider">
          © {new Date().getFullYear()} MINDCAST. All rights reserved. New Zealand.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
