import { ApplyForm } from "@/components/apply/ApplyForm";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function Apply() {
  const handleShowInterest = (ageBand: "under_30" | "over_45" | "after_close") => {
    console.log("Interest registered for age band:", ageBand);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader variant="minimal" />

      <div className="px-4 pb-12 pt-28 md:px-6 md:pb-20 md:pt-32">
        <header className="max-w-2xl mx-auto mb-12 text-center">
          <p className="font-display text-2xl md:text-3xl tracking-widest text-primary">
            TAUPŌ · PILOT GROUP · 2026
          </p>
        </header>

        <main className="max-w-2xl mx-auto">
          <ApplyForm onShowInterest={handleShowInterest} />
        </main>

        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? <a href="/contact" className="underline hover:text-foreground">Contact us</a>
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
