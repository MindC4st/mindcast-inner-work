import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readNfcId, nfcSupport } from "@/lib/nfc";
import { Nfc, Check, AlertCircle } from "lucide-react";

// Staff kiosk check-in. Full-screen brand-aligned surface — dark navy, giant
// Bebas prompt, brand-blue tap ring. Runs a continuous scan loop and posts each
// read to the SAME `nfc-checkin` pipeline as the member app, tagged
// source='kiosk'. Gated behind the staff-only /admin route.

const TRACKS = ["Adult", "Teen", "Child"] as const;

const Kiosk = () => {
  const [track, setTrack] = useState<(typeof TRACKS)[number] | "">("");
  const [scanning, setScanning] = useState(false);
  const [last, setLast] = useState<{ name: string; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const support = nfcSupport();

  const loop = async () => {
    setError(null);
    while (abortRef.current && !abortRef.current.signal.aborted) {
      try {
        const nfc_id = await readNfcId(abortRef.current.signal);
        const { data, error } = await supabase.functions.invoke("nfc-checkin", {
          body: { nfc_id, source: "kiosk", track: track || undefined },
        });
        if (error) throw error;
        if ((data as any)?.error) setError((data as any).error);
        else if ((data as any)?.display_name) setLast({ name: (data as any).display_name, at: Date.now() });
      } catch (e: any) {
        if (e?.message === "cancelled") break;
        setError(e?.message ?? "Scan failed");
      }
    }
  };

  const start = () => {
    if (support === "unsupported") { setError("This device can't read NFC. Use a member's phone or enter manually."); return; }
    abortRef.current = new AbortController();
    setScanning(true);
    loop();
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="min-h-screen bg-navy text-cream flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <p className="text-[10px] font-body tracking-[0.5em] uppercase text-primary mb-6">Mindcast Kiosk</p>

        <div className={`mx-auto mb-8 w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all ${scanning ? "border-primary animate-pulse" : "border-cream/20"}`}>
          <Nfc className={`w-14 h-14 ${scanning ? "text-primary" : "text-cream/40"}`} strokeWidth={1.25} />
        </div>

        <h1 className="font-display text-4xl md:text-5xl tracking-wider text-cream mb-3">
          {scanning ? "TAP TO CHECK IN" : "CHECK-IN KIOSK"}
        </h1>
        <p className="text-cream/60 text-sm font-body leading-relaxed mb-8">
          Hold a member's bracelet to the reader. Each tap posts to the Welcome Wall.
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => setTrack(track === t ? "" : t)}
              className={`px-4 py-2 rounded-sm text-[10px] font-body font-semibold uppercase tracking-widest transition-colors ${
                track === t
                  ? "bg-primary text-primary-foreground"
                  : "border border-cream/20 text-cream/60 hover:text-cream hover:border-cream/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {last && (
          <div className="mb-6 border border-primary/40 bg-primary/10 rounded-sm py-4 flex items-center justify-center gap-2">
            <Check className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="font-display text-lg tracking-wider text-cream">{last.name.toUpperCase()}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-destructive/80 font-body">
            <AlertCircle className="h-4 w-4" strokeWidth={1.5} /> {error}
          </div>
        )}

        {!scanning ? (
          <button
            onClick={start}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[64px]"
          >
            Start scanning
          </button>
        ) : (
          <button
            onClick={stop}
            className="w-full border border-cream/30 text-cream text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[64px] hover:bg-cream/5"
          >
            Stop
          </button>
        )}

        <p className="text-[10px] font-body uppercase tracking-widest text-cream/30 mt-6">
          NFC: {support === "capacitor" ? "native reader" : support === "webnfc" ? "Web NFC" : "unavailable"}
        </p>
      </div>
    </div>
  );
};

export default Kiosk;
