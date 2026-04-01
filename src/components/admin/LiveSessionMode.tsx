import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Eye, EyeOff, Volume2, Lock, Monitor, X, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Bookmark {
  id: string;
  timestamp_seconds: number;
  timestamp_label: string;
  label: string;
  question: string;
  is_final_reflection: boolean;
}

interface SessionOption {
  id: string;
  title: string;
  session_number: number;
  youtube_id: string;
}

interface Response {
  id: string;
  user_id: string;
  bookmark_id: string;
  response_text: string | null;
  voice_url: string | null;
  privacy: string;
  is_shared: boolean;
  name: string;
  nameVisible: boolean;
}

const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

const LiveSessionMode = () => {
  const { cohortId } = useAuth();
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeBookmark, setActiveBookmark] = useState<Bookmark | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [projectView, setProjectView] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const clipTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.from("sessions").select("id, title, session_number, youtube_id").order("session_number").then(({ data }) => {
      if (data) setSessions(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    supabase.from("session_bookmarks").select("*").eq("session_id", selectedSessionId).order("sort_order").then(({ data }) => {
      if (data) setBookmarks(data as Bookmark[]);
    });
  }, [selectedSessionId]);

  // YouTube player
  useEffect(() => {
    if (!selectedSessionId) return;
    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session?.youtube_id) return;

    const loadPlayer = () => {
      if (playerRef.current) { try { playerRef.current.destroy(); } catch {} }
      playerRef.current = new (window as any).YT.Player("live-yt-player", {
        videoId: session.youtube_id,
        playerVars: { enablejsapi: 1, modestbranding: 1, rel: 0, controls: 1 },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e: any) => setPlaying(e.data === 1),
        },
      });
    };

    if ((window as any).YT?.Player) {
      loadPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = loadPlayer;
    }

    return () => { try { playerRef.current?.destroy(); } catch {} };
  }, [selectedSessionId, sessions]);

  const playClip = (bm: Bookmark) => {
    if (!playerRef.current || bm.is_final_reflection) return;
    if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
    const start = Math.max(0, bm.timestamp_seconds - 15);
    playerRef.current.seekTo(start, true);
    playerRef.current.playVideo();
    clipTimerRef.current = setTimeout(() => {
      try { playerRef.current?.pauseVideo(); } catch {}
    }, 30000);
  };

  const selectBookmark = async (bm: Bookmark) => {
    setActiveBookmark(bm);
    setLoadingResponses(true);

    // Facilitators can see ALL responses (RLS allows it)
    const { data: bmResponses } = await supabase
      .from("bookmark_responses")
      .select("id, user_id, bookmark_id, response_text, voice_url, privacy, is_shared")
      .eq("bookmark_id", bm.id);

    if (bmResponses && bmResponses.length > 0) {
      const userIds = [...new Set(bmResponses.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach(p => { nameMap[p.user_id] = p.name; });

      setResponses(bmResponses.map(r => ({
        ...r,
        name: nameMap[r.user_id] || "Member",
        nameVisible: false,
      })));
    } else {
      setResponses([]);
    }
    setLoadingResponses(false);
  };

  const toggleName = (id: string) => {
    setResponses(prev => prev.map(r => r.id === id ? { ...r, nameVisible: !r.nameVisible } : r));
  };

  const toggleAllNames = () => {
    const allVisible = responses.every(r => r.nameVisible);
    setResponses(prev => prev.map(r => ({ ...r, nameVisible: !allVisible })));
  };

  const enterProjectView = () => {
    setProjectView(true);
    containerRef.current?.requestFullscreen?.();
  };

  const exitProjectView = () => {
    setProjectView(false);
    try { document.exitFullscreen?.(); } catch {}
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setProjectView(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const sharedResponses = responses.filter(r => r.privacy === "group" || r.is_shared);
  const privateResponses = responses.filter(r => r.privacy === "private" && !r.is_shared);
  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // ─── PROJECT VIEW (fullscreen, TV/projector optimised) ───
  if (projectView) {
    return (
      <div ref={containerRef} className="fixed inset-0 bg-primary text-primary-foreground flex flex-col z-[100]">
        {/* Minimal top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-primary-foreground/[0.06]">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg tracking-[0.15em]">MINDCAST</span>
            <span className="text-primary-foreground/20 text-[10px] tracking-[0.2em] font-body">LIVE</span>
          </div>
          <button onClick={exitProjectView} className="text-primary-foreground/30 hover:text-primary-foreground transition-colors">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Left — bookmark list */}
          <div className="w-72 border-r border-primary-foreground/[0.06] overflow-y-auto">
            {bookmarks.map(bm => (
              <button
                key={bm.id}
                onClick={() => selectBookmark(bm)}
                className={`w-full text-left px-5 py-4 border-b border-primary-foreground/[0.04] transition-colors ${
                  activeBookmark?.id === bm.id
                    ? "bg-primary-foreground/[0.08]"
                    : "hover:bg-primary-foreground/[0.03]"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  {!bm.is_final_reflection && (
                    <span className="text-[11px] font-mono text-primary-foreground/30">{bm.timestamp_label || formatTime(bm.timestamp_seconds)}</span>
                  )}
                  {bm.is_final_reflection && (
                    <span className="text-[9px] tracking-[0.2em] text-primary-foreground/30 font-body">FINAL</span>
                  )}
                </div>
                <p className="text-[12px] text-primary-foreground/60 font-body leading-relaxed">{bm.label}</p>
              </button>
            ))}
          </div>

          {/* Right — question + responses (large text for projector) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeBookmark ? (
              <>
                {/* Question */}
                <div className="px-12 py-10 border-b border-primary-foreground/[0.06]">
                  <p className="font-serif text-2xl lg:text-3xl text-primary-foreground/90 leading-relaxed font-light">
                    "{activeBookmark.question}"
                  </p>
                  {!activeBookmark.is_final_reflection && (
                    <button
                      onClick={() => playClip(activeBookmark)}
                      className="mt-4 flex items-center gap-2 text-[11px] tracking-[0.15em] text-primary-foreground/30 hover:text-primary-foreground/60 font-body transition-colors"
                    >
                      <Play size={13} strokeWidth={1.5} /> Play 30s clip
                    </button>
                  )}
                </div>

                {/* Responses */}
                <div className="flex-1 overflow-y-auto px-12 py-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] tracking-[0.2em] text-primary-foreground/20 font-body">
                      {responses.length} RESPONSE{responses.length !== 1 ? "S" : ""}
                    </span>
                    <button onClick={toggleAllNames} className="text-[10px] tracking-[0.15em] text-primary-foreground/20 hover:text-primary-foreground/40 font-body transition-colors">
                      Toggle all names
                    </button>
                  </div>
                  <div className="space-y-6">
                    {/* Shared first, then private */}
                    {[...sharedResponses, ...privateResponses].map(r => {
                      const isPrivate = r.privacy === "private" && !r.is_shared;
                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border-l-2 pl-6 py-1 ${isPrivate ? "border-primary-foreground/10" : "border-primary-foreground/20"}`}
                        >
                          {r.response_text && (
                            <p className={`font-serif text-lg lg:text-xl leading-relaxed font-light ${isPrivate ? "text-primary-foreground/40" : "text-primary-foreground/80"}`}>
                              {r.response_text}
                            </p>
                          )}
                          {r.voice_url && (
                            <div className="mt-3 flex items-center gap-2">
                              <Volume2 size={14} className="text-primary-foreground/20" strokeWidth={1.5} />
                              <audio src={r.voice_url} controls className="h-8 opacity-60" />
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <button onClick={() => toggleName(r.id)} className="text-[10px] tracking-[0.15em] text-primary-foreground/20 hover:text-primary-foreground/40 font-body transition-colors flex items-center gap-1.5">
                              {r.nameVisible ? <Eye size={11} strokeWidth={1.5} /> : <EyeOff size={11} strokeWidth={1.5} />}
                              {r.nameVisible ? r.name : "Anonymous"}
                            </button>
                            {isPrivate && <Lock size={10} className="text-primary-foreground/15" strokeWidth={1.5} />}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-primary-foreground/20 font-body text-sm tracking-[0.1em]">Select a bookmark to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── STANDARD ADMIN VIEW ───
  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="portal-heading text-2xl">Live Session Mode</h2>
          <p className="text-sm text-muted-foreground font-body font-light mt-1">Present responses during your group session</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSessionId} onValueChange={v => { setSelectedSessionId(v); setActiveBookmark(null); setResponses([]); }}>
            <SelectTrigger className="w-72 font-body text-sm">
              <SelectValue placeholder="Choose a session..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id} className="font-body">
                  Session {s.session_number}: {s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedSessionId ? (
        <div className="portal-card p-16 text-center">
          <Radio size={24} className="text-muted-foreground/30 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground font-body font-light">Select a session to begin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 border border-foreground/[0.07] bg-white/70">
          {/* LEFT — Sidebar with player + bookmarks */}
          <div className="border-r border-foreground/[0.06] flex flex-col">
            {/* Mini player */}
            <div className="aspect-video bg-foreground/[0.03]">
              <div id="live-yt-player" className="w-full h-full" />
            </div>

            {/* Bookmarks list */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-b border-foreground/[0.06]">
              <span className="portal-label">Bookmarks</span>
              <span className="text-[9px] text-muted-foreground/40 font-body">{bookmarks.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {bookmarks.map(bm => (
                <button
                  key={bm.id}
                  onClick={() => selectBookmark(bm)}
                  className={`w-full text-left px-4 py-3 border-b border-foreground/[0.04] transition-all duration-200 ${
                    activeBookmark?.id === bm.id
                      ? "bg-foreground/[0.04]"
                      : "hover:bg-foreground/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!bm.is_final_reflection ? (
                      <span className="text-[10px] font-mono text-muted-foreground/50">{bm.timestamp_label || formatTime(bm.timestamp_seconds)}</span>
                    ) : (
                      <span className="text-[9px] tracking-[0.15em] text-muted-foreground/40 font-body">FINAL</span>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground/70 font-body leading-relaxed line-clamp-2">{bm.label}</p>
                  {!bm.is_final_reflection && (
                    <button
                      className="mt-1.5 flex items-center gap-1 text-[9px] tracking-[0.12em] text-muted-foreground/40 hover:text-foreground/60 font-body transition-colors"
                      onClick={(e) => { e.stopPropagation(); playClip(bm); }}
                    >
                      <Play size={9} strokeWidth={2} /> 30s clip
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Responses */}
          <div className="flex flex-col min-h-[500px]">
            {activeBookmark ? (
              <>
                {/* Question header */}
                <div className="px-6 py-5 border-b border-foreground/[0.06]">
                  <p className="font-serif text-lg text-foreground/80 leading-relaxed font-light italic">
                    "{activeBookmark.question}"
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="portal-label">{responses.length} response{responses.length !== 1 ? "s" : ""}</span>
                    <button onClick={toggleAllNames} className="text-[10px] tracking-[0.12em] text-muted-foreground/40 hover:text-foreground/60 font-body transition-colors">
                      Toggle names
                    </button>
                    <button
                      onClick={enterProjectView}
                      className="ml-auto flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-foreground/40 hover:text-foreground font-body transition-colors border border-foreground/10 px-3 py-1.5 hover:border-foreground/20"
                    >
                      <Monitor size={12} strokeWidth={1.5} /> Project View
                    </button>
                  </div>
                </div>

                {/* Response list */}
                <div className="flex-1 overflow-y-auto">
                  {loadingResponses ? (
                    <p className="p-6 text-sm text-muted-foreground font-body animate-pulse">Loading responses...</p>
                  ) : responses.length === 0 ? (
                    <p className="p-10 text-sm text-muted-foreground font-body text-center font-light">No responses for this bookmark yet</p>
                  ) : (
                    <div className="divide-y divide-foreground/[0.04]">
                      {/* Shared responses */}
                      {sharedResponses.map(r => (
                        <ResponseCard key={r.id} response={r} onToggleName={toggleName} isPrivate={false} />
                      ))}
                      {/* Private responses (admin-only, dimmed) */}
                      {privateResponses.length > 0 && (
                        <>
                          <div className="px-6 py-2 bg-foreground/[0.02]">
                            <span className="text-[9px] tracking-[0.2em] text-muted-foreground/30 font-body flex items-center gap-1.5">
                              <Lock size={9} strokeWidth={1.5} /> PRIVATE — ADMIN ONLY ({privateResponses.length})
                            </span>
                          </div>
                          {privateResponses.map(r => (
                            <ResponseCard key={r.id} response={r} onToggleName={toggleName} isPrivate={true} />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Radio size={20} className="text-muted-foreground/20 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground/50 font-body font-light">Select a bookmark to view responses</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Response card sub-component ───
const ResponseCard = ({
  response: r,
  onToggleName,
  isPrivate,
}: {
  response: Response;
  onToggleName: (id: string) => void;
  isPrivate: boolean;
}) => (
  <div className={`px-6 py-4 ${isPrivate ? "opacity-60" : ""}`}>
    <div className="flex items-center gap-2 mb-2">
      <button
        onClick={() => onToggleName(r.id)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground/60 font-body transition-colors"
      >
        {r.nameVisible ? <Eye size={12} strokeWidth={1.5} /> : <EyeOff size={12} strokeWidth={1.5} />}
        {r.nameVisible ? r.name : "Anonymous"}
      </button>
      {isPrivate && <Lock size={10} className="text-muted-foreground/30" strokeWidth={1.5} />}
    </div>
    {r.response_text && (
      <p className="text-sm text-foreground/80 font-body leading-relaxed">{r.response_text}</p>
    )}
    {r.voice_url && (
      <div className="mt-2 flex items-center gap-2">
        <Volume2 size={13} className="text-muted-foreground/30" strokeWidth={1.5} />
        <audio src={r.voice_url} controls className="h-8 flex-1 opacity-70" />
      </div>
    )}
  </div>
);

export default LiveSessionMode;
