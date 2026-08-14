import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Nfc, Copy, RefreshCw, Link2, Loader2, Unlink, Search, CheckCircle2 } from "lucide-react";

type Profile = {
  id: string; display_name: string | null; name: string | null;
  email: string | null; nfc_id: string | null;
};

const SITE = "https://mindcast.co.nz";
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const genToken = (len = 10) => {
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => ALPHABET[n % ALPHABET.length]).join("");
};

const braceletUrl = (token: string) => `${SITE}/b/${token}`;

const canWebNfc = () => typeof navigator !== "undefined" && Boolean((navigator as unknown as { ndef?: unknown }).ndef);

const BraceletStudio = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<"assign" | "write" | "unassign" | null>(null);
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    const db = supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          order: (col: string, opts: { ascending?: boolean }) => {
            limit: (n: number) => Promise<{ data: Profile[] | null }>
          }
        }
      }
    };
    db.from("profiles")
      .select("id, display_name, name, email, nfc_id")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setProfiles(data || []));
  }, []);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles.slice(0, 8);
    return profiles
      .filter((p) =>
        [p.display_name, p.name, p.email, p.nfc_id].some((v) => (v || "").toLowerCase().includes(q)))
      .slice(0, 8);
  }, [profiles, search]);

  const pick = (p: Profile) => {
    setSelected(p);
    setToken(p.nfc_id || genToken());
    setAssigned(false);
  };

  const assign = async () => {
    if (!selected) return;
    setBusy("assign");
    try {
      const { data, error } = await supabase.functions.invoke("assign-nfc", {
        body: { profile_id: selected.id, nfc_id: token },
      });
      if (error) {
        let detail = error.message;
        try {
          const ctx = (error as { context?: { json: () => Promise<{ error?: string }> } }).context;
          if (ctx) { const b = await ctx.json(); if (b?.error) detail = b.error; }
        } catch { /* keep message */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      setSelected({ ...selected, nfc_id: token });
      setProfiles((ps) => ps.map((p) => (p.id === selected.id ? { ...p, nfc_id: token } : p)));
      setAssigned(true);
      toast.success("Bracelet token assigned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const unassign = async () => {
    if (!selected) return;
    setBusy("unassign");
    try {
      const { data, error } = await supabase.functions.invoke("assign-nfc", {
        body: { profile_id: selected.id, nfc_id: null },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSelected({ ...selected, nfc_id: null });
      setProfiles((ps) => ps.map((p) => (p.id === selected.id ? { ...p, nfc_id: null } : p)));
      setToken(genToken());
      setAssigned(false);
      toast.success("Bracelet unassigned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const writeTag = async () => {
    setBusy("write");
    try {
      const nav = navigator as unknown as { ndef?: { NDEFReader?: new () => { write: (m: unknown) => Promise<void> } } };
      const Reader = nav.ndef?.NDEFReader;
      if (!Reader) {
        throw new Error("Web NFC isn't available here — open this page in Chrome on Android, or copy the URL and write it with any NFC writer app (NDEF URL record).");
      }
      const reader = new Reader();
      await reader.write({ records: [{ recordType: "url", data: braceletUrl(token) }] });
      toast.success("Bracelet written — now assign the token");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(braceletUrl(token));
      toast.success("Bracelet URL copied");
    } catch {
      toast.error("Couldn't copy — select the URL manually");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wider flex items-center gap-3">
          <Nfc size={20} className="text-[#3585AF]" /> Bracelets
        </h2>
        <p className="text-[#8E9299] text-sm font-body mt-1">
          Generate a token, write it to an NFC bracelet as a URL record, then assign it to the member. Tapping the bracelet opens <span className="text-[#C5E3F3]">{SITE}/b/&lt;token&gt;</span> and checks the member in.
        </p>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299]">1 · Choose the member</p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9299]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or existing token…"
            className="w-full bg-transparent border border-white/10 rounded-md pl-9 pr-3 py-2.5 text-sm font-body text-[#E2E8F0] placeholder:text-[#8E9299]/50 focus:outline-none focus:border-[#3585AF]/60 transition-colors"
          />
        </div>
        <div className="space-y-1">
          {matches.map((p) => (
            <button key={p.id} onClick={() => pick(p)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${selected?.id === p.id ? "bg-[#3585AF]/20 border border-[#3585AF]/40" : "border border-transparent hover:bg-white/[0.04]"}`}>
              <span className="text-sm font-body text-[#E2E8F0] truncate">{p.display_name || p.name || p.email}</span>
              <span className="text-[10px] font-body text-[#8E9299] shrink-0">
                {p.nfc_id ? `token ${p.nfc_id}` : "no bracelet"}
              </span>
            </button>
          ))}
          {matches.length === 0 && <p className="text-[#8E9299] text-xs font-body py-2">No members match.</p>}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299]">2 · Bracelet token</p>
          <button onClick={() => { setToken(genToken()); setAssigned(false); }}
            className="flex items-center gap-1.5 text-[11px] font-body text-[#C5E3F3] hover:text-white transition-colors">
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={token}
            onChange={(e) => { setToken(e.target.value.toUpperCase().replace(/[^A-Z0-9]/gi, "").slice(0, 64)); setAssigned(false); }}
            className="flex-1 bg-transparent border border-white/10 rounded-md px-3 py-2.5 font-display text-xl tracking-[0.3em] text-white focus:outline-none focus:border-[#3585AF]/60 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#0A1120] px-3 py-2.5">
          <Link2 size={13} className="text-[#3585AF] shrink-0" />
          <span className="text-xs font-body text-[#C5E3F3] truncate flex-1">{braceletUrl(token)}</span>
          <button onClick={copyUrl} title="Copy URL" className="text-[#8E9299] hover:text-white transition-colors"><Copy size={13} /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <button onClick={writeTag} disabled={busy !== null || !token}
            className="flex items-center justify-center gap-2 py-3 rounded-md border border-[#3585AF]/50 text-[#C5E3F3] text-xs font-body tracking-widest uppercase hover:bg-[#3585AF]/10 transition-colors disabled:opacity-40">
            {busy === "write" ? <Loader2 size={13} className="animate-spin" /> : <Nfc size={13} />}
            Write to bracelet (Web NFC)
          </button>
          <button onClick={assign} disabled={busy !== null || !selected || !token}
            className="flex items-center justify-center gap-2 py-3 rounded-md bg-[#3585AF] text-white text-xs font-body tracking-widest uppercase hover:bg-[#3585AF]/80 transition-colors disabled:opacity-40">
            {busy === "assign" ? <Loader2 size={13} className="animate-spin" /> : assigned ? <CheckCircle2 size={13} /> : <CheckCircle2 size={13} />}
            {assigned ? "Assigned" : "3 · Assign to member"}
          </button>
        </div>

        {!canWebNfc() && (
          <p className="text-[11px] font-body text-[#8E9299]">
            This device can't write NFC tags in the browser. Copy the URL above and write it as an <span className="text-[#C5E3F3]">NDEF URL record</span> with any NFC writer app (e.g. NFC Tools), then assign.
          </p>
        )}

        {selected?.nfc_id && (
          <div className="flex items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[11px] font-body text-[#8E9299]">
              {(selected.display_name || selected.name) || "This member"} currently has token <span className="text-[#C5E3F3]">{selected.nfc_id}</span>
            </p>
            <button onClick={unassign} disabled={busy !== null}
              className="flex items-center gap-1.5 text-[11px] font-body text-[#8E9299] hover:text-white transition-colors disabled:opacity-40">
              {busy === "unassign" ? <Loader2 size={12} className="animate-spin" /> : <Unlink size={12} />} Unassign
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-5">
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] mb-3">How it works</p>
        <ol className="list-decimal list-inside space-y-1.5 text-[12px] font-body text-[#8E9299]">
          <li>Generate a token — it becomes the bracelet URL <span className="text-[#C5E3F3]">/b/&lt;token&gt;</span>.</li>
          <li>Write that URL to the bracelet as an NDEF URL record (Web NFC on Chrome/Android, or any NFC writer app).</li>
          <li>Assign the token to the member — stored as their <span className="text-[#C5E3F3]">nfc_id</span> (unique across all members).</li>
          <li>Test: tap the bracelet on a phone. It checks the member in and the name appears on the Welcome Wall.</li>
        </ol>
      </div>
    </div>
  );
};

export default BraceletStudio;
