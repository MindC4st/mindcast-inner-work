import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";

// The binder opening. Signing in is the weekly ritual of opening your Life
// Binder: linen room light, one paper page with punched ring holes and an
// index tab, fields ruled like a worksheet, one Signal Blue action.
// No navy slab, no stock reassurance copy — arriving somewhere, not passing
// a security desk.

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Worksheet field: a ruled line on paper, not a boxed input. Focus thickens
 *  the rule to Signal Blue (border + shadow = 2px indicator). */
export const authFieldClass =
  "mt-2 w-full rounded-none border-0 border-b border-[var(--paper-edge)] bg-transparent px-1 py-3 font-body text-base text-foreground outline-none transition placeholder:text-muted-foreground/45 focus:border-primary focus:shadow-[0_1px_0_hsl(var(--blue))] disabled:cursor-not-allowed disabled:opacity-50";

export const authPrimaryButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 bg-primary px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

const RING_HOLES = [0, 1, 2] as const;

// The practice, written on the page the way it is written on every worksheet.
const PRACTICE_LINE = "NOTICE IT.\nNAME IT.\nDO IT.";

const AuthShell = ({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) => (
  <div className="curriculum-room min-h-screen">
    <SiteHeader variant="minimal" />

    <main className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24 sm:px-6">
      <div className="w-full max-w-xl">
        {/* Index tab, sitting proud of the page edge. */}
        <div className="relative z-10 -mb-px ml-6 inline-flex">
          <span className="binder-tab-top inline-flex min-h-9 items-center px-5 pb-1.5 pt-2 font-body text-[10px] font-bold uppercase tracking-[0.22em]">
            {eyebrow}
          </span>
        </div>

        <section className="paper-card relative overflow-hidden rounded-tl-none px-6 py-10 sm:px-12 sm:py-12">
          {/* Punched ring holes down the bound edge. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-4 hidden flex-col justify-center gap-16 sm:flex"
            aria-hidden="true"
          >
            {RING_HOLES.map((hole) => (
              <span
                key={hole}
                className="h-4 w-4 rounded-full bg-[var(--ivory-deep)] shadow-[inset_0_2px_4px_rgba(96,70,35,0.28),0_1px_0_rgba(255,255,255,0.85)]"
              />
            ))}
          </div>

          {/* Worksheet margin rule. */}
          <div
            className="pointer-events-none absolute inset-y-6 left-11 hidden w-px bg-[var(--paper-edge)] sm:block"
            aria-hidden="true"
          />

          <div className="sm:pl-10">
            <div className="flex items-start justify-between gap-6">
              <p
                className="emboss select-none font-display text-4xl leading-none tracking-[0.14em]"
                aria-hidden="true"
              >
                MINDCAST
              </p>

              <p className="hidden whitespace-pre-line text-right font-display text-sm leading-snug tracking-[0.18em] text-foreground/60 sm:block">
                {PRACTICE_LINE}
              </p>
            </div>

            <h1 className="mt-5 font-serif text-4xl leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg font-body text-sm leading-7 text-muted-foreground">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            <footer className="mt-10 border-t border-[var(--paper-edge)] pt-5 font-body text-xs leading-5 text-muted-foreground">
              {footer ?? (
                <>
                  By continuing, you agree to our{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                  .
                </>
              )}
            </footer>
          </div>
        </section>
      </div>
    </main>
  </div>
);

export default AuthShell;
