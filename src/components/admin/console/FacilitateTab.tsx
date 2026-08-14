import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProgramSchedule } from "@/hooks/useProgramSchedule";
import { Clapperboard, Nfc, Printer, BookOpen, ArrowRight } from "lucide-react";

const TRACKS = ["Adult", "Teen", "Child"] as const;

const FacilitateTab = () => {
  const navigate = useNavigate();
  const { currentWeek } = useProgramSchedule();
  const [week, setWeek] = useState<number>(currentWeek || 1);
  const [track, setTrack] = useState<(typeof TRACKS)[number]>("Adult");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wider">Facilitate</h2>
        <p className="text-[#8E9299] text-sm font-body mt-1">Open and start a live session. Adults, teens and children run in parallel on the same slide format.</p>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] block mb-2">Session week</label>
            <input
              type="number" min={1} max={52} value={week}
              onChange={(e) => setWeek(Math.min(52, Math.max(1, parseInt(e.target.value || "1", 10) || 1)))}
              className="w-full bg-transparent border border-white/10 rounded-md px-3 py-2.5 text-lg font-display tracking-wider text-white focus:outline-none focus:border-[#3585AF]/60 transition-colors"
            />
            {currentWeek && (
              <button onClick={() => setWeek(currentWeek)} className="mt-2 text-[11px] font-body text-[#C5E3F3] underline underline-offset-2">
                Jump to current week ({currentWeek})
              </button>
            )}
          </div>
          <div>
            <label className="text-[10px] font-body tracking-[0.2em] uppercase text-[#8E9299] block mb-2">Track</label>
            <div className="grid grid-cols-3 gap-1 rounded-md border border-white/10 p-1">
              {TRACKS.map((t) => (
                <button key={t} onClick={() => setTrack(t)}
                  className={`py-2 text-xs font-body tracking-widest uppercase rounded-sm transition-colors ${track === t ? "bg-[#3585AF] text-white" : "text-[#8E9299] hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/mindcast-live/facilitate/${week}?a=${track}`)}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#3585AF] text-white font-display text-lg tracking-[0.2em] rounded-md hover:bg-[#3585AF]/80 transition-colors">
          <Clapperboard size={18} /> OPEN WEEK {week} · {track.toUpperCase()} DECK <ArrowRight size={16} />
        </button>

        <p className="text-[11px] font-body text-[#8E9299] text-center">
          The deck shows the join code + welcome wall, plays the video with captions and the two reflective questions, and runs the live activity + whiteboard.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <button onClick={() => navigate("/admin/kiosk")}
          className="flex flex-col items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/20 transition-colors text-left">
          <Nfc size={16} className="text-[#3585AF]" />
          <span className="text-sm font-body text-[#E2E8F0]">Check-in kiosk</span>
          <span className="text-[11px] font-body text-[#8E9299]">Staff NFC bracelet scan mode for the door.</span>
        </button>
        <button onClick={() => navigate("/mindcast-live/library")}
          className="flex flex-col items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/20 transition-colors text-left">
          <BookOpen size={16} className="text-[#3585AF]" />
          <span className="text-sm font-body text-[#E2E8F0]">52-week coursebook</span>
          <span className="text-[11px] font-body text-[#8E9299]">Browse every week and open any deck.</span>
        </button>
        <button onClick={() => navigate("/mindcast-live/coursebook")}
          className="flex flex-col items-start gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/20 transition-colors text-left">
          <Printer size={16} className="text-[#3585AF]" />
          <span className="text-sm font-body text-[#E2E8F0]">Print run sheet</span>
          <span className="text-[11px] font-body text-[#8E9299]">Paper copy of the session framework.</span>
        </button>
      </div>
    </div>
  );
};

export default FacilitateTab;
