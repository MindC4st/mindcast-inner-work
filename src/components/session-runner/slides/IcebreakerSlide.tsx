import { Sparkles } from "lucide-react";

const IcebreakerSlide = () => (
  <div className="h-full flex flex-col items-center justify-center px-12 text-center">
    <Sparkles size={32} className="text-[hsl(var(--bronze))] mb-6" strokeWidth={1.5} />
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-6 uppercase">Icebreaker</p>
    <h2 className="font-display text-5xl text-[hsl(var(--ivory))] mb-8 tracking-wide max-w-3xl">
      TWO TRUTHS AND A DREAM
    </h2>
    <div className="max-w-2xl text-[hsl(var(--ivory))]/60 font-body text-base leading-relaxed space-y-4">
      <p>Share three statements about yourself:</p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {["One true thing about your past", "One true thing about right now", "One thing you dream of doing"].map((t, i) => (
          <div key={i} className="border border-[hsl(var(--ivory))]/10 p-4 rounded-sm">
            <span className="text-[hsl(var(--bronze))] font-display text-lg block mb-2">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-[hsl(var(--ivory))]/50 font-body text-xs">{t}</p>
          </div>
        ))}
      </div>
      <p className="text-[hsl(var(--ivory))]/30 text-sm mt-6">The group guesses which one is the dream.</p>
    </div>
  </div>
);

export default IcebreakerSlide;
