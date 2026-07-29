import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Standalone Q&A moderation queue across live sessions. Facilitator RLS only
// exposes is_public=true rows, so this queue is the shared-response stream.

type Resp = {
  id: string;
  session_code: string;
  display_name: string;
  response_text: string;
  moderation_status: string;
  hidden: boolean;
  created_at: string;
};

type WallItem = { id: string; table: "workbook_entries" | "check_ins"; text: string; created_at: string };

const AdminModeration = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Resp[]>([]);
  const [wall, setWall] = useState<WallItem[]>([]);

  // The legacy display walls (/display/wordcloud, /display/goals) now fail
  // closed — nothing projects until it's approved here.
  const loadWall = async () => {
    const [{ data: words }, { data: goals }] = await Promise.all([
      (supabase as any).from("workbook_entries")
        .select("id, leaving_word, created_at")
        .eq("share_leaving_word", true).eq("leaving_word_status", "pending")
        .not("leaving_word", "is", null).order("created_at", { ascending: false }).limit(100),
      (supabase as any).from("check_ins")
        .select("id, goal_update, checked_in_at")
        .eq("share_goal_publicly", true).eq("goal_status", "pending")
        .not("goal_update", "is", null).order("checked_in_at", { ascending: false }).limit(100),
    ]);
    setWall([
      ...(words || []).map((w: any) => ({ id: w.id, table: "workbook_entries" as const, text: w.leaving_word, created_at: w.created_at })),
      ...(goals || []).map((g: any) => ({ id: g.id, table: "check_ins" as const, text: g.goal_update, created_at: g.checked_in_at })),
    ]);
  };

  const decideWall = async (item: WallItem, status: "approved" | "denied") => {
    const column = item.table === "workbook_entries" ? "leaving_word_status" : "goal_status";
    const { error } = await (supabase as any).from(item.table).update({ [column]: status }).eq("id", item.id);
    if (error) toast({ title: "Couldn't update", description: error.message, variant: "destructive" });
    else setWall((w) => w.filter((x) => !(x.id === item.id && x.table === item.table)));
  };

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

  useEffect(() => { loadWall(); }, []);

  const pending = rows.filter((r) => !r.hidden && r.moderation_status === "pending");
  const decided = rows.filter((r) => r.hidden || r.moderation_status !== "pending");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-foreground/[0.06]">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em]">MINDCAST</Link>
        <Link to="/admin" className="flex items-center gap-2 text-[10px] tracking-[0.12em] font-body text-foreground/40 hover:text-foreground/70">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
        <p className="text-[10px] font-body tracking-[0.3em] uppercase text-primary mb-2">Admin</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-wider mb-2">Q&amp;A MODERATION</h1>
        <p className="text-foreground/50 text-sm font-body mb-8">Shared responses awaiting a decision update live.</p>

        {/* Legacy display walls — fail closed, so approve here to project. */}
        <div className="flex items-baseline gap-2 mb-3">
          <h2 className="font-display text-base tracking-wider">DISPLAY WALLS</h2>
          <span className="text-[10px] font-body uppercase tracking-widest text-foreground/40">({wall.length})</span>
        </div>
        <p className="text-foreground/40 text-xs font-body mb-3">
          Words and goals members chose to share. Nothing reaches the projector until approved.
        </p>
        {wall.length === 0 && (
          <p className="text-foreground/40 text-sm font-body border border-foreground/10 rounded-sm py-6 text-center mb-10">Nothing waiting.</p>
        )}
        {wall.map((w) => (
          <div key={`${w.table}-${w.id}`} className="border border-foreground/10 rounded-sm p-4 mb-2 bg-foreground/[0.02]">
            <div className="flex justify-between items-center text-[10px] font-body uppercase tracking-widest text-foreground/40 mb-2">
              <span>{w.table === "workbook_entries" ? "Word cloud" : "Goal wall"}</span>
            </div>
            <p className="text-sm font-body text-foreground mb-3">{w.text}</p>
            <div className="flex gap-2">
              <button onClick={() => decideWall(w, "approved")} className="flex items-center gap-1.5 text-[10px] font-body font-semibold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm px-3 py-2">
                <Check size={12} /> Approve
              </button>
              <button onClick={() => decideWall(w, "denied")} className="flex items-center gap-1.5 text-[10px] font-body font-semibold tracking-widest uppercase border border-foreground/20 hover:border-foreground/40 rounded-sm px-3 py-2">
                <EyeOff size={12} /> Hold
              </button>
            </div>
          </div>
        ))}

        <div className="flex items-baseline gap-2 mb-3 mt-10">
          <h2 className="font-display text-base tracking-wider">PENDING</h2>
          <span className="text-[10px] font-body uppercase tracking-widest text-foreground/40">({pending.length})</span>
        </div>
        {pending.length === 0 && (
          <p className="text-foreground/40 text-sm font-body border border-foreground/10 rounded-sm py-6 text-center mb-10">Nothing waiting.</p>
        )}
        {pending.map((r) => (
          <div key={r.id} className="border border-foreground/10 rounded-sm p-4 mb-2 bg-foreground/[0.02]">
            <div className="flex justify-between items-center text-[10px] font-body uppercase tracking-widest text-foreground/40 mb-2">
              <span>{r.display_name} · {r.session_code}</span>
              <span>{new Date(r.created_at).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-foreground font-body mb-3 leading-relaxed">{r.response_text}</p>
            <div className="flex gap-2">
              <button onClick={() => approve(r.id)} className="flex items-center gap-1.5 text-[10px] font-body font-semibold tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm px-3 py-2">
                <Check size={12} strokeWidth={1.5} /> Approve
              </button>
              <button onClick={() => hide(r.id)} className="flex items-center gap-1.5 text-[10px] font-body font-semibold tracking-widest uppercase border border-foreground/15 text-foreground/70 hover:border-destructive/40 hover:text-destructive rounded-sm px-3 py-2">
                <EyeOff size={12} strokeWidth={1.5} /> Hide
              </button>
            </div>
          </div>
        ))}

        <h2 className="font-display text-base tracking-wider mt-10 mb-3">RECENT DECISIONS</h2>
        <div className="border border-foreground/10 rounded-sm">
          {decided.slice(0, 30).map((r) => (
            <div key={r.id} className="flex justify-between items-center text-sm font-body border-b border-foreground/[0.06] last:border-0 px-4 py-2.5">
              <span className="truncate mr-3 text-foreground/70">{r.response_text}</span>
              <span className="text-[10px] font-body uppercase tracking-widest text-foreground/40 shrink-0">{r.hidden ? "hidden" : r.moderation_status}</span>
            </div>
          ))}
          {decided.length === 0 && <p className="text-foreground/40 text-sm font-body py-6 text-center">Nothing yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminModeration;
