"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";

const ease = [0.76, 0, 0.24, 1] as const;

/** Wipes an image open from the bottom when it scrolls into view, then lets it drift (parallax). */
export function Wipe({ children, className }: { children: ReactNode; className?: string }) {
  // Watch an unclipped wrapper: a fully clipped element never counts as visible.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-2.5%", "2.5%"]);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="wipe"
        initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
        animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        transition={{ duration: 1.1, ease }}
      >
        <motion.div
          className="wipe__in"
          style={{ y }}
          initial={{ scale: 1.18 }}
          animate={inView ? { scale: 1.05 } : undefined}
          transition={{ duration: 1.4, ease }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Tilts a card a few degrees towards the pointer. */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <div ref={ref} className={`tilt ${className ?? ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
