import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoBlue from "@/assets/logo-blue-wordmark.png";

// The one site header, used by every public route.
// Ivory ground, navy text, Signal Blue active underline, hairline on scroll —
// no shadow, no blur. `variant="minimal"` (Auth/Apply) drops the nav and CTAs:
// someone signing in has already decided; the header's only jobs are a route
// home and a way to ask for help.

const NAV_ITEMS = [
  { label: "ABOUT", to: "/about" },
  { label: "CURRICULUM", to: "/curriculum" },
  { label: "SHOP", to: "/shop" },
  { label: "MEMBERSHIP", to: "/membership" },
] as const;

const isActiveRoute = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

type SiteHeaderProps = {
  variant?: "full" | "minimal";
};

const SiteHeader = ({ variant = "full" }: SiteHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel when the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const hairline =
    scrolled || mobileOpen ? "border-border" : "border-transparent";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b bg-background transition-colors duration-200 ${hairline}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="Mindcast home"
          className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <img
            src={logoBlue}
            alt="Mindcast"
            className="h-7 w-auto sm:h-8"
            width={286}
            height={48}
          />
        </Link>

        {variant === "minimal" ? (
          <a
            href="mailto:hello@mindcast.co.nz"
            className="inline-flex min-h-11 items-center rounded-md px-2 font-body text-[11px] font-bold tracking-[0.18em] text-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            NEED HELP?
          </a>
        ) : (
          <>
            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Main navigation"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActiveRoute(pathname, item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className="group relative inline-flex min-h-11 items-center px-4 font-body text-[11px] font-bold tracking-[0.18em] text-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {item.label}

                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 bottom-2 h-0.5 origin-left bg-primary transition-transform duration-200 ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                to="/auth"
                className="inline-flex min-h-11 items-center border border-primary/30 px-5 font-body text-[11px] font-bold tracking-[0.18em] text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                MEMBER LOGIN
              </Link>
              <Link
                to="/membership"
                className="inline-flex min-h-11 items-center bg-primary px-5 font-body text-[11px] font-bold tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                BECOME A MEMBER
              </Link>
            </div>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {variant === "full" && mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          aria-label="Main navigation"
          className="border-t border-border bg-background px-4 pb-6 sm:px-6 lg:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`block border-b border-border/60 py-3.5 font-body text-xs font-bold tracking-[0.18em] text-foreground ${
                  active ? "border-b-primary" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex min-h-11 items-center justify-center border border-primary/30 px-5 font-body text-[11px] font-bold tracking-[0.18em] text-primary"
              onClick={() => setMobileOpen(false)}
            >
              MEMBER LOGIN
            </Link>
            <Link
              to="/membership"
              className="inline-flex min-h-11 items-center justify-center bg-primary px-5 font-body text-[11px] font-bold tracking-[0.18em] text-primary-foreground"
              onClick={() => setMobileOpen(false)}
            >
              BECOME A MEMBER
            </Link>
          </div>
        </motion.nav>
      )}
    </header>
  );
};

export default SiteHeader;
