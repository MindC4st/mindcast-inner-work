import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { X, Download } from "lucide-react";

// Dismissable "Add to home screen" banner. Brand-aligned: ivory card on light,
// Bebas microcopy, Montserrat body, tokenised primary CTA. Safe-area aware for
// iOS notches. Renders nothing until the browser signals installability.
const InstallPrompt = () => {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 flex justify-center pointer-events-none"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex items-center gap-3 bg-background border border-foreground/10 shadow-lg px-4 py-3 max-w-sm w-full rounded-sm">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Download size={16} className="text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm tracking-wider text-foreground leading-none mb-1">INSTALL MINDCAST</p>
          <p className="text-xs text-foreground/60 font-body leading-snug">Faster, app-like experience.</p>
        </div>
        <button
          onClick={promptInstall}
          className="text-[10px] font-body font-semibold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-3 py-2 min-h-[36px]"
        >
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-foreground/40 hover:text-foreground/70 shrink-0"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
