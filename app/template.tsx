"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { scene } from "@/components/bold/formation";

const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Runs on every page navigation: a tangerine curtain wipes off the screen,
 * the floating artifacts burst outwards, and the new page rises in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    scene.burst = 1;
    scene.formation = 0;
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, []);

  if (reduce) return <>{children}</>;

  return (
    <>
      <motion.div
        className="curtain"
        aria-hidden
        initial={{ clipPath: "inset(0 0 0 0)" }}
        animate={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 0.9, ease, delay: 0.05 }}
      >
        <motion.span
          className="curtain__mark"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease }}
        >
          BT.
        </motion.span>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.25 }}>
        {children}
      </motion.div>
    </>
  );
}
