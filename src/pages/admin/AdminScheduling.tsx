import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
    const { data } = await (supabase as any)
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
    const { error } = await (supabase as any).from("scheduled_sessions").upsert(
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
    await (supabase as any).from("scheduled_sessions").update({ status }).eq("id", id);
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
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <h1 className="font-display text-2xl font-bold mb-6">Session scheduling</h1>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-8 items-end">
          <label className="col-span-2 text-xs">Date
            <input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background" />
          </label>
          <label className="text-xs">Track
            <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background">
              {TRACKS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-xs">Week
            <input type="number" min={1} max={52} value={form.week_number}
              onChange={(e) => setForm({ ...form, week_number: Number(e.target.value) })}
              className="w-full border rounded px-2 py-1.5 bg-background" />
          </label>
          <label className="text-xs">Room
            <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background" />
          </label>
          <label className="text-xs">Code
            <input value={form.session_code} onChange={(e) => setForm({ ...form, session_code: e.target.value })}
              className="w-full border rounded px-2 py-1.5 bg-background" />
          </label>
          <button onClick={add} disabled={saving}
            className="col-span-2 sm:col-span-6 bg-primary text-primary-foreground rounded py-2 text-sm">
            {saving ? "Saving…" : "Add / update session"}
          </button>
        </div>

        <table className="w-full text-sm">
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
                  {r.status !== "live" && <button onClick={() => setStatus(r.id, "live")} className="text-xs text-primary mr-2">Go live</button>}
                  {r.status !== "ended" && <button onClick={() => setStatus(r.id, "ended")} className="text-xs text-foreground/50">End</button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-foreground/40">No sessions scheduled yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminScheduling;
