import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, X } from "lucide-react";

const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [nfcId, setNfcId] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setMembers(data || []));
  }, []);

  const openMember = (m: any) => {
    setSelected(m);
    setNfcId(m.nfc_id || "");
  };

  const saveNfc = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase.from("profiles").update({ nfc_id: nfcId || null }).eq("id", selected.id);
    setMembers((prev) => prev.map((m) => m.id === selected.id ? { ...m, nfc_id: nfcId || null } : m));
    setSaving(false);
    setSelected(null);
    toast({ title: "NFC ID updated" });
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-body placeholder-white/15 focus:outline-none focus:border-white/20";

  return (
    <div className="min-h-screen" className="bg-background text-foreground">
      <nav className="flex items-center px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-white/30 text-[10px] tracking-[0.12em] font-body hover:text-white/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-20">
        <h1 className="font-display text-2xl font-bold text-white mb-8">Members</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left text-[10px] text-white/30 uppercase tracking-wide border-b border-white/[0.06]">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Age Group</th>
                <th className="pb-3 pr-4">NFC ID</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => openMember(m)}
                  className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4 text-white">{m.display_name || m.name}</td>
                  <td className="py-3 pr-4 text-white/40">{m.email || "—"}</td>
                  <td className="py-3 pr-4 text-white/40">{m.age_group || "—"}</td>
                  <td className="py-3 pr-4 text-white/40 font-mono text-xs">{m.nfc_id || "—"}</td>
                  <td className="py-3 text-white/20">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NFC Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setSelected(null)}>
          <div className="bg-[#1A1725] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white">{selected.display_name || selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-white/20 hover:text-white/40"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-body text-white/30 uppercase tracking-[0.1em] block mb-2">NFC Bracelet ID</label>
                <input className={inputClass} value={nfcId} onChange={(e) => setNfcId(e.target.value)} placeholder="Scan or type NFC chip ID..." />
                <p className="text-white/20 text-[10px] font-body mt-2">This ID is encoded in the NFC bracelet URL: /checkin?member=ID</p>
              </div>
              <button onClick={saveNfc} disabled={saving} className="w-full bg-white text-background font-display font-bold py-3 text-xs rounded-lg hover:bg-white/90 disabled:opacity-30 transition-colors">
                {saving ? "Saving..." : "Save NFC ID"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
