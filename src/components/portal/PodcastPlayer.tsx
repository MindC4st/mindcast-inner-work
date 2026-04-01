import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Play, Pause } from "lucide-react";
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

const PodcastPlayer = forwardRef<PodcastPlayerHandle, PodcastPlayerProps>(({ youtubeId, bookmarks, onBookmarkHit, triggeredBookmarks }, ref) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  useImperativeHandle(ref, () => ({
    resume: () => { playerRef.current?.playVideo?.(); },
  }));

  useEffect(() => {
    if (!youtubeId) return;
    if (window.YT && window.YT.Player) { setApiReady(true); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
  }, [youtubeId]);

  useEffect(() => {
    if (!apiReady || !youtubeId || !containerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: youtubeId,
      height: "100%",
      width: "100%",
      playerVars: { modestbranding: 1, rel: 0, playsinline: 1 },
      events: {
        onReady: () => { setDuration(playerRef.current.getDuration()); },
        onStateChange: (e: any) => {
          setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          if (e.data === window.YT.PlayerState.PLAYING) setDuration(playerRef.current.getDuration());
        },
      },
    });
    return () => { playerRef.current?.destroy?.(); };
  }, [apiReady, youtubeId]);

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
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const seekTo = (seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!youtubeId) {
    return (
      <div className="portal-card p-8 text-center">
        <p className="text-muted-foreground text-sm">Episode not yet assigned. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden player-dark shadow-lg">
      {/* YouTube embed */}
      <div className="aspect-video w-full bg-foreground/90">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Controls */}
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-electric flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 shadow-md"
          >
            {isPlaying ? <Pause size={20} className="text-accent-foreground" /> : <Play size={20} className="text-accent-foreground ml-0.5" />}
          </button>
          <span className="text-xs font-mono tracking-wider text-primary-foreground/50">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="relative h-2 bg-primary-foreground/10 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(pct * duration);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 bg-electric/60 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Bookmark dots */}
          {bookmarks.map((bm) => {
            const pos = duration > 0 ? (bm.timestamp / duration) * 100 : 0;
            const completed = triggeredBookmarks.has(bm.id);
            return (
              <button
                key={bm.id}
                onClick={(e) => { e.stopPropagation(); seekTo(bm.timestamp - 5); }}
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 -ml-2 rounded-full border-2 transition-all touch-manipulation hover:scale-125 ${
                  completed
                    ? "bg-electric border-electric shadow-[0_0_8px_hsl(217,91%,60%,0.5)]"
                    : "bg-primary-foreground/30 border-primary-foreground/50"
                }`}
                style={{ left: `${pos}%` }}
                title={bm.label}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

PodcastPlayer.displayName = "PodcastPlayer";

export default PodcastPlayer;