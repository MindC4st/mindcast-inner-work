import { useEffect, useState } from "react";
import QRCode from "qrcode";
import PortalLayout from "@/components/portal/PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Ticket } from "lucide-react";

// The member's door pass.
//
// The QR encodes the same /b/<token> URL as their NFC bracelet, so a member is
// one identity readable two ways — tap it or show it. Nothing here is a
// credential: the token identifies, the server decides entitlement, so a
// screenshotted pass belonging to a lapsed member is refused at the door.
//
// One pass covers the household. A guardian's scan brings up everyone on the
// family membership, so children and teens don't need their own phones — the
// door staff tick who came. A teen who gets dropped off can open this page on
// their own phone and be scanned independently.

const PortalPass = () => {
  const { profile } = useAuth();
  const { isMember, track } = useEntitlement();
  const [png, setPng] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles").select("nfc_id").eq("id", (profile as { id?: string })?.id ?? "").maybeSingle();
      if (!active) return;
      const t = (data as { nfc_id?: string } | null)?.nfc_id ?? null;
      setToken(t);
      if (t) {
        const url = `${window.location.origin}/b/${t}`;
        setPng(await QRCode.toDataURL(url, { width: 640, margin: 1, color: { dark: "#102438", light: "#FFFAF5" } }));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [profile]);

  return (
    <PortalLayout>
      <div className="max-w-md mx-auto text-center">
        <span className="portal-label text-foreground/40 block mb-2">DOOR PASS</span>
        <h1 className="heading-display text-2xl text-primary mb-2">Show this at the door</h1>
        <p className="text-sm text-muted-foreground font-body font-light mb-8">
          One pass for your whole household — the team will tick off who came.
        </p>

        {loading ? (
          <div className="py-16"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
        ) : !token ? (
          <p className="text-sm font-body text-muted-foreground py-10">
            No pass has been issued yet. Ask a facilitator to set one up.
          </p>
        ) : (
          <>
            <div className="portal-card p-6 inline-block">
              <img src={png ?? ""} alt="Your Mindcast door pass QR code" className="w-56 h-56 mx-auto" />
              <p className="font-mono text-xs tracking-[0.2em] text-foreground/50 mt-4">{token}</p>
            </div>

            <div className={`mt-6 inline-flex items-center gap-2 rounded-sm px-4 py-2 text-[11px] font-body tracking-widest uppercase ${
              isMember ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}>
              <Ticket size={13} />
              {isMember ? `${track} membership Â· active` : "No active membership"}
            </div>

            {!isMember && (
              <p className="mt-4 text-sm font-body text-muted-foreground">
                Sessions are members-only. This pass won't admit you until your membership is active.
              </p>
            )}

            <p className="mt-8 text-xs font-body text-muted-foreground/70 leading-relaxed">
              Works offline once the page has loaded — the code is the same one on your bracelet.
            </p>
          </>
        )}
      </div>
    </PortalLayout>
  );
};

export default PortalPass;