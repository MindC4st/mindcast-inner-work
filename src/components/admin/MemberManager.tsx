import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, ChevronRight, X, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { WEEKS } from "@/data/weekData";

interface Member {
  userId: string;
  name: string;
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

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  achieved: { dot: "bg-foreground", label: "Achieved" },
  in_progress: { dot: "bg-foreground/50", label: "In Progress" },
  carried_forward: { dot: "bg-foreground/30", label: "Carried Fwd" },
  not_started: { dot: "bg-foreground/[0.1]", label: "—" },
};

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

      setMembers(cm.map(c => ({
        userId: c.user_id,
        name: (c.profiles as any)?.name || "Unknown",
        joinedAt: c.joined_at,
        isActive: (c.profiles as any)?.is_active ?? true,
        role: roleMap[c.user_id] || "member",
        entriesCount: countBy(entriesRes.data || [], c.user_id),
        bookmarkCount: countBy(bmRes.data || [], c.user_id),
        commitmentsCount: countBy(commRes.data || [], c.user_id),
      })));
      setLoading(false);
    };
    load();
  }, [cohortId]);

  const toggleActive = async (m: Member) => {
    const newActive = !m.isActive;
    const { error } = await supabase.from("profiles").update({ is_active: newActive }).eq("user_id", m.userId);
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

  // ─── Member detail view ───
  if (selected && detail) {
    const commitByWeek: Record<number, any> = {};
    detail.commitments.forEach(c => { commitByWeek[c.week_number] = c; });
    const checkinByWeek: Record<number, any> = {};
    detail.checkins.forEach(c => { checkinByWeek[c.week_number] = c; });

    return (
      <div>
        <button
          onClick={() => { setSelected(null); setDetail(null); }}
          className="text-[11px] text-muted-foreground tracking-[0.1em] hover:text-foreground mb-5 inline-flex items-center gap-1 font-body transition-colors"
        >
          ← Back to members
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-foreground/[0.04] flex items-center justify-center">
            <User size={16} className="text-foreground/30" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="portal-heading text-xl">{selected.name}</h2>
            <p className="portal-label text-[9px]">{selected.role} · {selected.isActive ? "Active" : "Inactive"}</p>
          </div>
        </div>

        {/* ── Implementation Goals Table ── */}
        <div className="portal-card mb-6">
          <div className="px-5 py-3 border-b border-foreground/[0.06]">
            <h3 className="portal-label">Implementation Goals & Check-ins</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-foreground/[0.06]">
                  <th className="text-left px-4 py-2.5 portal-label text-[9px] font-normal w-16">Wk</th>
                  <th className="text-left px-4 py-2.5 portal-label text-[9px] font-normal">Commitment</th>
                  <th className="text-left px-4 py-2.5 portal-label text-[9px] font-normal w-28">Status</th>
                  <th className="text-left px-4 py-2.5 portal-label text-[9px] font-normal">Check-in Notes</th>
                </tr>
              </thead>
              <tbody>
                {WEEKS.map(w => {
                  const comm = commitByWeek[w.number];
                  const chk = checkinByWeek[w.number];
                  const s = STATUS_STYLES[chk?.status] || STATUS_STYLES.not_started;
                  return (
                    <tr key={w.number} className="border-b border-foreground/[0.03]">
                      <td className="px-4 py-3 text-foreground/40 font-mono text-xs">{w.number}</td>
                      <td className="px-4 py-3">
                        {comm?.commitment_text ? (
                          <p className="text-xs text-foreground/70 font-light italic leading-relaxed">"{comm.commitment_text}"</p>
                        ) : (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          <span className="text-[10px] text-foreground/50 font-body">{s.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {chk?.what_happened ? (
                          <p className="text-xs text-foreground/50 font-light leading-relaxed">{chk.what_happened}</p>
                        ) : (
                          <span className="text-xs text-muted-foreground/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bookmark Responses */}
        <div className="portal-card mb-4">
          <div className="px-5 py-3 border-b border-foreground/[0.06]">
            <h3 className="portal-label">Bookmark Responses ({detail.bookmarkResponses.length})</h3>
          </div>
          <div className="divide-y divide-foreground/[0.03] max-h-64 overflow-y-auto">
            {detail.bookmarkResponses.length === 0 ? (
              <p className="p-5 text-xs text-muted-foreground/40 font-body font-light">No responses yet</p>
            ) : detail.bookmarkResponses.map(br => (
              <div key={br.id} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="portal-label text-[9px]">Week {br.week_number}</span>
                  {br.is_shared && <span className="text-[9px] text-foreground/40 font-body">Shared</span>}
                </div>
                {br.response_text && <p className="text-xs text-foreground/70 font-body font-light">{br.response_text}</p>}
                {br.voice_url && <audio src={br.voice_url} controls className="h-8 mt-1 opacity-60" />}
              </div>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div className="portal-card">
          <div className="px-5 py-3 border-b border-foreground/[0.06]">
            <h3 className="portal-label">Worksheet Entries ({detail.entries.length})</h3>
          </div>
          <div className="divide-y divide-foreground/[0.03] max-h-64 overflow-y-auto">
            {detail.entries.length === 0 ? (
              <p className="p-5 text-xs text-muted-foreground/40 font-body font-light">No entries yet</p>
            ) : detail.entries.map(e => (
              <div key={e.id} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="portal-label text-[9px]">Week {e.week_number}</span>
                  <span className="text-[9px] text-foreground/20 font-body">{e.question_key}</span>
                </div>
                <p className="text-xs text-foreground/70 font-body font-light">{e.answer_text || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Members list ───
  return (
    <div>
      <h2 className="portal-heading text-2xl mb-6">Members</h2>
      {loading ? (
        <p className="text-sm text-muted-foreground font-body animate-pulse font-light">Loading...</p>
      ) : (
        <div className="space-y-1">
          {members.map(m => (
            <div key={m.userId} className="portal-card px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center ${m.isActive ? "bg-foreground/[0.04]" : "bg-foreground/[0.02]"}`}>
                  <User size={14} className={m.isActive ? "text-foreground/30" : "text-foreground/15"} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-sm text-foreground">{m.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[9px] text-muted-foreground/40 font-body">{m.role}</span>
                    <span className="text-[9px] text-muted-foreground/30 font-body">{m.entriesCount} entries</span>
                    <span className="text-[9px] text-muted-foreground/30 font-body">{m.bookmarkCount} responses</span>
                    <span className="text-[9px] text-muted-foreground/30 font-body">{m.commitmentsCount} goals</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(m)}
                  className={`flex items-center gap-1.5 text-[10px] tracking-[0.1em] font-body transition-colors px-2 py-1 ${
                    m.isActive ? "text-foreground/40 hover:text-foreground" : "text-muted-foreground/30 hover:text-foreground"
                  }`}
                >
                  {m.isActive ? <CheckCircle size={12} strokeWidth={1.5} /> : <XCircle size={12} strokeWidth={1.5} />}
                  {m.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => viewDetail(m)} className="text-foreground/20 hover:text-foreground/50 transition-colors">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberManager;
