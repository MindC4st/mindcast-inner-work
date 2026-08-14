import { Link } from "react-router-dom";
import logoLight from "@/assets/logo-cream.png";

const Footer = () => (
  <footer className="section-navy relative" style={{ borderTop: "1px solid rgba(53,133,175,0.2)" }}>
    <div className="container mx-auto px-6 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* 1 — Brand */}
        <div>
          <img src={logoLight} alt="Mindcast" className="h-10 mb-3" />
          <p className="text-cream/40 text-xs font-body leading-relaxed mt-2">
            Taupō, New Zealand<br />mindcast.co.nz
          </p>
        </div>

        {/* 2 — Explore */}
        <div>
          <h4 className="text-cream/60 text-[11px] tracking-[0.15em] font-body font-bold mb-4">EXPLORE</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">About</Link>
            <Link to="/membership" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Membership</Link>
            <Link to="/portal/login" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Member Sign In</Link>
          </div>
        </div>

        {/* 3 — Connect */}
        <div>
          <h4 className="text-cream/60 text-[11px] tracking-[0.15em] font-body font-bold mb-4">CONNECT</h4>
          <div className="flex flex-col gap-2">
            <a href="https://www.instagram.com/mindcastnz/" target="_blank" rel="noopener noreferrer" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Instagram</a>
            <a href="mailto:hello@mindcast.co.nz" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Contact</a>
          </div>
        </div>

        {/* 4 — Legal */}
        <div>
          <h4 className="text-cream/60 text-[11px] tracking-[0.15em] font-body font-bold mb-4">LEGAL</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Terms of Use</Link>
            <Link to="/refund" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Refund Policy</Link>
            <Link to="/safeguarding" className="text-cream/30 text-xs font-body hover:text-cream/60 transition-colors">Child Safety</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-cream/20 text-[10px] font-body tracking-wider">
          © {new Date().getFullYear()} Mindcast. Built with intention.
        </p>
        <span className="text-[12px] tracking-[0.2em]" style={{ fontFamily: "var(--font-display)", color: "#3585af" }}>
          INNER WORK FOR REAL LIFE
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
