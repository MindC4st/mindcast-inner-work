import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

// Schedule parallel adult/teen/child tracks per day (scheduled_sessions).
// Powers the member "today's session for my track" lookup and the kiosk's
// track tagging.

type Row = {
  id: string;
  session_date: string;
  track: string;
  week_number: number;
  room: string | null;
  session_code: string | null;
  status: string;
};

const TRACKS = ["Adult", "Teen", "Child"] as const;

const AdminScheduling = ({ embedded = false }: { embedded?: boolean }) => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState({ session_date: "", track: "Adult", week_number: 1, room: "", session_code: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await db
      .from("scheduled_sessions")
      .select("*")
      .order("session_date", { ascending: false })
      .limit(200);
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.session_date) { toast({ title: "Pick a date" }); return; }
    setSaving(true);
    const { error } = await db.from("scheduled_sessions").upsert(
      {
        session_date: form.session_date,
        track: form.track,
        week_number: Number(form.week_number),
        room: form.room || null,
        session_code: form.session_code ? form.session_code.toUpperCase() : null,
      },
      { onConflict: "session_date,track" },
    );
    setSaving(false);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return; }
    setForm({ ...form, room: "", session_code: "" });
    load();
  };

  const setStatus = async (id: string, status: string) => {
    if (status === "ended" && !window.confirm("End this scheduled session? Members will no longer see it as live.")) return;
    const { error } = await db.from("scheduled_sessions").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Could not update session", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <div className={`${embedded ? "" : "min-h-screen "}bg-background text-foreground`}>
      {!embedded && (
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/admin" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="text-sm text-foreground/50 hover:text-foreground">← Admin</Link>
      </nav>
      )}
      <div className="max-w-5xl mx-auto px-0 sm:px-6 pt-4 sm:pt-10">
        <p className="portal-label mb-2">Sessions</p>
        <h1 className="font-serif text-3xl sm:text-4xl mb-2">Session scheduling</h1>
        <p className="mb-7 font-body text-sm leading-6 text-muted-foreground">Create each room’s date, track and join code, then move it live when the facilitator is ready.</p>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-8 items-end rounded-2xl border border-border bg-card p-4 sm:p-5">
          <label className="col-span-2 text-xs">Date
            <input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })}
              className="mt-1 w-full min-h-10 border rounded-lg px-3 py-2 bg-background" />
          </label>
          <label className="text-xs">Track
            <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}
              className="mt-1 w-full min-h-10 border rounded-lg px-3 py-2 bg-background">
              {TRACKS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-xs">Week
            <input type="number" min={1} max={52} value={form.week_number}
              onChange={(e) => setForm({ ...form, week_number: Number(e.target.value) })}
              className="mt-1 w-full min-h-10 border rounded-lg px-3 py-2 bg-background" />
          </label>
          <label className="text-xs">Room
            <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="mt-1 w-full min-h-10 border rounded-lg px-3 py-2 bg-background" />
          </label>
          <label className="text-xs">Code
            <input value={form.session_code} onChange={(e) => setForm({ ...form, session_code: e.target.value })}
              className="mt-1 w-full min-h-10 border rounded-lg px-3 py-2 bg-background uppercase" />
          </label>
          <button type="button" onClick={add} disabled={saving}
            className="col-span-2 sm:col-span-6 min-h-11 bg-primary text-primary-foreground rounded-xl py-2 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/20">
            {saving ? "Saving…" : "Add / update session"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="text-left text-foreground/40 border-b">
            <th className="py-2">Date</th><th>Track</th><th>Wk</th><th>Room</th><th>Code</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-foreground/[0.06]">
                <td className="py-2">{r.session_date}</td>
                <td>{r.track}</td>
                <td>{r.week_number}</td>
                <td>{r.room || "—"}</td>
                <td className="font-mono">{r.session_code || "—"}</td>
                <td>{r.status}</td>
                <td className="text-right">
                  {r.status !== "live" && <button type="button" onClick={() => setStatus(r.id, "live")} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-primary mr-2 focus:outline-none focus:ring-2 focus:ring-primary/30">Go live</button>}
                  {r.status !== "ended" && <button type="button" onClick={() => setStatus(r.id, "ended")} className="min-h-9 rounded-lg px-2 text-xs text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30">End</button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-foreground/40">No sessions scheduled yet.</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AdminScheduling;
