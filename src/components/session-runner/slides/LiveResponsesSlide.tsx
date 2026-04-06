import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { QrCode, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const JOIN_URL = "https://mindcast-inner-work.lovable.app/join";
const SESSION_CODE = "MC01";

interface Response {
  id: string;
  word: string;
  display_name: string;
  show_name: boolean;
}

const LiveResponsesSlide = () => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [showNames, setShowNames] = useState(true);

  useEffect(() => {
    // Fetch existing word submissions for the current session
    const fetchResponses = async () => {
      const { data } = await supabase
        .from("word_submissions")
        .select("id, word, profile_id")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) {
        setResponses(data.map(d => ({
          id: d.id,
          word: d.word,
          display_name: "Member",
          show_name: true,
        })));
      }
    };
    fetchResponses();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("live-responses")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "word_submissions" }, (payload) => {
        const newRow = payload.new as any;
        setResponses(prev => [{
          id: newRow.id,
          word: newRow.word,
          display_name: "Member",
          show_name: true,
        }, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="h-full flex flex-col px-16 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[hsl(var(--bronze))] text-xs tracking-[0.4em] font-body mb-4 uppercase">Live Responses</p>
          <h2 className="font-display text-4xl text-[hsl(var(--ivory))] tracking-wide">SHARE YOUR THOUGHTS</h2>
          <p className="text-[hsl(var(--ivory))]/40 font-body text-sm mt-2">
            Scan the QR code or visit the link to submit your response.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-3 rounded-md">
            <QRCode value={`${JOIN_URL}/${SESSION_CODE}`} size={100} />
          </div>
          <div className="text-center">
            <p className="text-[hsl(var(--ivory))]/60 font-body text-xs">Join at</p>
            <p className="text-[hsl(var(--blue))] font-body text-xs font-bold tracking-wider">mindcast.app/join</p>
            <p className="text-[hsl(var(--bronze))] font-display text-xl mt-1">{SESSION_CODE}</p>
          </div>
        </div>
      </div>

      {/* Toggle names */}
      <button
        onClick={() => setShowNames(p => !p)}
        className="flex items-center gap-2 text-[hsl(var(--ivory))]/30 hover:text-[hsl(var(--ivory))]/60 transition-colors text-xs font-body tracking-wider mb-4 self-start"
      >
        {showNames ? <Eye size={14} /> : <EyeOff size={14} />}
        {showNames ? "NAMES VISIBLE" : "ANONYMOUS"}
      </button>

      {/* Responses grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3">
        <AnimatePresence>
          {responses.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-[hsl(var(--ivory))]/10 rounded-sm p-4 bg-[hsl(var(--ivory))]/[0.03]"
            >
              <p className="text-[hsl(var(--ivory))] font-body text-sm leading-relaxed">{r.word}</p>
              {showNames && r.show_name && (
                <p className="text-[hsl(var(--ivory))]/20 font-body text-[10px] tracking-wider mt-2 uppercase">
                  {r.display_name}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {responses.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20">
            <QrCode size={32} className="text-[hsl(var(--ivory))]/10 mb-4" />
            <p className="text-[hsl(var(--ivory))]/20 font-body text-sm">Waiting for responses...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveResponsesSlide;
