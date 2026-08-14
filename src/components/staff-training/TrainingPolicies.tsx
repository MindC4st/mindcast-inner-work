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

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-[#8E9299]" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/admin/staff-training" className="inline-flex items-center gap-1.5 text-[#8E9299] hover:text-white text-[11px] font-body tracking-widest uppercase transition-colors mb-6">
        <ArrowLeft size={12} /> Training
      </Link>
      <h2 className="font-display text-2xl text-white tracking-wider mb-1">Policy acknowledgements</h2>
      <p className="text-[#8E9299] text-sm font-body mb-6">
        An immutable record of which version of each policy you accepted, and when. New versions ask for a fresh acknowledgement — history is never overwritten.
      </p>

      <div className="space-y-2">
        {acks.map((a, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
            <FileCheck2 size={15} className="text-[#3585AF] shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-body text-[#E2E8F0]">{a.policy_code} · v{a.policy_version}</span>
              <span className="block text-[11px] font-body text-[#8E9299] truncate">{a.title}</span>
            </span>
            <span className="text-[11px] font-body text-[#8E9299] shrink-0">
              {new Date(a.acknowledged_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        ))}
        {acks.length === 0 && (
          <p className="text-[#8E9299] text-sm font-body py-12 text-center">
            No acknowledgements yet — they are recorded as you complete the modules that carry them.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrainingPolicies;
