"use client";

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { projects, site } from "@/data/site";

const Board3D = dynamic(() => import("./Board3D"), { ssr: false });

/** If WebGL is unavailable the hero keeps its flat board ground instead of crashing. */
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

export default function Hero() {
  const [hovered, setHovered] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const active = projects.find((p) => p.id === hovered);

  const open = (id: string) => {
    window.location.hash = `p-${id}`;
  };

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1, ease, delay },
        };

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__stage">
        <SceneBoundary>
          <Board3D hovered={hovered} setHovered={setHovered} onSelect={open} />
        </SceneBoundary>
      </div>

      <div className="container hero__layout">
        <div className="hero__copy">
          <motion.h1 className="hero__name" {...rise(0.35)}>
            Bhuvan
            <br />
            Thota
          </motion.h1>
          <motion.p className="hero__lede" {...rise(0.5)}>
            {site.headline}
          </motion.p>
          <motion.p className="hero__open" {...rise(0.6)}>
            Looking for internships in{" "}
            {site.openTo.map((r, i) => (
              <span key={r}>
                <strong>{r}</strong>
                {i < site.openTo.length - 2 ? ", " : i === site.openTo.length - 2 ? " and " : "."}
              </span>
            ))}
          </motion.p>
          <motion.div className="hero__actions" {...rise(0.7)}>
            <a href="#work" className="btn btn--gold">
              Explore the board
            </a>
            <a href={site.resumeUrl} className="btn" target="_blank" rel="noreferrer">
              Resume (PDF)
            </a>
          </motion.div>
        </div>

        <div className="probe" aria-live="polite">
          {active ? (
            <>
              <p className="probe__ref">{active.ref} · probing</p>
              <p className="probe__title">{active.title}</p>
              <p className="probe__text">{active.badge ?? active.flow.join(" → ")}</p>
              <p className="probe__cta">Click to open</p>
            </>
          ) : hovered === "core" ? (
            <>
              <p className="probe__ref">U0 · core</p>
              <p className="probe__title">Every trace leads here</p>
              <p className="probe__text">AI engineering and product thinking, on one board.</p>
            </>
          ) : (
            <>
              <p className="probe__ref">8 chips · 1 core</p>
              <p className="probe__text probe__hint">
                <span className="only-fine">Hover a chip to probe it, drag to tilt the board, click to open a project.</span>
                <span className="only-coarse">Tap a chip to open that project.</span>
              </p>
            </>
          )}
        </div>
      </div>

      <nav className="sr-only-focusable" aria-label="Projects on the board">
        {projects.map((p) => (
          <a key={p.id} href={`#p-${p.id}`}>
            {p.ref} {p.title}
          </a>
        ))}
      </nav>
    </section>
  );
}
