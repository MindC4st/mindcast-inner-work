import { Shield, Users, Ear, Heart, Flame } from "lucide-react";

const RULES = [
  { icon: Shield, text: "What's shared here, stays here." },
  { icon: Users, text: "Show up prepared — do the work before you arrive." },
  { icon: Ear, text: "Speak from experience. Your stories are your learnings." },
  { icon: Heart, text: "Be authentic. This only works if you're honest." },
  { icon: Flame, text: "Sit with discomfort. Lean into the things that are hard to say or hear." },
];

const GroupExpectationsSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-6 uppercase">Group Expectations</p>
    <h2 className="font-display text-5xl text-[hsl(var(--ivory))] mb-12 tracking-wide">HOW WE SHOW UP</h2>
    <div className="space-y-5 max-w-3xl">
      {RULES.map((r, i) => (
        <div key={i} className="flex items-center gap-5 border-l-2 border-[hsl(var(--bronze))]/30 pl-6 py-2">
          <r.icon size={20} className="text-[hsl(var(--blue))] shrink-0" strokeWidth={1.5} />
          <p className="text-[hsl(var(--ivory))]/80 font-body text-base">{r.text}</p>
        </div>
      ))}
    </div>
  </div>
);

export default GroupExpectationsSlide;
