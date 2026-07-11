import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, X, Copy, Shuffle, Check } from "lucide-react";

/**
 * Generate a URL-safe ~10-char token (base62) for a member's bracelet.
 * Collision space is huge (≈8.4e17) — plenty for a community of any size,
 * and short enough that staff can read it on a sticker if needed.
 */
const newBraceletToken = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  const buf = new Uint8Array(10);
  (typeof crypto !== "undefined" ? crypto : window.crypto).getRandomValues(buf);
  for (let i = 0; i < buf.length; i++) out += chars[buf[i] % chars.length];
  return out;
};

const braceletUrlFor = (token: string) =>
  `${typeof window !== "undefined" ? window.location.origin : "https://mindcast.co.nz"}/b/${token}`;

const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [nfcId, setNfcId] = useState("");
  const [saving, setSaving] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
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

  const inputClass = "w-full bg-foreground/5 border border-foreground/10 rounded-lg px-4 py-3 text-foreground text-sm font-body placeholder-white/15 focus:outline-none focus:border-foreground/20";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center px-6 md:px-12 py-5">
        <Link to="/admin" className="flex items-center gap-2 text-foreground/30 text-[10px] tracking-[0.12em] font-body hover:text-foreground/50">
          <ArrowLeft size={12} /> ADMIN
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-20">
        <h1 className="font-display text-2xl font-bold text-foreground mb-8">Members</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left text-[10px] text-foreground/30 uppercase tracking-wide border-b border-foreground/[0.06]">
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
                  className="border-b border-foreground/[0.04] cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4 text-foreground">{m.display_name || m.name}</td>
                  <td className="py-3 pr-4 text-foreground/40">{m.email || "—"}</td>
                  <td className="py-3 pr-4 text-foreground/40">{m.age_group || "—"}</td>
                  <td className="py-3 pr-4 text-foreground/40 font-mono text-xs">{m.nfc_id || "—"}</td>
                  <td className="py-3 text-foreground/20">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NFC Modal */}
      {selected && (
        <div className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-foreground/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-foreground">{selected.display_name || selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-foreground/20 hover:text-foreground/40"><X size={18} /></button>
            </div>

            <div className="space-y-5">
              {/* Token row */}
              <div>
                <label className="text-[10px] font-body text-foreground/30 uppercase tracking-[0.1em] block mb-2">Bracelet Token</label>
                <div className="flex gap-2">
                  <input
                    className={inputClass + " font-mono"}
                    value={nfcId}
                    onChange={(e) => setNfcId(e.target.value.replace(/[^A-Za-z0-9]/g, ""))}
                    placeholder="Generate or paste a URL-safe token…"
                  />
                  <button
                    onClick={() => setNfcId(newBraceletToken())}
                    title="Generate a new random token"
                    className="px-3 bg-foreground/10 hover:bg-foreground/15 text-foreground/70 rounded-lg"
                  >
                    <Shuffle size={14} />
                  </button>
                </div>
                <p className="text-foreground/30 text-[10px] font-body mt-2">
                  Token must be URL-safe (letters + digits). Click <Shuffle size={10} className="inline" /> for a random one.
                </p>
              </div>

              {/* URL preview + copy + QR — only when there's a token */}
              {nfcId && (
                <div className="border border-foreground/[0.08] rounded-lg p-4 bg-foreground/[0.02]">
                  <label className="text-[10px] font-body text-foreground/30 uppercase tracking-[0.1em] block mb-2">Bracelet URL — write this to the NFC tag</label>
                  <div className="flex gap-2 items-stretch">
                    <code className="flex-1 bg-foreground/[0.06] text-foreground/90 px-3 py-2 rounded font-mono text-[11px] break-all flex items-center">
                      {braceletUrlFor(nfcId)}
                    </code>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(braceletUrlFor(nfcId));
                        setJustCopied(true);
                        setTimeout(() => setJustCopied(false), 1500);
                      }}
                      className="px-3 bg-foreground/10 hover:bg-foreground/15 text-foreground/70 rounded text-xs flex items-center gap-1.5"
                    >
                      {justCopied ? <Check size={13} /> : <Copy size={13} />}
                      {justCopied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="bg-cream p-2 rounded shrink-0">
                      <QRCode value={braceletUrlFor(nfcId)} size={92} />
                    </div>
                    <div>
                      <p className="text-foreground/70 text-[11px] font-body leading-relaxed">
                        Most NFC writer apps accept the URL directly. Some can scan this QR code as the source.
                      </p>
                      <p className="text-foreground/30 text-[10px] font-body mt-2 leading-relaxed">
                        On tap: <span className="text-foreground/60">member → dashboard, staff tablet → check-in card, signed-out → sign in.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={saveNfc} disabled={saving} className="w-full bg-primary text-primary-foreground font-display font-bold py-3 text-xs rounded-lg hover:bg-primary/90 disabled:opacity-30 transition-colors">
                {saving ? "Saving..." : "Save Bracelet Token"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
