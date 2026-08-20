// Cinematic primitives for the dark marketing canvas (homepage only — every
// other surface is ivory-first). All colour flows through tokens; all motion
// is transform/opacity and fully collapses under prefers-reduced-motion.

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
  type AnchorHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useSpring, useInView } from "framer-motion";

/* ── Reveal — scroll-in wrapper ─────────────────────────────────────────── */

export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ── SectionHeading — micro-label + Bebas display ───────────────────────── */

export const SectionHeading = ({
  label,
  title,
  dark = false,
  className = "",
}: {
  label: string;
  title: ReactNode;
  dark?: boolean;
  className?: string;
}) => (
  <Reveal className={className}>
    <p
      className={`text-[11px] font-body font-bold uppercase tracking-[0.35em] mb-4 ${
        dark ? "text-glow" : "text-primary"
      }`}
    >
      {label}
    </p>
    <h2
      className={`font-display leading-[0.95] tracking-tight text-[44px] sm:text-6xl md:text-7xl ${
        dark ? "text-cream" : "text-foreground"
      }`}
    >
      {title}
    </h2>
  </Reveal>
);

/* ── GlassCard ──────────────────────────────────────────────────────────── */

export const GlassCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`glass-panel rounded-lg ${className}`}>{children}</div>;

/* ── GlowButton — magnetic CTA ──────────────────────────────────────────── */

type GlowButtonProps = {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "aria-label">;

export const GlowButton = ({ to, href, children, variant = "solid", className = "", ...rest }: GlowButtonProps) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * 8;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  const styles =
    variant === "solid"
      ? "bg-primary text-primary-foreground hover:bg-[hsl(var(--glow))] hover:text-surface-0"
      : "border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground";

  const inner = (
    <span
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-display tracking-[0.2em] text-sm px-9 py-4 transition-[background-color,color,border-color] duration-300 will-change-transform ${styles} ${className}`}
      style={{ transition: reduce ? undefined : "transform 0.25s cubic-bezier(0.22,1,0.36,1), background-color 0.3s, color 0.3s, border-color 0.3s" }}
    >
      {children}
    </span>
  );

  const wrapProps = {
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    className: "inline-block",
    ...rest,
  };

  if (to) return <Link to={to} {...wrapProps}>{inner}</Link>;
  return <a href={href} {...wrapProps}>{inner}</a>;
};

/* ── StatCounter — animated numerals ────────────────────────────────────── */

export const StatCounter = ({
  value,
  suffix = "",
  label,
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, duration]);

  return (
    <div className="text-center">
      <span ref={ref} className="font-display text-6xl md:text-7xl text-foreground leading-none">
        {reduce ? value : shown}
        <span className="text-glow">{suffix}</span>
      </span>
      <p className="font-body text-xs tracking-[0.25em] uppercase text-foreground/60 mt-2">{label}</p>
    </div>
  );
};

/* ── ScrollProgress — sticky top indicator ──────────────────────────────── */

export const ScrollProgress = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-[hsl(var(--blue))]"
      style={{ scaleX }}
    />
  );
};

/* ── Marquee — slow connective ribbon ───────────────────────────────────── */

export const Marquee = ({ items, className = "" }: { items: string[]; className?: string }) => {
  const reduce = useReducedMotion();
  const row = (key: string, hidden = false) => (
    <div key={key} aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center font-display tracking-[0.3em] text-foreground/25 text-xl px-8 whitespace-nowrap">
          {it}
          <span className="ml-16 text-glow/40">●</span>
        </span>
      ))}
    </div>
  );
  if (reduce) {
    return <div className={`overflow-hidden flex ${className}`}>{row("static")}</div>;
  }
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee">
        {row("a")}
        {row("b", true)}
      </div>
    </div>
  );
};
