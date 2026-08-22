// CommerceCustomers — commerce customer records only.
// Deliberately separated from programme data: no reflections, no session
// history, no participation — purchasing only.
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/shop";
import { Search } from "lucide-react";

type Customer = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_id: string | null;
  created_at: string;
  orders: { id: string; order_number: string | null; amount_total_cents: number; currency: string; payment_status: string; created_at: string }[];
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });

const CommerceCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const { data } = await db
      .from("shop_customers")
      .select("id, email, first_name, last_name, profile_id, created_at, shop_orders(id, order_number, amount_total_cents, currency, payment_status, created_at)")
      .order("created_at", { ascending: false })
      .limit(500);
    setCustomers(((data ?? []) as unknown as (Omit<Customer, "orders"> & { shop_orders: Customer["orders"] })[])
      .map(({ shop_orders, ...c }) => ({ ...c, orders: shop_orders ?? [] })));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      (c.email || "").toLowerCase().includes(q) ||
      `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase().includes(q));
  }, [customers, query]);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">CUSTOMERS</h2>
          <p className="text-sm text-muted-foreground">Commerce records only — purchasing is kept separate from programme participation.</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or email…"
            className="pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-sm w-56 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-xs uppercase tracking-widest text-muted-foreground animate-pulse py-12 text-center">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="border border-border bg-card rounded-sm p-10 text-center text-sm text-muted-foreground">No customers yet.</div>
      ) : (
        <div className="border border-border rounded-xl overflow-x-auto bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-foreground/[0.03] text-left">
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Customer</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Email</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Orders</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground text-right">Total spend</th>
                <th className="px-4 py-2.5 text-[10px] font-body tracking-widest uppercase text-muted-foreground">Since</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const paid = c.orders.filter((o) => ["paid", "partially_refunded"].includes(o.payment_status));
                const spend = paid.reduce((s, o) => s + o.amount_total_cents, 0);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold">
                      {[c.first_name, c.last_name].filter(Boolean).join(" ") || "—"}
                      {c.profile_id && <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">member</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-right">{c.orders.length}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(spend)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(c.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CommerceCustomers;
