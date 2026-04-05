import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize } from "lucide-react";

const COLORS = ["#F5F0EB", "#C9A8B0", "#A3B5A0", "#B8A9CC", "#D4C5A9", "#E8D5C4"];

function countWords(words: string[]): { word: string; count: number }[] {
  const map = new Map<string, number>();
  words.forEach((w) => {
    const lower = w.toLowerCase().trim();
    if (lower) map.set(lower, (map.get(lower) || 0) + 1);
  });
  return Array.from(map.entries()).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count);
}

const WordCloud = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [session, setSession] = useState<any>(null);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = sessionId
        ? await supabase.from("sessions").select("*").eq("id", sessionId).single()
        : await supabase.from("sessions").select("*").eq("status", "active").limit(1).maybeSingle();
      setSession(data);
    };
    load();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    const fetch = async () => {
      const { data } = await supabase.from("workbook_entries").select("leaving_word").eq("session_id", session.id).eq("share_leaving_word", true).not("leaving_word", "is", null);
      setWords((data || []).map((d: any) => d.leaving_word).filter(Boolean));
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const counted = useMemo(() => countWords(words), [words]);
  const maxCount = Math.max(...counted.map((w) => w.count), 1);

  const positioned = useMemo(() => {
    return counted.map((w, i) => {
      const seed = w.word.charCodeAt(0) + i;
      const x = 10 + (seed * 37 % 80);
      const y = 10 + (seed * 53 % 70);
      const size = Math.max(16, Math.min(72, (w.count / maxCount) * 72));
      const color = COLORS[i % COLORS.length];
      return { ...w, x, y, size, color };
    });
  }, [counted, maxCount]);

  const uniqueMembers = new Set(words).size;
  const goFullscreen = () => { document.documentElement.requestFullscreen?.(); };

  if (!session) return <div className="fixed inset-0 bg-background flex items-center justify-center"><p className="text-foreground/20 font-body">Loading...</p></div>;

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      <button onClick={goFullscreen} className="absolute top-4 right-4 text-foreground/15 hover:text-foreground/40 transition-colors z-10" title="Fullscreen">
        <Maximize size={18} />
      </button>
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence>
          {positioned.map((w) => (
            <motion.span
              key={w.word}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute font-display font-bold select-none"
              style={{ left: `${w.x}%`, top: `${w.y}%`, fontSize: `${w.size}px`, color: w.color, transform: "translate(-50%, -50%)" }}
            >
              {w.word}
            </motion.span>
          ))}
        </AnimatePresence>
        {counted.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-foreground/15 font-body text-lg">Waiting for words...</p>
          </div>
        )}
      </div>
      <div className="px-10 py-4 text-right">
        <p className="text-foreground/15 text-xs font-body">{words.length} words · {uniqueMembers} members</p>
      </div>
    </div>
  );
};

export default WordCloud;
