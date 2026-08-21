import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateNZ, ageAtStart, parseDob } from "@/lib/applyValidation";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string | null;
  gender_self_described: string | null;
  q1_money_no_barrier: string;
  q2_ten_years_ago: string;
  q3_didnt_think_could: string;
  anything_else: string | null;
  status: string;
  notes: string | null;
  submitted_at: string;
}

type Status = "new" | "shortlisted" | "met" | "offered" | "declined" | "withdrawn";
const STATUS_ORDER: Status[] = ["new", "shortlisted", "met", "offered", "declined", "withdrawn"];

export function ApplicationsList({
  onSelect,
  selectedId,
}: {
  onSelect: (app: Application) => void;
  selectedId: string | null;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Application; dir: "asc" | "desc" }>({
    key: "submitted_at",
    dir: "desc",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    let query = supabase
      .from("pilot_applications" as any)
      .select("*")
      .order("submitted_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load applications:", error);
    } else {
      setApplications((data || []) as unknown as Application[]);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    const { error } = await supabase
      .from("pilot_applications" as any)
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    }
  };

  const getGenderLabel = (gender: string | null, selfDescribed: string | null) => {
    if (!gender) return "Not provided";
    if (gender === "another") return `Another (${selfDescribed || "not specified"})`;
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const sortedApplications = [...applications].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Application) => {
    setSortConfig((prev) => ({
      key: key as keyof Application,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  // Gender count strip
  const genderCounts = applications.reduce(
    (acc, app) => {
      const g = app.gender || "undisclosed";
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="w-full">
      {/* Gender count strip */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg text-sm font-mono text-muted-foreground">
        {`${genderCounts.female || 0} female · ${genderCounts.male || 0} male · ${genderCounts.another || 0} another · ${genderCounts.undisclosed || 0} undisclosed`}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", ...STATUS_ORDER].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as Status | "all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filter === status
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid">
          <thead>
            <tr className="border-b border-border">
              {[
                { key: "first_name", label: "Name" },
                { key: "age", label: "Age" },
                { key: "submitted_at", label: "Submitted" },
                { key: "status", label: "Status" },
              ].map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleSort(col.key as keyof Application)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span>{sortConfig.dir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : sortedApplications.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No applications found
                </td>
              </tr>
            ) : (
              sortedApplications.map((app) => {
                const dob = parseDob({
                  day: app.date_of_birth.split("-")[2],
                  month: app.date_of_birth.split("-")[1],
                  year: app.date_of_birth.split("-")[0],
                });
                const age = dob ? ageAtStart(dob) : null;

                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelect(app)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${
                      selectedId === app.id ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onSelect(app);
                    }}
                    aria-selected={selectedId === app.id}
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {app.first_name} {app.last_name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {age !== null ? `${age}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(app.submitted_at).toLocaleDateString("en-NZ", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(app.id, e.target.value as Status);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}