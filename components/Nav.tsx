"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

const links = [
  { href: "#work", label: "Work" },
  { href: "#datasheet", label: "Datasheet" },
  { href: "#experience", label: "Experience" },
  { href: "#pm-log", label: "PM log" },
  { href: "#reels", label: "Reels" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled || open ? "nav--solid" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__logo" aria-label="Bhuvan Thota, back to top">
          <span className="nav__chip">{site.initials}</span>
        </a>
        <nav className={`nav__links ${open ? "is-open" : ""}`} aria-label="Sections">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href={site.resumeUrl} target="_blank" rel="noreferrer" className="nav__resume">
            Resume
          </a>
        </nav>
        <button
          className="nav__menu"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>
    </header>
  );
}
