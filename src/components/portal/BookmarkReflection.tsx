import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X, Check } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import type { Bookmark } from "@/data/weekData";

interface BookmarkReflectionProps {
  bookmark: Bookmark;
  response: { text: string; voiceUrl: string; shared: boolean };
  onSave: (data: { text: string; voiceUrl: string; shared: boolean }) => void;
  onDismiss: () => void;
}

const BookmarkReflection = ({ bookmark, response, onSave, onDismiss }: BookmarkReflectionProps) => {
  const [text, setText] = useState(response.text);
  const [voiceUrl, setVoiceUrl] = useState(response.voiceUrl);
  const [shared, setShared] = useState(response.shared);

  const handleSave = () => {
    onSave({ text, voiceUrl, shared });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="border-[3px] border-primary bg-background p-6 md:p-8"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] tracking-widest text-primary/40 block mb-1">
            BOOKMARK — {bookmark.label.toUpperCase()}
          </span>
          <h3 className="font-display text-lg tracking-wider text-primary">{bookmark.question}</h3>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-primary transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Voice recorder */}
      <div className="mb-4">
        <span className="text-[10px] tracking-widest text-primary/40 block mb-2">VOICE NOTE</span>
        <VoiceRecorder
          existingUrl={voiceUrl}
          onRecordingComplete={(url) => setVoiceUrl(url)}
          onDelete={() => setVoiceUrl("")}
        />
      </div>

      {/* Text response */}
      <div className="mb-4">
        <span className="text-[10px] tracking-widest text-primary/40 block mb-2">OR TYPE YOUR RESPONSE</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your reflection..."
          className="w-full bg-muted/30 text-primary p-3 text-sm font-body border-2 border-primary/10 focus:border-primary focus:outline-none resize-none min-h-[100px]"
        />
      </div>

      {/* Privacy + Save */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShared(!shared)}
          className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          {shared ? <Eye size={14} /> : <EyeOff size={14} />}
          {shared ? "SHARED WITH GROUP" : "KEEP PRIVATE"}
        </button>
        <button onClick={handleSave} className="btn-navy text-xs py-2 px-6 flex items-center gap-2">
          <Check size={14} /> SAVE RESPONSE
        </button>
      </div>
    </motion.div>
  );
};

export default BookmarkReflection;
