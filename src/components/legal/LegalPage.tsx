import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  eyebrow?: string;
}

const policyLinks = [
  { to: "/terms", label: "Terms of Use" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/refund", label: "Refunds & cancellations" },
  { to: "/safeguarding", label: "Safeguarding" },
  { to: "/contact", label: "Contact" },
];

export function LegalPage({ title, lastUpdated, children, eyebrow = "Mindcast policies" }: LegalPageProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <main>
        <header className="border-b border-foreground/[0.07] bg-white px-5 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pt-32">
          <div className="mx-auto max-w-6xl">
            <Link
              to="/"
              className="mb-8 inline-flex min-h-10 items-center gap-2 rounded-lg font-body text-sm font-semibold text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Mindcast
            </Link>
            <p className="portal-label mb-3">{eyebrow}</p>
            <h1 className="max-w-4xl break-words font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-5 flex items-center gap-2 font-body text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Last updated {lastUpdated}
            </p>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-16">
          <aside aria-label="Policy navigation">
            <nav className="lg:sticky lg:top-28">
              <p className="portal-label mb-3">Browse</p>
              <ul className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
                {policyLinks.map((link) => {
                  const active = pathname === link.to;
                  return (
                    <li key={link.to} className="shrink-0">
                      <Link
                        to={link.to}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center rounded-xl px-4 font-body text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                          active ? "bg-primary/[0.08] font-semibold text-primary" : "text-muted-foreground hover:bg-white hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <article
            className="min-w-0 rounded-3xl border border-foreground/[0.07] bg-white p-6 shadow-sm sm:p-9 lg:p-12"
          >
            <div className="prose prose-base max-w-none break-words
              prose-headings:scroll-mt-28 prose-headings:text-foreground prose-headings:font-serif prose-headings:font-semibold prose-headings:break-words
              prose-h2:text-2xl prose-h2:leading-tight prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:leading-tight prose-h3:mt-10 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-[1.85] prose-p:font-body prose-p:my-5
              prose-li:text-muted-foreground prose-li:font-body prose-li:leading-[1.75] prose-li:my-2.5
              prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:decoration-primary/30 prose-a:underline-offset-4 prose-a:break-words hover:prose-a:decoration-primary
              prose-strong:text-foreground prose-strong:font-semibold
              prose-hr:border-border prose-hr:my-8
              prose-ul:text-muted-foreground prose-ul:pl-5
              prose-ol:text-muted-foreground prose-ol:pl-5"
            >
              {children}
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
