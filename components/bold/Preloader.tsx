"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";

const ease = [0.76, 0, 0.24, 1] as const;

/** A short count-up intro, shown once per browser session on the first page load. */
export default function Preloader() {
  const [show, setShow] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("bt-intro") === "1";
      sessionStorage.setItem("bt-intro", "1");
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShow(true);
    document.documentElement.style.overflow = "hidden";
    const c = animate(0, 100, {
      duration: 1.5,
      ease: [0.6, 0, 0.2, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => {
        window.setTimeout(() => {
          setShow(false);
          document.documentElement.style.overflow = "";
        }, 180);
      },
    });
    // Never let the intro block the page, even if animation frames are paused.
    const safety = window.setTimeout(() => {
      setShow(false);
      document.documentElement.style.overflow = "";
    }, 3200);
    return () => {
      c.stop();
      window.clearTimeout(safety);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pre"
          aria-hidden
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="pre__row">
            <span className="pre__name">Bhuvan Thota</span>
            <span className="pre__role">AI · Product · Software</span>
          </div>
          <p className="pre__n">
            {n}
            <span>%</span>
          </p>
          <div className="pre__bar">
            <span style={{ transform: `scaleX(${n / 100})` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
