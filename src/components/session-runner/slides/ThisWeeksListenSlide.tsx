const ThisWeeksListenSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-4 uppercase">Session 1</p>
    <h2 className="font-display text-4xl text-[hsl(var(--ivory))] mb-10 tracking-wide">THIS WEEK'S LISTEN</h2>
    <div className="border-l-2 border-[hsl(var(--blue))] pl-8 max-w-2xl">
      <p className="text-[hsl(var(--blue))] text-xs tracking-[0.3em] font-body mb-2 uppercase">Podcast</p>
      <h3 className="font-display text-5xl text-[hsl(var(--ivory))] mb-2">Stolen Focus</h3>
      <p className="text-[hsl(var(--blue))] font-serif text-xl italic mb-6">by Johann Hari</p>
      <p className="text-[hsl(var(--ivory))]/60 font-body text-sm leading-relaxed mb-6 max-w-lg">
        Why you can't pay attention — and how to think deeply again.
      </p>
      <div className="border-t border-[hsl(var(--ivory))]/10 pt-5">
        <p className="text-[hsl(var(--ivory))]/50 font-body text-sm leading-relaxed max-w-lg">
          Johann Hari spent three years investigating the forces stealing our focus. In this episode, he unpacks why our ability to focus is collapsing — and what we can reclaim.
        </p>
      </div>
    </div>
  </div>
);

export default ThisWeeksListenSlide;
