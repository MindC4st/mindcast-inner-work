import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, FileCheck2, Loader2 } from "lucide-react";

type Ack = { policy_code: string; policy_version: string; title: string; acknowledged_at: string };

const TrainingPolicies = () => {
  const { user } = useAuth();
  const [acks, setAcks] = useState<Ack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("staff_policy_acknowledgements" as never)
      .select("policy_code, policy_version, title, acknowledged_at")
      .eq("user_id", user.id)
      .order("acknowledged_at", { ascending: false })
      .then(({ data }) => { setAcks((data ?? []) as unknown as Ack[]); setLoading(false); });
  }, [user]);

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/admin/staff-training" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-[11px] font-body tracking-widest uppercase transition-colors mb-6">
        <ArrowLeft size={12} /> Training
      </Link>
      <h2 className="font-display text-2xl text-primary tracking-wider mb-1">Policy acknowledgements</h2>
      <p className="text-muted-foreground text-sm font-body mb-6">
        An immutable record of which version of each policy you accepted, and when. New versions ask for a fresh acknowledgement — history is never overwritten.
      </p>

      <div className="space-y-2">
        {acks.map((a, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5">
            <FileCheck2 size={15} className="text-primary shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-body text-foreground">{a.policy_code} Â· v{a.policy_version}</span>
              <span className="block text-[11px] font-body text-muted-foreground truncate">{a.title}</span>
            </span>
            <span className="text-[11px] font-body text-muted-foreground shrink-0">
              {new Date(a.acknowledged_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        ))}
        {acks.length === 0 && (
          <p className="text-muted-foreground text-sm font-body py-12 text-center">
            No acknowledgements yet — they are recorded as you complete the modules that carry them.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrainingPolicies;