import { useCallback, useEffect, useState } from "react";
import { HandHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Concession queue — one step requested, no explanation asked (the schema has
// nowhere to store one). Approve applies the status here; the concession rate
// itself is then applied to their subscription in Stripe. Concession status is
// never shown anywhere a member could see it.

type Request = {
  id: string;
  user_id: string;
  status: string;
  requested_at: string;
  decided_at: string | null;
  name: string;
  email: string;
};

const AdminConcessions = ({ embedded = false }: { embedded?: boolean }) => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: reqs } = await supabase
      .from("concession_requests")
      .select("id, user_id, status, requested_at, decided_at")
      .order("requested_at", { ascending: false })
      .limit(200);

    const userIds = [...new Set((reqs ?? []).map((r) => r.user_id))];
    let nameOf: Record<string, { name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, first_name, name, email")
        .in("user_id", userIds);
      nameOf = Object.fromEntries(
        (profs ?? []).map((p) => [
          p.user_id,
          { name: p.display_name || p.first_name || p.name || "Member", email: p.email ?? "" },
        ]),
      );
    }

    setRows(
      (reqs ?? []).map((r) => ({
        ...r,
        name: nameOf[r.user_id]?.name ?? "Member",
        email: nameOf[r.user_id]?.email ?? "",
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const decide = async (row: Request, status: "active" | "declined" | "ended") => {
    const { error } = await supabase
      .from("concession_requests")
      .update({ status, decided_at: new Date().toISOString(), decided_by: user?.id ?? null })
      .eq("id", row.id);
    if (error) {
      toast({ title: "Couldn't update", description: error.message, variant: "destructive" });
      return;
    }
    if (status === "active") {
      toast({
        title: "Concession approved",
        description: `Now apply the concession rate to ${row.name}'s subscription in Stripe.`,
      });
    }
    void load();
  };

  const waiting = rows.filter((r) => r.status === "requested");
  const active = rows.filter((r) => r.status === "active");
  const past = rows.filter((r) => r.status === "declined" || r.status === "ended");

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-NZ", { timeZone: "Pacific/Auckland", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

  const btn = "px-3 py-1.5 text-[10px] font-body tracking-widest uppercase transition-colors disabled:opacity-40";

  return (
    <div className={embedded ? "" : "p-8"}>
      <h2 className="font-display text-2xl tracking-wider text-foreground flex items-center gap-2 mb-1">
        <HandHeart size={20} className="text-primary" /> CONCESSION PLACES
      </h2>
      <p className="text-xs text-muted-foreground font-body mb-6 max-w-2xl leading-relaxed">
        Requested in one step from the membership page. No reason is collected and none is needed —
        approve or decline, then apply the concession rate in Stripe. Status here is never visible
        to members.
      </p>

      {loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-foreground/60 mb-3">
              Waiting ({waiting.length})
            </h3>
            {waiting.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body">Nothing waiting.</p>
            ) : (
              <ul className="space-y-2">
                {waiting.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 border border-border bg-card rounded-sm px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground font-body truncate">
                        {r.email} · requested {fmt(r.requested_at)}
                      </p>
                    </div>
                    <button onClick={() => void decide(r, "active")} className={`${btn} bg-primary text-primary-foreground hover:bg-primary/90`}>
                      Approve
                    </button>
                    <button onClick={() => void decide(r, "declined")} className={`${btn} border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40`}>
                      Decline
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-foreground/60 mb-3">
              Active ({active.length})
            </h3>
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground font-body">No active concession places.</p>
            ) : (
              <ul className="space-y-2">
                {active.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 border border-border bg-card rounded-sm px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-semibold text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground font-body truncate">
                        {r.email} · active since {r.decided_at ? fmt(r.decided_at) : fmt(r.requested_at)}
                      </p>
                    </div>
                    <button onClick={() => void decide(r, "ended")} className={`${btn} border border-border text-muted-foreground hover:text-foreground`}>
                      End place
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-foreground/60 mb-3">
                Past ({past.length})
              </h3>
              <ul className="space-y-1">
                {past.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2">
                    <p className="text-xs font-body text-muted-foreground truncate">
                      {r.name} · {r.status} {r.decided_at ? `· ${fmt(r.decided_at)}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminConcessions;
