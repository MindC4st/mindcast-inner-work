import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, ChevronRight, X, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Member {
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
  isActive: boolean;
  role: string;
  entriesCount: number;
  bookmarkCount: number;
  commitmentsCount: number;
}

interface MemberDetail {
  entries: any[];
  bookmarkResponses: any[];
  commitments: any[];
  checkins: any[];
}

const MemberManager = () => {
  const { cohortId } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cohortId) return;
    const load = async () => {
      const { data: cm } = await supabase
        .from("cohort_members")
        .select("user_id, joined_at, profiles!cohort_members_user_id_fkey(name, is_active)")
        .eq("cohort_id", cohortId);

      if (!cm) { setLoading(false); return; }

      const userIds = cm.map(c => c.user_id);

      const [rolesRes, entriesRes, bmRes, commRes] = await Promise.all([
        supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
        supabase.from("entries").select("user_id").eq("cohort_id", cohortId),
        supabase.from("bookmark_responses").select("user_id").eq("cohort_id", cohortId),
        supabase.from("commitments").select("user_id").eq("cohort_id", cohortId),
      ]);

      const roleMap: Record<string, string> = {};
      (rolesRes.data || []).forEach(r => { roleMap[r.user_id] = r.role; });

      const countBy = (arr: any[], uid: string) => arr.filter(a => a.user_id === uid).length;

      const memberList: Member[] = cm.map(c => ({
        userId: c.user_id,
        name: (c.profiles as any)?.name || "Unknown",
        email: "",
        joinedAt: c.joined_at,
        isActive: (c.profiles as any)?.is_active ?? true,
        role: roleMap[c.user_id] || "member",
        entriesCount: countBy(entriesRes.data || [], c.user_id),
        bookmarkCount: countBy(bmRes.data || [], c.user_id),
        commitmentsCount: countBy(commRes.data || [], c.user_id),
      }));

      setMembers(memberList);
      setLoading(false);
    };
    load();
  }, [cohortId]);

  const toggleActive = async (m: Member) => {
    const newActive = !m.isActive;
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: newActive })
      .eq("user_id", m.userId);
    if (error) { toast.error(error.message); return; }
    setMembers(prev => prev.map(p => p.userId === m.userId ? { ...p, isActive: newActive } : p));
    toast.success(`${m.name} marked as ${newActive ? "active" : "inactive"}`);
  };

  const viewDetail = async (m: Member) => {
    setSelected(m);
    if (!cohortId) return;
    const [entriesRes, bmRes, commRes, checkinRes] = await Promise.all([
      supabase.from("entries").select("*").eq("user_id", m.userId).eq("cohort_id", cohortId).order("week_number"),
      supabase.from("bookmark_responses").select("*").eq("user_id", m.userId).eq("cohort_id", cohortId).order("week_number"),
      supabase.from("commitments").select("*").eq("user_id", m.userId).eq("cohort_id", cohortId).order("week_number"),
      supabase.from("implementation_checkins").select("*").eq("user_id", m.userId).eq("cohort_id", cohortId).order("week_number"),
    ]);
    setDetail({
      entries: entriesRes.data || [],
      bookmarkResponses: bmRes.data || [],
      commitments: commRes.data || [],
      checkins: checkinRes.data || [],
    });
  };

  if (selected && detail) {
    return (
      <div>
        <Button variant="ghost" onClick={() => { setSelected(null); setDetail(null); }} className="mb-4 text-xs tracking-widest">
          <X size={14} /> BACK TO MEMBERS
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
            <User size={18} className="text-primary/40" />
          </div>
          <div>
            <h2 className="font-display tracking-wider text-primary">{selected.name.toUpperCase()}</h2>
            <p className="text-[10px] tracking-widest text-primary/40">{selected.role.toUpperCase()} · {selected.isActive ? "ACTIVE" : "INACTIVE"}</p>
          </div>
        </div>

        {/* Bookmark Responses */}
        <div className="border border-primary/10 mb-4">
          <div className="bg-primary/5 p-3 border-b border-primary/10">
            <h3 className="text-xs tracking-widest text-primary/60">BOOKMARK RESPONSES ({detail.bookmarkResponses.length})</h3>
          </div>
          <div className="divide-y divide-primary/5 max-h-64 overflow-y-auto">
            {detail.bookmarkResponses.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">No responses yet</p>
            ) : detail.bookmarkResponses.map(br => (
              <div key={br.id} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] tracking-widest text-primary/40">WEEK {br.week_number}</span>
                  <span className="text-[9px] text-primary/30">{br.bookmark_id}</span>
                  {br.is_shared && <span className="text-[9px] text-green-600">SHARED</span>}
                </div>
                {br.response_text && <p className="text-xs text-foreground">{br.response_text}</p>}
                {br.voice_url && <audio src={br.voice_url} controls className="h-8 mt-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div className="border border-primary/10 mb-4">
          <div className="bg-primary/5 p-3 border-b border-primary/10">
            <h3 className="text-xs tracking-widest text-primary/60">WORKSHEET ENTRIES ({detail.entries.length})</h3>
          </div>
          <div className="divide-y divide-primary/5 max-h-64 overflow-y-auto">
            {detail.entries.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">No entries yet</p>
            ) : detail.entries.map(e => (
              <div key={e.id} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] tracking-widest text-primary/40">WEEK {e.week_number}</span>
                  <span className="text-[9px] text-primary/30">{e.question_key}</span>
                </div>
                <p className="text-xs text-foreground">{e.answer_text || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commitments & Check-ins */}
        <div className="border border-primary/10">
          <div className="bg-primary/5 p-3 border-b border-primary/10">
            <h3 className="text-xs tracking-widest text-primary/60">COMMITMENTS & CHECK-INS</h3>
          </div>
          <div className="divide-y divide-primary/5 max-h-64 overflow-y-auto">
            {detail.commitments.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">No commitments yet</p>
            ) : detail.commitments.map(c => {
              const checkin = detail.checkins.find(ch => ch.week_number === c.week_number);
              return (
                <div key={c.id} className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] tracking-widest text-primary/40">WEEK {c.week_number}</span>
                    {c.is_locked && <CheckCircle size={10} className="text-green-600" />}
                  </div>
                  <p className="text-xs text-foreground mb-1">{c.commitment_text || "—"}</p>
                  {checkin && (
                    <div className="pl-3 border-l-2 border-primary/10 mt-2">
                      <span className={`text-[9px] tracking-widest ${
                        checkin.status === "achieved" ? "text-green-600" :
                        checkin.status === "in_progress" ? "text-amber-500" : "text-primary/30"
                      }`}>{checkin.status.toUpperCase()}</span>
                      <p className="text-xs text-muted-foreground">{checkin.what_happened || ""}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-lg tracking-widest text-primary mb-6">MEMBER MANAGER</h2>
      {loading ? (
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.userId} className="border border-primary/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center ${m.isActive ? "bg-primary/10" : "bg-muted"}`}>
                  <User size={14} className={m.isActive ? "text-primary/40" : "text-muted-foreground"} />
                </div>
                <div>
                  <h3 className="text-sm font-display tracking-wider text-primary">{m.name.toUpperCase()}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[9px] tracking-widest text-primary/40">{m.role.toUpperCase()}</span>
                    <span className="text-[9px] text-primary/30">{m.entriesCount} entries</span>
                    <span className="text-[9px] text-primary/30">{m.bookmarkCount} responses</span>
                    <span className="text-[9px] text-primary/30">{m.commitmentsCount} commitments</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(m)}
                  className={`text-[9px] tracking-widest ${m.isActive ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {m.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {m.isActive ? "ACTIVE" : "INACTIVE"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => viewDetail(m)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberManager;
