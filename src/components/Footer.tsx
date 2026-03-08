import { Link } from "react-router-dom";

const links = [
  { label: "LIVE", to: "/live" },
  { label: "RESOURCES", to: "/resources" },
  { label: "MEMBERSHIP", to: "/membership" },
  { label: "ECOSYSTEM", to: "/ecosystem" },
  { label: "ABOUT", to: "/about" },
  { label: "PORTAL", to: "/portal" },
];

const Footer = () => (
  <footer className="section-navy border-t-[3px] border-silver/20 py-16">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-12 mb-12">
        <div>
          <span className="font-display text-2xl tracking-widest text-silver block mb-3">MINDCAST</span>
          <p className="text-silver/40 text-xs tracking-wider leading-relaxed">
            Not therapy. Not religion.<br />A structured life practice.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-xs tracking-widest text-silver/40 hover:text-silver transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="text-right">
          <p className="text-silver/40 text-xs tracking-wider mb-2">AUCKLAND, NZ</p>
          <div className="flex gap-4 justify-end">
            <span className="text-silver/30 text-xs tracking-wider">INSTAGRAM</span>
            <span className="text-silver/30 text-xs tracking-wider">PODCAST</span>
          </div>
        </div>
      </div>
      <p className="text-center text-silver/20 text-xs tracking-wider">
        © 2026 MINDCAST. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
