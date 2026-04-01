import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadVoiceNote(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
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
    const { error } = await supabase.storage.from("voice-recordings").upload(path, blob);
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
      const audio = new Audio(existingUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-3">
      {isUploading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Loader2 size={16} className="animate-spin" /> Uploading...
        </div>
      ) : isRecording ? (
        <>
          <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center animate-pulse">
            <Square size={14} className="text-destructive-foreground" />
          </button>
          <span className="text-xs text-destructive font-mono tracking-wider">{formatTime(duration)}</span>
        </>
      ) : existingUrl ? (
        <>
          <button onClick={togglePlayback} className="w-10 h-10 border-2 border-primary/20 flex items-center justify-center hover:border-primary transition-colors">
            {isPlaying ? <Pause size={14} className="text-primary" /> : <Play size={14} className="text-primary" />}
          </button>
          <span className="text-[10px] tracking-widest text-primary/40">RECORDED</span>
          {onDelete && (
            <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </>
      ) : (
        <button onClick={startRecording} className="w-12 h-12 border-[3px] border-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-secondary transition-all group">
          <Mic size={18} className="text-primary group-hover:text-secondary" />
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
