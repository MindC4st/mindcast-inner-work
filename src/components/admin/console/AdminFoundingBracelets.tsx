import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FOUNDING_CAP } from "@/lib/foundingBracelets";

// Founding NFC Bracelets — the first-100 ledger. Shows who holds a founding
// entitlement, whether their free bracelet is claimed, and by which order.
// Read-only: entitlements are created by checkout/webhook/RPCs only.

type Row = {
  id: string;
  email_norm: string;
  profile_id: string | null;
  household_id: string | null;
  seat_number: number | null;
  status: "reserved" | "allocated" | "claimed" | "released";
  source: string;
  reserved_at: string;
  allocated_at: string | null;
  claimed_at: string | null;
  bracelet_order_id: string | null;
  member_name: string;
  membership_status: string;
  household_name: string;
  order_number: string | null;
};

const STATUS_LABEL: Record<Row["status"], string> = {
  reserved: "Reserved (checkout in flight)",
  allocated: "Entitled — unclaimed",
  claimed: "Claimed",
  released: "Released",
};

const AdminFoundingBracelets = ({ embedded = false }: { embedded?: boolean }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showReleased, setShowReleased] = useState(false);

  const load = useCallback(async () => {
    const { data: entitlements } = await supabase
      .from("founding_bracelets")
      .select("id, email_norm, profile_id, household_id, seat_number, status, source, reserved_at, allocated_at, claimed_at, bracelet_order_id")
      .order("seat_number", { ascending: true, nullsFirst: false })
      .limit(500);

    const base = (entitlements ?? []) as Omit<Row, "member_name" | "membership_status" | "household_name" | "order_number">[];

    const profileIds = [...new Set(base.map((r) => r.profile_id).filter((x): x is string => Boolean(x)))];
    let nameOf: Record<string, { name: string; membership_status: string }> = {};
    if (profileIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, first_name, name, membership_status")
        .in("id", profileIds);
      nameOf = Object.fromEntries(
        (profs ?? []).map((p) => [
          p.id,
          { name: p.display_name || p.first_name || p.name || "Member", membership_status: p.membership_status ?? "none" },
        ]),
      );
    }

    const householdIds = [...new Set(base.map((r) => r.household_id).filter((x): x is string => Boolean(x)))];
    let householdOf: Record<string, string> = {};
    if (householdIds.length > 0) {
      const { data: hhs } = await supabase.from("households").select("id, name").in("id", householdIds);
      householdOf = Object.fromEntries((hhs ?? []).map((h) => [h.id, h.name || "Household"]));
    }

    const orderIds = [...new Set(base.map((r) => r.bracelet_order_id).filter((x): x is string => Boolean(x)))];
    let orderOf: Record<string, string> = {};
    if (orderIds.length > 0) {
      const { data: orders } = await supabase.from("shop_orders").select("id, order_number").in("id", orderIds);
      orderOf = Object.fromEntries((orders ?? []).map((o) => [o.id, o.order_number ?? ""]));
    }

    setRows(base.map((r) => ({
      ...r,
      member_name: r.profile_id ? (nameOf[r.profile_id]?.name ?? "Member") : "",
      membership_status: r.profile_id ? (nameOf[r.profile_id]?.membership_status ?? "none") : "",
      household_name: r.household_id ? (householdOf[r.household_id] ?? "") : "",
      order_number: r.bracelet_order_id ? (orderOf[r.bracelet_order_id] ?? null) : null,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const live = useMemo(() => rows.filter((r) => r.status !== "released"), [rows]);
  const allocated = live.filter((r) => r.status === "allocated").length;
  const claimed = live.filter((r) => r.status === "claimed").length;
  const reserved = live.filter((r) => r.status === "reserved").length;
  const used = allocated + claimed + reserved;
  const remaining = Math.max(0, FOUNDING_CAP - used);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => showReleased || r.status !== "released")
      .filter((r) => !q || r.email_norm.includes(q) || r.member_name.toLowerCase().includes(q) || (r.order_number ?? "").toLowerCase().includes(q));
  }, [rows, query, showReleased]);

  return (
    <div className={embedded ? "" : "max-w-5xl mx-auto px-6 py-10"}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-foreground">FOUNDING NFC BRACELETS</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            First {FOUNDING_CAP} unique member emails — one free bracelet each, ever. Children without logins never count.
          </p>
        </div>
        <div className="flex gap-3">
          {([
            { label: "Allocated", value: `${used} / ${FOUNDING_CAP}` },
            { label: "Claimed", value: String(claimed) },
            { label: "Remaining", value: String(remaining) },
          ] as const).map((s) => (
            <div key={s.label} className="border border-border rounded-md bg-card px-4 py-2.5 text-center min-w-[92px]">
              <p className="font-display text-xl text-foreground leading-none">{s.value}</p>
              <p className="text-[9px] font-body tracking-widest uppercase text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email, name or order number"
            className="w-full pl-8 pr-3 py-2 text-sm font-body bg-card border border-border rounded-md focus:outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-body text-muted-foreground">
          <input type="checkbox" checked={showReleased} onChange={(e) => setShowReleased(e.target.checked)} />
          Show released
        </label>
      </div>

      {loading ? (
        <p className="text-xs font-body uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : (
        <div className="border border-border rounded-md overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["#", "Member", "Email", "Household", "Membership", "Entitlement", "Bracelet", "Order", "Date"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-[10px] font-body font-semibold tracking-widest uppercase text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-xs font-body text-muted-foreground">No entitlements match.</td></tr>
              )}
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 font-body text-foreground">{r.seat_number ?? "—"}</td>
                  <td className="px-3 py-2.5 font-body text-foreground whitespace-nowrap">{r.member_name || "—"}</td>
                  <td className="px-3 py-2.5 font-body text-muted-foreground whitespace-nowrap">{r.email_norm}</td>
                  <td className="px-3 py-2.5 font-body text-muted-foreground whitespace-nowrap">{r.household_name || "—"}</td>
                  <td className="px-3 py-2.5 font-body text-muted-foreground whitespace-nowrap">{r.membership_status || "—"}</td>
                  <td className="px-3 py-2.5 font-body whitespace-nowrap">
                    <span className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-sm border ${
                      r.status === "claimed" ? "text-primary border-primary/40 bg-primary/10"
                        : r.status === "allocated" ? "text-foreground border-foreground/30 bg-foreground/5"
                        : r.status === "reserved" ? "text-amber-700 border-amber-600/30 bg-amber-500/10"
                        : "text-muted-foreground border-border bg-transparent"
                    }`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-body text-muted-foreground whitespace-nowrap">
                    {r.status === "claimed" ? (r.claimed_at ? new Date(r.claimed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" }) : "Yes") : "Unclaimed"}
                  </td>
                  <td className="px-3 py-2.5 font-body text-muted-foreground whitespace-nowrap">{r.order_number ?? "—"}</td>
                  <td className="px-3 py-2.5 font-body text-muted-foreground whitespace-nowrap">
                    {new Date(r.allocated_at ?? r.reserved_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFoundingBracelets;
