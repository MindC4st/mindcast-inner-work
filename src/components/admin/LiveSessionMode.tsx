import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Maximize2, Minimize2, Eye, EyeOff, Volume2 } from "lucide-react";

interface Bookmark {
  id: string;
  timestamp_seconds: number;
  label: string;
  question: string;
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
  const [fullscreen, setFullscreen] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    supabase.from("sessions").select("id, title, session_number, youtube_id").order("session_number").then(({ data }) => {
      if (data) setSessions(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    supabase.from("session_bookmarks").select("*").eq("session_id", selectedSessionId).order("sort_order").then(({ data }) => {
      if (data) setBookmarks(data);
    });
  }, [selectedSessionId]);

  // YouTube player
  useEffect(() => {
    if (!selectedSessionId) return;
    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session?.youtube_id) return;

    const loadPlayer = () => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new (window as any).YT.Player("live-yt-player", {
        videoId: session.youtube_id,
        playerVars: { enablejsapi: 1, modestbranding: 1, rel: 0 },
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

    return () => { if (playerRef.current) playerRef.current.destroy(); };
  }, [selectedSessionId, sessions]);

  const playClip = (bm: Bookmark) => {
    if (!playerRef.current) return;
    const start = Math.max(0, bm.timestamp_seconds - 15);
    playerRef.current.seekTo(start, true);
    playerRef.current.playVideo();
    setTimeout(() => {
      if (playerRef.current) playerRef.current.pauseVideo();
    }, 30000);
  };

  const selectBookmark = async (bm: Bookmark) => {
    setActiveBookmark(bm);
    if (!cohortId) return;
    setLoadingResponses(true);

    const { data: bmResponses } = await supabase
      .from("bookmark_responses")
      .select("id, user_id, bookmark_id, response_text, voice_url")
      .eq("cohort_id", cohortId)
      .eq("bookmark_id", bm.id);

    if (bmResponses && bmResponses.length > 0) {
      const userIds = bmResponses.map(r => r.user_id);
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

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div ref={containerRef} className={`${fullscreen ? "bg-background p-6" : ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg tracking-widest text-primary">LIVE SESSION MODE</h2>
        <div className="flex items-center gap-3">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a session..." />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>Session {s.session_number}: {s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSessionId && (
            <Button variant="outline" size="icon" onClick={toggleFullscreen} title="Share to Screen">
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </Button>
          )}
        </div>
      </div>

      {!selectedSessionId ? (
        <div className="border-2 border-dashed border-primary/10 p-16 text-center">
          <p className="text-sm text-muted-foreground">Select a session to begin the live presenter view</p>
        </div>
      ) : (
        <div className={`grid ${fullscreen ? "grid-cols-2 gap-6 h-[calc(100vh-120px)]" : "grid-cols-1 lg:grid-cols-2 gap-6"}`}>
          {/* LEFT — Clip Player */}
          <div className="space-y-4">
            <div className="aspect-video bg-black border border-primary/10">
              <div id="live-yt-player" className="w-full h-full" />
            </div>

            <div className="border border-primary/10">
              <div className="bg-primary/5 p-3 border-b border-primary/10">
                <h3 className="text-xs tracking-widest text-primary/60">BOOKMARK QUESTIONS</h3>
              </div>
              <div className={`divide-y divide-primary/5 ${fullscreen ? "max-h-[calc(100vh-520px)] overflow-y-auto" : "max-h-64 overflow-y-auto"}`}>
                {bookmarks.map(bm => (
                  <button
                    key={bm.id}
                    onClick={() => selectBookmark(bm)}
                    className={`w-full text-left p-3 transition-colors ${
                      activeBookmark?.id === bm.id ? "bg-primary/10" : "hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-primary/40 w-10">{formatTime(bm.timestamp_seconds)}</span>
                      <div className="flex-1">
                        <span className="text-xs tracking-wider text-primary">{bm.label}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{bm.question}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[9px] tracking-widest shrink-0"
                        onClick={(e) => { e.stopPropagation(); playClip(bm); }}
                      >
                        <Play size={10} /> 30s CLIP
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Response Summary */}
          <div className="border border-primary/10 flex flex-col">
            <div className="bg-primary/5 p-3 border-b border-primary/10 flex items-center justify-between">
              <h3 className="text-xs tracking-widest text-primary/60">
                {activeBookmark ? "MEMBER RESPONSES" : "SELECT A BOOKMARK"}
              </h3>
              {activeBookmark && (
                <span className="text-[9px] tracking-widest text-primary/30">{responses.length} RESPONSES</span>
              )}
            </div>

            {activeBookmark && (
              <div className="p-3 border-b border-primary/10 bg-primary/5">
                <p className="text-xs text-primary italic">"{activeBookmark.question}"</p>
              </div>
            )}

            <div className={`flex-1 overflow-y-auto divide-y divide-primary/5 ${fullscreen ? "" : "max-h-96"}`}>
              {loadingResponses ? (
                <p className="p-4 text-xs text-muted-foreground animate-pulse">Loading responses...</p>
              ) : !activeBookmark ? (
                <p className="p-8 text-xs text-muted-foreground text-center">Click a bookmark question on the left to view member responses</p>
              ) : responses.length === 0 ? (
                <p className="p-8 text-xs text-muted-foreground text-center">No responses for this bookmark yet</p>
              ) : (
                responses.map(r => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => toggleName(r.id)} className="flex items-center gap-2 text-xs text-primary/40 hover:text-primary transition-colors">
                        {r.nameVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        {r.nameVisible ? (
                          <span className="tracking-wider font-display">{r.name.toUpperCase()}</span>
                        ) : (
                          <span className="tracking-widest">ANONYMOUS</span>
                        )}
                      </button>
                    </div>
                    {r.response_text && (
                      <p className={`text-sm text-foreground ${fullscreen ? "text-base" : ""}`}>{r.response_text}</p>
                    )}
                    {r.voice_url && (
                      <div className="mt-2 flex items-center gap-2">
                        <Volume2 size={12} className="text-primary/40" />
                        <audio src={r.voice_url} controls className="h-8 flex-1" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionMode;
