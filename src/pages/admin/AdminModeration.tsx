import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Standalone Q&A moderation queue across live sessions. Facilitator RLS now
// exposes only is_public=true rows (private reflections stay private), so this
// queue is exactly the shared-response stream awaiting a decision.

type Resp = {
  id: string;
  session_code: string;
  display_name: string;
  response_text: string;
  moderation_status: string;
  hidden: boolean;
  created_at: string;
};

const AdminModeration = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Resp[]>([]);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("session_responses")
      .select("id, session_code, display_name, response_text, moderation_status, hidden, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data || []);
  };

  useEffect(() => {
    load();
    const ch = (supabase as any)
      .channel("moderation-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "session_responses" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const approve = async (id: string) => {
    const { error } = await (supabase as any).from("session_responses").update({ moderation_status: "approved" }).eq("id", id);
    if (error) toast({ title: "Couldn't approve", description: error.message, variant: "destructive" });
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, moderation_status: "approved" } : x)));
  };
  const hide = async (id: string) => {
    const { error } = await (supabase as any).from("session_responses").update({ hidden: true }).eq("id", id);
    if (error) toast({ title: "Couldn't hide", description: error.message, variant: "destructive" });
    else setRows((r) => r.filter((x) => x.id !== id));
  };

  const pending = rows.filter((r) => !r.hidden && r.moderation_status === "pending");
  const decided = rows.filter((r) => r.hidden || r.moderation_status !== "pending");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/admin" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="text-sm text-foreground/50 hover:text-foreground">← Admin</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 pt-10">
        <h1 className="font-display text-2xl font-bold mb-1">Q&amp;A moderation</h1>
        <p className="text-foreground/40 text-sm mb-6">Shared responses awaiting a decision update live.</p>

        <h2 className="text-sm font-semibold mb-2">Pending ({pending.length})</h2>
        {pending.map((r) => (
          <div key={r.id} className="border rounded p-3 mb-2">
            <div className="flex justify-between text-xs text-foreground/40 mb-1">
              <span>{r.display_name} · {r.session_code}</span>
              <span>{new Date(r.created_at).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm mb-2">{r.response_text}</p>
            <div className="flex gap-2">
              <button onClick={() => approve(r.id)} className="text-xs bg-primary text-primary-foreground rounded px-3 py-1">Approve</button>
              <button onClick={() => hide(r.id)} className="text-xs border rounded px-3 py-1">Hide</button>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-foreground/40 text-sm mb-6">Nothing waiting.</p>}

        <h2 className="text-sm font-semibold mt-8 mb-2">Recent decisions</h2>
        {decided.slice(0, 30).map((r) => (
          <div key={r.id} className="flex justify-between text-sm border-b border-foreground/[0.06] py-1.5">
            <span className="truncate mr-2">{r.response_text}</span>
            <span className="text-foreground/40 shrink-0">{r.hidden ? "hidden" : r.moderation_status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminModeration;
