import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Play, Pause, SkipForward } from "lucide-react";
import type { Bookmark } from "@/data/weekData";

export interface PodcastPlayerHandle {
  resume: () => void;
}

interface PodcastPlayerProps {
  youtubeId?: string;
  bookmarks: Bookmark[];
  onBookmarkHit: (bookmark: Bookmark) => void;
  triggeredBookmarks: Set<string>;
}

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

const PodcastPlayer = ({ youtubeId, bookmarks, onBookmarkHit, triggeredBookmarks }: PodcastPlayerProps) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!youtubeId) return;
    if (window.YT && window.YT.Player) { setApiReady(true); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
  }, [youtubeId]);

  // Create player once API ready
  useEffect(() => {
    if (!apiReady || !youtubeId || !containerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: youtubeId,
      height: "100%",
      width: "100%",
      playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: () => {
          setDuration(playerRef.current.getDuration());
        },
        onStateChange: (e: any) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          if (e.data === window.YT.PlayerState.PLAYING) {
            setDuration(playerRef.current.getDuration());
          }
        },
      },
    });
    return () => { playerRef.current?.destroy?.(); };
  }, [apiReady, youtubeId]);

  // Poll current time & check bookmarks
  const checkBookmarks = useCallback(() => {
    if (!playerRef.current?.getCurrentTime) return;
    const t = Math.floor(playerRef.current.getCurrentTime());
    setCurrentTime(t);

    for (const bm of bookmarks) {
      if (t >= bm.timestamp && t < bm.timestamp + 3 && !triggeredBookmarks.has(bm.id)) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        onBookmarkHit(bm);
        break;
      }
    }
  }, [bookmarks, triggeredBookmarks, onBookmarkHit]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(checkBookmarks, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, checkBookmarks]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) { playerRef.current.pauseVideo(); } else { playerRef.current.playVideo(); }
  };

  const seekTo = (seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!youtubeId) {
    return (
      <div className="border-2 border-primary/10 p-8 text-center">
        <p className="text-muted-foreground text-sm font-body">Podcast episode not yet assigned. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="border-[3px] border-primary bg-primary text-secondary">
      {/* YouTube embed (hidden-ish, styled) */}
      <div className="aspect-video w-full bg-black">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Custom controls bar */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={togglePlay} className="w-10 h-10 border-2 border-secondary/30 flex items-center justify-center hover:border-secondary transition-colors">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <span className="text-xs font-mono tracking-wider text-secondary/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress bar with bookmark markers */}
        <div className="relative h-2 bg-secondary/10 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seekTo(pct * duration);
        }}>
          <div className="absolute inset-y-0 left-0 bg-secondary/40" style={{ width: `${progress}%` }} />
          {bookmarks.map((bm) => {
            const pos = duration > 0 ? (bm.timestamp / duration) * 100 : 0;
            const completed = triggeredBookmarks.has(bm.id);
            return (
              <button
                key={bm.id}
                onClick={(e) => { e.stopPropagation(); seekTo(bm.timestamp - 5); }}
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors ${
                  completed ? "bg-green-400 border-green-400" : "bg-secondary border-secondary"
                }`}
                style={{ left: `${pos}%` }}
                title={bm.label}
              />
            );
          })}
        </div>

        {/* Bookmark legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              onClick={() => seekTo(bm.timestamp - 5)}
              className={`text-[9px] tracking-widest px-2 py-1 border transition-colors ${
                triggeredBookmarks.has(bm.id) 
                  ? "border-green-400/40 text-green-400" 
                  : "border-secondary/20 text-secondary/50 hover:text-secondary"
              }`}
            >
              {formatTime(bm.timestamp)} — {bm.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer;
