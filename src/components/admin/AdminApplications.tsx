import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  age_range: string | null;
  current_work: string | null;
  what_led_you_here: string | null;
  hoped_outcome: string | null;
  past_achievement: string | null;
  current_obstacles: string | null;
  application_status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending_payment: "text-amber-400 bg-amber-400/10",
  paid: "text-emerald-400 bg-emerald-400/10",
  refunded: "text-red-400 bg-red-400/10",
  cancelled: "text-gray-400 bg-gray-400/10",
};

const AdminApplications = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const { data } = await supabase
        .from("pilot_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setApps(data as Application[]);
      setLoading(false);
    };
    fetchApps();
  }, []);

  const filtered = apps.filter(
    (a) =>
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-primary tracking-wider">PILOT APPLICATIONS</h2>
        <span className="text-muted-foreground text-xs font-body">{apps.length} total</span>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-muted/50 border border-border rounded-md pl-9 pr-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm font-body animate-pulse">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm font-body">No applications found.</p>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_80px_100px_100px_32px] gap-3 px-4 py-2 bg-muted/50 text-[10px] tracking-[0.2em] text-muted-foreground font-body">
            <span>NAME</span>
            <span>EMAIL</span>
            <span>AGE</span>
            <span>STATUS</span>
            <span>APPLIED</span>
            <span></span>
          </div>

          {filtered.map((app) => (
            <div key={app.id} className="border-t border-border">
              <button
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                className="w-full grid grid-cols-[1fr_1fr_80px_100px_100px_32px] gap-3 px-4 py-3 text-sm font-body text-foreground hover:bg-muted/30 transition-colors text-left items-center"
              >
                <span className="truncate">{app.full_name}</span>
                <span className="truncate text-muted-foreground text-xs">{app.email}</span>
                <span className="text-xs text-muted-foreground">{app.age_range || "â€”"}</span>
                <span className={`text-[10px] tracking-wider px-2 py-0.5 rounded-full w-fit ${statusColors[app.application_status] || "text-gray-400"}`}>
                  {app.application_status.toUpperCase().replace("_", " ")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(app.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                </span>
                {expandedId === app.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {expandedId === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2 space-y-4 bg-muted/20">
                      {app.phone && (
                        <DetailRow label="Phone" value={app.phone} />
                      )}
                      <DetailRow label="What do you currently do for work?" value={app.current_work} />
                      <DetailRow label="What led you to Mindcast?" value={app.what_led_you_here} />
                      <DetailRow label="What do you hope to get out of the next 10 weeks?" value={app.hoped_outcome} />
                      <DetailRow label="Personal achievement you're proud of" value={app.past_achievement} />
                      <DetailRow label="What might be getting in your way right now?" value={app.current_obstacles} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string | null }) => (
  <div>
    <p className="text-[10px] tracking-[0.15em] text-muted-foreground mb-1 uppercase">{label}</p>
    <p className="text-sm font-body text-foreground leading-relaxed">{value || "â€”"}</p>
  </div>
);

export default AdminApplications;