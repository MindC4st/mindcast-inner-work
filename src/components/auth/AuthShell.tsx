import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import logoLight from "@/assets/logo-blue-wordmark.png";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  asideTitle?: string;
  asideCopy?: string;
};

export const authFieldClass =
  "mt-2 w-full rounded-xl border border-foreground/10 bg-white px-4 py-3.5 font-body text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/45 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

export const authPrimaryButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-45";

const AuthShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
  asideTitle = "NOTICE IT.\nNAME IT.\nDO IT.",
  asideCopy = "A 52-week journey built around one simple practice: notice what is happening, name it honestly, then take one small action.",
}: AuthShellProps) => (
  <main className="min-h-screen bg-ivory lg:grid lg:grid-cols-[minmax(340px,0.85fr)_minmax(560px,1.15fr)]">
    <aside className="relative hidden min-h-screen overflow-hidden bg-navy px-12 py-12 text-cream lg:flex lg:flex-col lg:justify-between xl:px-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 15% 10%, hsl(var(--blue) / .42), transparent 40%), radial-gradient(circle at 90% 85%, hsl(var(--primary) / .24), transparent 42%)",
        }}
      />
      <Link to="/" className="relative inline-flex w-fit rounded-sm focus:outline-none focus:ring-2 focus:ring-cream/70">
        <img src={logoLight} alt="Mindcast home" className="h-9 brightness-0 invert" />
      </Link>

      <div className="relative max-w-md pb-10">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.06] text-blue-light">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="whitespace-pre-line font-serif text-5xl leading-[1.03] text-cream">{asideTitle}</h2>
        <p className="mt-6 max-w-sm font-body text-sm leading-7 text-cream/60">{asideCopy}</p>
      </div>

      <p className="relative flex items-center gap-3 border-t border-cream/10 pt-6 font-body text-xs leading-5 text-cream/45">
        <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
        Secure member access powered by Mindcast.
      </p>
    </aside>

    <section className="flex min-h-screen flex-col px-5 pb-8 pt-6 sm:px-8 lg:px-14 lg:py-10 xl:px-24">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between">
        <Link to="/" className="rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden">
          <img src={logoLight} alt="Mindcast home" className="h-8" />
        </Link>
        <Link
          to="/contact"
          className="ml-auto inline-flex min-h-10 items-center rounded-lg px-2 font-body text-xs font-semibold text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          Need help?
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 items-center py-10 sm:py-14">
        <div className="w-full">
          <p className="portal-label mb-3">{eyebrow}</p>
          <h1 className="font-serif text-4xl leading-tight text-primary sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-lg font-body text-sm leading-7 text-muted-foreground">{description}</p>
          <div className="mt-9">{children}</div>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-xl border-t border-foreground/[0.07] pt-5 font-body text-xs leading-5 text-muted-foreground">
        {footer ?? (
          <>
            By continuing, you agree to our <Link to="/terms" className="font-semibold text-foreground underline underline-offset-4">Terms</Link> and <Link to="/privacy" className="font-semibold text-foreground underline underline-offset-4">Privacy Policy</Link>.
          </>
        )}
      </footer>
    </section>
  </main>
);

export default AuthShell;