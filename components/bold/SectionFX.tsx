"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Section transitions, driven straight from scroll position:
 *  - Colour morph: a fixed backdrop melts between ink, paper and tangerine
 *    to match whichever section is in the middle of the screen.
 *  - Circle reveal: each slide opens out of a circle that grows from the
 *    bottom of the screen as it scrolls in.
 */
const TONES: Record<string, [number, number, number]> = {
  ink: [13, 19, 33],
  paper: [226, 230, 236],
  tangerine: [255, 107, 44],
};

const toneOf = (el: Element) =>
  el.classList.contains("sec--tangerine") ? TONES.tangerine : el.classList.contains("sec--paper") ? TONES.paper : TONES.ink;

const smooth = (x: number) => x * x * (3 - 2 * x);

export default function SectionFX() {
  const back = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let secs: HTMLElement[] = [];
    let reveal: HTMLElement[] = [];

    const collect = () => {
      secs = Array.from(document.querySelectorAll<HTMLElement>("main .hero, main .page-hero, main .sec, main .nextpage, .foot"));
      // The first slide on a page, the pinned work gallery and anything already on screen open normally.
      reveal = Array.from(document.querySelectorAll<HTMLElement>("main .sec:not(.work-sec)")).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top > window.innerHeight * 0.6;
      });
    };

    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      const mid = vh * 0.5;

      // Colour morph: blend the two sections either side of the middle of the screen.
      if (back.current && secs.length) {
        const centres = secs.map((el) => {
          const r = el.getBoundingClientRect();
          return { c: r.top + r.height / 2, top: r.top, bottom: r.bottom, el };
        });
        let a = centres[0];
        let b = centres[0];
        for (let i = 0; i < centres.length; i++) {
          if (centres[i].c <= mid) a = centres[i];
          if (centres[i].c > mid) {
            b = centres[i];
            break;
          }
          b = centres[i];
        }
        let f = 0;
        if (a !== b) {
          // Morph while the boundary between the two crosses the middle third of the screen.
          const edge = (a.bottom + b.top) / 2;
          f = smooth(Math.min(1, Math.max(0, (mid + vh * 0.18 - edge) / (vh * 0.36))));
        }
        const ca = toneOf(a.el);
        const cb = toneOf(b.el);
        const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * f));
        back.current.style.backgroundColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
      }

      // Circle reveal.
      if (!reduce) {
        for (const el of reveal) {
          const r = el.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (vh * 0.94 - r.top) / (vh * 0.66)));
          if (p >= 1) {
            el.style.clipPath = "none";
            continue;
          }
          // Grow from the bottom-centre of the screen, in the section's own coordinates.
          const cy = Math.min(r.height, vh - r.top);
          const need = Math.hypot(r.width / 2, cy) * 1.04;
          const rad = p <= 0 ? 0 : need * (1 - Math.pow(1 - p, 2.2));
          el.style.clipPath = `circle(${rad.toFixed(1)}px at 50% ${cy.toFixed(1)}px)`;
        }
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Wait a beat so the new page's sections are in the DOM.
    const start = window.setTimeout(() => {
      collect();
      tick();
    }, 60);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reveal.forEach((el) => {
        el.style.clipPath = "";
      });
    };
  }, [path]);

  return <div ref={back} className="morph" aria-hidden />;
}
