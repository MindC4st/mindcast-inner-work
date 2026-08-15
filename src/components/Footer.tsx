import { Link } from "react-router-dom";
import logoCream from "@/assets/logo-cream.png";
import logoBlue from "@/assets/logo-blue-wordmark.png";

// Footer — light (ivory + blue wordmark) is the default everywhere; the dark
// variant exists only for the homepage's cinematic canvas.

type FooterProps = { variant?: "light" | "dark" };

const LINKS = {
  explore: [
    { to: "/about", label: "About" },
    { to: "/membership", label: "Membership" },
    { to: "/portal/login", label: "Member Sign In" },
  ],
  legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
    { to: "/refund", label: "Refund Policy" },
    { to: "/safeguarding", label: "Child Safety" },
  ],
};

const Footer = ({ variant = "light" }: FooterProps) => {
  const dark = variant === "dark";
  const base = dark ? "surface-dark border-t border-cream/10" : "bg-background border-t border-border";
  const head = dark ? "text-cream/60" : "text-foreground/70";
  const link = dark
    ? "text-cream/30 hover:text-cream/60"
    : "text-muted-foreground/80 hover:text-foreground";
  const fine = dark ? "text-cream/20" : "text-muted-foreground/60";

  return (
    <footer className={`relative ${base}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <img src={dark ? logoCream : logoBlue} alt="Mindcast" className="h-8 mb-3" />
            <p className={`text-xs font-body leading-relaxed mt-2 ${link}`}>
              Taupō, New Zealand
              <br />
              mindcast.co.nz
            </p>
          </div>

          <div>
            <h4 className={`text-[11px] tracking-[0.15em] font-body font-bold mb-4 ${head}`}>EXPLORE</h4>
            <div className="flex flex-col gap-2">
              {LINKS.explore.map((l) => (
                <Link key={l.to} to={l.to} className={`text-xs font-body transition-colors ${link}`}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-[11px] tracking-[0.15em] font-body font-bold mb-4 ${head}`}>CONNECT</h4>
            <div className="flex flex-col gap-2">
              <a href="https://www.instagram.com/mindcastnz/" target="_blank" rel="noopener noreferrer" className={`text-xs font-body transition-colors ${link}`}>Instagram</a>
              <a href="mailto:hello@mindcast.co.nz" className={`text-xs font-body transition-colors ${link}`}>Contact</a>
            </div>
          </div>

          <div>
            <h4 className={`text-[11px] tracking-[0.15em] font-body font-bold mb-4 ${head}`}>LEGAL</h4>
            <div className="flex flex-col gap-2">
              {LINKS.legal.map((l) => (
                <Link key={l.to} to={l.to} className={`text-xs font-body transition-colors ${link}`}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className={`pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t ${dark ? "border-cream/10" : "border-border"}`}>
          <p className={`text-[10px] font-body tracking-wider ${fine}`}>
            © {new Date().getFullYear()} Mindcast. Built with intention.
          </p>
          <span className="font-display text-[12px] tracking-[0.2em] text-primary">
            NOTICE IT, NAME IT, DO IT
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
