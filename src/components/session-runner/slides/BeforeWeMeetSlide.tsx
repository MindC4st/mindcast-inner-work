import { Headphones, FileText, Eye } from "lucide-react";

const TASKS = [
  { icon: Headphones, num: "01", title: "Listen to the episode", desc: "Stolen Focus — Johann Hari. ~52 min. Find it in your portal." },
  { icon: FileText, num: "02", title: "Complete your worksheet", desc: "Download from the portal. Arrive on Tuesday with it filled in." },
  { icon: Eye, num: "03", title: "Notice one thing", desc: "One moment this week where your attention was stolen — or reclaimed. Bring it to the room." },
];

const BeforeWeMeetSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-4 uppercase">Your Task</p>
    <h2 className="font-display text-4xl text-[hsl(var(--ivory))] mb-10 tracking-wide">Before we meet again.</h2>
    <div className="space-y-5 max-w-2xl">
      {TASKS.map((t) => (
        <div key={t.num} className="flex items-start gap-5 border border-[hsl(var(--ivory))]/10 rounded-sm p-5 bg-[hsl(var(--ivory))]/[0.03]">
          <t.icon size={20} className="text-[hsl(var(--blue))] mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[hsl(var(--bronze))] font-display text-lg">{t.num}</span>
              <h3 className="text-[hsl(var(--ivory))] font-body text-sm font-bold">{t.title}</h3>
            </div>
            <p className="text-[hsl(var(--ivory))]/40 font-body text-xs">{t.desc}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-10 border border-[hsl(var(--ivory))]/10 rounded-sm p-6 max-w-2xl text-center bg-[hsl(var(--ivory))]/[0.03]">
      <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.3em] font-body mb-2 uppercase">Next Session</p>
      <p className="font-display text-2xl text-[hsl(var(--ivory))] tracking-wide">TUESDAY · 7:00 PM</p>
      <p className="text-[hsl(var(--ivory))]/30 font-serif italic text-sm mt-1">See you then.</p>
    </div>
  </div>
);

export default BeforeWeMeetSlide;
