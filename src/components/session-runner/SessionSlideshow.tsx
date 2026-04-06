import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize, Minimize, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import WelcomeSlide from "./slides/WelcomeSlide";
import WhatItIsSlide from "./slides/WhatItIsSlide";
import FourStepsSlide from "./slides/FourStepsSlide";
import GroupExpectationsSlide from "./slides/GroupExpectationsSlide";
import PresenceSlide from "./slides/PresenceSlide";
import PortalSlide from "./slides/PortalSlide";
import ThisWeeksListenSlide from "./slides/ThisWeeksListenSlide";
import BookmarkQuestionsSlide from "./slides/BookmarkQuestionsSlide";
import BeforeWeMeetSlide from "./slides/BeforeWeMeetSlide";
import IcebreakerSlide from "./slides/IcebreakerSlide";
import DiscussionSlide from "./slides/DiscussionSlide";
import LiveResponsesSlide from "./slides/LiveResponsesSlide";
import ClosingSlide from "./slides/ClosingSlide";

const SLIDES = [
  { id: "welcome", component: WelcomeSlide },
  { id: "what-it-is", component: WhatItIsSlide },
  { id: "four-steps", component: FourStepsSlide },
  { id: "expectations", component: GroupExpectationsSlide },
  { id: "presence", component: PresenceSlide },
  { id: "portal", component: PortalSlide },
  { id: "this-weeks-listen", component: ThisWeeksListenSlide },
  { id: "bookmark-questions", component: BookmarkQuestionsSlide },
  { id: "icebreaker", component: IcebreakerSlide },
  { id: "discussion", component: DiscussionSlide },
  { id: "live-responses", component: LiveResponsesSlide },
  { id: "before-we-meet", component: BeforeWeMeetSlide },
  { id: "closing", component: ClosingSlide },
];

const SessionSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, SLIDES.length - 1)), []);
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [goNext, goPrev, toggleFullscreen]);

  const SlideComponent = SLIDES[current].component;

  return (
    <div ref={containerRef} className="relative w-full bg-[hsl(var(--navy))] overflow-hidden" style={{ aspectRatio: isFullscreen ? undefined : "16/9", height: isFullscreen ? "100vh" : undefined }}>
      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
        >
          <SlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-t from-[hsl(var(--navy))] to-transparent">
        {/* Prev / Next */}
        <div className="flex items-center gap-3">
          <button onClick={goPrev} disabled={current === 0} className="p-2 rounded-lg bg-[hsl(var(--ivory))]/10 text-[hsl(var(--ivory))] disabled:opacity-20 hover:bg-[hsl(var(--ivory))]/20 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goNext} disabled={current === SLIDES.length - 1} className="p-2 rounded-lg bg-[hsl(var(--ivory))]/10 text-[hsl(var(--ivory))] disabled:opacity-20 hover:bg-[hsl(var(--ivory))]/20 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-[hsl(var(--bronze))] w-5" : "bg-[hsl(var(--ivory))]/20 hover:bg-[hsl(var(--ivory))]/40"}`}
            />
          ))}
        </div>

        {/* Fullscreen + slide count */}
        <div className="flex items-center gap-3">
          <span className="text-[hsl(var(--ivory))]/40 text-xs font-body tracking-wider">
            {current + 1} / {SLIDES.length}
          </span>
          <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-[hsl(var(--ivory))]/10 text-[hsl(var(--ivory))] hover:bg-[hsl(var(--ivory))]/20 transition-colors">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSlideshow;
