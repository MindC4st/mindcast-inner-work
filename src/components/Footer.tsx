import { Link } from "react-router-dom";
import logoLight from "@/assets/logo-light-tagline.png";

const Footer = () => (
  <footer className="section-navy relative" style={{ borderTop: "1px solid rgba(53,133,175,0.2)" }}>
    <div className="container mx-auto px-6 py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* 1 — Brand */}
        <div>
          <img src={logoLight} alt="Mindcast" className="h-10 mb-3" />
          <p className="text-white/40 text-xs font-body leading-relaxed mt-2">
            Taupo, New Zealand<br />mindcast.co.nz
          </p>
        </div>

        {/* 2 — Products */}
        <div>
          <h4 className="text-white/60 text-[11px] tracking-[0.15em] font-body font-bold mb-4">PRODUCTS</h4>
          <div className="flex flex-col gap-2">
            <span className="text-white/30 text-xs font-body">Signal <span className="text-white/15">(coming soon)</span></span>
            <Link to="/membership" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Pilot Group</Link>
            <span className="text-white/30 text-xs font-body">Little Minds</span>
          </div>
        </div>

        {/* 3 — Connect */}
        <div>
          <h4 className="text-white/60 text-[11px] tracking-[0.15em] font-body font-bold mb-4">CONNECT</h4>
          <div className="flex flex-col gap-2">
            <a href="https://instagram.com/signalbymindcast" target="_blank" rel="noopener noreferrer" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Instagram</a>
            <a href="#" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Facebook</a>
            <a href="mailto:hello@mindcast.co.nz" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>

        {/* 4 — Legal */}
        <div>
          <h4 className="text-white/60 text-[11px] tracking-[0.15em] font-body font-bold mb-4">LEGAL</h4>
          <div className="flex flex-col gap-2">
            <Link to="/privacy" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Terms of Use</Link>
            <Link to="/refund" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Refund Policy</Link>
            <Link to="/safeguarding" className="text-white/30 text-xs font-body hover:text-white/60 transition-colors">Child Safety</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-white/20 text-[10px] font-body tracking-wider">
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
