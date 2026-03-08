const links = [
  { label: "MINDCAST LIVE", href: "#live" },
  { label: "RELATIONSHIPS", href: "#relationships" },
  { label: "LITTLE MINDS", href: "#little-minds" },
  { label: "WELLNESS", href: "#wellness" },
  { label: "MEMBERSHIP", href: "#membership" },
];

const Footer = () => (
  <footer className="section-navy border-t-2 border-silver/10 py-16">
    <div className="container mx-auto px-6">
      <div className="flex flex-wrap gap-8 justify-center mb-10">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-xs tracking-widest text-silver/40 hover:text-silver transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
      <p className="text-center text-silver/30 text-xs tracking-widest leading-relaxed">
        Not therapy. Not religion. A structured life practice.
      </p>
      <p className="text-center text-silver/20 text-xs tracking-wider mt-4">
        © 2026 MINDCAST
      </p>
    </div>
  </footer>
);

export default Footer;
