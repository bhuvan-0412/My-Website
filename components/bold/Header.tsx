"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/data/site";
import { PAGES } from "./pages";


const ease = [0.76, 0, 0.24, 1] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="hdr">
        <Link href="/" className="hdr__logo" aria-label="Bhuvan Thota, home">
          Bhuvan Thota<span>.</span>
        </Link>
        {/* Desktop: every page is always visible, with the current one marked. */}
        <nav className="hdr__nav" aria-label="Pages">
          {PAGES.map((p) => {
            const here = p.href === "/" ? path === "/" : path.startsWith(p.href);
            return (
              <Link key={p.href} href={p.href} className={`hdr__link ${here ? "is-here" : ""}`} aria-current={here ? "page" : undefined}>
                {here && <motion.span layoutId="nav-dot" className="hdr__dot" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                <span>{p.label}</span>
              </Link>
            );
          })}
        </nav>
        <button className="hdr__menu" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-menu">
          <span className="hdr__menu-label">{open ? "Close" : "Menu"}</span>
          <span className={`hdr__burger ${open ? "is-open" : ""}`} aria-hidden>
            <i />
            <i />
          </span>
        </button>
        <a className="hdr__hire" href={`mailto:${site.email}`}>
          <span>Hire me</span>
        </a>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: "inset(0 0 100% 0 round 28px)" }}
            animate={{ clipPath: "inset(0 0 0% 0 round 28px)" }}
            exit={{ clipPath: "inset(0 0 100% 0 round 28px)" }}
            transition={{ duration: 0.7, ease }}
          >
            <nav className="menu__links" aria-label="Pages">
              {PAGES.map((p, i) => (
                <div key={p.href} className="menu__mask">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.7, ease, delay: 0.12 + i * 0.05 }}
                  >
                    <Link href={p.href} className={`menu__link ${path === p.href ? "is-here" : ""}`}>
                      <span className="menu__no">0{i + 1}</span>
                      {p.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              className="menu__foot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.45 }}
            >
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <div className="menu__btns">
                {site.socials.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="pill pill--ghost">
                    {s.label}
                  </a>
                ))}
                <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="pill pill--ink">
                  Resume (PDF)
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
