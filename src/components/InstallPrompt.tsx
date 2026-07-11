import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { X, Download } from "lucide-react";

// Small, dismissable "Add to home screen" banner. Renders nothing until the
// browser signals installability (and stays hidden once dismissed).
const InstallPrompt = () => {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-[hsl(var(--navy,220_40%_15%))] text-white rounded-lg shadow-lg px-4 py-3 max-w-sm w-full">
        <Download size={18} className="shrink-0" />
        <span className="text-sm flex-1">Install Mindcast for a faster, app-like experience.</span>
        <button
          onClick={promptInstall}
          className="text-xs font-semibold uppercase tracking-wider bg-white/15 hover:bg-white/25 rounded px-3 py-1.5"
        >
          Install
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
