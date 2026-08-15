import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { HANDBOOK } from "@/content/handbook";
import Ripple from "@/components/brand/Ripple";

// /admin/handbook — the operations handbook, on screen and printable from the
// same source (print button → browser print → PDF). Written for a nervous
// volunteer on their second Sunday; navigation is a fixed rail, content is
// numbered steps with the fallback stated where the failure happens.

const AdminHandbook = () => {
  const [active, setActive] = useState<string>(HANDBOOK[0].sections[0].id);

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))]">
      <header className="bg-[hsl(var(--navy))] text-cream px-6 py-4 flex items-center gap-4 print:hidden">
        <Link to="/admin" aria-label="Back to console" className="p-1">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl tracking-wide">OPERATIONS HANDBOOK</h1>
          <p className="font-body text-[11px] text-cream/60">
            Running a Sunday, end to end — and what to do when each system fails.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-cream/30 px-4 py-2.5 font-display tracking-widest text-sm"
        >
          <Printer size={16} /> PRINT / PDF
        </button>
      </header>

      <div className="max-w-6xl mx-auto flex gap-10 px-6 py-10">
        {/* Rail */}
        <nav className="w-64 shrink-0 sticky top-8 self-start hidden md:block print:hidden" aria-label="Handbook contents">
          {HANDBOOK.map((part) => (
            <div key={part.id} className="mb-8">
              <p className="font-display text-sm tracking-widest text-primary mb-2">{part.title.split("—")[0]}</p>
              <ul className="space-y-1">
                {part.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setActive(s.id)}
                      className={`block font-body text-sm px-3 py-2 border-l-2 transition-colors ${
                        active === s.id
                          ? "border-primary text-foreground bg-card"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Content — also the print layout */}
        <main className="flex-1 min-w-0">
          {HANDBOOK.map((part) => (
            <article key={part.id} className="mb-16 print:break-before-page first:print:break-before-auto">
              <div className="flex items-center gap-3 mb-3">
                <Ripple size={26} className="text-primary shrink-0" />
                <h2 className="font-display text-3xl md:text-4xl tracking-wide text-foreground">{part.title}</h2>
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-2xl mb-8">{part.intro}</p>

              {part.sections.map((s) => (
                <section key={s.id} id={s.id} className="mb-10 scroll-mt-6">
                  <h3 className="font-display text-xl tracking-wide text-foreground mb-3">{s.title}</h3>
                  <ol className="space-y-2.5 mb-3">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 bg-card border border-border px-4 py-3">
                        <span className="font-display text-primary text-lg leading-6 w-6 shrink-0">{i + 1}</span>
                        <span className="font-body text-sm text-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {s.fallback && (
                    <p className="font-body text-sm text-foreground border-l-4 border-primary bg-[hsl(var(--blue-light))]/40 px-4 py-3">
                      <strong className="font-semibold">If it fails:</strong> {s.fallback}
                    </p>
                  )}
                </section>
              ))}
            </article>
          ))}
        </main>
      </div>
    </div>
  );
};

export default AdminHandbook;
