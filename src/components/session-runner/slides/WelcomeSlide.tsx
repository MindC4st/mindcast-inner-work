const WelcomeSlide = () => (
  <div className="h-full flex flex-col items-center justify-center px-12 text-center">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-6 uppercase">Session 1</p>
    <h1 className="font-display text-7xl md:text-8xl text-[hsl(var(--ivory))] mb-4 tracking-wide">WELCOME TO MINDCAST</h1>
    <p className="text-[hsl(var(--ivory))]/50 font-body text-lg max-w-xl">
      The inner work starts here. Tonight we set the foundation.
    </p>
    <div className="mt-12 w-16 h-px bg-[hsl(var(--bronze))]/40" />
  </div>
);

export default WelcomeSlide;
