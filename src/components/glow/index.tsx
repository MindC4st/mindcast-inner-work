// Motion primitives for the ivory marketing pages. All colour flows through
// tokens; all motion is transform/opacity and fully collapses under
// prefers-reduced-motion. (Formerly the "cinematic dark canvas" module — the
// dark surface is retired; these are the pieces that earned their keep.)

import { useRef, type ReactNode, type MouseEvent, type AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

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
  className = "",
}: {
  label: string;
  title: ReactNode;
  className?: string;
}) => (
  <Reveal className={className}>
    <p className="text-[11px] font-body font-bold uppercase tracking-[0.35em] mb-4 text-primary">
      {label}
    </p>
    <h2 className="font-display leading-[0.95] tracking-tight text-[44px] sm:text-6xl md:text-7xl text-foreground">
      {title}
    </h2>
  </Reveal>
);

/* ── CtaButton — magnetic CTA (formerly GlowButton, re-grounded) ────────── */

type CtaButtonProps = {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "aria-label">;

export const CtaButton = ({ to, href, children, variant = "solid", className = "", ...rest }: CtaButtonProps) => {
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
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
