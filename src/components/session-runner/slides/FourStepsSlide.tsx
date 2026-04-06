import { Headphones, FileText, MessageCircle, Target } from "lucide-react";

const STEPS = [
  { icon: Headphones, num: "01", title: "LISTEN", desc: "A curated podcast episode each week. Real experts, real research." },
  { icon: FileText, num: "02", title: "WORKSHEET", desc: "Capture your reflections in your workbook. Arrive prepared." },
  { icon: MessageCircle, num: "03", title: "DISCUSS", desc: "Share what came up. Listen to the room. Sit with it." },
  { icon: Target, num: "04", title: "SET AN INTENTION", desc: "One thing to track this week. Small, specific, real." },
];

const FourStepsSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-6 uppercase">Every Week</p>
    <h2 className="font-display text-5xl text-[hsl(var(--ivory))] mb-12 tracking-wide">4 STEPS. EVERY WEEK.</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl">
      {STEPS.map((s) => (
        <div key={s.num} className="border border-[hsl(var(--ivory))]/10 p-6 rounded-sm">
          <s.icon size={24} className="text-[hsl(var(--blue))] mb-4" strokeWidth={1.5} />
          <span className="text-[hsl(var(--bronze))] font-display text-xl block mb-1">{s.num}</span>
          <h3 className="font-display text-xl text-[hsl(var(--ivory))] mb-2 tracking-wider">{s.title}</h3>
          <p className="text-[hsl(var(--ivory))]/40 font-body text-xs leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default FourStepsSlide;
