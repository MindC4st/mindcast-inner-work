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
//
// ── Identity model (important) ─────────────────────────────────────────────
// BraceletStudio writes each physical tag with an NDEF URL record pointing at
// `{site}/b/<token>` and stores that same `<token>` in profiles.nfc_id. So the
// authoritative bracelet identifier is the NDEF URL TOKEN, not the tag's
// hardware serial number (NDEFReader.serialNumber / the Capacitor uid).
//
// readNfcId()        -> returns the hardware serial/uid (legacy behaviour).
// readBraceletToken()-> parses the NDEF URL record and returns the /b/<token>
//                       value that matches profiles.nfc_id, falling back to the
//                       hardware serial only if no URL record is present.
// The room attendance kiosk MUST use readBraceletToken() — scanning with the
// hardware serial would never resolve against profiles.nfc_id.

export type NfcSupport = "capacitor" | "webnfc" | "unsupported";

type CapacitorShell = { isNativePlatform?: () => boolean };
type CapacitorNfcPlugin = {
  addListener?: (eventName: string, listener: (event: unknown) => void) => unknown;
  startScanSession?: () => Promise<void> | void;
};
// A single NDEF record as exposed by Web NFC. `data` is a DataView for url /
// mime / unknown records; toText() is only meaningful for text records.
type NDEFRecordLike = {
  recordType?: string;
  data?: DataView | ArrayBuffer | Uint8Array;
  toText?: () => string;
};
type NDEFReadingEventLike = {
  serialNumber?: string;
  message?: { records?: NDEFRecordLike[] } | null;
};
type NDEFReaderCtor = new () => {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  onreading: ((event: NDEFReadingEventLike) => void) | null;
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

// ── Bracelet token (NDEF URL) extraction ───────────────────────────────────

/** Pull the first readable string out of an NDEF record, whatever its type. */
function recordToString(rec: NDEFRecordLike): string | null {
  try {
    if (typeof rec.toText === "function") {
      const t = rec.toText();
      if (t) return t;
    }
  } catch { /* not a text record */ }
  const d = rec.data;
  if (!d) return null;
  try {
    const bytes =
      d instanceof DataView ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength)
      : d instanceof ArrayBuffer ? new Uint8Array(d)
      : new Uint8Array(d);
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Extract the MINDCAST bracelet token from a set of NDEF records.
 *
 * Bracelets carry a URL record pointing at `{site}/b/<token>`; the token is
 * the value stored in profiles.nfc_id. This scans the records for a `/b/<token>`
 * path and returns the token. Returns null if no bracelet URL is present.
 *
 * Exported for unit testing (the kiosk's identity path depends on it).
 */
export function extractBraceletToken(records: NDEFRecordLike[] | null | undefined): string | null {
  for (const rec of records ?? []) {
    const text = recordToString(rec);
    if (!text) continue;
    const m = text.match(/\/b\/([A-Za-z0-9_-]+)/);
    if (m && m[1]) return m[1];
  }
  return null;
}

/**
 * Read a bracelet and resolve its MINDCAST identity token — the /b/<token>
 * value that matches profiles.nfc_id. Reads the NDEF URL record written by
 * BraceletStudio. Falls back to the hardware serial only when no URL record is
 * present (an unprogrammed or foreign tag), so callers still get *something*
 * to surface as "not recognised" rather than a hard failure.
 *
 * Use this for room attendance / any lookup against profiles.nfc_id. Do NOT
 * use readNfcId() (hardware serial) for identity — it will not match.
 */
export async function readBraceletToken(signal?: AbortSignal): Promise<string> {
  const support = nfcSupport();

  if (support === "capacitor") {
    const pkg = "@capacitor-community/nfc";
    const mod = (await import(/* @vite-ignore */ pkg).catch(() => null)) as { Nfc?: CapacitorNfcPlugin } | null;
    const Nfc = mod?.Nfc;
    if (!Nfc) throw new Error("NFC plugin unavailable");
    return await new Promise<string>((resolve, reject) => {
      let done = false;
      const finish = (fn: () => void) => { if (!done) { done = true; fn(); } };
      Nfc.addListener?.("nfcTagScanned", (event: unknown) => {
        // Prefer the NDEF URL token if the plugin exposes records; otherwise
        // fall back to the hardware id.
        const wrapper = event as { records?: NDEFRecordLike[]; ndefMessages?: { records?: NDEFRecordLike[] }[] } | null;
        const records = wrapper?.records ?? wrapper?.ndefMessages?.[0]?.records ?? null;
        const token = extractBraceletToken(records);
        if (token) { finish(() => resolve(token)); return; }
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
        const token = extractBraceletToken(event?.message?.records);
        if (token) { resolve(token); return; }
        // No NDEF URL record — fall back to the hardware serial so the caller
        // can still report "not recognised" instead of erroring silently.
        if (event?.serialNumber) resolve(String(event.serialNumber));
        else reject(new Error("No readable bracelet token on tag"));
      };
      reader.onreadingerror = () => reject(new Error("Could not read tag"));
      signal?.addEventListener("abort", () => reject(new Error("cancelled")));
    });
  }

  throw new Error("NFC is not supported on this device");
}
