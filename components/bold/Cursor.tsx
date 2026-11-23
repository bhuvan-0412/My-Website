"use client";

import { useEffect, useRef, useState } from "react";

const MAGNETIC = ".pill, .hdr__logo, .hdr__menu, .hdr__hire, .chip, .area__go, .faq__icon, [data-magnetic]";

/**
 * A ring that trails the pointer (blend mode so it reads on every colour),
 * grows over links, shows a label over [data-cursor] elements,
 * and pulls magnetic buttons towards the pointer. Mouse and trackpad only.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setOn(true);
    document.documentElement.classList.add("has-cursor");

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let rx = x;
    let ry = y;
    let scale = 1;
    let target = 1;
    let raf = 0;
    let magnet: HTMLElement | null = null;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement | null;
      const labelled = el?.closest<HTMLElement>("[data-cursor]");
      const link = el?.closest("a, button, [role=button], input, label");
      target = labelled ? 3.2 : link ? 1.9 : 1;
      setLabel(labelled?.dataset.cursor ?? "");

      const m = el?.closest<HTMLElement>(MAGNETIC) ?? null;
      if (magnet && magnet !== m) magnet.style.translate = "";
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = (x - (r.left + r.width / 2)) * 0.28;
        const dy = (y - (r.top + r.height / 2)) * 0.38;
        m.style.translate = `${dx}px ${dy}px`;
      }
    };
    const leave = () => {
      target = 0;
      if (magnet) magnet.style.translate = "";
    };
    const enter = () => (target = 1);
    const down = () => (target *= 0.8);
    const up = () => (target /= 0.8);

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      scale += (target - scale) * 0.18;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!on) return null;
  return (
    <>
      <div ref={ring} className={`cursor ${label ? "has-label" : ""}`} aria-hidden>
        <span>{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
