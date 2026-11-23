"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { scene } from "./formation";

const ease = [0.76, 0, 0.24, 1] as const;
const easeOut = [0.16, 1, 0.3, 1] as const;

/** Display lines that rise out of a mask, one after another. */
export function LineReveal({
  lines,
  className,
  delay = 0,
  as: Tag = "h1",
  onView = false,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p";
  onView?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const go = !onView || inView;
  return (
    <Tag ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="mask">
          <motion.span
            className="mask__in"
            initial={reduce ? false : { y: "105%" }}
            animate={go ? { y: "0%" } : undefined}
            transition={{ duration: 1.05, ease, delay: delay + i * 0.09 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Splits fast-scrolling display type into red/cyan ghosts, like a glitchy print. */
export function Chroma({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const s = useSpring(v, { stiffness: 220, damping: 30 });
  const off = useTransform(s, [-2500, 0, 2500], [-7, 0, 7]);
  const shadow = useTransform(off, (o) => (Math.abs(o) < 0.3 ? "none" : `${o}px 0 0 rgba(255,60,90,0.75), ${-o}px 0 0 rgba(40,220,255,0.75)`));
  return (
    <motion.div className={className} style={{ textShadow: shadow }}>
      {children}
    </motion.div>
  );
}

/** A statement whose words light up one by one as you scroll through it. */
export function ScrollWords({ text, className, accent = [] }: { text: string; className?: string; accent?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} hot={accent.includes(w.replace(/[^\w]/g, ""))}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  hot,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  hot: boolean;
}) {
  const o = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity: o }} className={hot ? "hot" : undefined}>
        {children}
      </motion.span>{" "}
    </>
  );
}

/** An endless, tilted ticker band. */
export function Ticker({ items, tone = "tangerine", tilt = -2.5 }: { items: string[]; tone?: "tangerine" | "mint" | "ink"; tilt?: number }) {
  const row = [...items, ...items];
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const boost = useSpring(useTransform(v, [-3000, 0, 3000], [-6, 0, 6], { clamp: false }), { damping: 40, stiffness: 300 });
  const skew = useTransform(boost, [-6, 0, 6], [6, 0, -6]);
  const dir = useRef(1);
  const hover = useRef(false);

  // Drifts left forever; scrolling speeds it up, and scrolling up reverses it.
  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < -0.05) dir.current = -1;
    else if (b > 0.05) dir.current = 1;
    const speed = hover.current ? 0.25 : 1;
    let next = x.get() - dir.current * (2.2 + Math.abs(b) * 3) * speed * (delta / 1000) * 1.2;
    // The track holds the items twice, so wrap at half its width (expressed in %).
    if (next <= -50) next += 50;
    if (next > 0) next -= 50;
    x.set(next);
  });
  const tx = useTransform(x, (p) => `${p}%`);

  return (
    <div
      className={`ticker ticker--${tone}`}
      style={{ rotate: `${tilt}deg` }}
      aria-label={items.join(". ")}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
    >
      <motion.div className="ticker__track" aria-hidden style={{ x: tx, skewX: skew }}>
        {row.map((t, i) => (
          <span key={i}>
            {t}
            <i className="ticker__dot" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * A section whose background grows out of a circle as it scrolls into view,
 * swapping the page colour the way a stage light opens.
 */
export function CircleSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Kept for compatibility; the colour change now happens on the fixed backdrop. */
  under?: "ink" | "paper" | "tangerine" | "mint";
}) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}

/** Counts up to a number when it comes into view. */
export function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: easeOut, onUpdate: (x) => setV(x) });
    return () => c.stop();
  }, [inView, to]);
  const shown = Number.isInteger(to) ? Math.round(v).toLocaleString() : v.toFixed(1);
  return (
    <span ref={ref}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/** The rotating circular "scroll" badge. */
export function ScrollBadge({ href = "#next" }: { href?: string }) {
  return (
    <a href={href} className="badge" aria-label="Scroll down">
      <svg viewBox="0 0 120 120" className="badge__ring" aria-hidden>
        <defs>
          <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <text>
          <textPath href="#badge-circle">SCROLL · KEEP · GOING · SCROLL · KEEP · GOING · </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 5v14M6 13l6 6 6-6" />
      </svg>
    </a>
  );
}

/** Fades and lifts children into view (used for body copy and cards). */
export function Rise({ children, className, delay = 0, y = 40 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggers its direct children into view. */
export function Stagger({ children, className, gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {Children.map(children, (c, i) =>
        reduce ? (
          c
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: easeOut, delay: i * gap }}
          >
            {c}
          </motion.div>
        )
      )}
    </div>
  );
}

/** While this block is on screen, the floating artifacts line up into a roadmap. */
export function RoadmapZone({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Ramp in, hold, ramp out.
    scene.formation = p < 0.25 ? p / 0.25 : p > 0.75 ? Math.max(0, (1 - p) / 0.25) : 1;
  });
  useEffect(() => () => void (scene.formation = 0), []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
