import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readNfcId, nfcSupport } from "@/lib/nfc";
import { Nfc, Check, AlertCircle } from "lucide-react";

// Staff kiosk check-in. A staff device scans members' bracelets (the fallback
// for members without the app / phone / NFC issues). It runs a continuous scan
// loop and posts each read to the SAME `nfc-checkin` pipeline as the member
// app, tagged source='kiosk'. Gated behind the staff-only /admin route.
//
// UX note: unlike the member app (member taps their OWN phone, implicitly
// authenticated), the kiosk scans OTHER people's bracelets — so it runs in a
// dedicated staff-authenticated mode and never assumes the tapper is the
// logged-in user.

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
        if (data?.error) { setError(data.error); }
        else if (data?.display_name) { setLast({ name: data.display_name, at: Date.now() }); }
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Nfc className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-semibold mb-1">Check-in kiosk</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Hold a member's bracelet to the reader. Each tap checks them in on the Welcome Wall.
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => setTrack(track === t ? "" : t)}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-wider border ${
                track === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {last && (
          <div className="mb-6 flex items-center justify-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">{last.name} checked in</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {!scanning ? (
          <button onClick={start} className="w-full bg-primary text-primary-foreground rounded py-3 font-medium">
            Start scanning
          </button>
        ) : (
          <button onClick={stop} className="w-full border border-border rounded py-3 font-medium">
            Stop
          </button>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          NFC: {support === "capacitor" ? "native reader" : support === "webnfc" ? "Web NFC" : "unavailable"}
        </p>
      </div>
    </div>
  );
};

export default Kiosk;
