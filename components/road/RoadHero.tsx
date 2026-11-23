"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/data/site";
import { STOPS, activeStop, stopProgress } from "@/lib/stops";

const World = dynamic(() => import("./World"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function RoadHero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(-1);
  const [pct, setPct] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
      progress.current = p;
      setPct(p);
      setActive(activeStop(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /** Drive to a stop by scrolling to its spot in the drive. */
  const goTo = useCallback(
    (i: number) => {
      const el = section.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const p = i < 0 ? 0 : stopProgress(i);
      const y = top + p * total;
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 });
      else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce]
  );

  const stop = active >= 0 ? STOPS[active] : null;
  const atStart = pct < 0.035;

  return (
    <section ref={section} className="drive" aria-label="Intro: a drive through how I work">
      <div className="drive__sticky">
        <div className="drive__world">
          <SceneBoundary>
            <World progress={progress} active={active} onPick={goTo} />
          </SceneBoundary>
        </div>

        <motion.div
          className="veil"
          aria-hidden
          animate={{ opacity: atStart ? 1 : 0 }}
          transition={{ duration: 0.6, ease }}
        />

        {/* Intro copy, visible until the drive starts */}
        <motion.div
          className="intro container"
          animate={{ opacity: atStart ? 1 : 0, y: atStart ? 0 : -24 }}
          transition={{ duration: 0.5, ease }}
          style={{ pointerEvents: atStart ? "auto" : "none" }}
        >
          <motion.h1
            className="intro__name"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.6 }}
          >
            Bhuvan Thota
          </motion.h1>
          <motion.p
            className="intro__lede"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.8 }}
          >
            {site.headline}
          </motion.p>
          <motion.p
            className="intro__open"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 1.95 }}
          >
            Open to internships in {site.openTo.slice(0, -1).join(", ")} and {site.openTo[site.openTo.length - 1]}.
          </motion.p>
          <motion.div
            className="intro__actions"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 2.1 }}
          >
            <button className="btn btn--go" onClick={() => goTo(0)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
              </svg>
              Start the drive
            </button>
            <a href={site.resumeUrl} className="btn btn--ghost" target="_blank" rel="noreferrer">
              Resume (PDF)
            </a>
          </motion.div>
        </motion.div>

        {/* The panel for the stop the car is parked at */}
        <AnimatePresence mode="wait">
          {stop && (
            <motion.aside
              key={stop.id}
              className="panel"
              style={{ ["--stop" as string]: stop.color, ["--stop-ink" as string]: stop.ink }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98, filter: "blur(4px)" }}
              transition={{ duration: 0.55, ease }}
              aria-live="polite"
            >
              <p className="panel__stage">
                <span className="panel__dot" aria-hidden />
                {stop.name}
                <span className="panel__count">
                  {active + 1} / {STOPS.length}
                </span>
              </p>
              <h2 className="panel__title">{stop.title}</h2>
              <ul className="panel__lines">
                {stop.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              <a className="panel__link" href={stop.link.href}>
                {stop.link.label}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Road map / progress HUD */}
        <nav className="hud" aria-label="Stops on the drive">
          <button
            className="hud__step"
            onClick={() => goTo(Math.max(-1, active - 1))}
            aria-label="Previous stop"
            disabled={active < 0}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="hud__track">
            <div className="hud__fill" style={{ transform: `scaleX(${pct})` }} />
            {STOPS.map((s, i) => (
              <button
                key={s.id}
                className={`hud__stop ${active === i ? "is-on" : ""} ${active > i ? "is-done" : ""}`}
                style={{ left: `${stopProgress(i) * 100}%`, ["--stop" as string]: s.color }}
                onClick={() => goTo(i)}
                aria-current={active === i ? "step" : undefined}
              >
                <span className="hud__pin" aria-hidden />
                <span className="hud__label">{s.name}</span>
              </button>
            ))}
          </div>
          <button
            className="hud__step"
            onClick={() => (active >= STOPS.length - 1 ? document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) : goTo(active + 1))}
            aria-label={active >= STOPS.length - 1 ? "Continue to the full story" : "Next stop"}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </nav>

        <p className={`hint ${atStart ? "" : "is-hidden"}`} aria-hidden>
          <span className="only-fine">Scroll or use the arrow keys to drive. Click a building to jump to it.</span>
          <span className="only-coarse">Swipe up to drive</span>
        </p>

        <a className="skip" href="#about">
          Skip the drive
        </a>
      </div>
    </section>
  );
}
