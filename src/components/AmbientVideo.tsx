import { useEffect, useRef, useState } from "react";

// A decorative background video that does not cost the visitor 15 MB before
// they have scrolled to it.
//
// `preload="none"` alone does nothing here: with `autoPlay` the browser has to
// fetch the file to play it, so the attribute is ignored. The only real fix is
// to withhold the `src` until the element is actually near the viewport, which
// is what this does.
//
// It also declines to autoplay at all when:
//   - the visitor asked for reduced motion, or
//   - the browser reports Save-Data / a 2g-3g connection.
// In those cases the poster frame stays, which is the whole point of a
// decorative video — it carries no information the page needs.

type Props = {
  src: string;
  poster?: string;
  className?: string;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const wantsLightweight = () => {
  const c = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!c) return false;
  return Boolean(c.saveData) || /(^|-)2g$/.test(c.effectiveType || "");
};

const AmbientVideo = ({ src, poster, className, rootMargin = "200px" }: Props) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || wantsLightweight()) return;

    const el = ref.current;
    if (!el) return;

    // No IntersectionObserver (old browser): fall back to loading it normally
    // rather than showing a video that never starts.
    if (typeof IntersectionObserver === "undefined") { setLoad(true); return; }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <video
      ref={ref}
      // Only ever set once the element is near the viewport. Until then the
      // poster is all that has been downloaded.
      src={load ? src : undefined}
      poster={poster}
      autoPlay={load}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
};

export default AmbientVideo;
