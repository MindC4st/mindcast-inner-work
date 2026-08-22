import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-5 pb-16 pt-28 sm:px-8">
        <div className="paper-card w-full max-w-lg px-8 py-12 text-center sm:px-12">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.32em] text-[hsl(var(--silver))]">
            404 · Page not found
          </p>

          <h1 className="mt-4 font-display text-6xl tracking-wide text-foreground sm:text-7xl">
            THIS PAGE ISN&apos;T IN THE BINDER.
          </h1>

          <p className="mt-5 font-body text-sm leading-7 text-muted-foreground">
            The address may have changed, or the link was mistyped. Everything
            current is reachable from the pages below.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center bg-primary px-6 font-body text-[11px] font-bold tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              BACK TO HOME
            </Link>
            <Link
              to="/curriculum"
              className="inline-flex min-h-11 items-center border border-primary/30 px-6 font-body text-[11px] font-bold tracking-[0.18em] text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              SEE THE CURRICULUM
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default NotFound;
