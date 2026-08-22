import { ApplyForm } from "@/components/apply/ApplyForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function Apply() {
  const handleShowInterest = (ageBand: "under_30" | "over_45" | "after_close") => {
    console.log("Interest registered for age band:", ageBand);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader variant="minimal" />

      <main>
        <section className="linen-panel relative overflow-hidden border-x-0 border-t-0 px-5 pb-14 pt-28 sm:px-8 md:pt-32">
          <header className="mx-auto max-w-3xl">
            <p className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              TAUPŌ · PILOT GROUP · 2026
            </p>
            <h1 className="font-display text-5xl leading-[0.95] tracking-wide text-foreground sm:text-6xl">
              APPLY FOR THE PILOT GROUP
            </h1>
            <p className="mt-5 max-w-xl font-body text-sm leading-7 text-muted-foreground sm:text-base">
              Ten Tuesday nights in Taupō. Nine places. Applications close 9am,
              Tuesday 29 September.
            </p>
          </header>
        </section>

        <div className="px-4 pb-16 pt-10 sm:px-6 md:pb-24">
          <div className="paper-card mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-12">
            <ApplyForm onShowInterest={handleShowInterest} />
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <p className="font-body text-sm text-muted-foreground">
              Questions?{" "}
              <a
                href="/contact"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
