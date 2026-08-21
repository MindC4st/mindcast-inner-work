import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readBraceletToken, nfcSupport } from "@/lib/nfc";
import { describeFunctionError } from "@/lib/functionError";
import { enqueue, autoFlush, pendingCount, type Room } from "@/lib/rollOffline";
import {
  groupRoll,
  unresolvedCount,
  nfcScanUi,
  canSelfSignOut,
  type KioskRollRow,
  type PresenceOutcome,
} from "@/lib/roomAttendance";
import DepartureSheet, {
  type DepartureChild,
  type DepartureReason,
  type DepartureExtra,
} from "@/components/roll/DepartureSheet";
import { Nfc, Check, AlertCircle, ArrowLeft, WifiOff, X } from "lucide-react";

// Unified MINDCAST room attendance kiosk.
//
// This is the staff-facing ROOM kiosk. It is NOT the household door scanner.
//   - The DOOR (door-scan) answers "who entered the building?" and writes
//     roll_events 'signed_in' for selected Teen/Child members, making them
//     EXPECTED in their destination room.
//   - THIS kiosk answers "who actually arrived in this room?" — the gap
//     between the door and the room is where a child goes missing, so it is
//     the thing we surface.
//
// Rooms:
//   ADULT — bracelet scan -> existing nfc-checkin pipeline (check_ins). The
//           adult attendance model is check_ins; no minor door-to-room
//           reconciliation applies, so it stays simpler.
//   TEEN  — EXPECTED roster from the door + two ways to confirm present:
//           manual tap, or the teen scans their bracelet (resolves the NDEF
//           token -> profile UUID -> expected record -> 'present').
//   CHILD — EXPECTED roster from the door + manual roll call only. Children
//           do not have NFC bracelets, so selecting CHILD never starts a scan.
//
// Everything for Teen/Child reuses the existing room-roll child-safety system:
// roll_events (append-only), rollOffline (offline queue), record_departure
// (structured departures), close_room (hard block). No second attendance system.

const ROOMS: Room[] = ["Adult", "Teen", "Child"];

const nzToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

const cacheKey = (date: string, room: string) => `mindcast.roll.cache.${date}.${room}`;

// ─────────────────────────────────────────────────────────────────────────────

const Kiosk = () => {
  const [room, setRoom] = useState<Room | null>(null);

  if (!room) {
    return (
      <div className="fixed inset-0 section-navy grain-overlay flex flex-col items-center justify-center px-6 overflow-hidden">
        <p className="text-[11px] font-body tracking-[0.5em] uppercase text-primary mb-3">Mindcast Kiosk</p>
        <h1 className="font-display text-5xl md:text-6xl tracking-wider text-cream mb-2">ROOM ATTENDANCE</h1>
        <p className="font-body text-cream/50 text-sm mb-12 text-center max-w-md">
          The door records who entered the building. This screen records who actually arrived in each room.
        </p>
        <div className="grid gap-4 w-full max-w-md">
          {ROOMS.map((r) => (
            <button
              key={r}
              onClick={() => setRoom(r)}
              className="w-full bg-primary/10 hover:bg-primary/20 border-2 border-primary/40 hover:border-primary text-cream font-display text-3xl tracking-widest py-8 rounded-sm min-h-[88px] transition-colors"
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-body uppercase tracking-widest text-cream/30 mt-10">
          Child room uses manual roll call · Teen room supports bracelet scan
        </p>
      </div>
    );
  }

  return room === "Adult" ? (
    <AdultRoom onBack={() => setRoom(null)} />
  ) : (
    <MinorRoom room={room} onBack={() => setRoom(null)} />
  );
};

// ── Adult room — bracelet scan -> existing nfc-checkin (check_ins) ──────────

const AdultRoom = ({ onBack }: { onBack: () => void }) => {
  const [scanning, setScanning] = useState(false);
  const [action, setAction] = useState<"checkin" | "left_early">("checkin");
  const [last, setLast] = useState<{ name: string; leaving: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const support = nfcSupport();

  const loop = async () => {
    setError(null);
    while (abortRef.current && !abortRef.current.signal.aborted) {
      try {
        // Bracelets are identified by their NDEF URL token (profiles.nfc_id),
        // not the hardware serial. readBraceletToken resolves the token and
        // falls back to the serial only for an unprogrammed tag.
        const nfc_id = await readBraceletToken(abortRef.current.signal);
        const { data, error } = await supabase.functions.invoke("nfc-checkin", {
          body: { nfc_id, source: "kiosk", track: "Adult", action },
        });
        if (error) throw error;
        if (data?.error) setError(data.error);
        else if (data?.display_name) setLast({ name: data.display_name, leaving: action === "left_early" });
      } catch (e) {
        if ((e as Error)?.message === "cancelled") break;
        const failure = await describeFunctionError(
          e,
          {
            400: "That bracelet didn't send a readable code. Try scanning again.",
            404: action === "left_early"
              ? "No check-in found for today — this member hasn't been scanned in yet."
              : "Bracelet not linked to a member yet. Link it in Admin → Members, then scan again.",
            429: "Scanning too fast — wait a moment, then try again.",
          },
          "Scan failed",
        );
        setError(failure.message);
      }
    }
  };

  const start = () => {
    if (support === "unsupported") {
      setError("This device can't read NFC. Use an Android phone/PWA or the native app.");
      return;
    }
    abortRef.current = new AbortController();
    setScanning(true);
    void loop();
  };
  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setScanning(false);
  };
  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="fixed inset-0 section-navy grain-overlay flex flex-col overflow-hidden">
      <KioskHeader
        room="Adult"
        onBack={onBack}
        right={scanning ? <ScanningBadge /> : undefined}
      />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className={`mx-auto mb-8 w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all ${scanning ? "border-primary animate-pulse" : "border-cream/20"}`}>
          <Nfc className={`w-14 h-14 ${scanning ? "text-primary" : "text-cream/40"}`} strokeWidth={1.25} />
        </div>
        <h2 className="font-display text-4xl tracking-wider text-cream mb-3">
          {scanning ? (action === "left_early" ? "TAP TO SIGN OUT" : "TAP TO CHECK IN") : "ADULT ROOM"}
        </h2>
        <p className="font-body text-cream/50 text-sm max-w-md mb-6">
          {action === "left_early"
            ? "Scanning a bracelet marks that member as having left early. Their linked adult is notified."
            : "Hold an adult's bracelet to the reader to record their arrival."}
        </p>

        <div className="inline-flex gap-1 mb-6 p-1 rounded-sm border border-cream/15">
          {([
            { key: "checkin", label: "Arriving" },
            { key: "left_early", label: "Leaving early" },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => setAction(m.key)}
              className={`px-4 py-2 rounded-sm text-[10px] font-body font-semibold uppercase tracking-widest transition-colors ${
                action === m.key
                  ? (m.key === "left_early" ? "bg-[hsl(var(--bronze))] text-navy" : "bg-primary text-primary-foreground")
                  : "text-cream/60 hover:text-cream"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {last && (
          <div className={`mb-6 border rounded-sm py-4 px-8 flex flex-col items-center justify-center gap-1 ${
            last.leaving ? "border-[hsl(var(--bronze))]/50 bg-[hsl(var(--bronze))]/10" : "border-primary/40 bg-primary/10"
          }`}>
            <div className="flex items-center gap-2">
              <Check className={`h-5 w-5 ${last.leaving ? "text-[hsl(var(--bronze))]" : "text-primary"}`} strokeWidth={1.5} />
              <span className="font-display text-lg tracking-wider text-cream">{last.name.toUpperCase()}</span>
            </div>
            {last.leaving && (
              <span className="text-cream/50 text-[10px] font-body tracking-widest uppercase">Signed out · adult notified</span>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-destructive/80 font-body">
            <AlertCircle className="h-4 w-4" strokeWidth={1.5} /> {error}
          </div>
        )}

        {!scanning ? (
          <button onClick={start} className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[64px]">
            Start scanning
          </button>
        ) : (
          <button onClick={stop} className="w-full max-w-md border border-cream/30 text-cream text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[64px] hover:bg-cream/5">
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

// ── Teen / Child room — door-to-room roll reconciliation ────────────────────

const MinorRoom = ({ room, onBack }: { room: Room; onBack: () => void }) => {
  const sessionDate = nzToday();
  const [rows, setRows] = useState<KioskRollRow[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(pendingCount());
  const [departing, setDeparting] = useState<KioskRollRow | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [, forceTick] = useState(0);

  // NFC (Teen only).
  const support = nfcSupport();
  const [scanning, setScanning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [nfcResult, setNfcResult] = useState<ReturnType<typeof nfcScanUi> | null>(null);

  const loadRoll = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("room_roll", { p_date: sessionDate, p_room: room });
      if (error) throw error;
      const fetched = (data ?? []) as KioskRollRow[];
      setRows(fetched);
      localStorage.setItem(cacheKey(sessionDate, room), JSON.stringify(fetched));
      if (fetched.length === 0) {
        const { data: ok } = await supabase.rpc("can_access_room_roll", { p_date: sessionDate, p_room: room });
        setAccessDenied(ok === false);
      } else {
        setAccessDenied(false);
      }
    } catch {
      const cached = localStorage.getItem(cacheKey(sessionDate, room));
      if (cached) {
        try { setRows(JSON.parse(cached) as KioskRollRow[]); } catch { /* keep current */ }
      }
    }
  }, [sessionDate, room]);

  useEffect(() => {
    void loadRoll();
    const poll = window.setInterval(() => { if (navigator.onLine) void loadRoll(); }, 15_000);
    const tick = window.setInterval(() => forceTick((n) => n + 1), 5_000);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const stopFlush = autoFlush((n) => { setPending(n); if (n === 0) void loadRoll(); });

    // Door -> room realtime: a new signed_in / moved_in lands the name here
    // without a refresh.
    const channel = supabase
      .channel(`kiosk-roll-${room}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "roll_events", filter: `room=eq.${room}` },
        () => void loadRoll(),
      )
      .subscribe();

    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      stopFlush();
      void supabase.removeChannel(channel);
      abortRef.current?.abort();
    };
  }, [loadRoll, room]);

  const act = useCallback(
    (mutate: (rows: KioskRollRow[]) => KioskRollRow[]) => {
      setRows((r) => {
        const next = mutate(r);
        localStorage.setItem(cacheKey(sessionDate, room), JSON.stringify(next));
        return next;
      });
      setPending(pendingCount());
      void (async () => {
        const { flush } = await import("@/lib/rollOffline");
        setPending(await flush());
      })();
    },
    [sessionDate, room],
  );

  const markPresent = (row: KioskRollRow) => {
    enqueue({
      type: "present",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      childProfileId: row.profile_id,
      occurredAt: new Date().toISOString(),
    });
    act((r) => r.map((x) => (x.profile_id === row.profile_id ? { ...x, state: "present", occurred_at: new Date().toISOString() } : x)));
  };

  const markReturned = (row: KioskRollRow) => {
    enqueue({
      type: "returned",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      childProfileId: row.profile_id,
      occurredAt: new Date().toISOString(),
    });
    act((r) => r.map((x) => (x.profile_id === row.profile_id ? { ...x, state: "present", occurred_at: new Date().toISOString() } : x)));
  };

  const recordDeparture = (child: DepartureChild, reason: DepartureReason, extra: DepartureExtra = {}) => {
    enqueue({
      type: "departure",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      childProfileId: child.profile_id,
      reason,
      occurredAt: new Date().toISOString(),
      ...extra,
    });
    act((r) =>
      r.map((x) =>
        x.profile_id === child.profile_id
          ? { ...x, state: reason === "brief_absence" ? "brief_absence" : "signed_out", departure_reason: reason, occurred_at: new Date().toISOString() }
          : x,
      ),
    );
    setDeparting(null);
  };

  // Teen bracelet scan -> confirm_room_presence (expected -> present), idempotent.
  const scanLoop = async () => {
    setNfcResult(null);
    while (abortRef.current && !abortRef.current.signal.aborted) {
      try {
        const token = await readBraceletToken(abortRef.current.signal);
        if (!online) {
          setNfcResult({ tone: "warning", heading: "OFFLINE", body: "Can't verify a bracelet scan offline. Use manual tap from the expected list." });
          break;
        }
        const { data, error } = await supabase.rpc("confirm_room_presence", {
          p_nfc_token: token,
          p_room: room,
          p_date: sessionDate,
        });
        if (error) throw error;
        const res = (data ?? [])[0] as { outcome: PresenceOutcome; display_name: string | null; expected_room: string | null } | undefined;
        if (res) {
          setNfcResult(nfcScanUi({ outcome: res.outcome, display_name: res.display_name, expected_room: res.expected_room, room }));
          if (res.outcome === "marked_present" || res.outcome === "already_present") void loadRoll();
        }
      } catch (e) {
        if ((e as Error)?.message === "cancelled") break;
        const failure = await describeFunctionError(e, { 403: "You're not rostered to this room." }, "Scan failed");
        setNfcResult({ tone: "error", heading: "SCAN FAILED", body: failure.message });
      }
    }
  };

  const startScan = () => {
    if (support === "unsupported") {
      setNfcResult({ tone: "warning", heading: "NFC UNAVAILABLE", body: "This device can't read NFC. Use manual tap to confirm." });
      return;
    }
    abortRef.current = new AbortController();
    setScanning(true);
    void scanLoop();
  };
  const stopScan = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setScanning(false);
  };

  const closeRoom = async () => {
    setCloseError(null);
    const { error } = await supabase.rpc("close_room", { p_date: sessionDate, p_room: room });
    if (error) { setCloseError(error.message); return; }
    setClosed(true);
  };

  const g = groupRoll(rows);
  const unresolved = unresolvedCount(rows);

  if (accessDenied) {
    return (
      <div className="fixed inset-0 section-navy grain-overlay flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-10 h-10 text-cream/40 mb-4" strokeWidth={1.25} />
        <h2 className="font-display text-3xl tracking-wider text-cream mb-2">NOT ROSTERED</h2>
        <p className="font-body text-cream/50 text-sm max-w-sm">
          You're not rostered to the {room} room today. The roll is only visible to its facilitator, the Safeguarding Lead, and admins.
        </p>
        <button onClick={onBack} className="mt-8 border border-cream/30 text-cream text-xs font-body font-semibold tracking-widest uppercase py-3 px-8 rounded-sm">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 section-navy grain-overlay flex flex-col overflow-hidden">
      <KioskHeader
        room={room}
        onBack={onBack}
        right={
          <div className="flex items-center gap-3">
            {!online && (
              <span className="flex items-center gap-1.5 text-[10px] font-body font-semibold tracking-widest uppercase text-[hsl(var(--bronze))]">
                <WifiOff size={13} /> Offline{pending > 0 ? ` · ${pending} queued` : ""}
              </span>
            )}
            {online && pending > 0 && (
              <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-cream/50">{pending} syncing</span>
            )}
            {scanning && <ScanningBadge />}
          </div>
        }
      />

      <div className="px-6 pb-2">
        <p className="font-body text-cream/60 text-sm">
          <span className="text-cream font-semibold">{g.needsConfirming.length + g.inRoom.length + g.temporarilyOut.length + g.out.length}</span> expected from the door ·{" "}
          <span className="text-primary font-semibold">{g.inRoom.length}</span> in room
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-40">
        {nfcResult && (
          <div className={`mb-4 border-2 rounded-sm p-4 flex items-start justify-between gap-3 ${
            nfcResult.tone === "success" ? "border-primary bg-primary/10"
            : nfcResult.tone === "info" ? "border-cream/30 bg-cream/5"
            : nfcResult.tone === "warning" ? "border-[hsl(var(--bronze))] bg-[hsl(var(--bronze))]/10"
            : "border-destructive bg-destructive/10"
          }`}>
            <div>
              <p className="font-display text-xl tracking-wider text-cream mb-1">{nfcResult.heading}</p>
              <p className="font-body text-cream/70 text-sm">{nfcResult.body}</p>
            </div>
            <button onClick={() => setNfcResult(null)} className="text-cream/50 hover:text-cream p-1" aria-label="Dismiss">
              <X size={18} />
            </button>
          </div>
        )}

        {/* NEEDS CONFIRMING — the loudest unresolved state */}
        {g.needsConfirming.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-[hsl(var(--bronze))] mb-3">
              Needs confirming ({g.needsConfirming.length})
            </h3>
            <div className="grid gap-3">
              {g.needsConfirming.map((r) => (
                <button
                  key={r.profile_id}
                  onClick={() => markPresent(r)}
                  className="w-full flex items-center gap-4 bg-card/5 hover:bg-primary/10 border-2 border-[hsl(var(--bronze))]/60 rounded-sm px-5 py-5 min-h-[64px] text-left transition-colors"
                >
                  <span className="w-9 h-9 rounded-full border-2 border-[hsl(var(--bronze))] shrink-0" aria-hidden />
                  <span className="font-display text-2xl tracking-wide text-cream flex-1">{r.display_name}</span>
                  <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-cream/40">Tap when in room</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* IN ROOM */}
        {g.inRoom.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-primary mb-3">
              In room ({g.inRoom.length})
            </h3>
            <div className="grid gap-2">
              {g.inRoom.map((r) => (
                <button
                  key={r.profile_id}
                  onClick={() => setDeparting(r)}
                  className="w-full flex items-center gap-4 bg-primary/10 border border-primary/40 rounded-sm px-5 py-4 min-h-[56px] text-left transition-colors hover:bg-primary/15"
                >
                  <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0" aria-hidden>
                    <Check className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                  </span>
                  <span className="font-display text-xl tracking-wide text-cream flex-1">{r.display_name}</span>
                  <span className="text-[10px] font-body font-semibold tracking-widest uppercase text-cream/40">In room · tap for status</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* TEMPORARILY OUT */}
        {g.temporarilyOut.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-[hsl(var(--bronze))] mb-3">
              Temporarily out ({g.temporarilyOut.length})
            </h3>
            <div className="grid gap-2">
              {g.temporarilyOut.map((r) => (
                <div key={r.profile_id} className="flex items-center gap-3 bg-[hsl(var(--bronze))]/10 border border-[hsl(var(--bronze))]/50 rounded-sm px-5 py-4 min-h-[56px]">
                  <span className="font-display text-xl tracking-wide text-cream flex-1">{r.display_name}</span>
                  <button
                    onClick={() => markReturned(r)}
                    className="bg-primary text-primary-foreground text-[11px] font-body font-semibold tracking-widest uppercase px-4 py-3 rounded-sm min-h-[44px]"
                  >
                    Mark returned
                  </button>
                  <button
                    onClick={() => setDeparting(r)}
                    className="border border-cream/30 text-cream text-[11px] font-body font-semibold tracking-widest uppercase px-4 py-3 rounded-sm min-h-[44px]"
                  >
                    Status
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SIGNED OUT */}
        {g.out.length > 0 && (
          <section className="mb-6">
            <h3 className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-cream/40 mb-3">
              Signed out ({g.out.length})
            </h3>
            <div className="grid gap-2">
              {g.out.map((r) => (
                <div key={r.profile_id} className="flex items-center gap-3 border border-cream/15 rounded-sm px-5 py-3 min-h-[48px] opacity-70">
                  <span className="font-display text-lg tracking-wide text-cream/70 flex-1">{r.display_name}</span>
                  <span className="text-[10px] font-body tracking-widest uppercase text-cream/40">{r.departure_reason}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Nfc className="w-10 h-10 text-cream/30 mb-4" strokeWidth={1.25} />
            <p className="font-body text-cream/50 text-sm max-w-sm">
              No one is expected in the {room} room yet. When door staff admit a household and select its
              {" "}{room === "Teen" ? "teens" : "children"}, they appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Teen bracelet scan + close room footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-[hsl(var(--navy))] border-t border-cream/15 p-4 safe-area-bottom">
        {closeError && (
          <div role="alert" className="mb-3 border-2 border-destructive bg-destructive/10 p-3 rounded-sm">
            <p className="font-body text-sm text-destructive font-semibold mb-1">The room can't close yet.</p>
            <p className="font-body text-xs text-cream/70">{closeError}</p>
            <ul className="font-body text-xs text-cream mt-2 space-y-0.5">
              {[...g.needsConfirming, ...g.inRoom, ...g.temporarilyOut].map((r) => (
                <li key={r.profile_id}>• {r.display_name} — {r.state === "expected" ? "needs confirming" : r.state === "present" ? "in room" : "temporarily out"}</li>
              ))}
            </ul>
          </div>
        )}
        {closed && (
          <div className="mb-3 border-2 border-primary bg-primary/10 p-3 rounded-sm">
            <p className="font-body text-sm text-primary font-semibold">Room closed — everyone accounted for.</p>
          </div>
        )}

        <div className="flex gap-3">
          {room === "Teen" && (
            !scanning ? (
              <button
                onClick={startScan}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[56px]"
              >
                <Nfc size={16} /> Scan bracelet
              </button>
            ) : (
              <button
                onClick={stopScan}
                className="flex-1 flex items-center justify-center gap-2 border border-cream/30 text-cream text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[56px]"
              >
                <Nfc size={16} className="animate-pulse" /> Stop scanning
              </button>
            )
          )}
          <button
            onClick={() => void closeRoom()}
            disabled={!online || closed}
            className="flex-1 bg-[hsl(var(--bronze))] text-navy text-xs font-body font-semibold tracking-widest uppercase py-4 rounded-sm min-h-[56px] disabled:opacity-40"
          >
            {online
              ? unresolved > 0
                ? `Close room (${unresolved} to resolve)`
                : "Close room — all accounted"
              : "Reconnect to close"}
          </button>
        </div>
      </footer>

      {departing && (
        <DepartureSheet
          child={{ profile_id: departing.profile_id, display_name: departing.display_name, teen_self_signout: canSelfSignOut(departing) }}
          room={room}
          sessionDate={sessionDate}
          onCancel={() => setDeparting(null)}
          onDepart={recordDeparture}
        />
      )}
    </div>
  );
};

// ── Shared bits ─────────────────────────────────────────────────────────────

const ScanningBadge = () => (
  <span className="flex items-center gap-1.5 text-[10px] font-body font-semibold tracking-widest uppercase text-primary">
    <Nfc size={13} className="animate-pulse" /> Scanning
  </span>
);

const KioskHeader = ({ room, onBack, right }: { room: Room; onBack: () => void; right?: React.ReactNode }) => (
  <header className="px-6 pt-6 pb-3 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <button onClick={onBack} className="text-cream/50 hover:text-cream p-2 -ml-2" aria-label="Back to room selection">
        <ArrowLeft size={20} />
      </button>
      <div>
        <p className="text-[10px] font-body tracking-[0.5em] uppercase text-primary">Mindcast Kiosk</p>
        <h1 className="font-display text-2xl tracking-[0.2em] text-cream mt-0.5">{room.toUpperCase()} ROOM</h1>
      </div>
    </div>
    {right}
  </header>
);

export default Kiosk;
