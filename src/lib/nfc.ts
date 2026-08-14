// NFC read abstraction shared by the member app and the staff kiosk.
//
// Runtime-detects the platform and returns a bracelet's NFC id as a string:
//   - Native (Capacitor iOS/Android): the @capacitor-community/nfc plugin.
//   - Android browser / installed PWA: Web NFC (NDEFReader).
//   - Anything else: reports unsupported so the UI can fall back to the kiosk.
//
// The Capacitor plugin is imported dynamically with a vite-ignore so the web
// build never tries to resolve the native dependency (it's only present in the
// Capacitor shells). Callers always POST the returned id to the `nfc-checkin`
// edge function — the single check-in pipeline.

export type NfcSupport = "capacitor" | "webnfc" | "unsupported";

type CapacitorShell = { isNativePlatform?: () => boolean };
type CapacitorNfcPlugin = {
  addListener?: (eventName: string, listener: (event: unknown) => void) => unknown;
  startScanSession?: () => Promise<void> | void;
};
type NDEFReaderCtor = new () => {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  onreading: ((event: { serialNumber?: string }) => void) | null;
  onreadingerror: (() => void) | null;
};

// Capacitor injects this global when running inside a native shell.
function isCapacitorNative(): boolean {
  const cap = (globalThis as { Capacitor?: CapacitorShell }).Capacitor;
  return !!cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform();
}

export function nfcSupport(): NfcSupport {
  if (isCapacitorNative()) return "capacitor";
  if (typeof (globalThis as { NDEFReader?: unknown }).NDEFReader !== "undefined") return "webnfc";
  return "unsupported";
}

// Reads a single tag and resolves its id. Rejects on error/timeout/unsupported.
export async function readNfcId(signal?: AbortSignal): Promise<string> {
  const support = nfcSupport();

  if (support === "capacitor") {
    // Computed specifier so neither tsc nor rollup resolves the native-only
    // dependency at build time — it exists only inside the Capacitor shell.
    const pkg = "@capacitor-community/nfc";
    const mod = (await import(/* @vite-ignore */ pkg).catch(() => null)) as { Nfc?: CapacitorNfcPlugin } | null;
    const Nfc = mod?.Nfc;
    if (!Nfc) throw new Error("NFC plugin unavailable");
    return await new Promise<string>((resolve, reject) => {
      let done = false;
      const finish = (fn: () => void) => { if (!done) { done = true; fn(); } };
      Nfc.addListener?.("nfcTagScanned", (event: unknown) => {
        const id = extractCapacitorId(event);
        if (id) finish(() => resolve(id));
      });
      signal?.addEventListener("abort", () => finish(() => reject(new Error("cancelled"))));
      Promise.resolve(Nfc.startScanSession?.()).catch((e: unknown) =>
        finish(() => reject(e instanceof Error ? e : new Error(String(e)))),
      );
    });
  }

  if (support === "webnfc") {
    const NDEFReader = (globalThis as { NDEFReader?: NDEFReaderCtor }).NDEFReader!;
    const reader = new NDEFReader();
    await reader.scan({ signal });
    return await new Promise<string>((resolve, reject) => {
      reader.onreading = (event) => {
        if (event?.serialNumber) resolve(String(event.serialNumber));
        else reject(new Error("No serial number on tag"));
      };
      reader.onreadingerror = () => reject(new Error("Could not read tag"));
      signal?.addEventListener("abort", () => reject(new Error("cancelled")));
    });
  }

  throw new Error("NFC is not supported on this device");
}

function extractCapacitorId(event: unknown): string | null {
  // Plugin shapes vary by version; try the common id fields.
  const wrapper = event as { nfcTag?: unknown; tag?: unknown } | null;
  const tag = (wrapper?.nfcTag || wrapper?.tag || event) as {
    id?: unknown; serialNumber?: unknown; uid?: unknown; idBytes?: number[];
  } | null;
  const raw =
    tag?.id ?? tag?.serialNumber ?? tag?.uid ??
    (Array.isArray(tag?.idBytes) ? tag.idBytes.map((b: number) => b.toString(16).padStart(2, "0")).join("") : null);
  return raw ? String(raw) : null;
}
