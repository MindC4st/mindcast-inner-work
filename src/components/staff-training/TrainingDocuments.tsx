import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { stt } from "@/lib/stt";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, FileText, Loader2, PenLine } from "lucide-react";

type Doc = { id: string; code: string; title: string; version: string; status: string; effective_date: string | null; summary: string };
type Sig = { document_id: string; document_version: string; signed_at: string };

const DECLARATION = "I have read and agree to be bound by this document as it stands at the version recorded.";

const TrainingDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sigs, setSigs] = useState<Sig[]>([]);
  const [signing, setSigning] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("staff_documents" as never).select("*").eq("status", "live").order("code"),
      supabase.from("staff_document_signatures" as never).select("document_id, document_version, signed_at")
        .eq("user_id", user.id).order("signed_at", { ascending: false }),
    ]).then(([d, s]) => {
      setDocs((d.data ?? []) as unknown as Doc[]);
      setSigs((s.data ?? []) as unknown as Sig[]);
      setLoading(false);
    });
  }, [user]);

  const sign = async (doc: Doc) => {
    if (!user || !agree || busy) return;
    setBusy(true);
    await stt("staff_document_signatures").insert({
      document_id: doc.id, user_id: user.id, document_version: doc.version, declaration: DECLARATION,
    });
    setSigs((s) => [{ document_id: doc.id, document_version: doc.version, signed_at: new Date().toISOString() }, ...s]);
    setSigning(null);
    setAgree(false);
    setBusy(false);
  };

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-[#8E9299]" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link to="/admin/staff-training" className="inline-flex items-center gap-1.5 text-[#8E9299] hover:text-white text-[11px] font-body tracking-widest uppercase transition-colors mb-6">
        <ArrowLeft size={12} /> Training
      </Link>
      <h2 className="font-display text-2xl text-white tracking-wider mb-1">Controlled documents</h2>
      <p className="text-[#8E9299] text-sm font-body mb-6">
        The live controlled documents for your role. Signing records the version and the date — it never replaces earlier evidence.
      </p>

      <div className="space-y-2">
        {docs.map((d) => {
          const sig = sigs.find((s) => s.document_id === d.id && s.document_version === d.version);
          const oldSig = sigs.find((s) => s.document_id === d.id);
          return (
            <div key={d.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-4">
              <div className="flex items-center gap-4">
                <FileText size={15} className="text-[#3585AF] shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-body text-[#E2E8F0]">{d.code} · {d.title} <span className="text-[#8E9299]">v{d.version}</span></span>
                  <span className="block text-[11px] font-body text-[#8E9299]">{d.summary}</span>
                </span>
                {sig ? (
                  <span className="text-[11px] font-body text-[#C5E3F3] shrink-0">
                    Signed {new Date(sig.signed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                ) : (
                  <button onClick={() => setSigning(signing === d.id ? null : d.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#3585AF]/50 text-[#C5E3F3] text-[10px] font-body tracking-widest uppercase hover:bg-[#3585AF]/10 transition-colors shrink-0">
                    <PenLine size={11} /> Sign
                  </button>
                )}
              </div>
              {!sig && oldSig && (
                <p className="mt-2 text-[11px] font-body text-[#8E9299]">
                  You signed v{oldSig.document_version} on {new Date(oldSig.signed_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })} — this version is new and needs a fresh signature.
                </p>
              )}
              {signing === d.id && !sig && (
                <div className="mt-3 border-t border-white/[0.06] pt-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#3585AF]" />
                    <span className="text-[12px] font-body text-[#C9D4DE] leading-relaxed">{DECLARATION}</span>
                  </label>
                  <button onClick={() => sign(d)} disabled={!agree || busy}
                    className="mt-3 px-4 py-2 rounded-sm bg-[#3585AF] text-white text-[10px] font-body tracking-widest uppercase hover:bg-[#3585AF]/80 transition-colors disabled:opacity-40">
                    {busy ? "Recording…" : "Record my signature"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainingDocuments;
