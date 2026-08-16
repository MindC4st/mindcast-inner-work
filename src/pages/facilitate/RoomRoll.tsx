import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { enqueue, autoFlush, pendingCount, type Room } from "@/lib/rollOffline";
import { ArrowLeft, Printer, WifiOff } from "lucide-react";

// The room roll — a child safety system operated with one hand, on a phone,
// in a room with children in it.
//
// Design intent, in order:
//   1. "Signed in but not in the room" is the loudest thing on the screen.
//      The gap between the door and the room is where a child goes missing.
//   2. The common path (mark present) is one large tap. The uncommon path
//      (unaccompanied departure) is deliberately harder and confirms.
//   3. Everything works offline and syncs later; the queue badge says so.
//   4. The room cannot close until every child is accounted for — the server
//      enforces it; this screen just makes the remaining names visible.

type RollRow = {
  profile_id: string;
  display_name: string;
  state: "expected" | "present" | "brief_absence" | "signed_out" | "flagged";
  last_event: string;
  departure_reason: string | null;
  occurred_at: string;
  guardian_name: string | null;
  guardian_phone: string | null;
};

type CollectionOption = { kind: "guardian" | "collector"; id: string; name: string };

type Alert = {
  id: string;
  kind: string;
  subject_name: string;
  body: string;
  created_at: string;
};

const ROOMS: Room[] = ["Adult", "Teen", "Child"];
const BRIEF_ABSENCE_LIMIT_MS = 10 * 60 * 1000;

const nzToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

const timeOf = (iso: string) =>
  new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const cacheKey = (date: string, room: string) => `mindcast.roll.cache.${date}.${room}`;

const RoomRoll = () => {
  const params = useParams<{ room: string }>();
  const room = (ROOMS.find((r) => r.toLowerCase() === params.room?.toLowerCase()) ?? "Child") as Room;
  const sessionDate = nzToday();

  const [rows, setRows] = useState<RollRow[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [staffing, setStaffing] = useState<{ staffed_adults: number; capacity: number } | null>(null);
  const [ratioAcked, setRatioAcked] = useState(false);
  const [pending, setPending] = useState(pendingCount());
  const [online, setOnline] = useState(navigator.onLine);
  const [departing, setDeparting] = useState<RollRow | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [, forceTick] = useState(0);
  const alertedOverdue = useRef<Set<string>>(new Set());

  /* ── data ── */

  const loadRoll = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("room_roll", { p_date: sessionDate, p_room: room });
      if (error) throw error;
      const fetched = (data ?? []) as RollRow[];
      setRows(fetched);
      localStorage.setItem(cacheKey(sessionDate, room), JSON.stringify(fetched));
      if (fetched.length === 0) {
        // Distinguish "empty room" from "not rostered": probe roster access.
        const { data: ok } = await supabase.rpc("can_access_room_roll", { p_date: sessionDate, p_room: room });
        setAccessDenied(ok === false);
      } else {
        setAccessDenied(false);
      }
    } catch {
      // Offline — run from the cached roll.
      const cached = localStorage.getItem(cacheKey(sessionDate, room));
      if (cached) setRows(JSON.parse(cached) as RollRow[]);
    }
  }, [sessionDate, room]);

  const loadAlerts = useCallback(async () => {
    const { data } = await supabase
      .from("room_alerts")
      .select("id, kind, subject_name, body, created_at")
      .eq("session_date", sessionDate)
      .eq("target_room", room)
      .is("acknowledged_at", null)
      .order("created_at", { ascending: false });
    if (data) setAlerts(data as Alert[]);
  }, [sessionDate, room]);

  useEffect(() => {
    void loadRoll();
    void loadAlerts();
    void supabase
      .from("room_staffing")
      .select("staffed_adults, capacity")
      .eq("session_date", sessionDate)
      .eq("room", room)
      .maybeSingle()
      .then(({ data }) => setStaffing(data));

    const poll = window.setInterval(() => {
      if (navigator.onLine) {
        void loadRoll();
        void loadAlerts();
      }
    }, 30_000);
    const tick = window.setInterval(() => forceTick((n) => n + 1), 5_000);
    const onlineHandler = () => setOnline(true);
    const offlineHandler = () => setOnline(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    const stopFlush = autoFlush((n) => {
      setPending(n);
      if (n === 0) void loadRoll();
    });

    const channel = supabase
      .channel(`room-alerts-${room}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_alerts", filter: `target_room=eq.${room}` },
        () => void loadAlerts(),
      )
      .subscribe();

    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      stopFlush();
      void supabase.removeChannel(channel);
    };
  }, [loadRoll, loadAlerts, sessionDate, room]);

  /* ── actions (offline-first: queue, then flush) ── */

  const act = useCallback(
    (mutate: (rows: RollRow[]) => RollRow[]) => {
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

  const markPresent = (child: RollRow) => {
    enqueue({
      type: "present",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      childProfileId: child.profile_id,
      occurredAt: new Date().toISOString(),
    });
    act((r) =>
      r.map((x) => (x.profile_id === child.profile_id ? { ...x, state: "present", occurred_at: new Date().toISOString() } : x)),
    );
  };

  const markReturned = (child: RollRow) => {
    enqueue({
      type: "returned",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      childProfileId: child.profile_id,
      occurredAt: new Date().toISOString(),
    });
    act((r) =>
      r.map((x) => (x.profile_id === child.profile_id ? { ...x, state: "present", occurred_at: new Date().toISOString() } : x)),
    );
  };

  const recordDeparture = (
    child: RollRow,
    reason: "collected" | "moved" | "brief_absence" | "unaccompanied" | "self_signout",
    extra: { collectedByProfile?: string; collectedByCollector?: string; destination?: Room } = {},
  ) => {
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
          ? {
              ...x,
              state: reason === "brief_absence" ? "brief_absence" : "signed_out",
              departure_reason: reason,
              occurred_at: new Date().toISOString(),
            }
          : x,
      ),
    );
    setDeparting(null);
  };

  const ackRatio = () => {
    enqueue({
      type: "ratio_ack",
      clientEventId: crypto.randomUUID(),
      sessionDate,
      room,
      occurredAt: new Date().toISOString(),
    });
    setRatioAcked(true);
    setPending(pendingCount());
  };

  const ackAlert = async (id: string) => {
    setAlerts((a) => a.filter((x) => x.id !== id));
    await supabase
      .from("room_alerts")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", id);
  };

  const closeRoom = async () => {
    setCloseError(null);
    const { error } = await supabase.rpc("close_room", { p_date: sessionDate, p_room: room });
    if (error) {
      setCloseError(error.message);
      return;
    }
    setClosed(true);
  };

  /* ── derived ── */

  const flagged = rows.filter((r) => r.state === "expected");
  const present = rows.filter((r) => r.state === "present");
  const away = rows.filter((r) => r.state === "brief_absence");
  const out = rows.filter((r) => r.state === "signed_out");
  const unresolved = flagged.length + present.length + away.length;

  const ratioProblem =
    staffing !== null &&
    ((staffing.capacity > 0 && present.length > staffing.capacity) || staffing.staffed_adults < 2);

  // Brief-absence overdue: escalate once per child per absence.
  useEffect(() => {
    for (const r of away) {
      const overdueBy = Date.now() - new Date(r.occurred_at).getTime();
      const key = `${r.profile_id}-${r.occurred_at}`;
      if (overdueBy > BRIEF_ABSENCE_LIMIT_MS && !alertedOverdue.current.has(key)) {
        alertedOverdue.current.add(key);
        void supabase.rpc("raise_room_alert", {
          p_source_room: room,
          p_target_room: "Adult",
          p_kind: "brief_absence_overdue",
          p_subject_name: r.display_name,
          p_body: `${r.display_name} stepped out of the ${room} room more than 10 minutes ago and has not returned. Please check with their guardian now.`,
        });
      }
    }
  });

  /* ── render ── */

  if (closed) {
    return (
      <div className="min-h-screen bg-[hsl(var(--ivory))] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-5xl text-foreground mb-3">{room.toUpperCase()} ROOM CLOSED</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">
            Every child is accounted for. Thank you — this is the part that matters.
          </p>
          <Link to="/admin" className="font-body text-sm text-primary underline underline-offset-4">
            Back to the console
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--ivory))] pb-40">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[hsl(var(--navy))] text-cream px-4 py-3 flex items-center gap-3 print:hidden">
        <Link to="/admin" aria-label="Back to console" className="p-2 -ml-2">
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl leading-none tracking-wide">{room.toUpperCase()} ROOM ROLL</h1>
          <p className="font-body text-[11px] text-cream/60">{sessionDate} · Pacific/Auckland</p>
        </div>
        {!online && (
          <span className="flex items-center gap-1.5 bg-cream/10 px-2.5 py-1.5 rounded-sm font-body text-[11px]">
            <WifiOff size={13} /> OFFLINE — RECORDING LOCALLY
          </span>
        )}
        {pending > 0 && (
          <span className="bg-[hsl(var(--blue))] text-cream px-2.5 py-1.5 rounded-sm font-body text-[11px]" role="status">
            {pending} TO SYNC
          </span>
        )}
        <button onClick={() => window.print()} aria-label="Print the roll" className="p-2">
          <Printer size={20} />
        </button>
      </header>

      {accessDenied && (
        <div className="m-4 border-2 border-destructive bg-destructive/5 p-4 print:hidden">
          <p className="font-body text-sm text-destructive font-semibold">
            You're not on today's roster for the {room} room. Rolls are visible only to the
            facilitators rostered to the room, the Safeguarding Lead and admins.
          </p>
        </div>
      )}

      {/* In-room alerts — the loudest surface on the screen */}
      {alerts.map((a) => (
        <div key={a.id} role="alert" className="m-4 border-2 border-destructive bg-destructive text-destructive-foreground p-4 print:hidden">
          <p className="font-display text-xl tracking-wide mb-1">⚠ {a.subject_name}</p>
          <p className="font-body text-sm mb-3">{a.body}</p>
          <button
            onClick={() => void ackAlert(a.id)}
            className="bg-white text-destructive font-display tracking-widest text-sm px-5 py-3"
          >
            I'VE GOT IT — ACKNOWLEDGE
          </button>
        </div>
      ))}

      {/* Ratio warning */}
      {ratioProblem && !ratioAcked && (
        <div role="alert" className="m-4 border-2 border-[hsl(var(--blue))] bg-[hsl(var(--blue-light))] p-4 print:hidden">
          <p className="font-body text-sm text-foreground font-semibold mb-1">
            Staffing check: {present.length} children present,{" "}
            {staffing?.staffed_adults ?? 0} safety-checked adult{(staffing?.staffed_adults ?? 0) === 1 ? "" : "s"} rostered
            {staffing && staffing.capacity > 0 ? `, capacity ${staffing.capacity}` : ""}.
          </p>
          <p className="font-body text-xs text-foreground/70 mb-3">
            Two safety-checked adults minimum for any room with children in it. Get another adult
            before the session starts, then acknowledge.
          </p>
          <button onClick={ackRatio} className="bg-primary text-primary-foreground font-display tracking-widest text-sm px-5 py-3">
            ACKNOWLEDGED — IT'S BEING SORTED
          </button>
        </div>
      )}

      {/* ⚠ Signed in, not in the room — the whole reason the roll exists */}
      <section className="px-4 mt-5">
        <h2 className="font-display text-lg tracking-wider text-destructive mb-2">
          ⚠ SIGNED IN AT THE DOOR — NOT IN THE ROOM ({flagged.length})
        </h2>
        {flagged.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground border border-border bg-card px-4 py-3">
            Nobody unaccounted for. Every signed-in child is either present or signed out.
          </p>
        ) : (
          <ul className="space-y-2">
            {flagged.map((r) => (
              <li key={r.profile_id} className="border-2 border-destructive bg-card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-xl text-foreground truncate">{r.display_name}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    Signed in {timeOf(r.occurred_at)}
                    {r.guardian_name ? ` · ${r.guardian_name}${r.guardian_phone ? ` · ${r.guardian_phone}` : ""}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => markPresent(r)}
                  className="bg-primary text-primary-foreground font-display tracking-widest text-base px-5 py-4 min-h-[56px]"
                >
                  HERE
                </button>
                <button
                  onClick={() => setDeparting(r)}
                  className="border-2 border-foreground/30 text-foreground font-display tracking-widest text-sm px-4 py-4 min-h-[56px]"
                >
                  SIGN OUT
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Stepped out briefly */}
      {away.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="font-display text-lg tracking-wider text-foreground mb-2">STEPPED OUT ({away.length})</h2>
          <ul className="space-y-2">
            {away.map((r) => {
              const mins = Math.floor((Date.now() - new Date(r.occurred_at).getTime()) / 60000);
              const overdue = mins >= 10;
              return (
                <li
                  key={r.profile_id}
                  className={`border-2 bg-card p-3 flex items-center gap-3 ${overdue ? "border-destructive" : "border-[hsl(var(--blue))]"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-xl text-foreground truncate">{r.display_name}</p>
                    <p className={`font-body text-xs ${overdue ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      Out {mins} min{overdue ? " — OVERDUE, adult room alerted" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => markReturned(r)}
                    className="bg-primary text-primary-foreground font-display tracking-widest text-base px-5 py-4 min-h-[56px]"
                  >
                    BACK
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Present */}
      <section className="px-4 mt-6">
        <h2 className="font-display text-lg tracking-wider text-foreground mb-2">PRESENT ({present.length})</h2>
        {present.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground border border-border bg-card px-4 py-3">
            Nobody marked present yet. As each child arrives in the room, tap HERE beside their name above.
          </p>
        ) : (
          <ul className="space-y-2">
            {present.map((r) => (
              <li key={r.profile_id} className="border border-border bg-card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-xl text-foreground truncate">{r.display_name}</p>
                  <p className="font-body text-xs text-muted-foreground">In the room since {timeOf(r.occurred_at)}</p>
                </div>
                <button
                  onClick={() => setDeparting(r)}
                  className="border-2 border-foreground/30 text-foreground font-display tracking-widest text-sm px-4 py-4 min-h-[56px]"
                >
                  SIGN OUT
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Signed out */}
      {out.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="font-display text-lg tracking-wider text-muted-foreground mb-2">SIGNED OUT ({out.length})</h2>
          <ul className="space-y-1">
            {out.map((r) => (
              <li key={r.profile_id} className="border border-border bg-card/60 px-4 py-2.5 flex items-center justify-between">
                <p className="font-body text-base text-muted-foreground">{r.display_name}</p>
                <p className="font-body text-xs text-muted-foreground">
                  {r.departure_reason} · {timeOf(r.occurred_at)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Printable roll (paper fallback) */}
      <div className="hidden print:block px-4 mt-6">
        <h2 className="font-display text-2xl mb-2">
          {room.toUpperCase()} ROOM ROLL — {sessionDate}
        </h2>
        <table className="w-full text-sm font-body border-collapse">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 text-left">Name</th>
              <th className="border border-black px-2 py-1 text-left">State</th>
              <th className="border border-black px-2 py-1 text-left">Time</th>
              <th className="border border-black px-2 py-1 text-left">Guardian</th>
              <th className="border border-black px-2 py-1 text-left">Phone</th>
              <th className="border border-black px-2 py-1 text-left">Signed out by / notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.profile_id}>
                <td className="border border-black px-2 py-1">{r.display_name}</td>
                <td className="border border-black px-2 py-1">
                  {r.state}
                  {r.departure_reason ? ` (${r.departure_reason})` : ""}
                </td>
                <td className="border border-black px-2 py-1">{timeOf(r.occurred_at)}</td>
                <td className="border border-black px-2 py-1">{r.guardian_name ?? ""}</td>
                <td className="border border-black px-2 py-1">{r.guardian_phone ?? ""}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Close room — the hard block */}
      <footer className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-4 print:hidden safe-area-bottom">
        {closeError && (
          <div role="alert" className="mb-3 border-2 border-destructive bg-destructive/5 p-3">
            <p className="font-body text-sm text-destructive font-semibold mb-2">
              The room can't close yet — {unresolved} child{unresolved === 1 ? " is" : "ren are"} not signed out:
            </p>
            <ul className="font-body text-sm text-foreground space-y-1">
              {[...flagged, ...present, ...away].map((r) => (
                <li key={r.profile_id}>
                  <strong>{r.display_name}</strong>
                  {r.guardian_name ? ` — ${r.guardian_name}${r.guardian_phone ? `, ${r.guardian_phone}` : ""}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => void closeRoom()}
          disabled={!online}
          className="w-full bg-[hsl(var(--navy))] text-cream font-display tracking-widest text-lg py-4 disabled:opacity-50"
        >
          {online
            ? unresolved > 0
              ? `CLOSE ROOM (${unresolved} STILL TO SIGN OUT)`
              : "CLOSE ROOM — EVERYONE ACCOUNTED FOR"
            : "RECONNECT TO CLOSE THE ROOM"}
        </button>
      </footer>

      {/* Departure sheet */}
      {departing && (
        <DepartureSheet
          child={departing}
          room={room}
          sessionDate={sessionDate}
          onCancel={() => setDeparting(null)}
          onDepart={recordDeparture}
        />
      )}
    </div>
  );
};

/* ── Departure sheet: the reason and the person ARE the record ─────────── */

const DepartureSheet = ({
  child,
  room,
  sessionDate,
  onCancel,
  onDepart,
}: {
  child: RollRow;
  room: Room;
  sessionDate: string;
  onCancel: () => void;
  onDepart: (
    child: RollRow,
    reason: "collected" | "moved" | "brief_absence" | "unaccompanied" | "self_signout",
    extra?: { collectedByProfile?: string; collectedByCollector?: string; destination?: Room },
  ) => void;
}) => {
  const [options, setOptions] = useState<CollectionOption[]>([]);
  const [mode, setMode] = useState<"menu" | "collected" | "moved" | "unaccompanied">("menu");

  useEffect(() => {
    void supabase
      .rpc("collection_options", { p_date: sessionDate, p_room: room, p_child: child.profile_id })
      .then(({ data }) => setOptions((data ?? []) as CollectionOption[]));
  }, [sessionDate, room, child.profile_id]);

  const big = "w-full text-left font-body font-semibold text-base px-4 py-4 min-h-[56px] border-2 mb-2";

  return (
    <div className="fixed inset-0 z-30 bg-black/50 flex items-end print:hidden" role="dialog" aria-modal="true" aria-label={`Sign out ${child.display_name}`}>
      <div className="bg-card w-full rounded-t-lg p-5 max-h-[85vh] overflow-y-auto safe-area-bottom">
        <p className="font-display text-2xl tracking-wide text-foreground mb-1">SIGN OUT {child.display_name.toUpperCase()}</p>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Who they leave with is the record. There is no plain "left early".
        </p>

        {mode === "menu" && (
          <>
            <button className={`${big} border-primary text-foreground`} onClick={() => setMode("collected")}>
              COLLECTED — by a guardian or authorised person
            </button>
            <button className={`${big} border-primary text-foreground`} onClick={() => setMode("moved")}>
              MOVED TO ANOTHER ROOM — e.g. sitting with a parent
            </button>
            <button
              className={`${big} border-primary text-foreground`}
              onClick={() => onDepart(child, "brief_absence")}
            >
              STEPPED OUT BRIEFLY — toilet, water. Starts a 10-minute timer.
            </button>
            {room === "Teen" && (
              <button
                className={`${big} border-primary text-foreground`}
                onClick={() => onDepart(child, "self_signout")}
              >
                SIGNED THEMSELVES OUT — where the guardian has enabled it
              </button>
            )}
            <div className="border-t border-border mt-4 pt-4">
              <button
                className={`${big} border-destructive text-destructive`}
                onClick={() => setMode("unaccompanied")}
              >
                ⚠ LEFT UNACCOMPANIED — escalates immediately
              </button>
            </div>
          </>
        )}

        {mode === "collected" && (
          <>
            <p className="font-body text-sm text-foreground mb-3">Collected by:</p>
            {options.length === 0 && (
              <p className="font-body text-sm text-muted-foreground mb-3">
                No guardians or authorised collectors on record for {child.display_name}. A
                collector must be added by the guardian in advance — it can't be typed in at the
                door. If the person is here and can't be verified, speak to the Safeguarding Lead.
              </p>
            )}
            {options.map((o) => (
              <button
                key={`${o.kind}-${o.id}`}
                className={`${big} border-primary text-foreground`}
                onClick={() =>
                  onDepart(
                    child,
                    "collected",
                    o.kind === "guardian" ? { collectedByProfile: o.id } : { collectedByCollector: o.id },
                  )
                }
              >
                {o.name}
                <span className="block font-normal text-xs text-muted-foreground">
                  {o.kind === "guardian" ? "Guardian" : "Authorised collector"}
                </span>
              </button>
            ))}
            <button className="font-body text-sm text-muted-foreground underline mt-2" onClick={() => setMode("menu")}>
              Back
            </button>
          </>
        )}

        {mode === "moved" && (
          <>
            <p className="font-body text-sm text-foreground mb-3">Moved to:</p>
            {ROOMS.filter((r) => r !== room).map((r) => (
              <button
                key={r}
                className={`${big} border-primary text-foreground`}
                onClick={() => onDepart(child, "moved", { destination: r })}
              >
                {r.toUpperCase()} ROOM
                <span className="block font-normal text-xs text-muted-foreground">
                  They'll appear as expected on that room's roll.
                </span>
              </button>
            ))}
            <button className="font-body text-sm text-muted-foreground underline mt-2" onClick={() => setMode("menu")}>
              Back
            </button>
          </>
        )}

        {mode === "unaccompanied" && (
          <>
            <div role="alert" className="border-2 border-destructive bg-destructive/5 p-4 mb-3">
              <p className="font-body text-sm text-destructive font-bold mb-1">
                This records that {child.display_name} left the room with no adult and no sign-out.
              </p>
              <p className="font-body text-sm text-foreground">
                The adult-room facilitator and Safeguarding Lead are alerted on their devices
                immediately, the guardian is emailed, and a phone call must follow. Only confirm if
                that is what is happening.
              </p>
            </div>
            <button
              className={`${big} border-destructive bg-destructive text-destructive-foreground`}
              onClick={() => onDepart(child, "unaccompanied")}
            >
              CONFIRM — {child.display_name.toUpperCase()} LEFT UNACCOMPANIED
            </button>
            <button className="font-body text-sm text-muted-foreground underline mt-2" onClick={() => setMode("menu")}>
              Back — that's not what happened
            </button>
          </>
        )}

        <button
          className="w-full font-display tracking-widest text-sm text-muted-foreground border border-border py-3.5 mt-4"
          onClick={onCancel}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default RoomRoll;
