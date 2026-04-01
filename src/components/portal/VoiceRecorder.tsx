import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VoiceRecorderProps {
  onRecordingComplete: (url: string) => void;
  existingUrl?: string;
  onDelete?: () => void;
}

const VoiceRecorder = ({ onRecordingComplete, existingUrl, onDelete }: VoiceRecorderProps) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "hsla(213, 56%, 11%, 0.03)";
      ctx.fillRect(0, 0, w, h);

      // Waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "hsl(213, 56%, 11%)";
      ctx.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Glow bars
      ctx.fillStyle = "hsla(213, 56%, 11%, 0.15)";
      const barCount = 32;
      const barWidth = w / barCount - 2;
      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * bufferLength);
        const v = Math.abs(dataArray[idx] - 128) / 128;
        const barH = v * h * 0.8;
        ctx.fillRect(i * (barWidth + 2), (h - barH) / 2, barWidth, barH);
      }
    };
    draw();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio context for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        analyserRef.current = null;
        audioCtx.close();
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadVoiceNote(blob);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      drawWaveform();
    } catch {
      // Microphone access denied
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const uploadVoiceNote = async (blob: Blob) => {
    if (!user) return;
    setIsUploading(true);
    const path = `${user.id}/${Date.now()}.webm`;
    const { error } = await supabase.storage.from("voice-recordings").upload(path, blob, {
      contentType: "audio/webm",
    });
    if (!error) {
      const { data } = supabase.storage.from("voice-recordings").getPublicUrl(path);
      onRecordingComplete(data.publicUrl);
    }
    setIsUploading(false);
  };

  const togglePlayback = () => {
    if (!existingUrl) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
      const audio = new Audio(existingUrl);
      audioRef.current = audio;
      audio.onloadedmetadata = () => setPlaybackDuration(audio.duration);
      audio.ontimeupdate = () => {
        if (audio.duration) setPlaybackProgress(audio.currentTime / audio.duration);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(0);
        audioRef.current = null;
      };
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleReRecord = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    setPlaybackProgress(0);
    onDelete?.();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-2">
      {isUploading ? (
        <div className="flex items-center gap-3 p-4 border border-primary/10">
          <Loader2 size={18} className="animate-spin text-primary/40" />
          <span className="text-xs tracking-widest text-primary/40">UPLOADING VOICE NOTE...</span>
        </div>
      ) : isRecording ? (
        <div className="border border-destructive/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs tracking-widest text-destructive font-mono">{formatTime(duration)}</span>
              <span className="text-[10px] tracking-widest text-destructive/60">RECORDING</span>
            </div>
            <button
              onClick={stopRecording}
              className="w-14 h-14 md:w-10 md:h-10 bg-destructive flex items-center justify-center hover:bg-destructive/80 transition-colors touch-manipulation shrink-0"
            >
              <Square size={18} className="md:w-[14px] md:h-[14px] text-destructive-foreground" />
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={60}
            className="w-full h-[60px] border border-primary/5"
          />
        </div>
      ) : existingUrl ? (
        <div className="border border-primary/10 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="w-10 h-10 border-2 border-primary/20 flex items-center justify-center hover:border-primary transition-colors shrink-0"
            >
              {isPlaying ? <Pause size={14} className="text-primary" /> : <Play size={14} className="text-primary" />}
            </button>
            <div className="flex-1 space-y-1">
              {/* Progress bar */}
              <div className="w-full h-2 bg-primary/5 relative overflow-hidden">
                <div
                  className="h-full bg-primary/40 transition-all duration-200"
                  style={{ width: `${playbackProgress * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-widest text-primary/30">
                  {playbackDuration > 0 ? formatTime(Math.floor(playbackProgress * playbackDuration)) : "0:00"}
                </span>
                <span className="text-[9px] tracking-widest text-primary/30">
                  {playbackDuration > 0 ? formatTime(Math.floor(playbackDuration)) : "—"}
                </span>
              </div>
            </div>
            <button
              onClick={handleReRecord}
              className="flex items-center gap-1.5 text-primary/40 hover:text-primary transition-colors shrink-0"
              title="Re-record"
            >
              <RotateCcw size={14} />
              <span className="text-[9px] tracking-widest hidden sm:inline">RE-RECORD</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-3 p-5 md:p-4 border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group touch-manipulation"
        >
          <div className="w-16 h-16 md:w-12 md:h-12 border-[3px] border-primary rounded-full flex items-center justify-center group-hover:bg-primary transition-all shrink-0">
            <Mic size={24} className="md:w-[18px] md:h-[18px] text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <div className="text-left">
            <span className="text-sm md:text-xs tracking-widest text-primary block">TAP TO RECORD</span>
            <span className="text-[10px] md:text-[9px] tracking-widest text-primary/30">VOICE NOTE</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
