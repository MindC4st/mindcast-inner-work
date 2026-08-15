import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { describeFunctionError } from "@/lib/functionError";
import { Camera, Check, X, Loader2, ScanLine, UserCheck, AlertCircle } from "lucide-react";

// Door scanner — the ticketing surface at the theatre entrance.
//
// Sessions are members-only, so everyone is scanned on the way in. A scan
// resolves a HOUSEHOLD, not just a person: kids don't carry phones and teens
// are often dropped off, so one scan of a parent's pass brings up the whole
// family and the door staff tick who actually came. A teen arriving alone
// scans their own pass and never depends on a parent being there.
//
// Admitted people are written to check_ins, which the Welcome Wall already
// watches over Realtime — names appear on the wall as they come through.
//
// Scanning uses the platform BarcodeDetector (Chrome on Android, same devices
// that run the NFC reader). Anywhere it's missing, the code can be typed in —
// a door must never be blocked by a browser capability.

type Person = {
  profile_id: string;
  display_name: string;
  role_in_household: string;
  track: string;
  membership_status: string;
  entitled: boolean;
  checked_in_today: boolean;
  is_scanned_person: boolean;
};

type Lookup =
  | { kind: "member"; people: Person[] }
  | { kind: "trial"; full_name: string; track: string; guests: { name: string; track: string }[]; already_used: boolean; expired: boolean }
  | { kind: "unknown" };

const hasDetector = () => typeof (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector !== "undefined";

const DoorScanner = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loopRef = useRef<number | null>(null);

  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [token, setToken] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [admitted, setAdmitted] = useState<string[] | null>(null);

  const stopCamera = () => {
    if (loopRef.current) { cancelAnimationFrame(loopRef.current); loopRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  useEffect(() => stopCamera, []);

  const handleToken = async (raw: string) => {
    const t = raw.trim();
    if (!t || busy) return;
    stopCamera();
    setBusy(true); setError(null); setAdmitted(null); setToken(t);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("door-scan", {
        body: { action: "lookup", token: t },
      });
      if (fnErr) throw fnErr;
      const res = data as Lookup;
      setLookup(res);
      if (res.kind === "member") {
        // Pre-tick everyone entitled and not already seated — the common case
        // is "the whole family came", so make that one tap.
        setPicked(new Set(res.people.filter((p) => p.entitled && !p.checked_in_today).map((p) => p.profile_id)));
      }
    } catch (e) {
      const f = await describeFunctionError(e, {
        404: "That code isn't recognised. Check the member list, or admit manually.",
        403: "You need door-staff access to scan.",
        401: "Sign in first.",
      }, "Scan failed. Try again.");
      setError(f.message);
      setLookup(null);
    } finally {
      setBusy(false);
    }
  };

  const startCamera = async () => {
    setError(null); setLookup(null); setAdmitted(null);
    if (!hasDetector()) {
      setError("This browser can't scan QR codes. Type the code below instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const Detector = (window as unknown as { BarcodeDetector: new (o: { formats: string[] }) => { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      const detector = new Detector({ formats: ["qr_code"] });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0 && codes[0].rawValue) {
            await handleToken(codes[0].rawValue);
            return;
          }
        } catch { /* a dropped frame is not an error worth showing */ }
        loopRef.current = requestAnimationFrame(tick);
      };
      loopRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Couldn't open the camera. Check permissions, or type the code.");
      setScanning(false);
    }
  };

  const admit = async () => {
    setBusy(true); setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("door-scan", {
        body: {
          action: "admit",
          token,
          profile_ids: lookup?.kind === "member" ? [...picked] : [],
        },
      });
      if (fnErr) throw fnErr;
      const r = data as { ok?: boolean; admitted?: string[]; reason?: string };
      if (!r?.ok) {
        setError(
          r?.reason === "already_used" ? "That free-session ticket has already been used."
          : r?.reason === "expired" ? "That ticket has expired."
          : r?.reason === "not_entitled" ? "No active membership on this pass."
          : "Could not admit. Try again.",
        );
        return;
      }
      setAdmitted(r.admitted ?? []);
      setLookup(null);
    } catch (e) {
      const f = await describeFunctionError(e, {
        409: "That ticket has already been used.",
      }, "Could not admit. Try again.");
      setError(f.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-[#0A1120] text-[#E2E8F0] px-5 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-[10px] font-body tracking-[0.5em] uppercase text-[#3585AF] mb-2">Mindcast Door</p>
        <h1 className="font-display text-3xl tracking-wider mb-6">TICKET SCAN</h1>

        <div className="rounded-lg overflow-hidden border border-white/10 bg-black aspect-[4/3] mb-4 relative">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
          {!scanning && (
            <div className="absolute inset-0 grid place-items-center text-[#8E9299]">
              <ScanLine size={40} strokeWidth={1} />
            </div>
          )}
        </div>

        {!scanning ? (
          <button onClick={startCamera} disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-[#3585AF] text-white py-4 rounded-md text-xs font-body font-semibold tracking-widest uppercase min-h-[56px] disabled:opacity-50">
            <Camera size={16} /> Start scanning
          </button>
        ) : (
          <button onClick={stopCamera}
            className="w-full border border-white/25 py-4 rounded-md text-xs font-body font-semibold tracking-widest uppercase min-h-[56px]">
            Stop
          </button>
        )}

        {/* A door can never be blocked by a camera or a browser feature. */}
        <form onSubmit={(e) => { e.preventDefault(); handleToken(manual); }} className="mt-4 flex gap-2">
          <input value={manual} onChange={(e) => setManual(e.target.value)}
            placeholder="Or type the code"
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-md px-3 py-3 text-sm font-body outline-none focus:border-[#3585AF]" />
          <button type="submit" disabled={busy || !manual.trim()}
            className="px-4 rounded-md border border-white/20 text-xs font-body uppercase tracking-widest disabled:opacity-40">Go</button>
        </form>

        {busy && <p className="mt-5 flex items-center gap-2 text-sm text-[#8E9299] font-body"><Loader2 size={14} className="animate-spin" /> Checking…</p>}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-3 text-sm font-body text-red-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {admitted && (
          <div className="mt-5 rounded-md border border-[#3585AF]/40 bg-[#3585AF]/10 px-4 py-4">
            <p className="flex items-center gap-2 text-[#C5E3F3] font-body text-sm mb-2"><UserCheck size={16} /> Admitted — now on the wall</p>
            {admitted.map((n) => <p key={n} className="font-display text-xl tracking-wider">{n.toUpperCase()}</p>)}
            {admitted.length === 0 && <p className="text-sm font-body text-[#8E9299]">Already checked in today.</p>}
          </div>
        )}

        {/* Household roster — tick who actually came. */}
        {lookup?.kind === "member" && (
          <div className="mt-6">
            <p className="text-[10px] font-body tracking-[0.25em] uppercase text-[#8E9299] mb-3">Who's here?</p>
            <div className="space-y-2">
              {lookup.people.map((p) => {
                const on = picked.has(p.profile_id);
                const blocked = !p.entitled;
                return (
                  <button key={p.profile_id} onClick={() => !blocked && toggle(p.profile_id)} disabled={blocked}
                    className={`w-full flex items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                      blocked ? "border-white/10 bg-white/[0.02] opacity-50"
                      : on ? "border-[#3585AF] bg-[#3585AF]/15"
                      : "border-white/15 hover:border-white/30"
                    }`}>
                    <span className={`w-5 h-5 rounded-sm grid place-items-center shrink-0 ${on ? "bg-[#3585AF]" : "border border-white/25"}`}>
                      {on && <Check size={13} />}
                      {blocked && <X size={13} className="text-red-300" />}
                    </span>
                    <span className="flex-1">
                      <span className="block font-body text-sm">{p.display_name}</span>
                      <span className="block text-[11px] text-[#8E9299] font-body">
                        {p.track}
                        {p.role_in_household !== "adult" && ` · ${p.role_in_household}`}
                        {blocked && " · no active membership"}
                        {p.checked_in_today && " · already in"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <button onClick={admit} disabled={busy || picked.size === 0}
              className="mt-4 w-full bg-[#3585AF] text-white py-4 rounded-md text-xs font-body font-semibold tracking-widest uppercase min-h-[56px] disabled:opacity-40">
              Admit {picked.size} {picked.size === 1 ? "person" : "people"}
            </button>
          </div>
        )}

        {/* Free-session ticket. */}
        {lookup?.kind === "trial" && (
          <div className="mt-6 rounded-md border border-white/15 px-4 py-4">
            <p className="text-[10px] font-body tracking-[0.25em] uppercase text-[#8E9299] mb-1">Free session ticket</p>
            <p className="font-display text-2xl tracking-wider mb-1">{lookup.full_name.toUpperCase()}</p>
            <p className="text-sm font-body text-[#8E9299]">
              {lookup.track}
              {lookup.guests.length > 0 && ` · with ${lookup.guests.map((g) => `${g.name} (${g.track})`).join(", ")}`}
            </p>
            {lookup.already_used ? (
              <p className="mt-3 text-sm font-body text-red-300">Already used — this ticket is valid once only.</p>
            ) : lookup.expired ? (
              <p className="mt-3 text-sm font-body text-red-300">Expired.</p>
            ) : (
              <button onClick={admit} disabled={busy}
                className="mt-4 w-full bg-[#3585AF] text-white py-4 rounded-md text-xs font-body font-semibold tracking-widest uppercase min-h-[56px] disabled:opacity-40">
                Admit and use ticket
              </button>
            )}
          </div>
        )}

        {lookup?.kind === "unknown" && (
          <p className="mt-6 text-sm font-body text-[#8E9299]">Not recognised. Check them against the member list, or issue a manual check-in.</p>
        )}
      </div>
    </div>
  );
};

export default DoorScanner;
