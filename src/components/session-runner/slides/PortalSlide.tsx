import { LayoutDashboard } from "lucide-react";

const PortalSlide = () => (
  <div className="h-full flex flex-col justify-center px-16">
    <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-6 uppercase">Your Home Base</p>
    <h2 className="font-display text-5xl text-[hsl(var(--ivory))] mb-6 tracking-wide">EVERYTHING LIVES IN YOUR PORTAL</h2>
    <div className="max-w-3xl space-y-4">
      <p className="text-[hsl(var(--ivory))]/60 font-body text-base leading-relaxed">
        Your podcast episodes, worksheets, reflections, commitments, and progress — all in one place.
      </p>
      <div className="flex items-center gap-3 mt-8 border border-[hsl(var(--ivory))]/10 p-5 rounded-sm max-w-md">
        <LayoutDashboard size={20} className="text-[hsl(var(--blue))] shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-[hsl(var(--ivory))] font-body text-sm font-semibold">mindcast-inner-work.lovable.app/portal</p>
          <p className="text-[hsl(var(--ivory))]/30 font-body text-xs">Session 1 will guide you through onboarding</p>
        </div>
      </div>
    </div>
  </div>
);

export default PortalSlide;
