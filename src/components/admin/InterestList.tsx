import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InterestEntry {
  id: string;
  email: string;
  age_band: string | null;
  created_at: string;
}

export function InterestList() {
  const [entries, setEntries] = useState<InterestEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pilot_interest" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load interest entries:", error);
    } else {
      setEntries((data || []) as unknown as InterestEntry[]);
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = ["Email", "Age Band", "Created At"];
    const rows = entries.map((e) => [
      e.email,
      e.age_band || "—",
      new Date(e.created_at).toLocaleString("en-NZ"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pilot-interest-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-primary">Interest Registrations</h2>
        <button onClick={exportCSV} className="btn-outlined text-sm">
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No interest registrations yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="grid">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Email
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Age Band
                </th>
                <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">
                    <a href={`mailto:${entry.email}`} className="hover:underline">
                      {entry.email}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {entry.age_band === "under_30" && "Under 30"}
                    {entry.age_band === "over_45" && "Over 45"}
                    {entry.age_band === "after_close" && "After close"}
                    {!entry.age_band && "—"}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString("en-NZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}