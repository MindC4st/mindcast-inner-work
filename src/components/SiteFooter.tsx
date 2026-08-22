import { Link } from "react-router-dom";
import logoBlue from "@/assets/logo-blue-wordmark.png";

// The one site footer, used by every public route. Ivory ground, blue
// wordmark, navy text — the permitted navy strip is the bottom rule only.

const LINKS = {
  explore: [
    { to: "/about", label: "About" },
    { to: "/curriculum", label: "Curriculum" },
    { to: "/membership", label: "Membership" },
    { to: "/auth", label: "Member Sign In" },
  ],
  legal: [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Use" },
    { to: "/refund", label: "Refund Policy" },
    { to: "/safeguarding", label: "Child Safety" },
  ],
};

const SiteFooter = () => (
  <footer className="relative border-t border-border bg-background">
    <div className="container mx-auto px-6 py-16">
      <div className="mb-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={logoBlue} alt="Mindcast" className="mb-3 h-8" />
          <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground/80">
            Taupō, New Zealand
            <br />
            mindcast.co.nz
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[11px] font-bold tracking-[0.15em] text-foreground/70">
            EXPLORE
          </h4>
          <div className="flex flex-col gap-2">
            {LINKS.explore.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-body text-xs text-muted-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[11px] font-bold tracking-[0.15em] text-foreground/70">
            CONNECT
          </h4>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.instagram.com/mindcastnz/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-muted-foreground/80 transition-colors hover:text-foreground"
            >
              Instagram
            </a>
            <a
              href="mailto:hello@mindcast.co.nz"
              className="font-body text-xs text-muted-foreground/80 transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-body text-[11px] font-bold tracking-[0.15em] text-foreground/70">
            LEGAL
          </h4>
          <div className="flex flex-col gap-2">
            {LINKS.legal.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-body text-xs text-muted-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
        <p className="font-body text-[10px] tracking-wider text-muted-foreground/60">
          © {new Date().getFullYear()} Mindcast. Built with intention.
        </p>
        <span className="font-display text-[12px] tracking-[0.2em] text-primary">
          NOTICE IT, NAME IT, DO IT
        </span>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
