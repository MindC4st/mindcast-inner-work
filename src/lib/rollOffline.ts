// Offline-first action queue for the room roll.
//
// Venue wifi fails on Sundays; the room must still run safely. Every roll
// action is written here FIRST with a client-generated uuid and the true
// occurred_at, then flushed to the database whenever a connection exists.
// The database treats client_event_id as idempotent, so a flush that races a
// reconnect can replay the whole queue without double-recording a departure.

import { supabase } from "@/integrations/supabase/client";

export type Room = "Adult" | "Teen" | "Child";

export type RollAction =
  | {
      type: "present";
      clientEventId: string;
      sessionDate: string;
      room: Room;
      childProfileId: string;
      occurredAt: string;
    }
  | {
      type: "departure";
      clientEventId: string;
      sessionDate: string;
      room: Room;
      childProfileId: string;
      reason: "collected" | "moved" | "brief_absence" | "unaccompanied" | "self_signout";
      collectedByProfile?: string;
      collectedByCollector?: string;
      destination?: Room;
      occurredAt: string;
    }
  | {
      type: "returned";
      clientEventId: string;
      sessionDate: string;
      room: Room;
      childProfileId: string;
      occurredAt: string;
    }
  | {
      type: "ratio_ack";
      clientEventId: string;
      sessionDate: string;
      room: Room;
      occurredAt: string;
    };

const KEY = "mindcast.roll.queue.v1";

const readQueue = (): RollAction[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as RollAction[];
  } catch {
    return [];
  }
};

const writeQueue = (q: RollAction[]) => localStorage.setItem(KEY, JSON.stringify(q));

export const pendingCount = () => readQueue().length;

export const enqueue = (action: RollAction) => {
  const q = readQueue();
  q.push(action);
  writeQueue(q);
};

/** Push one action to the database. Throws on network failure so the caller
 *  keeps it queued; a constraint/duplicate outcome counts as delivered. */
async function deliver(a: RollAction): Promise<void> {
  if (a.type === "present" || a.type === "returned" || a.type === "ratio_ack") {
    const { error } = await supabase.from("roll_events").insert({
      session_date: a.sessionDate,
      room: a.room,
      subject_profile_id: a.type === "ratio_ack" ? null : a.childProfileId,
      event: a.type === "ratio_ack" ? "ratio_ack" : a.type,
      occurred_at: a.occurredAt,
      client_event_id: a.clientEventId,
      actor_user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
    });
    // 23505 = replayed after a successful earlier flush: already delivered.
    if (error && error.code !== "23505") throw new Error(error.message);
    return;
  }
  // Departure — the atomic server-side path (side effects included).
  const { error } = await supabase.rpc("record_departure", {
    p_date: a.sessionDate,
    p_room: a.room,
    p_child: a.childProfileId,
    p_reason: a.reason,
    p_collected_by_profile: a.collectedByProfile ?? undefined,
    p_collected_by_collector: a.collectedByCollector ?? undefined,
    p_destination: a.destination ?? undefined,
    p_occurred_at: a.occurredAt,
    p_client_event_id: a.clientEventId,
  });
  if (error) throw new Error(error.message);
}

let flushing = false;

/** Flush the queue in order. Stops at the first delivery failure (usually
 *  offline) and leaves the remainder queued. Returns how many are left. */
export async function flush(): Promise<number> {
  if (flushing) return pendingCount();
  flushing = true;
  try {
    let q = readQueue();
    while (q.length > 0) {
      try {
        await deliver(q[0]);
      } catch {
        break; // still offline (or rejected) — keep the queue intact
      }
      q = q.slice(1);
      writeQueue(q);
    }
    // Ask the courier to drain any guardian emails queued by departures.
    if (q.length === 0 && navigator.onLine) {
      supabase.functions.invoke("notify-outbox", { body: {} }).catch(() => undefined);
    }
    return q.length;
  } finally {
    flushing = false;
  }
}

/** Wire flush to reconnect. Returns an unsubscribe. */
export function autoFlush(onChange?: (pending: number) => void): () => void {
  const run = () => {
    void flush().then((n) => onChange?.(n));
  };
  window.addEventListener("online", run);
  const interval = window.setInterval(() => {
    if (navigator.onLine && pendingCount() > 0) run();
  }, 15_000);
  run();
  return () => {
    window.removeEventListener("online", run);
    window.clearInterval(interval);
  };
}
