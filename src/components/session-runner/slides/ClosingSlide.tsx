const ClosingSlide = () => (
  <div className="h-full flex flex-col items-center justify-center px-12 text-center">
    <div className="w-16 h-px bg-[hsl(var(--bronze))]/40 mb-10" />
    <h2 className="font-display text-6xl text-[hsl(var(--ivory))] mb-4 tracking-wide">THANK YOU</h2>
    <p className="text-[hsl(var(--ivory))]/50 font-body text-lg max-w-lg mb-8">
      The work you did tonight matters. Carry one thing into the week.
    </p>
    <div className="border border-[hsl(var(--ivory))]/10 rounded-sm p-8 max-w-md bg-[hsl(var(--ivory))]/[0.03]">
      <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.3em] font-body mb-2 uppercase">Next Session</p>
      <p className="font-display text-3xl text-[hsl(var(--ivory))] tracking-wide">TUESDAY · 7:00 PM</p>
      <p className="text-[hsl(var(--ivory))]/30 font-serif italic text-sm mt-2">See you then.</p>
    </div>
    <div className="w-16 h-px bg-[hsl(var(--bronze))]/40 mt-10" />
  </div>
);

export default ClosingSlide;
