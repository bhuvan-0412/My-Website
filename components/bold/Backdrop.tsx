"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Tone = "ink" | "paper" | "tangerine";

const toneOf = (el: Element): Tone | null => {
  const c = el.className.toString();
  if (c.includes("sec--paper")) return "paper";
  if (c.includes("sec--tangerine")) return "tangerine";
  if (c.includes("sec--ink") || el.classList.contains("foot")) return "ink";
  return null;
};

/**
 * The page colour lives on one fixed layer behind everything, so the blurred 3D
 * icons can float behind the content on every section. When the section in the
 * middle of the screen changes tone, the new colour opens as a growing circle.
 */
export default function Backdrop() {
  const path = usePathname();
  const [base, setBase] = useState<Tone>("ink");
  const [next, setNext] = useState<Tone | null>(null);
  const current = useRef<Tone>("ink");
  const timer = useRef(0);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".sec, .foot, .page-hero, .hero"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const t = toneOf(e.target);
          if (!t || t === current.current) return;
          current.current = t;
          window.clearTimeout(timer.current);
          setNext(t);
          timer.current = window.setTimeout(() => {
            setBase(t);
            setNext(null);
          }, 900);
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, [path]);

  return (
    <div className={`backdrop backdrop--${base}`} aria-hidden>
      {next && <div key={next} className={`backdrop__next backdrop--${next}`} />}
    </div>
  );
}
