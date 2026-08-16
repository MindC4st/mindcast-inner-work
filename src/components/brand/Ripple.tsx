// The Mindcast signature device: a filled point, then arcs expanding and
// fading. One small thing, then its consequences. Replaces the retired
// signal-bar motif everywhere SVG can render (email uses the marker variant).
//
// Inherits `currentColor` so it sits on any surface without new tokens.
// Animation is opt-in (`animate`) and disabled for prefers-reduced-motion via
// the global reduced-motion rule in index.css.

type RippleProps = {
  /** Pixel size of the square viewBox. */
  size?: number;
  /** Play the expanding-arc animation (welcome walls, arrivals). */
  animate?: boolean;
  className?: string;
  "aria-hidden"?: boolean;
};

const ARCS = [10, 17, 24];

const Ripple = ({ size = 32, animate = false, className, ...rest }: RippleProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    aria-hidden={rest["aria-hidden"] ?? true}
  >
    <circle cx="32" cy="32" r="5" fill="currentColor" />
    {ARCS.map((r, i) => (
      <circle
        key={r}
        cx="32"
        cy="32"
        r={r}
        stroke="currentColor"
        strokeWidth={2.5 - i * 0.5}
        opacity={0.55 - i * 0.18}
        style={
          animate
            ? {
                transformOrigin: "center",
                animation: `mc-ripple 2.4s ease-out ${i * 0.35}s infinite`,
              }
            : undefined
        }
      />
    ))}
  </svg>
);

export default Ripple;
