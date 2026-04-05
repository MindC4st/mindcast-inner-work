import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { Maximize } from "lucide-react";

const WelcomeWall = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [session, setSession] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    const loadSession = async () => {
      if (sessionId) {
        const { data } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
        setSession(data);
      } else {
        const { data } = await supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle();
        setSession(data);
      }
    };
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const fetchCheckins = async () => {
      const { data } = await supabase.from("check_ins").select("*").eq("session_id", session.id).order("checked_in_at", { ascending: false }).limit(20);
      setCheckins(data || []);
    };
    fetchCheckins();
    const interval = setInterval(fetchCheckins, 4000);
    return () => clearInterval(interval);
  }, [session]);

  const goFullscreen = () => { document.documentElement.requestFullscreen?.(); };

  if (!session) return <div className="fixed inset-0 bg-background flex items-center justify-center"><p className="text-white/20 font-body">Loading...</p></div>;

  const visible = checkins.filter((c) => !c.is_anonymous);
  const siteUrl = window.location.origin;

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <div className="px-10 py-6 border-b border-white/[0.06] flex items-end justify-between">
        <div>
          <p className="font-body text-[10px] text-white/20 uppercase tracking-[0.2em]">mindcast · week {session.session_number}</p>
          <h1 className="text-3xl font-display font-bold text-white mt-1">{session.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={goFullscreen} className="text-white/15 hover:text-white/40 transition-colors" title="Fullscreen">
            <Maximize size={18} />
          </button>
          <div className="text-right">
            <p className="text-6xl font-display font-bold text-white">{checkins.length}</p>
            <p className="text-white/25 text-sm font-body">with us tonight</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-hidden">
        <div className="grid grid-cols-4 gap-4 auto-rows-min">
          <AnimatePresence>
            {visible.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <p className="font-display font-bold text-white text-lg">{c.display_name}</p>
                {c.welcome_note && <p className="text-white/40 text-sm font-body mt-1 leading-snug">{c.welcome_note}</p>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-10 py-5 border-t border-white/[0.06] flex items-center gap-6">
        <QRCode value={`${siteUrl}/checkin`} size={72} bgColor="transparent" fgColor="rgba(255,255,255,0.6)" />
        <div>
          <p className="text-white/25 text-sm font-body">Scan to check in</p>
          <p className="text-white/10 text-xs font-body mt-0.5">mindcast.co.nz/checkin</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-white/15 text-xs font-body">{new Date().toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWall;
