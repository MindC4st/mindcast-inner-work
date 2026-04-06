const QUESTIONS = [
  "Where in your life are you most prone to distraction — and what are you avoiding when it happens?",
  "What would it mean to you personally to reclaim your attention? What would you actually do with more of it?",
  "What's one environment change — physical, digital, or social — that would make deep focus more possible for you?",
];

const BookmarkQuestionsSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-4 uppercase">Bookmark Questions</p>
    <h2 className="font-display text-4xl text-[hsl(var(--ivory))] mb-3 tracking-wide">Three things to carry into the week.</h2>
    <p className="text-[hsl(var(--ivory))]/30 font-serif italic text-base mb-10">
      You don't need to answer these now. Let them sit. Return to them after you've listened.
    </p>
    <div className="space-y-6 max-w-3xl">
      {QUESTIONS.map((q, i) => (
        <div key={i} className="flex gap-6 items-start border-l-2 border-[hsl(var(--bronze))]/20 pl-6 py-2">
          <span className="text-[hsl(var(--bronze))] font-display text-2xl shrink-0">{String(i + 1).padStart(2, "0")}</span>
          <p className="text-[hsl(var(--ivory))]/80 font-body text-sm leading-relaxed">{q}</p>
        </div>
      ))}
    </div>
  </div>
);

export default BookmarkQuestionsSlide;
