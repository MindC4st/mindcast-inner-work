import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Roster — who is staffing which room on a given Sunday, and the staffed
// capacity the roll call's ratio check measures against. Admin-writable;
// facilitators can see it (RLS enforces the difference).

type Room = "Adult" | "Teen" | "Child";
const ROOMS: Room[] = ["Adult", "Teen", "Child"];

type StaffOption = { profile_id: string; name: string };
type RosterRow = { id: string; room: Room; profile_id: string; duty: string; name?: string };
type Staffing = { staffed_adults: number; capacity: number };

const nzToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland" }).format(new Date());

const AdminRoster = ({ embedded = false }: { embedded?: boolean }) => {
  const [date, setDate] = useState(nzToday());
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [staffing, setStaffing] = useState<Record<string, Staffing>>({});
  const [pick, setPick] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const loadStaff = useCallback(async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["facilitator", "admin"]);
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length === 0) { setStaff([]); return; }
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, first_name, name")
      .in("user_id", ids);
    setStaff(
      (profs ?? []).map((p) => ({
        profile_id: p.id,
        name: p.display_name || p.first_name || p.name || "Staff member",
      })),
    );
  }, []);

  const loadDay = useCallback(async () => {
    const [{ data: rows }, { data: caps }] = await Promise.all([
      supabase.from("room_roster").select("id, room, profile_id, duty").eq("session_date", date),
      supabase.from("room_staffing").select("room, staffed_adults, capacity").eq("session_date", date),
    ]);
    const names = Object.fromEntries(staff.map((s) => [s.profile_id, s.name]));
    setRoster((rows ?? []).map((r) => ({ ...r, room: r.room as Room, name: names[r.profile_id] ?? "Unknown" })));
    const map: Record<string, Staffing> = {};
    (caps ?? []).forEach((c) => { map[c.room] = { staffed_adults: c.staffed_adults, capacity: c.capacity }; });
    setStaffing(map);
  }, [date, staff]);

  useEffect(() => { void loadStaff(); }, [loadStaff]);
  useEffect(() => { if (staff.length > 0 || roster.length === 0) void loadDay(); }, [loadDay, staff.length, roster.length]);

  const add = async (room: Room) => {
    const profileId = pick[room];
    if (!profileId) return;
    setBusy(true);
    const { error } = await supabase.from("room_roster").insert({
      session_date: date,
      room,
      profile_id: profileId,
      duty: "facilitator",
    });
    setBusy(false);
    if (error) {
      toast({
        title: error.code === "23505" ? "Already rostered" : "Couldn't roster",
        description: error.code === "23505" ? "That person is already on this room's roster." : error.message,
        variant: "destructive",
      });
      return;
    }
    void loadDay();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("room_roster").delete().eq("id", id);
    if (!error) void loadDay();
    else toast({ title: "Couldn't remove", description: error.message, variant: "destructive" });
  };

  const setDuty = async (row: RosterRow, duty: string) => {
    const { error } = await supabase.from("room_roster").update({ duty }).eq("id", row.id);
    if (!error) void loadDay();
  };

  const saveStaffing = async (room: Room, patch: Partial<Staffing>) => {
    const current = staffing[room] ?? { staffed_adults: 2, capacity: 0 };
    const next = { ...current, ...patch };
    const { error } = await supabase.from("room_staffing").upsert({
      session_date: date,
      room,
      staffed_adults: next.staffed_adults,
      capacity: next.capacity,
    }, { onConflict: "session_date,room" });
    if (error) {
      toast({ title: "Couldn't save staffing", description: error.message, variant: "destructive" });
      return;
    }
    setStaffing((s) => ({ ...s, [room]: next }));
  };

  const roomAssigned = (room: Room) =>
    new Set(roster.filter((r) => r.room === room).map((r) => r.profile_id));

  return (
    <div className={embedded ? "" : "p-8"}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-foreground flex items-center gap-2">
            <CalendarDays size={20} className="text-primary" /> SUNDAY ROSTER
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Who runs each room — and the capacity the roll call checks against.
          </p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Session date"
          className="bg-card border border-border rounded-sm px-3 py-2 text-sm font-body text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {ROOMS.map((room) => {
          const roomRows = roster.filter((r) => r.room === room);
          const leads = roomRows.filter((r) => r.duty === "safeguarding_lead").length;
          const cap = staffing[room];
          return (
            <div key={room} className="border border-border bg-card rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-lg tracking-wider text-foreground">{room.toUpperCase()} ROOM</h3>
                {room !== "Adult" && (
                  <span className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">
                    {roomRows.length} staff
                  </span>
                )}
              </div>

              {leads === 0 && (
                <p className="flex items-center gap-1.5 text-[11px] font-body text-destructive mb-3">
                  <ShieldAlert size={13} /> No Safeguarding Lead rostered yet.
                </p>
              )}

              <ul className="space-y-2 mb-3">
                {roomRows.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 border border-border rounded-sm px-3 py-2">
                    <span className="flex-1 min-w-0 text-sm font-body text-foreground truncate">{r.name}</span>
                    <select
                      value={r.duty}
                      onChange={(e) => void setDuty(r, e.target.value)}
                      aria-label={`Duty for ${r.name}`}
                      className={`bg-transparent text-[10px] font-body tracking-wider uppercase border border-border rounded-sm px-1.5 py-1 focus:outline-none focus:border-primary ${
                        r.duty === "safeguarding_lead" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <option value="facilitator">Facilitator</option>
                      <option value="safeguarding_lead">Safeguarding Lead</option>
                    </select>
                    <button
                      onClick={() => void remove(r.id)}
                      aria-label={`Remove ${r.name} from ${room} roster`}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
                {roomRows.length === 0 && (
                  <li className="text-xs font-body text-muted-foreground px-1">Nobody rostered yet.</li>
                )}
              </ul>

              <div className="flex gap-2 mb-4">
                <select
                  value={pick[room] ?? ""}
                  onChange={(e) => setPick((s) => ({ ...s, [room]: e.target.value }))}
                  aria-label={`Add staff to ${room} room`}
                  className="flex-1 min-w-0 bg-transparent border border-border rounded-sm px-2 py-2 text-xs font-body text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Add staff…</option>
                  {staff
                    .filter((s) => !roomAssigned(room).has(s.profile_id))
                    .map((s) => (
                      <option key={s.profile_id} value={s.profile_id}>{s.name}</option>
                    ))}
                </select>
                <button
                  onClick={() => void add(room)}
                  disabled={!pick[room] || busy}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 text-[10px] tracking-widest uppercase font-body disabled:opacity-40"
                >
                  <UserPlus size={12} /> Add
                </button>
              </div>

              {room !== "Adult" && (
                <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-[9px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      Safety-checked adults
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={cap?.staffed_adults ?? 2}
                      onChange={(e) => void saveStaffing(room, { staffed_adults: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full bg-transparent border border-border rounded-sm px-2 py-1.5 text-sm font-body text-foreground focus:outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[9px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      Child capacity (0 = off)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={cap?.capacity ?? 0}
                      onChange={(e) => void saveStaffing(room, { capacity: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full bg-transparent border border-border rounded-sm px-2 py-1.5 text-sm font-body text-foreground focus:outline-none focus:border-primary"
                    />
                  </label>
                  <p className="col-span-2 text-[10px] font-body text-muted-foreground leading-relaxed">
                    Two safety-checked adults minimum for any room with children. The roll warns
                    and requires acknowledgement when present children exceed capacity.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminRoster;
