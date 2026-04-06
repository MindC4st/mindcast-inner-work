import { MessageCircle } from "lucide-react";

const QUESTIONS = [
  "What came up for you this week as you sat with this?",
  "Did anyone land somewhere different from where they started?",
  "What would change in your life if you applied this?",
];

const DiscussionSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <div className="flex items-center gap-3 mb-6">
      <MessageCircle size={20} className="text-[hsl(var(--blue))]" strokeWidth={1.5} />
      <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body uppercase">Group Discussion</p>
    </div>
    <h2 className="font-display text-5xl text-[hsl(var(--ivory))] mb-10 tracking-wide">LET'S TALK ABOUT IT.</h2>
    <div className="space-y-6 max-w-3xl">
      {QUESTIONS.map((q, i) => (
        <div key={i} className="flex gap-6 items-start border-l-2 border-[hsl(var(--blue))]/30 pl-6 py-3">
          <span className="text-[hsl(var(--blue))] font-display text-2xl shrink-0">{String(i + 1).padStart(2, "0")}</span>
          <p className="text-[hsl(var(--ivory))]/80 font-body text-lg leading-relaxed">{q}</p>
        </div>
      ))}
    </div>
    <p className="text-[hsl(var(--ivory))]/20 font-body text-xs tracking-widest mt-10 max-w-md">
      Linked to your workbook reflections — first impression, key idea, personal application.
    </p>
  </div>
);

export default DiscussionSlide;
