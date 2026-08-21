import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Room } from "@/lib/rollOffline";

// Departure sheet: the reason and the person ARE the record.
//
// Shared between the facilitator RoomRoll (phone) and the room attendance
// kiosk (tablet). There is deliberately no plain "left early": a departure
// MUST carry a structured reason, and a collection MUST reference a guardian
// or a pre-authorised collector — enforced by record_departure in the DB.

export type DepartureReason =
  | "collected"
  | "moved"
  | "brief_absence"
  | "unaccompanied"
  | "self_signout";

export type DepartureExtra = {
  collectedByProfile?: string;
  collectedByCollector?: string;
  destination?: Room;
};

/** Minimal row shape — works with RoomRoll's RollRow and the kiosk's rows. */
export type DepartureChild = {
  profile_id: string;
  display_name: string;
  teen_self_signout?: boolean;
};

type CollectionOption = { kind: "guardian" | "collector"; id: string; name: string };

const ROOMS: Room[] = ["Adult", "Teen", "Child"];

export const DepartureSheet = ({
  child,
  room,
  sessionDate,
  onCancel,
  onDepart,
}: {
  child: DepartureChild;
  room: Room;
  sessionDate: string;
  onCancel: () => void;
  onDepart: (child: DepartureChild, reason: DepartureReason, extra?: DepartureExtra) => void;
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
            {room === "Teen" && child.teen_self_signout && (
              <button
                className={`${big} border-primary text-foreground`}
                onClick={() => onDepart(child, "self_signout")}
              >
                SIGNED THEMSELVES OUT — guardian has enabled this
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

export default DepartureSheet;
