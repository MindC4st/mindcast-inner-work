import { ApplyForm } from "@/components/apply/ApplyForm";

export default function Apply() {
  const handleShowInterest = (ageBand: "under_30" | "over_45" | "after_close") => {
    console.log("Interest registered for age band:", ageBand);
  };

  return (
    <div className="min-h-screen bg-background py-12 md:py-20 px-4 md:px-6">
      <header className="max-w-2xl mx-auto mb-12 text-center">
        <img
          src="/logo-blue-wordmark.png"
          alt="Mindcast"
          className="h-10 md:h-12 mx-auto mb-6"
        />
        <p className="font-display text-2xl md:text-3xl tracking-widest text-primary">
          TAUPŌ · PILOT GROUP · 2026
        </p>
      </header>

      <main className="max-w-2xl mx-auto">
        <ApplyForm onShowInterest={handleShowInterest} />
      </main>

      <footer className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Questions? <a href="/contact" className="underline hover:text-foreground">Contact us</a>
        </p>
      </footer>
    </div>
  );
}