import { Smartphone } from "lucide-react";

const PresenceSlide = () => (
  <div className="h-full flex flex-col items-center justify-center px-12 text-center">
    <Smartphone size={48} className="text-[hsl(var(--ivory))]/20 mb-8" strokeWidth={1} />
    <h2 className="font-display text-5xl text-[hsl(var(--ivory))] mb-6 tracking-wide">PUT YOUR PHONE AWAY</h2>
    <p className="text-[hsl(var(--ivory))]/50 font-body text-lg max-w-lg leading-relaxed">
      Presence is the gift you give to each other.
    </p>
    <div className="mt-10 text-[hsl(var(--ivory))]/20 font-body text-xs tracking-widest">
      (Unless we ask you to scan something)
    </div>
  </div>
);

export default PresenceSlide;
