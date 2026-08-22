import { SIGNAL_BAR } from "@/lib/signalBar";

// The canonical signal bar — the brand's single signature device (MC-BRD-001
// §4). One component, sized to context:
//   worksheet — 14–16px tall, full content width, beneath the wordmark
//   slide     — theatre scale: ≥48px tall, ~40% of slide width; must read
//               from the back row (test at 10% zoom — if it disappears, it
//               is too small)
// Never recoloured, never inverted to gold, never animated in printed or
// legal contexts. The mic lives inside the wordmark's "i"; this is the only
// standalone mark.

type SignalBarProps = {
  size?: "worksheet" | "slide";
  className?: string;
  /** Accessible label; the bar is decorative by default. */
  label?: string;
};

const SIZE_CLASS: Record<NonNullable<SignalBarProps["size"]>, string> = {
  worksheet: "h-4 w-full",
  slide: "h-12 w-[40%] min-w-[240px]",
};

const SignalBar = ({ size = "worksheet", className = "", label }: SignalBarProps) => {
  const { segmentCount, blueCount, heights, gapPx } = SIGNAL_BAR;
  // Reference geometry: unit-width segments with spec gaps, scaled by the
  // viewBox so the SVG stretches to any context without redrawing.
  const unit = 10;
  const gap = gapPx;
  const totalWidth = segmentCount * unit + (segmentCount - 1) * gap;
  const maxHeight = Math.max(...heights);

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${maxHeight}`}
      preserveAspectRatio="none"
      className={`${SIZE_CLASS[size]} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {heights.map((height, index) => (
        <rect
          key={index}
          x={index * (unit + gap)}
          y={maxHeight - height}
          width={unit}
          height={height}
          fill={index < blueCount ? "hsl(var(--blue))" : "hsl(var(--mist))"}
        />
      ))}
    </svg>
  );
};

export default SignalBar;
